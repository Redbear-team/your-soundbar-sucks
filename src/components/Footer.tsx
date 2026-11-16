import { useState, type FormEvent } from 'react'
import { footerLinks, legalLinks, SUBSCRIBE_URL } from '../links'
import { Arrow } from './Arrow'
import { MenuButton } from './Header'
import { Logo } from './Logo'

type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; message: string }

export function Footer({ menuOpen, onMenuClick }: { menuOpen: boolean; onMenuClick: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus({ kind: 'sending', message: '' })
    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setEmail('')
      setStatus({ kind: 'ok', message: "You're on the list." })
    } catch {
      setStatus({ kind: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <footer className="site-footer">
      <div className="page-column site-footer__column">
        <div className="site-footer__head">
          <Logo />
          <MenuButton open={menuOpen} onClick={onMenuClick} />
        </div>

        <div className="site-footer__grid">
          <nav className="site-footer__nav" aria-label="Footer">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-link">
                {link.label} <Arrow />
              </a>
            ))}
          </nav>

          <form className="site-footer__form" onSubmit={onSubmit} noValidate={false} aria-busy={status.kind === 'sending'}>
            <label htmlFor="footer-email" className="site-footer__signup-head">
              Hear about it before anyone else does.
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              placeholder="Enter Email Here"
              autoComplete="email"
              required
              value={email}
              disabled={status.kind === 'sending'}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="footer-signup-status"
              aria-invalid={status.kind === 'error'}
            />
            <button type="submit" className="text-link site-footer__signup" disabled={status.kind === 'sending'}>
              Sign up <Arrow />
            </button>
            <p id="footer-signup-status" className="site-footer__status" role="status">
              {status.message}
            </p>
          </form>
        </div>

        <nav className="site-footer__legal" aria-label="Legal">
          {legalLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className="site-footer__copyright">
          © Copyright {new Date().getFullYear()} AUDIO Cu, Fasetto, Inc. Dolby®, Dolby Atmos®, Dolby Digital®, Dolby
          TrueHD®, and the double-D symbol are trademarks of Dolby® Laboratories Licensing Corporation. Used under
          license.
        </p>
      </div>
    </footer>
  )
}
