import type { WinProbabilityPoint } from '@/lib/espn'

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

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Win Probability</h2>
      <div className="relative mt-4 flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-xs text-[var(--text-muted)]">
          <span>{homeAbbreviation}</span>
          <span>{awayAbbreviation}</span>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-32 w-full overflow-visible"
        >
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
        </svg>
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        Top = {homeAbbreviation} favored, bottom = {awayAbbreviation} favored
      </p>
    </section>
  )
}
