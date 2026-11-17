import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { FIND_A_DEALER, HOW_IT_WORKS } from '../links'
import { Arrow } from './Arrow'

type Item = { q: [string, string?]; a: ReactNode }

// Questions and line breaks are from the final PDF. The PDF has no answer copy;
// these answers reuse wording from the page and from www.audiocu.com.
const items: Item[] = [
  {
    q: ['Are separate standalone speakers', 'better than a soundbar?'],
    a: (
      <>
        Yes. A soundbar can only cover 21 degrees. A pair of real speakers covers 60. In blind tests, listeners keep
        picking real speakers over virtual sound.
      </>
    ),
  },
  {
    q: ['Do I have to run wire', 'through my walls?'],
    a: (
      <>
        No. AUDIO Cu sends sound through the electrical wiring already in your walls. No drilling. No cable runs.{' '}
        <a href={HOW_IT_WORKS}>
          See how the system works <Arrow />
        </a>
      </>
    ),
  },
  {
    q: ['Do I need new speakers?'],
    a: (
      <>
        Probably not. Any wired speaker or subwoofer with positive and negative terminals works, any brand, any model.
        Got good speakers in the garage or attic? Bring them back inside.
      </>
    ),
  },
  {
    q: ['Where do I get it?'],
    a: (
      <>
        From an AUDIO Cu dealer.{' '}
        <a href={FIND_A_DEALER}>
          Find a dealer <Arrow />
        </a>
      </>
    ),
  },
]

type XY = readonly [number, number]

/**
 * FAQ accordion. It sits in normal flow (offset to its PDF position) so an open
 * answer pushes the section taller instead of overlapping what follows.
 */
export function Faq({ m, d }: { m: XY; d: XY }) {
  const [open, setOpen] = useState<number | null>(null)
  const baseId = useId()
  const style = { '--mx': m[0], '--my': m[1], '--dx': d[0], '--dy': d[1] } as CSSProperties

  return (
    <ul className="faq" style={style}>
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `${baseId}-faq-${i}`
        return (
          <li key={item.q[0]} className={isOpen ? 'is-open' : undefined}>
            <button
              type="button"
              className="faq__q"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="line">
                {item.q[0]}
                {!item.q[1] && (
                  <>
                    {' '}
                    <Arrow direction="down" />
                  </>
                )}
              </span>
              {item.q[1] && (
                <span className="line">
                  {item.q[1]} <Arrow direction="down" />
                </span>
              )}
            </button>
            <div id={panelId} className="faq__a" role="region" hidden={!isOpen}>
              {item.a}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
