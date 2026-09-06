export interface TrackedTeam {
  id: string
  slug: string
}

export const DEFAULT_TEAMS: TrackedTeam[] = [
  { id: '158', slug: 'nebraska-cornhuskers' },
  { id: '2483', slug: 'oregon-ducks' },
  { id: '333', slug: 'alabama-crimson-tide' },
  { id: '59', slug: 'georgia-tech-yellow-jackets' },
  { id: '38', slug: 'colorado-buffaloes' },
]

const TRACKED_TEAMS_COOKIE = 'tracked_teams'
const THEME_TEAM_COOKIE = 'theme_team'
const DEFAULT_THEME_TEAM_ID = DEFAULT_TEAMS[0].id

export function parseTrackedTeamsCookie(
  value: string | undefined
): TrackedTeam[] {
  // No cookie at all -> first visit, seed with the defaults. An explicitly
  // empty string is a real, saved "no teams tracked" state, not a missing cookie.
  if (value === undefined) return DEFAULT_TEAMS
  if (value === '') return []

  const teams = value
    .split(',')
    .map((pair) => {
      const [id, slug] = pair.split(':')
      return id && slug ? { id, slug } : null
    })
    .filter((t): t is TrackedTeam => t !== null)

  return teams
}

export function serializeTrackedTeams(teams: TrackedTeam[]): string {
  return teams.map((t) => `${t.id}:${t.slug}`).join(',')
}

export function parseThemeTeamCookie(value: string | undefined): string {
  return value || DEFAULT_THEME_TEAM_ID
}

export { TRACKED_TEAMS_COOKIE, THEME_TEAM_COOKIE }
