'use client'

import { useMemo, useState } from 'react'
import type { ScoreboardGame } from '@/lib/espn'
import { FBS_CONFERENCES } from '@/lib/conferences'
import { GameRow } from './GameRow'

type FilterMode = 'top25' | 'all' | string

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
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('top25')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            mode === 'top25'
              ? 'bg-[var(--seq-fill)] text-white'
              : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
          }`}
        >
          Top 25
        </button>
        <select
          value={mode === 'top25' ? '' : mode}
          onChange={(e) => e.target.value && setMode(e.target.value)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            mode !== 'top25'
              ? 'border-[var(--seq-fill)] bg-[var(--seq-fill)] text-white'
              : 'border-[var(--border-hairline)] bg-[var(--surface-1)] text-[var(--text-secondary)]'
          }`}
        >
          <option value="" disabled>
            FBS / conference…
          </option>
          <option value="all">All FBS</option>
          {[...FBS_CONFERENCES]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((conf) => (
              <option key={conf.groupId} value={conf.groupId}>
                {conf.name}
              </option>
            ))}
        </select>
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
