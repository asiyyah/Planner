# Wedding Planner

> A minimal, editorial wedding styling tool that helps couples create a coordinated wedding colour, outfit, fabric and decor direction from just two colours.

**Document status:** MVP Product Requirements
**Version:** 1.0
**Product type:** Web application
**Primary market:** Nigerian weddings, with room to expand to other African wedding contexts
**Design direction:** Minimalist editorial / luxury fashion lookbook
**AI:** Not required for MVP

---

# 1. Product Overview

Wedding Planner is a lightweight digital styling assistant for couples who want a professionally coordinated wedding look but cannot afford to hire a stylist or wedding planner.

The product asks the couple for only a few inputs — primarily **two colours they like** — and uses colour-wheel relationships and curated wedding styling rules to generate:

* A harmonious wedding colour palette
* Bridesmaid colour recommendations
* Groomsmen colour recommendations
* Bride's family colour recommendations
* Groom's family colour recommendations
* Guest colour recommendations
* Outfit suggestions
* Fabric suggestions
* Wedding decor direction

The product should feel less like a traditional planning dashboard and more like a **digital wedding lookbook**.

The interface itself remains strictly **black and white**, allowing each couple's generated wedding palette to become the visual personality of their style guide.

---

# 2. Problem

Couples planning weddings often know the colours they like but don't necessarily know:

* Which colours work well together
* Which additional colours should be introduced
* How to distribute colours across the wedding party
* Whether bridesmaids and groomsmen should wear the same or different colours
* What colours should be assigned to both families
* What guests should wear
* Which fabrics or outfit styles complement the chosen aesthetic
* How the wedding colours should translate into decor

Professional stylists can solve these problems, but their services may be inaccessible to couples working with limited budgets.

Existing wedding-planning tools tend to focus on logistics such as:

* Guest lists
* Budgets
* Venues
* Vendors
* Checklists

This product focuses specifically on **visual coordination and styling**.

---

# 3. Product Vision

> **Give couples the confidence to create a beautifully coordinated wedding without needing to understand colour theory or hire a professional stylist.**

The product should make the user feel:

> "I knew the colours I liked. I just didn't know what to do with them. Now I have a complete direction."

---

# 4. Core Product Proposition

### User provides:

**Colour 1 + Colour 2**

### The system generates:

**Colour harmony → Wedding palette → Wedding party styling → Family styling → Guest styling → Fabric/outfit suggestions → Decor direction**

The user does **not** need to know:

* Primary colours
* Secondary colours
* Complementary colours
* Triadic schemes
* Analogous schemes
* Split-complementary schemes

The system handles the colour theory internally.

---

# 5. MVP Scope

The MVP should focus on one core job:

> **Turn two colours into a complete wedding visual direction.**

## In scope

* Colour selection
* Two-colour input
* Colour-wheel calculations
* Palette generation
* Wedding type selection
* Wedding style selection
* Wedding party coordination preference
* Bridesmaid recommendations
* Groomsmen recommendations
* Family recommendations
* Guest recommendations
* Outfit suggestions
* Fabric suggestions
* Basic decor suggestions
* Generated style guide
* Save/share/download style guide
* Responsive mobile and desktop experience

## Out of scope for MVP

Do not build:

* Vendor marketplace
* Wedding budget management
* Guest management
* RSVP management
* Wedding timeline
* Payment processing
* AI image generation
* AI stylist/chatbot
* Complex user accounts
* Vendor booking
* Shopping integrations
* Real-time fabric/vendor pricing

These can be considered after validating the core product.

---

# 6. Target Users

## Primary user

Couples planning their own wedding who:

* Have limited styling knowledge
* Want a coordinated wedding aesthetic
* Cannot afford a professional stylist
* Know one or two colours they like
* Need help deciding what other colours to use
* Need help coordinating different wedding groups

## Secondary users

The tool may also be useful to:

* Brides planning independently
* Grooms helping with planning
* Bridesmaids coordinating outfits
* Parents coordinating family outfits
* Wedding vendors seeking a starting visual direction

---

# 7. Core User Journey

