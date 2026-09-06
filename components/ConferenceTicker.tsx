'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ConferenceGame } from '@/lib/espn'

function formatKickoff(dateIso: string): string {
  return new Date(dateIso).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TickerTeamScore({ team }: { team: ConferenceGame['home'] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {team.logo && (
        <Image src={team.logo} alt="" width={16} height={16} unoptimized />
      )}
      <span className="font-semibold">{team.abbreviation}</span>
      {team.score !== null && <span>{team.score}</span>}
    </span>
  )
}

function TickerItem({ game }: { game: ConferenceGame }) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-5 text-sm whitespace-nowrap">
      <TickerTeamScore team={game.away} />
      <span className="text-[var(--text-muted)]">@</span>
      <TickerTeamScore team={game.home} />
      <span className="text-xs text-[var(--text-muted)]">
        {game.state === 'pre' ? formatKickoff(game.date) : game.statusDetail}
      </span>
    </div>
  )
}

export function ConferenceTicker({
  groupId,
  initialGames,
}: {
  groupId: string
  initialGames: ConferenceGame[]
}) {
  const [games, setGames] = useState(initialGames)

  useEffect(() => {
    const hasLive = games.some((g) => g.state === 'in')
    if (!hasLive) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conference-scoreboard/${groupId}`)
        if (res.ok) setGames(await res.json())
      } catch {
        // stale scores are fine until the next tick
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [games, groupId])

  if (games.length === 0) return null

  const hasLive = games.some((g) => g.state === 'in')
  const durationSeconds = Math.max(games.length * 4, 12)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--gridline)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
        {hasLive && (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--seq-fill)]" />
        )}
        THIS WEEK
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
