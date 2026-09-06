'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PageNav } from './PageNav'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div
      className="flex flex-1 flex-col"
      style={
        isHome
          ? undefined
          : { paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }
      }
    >
      {children}
      {!isHome && <PageNav />}
    </div>
  )
}
