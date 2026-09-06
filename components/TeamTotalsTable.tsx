import Image from 'next/image'
import type { TeamBoxscore } from '@/lib/espn'

export function TeamTotalsTable({ teams }: { teams: TeamBoxscore[] }) {
  const [teamA, teamB] = teams
  if (!teamA || !teamB) return null

  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <table className="w-full table-fixed text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left">
            <th className="w-[36%] px-2 py-2 font-normal text-[var(--text-muted)] sm:px-4"></th>
            {[teamA, teamB].map((t) => (
              <th key={t.teamId} className="px-1 py-2 font-normal sm:px-2">
                <div className="flex items-center gap-1">
                  {t.teamLogo && (
                    <Image
                      src={t.teamLogo}
                      alt=""
                      width={18}
                      height={18}
                      unoptimized
                      className="shrink-0"
                    />
                  )}
                  <span className="truncate">{t.teamNickname}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamA.stats.map((stat) => {
            const other = teamB.stats.find((s) => s.name === stat.name)
            return (
              <tr
                key={stat.name}
                className="border-b border-[var(--gridline)] last:border-0"
              >
                <td className="truncate px-2 py-2 text-[var(--text-muted)] sm:px-4">
                  {stat.label}
                </td>
                <td className="px-1 py-2 sm:px-2">{stat.displayValue}</td>
                <td className="px-1 py-2 sm:px-2">
                  {other?.displayValue ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
