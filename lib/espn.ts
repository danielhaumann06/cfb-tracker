/* eslint-disable @typescript-eslint/no-explicit-any -- boundary parsing of ESPN's untyped JSON */

const SITE_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/football/college-football'
const CORE_BASE =
  'https://sports.core.api.espn.com/v2/sports/football/leagues/college-football'

export interface TeamSummary {
  id: string
  name: string
  abbreviation: string
  record: string
  standingSummary: string
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
  abbreviation: string
  score: string | null
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

function mapCompetitor(competitor: any): GameTeam {
  const rawScore = competitor.score
  const score =
    rawScore == null
      ? null
      : typeof rawScore === 'object'
        ? (rawScore.displayValue ?? null)
        : String(rawScore)

  return {
    id: competitor.team.id,
    name: competitor.team.displayName,
    abbreviation: competitor.team.abbreviation,
    score,
  }
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
  const logo =
    team.logos?.find((l: any) => l.rel?.includes('default'))?.href ??
    team.logos?.[0]?.href ??
    ''

  return {
    id: team.id,
    name: team.displayName,
    abbreviation: team.abbreviation,
    record: record?.summary ?? '0-0',
    standingSummary: team.standingSummary ?? '',
    color: team.color ?? '000000',
    logo,
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
  }
}

export interface TeamBoxscore {
  teamId: string
  teamName: string
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
  categories: PlayerCategory[]
}

export interface GameBoxscore {
  teams: TeamBoxscore[]
  players: TeamPlayerStats[]
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

export function nextGame(schedule: GameSummary[]): GameSummary | null {
  const now = Date.now()
  const inProgress = schedule.find((g) => g.state === 'in')
  if (inProgress) return inProgress

  const upcoming = schedule
    .filter((g) => g.state === 'pre' && new Date(g.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return upcoming[0] ?? null
}