```text
Landing Page
     ↓
Start Planning
     ↓
Choose Colour 1
     ↓
Choose Colour 2
     ↓
Choose Wedding Type
     ↓
Choose Wedding Style
     ↓
Choose Wedding Party Coordination
     ↓
Generate Style Guide
     ↓
Colour Harmony
     ↓
Wedding Palette
     ↓
Outfit & Fabric Recommendations
     ↓
Family & Guest Recommendations
     ↓
Decor Direction
     ↓
Save / Share / Download
```

---

# 8. Onboarding

The onboarding should be intentionally short.

The user should not feel like they are completing a long wedding-planning questionnaire.

## Step 1 — Choose your colours

### Heading

> Let's start with colour.

### Supporting copy

> Choose two colours you love. Don't worry about whether they match — we'll work out the harmony for you.

### Inputs

**Colour 01**

Colour picker / curated colour selection

**Colour 02**

Colour picker / curated colour selection

### Optional behaviour

Allow the user to continue with one colour if they don't have a second colour.

If only one colour is provided, the system generates an appropriate second colour using the selected colour harmony rules.

---

# 9. Step 2 — Wedding Type

Question:

> What kind of wedding are you planning?

Options:

* Traditional
* White Wedding
* Traditional + White Wedding
* Civil / Registry
* Other

The wedding type affects outfit and fabric recommendations.

---

# 10. Step 3 — Wedding Style

Question:

> How do you want your wedding to feel?

Allow one or multiple selections.

Options:

* Classic
* Elegant
* Modern
* Romantic
* Traditional
* Minimal
* Bold
* Luxury

These preferences influence styling recommendations.

---

# 11. Step 4 — Wedding Party Coordination

Question:

> How should your wedding party coordinate?

### Option 1 — Same colours

> Bridesmaids and groomsmen share the same core colours.

### Option 2 — Different but coordinated

> Each group gets its own colours while staying connected to the overall wedding palette.

Recommended default:

**Different but coordinated**

This gives the recommendation engine more flexibility while maintaining visual consistency.

---

# 12. Colour Recommendation Engine

The colour engine is the core logic of the MVP.

It does not require AI.

It should use mathematical colour relationships and curated styling rules.

## Supported colour relationships

### Complementary

Find the colour opposite the selected hue.

Formula:

```text
Complement = Hue + 180°
```

### Analogous

Use colours adjacent to the selected hue.

Example:

```text
Hue - 30°
Hue
Hue + 30°
```

### Triadic

Use three colours approximately 120° apart.

```text
Hue
Hue + 120°
Hue + 240°
```

### Split Complementary

Use the primary colour plus colours adjacent to its complement.

```text
Hue
Complement - X°
Complement + X°
```

### Monochromatic

Generate different shades/tints of the selected colour.

### Neutral balancing

Introduce neutral colours where required:

* White
* Ivory
* Cream
* Champagne
* Grey
* Black

The neutral system should be configurable rather than completely mathematical.

---

# 13. Colour System Requirements

The system should distinguish between:

* Hero colour
* Secondary colour
* Supporting colour
* Accent colour
* Neutral colour

Example:

### User input

```text
Colour 1: Coffee Brown
Colour 2: Sage
```

### Generated palette

```text
Hero: Coffee Brown
Secondary: Sage
Supporting: Champagne
Neutral: Ivory
Accent: Gold
```

The product should be able to explain the resulting palette in simple language.

Example:

> A warm, earthy palette balanced with soft neutrals and a subtle metallic accent.

The user should not need to understand colour theory.

---

# 14. Wedding Party Styling Engine

The colour engine determines the palette.

The styling engine determines how that palette is distributed.

## Bridesmaids

Recommendations should include:

* Primary colour
* Secondary colour
* Accent colour
* Outfit type
* Fabric suggestions
* Accessories
* Optional alternative styling

Example:

```text
Bridesmaids

Colour:
Champagne + Sage

Outfit:
Flowing floor-length dress

Fabric:
Satin
Silk
Chiffon

Accessories:
Gold + subtle sage
```

---

# 15. Groomsmen

Recommendations should include:

* Main colour
* Shirt/inner colour
* Accent
* Outfit type
* Fabric
* Accessories

Example:

```text
Groomsmen

Colour:
Coffee Brown + Ivory

Outfit:
Agbada / Senator

Fabric:
Damask
Brocade

Accent:
Champagne
```

