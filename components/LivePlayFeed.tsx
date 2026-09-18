import type { GamePlay } from '@/lib/espn'

export function LivePlayFeed({ plays }: { plays: GamePlay[] }) {
  if (plays.length === 0) return null

  return (
    <section className="rounded-xl bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Plays</h2>
      <ul className="mt-3 max-h-[130px] divide-y divide-[var(--gridline)] overflow-y-auto">
        {plays.map((play) => (
          <li key={play.id} className="flex items-start gap-3 py-2.5 text-sm">
            <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">
              Q{play.quarter} {play.clock}
            </span>
            <span className={play.scoringPlay ? 'font-medium text-[var(--seq-fill)]' : ''}>
              {play.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
