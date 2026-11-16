import { useState, type CSSProperties, type FormEvent } from 'react'
import { footerLinks, legalLinks, SUBSCRIBE_URL } from '../links'
import { Arrow } from './Arrow'
import { MenuButton } from './Header'
import { Logo } from './Logo'

type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; message: string }

/** Places a footer element at [mobile x, desktop x, y] in design units. */
const at = (mx: number, dx: number, y: number) => ({ '--mx': mx, '--dx': dx, '--my': y, '--dy': y }) as CSSProperties

export function Footer({ menuOpen, onMenuClick }: { menuOpen: boolean; onMenuClick: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
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
      <div className="canvas canvas--footer">
        <div className="f-abs" style={at(31, 156, 22)}>
          <Logo />
        </div>
        <div className="f-abs f-menu" style={at(277, 402, 30)}>
          <MenuButton open={menuOpen} onClick={onMenuClick} />
        </div>

        <nav className="f-abs f-links" style={at(50, 185, 86.4)} aria-label="Footer">
          {footerLinks.map((link) => (
            <a key={link.href + link.label} href={link.href}>
              {link.label} <Arrow />
            </a>
          ))}
        </nav>

        <form
          className="f-abs f-form"
          style={at(166, 301, 91.2)}
          onSubmit={onSubmit}
          aria-busy={status.kind === 'sending'}
        >
          <label htmlFor="footer-email" className="f-signup">
            <span className="line">Hear about it before</span>
            <span className="line">anyone else does.</span>
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
          <button type="submit" className="visually-hidden">
            Sign up
          </button>
          <p id="footer-signup-status" className="f-status" role="status">
            {status.message}
          </p>
        </form>

        <nav className="f-legal" aria-label="Legal">
          {legalLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className="f-abs"
              style={at([49, 116, 185, 247][i], [185, 252, 321, 383][i], 169.5)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="f-copyright">
          <span className="line">
            © Copyright {new Date().getFullYear()} AUDIO Cu, Fasetto, Inc. Dolby®, Dolby Atmos®, Dolby Digital®, Dolby
            TrueHD®,
          </span>{' '}
          <span className="line">
            and the double-D symbol are trademarks of Dolby® Laboratories Licensing Corporation. Used under license.
          </span>
        </p>
      </div>
    </footer>
  )
}