---

# 16. Same-Colour Wedding Party Mode

When the user chooses:

> Same colours

The system should maintain a shared colour family across bridesmaids and groomsmen.

Example:

### Bridesmaids

Sage + Champagne

### Groomsmen

Sage + Champagne

However, the system may vary:

* Proportion
* Fabric
* Outfit
* Accent placement

so that both groups do not look identical.

---

# 17. Different-but-Coordinated Mode

When selected, each group should receive a distinct colour combination from the same generated palette.

Example:

### Bridesmaids

Champagne + Sage

### Groomsmen

Coffee Brown + Ivory

### Bride's Family

Terracotta + Champagne

### Groom's Family

Sage + Mocha

This mode should be the primary showcase of the product's styling intelligence.

---

# 18. Family Styling

Nigerian weddings commonly involve extensive family participation, so family styling should be treated as a first-class feature.

## Bride's Family

Recommendations may include:

* Primary colour
* Secondary colour
* Aso-ebi direction
* Fabric suggestions
* Outfit suggestions

## Groom's Family

Same structure.

The system should avoid assigning identical colours to every group unless the user specifically chooses a highly coordinated approach.

---

# 19. Guest Styling

Guests should receive a **colour guide**, not an exact outfit prescription.

Example:

## Guest Colour Guide

### Recommended

* Champagne
* Cream
* Sage
* Mocha
* Muted Terracotta

### Avoid

* Exact couple colours
* Overly bright colours that conflict with the palette
* Colours reserved for specific wedding-party groups

The system should distinguish between:

**Recommended**

**Optional**

**Avoid**

---

# 20. Outfit Recommendation System

Outfit recommendations should be contextual to wedding type.

## Female outfit categories

Potential options:

* Aso-oke
* Lace outfit
* George
* Ankara
* Iro and Buba
* Gown
* Floor-length dress
* Midi dress
* Skirt and blouse
* Kaftan
* Traditional formalwear

## Male outfit categories

Potential options:

* Agbada
* Senator
* Traditional kaftan
* Suit
* Tuxedo
* Formal shirt and trousers

The system should recommend appropriate categories based on:

* Wedding type
* Style
* Group
* Colour palette

---

# 21. Fabric Recommendation System

Fabric should be presented as **suggestions**, not mandatory recommendations.

## Potential fabrics

### Traditional / Nigerian

* Aso-oke
* Lace
* George
* Damask
* Brocade
* Ankara

### Contemporary / formal

* Silk
* Satin
* Chiffon
* Crepe
* Linen
* Velvet

The recommendation engine should consider:

* Wedding type
* Outfit type
* Group
* Desired style
* Colour

Example:

```text
Bridesmaids

Style:
Elegant

Outfit:
Floor-length dress

Fabric suggestions:
Satin
Silk
Chiffon
```

---

# 22. Fabric Recommendation Caveat

The system should use language such as:

> Fabric suggestions

rather than:

> Best fabric

or:

> You should wear...

The recommendations are styling guidance and should not imply that the product understands:

* Local fabric availability
* Exact fabric quality
* Climate
* Personal comfort
* Tailor expertise
* Individual budget

---

# 23. Decor Recommendation Engine

The same generated colour palette should drive decor recommendations.

The system should not create a completely separate palette for decor.

## Ceremony

Recommendations may include:

* Backdrop
* Aisle
* Floral arrangements
* Chairs
* Entrance
* Lighting

## Reception

Recommendations may include:

* Tables
* Linens
* Napkins
* Centrepieces
* Stage
* Cake
* Signage
* Dance floor
* Lighting

## Example

Palette:

```text
Coffee Brown
Sage
Champagne
Ivory
Gold
```

Decor:

```text
Base:
Ivory

Primary:
Coffee Brown

Secondary:
Sage

Accent:
Champagne / Gold

Elements:
Ivory florals
Sage foliage
Brown wood elements
Champagne/gold tableware
Warm lighting
```

---

# 24. Generated Style Guide

The main output should feel like a **digital wedding lookbook** rather than a dashboard.

## Structure

### Cover

```text
YOUR WEDDING

Coffee × Sage

A coordinated wedding style guide
```

### 01 — Colour Story

Show:

