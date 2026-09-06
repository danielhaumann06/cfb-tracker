import Link from 'next/link'
import type { TeamSummary, FpiSummary } from '@/lib/espn'

function StatTile({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  const content = (
    <>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </>
  )
  const className =
    'rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-3 shadow-[var(--shadow-card)]'

  if (href) {
    return (
      <Link href={href} className={`${className} block hover:border-[var(--seq-fill)]`}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

function conferenceRank(standingSummary: string): string {
  return standingSummary.match(/^(\d+\w*)/)?.[1] ?? standingSummary
}

export function StatsSummary({
  team,
  fpi,
  nationalRank,
}: {
  team: TeamSummary
  fpi: FpiSummary | null
  nationalRank: number | null
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        label="National rank"
        value={nationalRank != null ? `#${nationalRank}` : 'NR'}
        href="/rankings/national"
      />
      <StatTile
        label="Conference rank"
        value={
          team.standingSummary ? conferenceRank(team.standingSummary) : '—'
        }
        href={
          team.conferenceId
            ? `/rankings/conference/${team.conferenceId}`
            : undefined
        }
      />
      <StatTile label="Points/game" value={team.pointsForPerGame.toFixed(1)} />
      <StatTile
        label="Points allowed/game"
        value={team.pointsAgainstPerGame.toFixed(1)}
      />
      <StatTile label="Streak" value={`${team.streak}`} />
      <StatTile
        label="FPI"
        value={fpi?.fpi != null ? fpi.fpi.toFixed(1) : '—'}
      />
      <StatTile
        label="FPI rank"
        value={fpi?.fpiRank != null ? `#${fpi.fpiRank}` : '—'}
      />
      <StatTile
        label="Projected record"
        value={
          fpi?.projectedWins != null && fpi?.projectedLosses != null
            ? `${fpi.projectedWins.toFixed(1)}-${fpi.projectedLosses.toFixed(1)}`
            : '—'
        }
      />
      <StatTile
        label="SOS rank (remaining)"
        value={
          fpi?.strengthOfScheduleRank != null
            ? `#${fpi.strengthOfScheduleRank}`
            : '—'
        }
      />
      <StatTile
        label="Playoff chance"
        value={
          fpi?.probMakePlayoffs != null
            ? `${fpi.probMakePlayoffs.toFixed(1)}%`
            : '—'
        }
      />
    </div>
  )
}
