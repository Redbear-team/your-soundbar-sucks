import { MAIN_SITE } from '../links'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href={MAIN_SITE} className={`logo ${className}`} aria-label="AUDIO Cu home">
      <img src="/brand/logo.webp" width={1112} height={260} alt="AUDIO Cu. Plug In. Sound Out." />
    </a>
  )
}
