import Link from 'next/link'
import Image from 'next/image'
import { FBS_CONFERENCES } from '@/lib/conferences'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ConferencesPage() {
  const conferences = [...FBS_CONFERENCES].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Conference Breakdown</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Pick a conference for standings, title odds, and the race for the
        championship.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
        <ul>
          {conferences.map((conf, i) => (
            <li
              key={conf.groupId}
              className={i > 0 ? 'border-t border-[var(--gridline)]' : ''}
            >
              <Link
                href={`/conferences/${conf.groupId}`}
                className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium hover:bg-[var(--background)] active:bg-[var(--background)]"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Image
                    src={conf.logo}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="shrink-0"
                  />
                  <span className="truncate">{conf.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-[var(--text-muted)]">
                  {conf.shortName}
                  <ChevronIcon />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
