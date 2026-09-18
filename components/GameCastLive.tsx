'use client'

import { useEffect, useState } from 'react'
import type {
  GameBoxscore,
  GameDriveState,
  GameOdds,
  GamePredictor,
  GameState,
  GameTeam,
  WinProbabilityPoint,
} from '@/lib/espn'
import { GameCastHeader } from './GameCastHeader'
import { GameOddsPanel } from './GameOddsPanel'
import { WinProbabilityWheel, type WheelTeam } from './WinProbabilityWheel'
import { WinProbabilityChart } from './WinProbabilityChart'
import { FieldPosition } from './FieldPosition'
import { LivePlayFeed } from './LivePlayFeed'
import { GameSeasonLeaders, type TeamLeadersPanel } from './GameSeasonLeaders'
import { TeamTotalsTable } from './TeamTotalsTable'
import { PlayerStatsSection } from './PlayerStatsSection'

interface LiveStatus {
  home: GameTeam
  away: GameTeam
  state: GameState
  completed: boolean
  statusDetail: string
  date: string
  network: string | null
  venue: string | null
  homeTimeouts: number | null
  awayTimeouts: number | null
}

const FIVE_MINUTES_MS = 5 * 60 * 1000
// While a game is actually in progress, poll fast enough that the field
// position and play feed feel live, matching ESPN's own Gamecast cadence -
// pre-game there's nothing changing that fast, so that case stays on the
// slower 5-minute interval.
const LIVE_POLL_MS = 30_000

export function GameCastLive({
  eventId,
  initialStatus,
  initialOdds,
  initialPredictor,
  initialWinProbability,
  initialDrivePlays,
  initialBoxscore,
  seasonHomePanel,
  seasonAwayPanel,
  homeWheelTeam,
  awayWheelTeam,
  homeSlug,
  awaySlug,
}: {
  eventId: string
  initialStatus: LiveStatus
  initialOdds: GameOdds | null
  initialPredictor: GamePredictor | null
  initialWinProbability: WinProbabilityPoint[]
  initialDrivePlays: GameDriveState | null
  initialBoxscore: GameBoxscore | null
  seasonHomePanel: TeamLeadersPanel
  seasonAwayPanel: TeamLeadersPanel
  homeWheelTeam: WheelTeam
  awayWheelTeam: WheelTeam
  homeSlug: string
  awaySlug: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [odds, setOdds] = useState(initialOdds)
  const [predictor, setPredictor] = useState(initialPredictor)
  const [winProbability, setWinProbability] = useState(initialWinProbability)
  const [drivePlays, setDrivePlays] = useState(initialDrivePlays)
  const [boxscore, setBoxscore] = useState(initialBoxscore)

  useEffect(() => {
    if (status.completed) return

    const intervalMs = status.state === 'in' ? LIVE_POLL_MS : FIVE_MINUTES_MS

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/${eventId}/gamecast`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          setOdds(data.odds)
          setPredictor(data.predictor)
          setWinProbability(data.winProbability)
          setDrivePlays(data.drivePlays)
          setBoxscore(data.boxscore)
        }
      } catch {
        // stale data is fine until the next tick
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [eventId, status.completed, status.state])

  const homePct = predictor?.homeWinPct ?? null
  const awayPct = predictor?.awayWinPct ?? null
  const possessionTeam =
    drivePlays?.possessionTeamId === status.home.id
      ? homeWheelTeam
      : drivePlays?.possessionTeamId === status.away.id
        ? awayWheelTeam
        : null

  return (
    <div className="space-y-6">
      <GameCastHeader
        away={status.away}
        home={status.home}
        awaySlug={awaySlug}
        homeSlug={homeSlug}
        awayColor={awayWheelTeam.color}
        homeColor={homeWheelTeam.color}
        statusDetail={status.statusDetail}
        live={status.state === 'in'}
        date={status.date}
        network={status.network}
        venue={status.venue}
        homeTimeouts={status.homeTimeouts}
        awayTimeouts={status.awayTimeouts}
      />

      {status.state === 'in' && drivePlays && (
        <>
          <FieldPosition
            possessionTeam={possessionTeam}
            possessionTeamId={drivePlays.possessionTeamId}
            yardsToEndzone={drivePlays.yardsToEndzone}
            downDistanceText={drivePlays.downDistanceText}
            drivePlays={drivePlays.currentDrivePlays}
          />
          <LivePlayFeed plays={drivePlays.plays} />
        </>
      )}

      <GameOddsPanel odds={odds} />

      {homePct != null && awayPct != null && (
        <WinProbabilityWheel
          home={homeWheelTeam}
          away={awayWheelTeam}
          homePct={homePct}
          awayPct={awayPct}
        />
      )}

      {winProbability.length > 1 && (
        <WinProbabilityChart
          data={winProbability}
          homeAbbreviation={status.home.abbreviation}
          awayAbbreviation={status.away.abbreviation}
          homeColor={homeWheelTeam.color}
        />
      )}

      {status.state === 'in' ? (
        boxscore ? (
          <div className="space-y-6">
            <h2 className="font-semibold">Live Box Score</h2>
            <TeamTotalsTable teams={boxscore.teams} />
            <div className="grid gap-6 sm:grid-cols-2">
              {boxscore.players.map((team) => (
                <PlayerStatsSection key={team.teamId} team={team} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Live stats not available yet.</p>
        )
      ) : (
        <GameSeasonLeaders home={seasonHomePanel} away={seasonAwayPanel} />
      )}
    </div>
  )
}
