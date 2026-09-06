'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Dashboard' },
  { href: '/polls', label: 'Polls' },
  { href: '/conferences', label: 'Conferences' },
]

export function TopTabs() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-20 flex border-b border-[var(--border-hairline)] bg-[var(--background)]">
      {TABS.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 border-b-2 px-2 py-2.5 text-center text-sm font-medium transition-colors ${
              active
                ? 'border-[var(--seq-fill)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
