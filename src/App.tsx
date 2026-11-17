import { useCallback, useEffect, useRef, useState } from 'react'
import { Arrow, OutArrow } from './components/Arrow'
import { Art, Section, Text } from './components/Canvas'
import { CouchCones } from './components/CouchCones'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { MenuPanel } from './components/MenuOverlay'
import { textTop } from './design'
import { AES_STUDY, BBC_STUDY, FIND_A_DEALER, HOW_IT_WORKS } from './links'
import { useReveal } from './reveal'

export default function App() {
  // Menu behaviour ported from www.audiocu.com: slides in from the right, slides
  // out on close; scroll lock on phones only; Esc or a click outside closes it.
  const [menuPresent, setMenuPresent] = useState(false)
  const [menuKey, setMenuKey] = useState(0)
  const panelRef = useRef<HTMLElement>(null)
  const closingRef = useRef(false)
  useReveal()

  const openMenu = useCallback(() => {
    closingRef.current = false
    setMenuKey((key) => key + 1)
    setMenuPresent(true)
  }, [])

  const closeMenu = useCallback(() => {
    if (closingRef.current) return
    const panel = panelRef.current
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMenuPresent(false)
      return
    }
    closingRef.current = true
    panel.getAnimations().forEach((animation) => animation.cancel())
    const animation = panel.animate([{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(110%, 0, 0)' }], {
      duration: 420,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    })
    animation.onfinish = () => {
      closingRef.current = false
      setMenuPresent(false)
    }
  }, [])

  useEffect(() => {
    if (!menuPresent) return
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const syncScrollLock = () => {
      document.body.style.overflow = desktopQuery.matches ? '' : 'hidden'
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!desktopQuery.matches) return
      const target = event.target as Node | null
      if (!target || panelRef.current?.contains(target)) return
      if (document.querySelector('.site-header button')?.contains(target)) return
      closeMenu()
    }
    syncScrollLock()
    desktopQuery.addEventListener('change', syncScrollLock)
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      document.body.style.overflow = ''
      desktopQuery.removeEventListener('change', syncScrollLock)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuPresent, closeMenu])

  const toggleMenu = () => (menuPresent ? closeMenu() : openMenu())
  const onFooterMenuClick = () => {
    if (menuPresent) return closeMenu()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    openMenu()
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header menuOpen={menuPresent} onMenuClick={toggleMenu} />
      {menuPresent && <MenuPanel key={menuKey} ref={panelRef} onClose={closeMenu} />}

      <div className="page">
        <main id="main">
          <Intro />
          <BlindTests />
          <Introducing />
          <WhatComesNext />
        </main>
      </div>

      <Footer menuOpen={menuPresent} onMenuClick={onFooterMenuClick} />
    </>
  )
}

