# Voca App DESIGN.md

## Direction

Voca App is not a generic study dashboard. It should feel like a premium command
desk for serious vocabulary training: fast, dense, typographic, and a little
cinematic.

Reference mix:
- Getdesign/Raycast: near-black chrome, command-palette precision, thin borders,
  contained glow, sharp action states.
- Getdesign/WIRED: editorial density, strong word-first hierarchy, mono kickers,
  restrained color.
- Lazyweb language apps: daily review card, visible queue, progress-first study
  flow, immediate flashcard actions.

## Palette

Dark surfaces are the product shell. Warm paper is reserved for the active card.
No green system accent.

- Canvas: `#07070a`
- Surface 100: `#101116`
- Surface 200: `#171820`
- Surface 300: `#22232b`
- Paper: `#f5efe4`
- Paper deep: `#e8d8c3`
- Ink: `#101014`
- Body on dark: `#e9e6df`
- Muted on dark: `#98948c`
- Hairline: `rgba(255,255,255,0.12)`
- Accent red: `#ff4f43`
- Accent blue: `#6fa8ff`
- Accent amber: `#f5b84b`

## Typography

Use local/system fonts only for now.

- Display English word: `Georgia`, `Times New Roman`, serif. Massive, calm,
  high-contrast. It owns the screen.
- Korean headings/body: `Apple SD Gothic Neo`, `Pretendard`, `Avenir Next`,
  system sans fallback.
- UI labels and metadata: uppercase mono-like tracking using `SF Mono`,
  `ui-monospace`, `Menlo`.

Rules:
- Keep letter-spacing at `0` for large Korean text.
- Use mono only for metadata, root labels, counters, and deck status.
- Do not make the whole UI serif. Serif is for the studied word and brand mark.

## Layout

Desktop uses a command-desk layout:
- Left: compact black navigation rail.
- Center: oversized active flashcard as the main object.
- Right: examples and relation chips.
- Bottom or side: daily queue list.

The focus card must look more important than the panels around it. Use depth,
scale, and paper contrast.

Mobile stacks in this order:
1. Compact brand/navigation.
2. Active study card.
3. Actions.
4. Queue.
5. Details.

## Components

### Focus Card
- Warm paper surface, dark ink.
- Word at 92-140px desktop, 58-80px mobile.
- Root highlight uses red underline and soft wash behind the root segment.
- Visual prompt appears as a cinematic black caption plate, not a dashed
  placeholder.

### Queue Row
- Dense rows with word, short meaning, and tiny status marker.
- Active row uses red left rail and dark text, not a full blue outline.

### Insight Panel
- White/paper cards with thin rules.
- Examples should feel like Word Smart: sentence first, Korean support below.
- Synonym/antonym chips use semantic color but stay quiet.

### Buttons
- Primary action: red or white-on-dark, high contrast.
- Secondary action: dark glass or paper outline.
- Radius max 8px except tiny pills/chips.

## Motion

- Hover lift: 120-180ms.
- Button press: slight translateY and brightness shift.
- Card changes should be immediate; no theatrical animation yet.

## Do Not

- Do not use green as the primary accent.
- Do not use broad purple/blue gradients as the dominant identity.
- Do not make the UI look like a SaaS landing page.
- Do not bury the active word under dashboard metrics.
