import Link from 'next/link'
import type { GameOdds, GameSummary } from '@/lib/espn'

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function ScheduleTable({
  slug,
  teamId,
  games,
  oddsByGameId = {},
}: {
  slug: string
  teamId: string
  games: GameSummary[]
  oddsByGameId?: Record<string, GameOdds | null>
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left text-[var(--text-muted)]">
            <th className="px-4 py-2 font-normal">Wk</th>
            <th className="px-4 py-2 font-normal">Date</th>
            <th className="px-4 py-2 font-normal">Opponent</th>
            <th className="px-4 py-2 font-normal">Result</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const isHome = game.home.id === teamId
            const opponent = isHome ? game.away : game.home
            const self = isHome ? game.home : game.away
            const decided =
              game.completed && self.score !== null && opponent.score !== null
            const won =
              decided && Number(self.score) > Number(opponent.score)
            const hasBoxscore = game.completed || game.state === 'in'

            return (
              <tr
                key={game.id}
                className="border-b border-[var(--gridline)] last:border-0"
              >
                <td className="px-4 py-2 text-[var(--text-muted)]">
                  {game.week ?? '—'}
                </td>
                <td className="px-4 py-2">{formatDate(game.date)}</td>
                <td className="px-4 py-2">
                  {isHome ? 'vs' : 'at'} {opponent.name}
                </td>
                <td className="px-4 py-2">
                  {hasBoxscore ? (
                    <Link
                      href={`/team/${slug}/game/${game.id}`}
                      className="underline decoration-[var(--border-hairline)] underline-offset-2 hover:decoration-current"
                    >
                      {game.completed ? (
                        <span className={won ? 'text-[var(--seq-fill)]' : ''}>
                          {won ? 'W' : 'L'} {self.score}-{opponent.score}
                        </span>
                      ) : (
                        <span>{game.statusDetail}</span>
                      )}
                    </Link>
                  ) : (
                    <span className="text-[var(--text-muted)]">
                      {game.statusDetail}
                      {oddsByGameId[game.id]?.details && (
                        <>
                          <br />
                          <span className="text-xs">
                            {oddsByGameId[game.id]?.details}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
