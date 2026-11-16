import { Logo } from './Logo'

type Props = { menuOpen: boolean; onMenuClick: () => void }

export function Header({ menuOpen, onMenuClick }: Props) {
  return (
    <header className="site-header">
      <div className="page-column site-header__inner">
        <Logo />
        <MenuButton open={menuOpen} onClick={onMenuClick} />
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
