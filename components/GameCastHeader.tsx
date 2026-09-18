import Image from 'next/image'
import Link from 'next/link'
import type { GameTeam } from '@/lib/espn'
import { formatKickoff } from '@/lib/formatKickoff'

function TimeoutDots({ remaining, align }: { remaining: number; align: 'left' | 'right' }) {
  return (
    <div className={`mt-1 flex gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < remaining ? 'bg-[var(--seq-fill)]' : 'bg-[var(--gridline)]'
          }`}
        />
      ))}
    </div>
  )
}

function TeamBlock({
  team,
  slug,
  align,
  timeouts,
}: {
  team: GameTeam
  slug: string
  align: 'left' | 'right'
  timeouts: number | null
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
        {timeouts != null && <TimeoutDots remaining={timeouts} align={align} />}
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
  homeTimeouts,
  awayTimeouts,
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
  homeTimeouts?: number | null
  awayTimeouts?: number | null
}) {
  const from = `#${awayColor || '6b7280'}`
  const to = `#${homeColor || '6b7280'}`

  return (
    <div
      className="overflow-hidden rounded-xl p-5"
      style={{ background: `linear-gradient(to right, ${from}26, ${to}26)` }}
    >
      <div className="flex items-center justify-between gap-3">
        <TeamBlock team={away} slug={awaySlug} align="left" timeouts={live ? (awayTimeouts ?? null) : null} />
        <div className="shrink-0 px-2 text-center text-xs text-[var(--text-muted)]">
          {live && (
            <span className="mb-1 inline-block rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-[10px] font-semibold text-white">
              LIVE
            </span>
          )}
          <div>{statusDetail}</div>
        </div>
        <TeamBlock team={home} slug={homeSlug} align="right" timeouts={live ? (homeTimeouts ?? null) : null} />
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