/** Hero, "you bought a soundbar…" and "lousy impression" share one rust section. */
function Intro() {
  return (
    <Section id="s1" tone="rust" labelledBy="hero-title">
      <Art name="hero-axe" priority alt="A man in safety glasses smashing a soundbar in half with an axe." />
      <Art name="burning-bar" alt="A soundbar on fire on a workbench, a woman peeking out from behind it." />
      <Art name="couch" alt="A man on a couch facing a TV with a soundbar, flanked by two tower speakers." />
      <CouchCones />

      <Text v="eyebrow" sec="s1" m={[60, 118]} d={[60, 144]} lines={['Sorry. Somebody', 'needs to say it.']} />
      <Text
        as="h1"
        id="hero-title"
        v="display"
        sec="s1"
        m={[59, 169]}
        d={[60, 195]}
        lines={['Your', 'soundbar', 'suuucks.']}
      />
      <Text as="div" v="link" sec="s1" m={[59, 551]} d={[60, 326]}>
        <a href="#why-it-sucks">
          Why it sucks <Arrow />
        </a>
      </Text>
      <Text as="div" v="link" sec="s1" m={[59, 567]} d={null}>
        <a href={FIND_A_DEALER}>
          Find a dealer <Arrow />
        </a>
      </Text>

      <span id="why-it-sucks" className="anchor" style={anchorStyle(632, 446)} />
      <Text
        as="h2"
        v="headline"
        sec="s1"
        m={[55, 648]}
        d={[330, 462]}
        lines={['You bought a', 'soundbar for', 'the sound but', 'let’s be honest,', 'it’s not great.']}
      />
      <Text
        v="body"
        sec="s1"
        m={[55, 789]}
        d={[330, 602]}
        lines={[
          'One box, one cord, done before',
          'kickoff. Your friend’s real',
          'speaker setup sounded better,',
          'but it came with a lost',
          'weekend, a ladder, and wire',
          'stapled along the baseboard. So',
          'you took the box. Most people',
          'did. Turns out waiting was the',
          'smart move. Because, in the',
          'end, a soundbar is never really',
          'chosen for how it sounds.',
        ]}
      />

      <Text
        as="h2"
        v="headline"
        sec="s1"
        m={[59, 1533]}
        d={[58, 926]}
        lines={['Your soundbar', 'is doing a lousy', 'impression of', 'speakers.']}
      />
      <Text
        v="subhead"
        sec="s1"
        m={[59, 1986]}
        d={[58, 1061]}
        lines={['You bought a soundbar', 'because it was easy install,', 'not because of the sound.']}
      />
      <Text
        v="small"
        sec="s1"
        m={[59, 2051]}
        d={[59, 1127]}
        lines={[
          'Your soundbar can only cover 21 degrees. A two',
          'speaker set up for stereo covers 60 degrees.',
          'Your ears hear the space between them, and a',
          'center speaker under the screen holds the',
          'voices. A soundbar crams all of that into a box a',
          'few inches tall. To sound wider than the box, it',
          'leans on processing that tricks your ears. Either',
          'way, the soundbar is just an estimate of where',
          'the sound should be.',
        ]}
      />
    </Section>
  )
}

function BlindTests() {
  return (
    <Section id="s2" tone="charcoal" labelledBy="blind-title">
      <Art name="blindfold" alt="A blindfolded man cupping his ear, listening closely." />

      <h2 id="blind-title" className="visually-hidden">
        Don’t take our word for it. Blind testers keep picking speakers over virtual sound.
      </h2>
      <Text
        as="div"
        v="headline"
        sec="s2"
        m={[60, 2301]}
        d={null}
        className="h-like"
        lines={['Don’t take our', 'word for it.', 'Blind testers', 'keep picking', 'speakers over', 'virtual sound.']}
      />
      <Text
        as="div"
        v="headline"
        sec="s2"
        m={null}
        d={[59, 1379]}
        className="h-like"
        lines={['Don’t take our word for it.', 'Blind testers keep picking', 'speakers over virtual sound.']}
      />

      <Text as="h3" v="stat" sec="s2" m={[58, 2492]} d={[59, 1502]}>
        0 for 2
      </Text>
      <Text
        v="small"
        sec="s2"
        m={[59, 2531]}
        d={[60, 1541]}
        lines={[
          'BBC R&D played the same clips through two',
          'soundbars and a plain pair of stereo speakers.',
          'Averaged across the test, listeners preferred',
          'the stereo pair to both soundbars. Words on the',
          'soundbar side of the results were tinny,',
          'muffled, and flat.',
        ]}
      />
      <Text v="source" sec="s2" m={[58, 2628]} d={[59, 1639]}>
        <a href={BBC_STUDY} target="_blank" rel="noopener noreferrer">
          BBC R&amp;D, 2016
          <OutArrow />
        </a>
      </Text>

      <Text as="h3" v="stat" sec="s2" m={[58, 2680]} d={[331, 1497]}>
        6 for 6
      </Text>
      <Text
        v="small"
        sec="s2"
        m={[59, 2714]}
        d={[332, 1532]}
        lines={[
          'Nokia Research Center pitted six virtual sound',
          'systems against real speakers. Real speakers',
          'beat all six. Even listeners from the companies',
          'that built the virtual systems preferred real',
          'speakers as well.',
        ]}
      />
      <Text v="source" sec="s2" m={[59, 2805]} d={[332, 1622]}>
        <a href={AES_STUDY} target="_blank" rel="noopener noreferrer">
          AES Convention, 1999
          <OutArrow />
        </a>
      </Text>

      <Text as="h3" v="stat2" sec="s2" m={[59, 2863]} d={[332, 1681]} lines={['The bar is', 'breaking up.']} />
      <Text
        v="small"
        sec="s2"
        m={[59, 2919]}
        d={[332, 1738]}
        lines={[
          'Now soundbar makers split the bar into',
          'separate boxes, trying for a wider sound.',
          'That’s halfway to speakers.',
        ]}
      />
      <Text v="source" sec="s2" m={[61, 2978]} d={[333, 1795]}>
        The Soundbar Aisle, 2026
      </Text>

      <Text
        v="footnote"
        sec="s2"
        m={[60, 3044]}
        d={[334, 1862]}
        lines={[
          'Based on a soundbar used on its own, 45 inches wide, at a 10-foot',
          'listening distance. Stereo placement is the 60° standard (ITU-R BS.775).',
          'The studies tested specific soundbars and virtual surround systems, not AUDIO Cu.',
        ]}
      />
    </Section>
  )
}

