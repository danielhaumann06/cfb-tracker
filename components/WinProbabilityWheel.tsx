import Image from 'next/image'

export interface WheelTeam {
  abbreviation: string
  logo: string
  color: string
}

const RADIUS = 40
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Standard SVG circle stroke-dasharray trick: a circle's dash naturally
// starts at 3 o'clock and sweeps clockwise as offset grows, so everything
// here is rotated -90deg around the center to start at 12 o'clock instead -
// applied consistently to both the arcs and the logo placement math below.
function pointOnRing(fractionOffset: number): { x: number; y: number } {
  const angleDeg = -90 + fractionOffset * 360
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: 50 + RADIUS * Math.cos(angleRad),
    y: 50 + RADIUS * Math.sin(angleRad),
  }
}

export function WinProbabilityWheel({
  home,
  away,
  homePct,
  awayPct,
}: {
  home: WheelTeam
  away: WheelTeam
  homePct: number
  awayPct: number
}) {
  const total = homePct + awayPct || 1
  const awayFraction = awayPct / total
  const homeFraction = homePct / total
  const awayLength = awayFraction * CIRCUMFERENCE
  const homeLength = homeFraction * CIRCUMFERENCE

  const awayLogoPos = pointOnRing(awayFraction / 2)
  const homeLogoPos = pointOnRing(awayFraction + homeFraction / 2)

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Matchup Predictor</h2>
      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[220px]">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="var(--gridline)"
            strokeWidth={STROKE}
          />
          {awayLength > 0 && (
            <circle
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              stroke={`#${away.color || '9aa5a0'}`}
              strokeWidth={STROKE}
              strokeDasharray={`${awayLength} ${CIRCUMFERENCE}`}
              strokeDashoffset={0}
              transform="rotate(-90 50 50)"
            />
          )}
          {homeLength > 0 && (
            <circle
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              stroke={`#${home.color || '9aa5a0'}`}
              strokeWidth={STROKE}
              strokeDasharray={`${homeLength} ${CIRCUMFERENCE}`}
              strokeDashoffset={-awayLength}
              transform="rotate(-90 50 50)"
            />
          )}
        </svg>
        {awayPct > 0 && (
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${awayLogoPos.x}%`, top: `${awayLogoPos.y}%` }}
          >
            {away.logo && <Image src={away.logo} alt="" width={28} height={28} unoptimized />}
            <span className="text-xs font-semibold">{Math.round(awayPct)}%</span>
          </div>
        )}
        {homePct > 0 && (
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${homeLogoPos.x}%`, top: `${homeLogoPos.y}%` }}
          >
            {home.logo && <Image src={home.logo} alt="" width={28} height={28} unoptimized />}
            <span className="text-xs font-semibold">{Math.round(homePct)}%</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
        {away.abbreviation} vs {home.abbreviation}
      </p>
    </section>
  )
}
