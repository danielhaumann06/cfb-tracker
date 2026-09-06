import Link from 'next/link'
import Image from 'next/image'

interface ConferenceOddsRow {
  id: string
  slug?: string
  name: string
  logo: string
  probWinConference: number | null
}

export function ConferenceOddsTracker({
  conferenceName,
  teams,
}: {
  conferenceName: string
  teams: ConferenceOddsRow[]
}) {
  const rows = [...teams].sort(
    (a, b) => (b.probWinConference ?? -1) - (a.probWinConference ?? -1)
  )

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Odds to Win the {conferenceName}</h2>
      <p className="text-sm text-[var(--text-muted)]">
        ESPN FPI chance of winning the conference
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const pct = row.probWinConference
          const widthPct = Math.max(pct ?? 0, 0)
          const label = (
            <>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                  {row.logo && (
                    <Image
                      src={row.logo}
                      alt=""
                      width={18}
                      height={18}
                      unoptimized
                      className="shrink-0"
                    />
                  )}
                  <span className="truncate">{row.name}</span>
                </span>
                <span className="shrink-0 text-[var(--text-secondary)]">
                  {pct !== null ? `${pct.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div
                className="h-3 w-full rounded-full bg-[var(--seq-track)]"
                title={`${row.name}: ${pct !== null ? pct.toFixed(1) : '?'}% chance to win the conference`}
              >
                <div
                  className="h-3 rounded-full bg-[var(--seq-fill)]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </>
          )

          return (
            <li key={row.id}>
              {row.slug ? (
                <Link href={`/team/${row.slug}`} className="block">
                  {label}
                </Link>
              ) : (
                label
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
