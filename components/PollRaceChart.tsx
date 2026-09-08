'use client'

import { useState } from 'react'
import type { PollTimeline } from '@/lib/espn'

// Fixed spacing per week (rather than auto-fitting every week into one
// constant-width canvas) so early season, with only a couple of weeks of
// data, still shows a few weeks at once without needing to scroll - the
// canvas only grows wide enough to need scrolling once there are many
// weeks to show.
const PX_PER_WEEK = 110
const HEIGHT = 460
const MARGIN = { top: 12, right: 88, bottom: 28, left: 24 }
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const MIN_LABEL_GAP = 15
const MAX_RANK = 25

// Split a series into contiguous runs of ranked weeks - a team unranked
// for a stretch (or not yet in the poll) shouldn't have its line drawn
// through those gaps.
function contiguousRuns(series: (number | null)[]): { start: number; end: number }[] {
  const runs: { start: number; end: number }[] = []
  let start: number | null = null

  series.forEach((value, i) => {
    if (value !== null && start === null) {
      start = i
    } else if (value === null && start !== null) {
      runs.push({ start, end: i - 1 })
      start = null
    }
  })
  if (start !== null) runs.push({ start, end: series.length - 1 })

  return runs
}

export function PollRaceChart({ timeline }: { timeline: PollTimeline }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { teams, weekLabels, ranks } = timeline

  if (weekLabels.length === 0 || teams.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No poll data available yet this season.
      </p>
    )
  }

  const innerWidth = Math.max(
    (weekLabels.length - 1) * PX_PER_WEEK,
    PX_PER_WEEK
  )
  const width = MARGIN.left + MARGIN.right + innerWidth

  const xForWeekIndex = (i: number) =>
    weekLabels.length > 1
      ? MARGIN.left + (i / (weekLabels.length - 1)) * innerWidth
      : MARGIN.left + innerWidth / 2

  const yForRank = (rank: number) =>
    MARGIN.top + ((rank - 1) / (MAX_RANK - 1)) * INNER_HEIGHT

  const lastWeekIndex = weekLabels.length - 1
  const lastX = xForWeekIndex(lastWeekIndex)

  const labelPositions = teams
    .map((team) => {
      const rank = ranks[team.id]?.[lastWeekIndex] ?? MAX_RANK
      return { team, rank, y: yForRank(rank) }
    })
    .sort((a, b) => a.y - b.y)

  for (let i = 1; i < labelPositions.length; i++) {
    const min = labelPositions[i - 1].y + MIN_LABEL_GAP
    if (labelPositions[i].y < min) labelPositions[i].y = min
  }

  const bottomBound = MARGIN.top + INNER_HEIGHT
  const last = labelPositions.length - 1
  if (last >= 0 && labelPositions[last].y > bottomBound) {
    labelPositions[last].y = bottomBound
    for (let i = last - 1; i >= 0; i--) {
      const max = labelPositions[i + 1].y - MIN_LABEL_GAP
      if (labelPositions[i].y > max) labelPositions[i].y = max
    }
  }

  const labelYById = new Map(labelPositions.map((p) => [p.team.id, p.y]))

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        width={width}
        height={HEIGHT}
        className="max-w-none"
        role="img"
        aria-label="Rank by week for each ranked team"
      >
        {[1, 5, 10, 15, 20, 25].map((rank) => (
          <g key={rank}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + innerWidth}
              y1={yForRank(rank)}
              y2={yForRank(rank)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 6}
              y={yForRank(rank)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[var(--text-muted)] text-[10px]"
            >
              {rank}
            </text>
          </g>
        ))}

        {weekLabels.map((label, i) => (
          <text
            key={label + i}
            x={xForWeekIndex(i)}
            y={HEIGHT - MARGIN.bottom + 16}
            textAnchor="middle"
            className="fill-[var(--text-muted)] text-[10px]"
          >
            {label}
          </text>
        ))}

        {teams.map((team) => {
          const series = ranks[team.id] ?? []
          const color = team.color ? `#${team.color}` : 'var(--text-muted)'
          const isHovered = hoveredId === team.id
          const isDimmed = hoveredId !== null && !isHovered
          const finalRank = series[lastWeekIndex] ?? MAX_RANK
          const runs = contiguousRuns(series)

          return (
            <g
              key={team.id}
              opacity={isDimmed ? 0.25 : 1}
              onMouseEnter={() => setHoveredId(team.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {runs.map((run) => {
                const points = []
                for (let i = run.start; i <= run.end; i++) {
                  points.push(`${xForWeekIndex(i)},${yForRank(series[i]!)}`)
                }
                return (
                  <polyline
                    key={run.start}
                    points={points.join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )
              })}
              <circle
                cx={lastX}
                cy={yForRank(finalRank)}
                r={isHovered ? 4 : 3}
                fill={color}
              />
              {(() => {
                const label = (
                  <>
                    <line
                      x1={lastX}
                      y1={yForRank(finalRank)}
                      x2={lastX + 6}
                      y2={labelYById.get(team.id)}
                      stroke={color}
                      strokeWidth={1}
                    />
                    <text
                      x={lastX + 8}
                      y={labelYById.get(team.id)}
                      dominantBaseline="middle"
                      className={`text-[11px] ${
                        isHovered ? 'font-semibold' : 'font-medium'
                      }`}
                      fill={color}
                    >
                      #{finalRank} {team.abbreviation}
                    </text>
                  </>
                )
                return team.slug ? (
                  <a href={`/team/${team.slug}`}>{label}</a>
                ) : (
                  label
                )
              })()}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
