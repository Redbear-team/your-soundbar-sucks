import { forwardRef } from 'react'
import { menuPrimary, menuSecondary } from '../links'

/**
 * Slide-in menu panel, ported from www.audiocu.com (web/src/App.tsx + nav.tsx):
 * full screen under the header on phones, a panel on the right half on desktop.
 */
export const MenuPanel = forwardRef<HTMLElement, { onClose: () => void }>(function MenuPanel({ onClose }, ref) {
  return (
    <div className="menu-backdrop" onClick={onClose}>
      <nav
        id="site-menu"
        ref={ref}
        aria-label="Menu"
        onClick={(event) => event.stopPropagation()}
        className="menu-panel"
      >
        <div className="menu-primary">
          {menuPrimary.map((item) => (
            <MenuLink key={item.href} {...item} tone="light" onNavigate={onClose} />
          ))}
        </div>
        <div className="menu-secondary">
          {menuSecondary.map((item) => (
            <MenuLink key={item.href} {...item} tone="gold" onNavigate={onClose} />
          ))}
        </div>
      </nav>
    </div>
  )
})

function MenuLink({
  href,
  lines,
  tone,
  onNavigate,
}: {
  href: string
  lines: string[]
  tone: 'light' | 'gold'
  onNavigate: () => void
}) {
  return (
    <a href={href} onClick={onNavigate} className={`menu-link menu-link--${tone}`}>
      <span className="menu-link-text">
        {lines.map((line, i) => (
          <span key={line} className="block">
            {line}
            {i === lines.length - 1 && (
              <>
                {' '}
                <span className="menu-arrow">→</span>
              </>
            )}
          </span>
        ))}
      </span>
    </a>
  )
}
