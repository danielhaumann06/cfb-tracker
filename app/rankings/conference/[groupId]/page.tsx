import { RankingList } from '@/components/RankingList'
import { getConferenceStandings, getAllTeams } from '@/lib/espn'

export default async function ConferenceStandingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [{ conferenceName, teams }, allTeams] = await Promise.all([
    getConferenceStandings(groupId),
    getAllTeams(),
  ])
  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">{conferenceName} Standings</h1>
      <div className="mt-6">
        <RankingList
          entries={teams.map((t) => ({ ...t, slug: slugById.get(t.id) }))}
        />
      </div>
    </main>
  )
}
