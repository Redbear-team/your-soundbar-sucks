import { useState, type FormEvent, type ReactNode } from 'react'
import { footerLinks, legalLinks, SUBSCRIBE_URL } from '../links'
import { Logo } from './Logo'

/** Site footer, ported from www.audiocu.com (web/src/SiteFooter.tsx). */

function AskArrowLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={`ask-arrow-link ${className ?? ''}`}>
      {children}
      <span className="ask-arrow" aria-hidden="true">
        {' '}
        →
      </span>
    </a>
  )
}

export function Footer({ menuOpen, onMenuClick }: { menuOpen: boolean; onMenuClick: () => void }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | ''>('')

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setMessage('')
    setMessageTone('')
    try {
      const response = await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (response.ok && data?.ok) {
        setEmail('')
        setMessageTone('success')
        setMessage("Thanks, you're on the list.")
        return
      }
      setMessageTone('error')
      setMessage(
        data?.error === 'invalid_email'
          ? 'Please enter a valid email address.'
          : 'Something went wrong. Please try again in a moment.',
      )
    } catch {
      setMessageTone('error')
      setMessage('Something went wrong. Please try again in a moment.')
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className="site-footer site-footer-enter">
      <div className="page-column site-footer-column">
        <div className="site-footer-head">
          <Logo className="site-footer-logo" />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={onMenuClick}
            className="site-footer-menu-icon"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className="site-footer-grid">
          <nav className="site-footer-nav" aria-label="Footer">
            {footerLinks.map((item) => (
              <AskArrowLink key={item.href} href={item.href} className="site-footer-nav-link">
                {item.label}
              </AskArrowLink>
            ))}
          </nav>
          <div className="site-footer-signup">
            <p className="site-footer-signup-head">
              <span className="block">Hear about it before</span>
              <span className="block">anyone else does.</span>
            </p>
            <form className="site-footer-form" onSubmit={submitSignup} noValidate aria-busy={sending}>
              <label className="site-footer-email">
                <span className="visually-hidden">Enter Email Here</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter Email Here"
                  autoComplete="email"
                  required
                  disabled={sending}
                  aria-invalid={messageTone === 'error'}
                  aria-describedby="footer-signup-status"
                />
              </label>
              <button type="submit" className="site-footer-signup-button" disabled={sending}>
                Sign up
                <span className="ask-arrow" aria-hidden="true">
                  {' '}
                  →
                </span>
              </button>
              <p id="footer-signup-status" className="site-footer-signup-status" role="status" aria-live="polite">
                {message}
              </p>
            </form>
          </div>
        </div>
        <div className="site-footer-legal">
          {legalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="site-footer-legal-link"
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <p className="site-footer-copy">
          © Copyright 2026 AUDIO Cu, Fasetto, Inc. Dolby®, Dolby Atmos®, Dolby Digital®, Dolby TrueHD®, and the double-D
          symbol are trademarks of Dolby® Laboratories Licensing Corporation. Used under license.
        </p>
      </div>
    </footer>
  )
}
