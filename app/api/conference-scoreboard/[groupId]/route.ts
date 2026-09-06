import { getConferenceScoreboard } from '@/lib/espn'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/conference-scoreboard/[groupId]'>
) {
  const { groupId } = await context.params
  const games = await getConferenceScoreboard(groupId)
  return Response.json(games)
}
