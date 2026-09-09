export type ConferenceSectionKey =
  | 'ticker'
  | 'schedule'
  | 'news'
  | 'standings'
  | 'odds'
  | 'raceChart'
  | 'statLeaders'

export const CONFERENCE_SECTION_LABELS: Record<ConferenceSectionKey, string> = {
  ticker: 'This Week Ticker',
  schedule: 'Schedule',
  news: 'News Ticker',
  standings: 'Standings',
  odds: 'Odds to Win the Conference',
  raceChart: 'Race for the Title',
  statLeaders: 'Stat Leaders',
}

const DEFAULT_ORDER: ConferenceSectionKey[] = [
  'ticker',
  'schedule',
  'news',
  'standings',
  'odds',
  'raceChart',
  'statLeaders',
]

export const CONFERENCE_LAYOUT_COOKIE = 'conference_layout'

export function parseConferenceLayoutCookie(
  value: string | undefined
): ConferenceSectionKey[] {
  if (value === undefined) return DEFAULT_ORDER

  const seen = new Set<string>()
  const keys: ConferenceSectionKey[] = []

  for (const token of value.split(',').filter(Boolean)) {
    if (
      (DEFAULT_ORDER as string[]).includes(token) &&
      !seen.has(token)
    ) {
      keys.push(token as ConferenceSectionKey)
      seen.add(token)
    }
  }

  for (const key of DEFAULT_ORDER) {
    if (!seen.has(key)) {
      keys.push(key)
      seen.add(key)
    }
  }

  return keys
}

export function serializeConferenceLayout(
  keys: ConferenceSectionKey[]
): string {
  return keys.join(',')
}
