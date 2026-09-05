import { getAllTeams } from '@/lib/espn'

export async function GET() {
  const teams = await getAllTeams()
  return Response.json(teams)
}
