'use client'

import { useMemo, useState } from 'react'
import type { ScoreboardGame } from '@/lib/espn'
import { FBS_CONFERENCES } from '@/lib/conferences'
import { GameRow } from './GameRow'

type FilterMode = 'top25' | 'all' | string

function DownChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
      <path
        d="M5 9l7 7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ScoresList({ games }: { games: ScoreboardGame[] }) {
  const [mode, setMode] = useState<FilterMode>('top25')

  const filtered = useMemo(() => {
    if (mode === 'top25') {
      return games.filter((g) => g.home.rank != null || g.away.rank != null)
    }
    if (mode === 'all') return games
    return games.filter(
      (g) => g.home.conferenceId === mode || g.away.conferenceId === mode
    )
  }, [games, mode])

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div>
      <div className="relative inline-block">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full appearance-none rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] py-1.5 pl-3 pr-9 text-sm font-medium text-[var(--text-secondary)]"
        >
          <option value="top25">Top 25</option>
          <option value="all">All FBS</option>
          {[...FBS_CONFERENCES]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((conf) => (
              <option key={conf.groupId} value={conf.groupId}>
                {conf.name}
              </option>
            ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[var(--text-muted)]">
          <DownChevronIcon />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {sorted.length === 0 ? (
          <p className="text-[var(--text-muted)]">No games match this filter.</p>
        ) : (
          sorted.map((game) => <GameRow key={game.id} game={game} />)
        )}
      </div>
    </div>
  )
}
