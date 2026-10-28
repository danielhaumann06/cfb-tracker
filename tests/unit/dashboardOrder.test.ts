import { describe, expect, it } from 'vitest'
import {
  parseDashboardOrderCookie,
  serializeDashboardOrder,
} from '@/lib/dashboardOrder'

const teams = ['158', '333']

describe('parseDashboardOrderCookie', () => {
  it('uses the default layout on a first visit', () => {
    expect(serializeDashboardOrder(parseDashboardOrderCookie(undefined, teams))).toBe(
      'section:liveTicker,section:newsTicker,team:158,team:333,section:playoffOdds,section:statLeaders'
    )
  })

  it('keeps a saved order and appends anything missing', () => {
    const items = parseDashboardOrderCookie('team:333,section:statLeaders', teams)
    expect(serializeDashboardOrder(items)).toBe(
      'team:333,section:statLeaders,team:158,section:liveTicker,section:playoffOdds,section:newsTicker'
    )
  })

  it('drops untracked teams, unknown sections and duplicates', () => {
    const items = parseDashboardOrderCookie(
      'team:999,section:bogus,team:158,team:158',
      teams
    )
    expect(items.filter((i) => i.type === 'team')).toEqual([
      { type: 'team', id: '158' },
      { type: 'team', id: '333' },
    ])
    expect(items).toHaveLength(6)
  })
})
