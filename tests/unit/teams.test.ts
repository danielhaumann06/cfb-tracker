import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TEAMS,
  parseThemeTeamCookie,
  parseTrackedTeamsCookie,
  serializeTrackedTeams,
} from '@/lib/teams'

describe('parseTrackedTeamsCookie', () => {
  it('seeds the defaults on a first visit', () => {
    expect(parseTrackedTeamsCookie(undefined)).toEqual(DEFAULT_TEAMS)
  })

  it('treats an empty cookie as a saved "no teams" state', () => {
    expect(parseTrackedTeamsCookie('')).toEqual([])
  })

  it('drops malformed entries', () => {
    expect(parseTrackedTeamsCookie('158:nebraska-cornhuskers,bad,:x,9:')).toEqual([
      { id: '158', slug: 'nebraska-cornhuskers' },
    ])
  })

  it('round-trips through serializeTrackedTeams', () => {
    expect(parseTrackedTeamsCookie(serializeTrackedTeams(DEFAULT_TEAMS))).toEqual(
      DEFAULT_TEAMS
    )
  })
})

describe('parseThemeTeamCookie', () => {
  it('falls back to the first default team', () => {
    expect(parseThemeTeamCookie(undefined)).toBe(DEFAULT_TEAMS[0].id)
    expect(parseThemeTeamCookie('333')).toBe('333')
  })
})