* Original colours
* Generated palette
* Colour roles
* Short explanation

### 02 — Couple

Show:

* Bride styling
* Groom styling
* Suggested colours
* Outfit/fabric direction

### 03 — Bridesmaids

Show:

* Colour
* Outfit
* Fabric
* Accessories

### 04 — Groomsmen

Show:

* Colour
* Outfit
* Fabric
* Accessories

### 05 — Bride's Family

Show:

* Colour
* Outfit
* Fabric

### 06 — Groom's Family

Show:

* Colour
* Outfit
* Fabric

### 07 — Guests

Show:

* Recommended colours
* Optional colours
* Avoid colours

### 08 — Decor

Show:

* Ceremony
* Reception
* Tablescape
* Florals
* Lighting

---

# 25. Visual Design Direction

The product should feel like:

> **Editorial luxury × modern minimalism × digital fashion lookbook**

It should NOT feel like:

* Generic SaaS
* AI dashboard
* Wedding marketplace
* Pinterest clone
* Template-heavy planning app

---

# 26. Colour System for the UI

The application's own UI should remain **strictly black and white**.

## Primary UI colours

```text
Black
#000000

White
#FFFFFF
```

Optional supporting neutral:

```text
Grey
```

used sparingly for:

* Secondary text
* Disabled states
* Subtle dividers

## Explicitly avoid

* Warm white
* Soft ivory backgrounds
* Beige
* Cream UI backgrounds
* Default brown
* Default sage
* Gold UI accents
* Gradient backgrounds

The user's generated wedding palette should provide the colour.

### Design principle

> **The interface is black and white. The wedding is colourful.**

---

# 27. Typography

Use a serif + sans-serif pairing.

## Primary display serif

Recommended:

**Instrument Serif**

Use for:

* Hero headings
* Editorial headings
* Large section titles
* Important statements
* Style-book titles

## Primary sans-serif

Recommended:

**Inter**

Use for:

* Navigation
* Body text
* Buttons
* Labels
* Forms
* Metadata
* Supporting copy

The serif provides emotion and editorial character.

The sans-serif provides clarity and usability.

---

# 28. Card Design

Cards should resemble **editorial lookbook panels**.

Avoid excessive card nesting.

## Characteristics

* White backgrounds
* Black borders
* Minimal or no shadows
* Minimal corner radius
* Strong typography
* Generous whitespace
* Large colour blocks
* Editorial grids
* Asymmetric layouts where appropriate

Example:

```text
┌─────────────────────────────────────────┐
│  01                                     │
│                                         │
│  BRIDESMAIDS                            │
│                                         │
│  CHAMPAGNE + SAGE                       │
│                                         │
│  Silk · Satin · Chiffon                 │
│                                         │
│                          VIEW →         │
└─────────────────────────────────────────┘
```

---

# 29. Colour Swatches

Colour swatches should be prominent.

They should feel similar to:

* Fabric samples
* Fashion colour boards
* Editorial palettes
* Physical material samples

Use large rectangular blocks rather than tiny colour circles wherever possible.

Each swatch should display:

* Colour name
* HEX value where appropriate
* Role in the wedding palette

---

# 30. Layout

Avoid a conventional SaaS sidebar-heavy dashboard.

Prefer:

* Full-width editorial sections
* Large typography
* Asymmetric grids
* Two-column layouts
* Large colour blocks
* Generous whitespace
* Horizontal sections
* Full-bleed recommendations

Navigation should remain minimal.

Potential navigation:

```text
Logo

Plan
Style Guide
Saved

My Wedding →
```

---

# 31. Interaction Design

Motion should be subtle.

Use:

* Fade
* Slide
* Colour reveal
* Gentle hover transitions
* Swatch expansion
* Image zoom where imagery is eventually introduced

Avoid:

* Excessive animations
* Bouncy interactions
* Heavy loading animations
* Glassmorphism
* Decorative motion that distracts from the content

---

# 32. Palette Reveal Interaction

After the user submits their colours, create a short visual transition.

Example:

```text
Colour 01
     +
Colour 02
     ↓
Finding your harmony...
     ↓
Coffee
Sage
Champagne
Ivory
Gold
     ↓
Your palette is ready.
```

