import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeInputs } from "@/lib/state";
import type { PlannerInputs, SavedGuide } from "@/types";

/**
 * Regression tests for the saved page crash (iteration 02 hotfix): legacy
 * localStorage entries with `color1`/`color2` slots instead of a `colors`
 * array reached encodeInputs and threw "Cannot read properties of
 * undefined (reading 'map')".
 */

const KEY = "wp.saved-guides";

const PALETTE = {
  hero: { id: "coffee-brown", name: "Coffee Brown", hex: "#5C4033", role: "hero" },
  secondary: { id: "sage", name: "Sage", hex: "#9CAF88", role: "secondary" },
  supporting: [{ id: "dusty-rose", name: "Dusty Rose", hex: "#C9A9A6", role: "supporting" }],
  neutral: { id: "ivory", name: "Ivory", hex: "#FFFFF4", role: "neutral" },
};

function entry(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: "test-id",
    name: "Our wedding",
    savedAt: "2026-01-01T00:00:00.000Z",
    guide: {
      palette: PALETTE,
      inputs: {},
      ...overrides,
    },
    ...{},
  };
}

async function loadWith(storage: Record<string, string>) {
  vi.resetModules();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (k: string) => (k in storage ? storage[k] : null),
        setItem: (k: string, v: string) => {
          storage[k] = String(v);
        },
        removeItem: (k: string) => {
          delete storage[k];
        },
      },
    },
  });
  return import("@/lib/storage");
}

const INPUTS: PlannerInputs = {
  colors: ["#5C4033", "#9CAF88"],
  weddingTypes: ["traditional", "white"],
  styles: ["elegant"],
  coordination: "different",
};

let storage: Record<string, string>;

beforeEach(() => {
  storage = {};
});

