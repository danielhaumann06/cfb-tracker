import {
  getGameLiveStatus,
  getGameOdds,
  getGamePredictor,
  getGameWinProbabilityHistory,
  getGameDrivePlays,
} from '@/lib/espn'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/game/[eventId]/gamecast'>
) {
  const { eventId } = await context.params
  const [status, odds, predictor, winProbability, drivePlays] = await Promise.all([
    getGameLiveStatus(eventId),
    getGameOdds(eventId),
    getGamePredictor(eventId),
    getGameWinProbabilityHistory(eventId),
    getGameDrivePlays(eventId),
  ])
  return Response.json({ status, odds, predictor, winProbability, drivePlays })
}
