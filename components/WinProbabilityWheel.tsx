import Image from 'next/image'

export interface WheelTeam {
  abbreviation: string
  logo: string
  color: string
}

const RADIUS = 40
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function TeamPct({
  team,
  pct,
  align,
}: {
  team: WheelTeam
  pct: number
  align: 'left' | 'right'
}) {
  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {team.logo && <Image src={team.logo} alt="" width={32} height={32} unoptimized className="shrink-0" />}
      <div>
        <div className="text-lg font-semibold">{Math.round(pct)}%</div>
        <div className="text-xs text-[var(--text-muted)]">{team.abbreviation}</div>
      </div>
    </div>
  )
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

  const awayHex = `#${away.color || '9aa5a0'}`
  const homeHex = `#${home.color || '9aa5a0'}`
  // Shade the favored team's side of the card, fading toward the other side.
  // A true toss-up shades both, meeting in the middle like the Game Cast
  // header's two-team gradient.
  const favoredBackground =
    awayPct === homePct
      ? `linear-gradient(to right, ${awayHex}26, ${homeHex}26)`
      : awayPct > homePct
        ? `linear-gradient(to right, ${awayHex}26, transparent 60%)`
        : `linear-gradient(to left, ${homeHex}26, transparent 60%)`

  return (
    <section
      className="rounded-xl border border-[var(--border-hairline)] p-5 shadow-[var(--shadow-card)]"
      style={{ background: `${favoredBackground}, var(--surface-1)` }}
    >
      <h2 className="font-semibold">Matchup Predictor</h2>
      <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8">
        <TeamPct team={away} pct={awayPct} align="right" />
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0">
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="var(--gridline)"
            strokeWidth={STROKE}
          />
          {/* Standard SVG circle stroke-dasharray trick: a circle's dash
              naturally starts at 3 o'clock and sweeps clockwise as offset
              grows, so both arcs are rotated -90deg to start at 12 o'clock
              instead. */}
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
        <TeamPct team={home} pct={homePct} align="left" />
      </div>
    </section>
  )
}
