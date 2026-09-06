export type DashboardSectionKey = 'liveTicker' | 'playoffOdds' | 'rankings'

export type DashboardItem =
  | { type: 'team'; id: string }
  | { type: 'section'; key: DashboardSectionKey }

const SECTION_KEYS: DashboardSectionKey[] = [
  'liveTicker',
  'playoffOdds',
  'rankings',
]

export const DASHBOARD_ORDER_COOKIE = 'dashboard_order'

export function dashboardItemKey(item: DashboardItem): string {
  return item.type === 'team' ? `team:${item.id}` : `section:${item.key}`
}

// No saved cookie (first visit ever) reproduces today's fixed layout:
// Live Ticker, then team cards, then Playoff Odds, then Rankings.
function defaultOrder(trackedTeamIds: string[]): DashboardItem[] {
  return [
    { type: 'section', key: 'liveTicker' },
    ...trackedTeamIds.map((id): DashboardItem => ({ type: 'team', id })),
    { type: 'section', key: 'playoffOdds' },
    { type: 'section', key: 'rankings' },
  ]
}

export function parseDashboardOrderCookie(
  value: string | undefined,
  trackedTeamIds: string[]
): DashboardItem[] {
  if (value === undefined) return defaultOrder(trackedTeamIds)

  const teamIdSet = new Set(trackedTeamIds)
  const seen = new Set<string>()
  const items: DashboardItem[] = []

  for (const token of value.split(',').filter(Boolean)) {
    if (token.startsWith('team:')) {
      const id = token.slice('team:'.length)
      if (teamIdSet.has(id) && !seen.has(token)) {
        items.push({ type: 'team', id })
        seen.add(token)
      }
    } else if (token.startsWith('section:')) {
      const key = token.slice('section:'.length) as DashboardSectionKey
      if (SECTION_KEYS.includes(key) && !seen.has(token)) {
        items.push({ type: 'section', key })
        seen.add(token)
      }
    }
  }

  // A team added since this order was last saved won't be in it yet —
  // append it so newly tracked teams still show up on the dashboard.
  for (const id of trackedTeamIds) {
    const token = `team:${id}`
    if (!seen.has(token)) {
      items.push({ type: 'team', id })
      seen.add(token)
    }
  }

  for (const key of SECTION_KEYS) {
    const token = `section:${key}`
    if (!seen.has(token)) {
      items.push({ type: 'section', key })
      seen.add(token)
    }
  }

  return items
}

export function serializeDashboardOrder(items: DashboardItem[]): string {
  return items.map(dashboardItemKey).join(',')
}
