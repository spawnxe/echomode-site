# echomode-site — working notes for Claude

Astro 7 static site, deployed to GitHub Pages from `main`. Read `README.md` first for the layout.

## Commands

- `npm run build` then `PW_CHROMIUM=/opt/pw-browsers/chromium npm test` — run both before every push.
  (`astro preview` daemonises without a TTY; tests use `scripts/serve.mjs` instead.)
- `npm run check` — Astro/TypeScript type-check.
- Visual verification: screenshot the built site at 1440×900 and 390×844 with Playwright and look
  at it before calling a change done. Rendering is the product here.

## The system (do not drift from it)

- WIDE's rules: one typeface (Archivo Variable), one size (0.9vw), uppercase 600, −0.02em,
  cream `#FFFDF3` / ink `#0D0D0D`. No accent colour, no shadows, no radius, no blur, no blend modes
  beyond the pinned topbar/footer exclusion.
- Motion is masks and geometry, never opacity fades (the cover crossfade on the large card is the one
  exception). `--dur 1.5s`, `--ease cubic-bezier(.75,0,0,1)`.
- Geometry stays in vw/vh. New compositions go in `buildLayouts()` in `src/scripts/canvas.ts`
  and get a text block in `src/data/compositions.ts`.
- The logotype is one `<symbol>` (`Mark.astro`) referenced by each card. The outer `<svg>` viewBox
  must start at `0 0`; the symbol carries the negative-y viewBox. Never inline the path per card.
- No document scroll on desktop. Input maps to compositions (see the wheel gesture logic); do not
  add a conventional scrolling page beneath the canvas without Paul asking for it.

## Content

- Copy and captions are data (`src/data/*.ts`), not markup. Edit there.
- Keep the legal placeholders in composition 05 until Paul supplies the real details.
- Do not add location / multi-country content; the site is about the work, not where it is done.

## Workflow

- Small branches, one concern each; open a PR with a plain description of what changed and why.
  CI must be green. Deploy happens on merge to `main`.
- Commit messages: imperative, short subject, body says why.