This should feel like a **curated colour reveal**, not an AI loading screen.

---

# 33. Responsive Design

The product should be designed mobile-first because sharing wedding styling through WhatsApp and mobile devices is a key use case.

## Mobile

Prioritise:

* Single-column layouts
* Large swatches
* Swipeable recommendation sections
* Sticky bottom/primary CTA where appropriate
* Simple navigation
* Large touch targets

## Desktop

Use:

* Editorial two/three-column layouts
* Larger colour boards
* Asymmetric grids
* Wider style-book sections

---

# 34. Core Screens

## 1. Landing Page

Purpose:

Communicate the value proposition quickly.

Primary CTA:

> Start planning

---

## 2. Colour Selection

Inputs:

* Colour 1
* Colour 2

Supporting message:

> Don't worry about whether they match. We'll work out the harmony.

---

## 3. Wedding Type

Options:

* Traditional
* White Wedding
* Traditional + White
* Civil
* Other

---

## 4. Wedding Style

Options:

* Classic
* Elegant
* Modern
* Romantic
* Traditional
* Minimal
* Bold
* Luxury

---

## 5. Wedding Party Coordination

Options:

* Same colours
* Different but coordinated

---

## 6. Generating Screen

Minimal palette reveal animation.

---

## 7. Generated Style Guide

Sections:

* Palette
* Couple
* Bridesmaids
* Groomsmen
* Bride's Family
* Groom's Family
* Guests
* Decor

---

## 8. Saved Style Guide

Allow users to:

* Save
* Rename
* Delete
* Reopen

Authentication is optional for the MVP.

---

## 9. Share / Export

Allow:

* Share link
* Download style guide
* Eventually export as PDF

---

# 35. Recommendation Data Model

Initial recommendation data can be stored locally.

Example structure:

```ts
type Color = {
  id: string
  name: string
  hex: string
  hue: number
  saturation: number
  lightness: number
  category: ColorCategory
}

type Palette = {
  hero: Color
  secondary: Color
  supporting: Color[]
  neutral: Color
  accent?: Color
}

type StylingRecommendation = {
  group: WeddingGroup
  colors: string[]
  outfits: string[]
  fabrics: string[]
  accessories?: string[]
  notes: string
}
```

---

# 36. Suggested Wedding Groups

```ts
type WeddingGroup =
  | "couple"
  | "bridesmaids"
  | "groomsmen"
  | "bride-family"
  | "groom-family"
  | "guests"
```

---

# 37. Technology Stack

The MVP should remain deliberately lightweight.

## Frontend

**Next.js 15**

* App Router
* Server Components where appropriate
* Client Components only where interaction is required

**TypeScript**

For:

* Colour models
* Recommendation logic
* Component props
* Form data
* Type-safe configuration

**Tailwind CSS**

For:

* Layout
* Typography
* Responsive behaviour
* Borders
* Spacing
* Design tokens

**shadcn/ui**

Use selectively for functional components such as:

* Dialogs
* Selects
* Tabs
* Buttons
* Inputs
* Tooltips

Do not allow shadcn defaults to dictate the visual identity.

**Framer Motion**

Optional.

Use only for:

* Palette reveal
* Page transitions
* Swatch interactions
* Subtle hover effects

---

# 38. Backend

### MVP Phase

No backend is required for the first functional prototype.

Use:

```text
Next.js
+
Local TypeScript data
```

This allows the colour engine and recommendation system to be tested quickly.

### Later

Add:

**Supabase**

For:

* PostgreSQL
* User accounts
* Saved weddings
* Saved style guides
* Storage
* Shareable projects

---

# 39. Authentication

Not required initially.

The first version should allow:

> Start → Generate → View → Share/Download

without forcing account creation.

Authentication can be introduced when saved projects become important.

---

# 40. AI/API Strategy

### MVP

**No AI APIs.**

The product should not depend on:

* OpenAI
* Gemini
* Claude
* Image generation
* Vision APIs

The recommendation engine should be deterministic.

This keeps:

* Cost at ₦0
* Development simple
* Results predictable
* Product behaviour testable

AI may be introduced later for optional features such as:

* Inspiration image analysis
* Natural-language styling explanations
* Image generation
* Personalised styling conversations

These are explicitly outside MVP scope.

