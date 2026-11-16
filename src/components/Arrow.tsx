type Props = { direction?: 'right' | 'down' }

/** The gold arrow that trails every link in the design. */
export function Arrow({ direction = 'right' }: Props) {
  return (
    <span className={`arrow arrow--${direction}`} aria-hidden="true">
      {direction === 'right' ? '→' : '↓'}
    </span>
  )
}
