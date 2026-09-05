export interface TrackedTeam {
  slug: string
  espnId: string
  name: string
}

export const TRACKED_TEAMS: TrackedTeam[] = [
  { slug: 'nebraska', espnId: '158', name: 'Nebraska Cornhuskers' },
  { slug: 'oregon', espnId: '2483', name: 'Oregon Ducks' },
  { slug: 'alabama', espnId: '333', name: 'Alabama Crimson Tide' },
  { slug: 'georgia-tech', espnId: '59', name: 'Georgia Tech Yellow Jackets' },
]

export function getTrackedTeam(slug: string): TrackedTeam | undefined {
  return TRACKED_TEAMS.find((t) => t.slug === slug)
}
