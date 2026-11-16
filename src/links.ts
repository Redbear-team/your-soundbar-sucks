// Navigation mirrors https://www.audiocu.com so both sites stay in sync.
export const MAIN_SITE = 'https://www.audiocu.com'

const main = (path: string) => `${MAIN_SITE}${path}`

export type NavLink = { label: string; href: string }

/** Hamburger menu, same order and labels as the main site. */
export const menuLinks: NavLink[] = [
  { label: 'Home', href: main('/') },
  { label: 'Built for those who love sound', href: main('/sound') },
  { label: 'Works with any wired speakers', href: main('/wired-speakers') },
  { label: 'Sets up in any room or house', href: main('/any-room') },
  { label: 'See how the system works', href: main('/how-it-works') },
  { label: 'Find a Dealer', href: main('/find-a-dealer') },
  { label: 'Become a Dealer', href: main('/become-a-dealer') },
  { label: 'Common Questions', href: main('/common-questions') },
  { label: 'Ask Us Directly', href: main('/ask-us-directly') },
]

/** Footer arrow links, as in the final PDF. */
export const footerLinks: NavLink[] = [
  { label: 'Find a dealer', href: main('/find-a-dealer') },
  { label: 'Common questions', href: main('/common-questions') },
  { label: 'Ask us directly', href: main('/ask-us-directly') },
]

/** Footer legal row, as in the final PDF. www.audiocu.com has no warranty page yet,
 * so Warranties points at the support site until one exists. */
export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: main('/privacy-policy') },
  { label: 'Set Up Guides', href: 'https://www.audiocusupport.com/' },
  { label: 'Warranties', href: 'https://www.audiocusupport.com/' },
  { label: 'Terms of Use', href: main('/terms-of-use') },
]

export const HOW_IT_WORKS = main('/how-it-works')
export const FIND_A_DEALER = main('/find-a-dealer')

/**
 * Newsletter endpoint. The main site posts `{ email }` as JSON to /api/subscribe.
 * Override with VITE_SUBSCRIBE_URL when this site is hosted on another domain.
 */
export const SUBSCRIBE_URL: string = import.meta.env.VITE_SUBSCRIBE_URL ?? main('/api/subscribe')
