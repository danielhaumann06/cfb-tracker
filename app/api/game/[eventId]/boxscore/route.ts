import { getGameBoxscore, getGameLiveStatus } from '@/lib/espn'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/game/[eventId]/boxscore'>
) {
  const { eventId } = await context.params
  const [status, boxscore] = await Promise.all([
    getGameLiveStatus(eventId),
    getGameBoxscore(eventId),
  ])
  return Response.json({ status, boxscore })
}
