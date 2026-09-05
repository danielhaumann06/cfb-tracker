'use server'

import { cookies } from 'next/headers'
import {
  TRACKED_TEAMS_COOKIE,
  ICON_TEAM_COOKIE,
  serializeTrackedTeams,
  type TrackedTeam,
} from '@/lib/teams'

const ONE_YEAR = 60 * 60 * 24 * 365

export async function updateTrackedTeams(teams: TrackedTeam[]) {
  const cookieStore = await cookies()
  cookieStore.set(TRACKED_TEAMS_COOKIE, serializeTrackedTeams(teams), {
    maxAge: ONE_YEAR,
    path: '/',
  })
}

export async function setIconTeam(id: string) {
  const cookieStore = await cookies()
  cookieStore.set(ICON_TEAM_COOKIE, id, {
    maxAge: ONE_YEAR,
    path: '/',
  })
}
