'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { WinProbabilityPoint } from '@/lib/espn'

function quarterLabel(quarter: number): string {
  return quarter <= 4 ? `Q${quarter}` : 'OT'
}

export function WinProbabilityChart({
  data,
  homeAbbreviation,
  awayAbbreviation,
  homeColor,
}: {
  data: WinProbabilityPoint[]
  homeAbbreviation: string
  awayAbbreviation: string
  homeColor: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (data.length < 2) return null

  const stroke = `#${homeColor || '2a78d6'}`
  const points = data
    .map((p, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - p.homeWinPct
      return `${x},${y}`
    })
    .join(' ')
  const areaPoints = `0,100 ${points} 100,100`

  function indexFromClientX(clientX: number) {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const fraction = (clientX - rect.left) / rect.width
    const clamped = Math.min(1, Math.max(0, fraction))
    return Math.round(clamped * (data.length - 1))
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setActiveIndex(indexFromClientX(e.clientX))
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    // Touch/pen only scrub while pressed; mouse also previews on hover.
    if (!isDragging && e.pointerType !== 'mouse') return
    setActiveIndex(indexFromClientX(e.clientX))
  }

  function endDrag() {
    setIsDragging(false)
    setActiveIndex(null)
  }

  const active = activeIndex != null ? data[activeIndex] : null
  const activeXPct = activeIndex != null ? (activeIndex / (data.length - 1)) * 100 : null
  const activeYPct = active ? 100 - active.homeWinPct : null

  const homeLeading = active ? active.homeWinPct >= 50 : null
  const leaderAbbr = homeLeading == null ? null : homeLeading ? homeAbbreviation : awayAbbreviation
  const leaderPct = active
    ? Math.round(homeLeading ? active.homeWinPct : 100 - active.homeWinPct)
    : null
  const timeLabel =
    active?.quarter != null ? `${quarterLabel(active.quarter)}${active.clock ? ` ${active.clock}` : ''}` : null
  const scoreLabel =
    active?.homeScore != null && active?.awayScore != null
      ? `${awayAbbreviation} ${active.awayScore} - ${active.homeScore} ${homeAbbreviation}`
      : null

  const tooltipAlign = activeXPct == null ? 'center' : activeXPct < 20 ? 'left' : activeXPct > 80 ? 'right' : 'center'

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Win Probability</h2>
      <div className="relative mt-10 flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-xs text-[var(--text-muted)]">
          <span>{homeAbbreviation}</span>
          <span>{awayAbbreviation}</span>
        </div>
        <div
          ref={containerRef}
          className="relative h-32 w-full flex-1 touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') endDrag()
          }}
        >
          {active && activeXPct != null && (
            <div
              className="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md bg-[var(--foreground)] px-2 py-1 text-xs font-medium whitespace-nowrap text-[var(--background)] shadow"
              style={{
                left: `${activeXPct}%`,
                transform:
                  tooltipAlign === 'left'
                    ? 'translateX(0)'
                    : tooltipAlign === 'right'
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
              }}
            >
              <div>
                {leaderAbbr} {leaderPct}%{timeLabel ? ` · ${timeLabel}` : ''}
              </div>
              {scoreLabel && <div className="opacity-80">{scoreLabel}</div>}
            </div>
          )}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="var(--gridline)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <polygon points={areaPoints} fill={stroke} fillOpacity={0.12} stroke="none" />
            <polyline
              points={points}
              fill="none"
              stroke={stroke}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            {activeXPct != null && (
              <line
                x1={activeXPct}
                y1="0"
                x2={activeXPct}
                y2="100"
                stroke="var(--text-muted)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {activeXPct != null && activeYPct != null && (
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${activeXPct}%`, top: `${activeYPct}%`, background: stroke }}
            />
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {active
          ? 'Drag along the line to scrub through the game'
          : `Top = ${homeAbbreviation} favored, bottom = ${awayAbbreviation} favored`}
      </p>
    </section>
  )
}
