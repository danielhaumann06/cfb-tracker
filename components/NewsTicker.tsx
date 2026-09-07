import type { Headline } from '@/lib/espn'

function TickerItem({ item }: { item: Headline }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-2 px-5 text-sm whitespace-nowrap hover:underline"
    >
      {item.headline}
      <span className="text-[var(--text-muted)]">&bull;</span>
    </a>
  )
}

export function NewsTicker({ headlines }: { headlines: Headline[] }) {
  if (headlines.length === 0) return null

  const durationSeconds = Math.max(headlines.length * 6, 20)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--gridline)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
        NEWS
      </div>
      <div className="overflow-hidden py-3">
        <div
          className="animate-ticker flex w-max"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {[...headlines, ...headlines].map((item, i) => (
            <TickerItem key={`${item.url}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
