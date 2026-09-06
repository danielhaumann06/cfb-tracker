import Image from 'next/image'
import type { GameTeam } from '@/lib/espn'

function TeamScore({ team }: { team: GameTeam }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {team.logo && (
        <Image src={team.logo} alt="" width={20} height={20} unoptimized />
      )}
      {team.nickname} {team.score}
    </span>
  )
}

export function GameScoreBar({
  away,
  home,
  statusDetail,
  live,
}: {
  away: GameTeam
  home: GameTeam
  statusDetail: string
  live: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)]">
      {live && (
        <span className="rounded-full bg-[var(--seq-fill)] px-2 py-0.5 text-xs font-semibold text-white">
          LIVE
        </span>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
        <TeamScore team={away} />
        <span className="text-[var(--text-muted)]">&mdash;</span>
        <TeamScore team={home} />
      </div>
      <span className="text-sm text-[var(--text-muted)]">{statusDetail}</span>
    </div>
  )
}
