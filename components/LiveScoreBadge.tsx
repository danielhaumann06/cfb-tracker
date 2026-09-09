'use client'

import { useEffect, useState } from 'react'
import type { GameTeam } from '@/lib/espn'

interface LiveStatus {
  home: GameTeam
  away: GameTeam
  state: string
  completed: boolean
  statusDetail: string
}

export function LiveScoreBadge({
  eventId,
  initial,
}: {
  eventId: string
  initial: LiveStatus
}) {
  const [status, setStatus] = useState(initial)

  useEffect(() => {
    if (status.completed) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/${eventId}`)
        if (res.ok) setStatus(await res.json())
      } catch {
        // stale data is fine until the next tick
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [eventId, status.completed])

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)]">
      <span className="rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-xs font-semibold text-white">
        LIVE
      </span>
      <span className="font-medium">
        {status.away.rank != null && `#${status.away.rank} `}
        {status.away.name} {status.away.score} —{' '}
        {status.home.rank != null && `#${status.home.rank} `}
        {status.home.name} {status.home.score}
      </span>
      <span className="text-sm text-[var(--text-muted)]">
        {status.statusDetail}
      </span>
    </div>
  )
}
