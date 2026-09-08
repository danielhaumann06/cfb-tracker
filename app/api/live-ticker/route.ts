import { getLivePowerFiveGames, getTop25Scores } from '@/lib/espn'

export async function GET() {
  const liveGames = await getLivePowerFiveGames()
  if (liveGames.length > 0) {
    return Response.json({ mode: 'live' as const, games: liveGames })
  }

  const top25Games = await getTop25Scores()
  return Response.json({ mode: 'top25' as const, games: top25Games })
}
