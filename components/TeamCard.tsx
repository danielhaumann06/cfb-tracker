import Link from 'next/link'
import Image from 'next/image'
import type { TeamSummary, GameSummary, GameOdds, FpiSummary } from '@/lib/espn'

function formatKickoff(dateIso: string): string {
  return new Date(dateIso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TeamCard({
  slug,
  team,
  next,
  odds,
  fpi,
}: {
  slug: string
  team: TeamSummary
  next: GameSummary | null
  odds: GameOdds | null
  fpi: FpiSummary | null
}) {
  const isHome = next ? next.home.id === team.id : false
  const opponent = next ? (isHome ? next.away : next.home) : null
  const self = next ? (isHome ? next.home : next.away) : null

  return (
    <Link
      href={`/team/${slug}`}
      className="block rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--seq-fill)] hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-center gap-3">
        {team.logo && (
          <Image
            src={team.logo}
            alt=""
            width={44}
            height={44}
            className="shrink-0"
            unoptimized
          />
        )}
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{team.name}</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {team.record} &middot; {team.standingSummary}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        {next ? (
          <>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-muted)]">
                {next.state === 'in' ? 'Live' : 'Next'}
              </dt>
              <dd className="text-right">
                {isHome ? 'vs' : 'at'} {opponent?.name ?? 'TBD'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-muted)]">
                {next.state === 'pre'
                  ? 'Kickoff'
                  : next.state === 'in'
                    ? 'Status'
                    : 'Result'}
              </dt>
              <dd className="text-right">
                {next.state === 'pre'
                  ? formatKickoff(next.date)
                  : next.statusDetail}
              </dd>
            </div>
            {next.state === 'in' && self && opponent && (
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-muted)]">Score</dt>
                <dd className="text-right font-medium">
                  {self.abbreviation} {self.score ?? 0}
                  <span className="text-[var(--text-muted)]"> &ndash; </span>
                  {opponent.abbreviation} {opponent.score ?? 0}
                </dd>
              </div>
            )}
            {odds?.details && next.state === 'pre' && (
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-muted)]">Spread</dt>
                <dd className="text-right">{odds.details}</dd>
              </div>
            )}
          </>
        ) : (
          <p className="text-[var(--text-muted)]">No games scheduled</p>
        )}

        {fpi && (
          <div className="flex justify-between gap-2 pt-1.5">
            <dt className="text-[var(--text-muted)]">FPI</dt>
            <dd className="text-right">
              {fpi.fpi?.toFixed(1) ?? '—'}
              {fpi.fpiRank && (
                <span className="text-[var(--text-muted)]"> (#{fpi.fpiRank})</span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </Link>
  )
}
