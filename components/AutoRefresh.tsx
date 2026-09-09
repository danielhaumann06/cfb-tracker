'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Server Components only re-fetch when a new request comes in - this
// keeps standings, odds, rankings, and stat leaders current without the
// user having to manually reload the page.
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(interval)
  }, [router, intervalMs])

  return null
}
