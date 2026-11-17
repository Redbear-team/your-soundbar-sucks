// Header menu and footer mirror www.audiocu.com (Redbear-team/audiocu: web/src/nav.tsx,
// web/src/SiteFooter.tsx). Paths there are relative; here they point at the main site.
export const MAIN_SITE = 'https://www.audiocu.com'

const main = (path: string) => `${MAIN_SITE}${path}`

export type MenuItem = { href: string; lines: string[] }
export type NavLink = { href: string; label: string; external?: boolean }

/** Menu: four product pages (white arrows), then four utility links (gold arrows). */
export const menuPrimary: MenuItem[] = [
  { href: main('/sound'), lines: ['Built for those', 'who love sound'] },
  { href: main('/wired-speakers'), lines: ['Works with any', 'wired speakers'] },
  { href: main('/any-room'), lines: ['Sets up in any', 'room or house'] },
  { href: main('/how-it-works'), lines: ['See how the', 'system works'] },
]

export const menuSecondary: MenuItem[] = [
  { href: main('/find-a-dealer'), lines: ['Find a Dealer'] },
  { href: main('/become-a-dealer'), lines: ['Become a Dealer'] },
  { href: main('/common-questions'), lines: ['Common Questions'] },
  { href: main('/ask-us-directly'), lines: ['Ask Us Directly'] },
]

export const footerLinks: NavLink[] = [
  { href: main('/find-a-dealer'), label: 'Find a dealer' },
  { href: main('/become-a-dealer'), label: 'Become a Dealer' },
  { href: main('/common-questions'), label: 'Common questions' },
  { href: main('/ask-us-directly'), label: 'Ask us directly' },
]

export const legalLinks: NavLink[] = [
  { href: main('/privacy-policy'), label: 'Privacy Policy' },
  { href: 'https://www.audiocusupport.com/', label: 'Set Up Guides', external: true },
  { href: main('/terms-of-use'), label: 'Terms of Use' },
]

export const HOW_IT_WORKS = main('/how-it-works')
export const FIND_A_DEALER = main('/find-a-dealer')

/**
 * Newsletter endpoint. The main site posts `{ email }` as JSON to /api/subscribe
 * and answers `{ ok: true }`. Override with VITE_SUBSCRIBE_URL when this site is
 * hosted on another domain.
 */
export const SUBSCRIBE_URL: string = import.meta.env.VITE_SUBSCRIBE_URL ?? main('/api/subscribe')

/** Source for the BBC R&D soundbar listening test cited in the blind-test section. */
export const BBC_STUDY = 'https://downloads.bbc.co.uk/rd/pubs/whp/whp-pdf-files/WHP320.pdf'

/** Source for the Nokia Research Center virtual-surround test (AES Convention, 1999). */
export const AES_STUDY =
  'https://aaltodoc.aalto.fi/server/api/core/bitstreams/c85dee48-648e-4508-be04-14c83df9c724/content'

/** Source for the split-bar trend (What Hi-Fi? best surround sound systems). */
export const WHAT_HIFI = 'https://www.whathifi.com/best-buys/best-surround-sound-systems'
