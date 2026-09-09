import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { ConferenceTicker } from '@/components/ConferenceTicker'
import { ConferenceSchedule } from '@/components/ConferenceSchedule'
import { ConferenceOddsTracker } from '@/components/ConferenceOddsTracker'
import { ConferenceLayoutMenu } from '@/components/ConferenceLayoutMenu'
import { WinLossRaceChart } from '@/components/WinLossRaceChart'
import { RankingList } from '@/components/RankingList'
import { NewsTicker } from '@/components/NewsTicker'
import { StatLeadersCard } from '@/components/StatLeadersCard'
import { AutoRefresh } from '@/components/AutoRefresh'
import { FBS_CONFERENCES } from '@/lib/conferences'
import {
  CONFERENCE_LAYOUT_COOKIE,
  parseConferenceLayoutCookie,
} from '@/lib/conferenceLayout'
import {
  getConferenceScoreboard,
  getConferenceSchedule,
  getConferenceStandings,
  getConferenceWinLossTimeline,
  getConferenceNews,
  getConferenceStatLeaders,
  getAllTeams,
  getFpiSummary,
  type RankedTeam,
  type ConferenceGame,
  type ConferenceSchedule as ConferenceScheduleData,
  type TeamListEntry,
  type ConferenceTimeline,
  type Headline,
  type StatLeaderCategory,
} from '@/lib/espn'

export default async function ConferenceBreakdownPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const conference = FBS_CONFERENCES.find((c) => c.groupId === groupId)
  if (!conference) notFound()

  const cookieStore = await cookies()
  const sectionOrder = parseConferenceLayoutCookie(
    cookieStore.get(CONFERENCE_LAYOUT_COOKIE)?.value
  )

  let conferenceName: string
  let teams: RankedTeam[]
  let games: ConferenceGame[]
  let allTeams: TeamListEntry[]
  let timeline: ConferenceTimeline
  let news: Headline[]
  let schedule: ConferenceScheduleData
  let statLeaders: StatLeaderCategory[]
  try {
    ;[
      { conferenceName, teams },
      games,
      allTeams,
      timeline,
      news,
      schedule,
      statLeaders,
    ] = await Promise.all([
      getConferenceStandings(groupId),
      getConferenceScoreboard(groupId),
      getAllTeams(),
      getConferenceWinLossTimeline(groupId),
      getConferenceNews(groupId),
      getConferenceSchedule(groupId),
      getConferenceStatLeaders(groupId),
    ])
  } catch {
    notFound()
  }
  if (teams.length === 0) notFound()

  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))
  const fpiByTeam = await Promise.all(
    teams.map((t) => getFpiSummary(t.id).catch(() => null))
  )
  const oddsRows = teams.map((t, i) => ({
    id: t.id,
    slug: slugById.get(t.id),
    name: t.name,
    logo: t.logo,
    probWinConference: fpiByTeam[i]?.probWinConference ?? null,
  }))

  const sections: Record<(typeof sectionOrder)[number], ReactNode> = {
    ticker: (
      <div className="mt-6">
        <ConferenceTicker groupId={groupId} initialGames={games} />
      </div>
    ),
    schedule: (
      <div className="mt-6">
        <ConferenceSchedule groupId={groupId} initialSchedule={schedule} />
      </div>
    ),
    news: (
      <div className="mt-6">
        <NewsTicker headlines={news} />
      </div>
    ),
    standings: (
      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Standings</h2>
        <RankingList
          entries={teams.map((t) => ({ ...t, slug: slugById.get(t.id) }))}
        />
      </section>
    ),
    odds: (
      <div className="mt-6">
        <ConferenceOddsTracker
          conferenceName={conferenceName}
          teams={oddsRows}
        />
      </div>
    ),
    raceChart: (
      <section className="mt-6 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold">Race for the Title</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Cumulative wins by week - tap a team&rsquo;s name to open their page
        </p>
        <div className="mt-4">
          <WinLossRaceChart timeline={timeline} />
        </div>
      </section>
    ),
    statLeaders: (
      <div className="mt-6">
        <StatLeadersCard
          categories={statLeaders}
          subtitle={`${conferenceName} leaders this season`}
        />
      </div>
    ),
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-8 sm:px-6">
      <AutoRefresh />
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex min-w-0 items-center gap-2.5 text-2xl font-semibold">
          <Image
            src={conference.logo}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="shrink-0"
          />
          <span className="truncate">{conferenceName}</span>
        </h1>
        <ConferenceLayoutMenu initialOrder={sectionOrder} />
      </div>

      {sectionOrder.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}
    </main>
  )
}
