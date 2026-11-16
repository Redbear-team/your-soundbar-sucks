import { Place } from './Canvas'

/**
 * The listening-angle overlay drawn over the couch photo in the PDF:
 * a wide 60° cone from the speakers and a narrow 21° cone from the soundbar.
 * Local coordinates are design units inside a 252 × 95 box.
 */
export function CouchCones() {
  return (
    <Place m={[39, 1659]} d={[300, 928]} className="cones" style={{ '--w': 252, '--h': 95 }}>
      <svg viewBox="0 0 252 95" aria-hidden="true">
        <polygon className="cone cone--wide" points="6,32 247,32 125,92" />
        <polygon className="cone cone--narrow" points="94,6 159,6 128,69" />
        <text x="127" y="42.5" textAnchor="middle">
          21°
        </text>
        <text x="94" y="60.5" textAnchor="middle">
          60°
        </text>
      </svg>
      <span className="visually-hidden">
        A soundbar covers about 21 degrees of your view. A stereo pair of speakers covers 60 degrees.
      </span>
    </Place>
  )
}
