import { notFound } from 'next/navigation'
import { GameCastLive } from '@/components/GameCastLive'
import { type TeamLeadersPanel } from '@/components/GameSeasonLeaders'
import {
  getGameLiveStatus,
  getGameOdds,
  getGamePredictor,
  getGameWinProbabilityHistory,
  getGameDrivePlays,
  getGameBoxscore,
  getTeamStatLeaders,
  getTeamSummary,
  getAllTeams,
} from '@/lib/espn'

export default async function GameCastPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  let status
  let odds
  let predictor
  let winProbability
  let drivePlays
  let boxscore
  try {
    ;[status, odds, predictor, winProbability, drivePlays, boxscore] = await Promise.all([
      getGameLiveStatus(eventId),
      getGameOdds(eventId),
      getGamePredictor(eventId),
      getGameWinProbabilityHistory(eventId),
      getGameDrivePlays(eventId),
      getGameBoxscore(eventId),
    ])
  } catch {
    notFound()
  }

  const [homeSummary, awaySummary, homeLeaders, awayLeaders, allTeams] =
    await Promise.all([
      getTeamSummary(status.home.id),
      getTeamSummary(status.away.id),
      getTeamStatLeaders(status.home.id),
      getTeamStatLeaders(status.away.id),
      getAllTeams(),
    ])

  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))

  const homePanel: TeamLeadersPanel = {
    teamId: status.home.id,
    nickname: status.home.nickname,
    slug: slugById.get(status.home.id) ?? '',
    logo: status.home.logo,
    record: homeSummary.record,
    categories: homeLeaders,
  }
  const awayPanel: TeamLeadersPanel = {
    teamId: status.away.id,
    nickname: status.away.nickname,
    slug: slugById.get(status.away.id) ?? '',
    logo: status.away.logo,
    record: awaySummary.record,
    categories: awayLeaders,
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6">
      <GameCastLive
        key={eventId}
        eventId={eventId}
        initialStatus={status}
        initialOdds={odds}
        initialPredictor={predictor}
        initialWinProbability={winProbability}
        initialDrivePlays={drivePlays}
        initialBoxscore={boxscore}
        seasonHomePanel={homePanel}
        seasonAwayPanel={awayPanel}
        homeWheelTeam={{
          abbreviation: status.home.abbreviation,
          logo: status.home.logo,
          color: homeSummary.color,
        }}
        awayWheelTeam={{
          abbreviation: status.away.abbreviation,
          logo: status.away.logo,
          color: awaySummary.color,
        }}
        homeSlug={slugById.get(status.home.id) ?? ''}
        awaySlug={slugById.get(status.away.id) ?? ''}
      />
    </main>
  )
}