---

# 41. Colour Engine Architecture

The colour engine should be independent from the UI.

Example:

```text
lib/
  color/
    harmony.ts
    conversion.ts
    palette.ts
    contrast.ts
```

Possible functions:

```ts
generateComplementary()
generateAnalogous()
generateTriadic()
generateSplitComplementary()
generateMonochromatic()
generatePalette()
```

The output should be passed into a separate styling engine.

---

# 42. Styling Engine Architecture

```text
lib/
  styling/
    bridesmaids.ts
    groomsmen.ts
    family.ts
    guests.ts
    fabrics.ts
    outfits.ts
    decor.ts
```

The styling engine receives:

```text
Palette
+
Wedding Type
+
Wedding Style
+
Coordination Preference
```

and returns structured recommendations.

---

# 43. Example Recommendation Logic

Input:

```text
Colour 1:
Coffee Brown

Colour 2:
Sage

Wedding:
Traditional + White

Style:
Elegant

Coordination:
Different but coordinated
```

Output:

```text
Palette:
Coffee Brown
Sage
Champagne
Ivory
Gold

Bridesmaids:
Champagne
Sage accent
Satin / Silk / Chiffon
Floor-length dress

Groomsmen:
Coffee Brown
Ivory
Champagne accent
Damask / Brocade
Agbada / Senator

Bride Family:
Terracotta
Champagne
Lace / George
Aso-ebi

Groom Family:
Sage
Mocha
Damask / Brocade
Traditional formalwear

Guests:
Cream
Champagne
Sage
Mocha

Decor:
Ivory base
Coffee Brown primary
Sage greenery
Champagne / Gold accents
```

---

# 44. Data-Driven Rather Than Hard-Coded UI

Recommendations should live in data/configuration rather than directly inside React components.

This allows the recommendation library to grow without rewriting the interface.

Example:

```text
data/
  colors.ts
  harmonies.ts
  fabrics.ts
  outfits.ts
  wedding-styles.ts
  wedding-types.ts
  recommendations.ts
```

---

# 45. MVP Colour Library

Start with approximately 25–40 curated colours.

Suggested categories:

## Neutrals

* White
* Ivory
* Cream
* Champagne
* Taupe
* Beige

## Earthy

* Coffee Brown
* Mocha
* Terracotta
* Rust
* Olive
* Sage

## Jewel

* Emerald
* Burgundy
* Navy
* Plum
* Deep Teal

## Soft

* Dusty Rose
* Blush
* Lavender
* Powder Blue
* Dusty Blue

## Accents

* Gold
* Champagne Gold
* Rose Gold
* Silver

The library can expand later.

---

# 46. MVP Fabric Library

### Traditional

* Aso-oke
* Lace
* George
* Damask
* Brocade
* Ankara

### Contemporary

* Silk
* Satin
* Chiffon
* Crepe
* Linen
* Velvet

Each fabric should have metadata describing where it is most appropriate.

---

# 47. MVP Outfit Library

## Female

* Floor-length gown
* A-line dress
* Iro and Buba
* Lace outfit
* Aso-oke
* George outfit
* Skirt and blouse
* Kaftan
* Traditional formalwear

## Male

* Agbada
* Senator
* Kaftan
* Suit
* Tuxedo
* Traditional formalwear

---

# 48. MVP Decor Library

Categories:

```text
ceremony
reception
tablescape
stage
florals
lighting
cake
signage
```

Each recommendation should contain:

* Colour usage
* Material/element
* Short styling note

---

# 49. Non-Functional Requirements

## Performance

The generated style guide should feel immediate.

Since the MVP is deterministic, palette generation should happen locally without waiting for an external API.

Target:

> Palette generation under 500ms on a normal device.

## Accessibility

* WCAG-conscious contrast
* Keyboard navigation
* Visible focus states
* Semantic HTML
* Accessible colour picker
* Do not rely on colour alone to communicate information

## Responsive

Support:

* Mobile
* Tablet
* Desktop

## Browser

Target current versions of:

* Chrome
* Safari
* Edge
* Firefox

---

# 50. Success Metrics

For the initial MVP, focus on product usefulness rather than revenue.

### Primary metric

**Style Guide Completion Rate**

