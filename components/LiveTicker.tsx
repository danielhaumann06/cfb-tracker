'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { LiveTickerGame } from '@/lib/espn'

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
      <span className="font-semibold">{team.abbreviation}</span>
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
      </span>
    </div>
  )
}

export function LiveTicker({
  initialGames,
}: {
  initialGames: LiveTickerGame[]
}) {
  const [games, setGames] = useState(initialGames)

  useEffect(() => {
    // Keep polling even when there are currently no live games - a new
    // game going live shouldn't require a full page reload to show up.
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/live-ticker')
        if (res.ok) setGames(await res.json())
      } catch {
        // stale scores are fine until the next tick
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  if (games.length === 0) return null

  const durationSeconds = Math.max(games.length * 4, 12)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--gridline)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--seq-fill)]" />
        LIVE
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
