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

function TeamBlock({
  team,
  slug,
  align,
}: {
  team: GameTeam
  slug: string
  align: 'left' | 'right'
}) {
  const content = (
    <div
      className={`flex min-w-0 items-center gap-3 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {team.logo && (
        <Image src={team.logo} alt="" width={48} height={48} unoptimized className="shrink-0" />
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-[var(--text-secondary)]">
          {team.rank != null && `#${team.rank} `}
          {team.nickname}
        </div>
        <div className="text-3xl font-bold">{team.score ?? '—'}</div>
      </div>
    </div>
  )

  return slug ? (
    <Link href={`/team/${slug}`} className="min-w-0 rounded-lg hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  )
}

export function GameCastHeader({
  away,
  home,
  awaySlug,
  homeSlug,
  awayColor,
  homeColor,
  statusDetail,
  live,
  date,
  network,
  venue,
}: {
  away: GameTeam
  home: GameTeam
  awaySlug: string
  homeSlug: string
  awayColor: string
  homeColor: string
  statusDetail: string
  live: boolean
  date?: string
  network?: string | null
  venue?: string | null
}) {
  const from = `#${awayColor || '6b7280'}`
  const to = `#${homeColor || '6b7280'}`

  return (
    <div
      className="overflow-hidden rounded-xl p-5"
      style={{ background: `linear-gradient(to right, ${from}26, ${to}26)` }}
    >
      <div className="flex items-center justify-between gap-3">
        <TeamBlock team={away} slug={awaySlug} align="left" />
        <div className="shrink-0 px-2 text-center text-xs text-[var(--text-muted)]">
          {live && (
            <span className="mb-1 inline-block rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-[10px] font-semibold text-white">
              LIVE
            </span>
          )}
          <div>{statusDetail}</div>
        </div>
        <TeamBlock team={home} slug={homeSlug} align="right" />
      </div>

      {(date || network || venue) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-[var(--text-muted)]">
          {date && <span>{formatKickoff(date)}</span>}
          {network && <span>&middot; {network}</span>}
          {venue && <span>&middot; {venue}</span>}
        </div>
      )}
    </div>
  )
}
