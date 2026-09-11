import Image from 'next/image'
import Link from 'next/link'
import type { StatLeaderCategory } from '@/lib/espn'

export interface TeamLeadersPanel {
  teamId: string
  name: string
  slug: string
  logo: string
  record: string
  categories: StatLeaderCategory[]
}

function LeaderRow({ category }: { category: StatLeaderCategory }) {
  const leader = category.leaders[0]
  if (!leader) return null

  return (
    <li className="flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-4">
      {leader.headshot ? (
        <Image
          src={leader.headshot}
          alt=""
          width={28}
          height={28}
          unoptimized
          className="h-7 w-7 shrink-0 rounded-full bg-[var(--background)] object-cover"
        />
      ) : (
        <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--background)]" />
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/player/${leader.playerId}`}
          className="block truncate text-xs font-medium hover:underline sm:text-sm"
        >
          {leader.playerName || 'Unknown'}
        </Link>
        <div className="truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
          {category.displayName}
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold sm:text-sm">{leader.value}</span>
    </li>
  )
}

function TeamPanel({ team }: { team: TeamLeadersPanel }) {
  const categoriesWithLeaders = team.categories.filter((c) => c.leaders.length > 0)

  return (
    <div className="min-w-0">
      <Link
        href={`/team/${team.slug}`}
        className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-[var(--background)]"
      >
        {team.logo && (
          <Image src={team.logo} alt="" width={28} height={28} unoptimized className="shrink-0" />
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium sm:text-base">{team.name}</div>
          <div className="text-xs text-[var(--text-muted)] sm:text-sm">{team.record}</div>
        </div>
      </Link>

      {categoriesWithLeaders.length > 0 ? (
        <ul className="mt-2 divide-y divide-[var(--gridline)] overflow-hidden rounded-lg border border-[var(--border-hairline)] sm:mt-3">
          {categoriesWithLeaders.map((category) => (
            <LeaderRow key={category.name} category={category} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-[var(--text-muted)] sm:mt-3 sm:text-sm">
          No stat leaders available yet.
        </p>
      )}
    </div>
  )
}

export function GameSeasonLeaders({
  away,
  home,
}: {
  away: TeamLeadersPanel
  home: TeamLeadersPanel
}) {
  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Season Leaders</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-6">
        <TeamPanel team={away} />
        <TeamPanel team={home} />
      </div>
    </section>
  )
}
