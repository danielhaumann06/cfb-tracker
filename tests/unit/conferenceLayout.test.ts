import { describe, expect, it } from 'vitest'
import {
  parseConferenceLayoutCookie,
  serializeConferenceLayout,
} from '@/lib/conferenceLayout'

describe('parseConferenceLayoutCookie', () => {
  it('returns every section exactly once', () => {
    const keys = parseConferenceLayoutCookie('odds,odds,nope,ticker')
    expect(keys.slice(0, 2)).toEqual(['odds', 'ticker'])
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toHaveLength(8)
  })

  it('round-trips through serializeConferenceLayout', () => {
    const keys = parseConferenceLayoutCookie(undefined)
    expect(parseConferenceLayoutCookie(serializeConferenceLayout(keys))).toEqual(keys)
  })
})
