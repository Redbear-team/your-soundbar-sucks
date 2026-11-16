import type { CSSProperties } from 'react'
import { Logo } from './Logo'

type Props = { menuOpen: boolean; onMenuClick: () => void }

export function Header({ menuOpen, onMenuClick }: Props) {
  return (
    <header className="site-header">
      <div className="canvas canvas--header">
        <div className="f-abs" style={{ '--mx': 26, '--dx': 42, '--my': 24, '--dy': 24 } as CSSProperties}>
          <Logo />
        </div>
        <div className="f-abs f-menu" style={{ '--mx': 273, '--dx': 544, '--my': 33, '--dy': 33 } as CSSProperties}>
          <MenuButton open={menuOpen} onClick={onMenuClick} />
        </div>
      </div>
    </header>
  )
}

export function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="menu-button"
      aria-label="Open menu"
      aria-expanded={open}
      aria-controls="site-menu"
      onClick={onClick}
    >
      <span />
      <span />
      <span />
    </button>
  )
}
