'use server'

import { cookies } from 'next/headers'
import {
  TRACKED_TEAMS_COOKIE,
  THEME_TEAM_COOKIE,
  serializeTrackedTeams,
  type TrackedTeam,
} from '@/lib/teams'
import {
  DASHBOARD_ORDER_COOKIE,
  serializeDashboardOrder,
  type DashboardItem,
} from '@/lib/dashboardOrder'
import {
  CONFERENCE_LAYOUT_COOKIE,
  serializeConferenceLayout,
  type ConferenceSectionKey,
} from '@/lib/conferenceLayout'

const ONE_YEAR = 60 * 60 * 24 * 365

export async function updateTrackedTeams(teams: TrackedTeam[]) {
  const cookieStore = await cookies()
  cookieStore.set(TRACKED_TEAMS_COOKIE, serializeTrackedTeams(teams), {
    maxAge: ONE_YEAR,
    path: '/',
  })
}

export async function setThemeTeam(id: string) {
  const cookieStore = await cookies()
  cookieStore.set(THEME_TEAM_COOKIE, id, {
    maxAge: ONE_YEAR,
    path: '/',
  })
}

export async function updateDashboardOrder(items: DashboardItem[]) {
  const cookieStore = await cookies()
  cookieStore.set(DASHBOARD_ORDER_COOKIE, serializeDashboardOrder(items), {
    maxAge: ONE_YEAR,
    path: '/',
  })
}

export async function updateConferenceLayout(keys: ConferenceSectionKey[]) {
  const cookieStore = await cookies()
  cookieStore.set(CONFERENCE_LAYOUT_COOKIE, serializeConferenceLayout(keys), {
    maxAge: ONE_YEAR,
    path: '/',
  })
}
