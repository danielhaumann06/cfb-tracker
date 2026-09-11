import { getWeekScoreboard } from '@/lib/espn'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekParam = searchParams.get('week')
  const week = weekParam ? Number(weekParam) : undefined

  const scoreboard = await getWeekScoreboard(
    Number.isFinite(week) ? week : undefined
  )
  return Response.json(scoreboard)
}
