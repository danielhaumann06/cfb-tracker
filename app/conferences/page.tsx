import Link from 'next/link'
import { FBS_CONFERENCES } from '@/lib/conferences'

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
                className="flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-[var(--background)]"
              >
                {conf.name}
                <span className="text-[var(--text-muted)]">
                  {conf.shortName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
