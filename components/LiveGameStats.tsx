'use client'

import { useEffect, useState } from 'react'
import type { GameBoxscore, GameTeam, GameState } from '@/lib/espn'
import { TeamTotalsTable } from './TeamTotalsTable'
import { PlayerStatsSection } from './PlayerStatsSection'

interface LiveStatus {
  home: GameTeam
  away: GameTeam
  state: GameState
  completed: boolean
  statusDetail: string
}

export function LiveGameStats({
  eventId,
  initialStatus,
  initialBoxscore,
}: {
  eventId: string
  initialStatus: LiveStatus
  initialBoxscore: GameBoxscore | null
}) {
  const [status, setStatus] = useState(initialStatus)
  const [boxscore, setBoxscore] = useState(initialBoxscore)

  useEffect(() => {
    if (status.completed) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/${eventId}/boxscore`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          setBoxscore(data.boxscore)
        }
      } catch {
        // stale data is fine until the next tick
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [eventId, status.completed])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
        {!status.completed && (
          <span className="rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-xs font-semibold text-white">
            LIVE
          </span>
        )}
        <span className="font-medium">
          {status.away.name} {status.away.score} — {status.home.name}{' '}
          {status.home.score}
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {status.statusDetail}
        </span>
      </div>

      {boxscore ? (
        <>
          <TeamTotalsTable teams={boxscore.teams} />
          <div className="grid gap-6 sm:grid-cols-2">
            {boxscore.players.map((team) => (
              <PlayerStatsSection key={team.teamId} team={team} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-[var(--text-muted)]">Stats not available yet.</p>
      )}
    </div>
  )
}
