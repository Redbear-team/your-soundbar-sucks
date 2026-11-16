import { useId, useState } from 'react'
import { FIND_A_DEALER, HOW_IT_WORKS } from '../links'
import { Arrow } from './Arrow'

type Item = { q: string; a: React.ReactNode }

const items: Item[] = [
  {
    q: 'Are speakers better than a soundbar?',
    a: (
      <>
        <p>
          Yes. A soundbar can only cover about 21 degrees. A pair of real speakers covers 60. In blind tests, listeners
          keep picking real speakers over virtual sound, even the people who built the virtual systems.
        </p>
      </>
    ),
  },
  {
    q: 'Do I have to run wire through my walls?',
    a: (
      <p>
        No. AUDIO Cu sends sound through the electrical wiring already in your walls. A transmitter connects to your
        TV, and a receiver plugs into the nearest outlet beside each speaker. No drilling. No cable runs.{' '}
        <a className="text-link" href={HOW_IT_WORKS}>
          See how the system works <Arrow />
        </a>
      </p>
    ),
  },
  {
    q: 'Do I need new speakers?',
    a: (
      <p>
        Probably not. Any wired speaker or subwoofer with positive and negative terminals works, any brand, any model,
        mixed and matched however you want. Got good speakers in the garage or attic? Bring them back inside.
      </p>
    ),
  },
  {
    q: 'Where do I get it?',
    a: (
      <p>
        From an AUDIO Cu dealer.{' '}
        <a className="text-link" href={FIND_A_DEALER}>
          Find a dealer <Arrow />
        </a>
      </p>
    ),
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)
  const baseId = useId()

  return (
    <ul className="faq">
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `${baseId}-panel-${i}`
        return (
          <li key={item.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q} <Arrow direction="down" />
            </button>
            <div id={panelId} className="faq__answer" role="region" hidden={!isOpen}>
              {item.a}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
