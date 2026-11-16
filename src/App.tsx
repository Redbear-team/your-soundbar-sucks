import { useCallback, useEffect, useState } from 'react'
import { Arrow } from './components/Arrow'
import { CouchDiagram } from './components/CouchDiagram'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { MenuOverlay } from './components/MenuOverlay'
import { Reveal } from './components/Reveal'
import { FIND_A_DEALER, HOW_IT_WORKS } from './links'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
  }, [menuOpen])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header menuOpen={menuOpen} onMenuClick={openMenu} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />

      <main id="main">
        <Hero />
        <NotGreat />
        <LousyImpression />
        <BlindTests />
        <Introducing />
        <Questions />
        <WhatComesNext />
      </main>

      <Footer menuOpen={menuOpen} onMenuClick={openMenu} />
    </>
  )
}

function Hero() {
  return (
    <section className="section section--rust hero" aria-labelledby="hero-title">
      <div className="page-column hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">
            Sorry. Somebody
            <br /> needs to say it.
          </p>
          <h1 id="hero-title" className="display">
            Your soundbar suuucks.
          </h1>
          <div className="hero__links">
            <a className="text-link" href="#why-it-sucks">
              Why it sucks <Arrow />
            </a>
            <a className="text-link" href={FIND_A_DEALER}>
              Find a dealer <Arrow />
            </a>
          </div>
        </div>
        <div className="hero__media">
          <img
            src="/images/hero-axe.webp"
            width={1600}
            height={1600}
            fetchPriority="high"
            alt="A man in safety glasses smashing a soundbar in half with an axe."
          />
        </div>
      </div>
    </section>
  )
}

function NotGreat() {
  return (
    <section id="why-it-sucks" className="section section--rust split split--media-left not-great" aria-labelledby="not-great-title">
      <div className="page-column split__grid">
        <Reveal className="split__copy">
          <h2 id="not-great-title" className="headline">
            You bought a soundbar for the sound but let’s be honest, it’s not great.
          </h2>
          <p className="body">
            One box, one cord, done before kickoff. Your friend’s real speaker setup sounded better, but it came with a
            lost weekend, a ladder, and wire stapled along the baseboard. So you took the box. Most people did. Turns
            out waiting was the smart move. Because, in the end, a soundbar is never really chosen for how it sounds.
          </p>
        </Reveal>
        <div className="split__media not-great__media">
          <img
            src="/images/burning-bar.webp"
            width={1400}
            height={1867}
            loading="lazy"
            decoding="async"
            alt="A soundbar on fire on a workbench, a woman peeking out from behind it."
          />
        </div>
      </div>
    </section>
  )
}

function LousyImpression() {
  return (
    <section className="section section--rust split lousy" aria-labelledby="lousy-title">
      <div className="page-column split__grid">
        <Reveal className="split__copy">
          <h2 id="lousy-title" className="headline">
            Your soundbar is doing a lousy impression of speakers.
          </h2>
          <div className="lousy__media lousy__media--mobile">
            <CouchDiagram />
          </div>
          <p className="subhead">You bought a soundbar because it was easy install, not because of the sound.</p>
          <p className="body body--small">
            Your soundbar can only cover 21 degrees. A two speaker set up for stereo covers 60 degrees. Your ears hear
            the space between them, and a center speaker under the screen holds the voices. A soundbar crams all of
            that into a box a few inches tall. To sound wider than the box, it leans on processing that tricks your
            ears. Either way, the soundbar is just an estimate of where the sound should be.
          </p>
        </Reveal>
        <div className="split__media lousy__media lousy__media--desktop">
          <CouchDiagram />
        </div>
      </div>
    </section>
  )
}

