import {
  getGameLiveStatus,
  getGameOdds,
  getGamePredictor,
  getGameWinProbabilityHistory,
  getGameDrivePlays,
  getGameBoxscore,
} from '@/lib/espn'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/game/[eventId]/gamecast'>
) {
  const { eventId } = await context.params
  const [status, odds, predictor, winProbability, drivePlays, boxscore] = await Promise.all([
    getGameLiveStatus(eventId),
    getGameOdds(eventId),
    getGamePredictor(eventId),
    getGameWinProbabilityHistory(eventId),
    getGameDrivePlays(eventId),
    getGameBoxscore(eventId),
  ])
  return Response.json({ status, odds, predictor, winProbability, drivePlays, boxscore })
}
