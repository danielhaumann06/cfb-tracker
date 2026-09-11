import type { Headline, TeamSummary } from './espn'
import { TEAM_TRIVIA } from './teamTrivia'

export interface FunFact {
  text: string
  teamSlug: string
}

interface TeamBundle {
  slug: string
  team: TeamSummary
  nationalRank: number | null
}

// A small amount of live-stat flavor (current streak, AP rank) mixed with
// the hand-curated program history/trivia in lib/teamTrivia.ts - trivia
// makes up most of the pool since that's the actual "fun fact" ask (program
// history, streaks, championships), not routine per-week stats.
function candidateFacts(bundle: TeamBundle): string[] {
  const { team, nationalRank } = bundle
  const name = team.name
  const facts: string[] = [...(TEAM_TRIVIA[team.id] ?? [])]

  if (team.streak > 0) {
    facts.push(
      `${name} ${team.streak === 1 ? 'won its last game' : `is on a ${team.streak}-game win streak`}.`
    )
  } else if (team.streak < 0) {
    const losses = Math.abs(team.streak)
    facts.push(`${name} ${losses === 1 ? 'lost its last game' : `has dropped ${losses} straight`}.`)
  }

  if (nationalRank != null) {
    facts.push(`${name} is ranked #${nationalRank} in the latest AP poll.`)
  }

  return facts
}

// Picks one fact per team so the same team doesn't flood the ticker with
// every stat at once, rotating which fact shows day to day rather than
// always the same one.
export function buildFunFacts(bundles: TeamBundle[]): FunFact[] {
  const dayIndex = Math.floor(Date.now() / 86_400_000)

  return bundles.flatMap((bundle) => {
    const facts = candidateFacts(bundle)
    if (facts.length === 0) return []

    const index = (dayIndex + Number(bundle.team.id || 0)) % facts.length
    return [{ text: facts[index], teamSlug: bundle.slug }]
  })
}

export type NewsTickerEntry =
  | { kind: 'headline'; headline: Headline }
  | { kind: 'funFact'; fact: FunFact }

// Sprinkles fun facts into the headline list rather than clustering them -
// roughly one every `everyN` headlines, cycling through whatever facts are
// available; leftover facts (more facts than headline gaps) get tacked on
// the end instead of being dropped.
export function interleaveWithFunFacts(
  headlines: Headline[],
  facts: FunFact[],
  everyN = 5
): NewsTickerEntry[] {
  if (facts.length === 0) {
    return headlines.map((headline) => ({ kind: 'headline', headline }))
  }

  const entries: NewsTickerEntry[] = []
  let factIndex = 0

  headlines.forEach((headline, i) => {
    entries.push({ kind: 'headline', headline })
    if ((i + 1) % everyN === 0 && factIndex < facts.length) {
      entries.push({ kind: 'funFact', fact: facts[factIndex] })
      factIndex += 1
    }
  })

  while (factIndex < facts.length) {
    entries.push({ kind: 'funFact', fact: facts[factIndex] })
    factIndex += 1
  }

  return entries
}
