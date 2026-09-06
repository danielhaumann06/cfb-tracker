import { RankingList } from '@/components/RankingList'
import { PollRaceChart } from '@/components/PollRaceChart'
import type { PollTimeline } from '@/lib/espn'

export function PollCard({
  title,
  timeline,
}: {
  title: string
  timeline: PollTimeline
}) {
  if (timeline.weekLabels.length === 0) return null

  const lastWeekIndex = timeline.weekLabels.length - 1

  return (
    <section className="mt-6">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <RankingList
        entries={timeline.teams.map((t) => ({
          rank: timeline.ranks[t.id]?.[lastWeekIndex] ?? 0,
          id: t.id,
          name: t.name,
          logo: t.logo,
          record: t.record,
          slug: t.slug,
        }))}
      />

      <details className="group mt-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
          Rank by Week
          <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">
            &darr;
          </span>
        </summary>
        <div className="border-t border-[var(--gridline)] px-4 py-3">
          <PollRaceChart timeline={timeline} />
        </div>
      </details>

      {(timeline.droppedOut.length > 0 || timeline.others.length > 0) && (
        <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
          {timeline.droppedOut.length > 0 && (
            <p>
              <span className="font-medium text-[var(--foreground)]">
                Dropped out:
              </span>{' '}
              {timeline.droppedOut.map((t) => t.name).join(', ')}
            </p>
          )}
          {timeline.others.length > 0 && (
            <p>
              <span className="font-medium text-[var(--foreground)]">
                On the bubble:
              </span>{' '}
              {timeline.others
                .slice(0, 10)
                .map((t) => `${t.name} (${t.points.toFixed(0)})`)
                .join(', ')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
