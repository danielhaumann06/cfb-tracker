import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPlayerProfile, STAT_CATEGORY_LABELS } from '@/lib/espn'
import type { PlayerStatCategory } from '@/lib/espn'

function SeasonStatsTable({ category }: { category: PlayerStatCategory }) {
  return (
    <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <h2 className="px-4 pt-3 font-semibold">
        {STAT_CATEGORY_LABELS[category.name] ?? category.name}
      </h2>
      <div className="p-4">
        <table className="w-full table-fixed text-[11px] sm:text-xs">
          <thead>
            <tr className="border-b border-[var(--gridline)] text-left text-[var(--text-muted)]">
              <th className="w-14 truncate px-1.5 py-1 font-normal sm:w-20 sm:px-2">
                Season
              </th>
              {category.labels.map((label, i) => (
                <th
                  key={label}
                  className="px-0.5 py-1 text-right font-normal"
                  title={category.displayNames[i]}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {category.seasons.map((s) => (
              <tr
                key={s.season}
                className="border-b border-[var(--gridline)] last:border-0"
              >
                <td className="truncate px-1.5 py-1 sm:px-2">{s.season}</td>
                {s.values.map((value, i) => (
                  <td key={i} className="px-0.5 py-1 text-right">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params

  const profile = await getPlayerProfile(playerId)
  if (!profile) notFound()

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-4">
        {profile.headshot && (
          <Image
            src={profile.headshot}
            alt=""
            width={128}
            height={128}
            unoptimized
            priority
            className="h-20 w-20 shrink-0 rounded-full bg-[var(--surface-1)] object-cover sm:h-28 sm:w-28"
          />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{profile.name}</h1>
          <p className="text-[var(--text-secondary)]">
            {[
              profile.position,
              profile.jersey ? `#${profile.jersey}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {profile.team && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              {profile.team.logo && (
                <Image
                  src={profile.team.logo}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              )}
              {profile.team.name}
            </div>
          )}
          {(profile.height || profile.weight) && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {[profile.height, profile.weight].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {profile.statCategories.length > 0 ? (
        <div className="mt-6 space-y-4">
          {profile.statCategories.map((category) => (
            <SeasonStatsTable key={category.name} category={category} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-[var(--text-muted)]">
          No stats available for this player.
        </p>
      )}
    </main>
  )
}
