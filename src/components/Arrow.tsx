type Props = { direction?: 'right' | 'down' }

/** The gold arrow that trails every link in the design. */
export function Arrow({ direction = 'right' }: Props) {
  return (
    <span className={`arrow arrow--${direction}`} aria-hidden="true">
      {direction === 'right' ? '→' : '↓'}
    </span>
  )
}

/**
 * Trailing mark for links that leave the page (cited studies). Drawn as SVG so
 * it looks the same whatever fonts load, and sized to the text around it.
 */
export function OutArrow() {
  return (
    <>
      <svg className="out-arrow" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" />
      </svg>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </>
  )
}
