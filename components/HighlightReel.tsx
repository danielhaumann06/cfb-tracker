import type { GameHighlight } from '@/lib/espn'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function HighlightReel({
  highlights,
}: {
  highlights: GameHighlight[]
}) {
  if (highlights.length === 0) return null

  return (
    <details className="group rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        Highlights
        <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">
          &darr;
        </span>
      </summary>
      <div className="space-y-4 border-t border-[var(--gridline)] px-4 py-3">
        {highlights.map((h) => (
          <div key={h.id}>
            <video
              controls
              preload="none"
              poster={h.thumbnail || undefined}
              className="w-full rounded-lg bg-black"
            >
              <source src={h.hlsUrl} type="application/vnd.apple.mpegurl" />
            </video>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              {h.headline}
              <span className="text-[var(--text-muted)]">
                {' '}
                &middot; {formatDuration(h.duration)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}
