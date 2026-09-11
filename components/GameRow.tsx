import Image from 'next/image'
import Link from 'next/link'
import type { ScoreboardGame, ScoreboardTeam } from '@/lib/espn'

function formatKickoff(dateIso: string): string {
  return new Date(dateIso).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TeamLine({ team }: { team: ScoreboardTeam }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {team.logo && <Image src={team.logo} alt="" width={22} height={22} unoptimized />}
      {team.rank != null && (
        <span className="text-xs text-[var(--text-muted)]">#{team.rank}</span>
      )}
      <span className="truncate text-sm font-medium">{team.name}</span>
      {team.record && (
        <span className="shrink-0 text-xs text-[var(--text-muted)]">{team.record}</span>
      )}
      {team.score != null && (
        <span className="ml-auto shrink-0 text-sm font-semibold">{team.score}</span>
      )}
    </div>
  )
}

export function GameRow({ game }: { game: ScoreboardGame }) {
  return (
    <Link
      href={`/scores/${game.id}`}
      className="block space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--seq-fill)] hover:shadow-[var(--shadow-card-hover)]"
    >
      <TeamLine team={game.away} />
      <TeamLine team={game.home} />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
        <span>{game.state === 'pre' ? formatKickoff(game.date) : game.statusDetail}</span>
        {game.network && <span>&middot; {game.network}</span>}
        {game.venue && <span>&middot; {game.venue}</span>}
      </div>
    </Link>
  )
}
