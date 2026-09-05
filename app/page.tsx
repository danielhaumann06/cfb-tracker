import { TeamCard } from '@/components/TeamCard'
import { PlayoffOddsTracker } from '@/components/PlayoffOddsTracker'
import { TRACKED_TEAMS } from '@/lib/teams'
import {
  getTeamSummary,
  getTeamSchedule,
  getGameOdds,
  getFpiSummary,
  nextGame,
} from '@/lib/espn'

async function getDashboardData() {
  return Promise.all(
    TRACKED_TEAMS.map(async (tracked) => {
      const [team, schedule, fpi] = await Promise.all([
        getTeamSummary(tracked.espnId),
        getTeamSchedule(tracked.espnId),
        getFpiSummary(tracked.espnId),
      ])
      const next = nextGame(schedule)
      const odds = next ? await getGameOdds(next.id) : null

      return { slug: tracked.slug, team, next, odds, fpi }
    })
  )
}

export default async function Home() {
  const teams = await getDashboardData()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">College Football Tracker</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Nebraska, Oregon, Alabama, and Georgia Tech at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {teams.map(({ slug, team, next, odds, fpi }) => (
          <TeamCard
            key={slug}
            slug={slug}
            team={team}
            next={next}
            odds={odds}
            fpi={fpi}
          />
        ))}
      </div>

      <div className="mt-6">
        <PlayoffOddsTracker
          teams={teams.map(({ slug, team, fpi }) => ({
            slug,
            name: team.name,
            logo: team.logo,
            probMakePlayoffs: fpi?.probMakePlayoffs ?? null,
          }))}
        />
      </div>
    </main>
  )
}
