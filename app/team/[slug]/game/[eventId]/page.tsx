import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LiveGameStats } from '@/components/LiveGameStats'
import { TeamTotalsTable } from '@/components/TeamTotalsTable'
import { PlayerStatsSection } from '@/components/PlayerStatsSection'
import { getTrackedTeam } from '@/lib/teams'
import { getGameLiveStatus, getGameBoxscore } from '@/lib/espn'

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string; eventId: string }>
}) {
  const { slug, eventId } = await params
  const tracked = getTrackedTeam(slug)
  if (!tracked) notFound()

  let status
  let boxscore
  try {
    ;[status, boxscore] = await Promise.all([
      getGameLiveStatus(eventId),
      getGameBoxscore(eventId),
    ])
  } catch {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href={`/team/${slug}`}
        className="text-sm text-[var(--text-secondary)] hover:underline"
      >
        &larr; Back to {tracked.name}
      </Link>

      <h1 className="mt-2 text-2xl font-semibold">
        {status.away.name} at {status.home.name}
      </h1>

      <div className="mt-6">
        {status.state === 'in' ? (
          <LiveGameStats
            eventId={eventId}
            initialStatus={status}
            initialBoxscore={boxscore}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)]">
              <span className="font-medium">
                {status.away.name} {status.away.score} — {status.home.name}{' '}
                {status.home.score}
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                {status.statusDetail}
              </span>
            </div>

            {boxscore ? (
              <>
                <TeamTotalsTable teams={boxscore.teams} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {boxscore.players.map((team) => (
                    <PlayerStatsSection key={team.teamId} team={team} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[var(--text-muted)]">
                Stats not available for this game.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
