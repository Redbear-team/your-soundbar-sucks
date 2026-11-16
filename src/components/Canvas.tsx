import type { CSSProperties, ReactNode } from 'react'
import { art, type ArtName } from '../art'
import { sectionHeight, textStyle, textTop, type SectionId, type TextStyle } from '../design'

type XY = readonly [number, number] | null

type CssVars = CSSProperties & Record<`--${string}`, string | number>

/** A full-bleed section with a centred design canvas sized in units. */
export function Section({
  id,
  tone,
  className = '',
  labelledBy,
  anchor,
  children,
}: {
  id: SectionId
  tone: 'rust' | 'charcoal'
  className?: string
  labelledBy?: string
  anchor?: string
  children: ReactNode
}) {
  const style: CssVars = { '--mh': sectionHeight.m[id], '--dh': sectionHeight.d[id] }
  return (
    <section id={anchor} className={`sec sec--${tone} ${className}`} aria-labelledby={labelledBy}>
      <div className="canvas" style={style}>
        {children}
      </div>
    </section>
  )
}

/**
 * Text placed at the PDF position. `m` / `d` are [x, capTop] in page units for the
 * mobile / desktop layout (null hides it on that layout). Lines are kept exactly as
 * in the PDF.
 */
export function Text({
  as: Tag = 'p',
  v,
  sec,
  m,
  d,
  lines,
  id,
  className = '',
  children,
}: {
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'span'
  v: TextStyle
  sec: SectionId
  m: XY
  d: XY
  lines?: ReactNode[]
  id?: string
  className?: string
  children?: ReactNode
}) {
  const [ms, ml] = textStyle[v].m
  const [ds, dl] = textStyle[v].d
  const style: CssVars = {
    '--mfs': ms,
    '--mlh': ml,
    '--dfs': ds,
    '--dlh': dl,
  }
  if (m) Object.assign(style, { '--mx': m[0], '--my': textTop(v, 'm', sec, m[1]) })
  if (d) Object.assign(style, { '--dx': d[0], '--dy': textTop(v, 'd', sec, d[1]) })
  const vis = !m ? 'only-d' : !d ? 'only-m' : ''
  return (
    <Tag id={id} className={`t t--${v} ${vis} ${className}`} style={style}>
      {lines
        ? lines.map((line, i) => (
            <span className="line" key={i}>
              {line}
            </span>
          ))
        : children}
    </Tag>
  )
}

/** A photo rendered into PDF page space for each layout (see scripts/README). */
export function Art({ name, alt, priority = false }: { name: ArtName; alt: string; priority?: boolean }) {
  const a = art[name]
  const style: CssVars = {
    '--mx': a.m.x,
    '--my': a.m.y,
    '--mw': a.m.w,
    '--mhh': a.m.h,
    '--dx': a.d.x,
    '--dy': a.d.y,
    '--dw': a.d.w,
    '--dhh': a.d.h,
  }
  return (
    <picture className="art" style={style}>
      <source media="(min-width: 768px)" srcSet={`/images/desktop/${name}.webp`} />
      <img
        src={`/images/mobile/${name}.webp`}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}

/** Absolutely placed wrapper for anything else (links, lists, diagrams). */
export function Place({
  m,
  d,
  className = '',
  children,
  style: extra,
}: {
  m: XY
  d: XY
  className?: string
  children: ReactNode
  style?: CssVars
}) {
  const style: CssVars = { ...extra }
  if (m) Object.assign(style, { '--mx': m[0], '--my': m[1] })
  if (d) Object.assign(style, { '--dx': d[0], '--dy': d[1] })
  const vis = !m ? 'only-d' : !d ? 'only-m' : ''
  return (
    <div className={`place ${vis} ${className}`} style={style}>
      {children}
    </div>
  )
}
