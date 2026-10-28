import { describe, expect, it } from 'vitest'
import { formatKickoff } from '@/lib/formatKickoff'

describe('formatKickoff', () => {
  // 23:30 UTC on Sep 5 is 7:30 PM Eastern. This is the regression that
  // shifted every kickoff by 4-5 hours when Vercel ran in UTC.
  const iso = '2026-09-05T23:30:00Z'

  it('pins times to Eastern regardless of the runtime timezone', () => {
    expect(formatKickoff(iso)).toMatch(/^Sat, Sep 5, 7:30\sPM EST$/)
  })

  it('can drop the weekday and date', () => {
    expect(formatKickoff(iso, { weekday: false, monthDay: false })).toMatch(
      /^7:30\sPM EST$/
    )
  })

  it('rolls over to the previous Eastern day for early-UTC kickoffs', () => {
    // 02:00 UTC Sunday is still 10 PM Saturday in the East.
    expect(formatKickoff('2026-09-06T02:00:00Z')).toMatch(/^Sat, Sep 5, 10:00\sPM/)
  })
})
