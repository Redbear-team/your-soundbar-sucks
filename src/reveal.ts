import { useEffect } from 'react'

/** Selector for every piece that animates in. `.tone` gradients stay put. */
const PIECES = '.sec .t, .sec .art, .sec .place'
/** Gap between pieces that enter the viewport together, top to bottom. */
const STAGGER_MS = 90
const MAX_STAGGER_STEPS = 5
/**
 * How far up from the bottom of the screen a piece has to come before it
 * animates in. Waiting until it's well into view makes the entrance land where
 * the reader is looking, rather than at the fold.
 */
const TRIGGER_LINE = '-30%'

/**
 * Turns reveal styling on. Call before the first render so nothing flashes in
 * and then hides. With reduced motion, or no IntersectionObserver, everything
 * just stays visible.
 */
export function enableReveal() {
  if (typeof IntersectionObserver === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.documentElement.classList.add('reveal-on')
}

/**
 * Scroll reveal, after www.audiocu.com: each piece gets `is-in` the first time
 * it rises past the trigger line. Pieces arriving in the same frame are
 * staggered top to bottom, left to right. Pieces so close to the end of the
 * page that they can never reach the line come in once the page is scrolled
 * to the bottom. Anything already on screen when the page loads comes in at
 * once.
 */
export function useReveal() {
  useEffect(() => {
    if (!document.documentElement.classList.contains('reveal-on')) return
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(PIECES))
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left,
          )
          .forEach((entry, i) => reveal(entry.target as HTMLElement, i))
      },
      { rootMargin: `0px 0px ${TRIGGER_LINE} 0px` },
    )
    function reveal(node: HTMLElement, order: number) {
      observer.unobserve(node)
      node.style.setProperty('--rd', `${Math.min(order, MAX_STAGGER_STEPS) * STAGGER_MS}ms`)
      node.classList.add('is-in')
    }
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (!atBottom) return
      nodes
        .filter((node) => !node.classList.contains('is-in') && node.getBoundingClientRect().top < window.innerHeight)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((node, i) => reveal(node, i))
    }
    // Whatever is already on screen at load comes in straight away, so the
    // hero is never left waiting for a scroll.
    nodes
      .filter((node) => {
        const box = node.getBoundingClientRect()
        return node.offsetParent !== null && box.top < window.innerHeight && box.bottom > 0
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      .forEach((node, i) => reveal(node, i))
    nodes.filter((node) => !node.classList.contains('is-in')).forEach((node) => observer.observe(node))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
