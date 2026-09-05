import type { PlayerCategory, TeamPlayerStats } from '@/lib/espn'
import { groupPlayerCategories } from '@/lib/espn'

const CATEGORY_LABELS: Record<string, string> = {
  passing: 'Passing',
  rushing: 'Rushing',
  receiving: 'Receiving',
  fumbles: 'Fumbles',
  defensive: 'Defense',
  interceptions: 'Interceptions',
  kicking: 'Kicking',
  punting: 'Punting',
  kickReturns: 'Kick Returns',
  puntReturns: 'Punt Returns',
}

function CategoryTable({ category }: { category: PlayerCategory }) {
  if (!category.rows.length) return null

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-hairline)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left text-[var(--text-muted)]">
            <th className="px-3 py-1.5 font-normal">
              {CATEGORY_LABELS[category.name] ?? category.name}
            </th>
            {category.labels.map((label) => (
              <th key={label} className="px-3 py-1.5 text-right font-normal">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {category.rows.map((row) => (
            <tr
              key={row.playerId}
              className="border-b border-[var(--gridline)] last:border-0"
            >
              <td className="px-3 py-1.5">{row.name}</td>
              {row.values.map((value, i) => (
                <td key={i} className="px-3 py-1.5 text-right">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatGroup({
  title,
  categories,
}: {
  title: string
  categories: PlayerCategory[]
}) {
  const withRows = categories.filter((c) => c.rows.length)
  if (!withRows.length) return null

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">
        {title}
      </h4>
      <div className="space-y-3">
        {withRows.map((c) => (
          <CategoryTable key={c.name} category={c} />
        ))}
      </div>
    </div>
  )
}

export function PlayerStatsSection({ team }: { team: TeamPlayerStats }) {
  const { offense, defense, specialTeams } = groupPlayerCategories(
    team.categories
  )

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card)]">
      <h3 className="font-semibold">{team.teamName}</h3>
      <StatGroup title="Offense" categories={offense} />
      <StatGroup title="Defense" categories={defense} />
      <StatGroup title="Special Teams" categories={specialTeams} />
    </div>
  )
}
