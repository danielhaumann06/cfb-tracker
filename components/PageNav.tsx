'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 11.5L12 4l8 7.5M6 9.5V20h5v-6h2v6h5V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TabButton({
  onClick,
  href,
  label,
  icon,
}: {
  onClick?: () => void
  href?: string
  label: string
  icon: React.ReactNode
}) {
  const className =
    'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[var(--text-secondary)] hover:text-[var(--foreground)]'

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {icon}
      <span className="text-[11px]">{label}</span>
    </button>
  )
}

export function PageNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border-hairline)] bg-[var(--surface-1)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface-1)]/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around px-2">
        <TabButton onClick={() => router.back()} label="Back" icon={<BackIcon />} />
        {!isHome && (
          <TabButton
            onClick={() => router.forward()}
            label="Forward"
            icon={<ForwardIcon />}
          />
        )}
        {!isHome && <TabButton href="/" label="Home" icon={<HomeIcon />} />}
      </div>
    </nav>
  )
}
