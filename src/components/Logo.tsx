import { MAIN_SITE } from '../links'

/** AUDIO Cu lockup, same asset and sizes as www.audiocu.com. */
export function Logo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return (
    <a href={`${MAIN_SITE}/`} className="shrink-0" aria-label="AUDIO Cu home">
      <img
        src="/brand/logo-480.webp"
        srcSet="/brand/logo-480.webp 480w, /brand/logo-768.webp 768w, /brand/logo-1112.webp 1112w"
        sizes="200px"
        width={1112}
        height={260}
        alt="AUDIO Cu"
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </a>
  )
}
