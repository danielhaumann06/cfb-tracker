import { getPollTimeline, POLL_IDS } from '@/lib/espn'
import { PollCard } from '@/components/PollCard'

export default async function PollsPage() {
  const [ap, coaches, cfp] = await Promise.all([
    getPollTimeline(POLL_IDS.ap),
    getPollTimeline(POLL_IDS.coaches),
    getPollTimeline(POLL_IDS.cfp),
  ])

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Polls</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        AP, Coaches, and CFP rankings, with each team&rsquo;s rank by week.
      </p>

      <PollCard title={ap.pollName || 'AP Top 25'} timeline={ap} />
      <PollCard
        title={coaches.pollName || 'Coaches Poll'}
        timeline={coaches}
      />

      {cfp.weekLabels.length > 0 ? (
        <PollCard title={cfp.pollName || 'CFP Rankings'} timeline={cfp} />
      ) : (
        <section className="mt-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 text-sm text-[var(--text-muted)] shadow-[var(--shadow-card)]">
          CFP Rankings haven&rsquo;t been released yet this season. They
          typically begin in early November.
        </section>
      )}
    </main>
  )
}
