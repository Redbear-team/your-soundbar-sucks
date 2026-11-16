import { useEffect } from 'react'

/** Selector for every piece that animates in. `.tone` gradients stay put. */
const PIECES = '.sec .t, .sec .art, .sec .place'
/** Gap between pieces that enter the viewport together, top to bottom. */
const STAGGER_MS = 90
const MAX_STAGGER_STEPS = 5

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
 * it enters the viewport. Pieces entering in the same frame are staggered top
 * to bottom, left to right.
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
          .forEach((entry, i) => {
            const node = entry.target as HTMLElement
            observer.unobserve(node)
            node.style.setProperty('--rd', `${Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS}ms`)
            node.classList.add('is-in')
          })
      },
      { rootMargin: '0px 0px -6% 0px' },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}
