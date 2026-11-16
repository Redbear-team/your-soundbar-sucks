import { useEffect, useRef } from 'react'
import { menuLinks } from '../links'
import { Logo } from './Logo'

type Props = { open: boolean; onClose: () => void }

export function MenuOverlay({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      id="site-menu"
      className={`menu-overlay ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="page-column site-header__inner">
        <Logo />
        <button ref={closeRef} type="button" className="menu-close" aria-label="Close menu" onClick={onClose}>
          <span />
          <span />
        </button>
      </div>
      <nav className="page-column menu-overlay__nav" aria-label="Main">
        <ul>
          {menuLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
