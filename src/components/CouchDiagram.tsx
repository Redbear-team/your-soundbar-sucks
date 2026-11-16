/**
 * Couch photo with the listening-angle cones from the design:
 * the soundbar covers ~21°, a stereo pair covers 60°.
 * Coordinates are percentages of the cropped photo (public/images/couch.webp).
 */
export function CouchDiagram() {
  // Listener's head, soundbar edges and speaker fronts, measured on the crop.
  const head = { x: 51.6, y: 56 }
  const bar = { l: 47.2, r: 54.8, y: 43.5 }
  const spk = { l: 24.5, r: 76.5, y: 46 }

  return (
    <figure className="couch">
      <img
        src="/images/couch.webp"
        width={1600}
        height={1200}
        loading="lazy"
        decoding="async"
        alt="A man on a couch facing a TV with a soundbar, flanked by two tower speakers."
      />
      <svg className="couch__cones" viewBox="0 0 100 75" preserveAspectRatio="none" aria-hidden="true">
        <polygon
          className="cone cone--wide"
          points={`${spk.l},${spk.y * 0.75} ${spk.r},${spk.y * 0.75} ${head.x},${head.y * 0.75}`}
        />
        <polygon
          className="cone cone--narrow"
          points={`${bar.l},${bar.y * 0.75} ${bar.r},${bar.y * 0.75} ${head.x},${head.y * 0.75}`}
        />
      </svg>
      <span className="couch__label couch__label--narrow" style={{ left: `${head.x}%`, top: '45.5%' }}>
        21°
      </span>
      <span className="couch__label couch__label--wide" style={{ left: '41%', top: '49%' }}>
        60°
      </span>
      <figcaption className="visually-hidden">
        A soundbar covers about 21 degrees of your view. A stereo pair of speakers covers 60 degrees.
      </figcaption>
    </figure>
  )
}
