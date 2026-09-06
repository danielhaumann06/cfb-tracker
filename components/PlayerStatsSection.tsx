import Image from 'next/image'
import Link from 'next/link'
import type { PlayerCategory, TeamPlayerStats } from '@/lib/espn'
import { groupPlayerCategories, STAT_CATEGORY_LABELS } from '@/lib/espn'

const NAME_SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v'])

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  let index = parts.length - 1
  while (
    index > 0 &&
    NAME_SUFFIXES.has(parts[index].toLowerCase().replace(/\.$/, ''))
  ) {
    index--
  }
  return parts[index]
}

function CategoryTable({ category }: { category: PlayerCategory }) {
  if (!category.rows.length) return null

  return (
    <div className="rounded-lg border border-[var(--border-hairline)]">
      <table className="w-full table-fixed text-[11px] sm:text-xs">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left text-[var(--text-muted)]">
            <th className="w-16 truncate px-1.5 py-1 font-normal sm:w-20 sm:px-2">
              {STAT_CATEGORY_LABELS[category.name] ?? category.name}
            </th>
            {category.labels.map((label) => (
              <th key={label} className="px-0.5 py-1 text-right font-normal">
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
              <td
                className="truncate px-1.5 py-1 sm:px-2"
                title={row.name}
              >
                <Link
                  href={`/player/${row.playerId}`}
                  className="underline decoration-[var(--border-hairline)] underline-offset-2 hover:decoration-current"
                >
                  {lastName(row.name)}
                </Link>
              </td>
              {row.values.map((value, i) => (
                <td key={i} className="px-0.5 py-1 text-right">
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
      <h3 className="flex items-center gap-2 font-semibold">
        {team.teamLogo && (
          <Image
            src={team.teamLogo}
            alt=""
            width={22}
            height={22}
            unoptimized
          />
        )}
        {team.teamNickname}
      </h3>
      <StatGroup title="Offense" categories={offense} />
      <StatGroup title="Defense" categories={defense} />
      <StatGroup title="Special Teams" categories={specialTeams} />
    </div>
  )
}
