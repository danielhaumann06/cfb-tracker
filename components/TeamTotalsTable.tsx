import type { TeamBoxscore } from '@/lib/espn'

export function TeamTotalsTable({ teams }: { teams: TeamBoxscore[] }) {
  const [teamA, teamB] = teams
  if (!teamA || !teamB) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left">
            <th className="px-4 py-2 font-normal text-[var(--text-muted)]"></th>
            <th className="px-4 py-2 font-normal">{teamA.teamName}</th>
            <th className="px-4 py-2 font-normal">{teamB.teamName}</th>
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
                <td className="px-4 py-2 text-[var(--text-muted)]">
                  {stat.label}
                </td>
                <td className="px-4 py-2">{stat.displayValue}</td>
                <td className="px-4 py-2">{other?.displayValue ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
