import { getLivePowerFourGames } from '@/lib/espn'

export async function GET() {
  const games = await getLivePowerFourGames()
  return Response.json(games)
}
