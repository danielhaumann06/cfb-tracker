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
  }
}

// ACC, Big 12, Big Ten, SEC, Pac-12 - the "Power Five" conference group ids.
const POWER_FIVE_GROUPS = ['1', '4', '5', '8', '9']

export interface TickerTeam {
  name: string
  abbreviation: string
  logo: string
  score: string | null
}

export interface LiveTickerGame {
  id: string
  statusDetail: string
  home: TickerTeam
  away: TickerTeam
}

function mapTickerTeam(competitor: any): TickerTeam {
  return {
    name:
      competitor.team.shortDisplayName ??
      competitor.team.displayName ??
      competitor.team.abbreviation,
    abbreviation: competitor.team.abbreviation,
    logo: competitor.team.logo ?? '',
    score: competitor.score ?? null,
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

export interface TeamListEntry {
  id: string
  name: string
  abbreviation: string
  slug: string
  logo: string
}

export async function getAllTeams(): Promise<TeamListEntry[]> {
  const res = await fetch(`${SITE_BASE}/teams?limit=500`, {
    next: { revalidate: 86400 },
  })
  const data = await res.json()
  const teams = data.sports?.[0]?.leagues?.[0]?.teams ?? []

  return teams.map((entry: any) => ({
    id: entry.team.id,
    name: entry.team.displayName,
    abbreviation: entry.team.abbreviation,
    slug: entry.team.slug,
    logo: pickDefaultLogo(entry.team.logos),
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
    conferenceId: team.groups?.id ?? '',
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
  }
}

async function getApPoll(): Promise<any> {
  const res = await fetch(`${SITE_BASE}/rankings`, {
    next: { revalidate: 3600 },
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

export async function getConferenceStandings(groupId: string): Promise<{
  conferenceName: string
  teams: RankedTeam[]
}> {
  const res = await fetch(`${STANDINGS_BASE}?group=${groupId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return { conferenceName: 'Conference', teams: [] }
  const data = await res.json()
  const entries = data.standings?.entries ?? []

  const teams: RankedTeam[] = entries.map((entry: any, i: number) => {
    const overall = entry.stats?.find((s: any) => s.name === 'overall')
    return {
      rank: i + 1,
      id: entry.team.id,
      name: entry.team.displayName,
      logo: pickDefaultLogo(entry.team.logos),
      record: overall?.displayValue ?? '',
    }
  })

  return { conferenceName: data.shortName ?? data.name ?? 'Conference', teams }
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