function Introducing() {
  return (
    <Section id="s3" tone="rust" labelledBy="intro-title">
      <Art name="product" alt="The AUDIO Cu transmitter and receiver, two compact black units." />
      <Art name="shredder" alt="A woman in ear defenders feeding a soundbar into a wood chipper, debris flying." />

      <Text
        as="h2"
        id="intro-title"
        v="headline"
        sec="s3"
        m={[55, 3380]}
        d={[60, 2006]}
        lines={['Introducing', 'AUDIO Cu.', 'Dolby Atmos®', 'Certified.']}
      />
      <Text
        v="subhead2"
        sec="s3"
        m={[54, 3754]}
        d={[60, 2143]}
        lines={[
          'One transmitter.',
          'One receiver per speaker.',
          'That’s the whole system,',
          'start to finish, in one sitting.',
        ]}
      />
      <Text
        v="small"
        sec="s3"
        m={[58, 3830]}
        d={[60, 2219]}
        lines={[
          'Got good speakers in the garage or attic? Bring',
          'them back inside. AUDIO Cu sends sound through',
          'the electrical wiring already in your walls. A',
          'transmitter connects to your TV. A receiver sits',
          'beside each speaker and plugs into the nearest',
          'outlet. Left, center, right. Real speakers, right where',
          'they belong. No drilling. No cable runs through your',
          'walls. No big box of wires.',
        ]}
      />
      <Text as="div" v="link" sec="s3" m={[55, 3975]} d={[60, 2364]}>
        <a href={HOW_IT_WORKS}>
          <span className="line">See how the</span>
          <span className="line">
            system works <Arrow />
          </span>
        </a>
      </Text>

      <Text
        as="h2"
        v="headline"
        sec="s3"
        m={[59, 4521]}
        d={[331, 2481]}
        lines={['You have a', 'few questions.', 'We think that’s', 'only fair.']}
      />
      <Faq m={[61, textTop('faq', 'm', 's3', 4652)]} d={[333, textTop('faq', 'd', 's3', 2612)]} />
    </Section>
  )
}

function WhatComesNext() {
  return (
    <Section id="s4" tone="charcoal" labelledBy="next-title">
      <Art name="anvil" alt="An anvil swinging on a rope smashes a soundbar on a workbench as a man ducks." />
      <Text
        as="h2"
        id="next-title"
        v="headline"
        sec="s4"
        m={[59, 5243]}
        d={[60, 2870]}
        lines={['We’re sorry', 'about your', 'soundbar.', 'We’re not', 'sorry about', 'what comes', 'next.']}
      />
      <Text as="div" v="link" sec="s4" m={[59, 5441]} d={[60, 3068]}>
        <a href={HOW_IT_WORKS}>
          <span className="line">See how the</span>
          <span className="line">
            system works <Arrow />
          </span>
        </a>
      </Text>
    </Section>
  )
}

/** Scroll target for "Why it sucks", sitting just above the next headline. */
function anchorStyle(m: number, d: number) {
  return { '--my': m - 82, '--dy': d - 82 } as React.CSSProperties
}
