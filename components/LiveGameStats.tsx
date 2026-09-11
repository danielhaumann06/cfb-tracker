'use client'

import { useEffect, useState } from 'react'
import type { GameBoxscore, GameTeam, GameState } from '@/lib/espn'
import { TeamTotalsTable } from './TeamTotalsTable'
import { PlayerStatsSection } from './PlayerStatsSection'
import { GameScoreBar } from './GameScoreBar'

interface LiveStatus {
  home: GameTeam
  away: GameTeam
  state: GameState
  completed: boolean
  statusDetail: string
  date?: string
  network?: string | null
  venue?: string | null
}

export function LiveGameStats({
  eventId,
  initialStatus,
  initialBoxscore,
  awaySlug,
  homeSlug,
}: {
  eventId: string
  initialStatus: LiveStatus
  initialBoxscore: GameBoxscore | null
  awaySlug?: string
  homeSlug?: string
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
      <GameScoreBar
        away={status.away}
        home={status.home}
        awaySlug={awaySlug}
        homeSlug={homeSlug}
        statusDetail={status.statusDetail}
        live={!status.completed}
        date={status.date}
        network={status.network}
        venue={status.venue}
      />

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
