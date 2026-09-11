import type { GameOdds } from '@/lib/espn'

function formatMoneyLine(value: number | null): string | null {
  if (value == null) return null
  return value > 0 ? `+${value}` : `${value}`
}

export function GameOddsPanel({ odds }: { odds: GameOdds | null }) {
  if (!odds || (!odds.details && odds.spread == null && odds.overUnder == null)) {
    return null
  }

  const homeML = formatMoneyLine(odds.homeMoneyLine)
  const awayML = formatMoneyLine(odds.awayMoneyLine)

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Odds</h2>
      {odds.provider && (
        <p className="text-sm text-[var(--text-muted)]">via {odds.provider}</p>
      )}
      <dl className="mt-3 space-y-1.5 text-sm">
        {odds.details && (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--text-muted)]">Spread</dt>
            <dd className="text-right font-medium">{odds.details}</dd>
          </div>
        )}
        {odds.overUnder != null && (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--text-muted)]">Over/Under</dt>
            <dd className="text-right font-medium">{odds.overUnder}</dd>
          </div>
        )}
        {(homeML || awayML) && (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--text-muted)]">Moneyline</dt>
            <dd className="text-right font-medium">
              {awayML ?? '—'} / {homeML ?? '—'}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
