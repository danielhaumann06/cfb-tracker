import Image from 'next/image'
import type { GamePlay } from '@/lib/espn'

export interface FieldTeam {
  abbreviation: string
  logo: string
  color: string
}

const YARD_LINES = [10, 20, 30, 40, 50, 60, 70, 80, 90]

const RUSH_TYPES = new Set(['Rush', 'Rushing Touchdown', 'Sack'])
const PASS_COMPLETE_TYPES = new Set(['Pass Reception', 'Passing Touchdown'])
const PASS_INCOMPLETE_TYPES = new Set(['Pass Incompletion'])

// The graphic is framed as an elevated seat on the near sideline at the 50 -
// the whole field (both end zones) is visible left-to-right, with the far
// sideline drawn narrower than the near one to sell the depth.
const NEAR_Y = 54 // near sideline (closest to the viewer) - full width here
const FAR_Y = 8 // far sideline - compressed toward the "horizon"
const TOP_INSET = 17 // how much narrower the far sideline is, each side
const VIEW_W = 100
const VIEW_H = 64
const BALL_DEPTH = 0.42 // where on the near->far axis the ball sits

const clampPct = (n: number) => Math.min(100, Math.max(0, n))

// x-position of a given yard-line at the far sideline - the near sideline
// always spans the full 0-100 width, the far one is pinched inward.
const farX = (x: number) => TOP_INSET + (x / 100) * (VIEW_W - 2 * TOP_INSET)

// Projects a (yard position 0-100, depth 0-1) pair - depth 0 is the near
// sideline, depth 1 is the far one - into the trapezoid's screen space.
function project(x: number, depth: number) {
  return {
    x: x + (farX(x) - x) * depth,
    y: NEAR_Y + (FAR_Y - NEAR_Y) * depth,
  }
}

// Objects standing "up" off the field (goal posts) need to shrink with
// depth the same way the ground plane does, so they read as further away
// rather than just floating at a fixed size.
const SCALE_NEAR = 1
const SCALE_FAR = 0.4
const scaleAt = (depth: number) => SCALE_NEAR + (SCALE_FAR - SCALE_NEAR) * depth

const GOAL_DEPTH = 0.5 // planted mid-width, behind the back of each end zone
const GOAL_POLE_HEIGHT = 7 // pole rising from the ground to the crossbar
const GOAL_UPRIGHT_HEIGHT = 11 // uprights rising further from the crossbar
const GOAL_SPREAD = 5.5 // half the gap between the two uprights

function goalPostGeometry(goalLineX: number) {
  const base = project(goalLineX, GOAL_DEPTH)
  const s = scaleAt(GOAL_DEPTH)
  const crossbarY = base.y - GOAL_POLE_HEIGHT * s
  const topY = crossbarY - GOAL_UPRIGHT_HEIGHT * s
  const spread = GOAL_SPREAD * s
  return {
    baseX: base.x,
    baseY: base.y,
    crossbarY,
    topY,
    leftX: base.x - spread,
    rightX: base.x + spread,
    poleWidth: 0.55 * s,
    barWidth: 0.5 * s,
  }
}

// Converts a play's "yards to endzone" (recorded relative to whichever team
// had the ball at that instant) into the same 0-100 scale the field graphic
// is drawn in, which is always relative to the current possession team.
function fieldPct(
  yardsToEndzone: number | null,
  teamId: string | null,
  frameTeamId: string | null
): number | null {
  if (yardsToEndzone == null) return null
  const raw =
    teamId != null && frameTeamId != null && teamId !== frameTeamId
      ? yardsToEndzone
      : 100 - yardsToEndzone
  return clampPct(raw)
}

// ESPN doesn't give us the exact spot an incomplete pass fell - only the
// broadcast-style depth qualifier in the play text - so this is an estimate
// used purely to draw a plausible arc, not the real landing spot.
function incompleteDepthYards(text: string): number {
  if (/\bdeep\b/i.test(text)) return 20
  if (/\b(medium|intermediate)\b/i.test(text)) return 12
  if (/\bshort\b/i.test(text)) return 6
  return 9
}

