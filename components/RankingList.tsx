import Link from 'next/link'
import Image from 'next/image'

export interface RankingListEntry {
  rank: number
  id: string
  name: string
  logo: string
  record: string
  slug?: string
  trend?: string
}

function TrendBadge({ trend }: { trend: string }) {
  // Always reserve the same width, even with nothing to show, so team
  // logos/names still line up across rows within the same list.
  if (!trend || trend === '-') {
    return <span className="w-9 shrink-0" />
  }
  const isUp = trend.startsWith('+')

  return (
    <span
      className={`w-9 shrink-0 text-right text-xs font-semibold ${
        isUp
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {trend}
    </span>
  )
}

export function RankingList({ entries }: { entries: RankingListEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-[var(--text-muted)]">No rankings available.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <ul>
        {entries.map((entry, i) => {
          const content = (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-right text-sm text-[var(--text-muted)]">
                {entry.rank}
              </span>
              {entry.trend !== undefined && <TrendBadge trend={entry.trend} />}
              {entry.logo && (
                <Image
                  src={entry.logo}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="shrink-0"
                />
              )}
              <span className="flex-1 truncate text-sm font-medium">
                {entry.name}
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                {entry.record}
              </span>
            </div>
          )

          return (
            <li
              key={entry.id}
              className={i > 0 ? 'border-t border-[var(--gridline)]' : ''}
            >
              {entry.slug ? (
                <Link
                  href={`/team/${entry.slug}`}
                  className="block hover:bg-[var(--background)]"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
