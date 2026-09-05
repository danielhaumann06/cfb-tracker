'use client'

import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { updateTrackedTeams, setIconTeam } from '@/app/actions'
import type { TrackedTeam } from '@/lib/teams'

interface TeamOption {
  id: string
  slug: string
  name: string
  abbreviation?: string
  logo: string
}

export function ManageTeamsPanel({
  trackedTeams,
  trackedTeamOptions,
  iconTeamId,
}: {
  trackedTeams: TrackedTeam[]
  trackedTeamOptions: TeamOption[]
  iconTeamId: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<TrackedTeam[]>(trackedTeams)
  const [allTeams, setAllTeams] = useState<TeamOption[] | null>(null)
  const [loadingAllTeams, setLoadingAllTeams] = useState(false)
  const [query, setQuery] = useState('')
  const [isSaving, startSaving] = useTransition()
  const [isPickingIcon, startPickingIcon] = useTransition()
  const [saved, setSaved] = useState(false)

  async function handleOpen() {
    setOpen(true)
    if (allTeams || loadingAllTeams) return
    setLoadingAllTeams(true)
    try {
      const res = await fetch('/api/teams/all')
      setAllTeams(await res.json())
    } finally {
      setLoadingAllTeams(false)
    }
  }

  const results = useMemo(() => {
    if (!query.trim() || !allTeams) return []
    const q = query.trim().toLowerCase()
    const pendingIds = new Set(pending.map((t) => t.id))
    return allTeams
      .filter(
        (t) =>
          !pendingIds.has(t.id) &&
          (t.name.toLowerCase().includes(q) ||
            t.abbreviation?.toLowerCase().includes(q))
      )
      .slice(0, 8)
  }, [query, allTeams, pending])

  function addTeam(team: TeamOption) {
    setPending((prev) => [...prev, { id: team.id, slug: team.slug }])
    setQuery('')
  }

  function removeTeam(id: string) {
    setPending((prev) => prev.filter((t) => t.id !== id))
  }

  function save() {
    setSaved(false)
    startSaving(async () => {
      await updateTrackedTeams(pending)
      setSaved(true)
    })
  }

  function pickIcon(id: string) {
    startPickingIcon(async () => {
      await setIconTeam(id)
    })
  }

  const pendingNames = pending.map(
    (t) =>
      trackedTeamOptions.find((o) => o.id === t.id)?.name ??
      allTeams?.find((o) => o.id === t.id)?.name ??
      t.slug
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="text-sm text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--foreground)]"
      >
        Manage teams
      </button>
    )
  }

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Manage Teams</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-[var(--text-secondary)] underline underline-offset-2"
        >
          Done
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-[var(--text-muted)]">
          Tracked Teams
        </h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            No teams tracked yet — search below to add one.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {pending.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--background)] px-3 py-1 text-sm"
              >
                {pendingNames[i]}
                <button
                  type="button"
                  onClick={() => removeTeam(t.id)}
                  aria-label={`Remove ${pendingNames[i]}`}
                  className="text-[var(--text-muted)] hover:text-[var(--foreground)]"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mt-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              loadingAllTeams ? 'Loading teams…' : 'Search for a team to add…'
            }
            disabled={loadingAllTeams}
            className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--seq-fill)]"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card-hover)]">
              {results.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => addTeam(t)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--background)]"
                  >
                    {t.logo && (
                      <Image
                        src={t.logo}
                        alt=""
                        width={20}
                        height={20}
                        unoptimized
                      />
                    )}
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="mt-3 rounded-lg bg-[var(--seq-fill)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && !isSaving && (
          <span className="ml-2 text-sm text-[var(--text-muted)]">
            Saved.
          </span>
        )}
      </div>

      {trackedTeamOptions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--text-muted)]">
            Home Screen Icon
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {trackedTeamOptions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickIcon(t.id)}
                disabled={isPickingIcon}
                aria-label={`Use ${t.name} as home screen icon`}
                className={`rounded-lg border p-1.5 transition ${
                  t.id === iconTeamId
                    ? 'border-[var(--seq-fill)]'
                    : 'border-[var(--border-hairline)]'
                }`}
              >
                {t.logo && (
                  <Image
                    src={t.logo}
                    alt={t.name}
                    width={32}
                    height={32}
                    unoptimized
                  />
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            iOS caches home-screen icons per device — remove and re-add the
            app to your Home Screen in Safari to see a change.
          </p>
        </div>
      )}
    </section>
  )
}
