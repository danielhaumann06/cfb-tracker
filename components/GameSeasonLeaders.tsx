import Image from 'next/image'
import Link from 'next/link'
import { STAT_LEADER_CATEGORIES, type StatLeader, type StatLeaderCategory } from '@/lib/espn'

export interface TeamLeadersPanel {
  teamId: string
  name: string
  slug: string
  logo: string
  record: string
  categories: StatLeaderCategory[]
}

function TeamHeader({ team, align }: { team: TeamLeadersPanel; align: 'left' | 'right' }) {
  return (
    <Link
      href={`/team/${team.slug}`}
      className={`flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-[var(--background)] ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {team.logo && (
        <Image src={team.logo} alt="" width={28} height={28} unoptimized className="shrink-0" />
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium sm:text-base">{team.name}</div>
        <div className="text-xs text-[var(--text-muted)] sm:text-sm">{team.record}</div>
      </div>
    </Link>
  )
}

function LeaderCell({
  leader,
  align,
}: {
  leader: StatLeader | undefined
  align: 'left' | 'right'
}) {
  if (!leader) {
    return <div className="min-w-0 text-xs text-[var(--text-muted)]">&mdash;</div>
  }

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
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
      <div className="min-w-0">
        <Link
          href={`/player/${leader.playerId}`}
          className="block truncate text-xs font-medium hover:underline sm:text-sm"
        >
          {leader.playerName || 'Unknown'}
        </Link>
        <div className="text-xs font-semibold sm:text-sm">{leader.value}</div>
      </div>
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
  const rows = STAT_LEADER_CATEGORIES.map((wanted) => {
    const awayCategory = away.categories.find((c) => c.name === wanted.key)
    const homeCategory = home.categories.find((c) => c.name === wanted.key)
    return {
      key: wanted.key,
      label: awayCategory?.displayName ?? homeCategory?.displayName ?? wanted.label,
      awayLeader: awayCategory?.leaders[0],
      homeLeader: homeCategory?.leaders[0],
    }
  }).filter((row) => row.awayLeader || row.homeLeader)

  return (
    <section className="rounded-xl bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-semibold">Season Leaders</h2>

      <div className="mt-4 flex items-center justify-between gap-3">
        <TeamHeader team={away} align="left" />
        <TeamHeader team={home} align="right" />
      </div>

      {rows.length > 0 ? (
        <div className="mt-4 divide-y divide-[var(--gridline)]">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 sm:gap-4"
            >
              <LeaderCell leader={row.awayLeader} align="left" />
              <span className="shrink-0 px-1 text-center text-[10px] text-[var(--text-muted)] sm:text-xs">
                {row.label}
              </span>
              <LeaderCell leader={row.homeLeader} align="right" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--text-muted)]">No stat leaders available yet.</p>
      )}
    </section>
  )
}
