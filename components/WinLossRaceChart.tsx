'use client'

import { useState } from 'react'
import type { ConferenceTimeline } from '@/lib/espn'

const WIDTH = 680
const HEIGHT = 400
const MARGIN = { top: 16, right: 88, bottom: 28, left: 28 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const MIN_LABEL_GAP = 15

export function WinLossRaceChart({ timeline }: { timeline: ConferenceTimeline }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { teams, weeks, wins } = timeline

  if (weeks.length === 0 || teams.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Not enough completed games yet this season to chart a race.
      </p>
    )
  }

  const maxWins = Math.max(1, ...teams.map((t) => wins[t.id]?.at(-1) ?? 0))

  const xForWeekIndex = (i: number) =>
    weeks.length > 1
      ? MARGIN.left + (i / (weeks.length - 1)) * INNER_WIDTH
      : MARGIN.left + INNER_WIDTH / 2

  const yForWins = (w: number) =>
    MARGIN.top + INNER_HEIGHT - (w / maxWins) * INNER_HEIGHT

  const lastX = xForWeekIndex(weeks.length - 1)

  // Stack end-of-line labels that would otherwise overlap: sort by their
  // natural y position, then push any label too close to the previous one
  // further down, preserving relative order.
  const labelPositions = teams
    .map((team) => {
      const finalWins = wins[team.id]?.at(-1) ?? 0
      return { team, finalWins, y: yForWins(finalWins) }
    })
    .sort((a, b) => a.y - b.y)

  for (let i = 1; i < labelPositions.length; i++) {
    const min = labelPositions[i - 1].y + MIN_LABEL_GAP
    if (labelPositions[i].y < min) labelPositions[i].y = min
  }

  // Many teams tied on wins (common early in the season, or clustered at
  // the bottom/top) can push the forward pass past the chart's bottom
  // edge. Clamp the last label to the bottom bound and pull earlier ones
  // up to preserve minimum spacing - this only tightens a cluster that
  // overflowed, so it can't push anything above the top in turn.
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
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        className="max-w-none"
        role="img"
        aria-label="Cumulative wins by week for each team in the conference"
      >
        {/* y-axis gridlines */}
        {Array.from({ length: maxWins + 1 }, (_, w) => w).map((w) => (
          <g key={w}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + INNER_WIDTH}
              y1={yForWins(w)}
              y2={yForWins(w)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={yForWins(w)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[var(--text-muted)] text-[10px]"
            >
              {w}
            </text>
          </g>
        ))}

        {/* x-axis week labels */}
        {weeks.map((week, i) => (
          <text
            key={week}
            x={xForWeekIndex(i)}
            y={HEIGHT - MARGIN.bottom + 16}
            textAnchor="middle"
            className="fill-[var(--text-muted)] text-[10px]"
          >
            Wk {week}
          </text>
        ))}

        {teams.map((team) => {
          const series = wins[team.id] ?? []
          const points = series.map(
            (w, i) => `${xForWeekIndex(i)},${yForWins(w)}`
          )
          const color = team.color ? `#${team.color}` : 'var(--text-muted)'
          const isHovered = hoveredId === team.id
          const isDimmed = hoveredId !== null && !isHovered
          const lastWins = series.at(-1) ?? 0

          return (
            <g
              key={team.id}
              opacity={isDimmed ? 0.25 : 1}
              onMouseEnter={() => setHoveredId(team.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={isHovered ? 3 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle
                cx={lastX}
                cy={yForWins(lastWins)}
                r={isHovered ? 4 : 3}
                fill={color}
              />
              {(() => {
                const label = (
                  <>
                    <line
                      x1={lastX}
                      y1={yForWins(lastWins)}
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
                      {team.abbreviation} {lastWins}
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
