import { useEffect, useState, type CSSProperties } from 'react'
import { art } from '../art'
import { shards, type ShardSet } from '../shards'

type CssVars = CSSProperties & Record<`--${string}`, string | number>

/**
 * The soundbar fragments cut out of the hero photo (scripts/design/shards.py),
 * laid over the plate in exactly their photographed places. With the reveal on,
 * they burst out of the axe strike and slow to a stop where the photo froze them.
 * Without it they simply sit there, so the hero looks like the original photo.
 */
export function Shards() {
  const [ready, setReady] = useState(false)

  // Hold the burst until the atlas for this screen has loaded, so no piece
  // flies in invisible and pops up later.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)').matches
    const set = desktop ? shards.d : shards.m
    const src = desktop && set.atlas2x && window.devicePixelRatio > 1.25 ? set.atlas2x : set.atlas
    const img = new Image()
    let alive = true
    const done = () => alive && setReady(true)
    img.onload = done
    img.onerror = done
    img.src = src
    const timer = window.setTimeout(done, 2500)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <Layer set={shards.m} layout="m" ready={ready} />
      <Layer set={shards.d} layout="d" ready={ready} />
    </>
  )
}

function Layer({ set, layout, ready }: { set: ShardSet; layout: 'm' | 'd'; ready: boolean }) {
  const box = art['hero-axe'][layout]
  const style: CssVars = {
    '--mx': box.x,
    '--my': box.y,
    '--mw': box.w,
    '--mhh': box.h,
    '--dx': box.x,
    '--dy': box.y,
    '--dw': box.w,
    '--dhh': box.h,
    '--atlas': set.atlas2x
      ? `image-set(url(${set.atlas}) 1x, url(${set.atlas2x}) 2x)`
      : `url(${set.atlas})`,
  }
  const pct = (v: number, of: number) => `${(v / of) * 100}%`
  return (
    // `ready` is a data attribute, not a class: the reveal adds `is-in` to the
    // class list, and a className change from React would wipe it.
    <div className={`shards only-${layout}`} data-ready={ready || undefined} style={style} aria-hidden="true">
      {set.shards.map(([x, y, w, h, ax, ay, dx, dy, spin, delay], i) => (
        <span
          key={i}
          className="shard"
          style={
            {
              left: pct(x, set.w),
              top: pct(y, set.h),
              width: pct(w, set.w),
              height: pct(h, set.h),
              backgroundSize: `${pct(set.atlasW, w)} ${pct(set.atlasH, h)}`,
              backgroundPosition: `${pct(ax, set.atlasW - w)} ${pct(ay, set.atlasH - h)}`,
              '--sx': dx,
              '--sy': dy,
              '--spin': `${spin}deg`,
              '--delay': `${delay}s`,
            } as CssVars
          }
        />
      ))}
    </div>
  )
}
