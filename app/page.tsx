import { cookies } from 'next/headers'
import Image from 'next/image'
import { TeamCard } from '@/components/TeamCard'
import { PlayoffOddsTracker } from '@/components/PlayoffOddsTracker'
import { SettingsMenu } from '@/components/SettingsMenu'
import { RankingList } from '@/components/RankingList'
import { LiveTicker } from '@/components/LiveTicker'
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
  getNationalRankings,
  getAllTeams,
  getLivePowerFourGames,
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
  const [{ pollName, teams: nationalRankings }, allTeams, liveGames] =
    await Promise.all([
      getNationalRankings(),
      getAllTeams(),
      getLivePowerFourGames(),
    ])
  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-8 pt-10 sm:px-6 sm:pt-12">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-1 sm:gap-x-2">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
          {themeTeamLogo && (
            <Image
              src={themeTeamLogo}
              alt=""
              width={96}
              height={96}
              unoptimized
              priority
              className="h-14 w-14 shrink-0 sm:h-20 sm:w-20"
            />
          )}
          <h1 className="min-w-0">
            <Image
              src="/api/wordmark/light"
              alt="College Football Tracker"
              width={1560}
              height={220}
              unoptimized
              priority
              className="h-8 w-auto dark:hidden sm:h-14"
            />
            <Image
              src="/api/wordmark/dark"
              alt="College Football Tracker"
              width={1560}
              height={220}
              unoptimized
              priority
              className="hidden h-8 w-auto dark:block sm:h-14"
            />
          </h1>
        </div>
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

      <div className="mt-6">
        <LiveTicker initialGames={liveGames} />
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

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">{pollName}</h2>
        <RankingList
          entries={nationalRankings.map((t) => ({
            ...t,
            slug: slugById.get(t.id),
          }))}
        />
      </section>
    </main>
  )
}
