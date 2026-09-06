import Link from 'next/link'
import Image from 'next/image'

export interface RankingListEntry {
  rank: number
  id: string
  name: string
  logo: string
  record: string
  slug?: string
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
