import { cookies } from 'next/headers'
import Image from 'next/image'
import { TeamCard } from '@/components/TeamCard'
import { PlayoffOddsTracker } from '@/components/PlayoffOddsTracker'
import { SettingsMenu } from '@/components/SettingsMenu'
import {
  TRACKED_TEAMS_COOKIE,
  THEME_TEAM_COOKIE,
  parseTrackedTeamsCookie,
  parseThemeTeamCookie,
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
  const themeTeamId = parseThemeTeamCookie(
    cookieStore.get(THEME_TEAM_COOKIE)?.value
  )
  const teams = await getDashboardData(trackedTeams)
  const themeTeamLogo =
    teams.find(({ team }) => team.id === themeTeamId)?.team.logo ??
    (await getTeamSummary(themeTeamId).catch(() => null))?.logo

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        {themeTeamLogo && (
          <Image
            src={themeTeamLogo}
            alt=""
            width={56}
            height={56}
            unoptimized
            priority
          />
        )}
        <h1 className="max-w-md sm:max-w-lg">
          <Image
            src="/api/wordmark/light"
            alt="College Football Tracker"
            width={1560}
            height={220}
            unoptimized
            priority
            className="h-auto w-full dark:hidden"
          />
          <Image
            src="/api/wordmark/dark"
            alt="College Football Tracker"
            width={1560}
            height={220}
            unoptimized
            priority
            className="hidden h-auto w-full dark:block"
          />
        </h1>
      </div>
      {teams.length === 0 && (
        <p className="mt-1 text-[var(--text-secondary)]">
          No teams tracked yet — add one below.
        </p>
      )}

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
        <SettingsMenu
          trackedTeams={trackedTeams}
          trackedTeamOptions={teams.map(({ team, slug }) => ({
            id: team.id,
            slug,
            name: team.name,
            logo: team.logo,
          }))}
          themeTeamId={themeTeamId}
        />
      </div>
    </main>
  )
}