function BlindTests() {
  return (
    <section className="section section--charcoal blind" aria-labelledby="blind-title">
      <div className="page-column">
        <Reveal as="h2" className="headline blind__title">
          <span id="blind-title">
            Don’t take our word for it. Blind testers keep picking speakers over virtual sound.
          </span>
        </Reveal>

        <div className="blind__grid">
          <Reveal className="stat stat--a">
            <h3 className="stat__title">0 for 2</h3>
            <p className="body body--small">
              BBC R&amp;D played the same clips through two soundbars and a plain pair of stereo speakers. Averaged
              across the test, listeners preferred the stereo pair to both soundbars. Words on the soundbar side of the
              results were tinny, muffled, and flat.
            </p>
            <p className="stat__source">BBC R&amp;D, 2016</p>
          </Reveal>

          <Reveal className="stat stat--b" delay={80}>
            <h3 className="stat__title">6 for 6</h3>
            <p className="body body--small">
              Nokia Research Center pitted six virtual sound systems against real speakers. Real speakers beat all six.
              Even listeners from the companies that built the virtual systems preferred real speakers as well.
            </p>
            <p className="stat__source">AES Convention, 1999</p>
          </Reveal>

          <Reveal className="stat stat--c" delay={160}>
            <h3 className="stat__title">
              The bar is
              <br /> breaking up.
            </h3>
            <p className="body body--small">
              Now soundbar makers split the bar into separate boxes, trying for a wider sound. That’s halfway to
              speakers.
            </p>
            <p className="stat__source">The Soundbar Aisle, 2026</p>
          </Reveal>

          <p className="footnote blind__footnote">
            Based on a soundbar used on its own, 45 inches wide, at a 10-foot listening distance. Stereo placement is
            the 60° standard (ITU-R BS.775). The studies tested specific soundbars and virtual surround systems, not
            AUDIO Cu.
          </p>

          <div className="blind__media">
            <img
              src="/images/blindfold.webp"
              width={1019}
              height={780}
              loading="lazy"
              decoding="async"
              alt="A blindfolded man cupping his ear, listening closely."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Introducing() {
  return (
    <section className="section section--rust split intro" aria-labelledby="intro-title">
      <div className="page-column split__grid">
        <Reveal className="split__copy">
          <h2 id="intro-title" className="headline">
            Introducing AUDIO&nbsp;Cu. Dolby Atmos<sup>®</sup> Certified.
          </h2>
          <div className="intro__media intro__media--mobile">
            <ProductImage />
          </div>
          <p className="subhead">
            One transmitter.
            <br /> One receiver per speaker.
            <br /> That’s the whole system,
            <br /> start to finish, in one sitting.
          </p>
          <p className="body body--small">
            Got good speakers in the garage or attic? Bring them back inside. AUDIO Cu sends sound through the
            electrical wiring already in your walls. A transmitter connects to your TV. A receiver sits beside each
            speaker and plugs into the nearest outlet. Left, center, right. Real speakers, right where they belong. No
            drilling. No cable runs through your walls. No big box of wires.
          </p>
          <a className="text-link" href={HOW_IT_WORKS}>
            See how the
            <br /> system works <Arrow />
          </a>
        </Reveal>
        <div className="split__media intro__media intro__media--desktop">
          <ProductImage />
        </div>
      </div>
    </section>
  )
}

function ProductImage() {
  return (
    <img
      src="/images/product.webp"
      width={1400}
      height={1212}
      loading="lazy"
      decoding="async"
      alt="The AUDIO Cu transmitter and receiver, two compact black units."
    />
  )
}

function Questions() {
  return (
    <section className="section section--rust split split--media-left questions" aria-labelledby="questions-title">
      <div className="page-column split__grid">
        <div className="split__media questions__media">
          <img
            src="/images/shredder.webp"
            width={1600}
            height={1600}
            loading="lazy"
            decoding="async"
            alt="A woman in ear defenders feeding a soundbar into a wood chipper, debris flying."
          />
        </div>
        <Reveal className="split__copy">
          <h2 id="questions-title" className="headline">
            You have a few questions. We think that’s only fair.
          </h2>
          <Faq />
        </Reveal>
      </div>
    </section>
  )
}

function WhatComesNext() {
  return (
    <section className="section section--charcoal split next" aria-labelledby="next-title">
      <div className="page-column split__grid">
        <Reveal className="split__copy">
          <h2 id="next-title" className="headline">
            We’re sorry about your soundbar. We’re not sorry about what comes next.
          </h2>
          <a className="text-link" href={HOW_IT_WORKS}>
            See how the
            <br /> system works <Arrow />
          </a>
        </Reveal>
        <div className="split__media next__media">
          <img
            src="/images/anvil.webp"
            width={1400}
            height={2018}
            loading="lazy"
            decoding="async"
            alt="An anvil swinging on a rope smashes a soundbar on a workbench as a man ducks."
          />
        </div>
      </div>
    </section>
  )
}
