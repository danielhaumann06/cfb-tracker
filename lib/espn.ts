/* eslint-disable @typescript-eslint/no-explicit-any -- boundary parsing of ESPN's untyped JSON */

const SITE_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/football/college-football'
const CORE_BASE =
  'https://sports.core.api.espn.com/v2/sports/football/leagues/college-football'
const STANDINGS_BASE =
  'https://site.api.espn.com/apis/v2/sports/football/college-football/standings'
const ATHLETE_BASE =
  'https://site.api.espn.com/apis/common/v3/sports/football/college-football/athletes'
const ATHLETE_STATS_BASE =
  'https://site.web.api.espn.com/apis/common/v3/sports/football/college-football/athletes'

export interface TeamSummary {
  id: string
  name: string
  location: string
  nickname: string
  abbreviation: string
  record: string
  standingSummary: string
  conferenceId: string
  color: string
  logo: string
  wins: number
  losses: number
  pointsForPerGame: number
  pointsAgainstPerGame: number
  streak: number
}

export type GameState = 'pre' | 'in' | 'post'

export interface GameTeam {
  id: string
  name: string
  nickname: string
  abbreviation: string
  logo: string
  score: string | null
  rank: number | null
}

export interface GameSummary {
  id: string
  date: string
  name: string
  shortName: string
  week: number | null
  state: GameState
  completed: boolean
  statusDetail: string
  network: string | null
  home: GameTeam
  away: GameTeam
}

export interface GameOdds {
  details: string | null
  spread: number | null
  overUnder: number | null
}

export interface FpiSummary {
  fpi: number | null
  fpiRank: number | null
  projectedWins: number | null
  projectedLosses: number | null
  strengthOfScheduleRank: number | null
  probMakePlayoffs: number | null
  probWinTitle: number | null
  probWinConference: number | null
}

function currentSeasonYear(date = new Date()): number {
  const year = date.getUTCFullYear()
  return date.getUTCMonth() < 6 ? year - 1 : year
}

function parseStatus(status: any): {
  state: GameState
  completed: boolean
  statusDetail: string
} {
  return {
    state: status.type.state,
    completed: Boolean(status.type.completed),
    statusDetail: status.type.shortDetail ?? status.type.detail,
  }
}

function pickDefaultLogo(logos: any[] | undefined): string {
  return (
    logos?.find((l: any) => l.rel?.includes('default'))?.href ??
    logos?.[0]?.href ??
    ''
  )
}

function mapCompetitor(competitor: any): GameTeam {
  const rawScore = competitor.score
  const score =
    rawScore == null
      ? null
      : typeof rawScore === 'object'
        ? (rawScore.displayValue ?? null)
        : String(rawScore)

  // Different endpoints expose the current AP rank under different shapes:
  // the schedule endpoint uses curatedRank.current (99 = unranked), the
  // game summary endpoint uses a plain rank field that's simply absent
  // when unranked.
  const curatedRank = competitor.curatedRank?.current
  const rank =
    curatedRank != null && curatedRank < 99
      ? curatedRank
      : (competitor.rank ?? null)

  return {
    id: competitor.team.id,
    name: competitor.team.displayName,
    nickname:
      competitor.team.name ??
      competitor.team.shortDisplayName ??
      competitor.team.displayName,
    abbreviation: competitor.team.abbreviation,
    logo: pickDefaultLogo(competitor.team.logos),
    score,
    rank,
  }
}

// ACC, Big 12, Big Ten, SEC, Pac-12 - the "Power Five" conference group ids.
const POWER_FIVE_GROUPS = ['1', '4', '5', '8', '9']

export interface TickerTeam {
  name: string
  abbreviation: string
  logo: string
  score: string | null
  rank: number | null
}

export interface LiveTickerGame {
  id: string
  statusDetail: string
  home: TickerTeam
  away: TickerTeam
}

function mapTickerTeam(competitor: any): TickerTeam {
  // ESPN's scoreboard embeds each competitor's current AP rank directly -
  // 99 is their sentinel for "unranked", not a real rank.
  const curatedRank = competitor.curatedRank?.current
  return {
    name:
      competitor.team.shortDisplayName ??
      competitor.team.displayName ??
      competitor.team.abbreviation,
    abbreviation: competitor.team.abbreviation,
    logo: competitor.team.logo ?? '',
    score: competitor.score ?? null,
    rank: curatedRank != null && curatedRank < 99 ? curatedRank : null,
  }
}

