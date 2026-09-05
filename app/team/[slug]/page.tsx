import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LiveScoreBadge } from '@/components/LiveScoreBadge'
import { ScheduleTable } from '@/components/ScheduleTable'
import { StatsSummary } from '@/components/StatsSummary'
import { getTrackedTeam } from '@/lib/teams'
import { getTeamSummary, getTeamSchedule, getFpiSummary, nextGame } from '@/lib/espn'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tracked = getTrackedTeam(slug)
  if (!tracked) notFound()

  const [team, schedule, fpi] = await Promise.all([
    getTeamSummary(tracked.espnId),
    getTeamSchedule(tracked.espnId),
    getFpiSummary(tracked.espnId),
  ])
  const current = nextGame(schedule)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-4">
        {team.logo && (
          <Image src={team.logo} alt="" width={64} height={64} unoptimized />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{team.name}</h1>
          <p className="text-[var(--text-secondary)]">
            {team.record} &middot; {team.standingSummary}
          </p>
        </div>
      </div>

      {current?.state === 'in' && (
        <div className="mt-6">
          <LiveScoreBadge
            eventId={current.id}
            initial={{
              home: current.home,
              away: current.away,
              state: current.state,
              completed: current.completed,
              statusDetail: current.statusDetail,
            }}
          />
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Stats</h2>
        <StatsSummary team={team} fpi={fpi} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Schedule</h2>
        <ScheduleTable teamId={team.id} games={schedule} />
      </section>
    </main>
  )
}
