import Link from 'next/link'
import type { NewsTickerEntry } from '@/lib/funFacts'

function TickerItem({ entry }: { entry: NewsTickerEntry }) {
  if (entry.kind === 'funFact') {
    return (
      <Link
        href={`/team/${entry.fact.teamSlug}`}
        className="flex shrink-0 items-center gap-2 px-5 text-sm whitespace-nowrap hover:underline"
      >
        <span className="font-semibold text-[var(--seq-fill)]">FUN FACT:</span>
        {entry.fact.text}
        <span className="text-[var(--text-muted)]">&bull;</span>
      </Link>
    )
  }

  return (
    <a
      href={entry.headline.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-2 px-5 text-sm whitespace-nowrap hover:underline"
    >
      {entry.headline.headline}
      <span className="text-[var(--text-muted)]">&bull;</span>
    </a>
  )
}

function entryKey(entry: NewsTickerEntry): string {
  return entry.kind === 'headline' ? entry.headline.url : `fact-${entry.fact.teamSlug}-${entry.fact.text}`
}

export function NewsTicker({ entries }: { entries: NewsTickerEntry[] }) {
  if (entries.length === 0) return null

  const durationSeconds = Math.max(entries.length * 6, 20)

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
          {[...entries, ...entries].map((entry, i) => (
            <TickerItem key={`${entryKey(entry)}-${i}`} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  )
}
