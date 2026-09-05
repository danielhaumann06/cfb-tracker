interface PlayoffOddsRow {
  slug: string
  name: string
  logo: string
  probMakePlayoffs: number | null
}

export function PlayoffOddsTracker({ teams }: { teams: PlayoffOddsRow[] }) {
  const rows = [...teams].sort(
    (a, b) => (b.probMakePlayoffs ?? -1) - (a.probMakePlayoffs ?? -1)
  )

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5">
      <h2 className="font-semibold">Playoff Odds</h2>
      <p className="text-sm text-[var(--text-muted)]">
        ESPN FPI chance of making the College Football Playoff
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const pct = row.probMakePlayoffs
          const widthPct = Math.max(pct ?? 0, 0)

          return (
            <li key={row.slug}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{row.name}</span>
                <span className="text-[var(--text-secondary)]">
                  {pct !== null ? `${pct.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div
                className="h-3 w-full rounded-full bg-[var(--seq-track)]"
                title={`${row.name}: ${pct !== null ? pct.toFixed(1) : '?'}% playoff chance`}
              >
                <div
                  className="h-3 rounded-full bg-[var(--seq-fill)]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
