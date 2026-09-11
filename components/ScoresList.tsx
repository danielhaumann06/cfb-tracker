'use client'

import { useMemo, useState } from 'react'
import type { ScoreboardWeek } from '@/lib/espn'
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

export function ScoresList({ initialScoreboard }: { initialScoreboard: ScoreboardWeek }) {
  const [mode, setMode] = useState<FilterMode>('top25')
  const [scoreboard, setScoreboard] = useState(initialScoreboard)
  const [loading, setLoading] = useState(false)

  const { weekNumber, weeks, games } = scoreboard
  const currentIndex = weeks.findIndex((w) => w.week === weekNumber)
  const currentLabel = weeks[currentIndex]?.label ?? `Week ${weekNumber}`

  async function goToWeek(week: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/scores?week=${week}`)
      if (res.ok) setScoreboard(await res.json())
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goToWeek(weeks[currentIndex - 1].week)}
          disabled={currentIndex <= 0}
          aria-label="Previous week"
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
        >
          &larr;
        </button>
        <span className="text-sm font-medium">{currentLabel}</span>
        <button
          type="button"
          onClick={() => goToWeek(weeks[currentIndex + 1].week)}
          disabled={currentIndex === -1 || currentIndex >= weeks.length - 1}
          aria-label="Next week"
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
        >
          &rarr;
        </button>
      </div>

      <div className="relative mt-3 inline-block">
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
        {loading ? (
          <p className="text-[var(--text-muted)]">Loading&hellip;</p>
        ) : sorted.length === 0 ? (
          <p className="text-[var(--text-muted)]">No games match this filter.</p>
        ) : (
          sorted.map((game) => <GameRow key={game.id} game={game} />)
        )}
      </div>
    </div>
  )
}
