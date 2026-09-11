import type { FpiSummary, GameOdds, GameSummary, Headline, TeamSummary } from './espn'

export interface FunFact {
  text: string
  teamSlug: string
}

interface TeamBundle {
  slug: string
  team: TeamSummary
  fpi: FpiSummary | null
  next: GameSummary | null
  odds: GameOdds | null
  nationalRank: number | null
}

function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}

// Every fact here is derived straight from data the dashboard already
// fetches for this team (record, streak, FPI, next game/odds) - no
// fabricated or hardcoded trivia, since those numbers change every week and
// a stale "fun fact" would just be wrong.
function candidateFacts(bundle: TeamBundle): string[] {
  const { team, fpi, next, odds, nationalRank } = bundle
  const name = team.name
  const possessiveName = possessive(name)
  const facts: string[] = []

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

  if (fpi?.fpiRank != null) {
    facts.push(`${possessiveName} FPI ranks them #${fpi.fpiRank} nationally.`)
  }

  if (fpi?.probMakePlayoffs != null && fpi.probMakePlayoffs > 0) {
    facts.push(
      `${name} has a ${Math.round(fpi.probMakePlayoffs)}% chance to make the College Football Playoff, per FPI.`
    )
  }

  if (team.pointsForPerGame > 0) {
    facts.push(`${name} is averaging ${team.pointsForPerGame.toFixed(1)} points per game this season.`)
  }

  if (team.standingSummary) {
    facts.push(`${name} sits ${team.standingSummary}.`)
  }

  if (next?.state === 'pre') {
    const isHome = next.home.id === team.id
    const opponent = isHome ? next.away : next.home
    const weekday = new Date(next.date).toLocaleDateString('en-US', { weekday: 'long' })
    facts.push(`${possessiveName} next game is ${weekday}, ${isHome ? 'vs.' : 'at'} ${opponent.name}.`)

    if (odds?.details) {
      facts.push(`${possessiveName} next game: ${odds.details}.`)
    }
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