export function FieldPosition({
  possessionTeam,
  possessionTeamId,
  yardsToEndzone,
  downDistanceText,
  lastPlay,
}: {
  possessionTeam: FieldTeam | null
  possessionTeamId: string | null
  yardsToEndzone: number | null
  downDistanceText: string | null
  lastPlay: GamePlay | null
}) {
  if (yardsToEndzone == null) return null

  const ballPct = clampPct(100 - yardsToEndzone)
  const markerColor = possessionTeam ? `#${possessionTeam.color || '2a78d6'}` : '#2a78d6'

  const startPct = lastPlay
    ? fieldPct(lastPlay.startYardsToEndzone, lastPlay.startTeamId, possessionTeamId)
    : null

  let playOverlay: 'rush' | 'pass-complete' | 'pass-incomplete' | null = null
  if (lastPlay && startPct != null) {
    if (RUSH_TYPES.has(lastPlay.typeText)) playOverlay = 'rush'
    else if (PASS_COMPLETE_TYPES.has(lastPlay.typeText)) playOverlay = 'pass-complete'
    else if (PASS_INCOMPLETE_TYPES.has(lastPlay.typeText)) playOverlay = 'pass-incomplete'
  }

  const isIncomplete = playOverlay === 'pass-incomplete'
  const endPct =
    isIncomplete && lastPlay
      ? clampPct((startPct ?? ballPct) + incompleteDepthYards(lastPlay.text))
      : ballPct

  const ball = project(ballPct, BALL_DEPTH)
  const start = startPct != null ? project(startPct, BALL_DEPTH) : null
  const end = project(endPct, BALL_DEPTH)
  // A thrown ball's peak reads as rising toward the far sideline (smaller
  // depth-y, more compressed toward the horizon) rather than straight up.
  const dist = startPct != null ? Math.abs(endPct - startPct) : 0
  const peakDepth = Math.min(0.95, BALL_DEPTH + 0.22 + dist / 250)
  const peak = startPct != null ? project((startPct + endPct) / 2, peakDepth) : null

  const nearLeft = project(0, 0)
  const nearRight = project(100, 0)
  const farLeft = project(0, 1)
  const farRight = project(100, 1)
  const nearEndzoneFar = project(8, 1)
  const farEndzoneFar = project(92, 1)

  const leftGoalPost = goalPostGeometry(0)
  const rightGoalPost = goalPostGeometry(100)

  return (
    <section className="rounded-xl bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Live Drive</h2>
        {possessionTeam && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
            {possessionTeam.logo && (
              <Image src={possessionTeam.logo} alt="" width={18} height={18} unoptimized />
            )}
            {possessionTeam.abbreviation} ball
          </span>
        )}
      </div>

      {downDistanceText && <p className="mt-1 text-sm text-[var(--text-muted)]">{downDistanceText}</p>}

      <div className="relative mt-4 h-56 w-full overflow-hidden rounded-md">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="fp-stands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12182a" />
              <stop offset="100%" stopColor="#2a3550" />
            </linearGradient>
            <linearGradient id="fp-turf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b6a3a" />
              <stop offset="100%" stopColor="#3d8c4e" />
            </linearGradient>
            <linearGradient id="fp-apron" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d8c4e" />
              <stop offset="100%" stopColor="#0e2214" />
            </linearGradient>
            {/* Cylindrical highlight for the uprights/pole - light down the
                middle, dark at the edges - so they read as round, not flat. */}
            <linearGradient id="fp-goalpost-v" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8a6100" />
              <stop offset="42%" stopColor="#ffe066" />
              <stop offset="58%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#8a6100" />
            </linearGradient>
            <linearGradient id="fp-goalpost-h" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe680" />
              <stop offset="45%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#8a6100" />
            </linearGradient>
          </defs>

          {/* Distant stands beyond the far sideline */}
          <rect x={0} y={0} width={VIEW_W} height={FAR_Y} fill="url(#fp-stands)" />

          {/* Field, seen at an angle from elevated seats on the near sideline */}
          <polygon
            points={`${nearLeft.x},${nearLeft.y} ${nearRight.x},${nearRight.y} ${farRight.x},${farRight.y} ${farLeft.x},${farLeft.y}`}
            fill="url(#fp-turf)"
          />

          {/* End zones */}
          <polygon
            points={`${nearLeft.x},${nearLeft.y} ${project(8, 0).x},${project(8, 0).y} ${nearEndzoneFar.x},${nearEndzoneFar.y} ${farLeft.x},${farLeft.y}`}
            fill="rgba(0,0,0,0.32)"
          />
          <polygon
            points={`${project(92, 0).x},${project(92, 0).y} ${nearRight.x},${nearRight.y} ${farRight.x},${farRight.y} ${farEndzoneFar.x},${farEndzoneFar.y}`}
            fill="rgba(0,0,0,0.32)"
          />

          {/* Yard lines, converging toward the far sideline */}
          {YARD_LINES.map((x) => {
            const a = project(x, 0)
            const b = project(x, 1)
            return (
              <line
                key={x}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={x === 50 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'}
                strokeWidth={x === 50 ? 0.7 : 0.3}
              />
            )
          })}

          {/* Sidelines */}
          <line x1={nearLeft.x} y1={nearLeft.y} x2={nearRight.x} y2={nearRight.y} stroke="rgba(255,255,255,0.6)" strokeWidth={0.5} />
          <line x1={farLeft.x} y1={farLeft.y} x2={farRight.x} y2={farRight.y} stroke="rgba(255,255,255,0.5)" strokeWidth={0.35} />

          {/* Field goal posts, planted behind each end zone */}
          {[leftGoalPost, rightGoalPost].map((post, i) => (
            <g key={i}>
              <ellipse
                cx={post.baseX}
                cy={post.baseY}
                rx={post.poleWidth * 2.2}
                ry={post.poleWidth * 0.8}
                fill="rgba(0,0,0,0.35)"
              />
              <rect
                x={post.baseX - post.poleWidth / 2}
                y={post.crossbarY}
                width={post.poleWidth}
                height={post.baseY - post.crossbarY}
                rx={post.poleWidth / 2}
                fill="url(#fp-goalpost-v)"
              />
              <rect
                x={post.leftX}
                y={post.crossbarY - post.barWidth / 2}
                width={post.rightX - post.leftX}
                height={post.barWidth}
                rx={post.barWidth / 2}
                fill="url(#fp-goalpost-h)"
              />
              <rect
                x={post.leftX - post.poleWidth / 2}
                y={post.topY}
                width={post.poleWidth}
                height={post.crossbarY - post.topY}
                rx={post.poleWidth / 2}
                fill="url(#fp-goalpost-v)"
              />
              <rect
                x={post.rightX - post.poleWidth / 2}
                y={post.topY}
                width={post.poleWidth}
                height={post.crossbarY - post.topY}
                rx={post.poleWidth / 2}
                fill="url(#fp-goalpost-v)"
              />
            </g>
          ))}

          {/* Foreground apron in front of the near sideline, toward the viewer's seat */}
          <polygon
            points={`0,${NEAR_Y} 100,${NEAR_Y} 100,${VIEW_H} 0,${VIEW_H}`}
            fill="url(#fp-apron)"
          />

          {/* Last-play trajectory */}
          {start && playOverlay === 'rush' && (
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={markerColor}
              strokeWidth={1}
              strokeLinecap="round"
            />
          )}

          {start && peak && playOverlay === 'pass-complete' && (
            <path
              d={`M ${start.x} ${start.y} Q ${peak.x} ${peak.y} ${end.x} ${end.y}`}
              fill="none"
              stroke={markerColor}
              strokeWidth={0.8}
              strokeDasharray="1.8,1.6"
              strokeLinecap="round"
            />
          )}

          {start && peak && isIncomplete && (
            <>
              <path
                d={`M ${start.x} ${start.y} Q ${peak.x} ${peak.y} ${end.x} ${end.y}`}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={0.8}
                strokeDasharray="1.8,1.6"
                strokeLinecap="round"
              />
              <path
                d={`M ${end.x - 1.8} ${end.y - 1.8} L ${end.x + 1.8} ${end.y + 1.8} M ${end.x - 1.8} ${end.y + 1.8} L ${end.x + 1.8} ${end.y - 1.8}`}
                stroke="#e5484d"
                strokeWidth={1}
                strokeLinecap="round"
              />
            </>
          )}

          {start && <circle cx={start.x} cy={start.y} r={1} fill="rgba(255,255,255,0.65)" />}
        </svg>
        <div
          className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-lg"
          style={{ left: `${ball.x}%`, top: `${(ball.y / VIEW_H) * 100}%`, background: markerColor }}
        >
          {possessionTeam?.logo ? (
            <Image
              src={possessionTeam.logo}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5 object-contain"
            />
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
          )}
        </div>
      </div>
    </section>
  )
}
