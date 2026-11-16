# Your Soundbar Sucks

Campaign landing page for AUDIO Cu, built with React, TypeScript and Vite from the `AUDIO_Cu_B2C_Sucks` Illustrator design.

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

## Structure

| Path | What it is |
| --- | --- |
| `src/App.tsx` | Page sections, top to bottom, in design order |
| `src/components/` | Header, menu overlay, footer, FAQ accordion, couch diagram, scroll reveal |
| `src/links.ts` | Menu and footer links (mirrors www.audiocu.com) and the newsletter endpoint |
| `src/index.css` | All styles: mobile first, two-column layout from 900px |
| `public/images/` | Web-optimized crops of the photos from the design's `Links` folder |
| `public/brand/` | AUDIO Cu logo lockup (same asset as www.audiocu.com) |
| `design/` | Artboard exports used as the visual reference (mobile, desktop, landing) |

## Newsletter signup

The footer form posts `{ "email": "…" }` as JSON, the same as the main site.
By default it posts to `https://www.audiocu.com/api/subscribe`. That endpoint
does not currently allow cross-origin requests, so the form only works if this
page is served from the audiocu.com domain, or if CORS is enabled for this
site's domain. To use a different endpoint, set `VITE_SUBSCRIBE_URL` at build time.
