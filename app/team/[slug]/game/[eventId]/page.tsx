import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LiveGameStats } from '@/components/LiveGameStats'
import { TeamTotalsTable } from '@/components/TeamTotalsTable'
import { PlayerStatsSection } from '@/components/PlayerStatsSection'
import { GameScoreBar } from '@/components/GameScoreBar'
import { GameSummary } from '@/components/GameSummary'
import { HighlightReel } from '@/components/HighlightReel'
import {
  getGameLiveStatus,
  getGameBoxscore,
  getGameArticle,
  getGameHighlights,
} from '@/lib/espn'

// Michigan vs. Western Michigan, Week 1 2026 - the MAC has formally
// appealed this result to the NCAA/CFP, seeking to have Western Michigan
// recognized as the winner instead.
const DISPUTED_GAME_ID = '401858428'

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string; eventId: string }>
}) {
  const { eventId } = await params

  let status
  let boxscore
  let article
  let highlights
  try {
    ;[status, boxscore, article, highlights] = await Promise.all([
      getGameLiveStatus(eventId),
      getGameBoxscore(eventId),
      getGameArticle(eventId),
      getGameHighlights(eventId),
    ])
  } catch {
    notFound()
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xl font-semibold">
        <span className="inline-flex items-center gap-1.5">
          {status.away.logo && (
            <Image
              src={status.away.logo}
              alt=""
              width={28}
              height={28}
              unoptimized
            />
          )}
          {status.away.nickname}
        </span>
        <span className="text-[var(--text-muted)]">at</span>
        <span className="inline-flex items-center gap-1.5">
          {status.home.logo && (
            <Image
              src={status.home.logo}
              alt=""
              width={28}
              height={28}
              unoptimized
            />
          )}
          {status.home.nickname}
        </span>
      </h1>

      {article && (
        <div className="mt-6">
          <GameSummary article={article} />
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mt-6">
          <HighlightReel highlights={highlights} />
        </div>
      )}

      <div className="mt-6">
        {status.state === 'in' ? (
          <LiveGameStats
            eventId={eventId}
            initialStatus={status}
            initialBoxscore={boxscore}
          />
        ) : (
          <div className="space-y-6">
            <GameScoreBar
              away={status.away}
              home={status.home}
              statusDetail={status.statusDetail}
              live={false}
              date={status.date}
              network={status.network}
              venue={status.venue}
              disputedNote={
                eventId === DISPUTED_GAME_ID
                  ? 'The MAC has formally appealed this result to the NCAA/CFP, seeking to have Western Michigan recognized as the winner.'
                  : undefined
              }
            />

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
