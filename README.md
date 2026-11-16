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

| Path | What it is |
| --- | --- |
| `src/design.ts` | Section positions and the type scale measured from the PDF |
| `src/art.ts` | Where each photo sits on each layout (generated) |
| `src/App.tsx` | The page: every text block with its PDF position |
| `src/components/Canvas.tsx` | `Section`, `Text`, `Art` and `Place` building blocks |
| `src/components/` | Header, menu overlay, footer, FAQ accordion, couch cones |
| `src/links.ts` | Menu, footer and legal links (to www.audiocu.com) and the newsletter endpoint |
| `public/images/{mobile,desktop}/` | Photos pre-rendered at their PDF scale, position, rotation and mirroring |
| `scripts/design/` | The pipeline that measured the PDF and produced the images |

## Newsletter signup

The footer email field posts `{ "email": "…" }` as JSON when the visitor presses Enter. The main site posts the same payload. By default it posts to `https://www.audiocu.com/api/subscribe`.

That endpoint doesn't currently allow cross-origin requests. The form only works if this page is served from the audiocu.com domain, or if CORS is enabled for this site's domain. To use a different endpoint, set `VITE_SUBSCRIBE_URL` at build time.
