import Image from 'next/image'
import Link from 'next/link'
import type { StatLeaderCategory } from '@/lib/espn'

function LeaderRow({
  leader,
  rank,
}: {
  leader: StatLeaderCategory['leaders'][number]
  rank: number
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className="w-4 text-right text-sm text-[var(--text-muted)]">
        {rank}
      </span>
      {leader.headshot ? (
        <Image
          src={leader.headshot}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="h-8 w-8 shrink-0 rounded-full bg-[var(--background)] object-cover"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--background)]" />
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/player/${leader.playerId}`}
          className="block truncate text-sm font-medium hover:underline"
        >
          {leader.playerName}
        </Link>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          {leader.teamLogo && (
            <Image
              src={leader.teamLogo}
              alt=""
              width={14}
              height={14}
              unoptimized
            />
          )}
          {leader.teamAbbreviation}
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold">{leader.value}</span>
    </li>
  )
}

function LeaderGroup({
  title,
  categories,
}: {
  title: string
  categories: StatLeaderCategory[]
}) {
  if (categories.length === 0) return null

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <h4 className="mb-2 text-sm font-medium">{category.displayName}</h4>
            <ul className="divide-y divide-[var(--gridline)] overflow-hidden rounded-lg border border-[var(--border-hairline)]">
              {category.leaders.map((leader, i) => (
                <LeaderRow key={leader.playerId} leader={leader} rank={i + 1} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatLeadersCard({
  categories,
  title = 'Stat Leaders',
  subtitle = 'Power Five leaders this season',
}: {
  categories: StatLeaderCategory[]
  title?: string
  subtitle?: string
}) {
  if (categories.length === 0) return null

  const offense = categories.filter((c) => c.group === 'offense')
  const defense = categories.filter((c) => c.group === 'defense')

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      <div className="mt-4 space-y-6">
        <LeaderGroup title="Offensive Leaders" categories={offense} />
        <LeaderGroup title="Defensive Leaders" categories={defense} />
      </div>
    </section>
  )
}
