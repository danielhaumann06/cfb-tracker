import { getLivePowerFiveGames } from '@/lib/espn'

export async function GET() {
  const games = await getLivePowerFiveGames()
  return Response.json(games)
}