describe("saved-guide migration", () => {
  it("reopens pre-iteration-01 entries (color1/color2 slots) without crashing", async () => {
    // This shape previously threw in encodeInputs on the saved page.
    const legacy = entry({
      inputs: {
        color1: "#5C4033",
        color2: "#9CAF88",
        weddingType: "traditional-white",
        styles: ["elegant"],
        coordination: "different",
      },
    });
    storage[KEY] = JSON.stringify([legacy]);

    const { listSavedGuides } = await loadWith(storage);
    const [guide] = listSavedGuides();

    expect(guide.inputs.colors).toEqual(["#5C4033", "#9CAF88"]);
    expect(() => encodeInputs(guide.inputs)).not.toThrow();
    expect(encodeInputs(guide.inputs)).toBe(
      encodeURIComponent("5C4033,9CAF88|traditional-white|elegant|different")
    );
  });

  it("migrates iteration-01 single weddingType entries to arrays", async () => {
    storage[KEY] = JSON.stringify([
      entry({
        inputs: {
          colors: ["5c4033"],
          weddingType: "white",
          styles: [],
          coordination: "same",
        },
      }),
    ]);

    const { listSavedGuides } = await loadWith(storage);
    const [guide] = listSavedGuides();

    expect(guide.inputs).toEqual({
      colors: ["#5C4033"],
      weddingTypes: ["white"],
      styles: [],
      coordination: "same",
    });
  });

  it("keeps current multi-select entries intact", async () => {
    const current = entry({
      inputs: {
        colors: ["#5C4033", "#9CAF88", "#D4AF37"],
        weddingTypes: ["traditional", "white"],
        styles: ["elegant", "minimal"],
        coordination: "different",
      },
    });
    storage[KEY] = JSON.stringify([current]);

    const { listSavedGuides } = await loadWith(storage);
    const [guide] = listSavedGuides();

    expect(guide.inputs.weddingTypes).toEqual(["traditional", "white"]);
    expect(guide.inputs.colors).toHaveLength(3);
  });

  it("falls back to white when every stored wedding type is unknown", async () => {
    storage[KEY] = JSON.stringify([
      entry({
        inputs: {
          colors: ["#FFFFFF"],
          weddingTypes: ["beach", "castle"],
          styles: [],
          coordination: "same",
        },
      }),
    ]);

    const { listSavedGuides } = await loadWith(storage);
    expect(listSavedGuides()[0].inputs.weddingTypes).toEqual(["white"]);
  });

  it("drops entries without any usable colour", async () => {
    storage[KEY] = JSON.stringify([
      entry({
        inputs: { color1: "nope", color2: "", weddingType: "white" },
      }),
      entry({ inputs: {} }),
    ]);

    const { listSavedGuides } = await loadWith(storage);
    expect(listSavedGuides()).toEqual([]);
  });

  it("recovers legacy entries whose stored palette is broken (regenerated on read)", async () => {
    storage[KEY] = JSON.stringify([
      entry({
        palette: { ...PALETTE, supporting: undefined },
        inputs: { colors: ["#FFFFFF"], weddingType: "white" },
      }),
      entry({ palette: undefined, inputs: { colors: ["#FFFFFF"] } }),
    ]);

    const { listSavedGuides } = await loadWith(storage);
    expect(listSavedGuides().map((g) => g.inputs.colors)).toEqual([
      ["#FFFFFF"],
      ["#FFFFFF"],
    ]);
  });

  it("treats corrupt or non-array payloads as empty but backs them up", async () => {
    storage[KEY] = "{not json";
    let mod = await loadWith(storage);
    expect(mod.listSavedGuides()).toEqual([]);
    expect(storage[mod.CORRUPT_BACKUP_KEY]).toBe("{not json");

    storage = {};
    storage[KEY] = JSON.stringify({ not: "an array" });
    mod = await loadWith(storage);
    expect(mod.listSavedGuides()).toEqual([]);
    expect(storage[mod.CORRUPT_BACKUP_KEY]).toBe(JSON.stringify({ not: "an array" }));
  });

  it("does not let a later save overwrite the corrupt backup's content", async () => {
    storage[KEY] = "{not json";
    const { saveGuide, CORRUPT_BACKUP_KEY } = await loadWith(storage);
    saveGuide("Fresh", INPUTS);
    expect(storage[CORRUPT_BACKUP_KEY]).toBe("{not json");
  });

  it("keeps working when localStorage is unavailable (SSR)", async () => {
    vi.resetModules();
    // @ts-expect-error — simulating a server render
    delete globalThis.window;
    const { listSavedGuides } = await import("@/lib/storage");
    expect(listSavedGuides()).toEqual([]);
  });

  it("stores only the inputs on save", async () => {
    const { saveGuide } = await loadWith(storage);
    saveGuide("Round trip", INPUTS);
    const [stored] = JSON.parse(storage[KEY]);
    expect(Object.keys(stored).sort()).toEqual(["id", "inputs", "name", "savedAt"]);
    expect(stored.inputs).toEqual(INPUTS);
  });

  it("survives save → read round-trips for freshly saved guides", async () => {
    const { saveGuide, listSavedGuides } = await loadWith(storage);
    saveGuide("Round trip", INPUTS);
    const [saved] = listSavedGuides() as [SavedGuide];
    expect(saved.name).toBe("Round trip");
    expect(saved.inputs.weddingTypes).toEqual(["traditional", "white"]);
    expect(() => encodeInputs(saved.inputs)).not.toThrow();
  });

  it("updates instead of duplicating when the same inputs are saved again", async () => {
    const { saveGuide, listSavedGuides } = await loadWith(storage);
    const first = saveGuide("First name", INPUTS);
    saveGuide("Other", { ...INPUTS, coordination: "same" });
    const again = saveGuide("Renamed", INPUTS);

    const list = listSavedGuides();
    expect(list).toHaveLength(2);
    expect(again.id).toBe(first.id);
    expect(list[0].name).toBe("Renamed");
  });
});
