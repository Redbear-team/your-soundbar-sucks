# Your Soundbar Sucks

Campaign landing page for AUDIO Cu, built with React, TypeScript and Vite to match the final design PDF (`design/AUDIO_Cu_B2C_Sucks.pdf`).

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
npm run lint
```

## How the layout works

The page reproduces the PDF exactly by building it in **design units** (`--u` in CSS):

- **Mobile (under 768px):** the 326-unit mobile page fills the screen width.
- **Desktop (768px and up):** the 603-unit desktop page scales with the window up to 1440px. On wider screens it stays centred, and the photo edges fade into the section colour.

Text, photos and section heights are positioned with the measurements from the PDF. Line breaks are fixed to the PDF's.

Colours match the PDF as the client sees it on screen. They were sampled from screenshots of the PDF, not converted from the CMYK values. The section colours are rust `#60281d`, charcoal `#2c2f2b`, slate `#2e3539` and gold `#c48f3b`.

| Path | What it is |
| --- | --- |
| `src/design.ts` | Section positions and the type scale measured from the PDF |
| `src/art.ts` | Where each photo sits on each layout (generated) |
| `src/App.tsx` | The page: every text block with its PDF position |
| `src/components/Canvas.tsx` | `Section`, `Text`, `Art` and `Place` building blocks |
| `src/components/` | Header, slide-in menu and footer (ported from the main site), FAQ accordion, couch cones |
| `src/links.ts` | Menu, footer and legal links (to www.audiocu.com) and the newsletter endpoint |
| `public/images/{mobile,desktop}/` | Photos pre-rendered at their PDF scale, position, rotation and mirroring, as WebP in several widths (`<name>-<width>.webp`, served with `srcset`), plus a `tone-<section>` gradient layer per section |
| `public/brand/` | AUDIO Cu logo in the main site's three widths |
| `scripts/design/` | The pipeline that measured the PDF and produced the images |

## Header, menu and footer

These are ported from the main site's repo (`Redbear-team/audiocu`, `web/src/App.tsx`, `nav.tsx`, `SiteFooter.tsx` and `index.css`). They have the same sizes, fonts, colours, slide-in menu and footer layout, with all links pointing to www.audiocu.com. If the main site's header or footer changes, port the change here too.

## Image sizes

| Screen | Photo size used | Whole page |
| --- | --- | --- |
| Phone, 1x | 390 px | about 285 KB |
| Phone, 3x | 900 px (capped) | about 1 MB |
| Laptop 1440, 1x | 1600 px | about 1.3 MB |
| Laptop 1440, 2x | 2894 px | about 2.6 MB |

Photos below the first screen load as you scroll. Only the hero and the logo are preloaded.

## Newsletter signup

The footer email field posts `{ "email": "…" }` as JSON when the visitor presses Enter. The main site posts the same payload. By default it posts to `https://www.audiocu.com/api/subscribe`.

That endpoint doesn't currently allow cross-origin requests. The form only works if this page is served from the audiocu.com domain, or if CORS is enabled for this site's domain. To use a different endpoint, set `VITE_SUBSCRIBE_URL` at build time.