Percentage of users who start the process and reach the generated style guide.

### Secondary metrics

* Colour selection completion
* Percentage choosing two colours
* Wedding party coordination preference
* Style Guide shares
* Style Guide downloads
* Repeat visits
* Saved Style Guides
* Most selected colours
* Most common colour combinations
* Most selected wedding styles

---

# 51. Validation Questions

Before expanding the product, validate:

1. Do people understand the two-colour input?
2. Do users trust the generated palette?
3. Are the colour combinations aesthetically pleasing?
4. Are outfit recommendations useful?
5. Are fabric recommendations culturally appropriate?
6. Do users understand the same/different wedding-party option?
7. Is the family recommendation useful?
8. Would users actually send the guest colour guide to family?
9. Would users download/share the generated Style Guide?
10. Which part of the Style Guide do users find most valuable?

---

# 52. Future Features

Only consider these after validating the MVP.

## Phase 2 — Personalisation

* Budget preference
* Indoor/outdoor
* Day/night
* Season
* Cultural wedding type
* More detailed outfit preferences

## Phase 3 — Inspiration

Allow users to upload wedding inspiration and extract:

* Colours
* Style
* Outfit direction
* Decor direction

## Phase 4 — Visual references

Add curated imagery and eventually optional AI-generated visual references.

## Phase 5 — Planning

Potential features:

* Budget
* Guest list
* Checklist
* Timeline
* Vendor management

## Phase 6 — Marketplace

Connect recommendations to:

* Aso-oke vendors
* Tailors
* Designers
* Decorators
* Makeup artists
* Photographers
* Event centres
* Cake vendors

---

# 53. Product Principles

## 1. The user shouldn't need to know colour theory.

The system does the thinking.

## 2. Two colours should be enough to get started.

Don't overwhelm the user with decisions.

## 3. The wedding palette is the source of truth.

Outfits and decor should derive from the same palette.

## 4. Coordination does not mean everyone wears the same colour.

Different groups can have distinct colours while remaining visually connected.

## 5. Recommendations should feel useful, not prescriptive.

Use language such as "suggested", "recommended", and "could work well".

## 6. Cultural context matters.

The styling system should support Nigerian wedding realities such as:

* Aso-ebi
* Aso-oke
* Lace
* George
* Agbada
* Senator
* Family colour coordination

## 7. The interface stays neutral.

Black and white UI allows the user's wedding palette to become the hero.

## 8. Avoid unnecessary complexity.

The MVP should not require:

* AI
* Accounts
* Database
* Payments
* Complex backend

to prove the concept.

---

# 54. Final MVP Definition

The MVP is successful if a user can:

1. Open the app.
2. Choose two colours they like.
3. Select their wedding type.
4. Select their preferred wedding style.
5. Choose whether the wedding party should use the same or different coordinated colours.
6. Generate a harmonious colour palette.
7. See recommended colours for:

   * Couple
   * Bridesmaids
   * Groomsmen
   * Bride's family
   * Groom's family
   * Guests
8. See suggested:

   * Outfits
   * Fabrics
   * Accessories
   * Decor
9. Save or share the resulting Style Guide.

The entire experience should feel like:

> **"Give me two colours. I'll help you figure out the rest."**

---

# 55. Recommended Initial Build

## Stack

```text
Next.js 15
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Local TypeScript/JSON data
```

## No-cost MVP

```text
No AI API
No database
No authentication
No image generation
No external services
```

## Later infrastructure

```text
Next.js
    ↓
Supabase
    ├── PostgreSQL
    ├── Auth
    └── Storage

Optional AI
    ├── Inspiration analysis
    ├── Natural-language styling
    └── Visual generation
```

---

# 56. Product Positioning

### Internal product description

> A wedding styling assistant that transforms two colours into a coordinated wedding colour palette, outfit direction, fabric suggestions and decor guide.

### Core user-facing proposition

> **Choose two colours. We'll help you build the rest.**

### Design philosophy

> **Black and white interface. Colourful wedding.**

### Product personality

* Elegant
* Editorial
* Calm
* Sophisticated
* Helpful
* Modern
* Culturally aware
* Uncomplicated

The product should feel like **opening a beautifully designed wedding lookbook**, not filling out a planning spreadsheet.
