import { describe, expect, it } from "vitest";
import { decodeInputs, encodeInputs } from "@/lib/state";
import type { PlannerInputs } from "@/types";

const inputs: PlannerInputs = {
  colors: ["#5C4033", "#9CAF88"],
  weddingTypes: ["traditional-white"],
  styles: ["elegant", "minimal"],
  coordination: "different",
};

describe("state codec — v3 (dynamic colours + multi-select types)", () => {
  it("round-trips planner inputs", () => {
    expect(decodeInputs(encodeInputs(inputs))).toEqual(inputs);
  });

  it("handles a single colour", () => {
    const single = { ...inputs, colors: ["#5C4033"] };
    expect(decodeInputs(encodeInputs(single))).toEqual(single);
  });

  it("accepts up to four colours and drops any beyond that", () => {
    const four = { ...inputs, colors: ["#5C4033", "#9CAF88", "#D4AF37", "#1F3A5F"] };
    expect(decodeInputs(encodeInputs(four))).toEqual(four);
    const five = { ...inputs, colors: [...four.colors, "#7D3C98"] };
    expect(decodeInputs(encodeInputs(five))?.colors).toEqual(four.colors);
  });

  it("round-trips reshuffle counters and omits them when all are zero", () => {
    const shuffled: PlannerInputs = { ...inputs, variants: { couple: 2, guests: 1 } };
    expect(decodeURIComponent(encodeInputs(shuffled)).split("|")).toHaveLength(5);
    expect(decodeInputs(encodeInputs(shuffled))).toEqual(shuffled);
    expect(decodeURIComponent(encodeInputs({ ...inputs, variants: {} })).split("|")).toHaveLength(4);
  });

  it("treats malformed or huge counters safely", () => {
    const decoded = decodeInputs(encodeURIComponent("5C4033|white||same|x.-3.5000000"));
    expect(decoded?.variants).toEqual({ bridesmaids: 999 });
  });

  it("encodes multiple wedding types with '+' separators", () => {
    const multi = {
      ...inputs,
      weddingTypes: ["traditional", "white", "civil"] as PlannerInputs["weddingTypes"],
    };
    const encoded = encodeInputs(multi);
    expect(decodeURIComponent(encoded)).toContain("traditional+white+civil");
    expect(decodeInputs(encoded)).toEqual(multi);
  });

  it("expands 3-digit hex", () => {
    const encoded = encodeInputs({ ...inputs, colors: ["fff"] });
    expect(decodeInputs(encoded)?.colors).toEqual(["#FFFFFF"]);
  });

  it("returns null when no colour is present", () => {
    expect(decodeInputs("|white|minimal|same")).toBeNull();
    expect(decodeInputs("||white|minimal|same")).toBeNull();
  });
});

describe("state codec — legacy share links", () => {
  it("still decodes the v2 dynamic-colour format into a type array", () => {
    const v2 = "5C4033,9CAF88|traditional-white|elegant,minimal|different";
    expect(decodeInputs(v2)).toEqual({
      colors: ["#5C4033", "#9CAF88"],
      weddingTypes: ["traditional-white"],
      styles: ["elegant", "minimal"],
      coordination: "different",
    });
  });

  it("still decodes the v1 two-slot format", () => {
    const legacy = "5C4033|9CAF88|traditional-white|elegant,minimal|different";
    expect(decodeInputs(legacy)).toEqual({
      colors: ["#5C4033", "#9CAF88"],
      weddingTypes: ["traditional-white"],
      styles: ["elegant", "minimal"],
      coordination: "different",
    });
  });

  it("decodes v1 with an empty second slot", () => {
    const legacy = "fff||white|minimal|same";
    expect(decodeInputs(legacy)?.colors).toEqual(["#FFFFFF"]);
  });
});

describe("state codec — malformed payloads", () => {
  it("rejects garbage", () => {
    expect(decodeInputs("garbage")).toBeNull();
    expect(decodeInputs("zzz|nope|bogus")).toBeNull();
    expect(decodeInputs("%FF%FE|bad")).toBeNull();
    expect(
      decodeInputs("5C4033|9CAF88|traditional-white|elegant,minimal|nonsense")
    ).toBeNull();
    expect(decodeInputs("5C4033,ZZZZ|white|minimal|same")).toBeNull();
  });

  it("rejects unknown wedding types inside a multi-select payload", () => {
    expect(
      decodeInputs("5C4033|white+bogus-type|minimal|same")
    ).toBeNull();
  });

  it("rejects an empty wedding type segment", () => {
    expect(decodeInputs("5C4033||minimal|same")).toBeNull();
  });
});
