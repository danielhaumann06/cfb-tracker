import { cookies } from 'next/headers'
import { TeamCard } from '@/components/TeamCard'
import { PlayoffOddsTracker } from '@/components/PlayoffOddsTracker'
import { ManageTeamsPanel } from '@/components/ManageTeamsPanel'
import {
  TRACKED_TEAMS_COOKIE,
  ICON_TEAM_COOKIE,
  parseTrackedTeamsCookie,
  parseIconTeamCookie,
  type TrackedTeam,
} from '@/lib/teams'
import {
  getTeamSummary,
  getTeamSchedule,
  getGameOdds,
  getFpiSummary,
  nextGame,
} from '@/lib/espn'

async function getDashboardData(trackedTeams: TrackedTeam[]) {
  const bundles = await Promise.all(
    trackedTeams.map(async (tracked) => {
      try {
        const [team, schedule, fpi] = await Promise.all([
          getTeamSummary(tracked.id),
          getTeamSchedule(tracked.id),
          getFpiSummary(tracked.id),
        ])
        const next = nextGame(schedule)
        const odds = next ? await getGameOdds(next.id) : null

        return { slug: tracked.slug, team, next, odds, fpi }
      } catch {
        return null
      }
    })
  )

  return bundles.filter((b): b is NonNullable<typeof b> => b !== null)
}

export default async function Home() {
  const cookieStore = await cookies()
  const trackedTeams = parseTrackedTeamsCookie(
    cookieStore.get(TRACKED_TEAMS_COOKIE)?.value
  )
  const iconTeamId = parseIconTeamCookie(
    cookieStore.get(ICON_TEAM_COOKIE)?.value
  )
  const teams = await getDashboardData(trackedTeams)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">College Football Tracker</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        {teams.length
          ? `${teams.map(({ team }) => team.name).join(', ')} at a glance.`
          : 'No teams tracked yet — add one below.'}
      </p>

      {teams.length > 0 && (
        <>
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
        </>
      )}

      <div className="mt-6">
        <ManageTeamsPanel
          trackedTeams={trackedTeams}
          trackedTeamOptions={teams.map(({ team, slug }) => ({
            id: team.id,
            slug,
            name: team.name,
            logo: team.logo,
          }))}
          iconTeamId={iconTeamId}
        />
      </div>
    </main>
  )
}
