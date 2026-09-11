'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type {
  ConferenceSchedule as ConferenceScheduleData,
  ScheduleGame,
  ScheduleTeam,
} from '@/lib/espn'

function formatKickoff(dateIso: string): string {
  return new Date(dateIso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TeamLink({ team }: { team: ScheduleTeam }) {
  const content = (
    <span className="flex min-w-0 items-center gap-1.5">
      {team.logo && (
        <Image
          src={team.logo}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="shrink-0"
        />
      )}
      {team.rank != null && (
        <span className="shrink-0 text-[var(--text-muted)]">
          #{team.rank}
        </span>
      )}
      <span className="truncate">{team.name}</span>
    </span>
  )

  return team.slug ? (
    <Link href={`/team/${team.slug}`} className="min-w-0 hover:underline">
      {content}
    </Link>
  ) : (
    <div className="min-w-0">{content}</div>
  )
}

function ScheduleRow({ game }: { game: ScheduleGame }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <TeamLink team={game.away} />
        <TeamLink team={game.home} />
      </div>
      <div className="shrink-0 text-right text-xs text-[var(--text-muted)]">
        <div>{formatKickoff(game.date)}</div>
        {game.state !== 'pre' && (
          <div>
            {game.away.score ?? 0}-{game.home.score ?? 0} &middot;{' '}
            {game.statusDetail}
          </div>
        )}
        {game.network && <div>{game.network}</div>}
      </div>
    </li>
  )
}

export function ConferenceSchedule({
  groupId,
  initialSchedule,
}: {
  groupId: string
  initialSchedule: ConferenceScheduleData
}) {
  const [schedule, setSchedule] = useState(initialSchedule)
  const [loading, setLoading] = useState(false)

  const currentIndex = schedule.weeks.findIndex(
    (w) => w.week === schedule.weekNumber
  )
  const currentLabel =
    schedule.weeks[currentIndex]?.label ?? `Week ${schedule.weekNumber}`

  async function goToWeek(week: number) {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/conference-schedule/${groupId}?week=${week}`
      )
      if (res.ok) setSchedule(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="group rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        Schedule
        <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">
          &darr;
        </span>
      </summary>
      <div className="border-t border-[var(--gridline)] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToWeek(schedule.weeks[currentIndex - 1].week)}
            disabled={currentIndex <= 0}
            aria-label="Previous week"
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
          >
            &larr;
          </button>
          <span className="text-sm font-medium">{currentLabel}</span>
          <button
            type="button"
            onClick={() => goToWeek(schedule.weeks[currentIndex + 1].week)}
            disabled={
              currentIndex === -1 || currentIndex >= schedule.weeks.length - 1
            }
            aria-label="Next week"
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
          >
            &rarr;
          </button>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-[var(--text-muted)]">
            Loading&hellip;
          </p>
        ) : schedule.games.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-muted)]">
            No games scheduled.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--gridline)]">
            {schedule.games.map((game) => (
              <ScheduleRow key={game.id} game={game} />
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}
