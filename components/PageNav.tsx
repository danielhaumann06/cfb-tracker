'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function PageNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'

  return (
    <nav className="sticky top-0 z-20 flex items-center gap-1 border-b border-[var(--border-hairline)] bg-[var(--surface-1)]/90 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface-1)]/70">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="rounded-lg px-3 py-1.5 text-lg leading-none hover:bg-[var(--background)]"
      >
        &larr;
      </button>
      <button
        type="button"
        onClick={() => router.forward()}
        aria-label="Go forward"
        className="rounded-lg px-3 py-1.5 text-lg leading-none hover:bg-[var(--background)]"
      >
        &rarr;
      </button>
      {!isHome && (
        <Link
          href="/"
          aria-label="Go to dashboard"
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[var(--background)]"
        >
          Home
        </Link>
      )}
    </nav>
  )
}
