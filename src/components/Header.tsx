import { Logo } from './Logo'

type Props = { menuOpen: boolean; onMenuClick: () => void }

/** Site header, ported from www.audiocu.com (web/src/App.tsx). */
export function Header({ menuOpen, onMenuClick }: Props) {
  return (
    <header className="site-header">
      <div className="page-column site-header-inner">
        <Logo className="site-logo" priority />
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={onMenuClick}
          className="site-menu-icon"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
