'use client'

import { useEffect, useState } from 'react'
import type {
  GameOdds,
  GamePredictor,
  GameState,
  GameTeam,
  WinProbabilityPoint,
} from '@/lib/espn'
import { GameScoreBar } from './GameScoreBar'
import { GameOddsPanel } from './GameOddsPanel'
import { WinProbabilityWheel, type WheelTeam } from './WinProbabilityWheel'
import { WinProbabilityChart } from './WinProbabilityChart'

interface LiveStatus {
  home: GameTeam
  away: GameTeam
  state: GameState
  completed: boolean
  statusDetail: string
}

const FIVE_MINUTES_MS = 5 * 60 * 1000

export function GameCastLive({
  eventId,
  initialStatus,
  initialOdds,
  initialPredictor,
  initialWinProbability,
  homeWheelTeam,
  awayWheelTeam,
}: {
  eventId: string
  initialStatus: LiveStatus
  initialOdds: GameOdds | null
  initialPredictor: GamePredictor | null
  initialWinProbability: WinProbabilityPoint[]
  homeWheelTeam: WheelTeam
  awayWheelTeam: WheelTeam
}) {
  const [status, setStatus] = useState(initialStatus)
  const [odds, setOdds] = useState(initialOdds)
  const [predictor, setPredictor] = useState(initialPredictor)
  const [winProbability, setWinProbability] = useState(initialWinProbability)

  useEffect(() => {
    if (status.completed) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/${eventId}/gamecast`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          setOdds(data.odds)
          setPredictor(data.predictor)
          setWinProbability(data.winProbability)
        }
      } catch {
        // stale data is fine until the next tick
      }
    }, FIVE_MINUTES_MS)

    return () => clearInterval(interval)
  }, [eventId, status.completed])

  const homePct = predictor?.homeWinPct ?? null
  const awayPct = predictor?.awayWinPct ?? null

  return (
    <div className="space-y-6">
      <GameScoreBar
        away={status.away}
        home={status.home}
        statusDetail={status.statusDetail}
        live={status.state === 'in'}
      />

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
    </div>
  )
}
