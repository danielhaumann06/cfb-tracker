'use client'

import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { updateTrackedTeams, setThemeTeam } from '@/app/actions'
import type { TrackedTeam } from '@/lib/teams'

interface TeamOption {
  id: string
  slug: string
  name: string
  abbreviation?: string
  logo: string
}

type View = 'closed' | 'menu' | 'teams' | 'theme'

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string
  onBack?: () => void
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--text-secondary)] underline underline-offset-2"
        >
          &larr; Menu
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onClose}
        className="text-sm text-[var(--text-secondary)] underline underline-offset-2"
      >
        Close
      </button>
      <h2 className="sr-only">{title}</h2>
    </div>
  )
}

export function SettingsMenu({
  trackedTeams,
  trackedTeamOptions,
  themeTeamId,
}: {
  trackedTeams: TrackedTeam[]
  trackedTeamOptions: TeamOption[]
  themeTeamId: string
}) {
  const [view, setView] = useState<View>('closed')
  const [pending, setPending] = useState<TrackedTeam[]>(trackedTeams)
  const [allTeams, setAllTeams] = useState<TeamOption[] | null>(null)
  const [loadingAllTeams, setLoadingAllTeams] = useState(false)
  const [query, setQuery] = useState('')
  const [isSaving, startSaving] = useTransition()
  const [isPickingTheme, startPickingTheme] = useTransition()
  const [saved, setSaved] = useState(false)

  async function openTeams() {
    setView('teams')
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

  function moveTeam(index: number, direction: -1 | 1) {
    setPending((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function save() {
    setSaved(false)
    startSaving(async () => {
      await updateTrackedTeams(pending)
      setSaved(true)
    })
  }

  function pickTheme(id: string) {
    startPickingTheme(async () => {
      await setThemeTeam(id)
    })
  }

  const pendingNames = pending.map(
    (t) =>
      trackedTeamOptions.find((o) => o.id === t.id)?.name ??
      allTeams?.find((o) => o.id === t.id)?.name ??
      t.slug
  )

  const panelWidth =
    view === 'menu' ? 'w-48' : 'w-[min(18rem,calc(100vw-2rem))]'

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setView(view === 'closed' ? 'menu' : 'closed')}
        aria-label="Menu"
        className="flex items-center gap-1.5 rounded-lg p-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--foreground)]"
      >
        <MenuIcon />
      </button>

      {view !== 'closed' && (
        <section
          className={`absolute right-0 top-full z-30 mt-2 max-h-[75vh] ${panelWidth} overflow-y-auto rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card-hover)]`}
        >
          {view === 'menu' && (
            <>
              <PanelHeader title="Menu" onClose={() => setView('closed')} />
              <div className="mt-4 space-y-1">
                <button
                  type="button"
                  onClick={openTeams}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--background)]"
                >
                  Manage Teams
                </button>
                <button
                  type="button"
                  onClick={() => setView('theme')}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--background)]"
                >
                  Theme
                </button>
              </div>
            </>
          )}

          {view === 'teams' && (
            <>
              <PanelHeader
                title="Manage Teams"
                onBack={() => setView('menu')}
                onClose={() => setView('closed')}
              />
              <h3 className="mt-3 text-sm font-semibold text-[var(--text-muted)]">
                Tracked Teams
              </h3>
              {pending.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  No teams tracked yet — search below to add one.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {pending.map((t, i) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <span className="flex-1 truncate">
                        {pendingNames[i]}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveTeam(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${pendingNames[i]} up`}
                        className="rounded px-1.5 py-0.5 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTeam(i, 1)}
                        disabled={i === pending.length - 1}
                        aria-label={`Move ${pendingNames[i]} down`}
                        className="rounded px-1.5 py-0.5 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
                      >
                        &darr;
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTeam(t.id)}
                        aria-label={`Remove ${pendingNames[i]}`}
                        className="rounded px-1.5 py-0.5 text-[var(--text-muted)] hover:text-[var(--foreground)]"
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
                    loadingAllTeams
                      ? 'Loading teams…'
                      : 'Search for a team to add…'
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
            </>
          )}

          {view === 'theme' && (
            <>
              <PanelHeader
                title="Theme"
                onBack={() => setView('menu')}
                onClose={() => setView('closed')}
              />
              {trackedTeamOptions.length > 0 ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trackedTeamOptions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => pickTheme(t.id)}
                        disabled={isPickingTheme}
                        aria-label={`Use ${t.name} colors as the app theme`}
                        className={`rounded-lg border p-1.5 transition ${
                          t.id === themeTeamId
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
                    Recolors the app to match and puts this team&rsquo;s logo
                    next to the header. It also updates your Home Screen icon
                    — remove and re-add the app in Safari to see that change
                    (iOS caches icons per device).
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Track at least one team to pick a theme.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
