import { RankingList } from '@/components/RankingList'
import { getNationalRankings, getAllTeams } from '@/lib/espn'

export default async function NationalRankingsPage() {
  const [{ pollName, teams }, allTeams] = await Promise.all([
    getNationalRankings(),
    getAllTeams(),
  ])
  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">{pollName}</h1>
      <div className="mt-6">
        <RankingList
          entries={teams.map((t) => ({ ...t, slug: slugById.get(t.id) }))}
        />
      </div>
    </main>
  )
}
