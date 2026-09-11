import { AutoRefresh } from '@/components/AutoRefresh'
import { ScoresList } from '@/components/ScoresList'
import { getWeekScoreboard } from '@/lib/espn'

export default async function ScoresPage() {
  const scoreboard = await getWeekScoreboard()

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-6">
      <AutoRefresh />
      <h1 className="text-2xl font-semibold">Scores</h1>

      <div className="mt-6">
        <ScoresList initialScoreboard={scoreboard} />
      </div>
    </main>
  )
}
