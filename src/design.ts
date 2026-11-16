/**
 * Layout measured from the final PDF (AUDIO_Cu_B2C_Sucks.pdf).
 *
 * Everything is in design units: the mobile page is 326 units wide, the desktop
 * page 603. CSS turns a unit into pixels with --u, so the page scales with the
 * viewport and keeps the PDF's proportions exactly.
 *
 * Text positions are the top of the capital letters as measured in the PDF;
 * `textTop` converts that to a CSS line-box top using Figtree's metrics
 * (ascent 0.95em, descent 0.25em, cap height 0.70em).
 */

export type Layout = 'm' | 'd'
export type SectionId = 's1' | 's2' | 's3' | 's4' | 'footer'

/** Section tops in page units, per layout (header is 0–82 on both). */
export const sectionTop: Record<Layout, Record<SectionId, number>> = {
  m: { s1: 82, s2: 2236, s3: 3314, s4: 4856, footer: 5512 },
  d: { s1: 82, s2: 1314, s3: 1940, s4: 2813, footer: 3154 },
}

/** Section heights in units. */
export const sectionHeight: Record<Layout, Record<SectionId, number>> = {
  m: { s1: 2154, s2: 1078, s3: 1542, s4: 656, footer: 262 },
  d: { s1: 1232, s2: 626, s3: 873, s4: 341, footer: 241 },
}

/** Type styles: font size and line height in units, per layout. */
export const textStyle = {
  eyebrow: { m: [13.5, 15], d: [13.5, 15] },
  display: { m: [39.7, 32], d: [38.8, 32] },
  headline: { m: [24.6, 24.9], d: [24.6, 24.9] },
  body: { m: [13.6, 16.7], d: [13.6, 16.7] },
  link: { m: [13.5, 15], d: [13.5, 15] },
  subhead: { m: [13.55, 14.5], d: [13.55, 14.5] },
  subhead2: { m: [12.6, 12.3], d: [12.6, 12.3] },
  small: { m: [9.2, 14], d: [9.2, 14] },
  stat: { m: [22.3, 24], d: [22.3, 24] },
  stat2: { m: [18.4, 20], d: [18.4, 20] },
  source: { m: [9.3, 12], d: [9.3, 12] },
  faq: { m: [12.5, 14.5], d: [12.5, 14.5] },
  footnote: { m: [5, 8.5], d: [5, 8.5] },
} as const

export type TextStyle = keyof typeof textStyle

/** CSS top (units, relative to the section) for text whose cap top sits at `capTop` on the page. */
export function textTop(style: TextStyle, layout: Layout, section: SectionId, capTop: number) {
  const [size, lh] = textStyle[style][layout]
  return +(capTop - sectionTop[layout][section] - (lh / 2 - 0.35 * size)).toFixed(2)
}
