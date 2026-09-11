import Image from 'next/image'
import Link from 'next/link'
import type { GameTeam } from '@/lib/espn'

function formatKickoff(dateIso: string): string {
  return new Date(dateIso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TeamScore({ team, slug }: { team: GameTeam; slug?: string }) {
  const content = (
    <span className="inline-flex items-center gap-1.5">
      {team.logo && (
        <Image src={team.logo} alt="" width={20} height={20} unoptimized />
      )}
      {team.rank != null && (
        <span className="text-[var(--text-muted)]">#{team.rank}</span>
      )}{' '}
      {team.nickname} {team.score}
    </span>
  )

  return slug ? (
    <Link href={`/team/${slug}`} className="hover:underline">
      {content}
    </Link>
  ) : (
    content
  )
}

export function GameScoreBar({
  away,
  home,
  awaySlug,
  homeSlug,
  statusDetail,
  live,
  disputedNote,
  date,
  network,
  venue,
}: {
  away: GameTeam
  home: GameTeam
  awaySlug?: string
  homeSlug?: string
  statusDetail: string
  live: boolean
  disputedNote?: string
  date?: string
  network?: string | null
  venue?: string | null
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {live && (
          <span className="rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-xs font-semibold text-white">
            LIVE
          </span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
          <TeamScore team={away} slug={awaySlug} />
          <span className="text-[var(--text-muted)]">&mdash;</span>
          <TeamScore team={home} slug={homeSlug} />
          {disputedNote && <span className="text-[var(--text-muted)]">*</span>}
        </div>
        <span className="text-sm text-[var(--text-muted)]">{statusDetail}</span>
      </div>
      {(date || network || venue) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
          {date && <span>{formatKickoff(date)}</span>}
          {network && <span>&middot; {network}</span>}
          {venue && <span>&middot; {venue}</span>}
        </div>
      )}
      {disputedNote && (
        <p className="text-xs text-[var(--text-muted)]">* {disputedNote}</p>
      )}
    </div>
  )
}
