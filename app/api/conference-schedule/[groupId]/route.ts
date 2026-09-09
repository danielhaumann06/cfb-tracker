import { getConferenceSchedule } from '@/lib/espn'

export async function GET(
  request: Request,
  context: RouteContext<'/api/conference-schedule/[groupId]'>
) {
  const { groupId } = await context.params
  const week = new URL(request.url).searchParams.get('week')
  const schedule = await getConferenceSchedule(
    groupId,
    week ? Number(week) : undefined
  )
  return Response.json(schedule)
}
