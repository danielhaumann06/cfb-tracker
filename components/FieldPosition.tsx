import Image from 'next/image'

export interface FieldTeam {
  abbreviation: string
  logo: string
  color: string
}

const YARD_LINES = [10, 20, 30, 40, 50, 60, 70, 80, 90]

export function FieldPosition({
  possessionTeam,
  yardsToEndzone,
  downDistanceText,
}: {
  possessionTeam: FieldTeam | null
  yardsToEndzone: number | null
  downDistanceText: string | null
}) {
  if (yardsToEndzone == null) return null

  // Field is drawn left-to-right with the possession team's own goal line at
  // 0 and the end zone they're driving toward at 100 - a normalized view,
  // not tied to which side is "really" home/away on the broadcast.
  const ballPct = Math.min(100, Math.max(0, 100 - yardsToEndzone))
  const markerColor = possessionTeam ? `#${possessionTeam.color || '2a78d6'}` : '#2a78d6'

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

      <div className="relative mt-4 h-16 w-full overflow-hidden rounded-md bg-[#2f7a3d]">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <rect x={0} y={0} width={8} height={40} fill="rgba(0,0,0,0.25)" />
          <rect x={92} y={0} width={8} height={40} fill="rgba(0,0,0,0.25)" />
          {YARD_LINES.map((x) => (
            <line
              key={x}
              x1={x}
              y1={0}
              x2={x}
              y2={40}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={0.3}
            />
          ))}
          <line x1={50} y1={0} x2={50} y2={40} stroke="rgba(255,255,255,0.6)" strokeWidth={0.5} />
          <path
            d="M 80 20 L 88 20 M 85 17 L 88 20 L 85 23"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={0.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${ballPct}%`, background: markerColor }}
        />
      </div>
    </section>
  )
}
