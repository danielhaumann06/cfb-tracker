'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { LiveTickerGame } from '@/lib/espn'

type TickerMode = 'live' | 'top25'

function TickerTeamScore({
  team,
}: {
  team: LiveTickerGame['home']
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {team.logo && (
        <Image src={team.logo} alt="" width={16} height={16} unoptimized />
      )}
      <span className="font-semibold">
        {team.rank != null && (
          <span className="text-[var(--text-muted)]">#{team.rank} </span>
        )}
        {team.abbreviation}
      </span>
      <span>{team.score ?? 0}</span>
    </span>
  )
}

function TickerItem({ game }: { game: LiveTickerGame }) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-5 text-sm whitespace-nowrap">
      <TickerTeamScore team={game.away} />
      <span className="text-[var(--text-muted)]">@</span>
      <TickerTeamScore team={game.home} />
      <span className="text-xs text-[var(--text-muted)]">
        {game.statusDetail}
        {game.network && ` · ${game.network}`}
      </span>
    </div>
  )
}

export function LiveTicker({
  initialMode,
  initialGames,
}: {
  initialMode: TickerMode
  initialGames: LiveTickerGame[]
}) {
  const [mode, setMode] = useState<TickerMode>(initialMode)
  const [games, setGames] = useState(initialGames)

  useEffect(() => {
    // Keep polling regardless of mode - a new game going live should
    // switch back from the Top 25 recap without a full page reload, and
    // the last live game ending should switch the other way.
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/live-ticker')
        if (res.ok) {
          const data = await res.json()
          setMode(data.mode)
          setGames(data.games)
        }
      } catch {
        // stale scores are fine until the next tick
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  if (games.length === 0) return null

  const isLive = mode === 'live'
  const durationSeconds = Math.max(games.length * 4, 12)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--gridline)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
        {isLive && (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--seq-fill)]" />
        )}
        {isLive ? 'LIVE' : 'TOP 25 SCORES'}
      </div>
      <div className="overflow-hidden py-3">
        <div
          className="animate-ticker flex w-max"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {[...games, ...games].map((game, i) => (
            <TickerItem key={`${game.id}-${i}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}
