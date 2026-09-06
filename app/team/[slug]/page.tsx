import Image from 'next/image'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { LiveScoreBadge } from '@/components/LiveScoreBadge'
import { ScheduleTable } from '@/components/ScheduleTable'
import { StatsSummary } from '@/components/StatsSummary'
import { Headlines } from '@/components/Headlines'
import { TRACKED_TEAMS_COOKIE, parseTrackedTeamsCookie } from '@/lib/teams'
import {
  getTeamSummary,
  getTeamSchedule,
  getGameOdds,
  getFpiSummary,
  getNationalRank,
  getTeamNews,
  nextGame,
  type GameOdds,
} from '@/lib/espn'

async function getUpcomingOdds(
  schedule: { id: string; state: string }[]
): Promise<Record<string, GameOdds | null>> {
  const upcoming = schedule.filter((g) => g.state === 'pre')
  const odds = await Promise.all(
    upcoming.map((g) => getGameOdds(g.id).catch(() => null))
  )
  return Object.fromEntries(upcoming.map((g, i) => [g.id, odds[i]]))
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const trackedTeams = parseTrackedTeamsCookie(
    cookieStore.get(TRACKED_TEAMS_COOKIE)?.value
  )
  const tracked = trackedTeams.find((t) => t.slug === slug)
  if (!tracked) notFound()

  let team, schedule, fpi, nationalRank, news
  try {
    ;[team, schedule, fpi, nationalRank, news] = await Promise.all([
      getTeamSummary(tracked.id),
      getTeamSchedule(tracked.id),
      getFpiSummary(tracked.id),
      getNationalRank(tracked.id),
      getTeamNews(tracked.id),
    ])
  } catch {
    notFound()
  }
  const current = nextGame(schedule)
  const oddsByGameId = await getUpcomingOdds(schedule)

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
        <StatsSummary team={team} fpi={fpi} nationalRank={nationalRank} />
      </section>

      {news.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold">Headlines</h2>
          <Headlines items={news} />
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Schedule</h2>
        <ScheduleTable
          slug={slug}
          teamId={team.id}
          games={schedule}
          oddsByGameId={oddsByGameId}
        />
      </section>
    </main>
  )
}