export async function getLivePowerFiveGames(): Promise<LiveTickerGame[]> {
  const results = await Promise.all(
    POWER_FIVE_GROUPS.map(async (group) => {
      const res = await fetch(`${SITE_BASE}/scoreboard?groups=${group}`, {
        next: { revalidate: 30 },
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.events ?? []
    })
  )

  const seen = new Set<string>()
  const games: LiveTickerGame[] = []

  for (const events of results) {
    for (const event of events as any[]) {
      const competition = event.competitions[0]
      if (competition.status.type.state !== 'in') continue
      if (seen.has(event.id)) continue
      seen.add(event.id)

      const home = competition.competitors.find(
        (c: any) => c.homeAway === 'home'
      )
      const away = competition.competitors.find(
        (c: any) => c.homeAway === 'away'
      )

      games.push({
        id: event.id,
        statusDetail:
          competition.status.type.shortDetail ?? competition.status.type.detail,
        home: mapTickerTeam(home),
        away: mapTickerTeam(away),
      })
    }
  }

  return games
}

// Used to fill the dashboard's Live Ticker when nothing is currently live -
// each currently-ranked team's most recently completed game, so it reads
// as a scoreboard recap rather than going blank between game windows.
export async function getTop25Scores(): Promise<LiveTickerGame[]> {
  const { teams } = await getNationalRankings()
  if (teams.length === 0) return []

  const rankById = new Map(teams.map((t) => [t.id, t.rank]))
  const schedules = await Promise.all(
    teams.map((t) => getTeamSchedule(t.id).catch(() => [] as GameSummary[]))
  )

  const seen = new Set<string>()
  const games: LiveTickerGame[] = []

  for (const schedule of schedules) {
    const completed = schedule
      .filter((g) => g.state === 'post')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const game = completed[0]
    if (!game || seen.has(game.id)) continue
    seen.add(game.id)

    games.push({
      id: game.id,
      statusDetail: game.statusDetail,
      home: {
        name: game.home.abbreviation,
        abbreviation: game.home.abbreviation,
        logo: game.home.logo,
        score: game.home.score,
        rank: rankById.get(game.home.id) ?? null,
      },
      away: {
        name: game.away.abbreviation,
        abbreviation: game.away.abbreviation,
        logo: game.away.logo,
        score: game.away.score,
        rank: rankById.get(game.away.id) ?? null,
      },
    })
  }

  return games
}

export interface ConferenceGame {
  id: string
  state: GameState
  statusDetail: string
  date: string
  home: TickerTeam
  away: TickerTeam
}

export async function getConferenceScoreboard(
  groupId: string
): Promise<ConferenceGame[]> {
  const res = await fetch(`${SITE_BASE}/scoreboard?groups=${groupId}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  const data = await res.json()
  const events = data.events ?? []

  return (events as any[]).map((event) => {
    const competition = event.competitions[0]
    const home = competition.competitors.find(
      (c: any) => c.homeAway === 'home'
    )
    const away = competition.competitors.find(
      (c: any) => c.homeAway === 'away'
    )

    return {
      id: event.id,
      date: event.date,
      home: mapTickerTeam(home),
      away: mapTickerTeam(away),
      ...parseStatus(competition.status),
    }
  })
}

export interface ScheduleTeam {
  id: string
  name: string
  abbreviation: string
  logo: string
  slug: string
  score: string | null
  rank: number | null
}

export interface ScheduleGame {
  id: string
  state: GameState
  statusDetail: string
  date: string
  network: string | null
  home: ScheduleTeam
  away: ScheduleTeam
}

export interface ConferenceWeekOption {
  week: number
  label: string
}

export interface ConferenceSchedule {
  weekNumber: number
  weeks: ConferenceWeekOption[]
  games: ScheduleGame[]
}

export async function getConferenceSchedule(
  groupId: string,
  week?: number
): Promise<ConferenceSchedule> {
  const params = new URLSearchParams({ groups: groupId })
  if (week != null) {
    params.set('week', String(week))
    params.set('seasontype', '2')
  }

  const [res, allTeams] = await Promise.all([
    fetch(`${SITE_BASE}/scoreboard?${params.toString()}`, {
      next: { revalidate: 300 },
    }),
    getAllTeams(),
  ])
  if (!res.ok) return { weekNumber: week ?? 1, weeks: [], games: [] }
  const data = await res.json()
  const slugById = new Map(allTeams.map((t) => [t.id, t.slug]))

  // The scoreboard's own calendar lists every regular-season week (label +
  // date range) regardless of which week was requested - use it to build
  // the week picker rather than hardcoding a week count.
  const regularSeason = (data.leagues?.[0]?.calendar ?? []).find(
    (c: any) => c.value === '2'
  )
  const weeks: ConferenceWeekOption[] = (regularSeason?.entries ?? []).map(
    (e: any) => ({ week: Number(e.value), label: e.label })
  )

  const mapScheduleTeam = (competitor: any): ScheduleTeam => {
    const curatedRank = competitor.curatedRank?.current
    return {
      id: competitor.team.id,
      name: competitor.team.shortDisplayName ?? competitor.team.displayName,
      abbreviation: competitor.team.abbreviation,
      logo: competitor.team.logo ?? '',
      slug: slugById.get(competitor.team.id) ?? '',
      score: competitor.score ?? null,
      rank: curatedRank != null && curatedRank < 99 ? curatedRank : null,
    }
  }

  const games: ScheduleGame[] = (data.events ?? []).map((event: any) => {
    const competition = event.competitions[0]
    const home = competition.competitors.find(
      (c: any) => c.homeAway === 'home'
    )
    const away = competition.competitors.find(
      (c: any) => c.homeAway === 'away'
    )

    return {
      id: event.id,
      date: event.date,
      network: competition.broadcasts?.[0]?.names?.[0] ?? null,
      home: mapScheduleTeam(home),
      away: mapScheduleTeam(away),
      ...parseStatus(competition.status),
    }
  })

  return {
    weekNumber: data.week?.number ?? week ?? 1,
    weeks,
    games,
  }
}

export interface TeamListEntry {
  id: string
  name: string
  abbreviation: string
  slug: string
  logo: string
  color: string
}

export async function getAllTeams(): Promise<TeamListEntry[]> {
  // ESPN's full team list (FBS/FCS/D2/D3 combined) is ~760 teams - asking
  // for them all in one request worked, but that response is over 2MB and
  // Next.js silently refuses to cache anything that large, which would
  // make every call hit ESPN fresh. Page through in 500-team chunks (each
  // comfortably cacheable) instead, stopping at the first short page.
  // A lower limit than the true total is also why teams like Missouri
  // State, Southern Miss, Troy, TCU, and South Carolina were missing from
  // search/lookups before this paginated.
  const PAGE_SIZE = 500
  const teams: any[] = []

  for (let page = 1; ; page++) {
    const res = await fetch(
      `${SITE_BASE}/teams?limit=${PAGE_SIZE}&page=${page}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) break
    const data = await res.json()
    const pageTeams = data.sports?.[0]?.leagues?.[0]?.teams ?? []
    teams.push(...pageTeams)
    if (pageTeams.length < PAGE_SIZE) break
  }

  return teams.map((entry: any) => ({
    id: entry.team.id,
    name: entry.team.displayName,
    abbreviation: entry.team.abbreviation,
    slug: entry.team.slug,
    logo: pickDefaultLogo(entry.team.logos),
    color: entry.team.color ?? '',
  }))
}

export async function getTeamSummary(espnId: string): Promise<TeamSummary> {
  const res = await fetch(`${SITE_BASE}/teams/${espnId}`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  const team = data.team
  const record = team.record?.items?.[0]
  const statValue = (name: string) =>
    record?.stats?.find((s: any) => s.name === name)?.value ?? 0

  return {
    id: team.id,
    name: team.displayName,
    location: team.location ?? team.displayName,
    nickname: team.name ?? team.displayName,
    abbreviation: team.abbreviation,
    record: record?.summary ?? '0-0',
    standingSummary: team.standingSummary ?? '',
    // Most teams' own group IS the conference (isConference: true). A
    // divisional conference (e.g. Sun Belt's East/West) instead reports
    // the division's own non-conference group here, with the real
    // conference one level up as its parent - climb to it in that case.
    conferenceId: team.groups?.isConference
      ? team.groups.id
      : (team.groups?.parent?.id ?? team.groups?.id ?? ''),
    color: team.color ?? '000000',
    logo: pickDefaultLogo(team.logos),
    wins: statValue('wins'),
    losses: statValue('losses'),
    pointsForPerGame: statValue('avgPointsFor'),
    pointsAgainstPerGame: statValue('avgPointsAgainst'),
    streak: statValue('streak'),
  }
}

export async function getTeamSchedule(espnId: string): Promise<GameSummary[]> {
  const res = await fetch(`${SITE_BASE}/teams/${espnId}/schedule`, {
    next: { revalidate: 60 },
  })
  const data = await res.json()
  const events = data.events ?? []

  return events.map((event: any) => {
    const competition = event.competitions[0]
    const home = competition.competitors.find(
      (c: any) => c.homeAway === 'home'
    )
    const away = competition.competitors.find(
      (c: any) => c.homeAway === 'away'
    )

    return {
      id: event.id,
      date: event.date,
      name: event.name,
      shortName: event.shortName,
      week: event.week?.number ?? null,
      network: competition.broadcasts?.[0]?.media?.shortName ?? null,
      home: mapCompetitor(home),
      away: mapCompetitor(away),
      ...parseStatus(competition.status),
    }
  })
}

export async function getGameOdds(eventId: string): Promise<GameOdds | null> {
  const res = await fetch(`${SITE_BASE}/summary?event=${eventId}`, {
    next: { revalidate: 60 },
  })
  const data = await res.json()
  const pick = data.pickcenter?.[0]
  if (!pick) return null

  return {
    details: pick.details ?? null,
    spread: pick.spread ?? null,
    overUnder: pick.overUnder ?? null,
  }
}

export async function getGameLiveStatus(eventId: string): Promise<{
  home: GameTeam
  away: GameTeam
  state: GameState
  completed: boolean
  statusDetail: string
}> {
  const res = await fetch(`${SITE_BASE}/summary?event=${eventId}`, {
    next: { revalidate: 30 },
  })
  const data = await res.json()
  const competition = data.header.competitions[0]
  const home = competition.competitors.find((c: any) => c.homeAway === 'home')
  const away = competition.competitors.find((c: any) => c.homeAway === 'away')

  return {
    home: mapCompetitor(home),
    away: mapCompetitor(away),
    ...parseStatus(competition.status),
  }
}

export async function getFpiSummary(espnId: string): Promise<FpiSummary | null> {
  const season = currentSeasonYear()
  const res = await fetch(
    `${CORE_BASE}/seasons/${season}/powerindex/${espnId}`,
    { next: { revalidate: 900 } }
  )
  if (!res.ok) return null
  const data = await res.json()
  const predictives = data.predictives as Array<{ name: string; value?: number }>
  const value = (name: string) =>
    predictives?.find((p) => p.name === name)?.value ?? null

  return {
    fpi: value('fpi'),
    fpiRank: value('fpirank'),
    projectedWins: value('projectedw'),
    projectedLosses: value('projectedl'),
    strengthOfScheduleRank: value('sosremainingrank'),
    probMakePlayoffs: value('probmakeplayoffs'),
    probWinTitle: value('probwintitle'),
    probWinConference: value('probwinconf'),
  }
}

async function getApPoll(): Promise<any> {
  const res = await fetch(`${SITE_BASE}/rankings`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return (
    data.rankings?.find((p: any) => p.name === 'AP Top 25') ??
    data.rankings?.[0] ??
    null
  )
}

export async function getNationalRank(espnId: string): Promise<number | null> {
  const apPoll = await getApPoll()
  const entry = apPoll?.ranks?.find((r: any) => r.team?.id === espnId)
  return entry?.current ?? null
}

export interface RankedTeam {
  rank: number
  id: string
  name: string
  logo: string
  record: string
}

export async function getNationalRankings(): Promise<{
  pollName: string
  teams: RankedTeam[]
}> {
  const apPoll = await getApPoll()
  const teams: RankedTeam[] = (apPoll?.ranks ?? []).map((r: any) => ({
    rank: r.current,
    id: r.team.id,
    name: r.team.displayName ?? `${r.team.location} ${r.team.name}`,
    logo: pickDefaultLogo(r.team.logos),
    record: r.recordSummary ?? '',
  }))
  return { pollName: apPoll?.name ?? 'Rankings', teams }
}

const RANKINGS_CORE_BASE =
  'https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons'

export const POLL_IDS = {
  ap: '1',
  coaches: '2',
  cfp: '21',
} as const

function teamIdFromRef(ref: string | undefined): string {
  return ref?.match(/\/teams\/(\d+)/)?.[1] ?? ''
}

interface RawPollWeek {
  pollName: string
  weekLabel: string
  ranks: { teamId: string; rank: number; record: string; trend: string }[]
  others: { teamId: string; points: number }[]
  droppedOut: { teamId: string; previousRank: number }[]
}

async function fetchPollWeek(
  pollId: string,
  season: number,
  seasonType: number,
  week: number
): Promise<RawPollWeek | null> {
  const res = await fetch(
    `${RANKINGS_CORE_BASE}/${season}/types/${seasonType}/weeks/${week}/rankings/${pollId}?lang=en&region=us`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return null
  const data = await res.json()
  if (!data.ranks?.length) return null

  return {
    pollName: data.name ?? data.shortName ?? 'Poll',
    weekLabel: data.occurrence?.displayValue ?? `Week ${week}`,
    ranks: data.ranks.map((r: any) => ({
      teamId: teamIdFromRef(r.team?.$ref),
      rank: r.current,
      record: r.record?.summary ?? '',
      trend: r.trend ?? '-',
    })),
    others: (data.others ?? []).map((r: any) => ({
      teamId: teamIdFromRef(r.team?.$ref),
      points: r.points,
    })),
    droppedOut: (data.droppedOut ?? []).map((r: any) => ({
      teamId: teamIdFromRef(r.team?.$ref),
      previousRank: r.previous,
    })),
  }
}

export interface PollTimelineTeam {
  id: string
  name: string
  abbreviation: string
  logo: string
  slug: string
  color: string
  record: string
  trend: string
}

export interface PollBubbleTeam {
  id: string
  name: string
  logo: string
  slug: string
  points: number
}

export interface PollDroppedTeam {
  id: string
  name: string
  logo: string
  slug: string
  previousRank: number
}

export interface PollTimeline {
  pollName: string
  weekLabels: string[]
  teams: PollTimelineTeam[]
  ranks: Record<string, (number | null)[]>
  droppedOut: PollDroppedTeam[]
  others: PollBubbleTeam[]
}

async function resolveTeamBasics(id: string): Promise<TeamListEntry | null> {
  const res = await fetch(`${SITE_BASE}/teams/${id}`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null
  const data = await res.json()
  const team = data.team
  if (!team) return null

  return {
    id,
    name: team.displayName ?? '',
    abbreviation: team.abbreviation ?? '',
    slug: team.slug ?? '',
    logo: pickDefaultLogo(team.logos),
    color: team.color ?? '',
  }
}

const MAX_REGULAR_SEASON_WEEKS = 20

export async function getPollTimeline(pollId: string): Promise<PollTimeline> {
  const season = currentSeasonYear()

  const [preseason, ...regularSeasonWeeks] = await Promise.all([
    fetchPollWeek(pollId, season, 1, 1),
    ...Array.from({ length: MAX_REGULAR_SEASON_WEEKS }, (_, i) =>
      fetchPollWeek(pollId, season, 2, i + 1)
    ),
  ])

  // ESPN doesn't index a "week 1" regular-season poll at all - the first
  // real release of the season lands on "week 2" - so a genuine permanent
  // gap can appear before real data resumes. Keep every week that has
  // data rather than stopping at the first miss, in chronological order.
  const weeks: RawPollWeek[] = []
  if (preseason) weeks.push(preseason)
  for (const week of regularSeasonWeeks) {
    if (week) weeks.push(week)
  }

  const latest = weeks.at(-1)
  if (!latest) {
    return {
      pollName: '',
      weekLabels: [],
      teams: [],
      ranks: {},
      droppedOut: [],
      others: [],
    }
  }

  const allTeams = await getAllTeams()
  const infoById = new Map<string, TeamListEntry>(
    allTeams.map((t) => [t.id, t])
  )
  const currentTeamIds = latest.ranks.map((r) => r.teamId)

  // A handful of real teams (a known ESPN data gap - TCU and South
  // Carolina, at time of writing) don't show up in the bulk teams list at
  // all. Resolve those few directly instead of showing a bare numeric id.
  const referencedIds = new Set([
    ...currentTeamIds,
    ...latest.droppedOut.map((d) => d.teamId),
    ...latest.others.map((o) => o.teamId),
  ])
  const missingIds = [...referencedIds].filter((id) => !infoById.has(id))
  if (missingIds.length > 0) {
    const resolved = await Promise.all(
      missingIds.map((id) => resolveTeamBasics(id))
    )
    missingIds.forEach((id, i) => {
      const info = resolved[i]
      if (info) infoById.set(id, info)
    })
  }

  const ranks: Record<string, (number | null)[]> = {}
  for (const teamId of currentTeamIds) {
    ranks[teamId] = weeks.map(
      (w) => w.ranks.find((r) => r.teamId === teamId)?.rank ?? null
    )
  }

  const teams: PollTimelineTeam[] = currentTeamIds.map((id) => {
    const info = infoById.get(id)
    const rankEntry = latest.ranks.find((r) => r.teamId === id)
    return {
      id,
      name: info?.name ?? id,
      abbreviation: info?.abbreviation ?? id,
      logo: info?.logo ?? '',
      slug: info?.slug ?? '',
      color: info?.color ?? '',
      record: rankEntry?.record ?? '',
      trend: rankEntry?.trend ?? '-',
    }
  })

  const droppedOut: PollDroppedTeam[] = latest.droppedOut.map((d) => {
    const info = infoById.get(d.teamId)
    return {
      id: d.teamId,
      name: info?.name ?? d.teamId,
      logo: info?.logo ?? '',
      slug: info?.slug ?? '',
      previousRank: d.previousRank,
    }
  })

  const others: PollBubbleTeam[] = latest.others
    .map((o) => {
      const info = infoById.get(o.teamId)
      return {
        id: o.teamId,
        name: info?.name ?? o.teamId,
        logo: info?.logo ?? '',
        slug: info?.slug ?? '',
        points: o.points,
      }
    })
    .sort((a, b) => b.points - a.points)

  return {
    pollName: latest.pollName,
    weekLabels: weeks.map((w) => w.weekLabel),
    teams,
    ranks,
    droppedOut,
    others,
  }
}

// Most conferences return a flat standings.entries list, but a few (e.g.
// Sun Belt) split into standings-less East/West children instead - fall
// back to flattening those when the top-level list is empty.
function extractStandingsEntries(data: any): any[] {
  const topLevel = data.standings?.entries
  if (topLevel?.length) return topLevel
  const children = data.children ?? []
  return children.flatMap((c: any) => c.standings?.entries ?? [])
}

export async function getConferenceStandings(groupId: string): Promise<{
  conferenceName: string
  teams: RankedTeam[]
}> {
  const res = await fetch(`${STANDINGS_BASE}?group=${groupId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return { conferenceName: 'Conference', teams: [] }
  const data = await res.json()
  const entries = extractStandingsEntries(data)

  const unranked = entries.map((entry: any) => {
    const overall = entry.stats?.find((s: any) => s.name === 'overall')
    const winPct = entry.stats?.find(
      (s: any) => s.name === 'leagueWinPercent'
    )
    return {
      id: entry.team.id,
      name: entry.team.displayName,
      logo: pickDefaultLogo(entry.team.logos),
      record: overall?.displayValue ?? '',
      winPct: winPct?.value ?? 0,
    }
  })

  // Re-sorting by conference win percentage (rather than trusting entry
  // order) keeps ranks correct once divisions above have been flattened
  // together into one list.
  unranked.sort((a: { winPct: number }, b: { winPct: number }) => b.winPct - a.winPct)

  const teams: RankedTeam[] = unranked.map((t, i) => ({
    rank: i + 1,
    id: t.id,
    name: t.name,
    logo: t.logo,
    record: t.record,
  }))

  return { conferenceName: data.shortName ?? data.name ?? 'Conference', teams }
}

export interface ConferenceTimelineTeam {
  id: string
  name: string
  abbreviation: string
  logo: string
  slug: string
  color: string
}

export interface ConferenceTimeline {
  teams: ConferenceTimelineTeam[]
  weeks: number[]
  wins: Record<string, number[]>
}

export async function getConferenceWinLossTimeline(
  groupId: string
): Promise<ConferenceTimeline> {
  const [{ teams: standings }, allTeams] = await Promise.all([
    getConferenceStandings(groupId),
    getAllTeams(),
  ])
  if (standings.length === 0) return { teams: [], weeks: [], wins: {} }

  const infoById = new Map(allTeams.map((t) => [t.id, t]))
  const schedules = await Promise.all(
    standings.map((t) =>
      getTeamSchedule(t.id).catch(() => [] as GameSummary[])
    )
  )

  let maxWeek = 0
  const weekWinByTeam = standings.map((team, i) => {
    const weekWin = new Map<number, boolean>()
    for (const game of schedules[i]) {
      if (game.week === null || game.state !== 'post') continue
      const isHome = game.home.id === team.id
      const self = isHome ? game.home : game.away
      const opponent = isHome ? game.away : game.home
      const selfScore = Number(self.score)
      const oppScore = Number(opponent.score)
      if (Number.isNaN(selfScore) || Number.isNaN(oppScore)) continue
      weekWin.set(game.week, selfScore > oppScore)
      maxWeek = Math.max(maxWeek, game.week)
    }
    return weekWin
  })

  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)
  const wins: Record<string, number[]> = {}

  standings.forEach((team, i) => {
    const weekWin = weekWinByTeam[i]
    let cumulative = 0
    wins[team.id] = weeks.map((week) => {
      if (weekWin.get(week)) cumulative += 1
      return cumulative
    })
  })

  const teams: ConferenceTimelineTeam[] = standings.map((team) => ({
    id: team.id,
    name: team.name,
    // A handful of teams (a known ESPN data gap) don't show up in the
    // teams list this looks up abbreviation/slug/color from - fall back to
    // a short label derived from the name rather than the full name.
    abbreviation:
      infoById.get(team.id)?.abbreviation ??
      team.name.slice(0, 4).toUpperCase(),
    logo: team.logo,
    slug: infoById.get(team.id)?.slug ?? '',
    color: infoById.get(team.id)?.color ?? '',
  }))

  return { teams, weeks, wins }
}

export interface Headline {
  headline: string
  url: string
  published: string
}

export async function getTeamNews(
  espnId: string,
  matchTerms: string[]
): Promise<Headline[]> {
  const res = await fetch(`${SITE_BASE}/news?team=${espnId}`, {
    next: { revalidate: 900 },
  })
  if (!res.ok) return []
  const data = await res.json()
  const articles = data.articles ?? []
  const terms = matchTerms.filter(Boolean).map((t) => t.toLowerCase())

  return articles
    .map((a: any) => ({
      headline: a.headline as string,
      url: (a.links?.web?.href ?? '') as string,
      published: a.published as string,
    }))
    .filter(
      (h: Headline) =>
        h.headline &&
        h.url &&
        terms.some((t) => h.headline.toLowerCase().includes(t))
    )
    .slice(0, 2)
}

export async function getTopHeadlines(limit = 20): Promise<Headline[]> {
  const res = await fetch(`${SITE_BASE}/news?limit=${limit}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const data = await res.json()
  const articles = data.articles ?? []

  return articles
    // "Media" articles are video highlight clips ("X vs Y: Full
    // Highlights"), not written headlines - keep this a text news ticker.
    .filter((a: any) => a.type !== 'Media')
    .map((a: any) => ({
      headline: a.headline as string,
      url: (a.links?.web?.href ?? '') as string,
      published: a.published as string,
    }))
    .filter((h: Headline) => h.headline && h.url)
}

export async function getConferenceNews(groupId: string): Promise<Headline[]> {
  const { teams } = await getConferenceStandings(groupId)
  if (teams.length === 0) return []

  // ESPN's news endpoint ignores a `groups` (conference) filter entirely
  // (confirmed: an invalid group id returns the same general feed as a
  // valid one), so build conference-relevant news by fetching each
  // team's own filtered feed - which does work - and merging them.
  const results = await Promise.all(
    teams.map((t) =>
      fetch(`${SITE_BASE}/news?team=${t.id}&limit=5`, {
        next: { revalidate: 900 },
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  )

  const seen = new Set<string>()
  const articles: (Headline & { published: string })[] = []

  for (const data of results) {
    for (const a of data?.articles ?? []) {
      if (a.type === 'Media') continue
      const url = a.links?.web?.href
      const headline = a.headline
      if (!url || !headline || seen.has(url)) continue
      seen.add(url)
      articles.push({ headline, url, published: a.published ?? '' })
    }
  }

  return articles
    .sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
    )
    .slice(0, 20)
}

export interface StatLeader {
  playerId: string
  playerName: string
  headshot: string
  teamAbbreviation: string
  teamLogo: string
  teamSlug: string
  value: string
}

export type StatLeaderGroup = 'offense' | 'defense'

export interface StatLeaderCategory {
  name: string
  displayName: string
  group: StatLeaderGroup
  leaders: StatLeader[]
}

const STAT_LEADER_CATEGORIES: {
  key: string
  label: string
  group: StatLeaderGroup
}[] = [
  { key: 'passingYards', label: 'Passing', group: 'offense' },
  { key: 'rushingYards', label: 'Rushing', group: 'offense' },
  { key: 'receivingYards', label: 'Receiving', group: 'offense' },
  { key: 'sacks', label: 'Sacks', group: 'defense' },
  { key: 'totalTackles', label: 'Tackles', group: 'defense' },
  { key: 'interceptions', label: 'Interceptions', group: 'defense' },
]

function idFromRef(ref: string | undefined): string {
  return ref?.match(/\/(?:athletes|teams)\/(\d+)/)?.[1] ?? ''
}

async function getPowerFiveTeamIds(): Promise<Set<string>> {
  const results = await Promise.all(
    POWER_FIVE_GROUPS.map((g) =>
      getConferenceStandings(g).catch(() => ({ teams: [] as RankedTeam[] }))
    )
  )
  const ids = new Set<string>()
  for (const { teams } of results) {
    for (const t of teams) ids.add(t.id)
  }
  return ids
}

async function resolvePlayerBasics(
  playerId: string
): Promise<{ name: string; headshot: string } | null> {
  const res = await fetch(`${ATHLETE_BASE}/${playerId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const data = await res.json()
  const athlete = data.athlete
  if (!athlete) return null
  return {
    name: athlete.displayName ?? athlete.fullName ?? '',
    headshot: athlete.headshot?.href ?? '',
  }
}

// ESPN's season leaders endpoint spans all of college football (FBS and
// below), so filter down to Power Five teams (reusing the same
// conference-standings roster already used elsewhere) rather than showing
// whoever leads across every division.
export async function getPowerFiveStatLeaders(): Promise<StatLeaderCategory[]> {
  const season = currentSeasonYear()
  const [res, p5TeamIds, allTeams] = await Promise.all([
    fetch(`${CORE_BASE}/seasons/${season}/types/2/leaders?limit=200`, {
      next: { revalidate: 900 },
    }),
    getPowerFiveTeamIds(),
    getAllTeams(),
  ])
  if (!res.ok) return []
  const data = await res.json()
  const teamById = new Map(allTeams.map((t) => [t.id, t]))

  const categories: StatLeaderCategory[] = []

  for (const wanted of STAT_LEADER_CATEGORIES) {
    const category = (data.categories ?? []).find(
      (c: any) => c.name === wanted.key
    )
    if (!category) continue

    const candidates = (category.leaders ?? [])
      .map((l: any) => ({
        athleteId: idFromRef(l.athlete?.$ref),
        teamId: idFromRef(l.team?.$ref),
        value: l.displayValue as string,
      }))
      .filter((c: any) => c.athleteId && p5TeamIds.has(c.teamId))
      .slice(0, 5)

    const resolvedPlayers = await Promise.all(
      candidates.map((c: any) => resolvePlayerBasics(c.athleteId))
    )

    const leaders: StatLeader[] = candidates.map((c: any, i: number) => {
      const team = teamById.get(c.teamId)
      const player = resolvedPlayers[i]
      return {
        playerId: c.athleteId,
        playerName: player?.name ?? '',
        headshot: player?.headshot ?? '',
        teamAbbreviation: team?.abbreviation ?? '',
        teamLogo: team?.logo ?? '',
        teamSlug: team?.slug ?? '',
        value: c.value,
      }
    })

    if (leaders.length > 0) {
      categories.push({
        name: wanted.key,
        displayName: wanted.label,
        group: wanted.group,
        leaders,
      })
    }
  }

  return categories
}

export interface TeamBoxscore {
  teamId: string
  teamName: string
  teamNickname: string
  teamLogo: string
  stats: { name: string; label: string; displayValue: string }[]
}

export interface PlayerCategory {
  name: string
  labels: string[]
  rows: { playerId: string; name: string; values: string[] }[]
}

export interface TeamPlayerStats {
  teamId: string
  teamName: string
  teamNickname: string
  teamLogo: string
  categories: PlayerCategory[]
}

export interface GameBoxscore {
  teams: TeamBoxscore[]
  players: TeamPlayerStats[]
}

export const STAT_CATEGORY_LABELS: Record<string, string> = {
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
  scoring: 'Scoring',
}

const OFFENSE_CATEGORIES = ['passing', 'rushing', 'receiving', 'fumbles']
const DEFENSE_CATEGORIES = ['defensive', 'interceptions']
const SPECIAL_TEAMS_CATEGORIES = ['kicking', 'punting', 'kickReturns', 'puntReturns']

export function groupPlayerCategories(categories: PlayerCategory[]) {
  return {
    offense: categories.filter((c) => OFFENSE_CATEGORIES.includes(c.name)),
    defense: categories.filter((c) => DEFENSE_CATEGORIES.includes(c.name)),
    specialTeams: categories.filter((c) =>
      SPECIAL_TEAMS_CATEGORIES.includes(c.name)
    ),
  }
}

export interface GameArticleSection {
  heading: string | null
  paragraphs: string[]
}

export interface GameArticle {
  headline: string
  sections: GameArticleSection[]
}

// ESPN's article.story is a wire-service recap: plain text with embedded
// <a> links, ad-hoc <hl2>Heading</hl2> subheadings, and a "----" divider
// before AP syndication boilerplate we don't want to show.
function parseStory(raw: string): GameArticleSection[] {
  const withoutFooter = raw.split(/\n\s*-{4,}\s*\n/)[0]
  const withoutLinks = withoutFooter.replace(
    /<a\b[^>]*>([\s\S]*?)<\/a>/gi,
    '$1'
  )
  const withoutEmptyHeadings = withoutLinks.replace(/<hl2\s*\/>/gi, '')
  const parts = withoutEmptyHeadings.split(/<hl2>(.*?)<\/hl2>/gi)

  const toParagraphs = (text: string) =>
    text
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)

  const sections: GameArticleSection[] = [
    { heading: null, paragraphs: toParagraphs(parts[0]) },
  ]
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({
      heading: parts[i].trim(),
      paragraphs: toParagraphs(parts[i + 1] ?? ''),
    })
  }

  return sections.filter((s) => s.paragraphs.length > 0)
}

export async function getGameArticle(
  eventId: string
): Promise<GameArticle | null> {
  const res = await fetch(`${SITE_BASE}/summary?event=${eventId}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const data = await res.json()
  const article = data.article
  if (!article?.description) return null

  const sections = article.story
    ? parseStory(article.story)
    : [{ heading: null, paragraphs: [article.description] }]

  return {
    headline: article.headline ?? '',
    sections,
  }
}

export interface GameHighlight {
  id: number
  headline: string
  duration: number
  thumbnail: string
  hlsUrl: string
}

export async function getGameHighlights(
  eventId: string
): Promise<GameHighlight[]> {
  const res = await fetch(`${SITE_BASE}/summary?event=${eventId}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const data = await res.json()
  const videos = data.videos ?? []

  return videos
    .map((v: any) => ({
      id: v.id,
      headline: v.headline ?? '',
      duration: v.duration ?? 0,
      thumbnail: v.thumbnail ?? '',
      hlsUrl: v.links?.source?.HLS?.href ?? '',
    }))
    .filter((v: GameHighlight) => v.headline && v.hlsUrl)
}

export async function getGameBoxscore(
  eventId: string
): Promise<GameBoxscore | null> {
  const res = await fetch(`${SITE_BASE}/summary?event=${eventId}`, {
    next: { revalidate: 30 },
  })
  const data = await res.json()
  const boxscore = data.boxscore
  if (!boxscore?.teams?.length) return null

  const teams: TeamBoxscore[] = boxscore.teams.map((entry: any) => ({
    teamId: entry.team.id,
    teamName: entry.team.displayName,
    teamNickname: entry.team.name ?? entry.team.displayName,
    teamLogo: entry.team.logo ?? '',
    stats: entry.statistics.map((s: any) => ({
      name: s.name,
      label: s.label,
      displayValue: s.displayValue,
    })),
  }))

  const players: TeamPlayerStats[] = (boxscore.players ?? []).map(
    (entry: any) => ({
      teamId: entry.team.id,
      teamName: entry.team.displayName,
      teamNickname: entry.team.name ?? entry.team.displayName,
      teamLogo: entry.team.logo ?? '',
      categories: entry.statistics.map((cat: any) => ({
        name: cat.name,
        labels: cat.labels,
        rows: (cat.athletes ?? []).map((a: any) => ({
          playerId: a.athlete.id,
          name: a.athlete.displayName,
          values: a.stats,
        })),
      })),
    })
  )

  return { teams, players }
}

export interface PlayerSeasonStat {
  season: string
  values: string[]
}

export interface PlayerStatCategory {
  name: string
  labels: string[]
  displayNames: string[]
  seasons: PlayerSeasonStat[]
}

export interface PlayerProfile {
  id: string
  name: string
  jersey: string | null
  position: string | null
  headshot: string | null
  height: string | null
  weight: string | null
  team: { id: string; name: string; logo: string } | null
  statCategories: PlayerStatCategory[]
}

export async function getPlayerProfile(
  playerId: string
): Promise<PlayerProfile | null> {
  const [bioRes, statsRes] = await Promise.all([
    fetch(`${ATHLETE_BASE}/${playerId}`, { next: { revalidate: 3600 } }),
    fetch(`${ATHLETE_STATS_BASE}/${playerId}/stats`, {
      next: { revalidate: 3600 },
    }),
  ])
  if (!bioRes.ok) return null

  const bioData = await bioRes.json()
  const athlete = bioData.athlete
  if (!athlete) return null

  const statCategories: PlayerStatCategory[] = []
  if (statsRes.ok) {
    const statsData = await statsRes.json()
    for (const cat of statsData.categories ?? []) {
      const seasons: PlayerSeasonStat[] = (cat.statistics ?? [])
        .map((s: any) => ({
          season: s.season?.displayName ?? String(s.season?.year ?? ''),
          values: s.stats ?? [],
        }))
        .filter((s: PlayerSeasonStat) => s.season)
        .reverse()
      if (seasons.length > 0) {
        statCategories.push({
          name: cat.name,
          labels: cat.labels ?? [],
          displayNames: cat.displayNames ?? [],
          seasons,
        })
      }
    }
  }

  return {
    id: athlete.id,
    name: athlete.displayName ?? athlete.fullName ?? '',
    jersey: athlete.jersey ?? null,
    position: athlete.position?.displayName ?? null,
    headshot: athlete.headshot?.href ?? null,
    height: athlete.displayHeight ?? null,
    weight: athlete.displayWeight ?? null,
    team: athlete.team
      ? {
          id: athlete.team.id,
          name: athlete.team.displayName,
          logo: pickDefaultLogo(athlete.team.logos),
        }
      : null,
    statCategories,
  }
}

export function nextGame(schedule: GameSummary[]): GameSummary | null {
  const now = Date.now()
  const inProgress = schedule.find((g) => g.state === 'in')
  if (inProgress) return inProgress

  const upcoming = schedule
    .filter((g) => g.state === 'pre' && new Date(g.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return upcoming[0] ?? null
}
