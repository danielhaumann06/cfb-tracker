import { getGameLiveStatus } from '@/lib/espn'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/game/[eventId]'>
) {
  const { eventId } = await context.params
  const status = await getGameLiveStatus(eventId)
  return Response.json(status)
}
