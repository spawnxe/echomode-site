# echomode-site

The website for Echomode, a design systems studio. One canvas, five compositions, after the
[WIDE](https://tympanus.net/codrops/2026/09/28/wide-template/) system by BL/S Studio.

Live: https://spawnxe.github.io/echomode-site/ (deploys from `main`).

## Run it

```sh
npm install
npm run dev        # http://localhost:4321/echomode-site/
npm run build      # → dist/
npm test           # Playwright against the built site (run build first)
```

Tests need a Chromium. In CI it is installed by the workflow; locally run
`npx playwright install chromium` once, or point at one you have:
`PW_CHROMIUM=/path/to/chrome npm test`.

## Where things live

| Path | What |
| --- | --- |
| `src/data/compositions.ts` | All copy: labels, statements, body text, site title and description |
| `src/data/items.ts` | The ten cards: captions, which artefact image each shows, link target |
| `src/data/mark.json` | The logotype path (lowercase `echomode`). Swap this for the licensed ink‑trap logotype |
| `src/assets/fields/`, `src/assets/covers/` | Artefact imagery. *Field* = the graphic alone (small cards); *cover* = graphic + its own type (shown only when a card is large) |
| `src/styles/canvas.css` | The whole visual system. One typeface, one size, vw/vh geometry, masks not fades |
| `src/scripts/canvas.ts` | The controller: layouts, transitions, wheel / swipe / keys / buttons |
| `src/components/` | Topbar, Item, TextLayer, Mark (the `<symbol>` the cards reuse) |
| `tests/` | Playwright: stepping, boundaries, text layer, overflow, mobile fold |

## How it moves

- The canvas is a fixed viewport; `body { overflow: clip }`. Wheel, trackpad and swipe step
  compositions (one step per gesture, no wrap). The 01–05 buttons, arrows and keyboard wrap.
- Cards are created once. A composition only writes `--l/--w/--t/--h`; CSS transitions do the rest
  (`--dur: 1.5s`, `--ease: cubic-bezier(.75,0,0,1)`).
- Leaving cards mask out with `clip-path` before the move; arriving cards mask in from the top.
  Text sits in overflow masks and slides 120%.
- Below 860px the canvas folds to a two‑column page that scrolls; the frame stays pinned.

## Deploying

`main` → GitHub Pages via `.github/workflows/deploy.yml` (build → test → deploy; a failing test
blocks the deploy). Pull requests run `.github/workflows/ci.yml`.

To move to **echomode.studio**: add the custom domain under *Settings → Pages* (GitHub commits a
`CNAME`), then set `SITE_URL=https://echomode.studio` and `SITE_BASE=/` in `deploy.yml`.

## Still open

- Legal line in composition 05 carries placeholders: `[England and Wales]`, `[00000000]`.
- The logotype is Archivo (wdth 80 / wght 800). Replace `src/data/mark.json` with the licensed
  ink‑trap logotype when chosen; the licence file goes next to it.
- Client names (Kinyara Health, Kanda Care) need sign‑off before this goes public.
- Artefact imagery is JPEG from code‑drawn SVG (see the generators in the old scratch build).
  Next step is to render them as live SVG components so they stay crisp and can animate.
- `public/favicon.svg` is a placeholder.
