// Hand-curated program history/trivia, verified against ESPN, Wikipedia,
// and team athletics sites - not derived from a live API, since nothing
// exposes "notable program history" as structured data. Deliberately
// phrased around fixed historical facts and milestones (a year, a final
// score, a streak length as of a specific point) rather than anything that
// ticks upward week to week (e.g. Nebraska's sellout streak, which is still
// active) - a live-changing number here would just go stale.
//
// Scoped to the teams actually tracked on this dashboard today. A newly
// tracked team with no entry here simply won't surface trivia (see
// lib/funFacts.ts) until one is added - keyed by ESPN team id.
export const TEAM_TRIVIA: Record<string, string[]> = {
  // Nebraska Cornhuskers
  '158': [
    'Nebraska has sold out every home game at Memorial Stadium since 1962, passing 400 straight sellouts in 2024 - the longest active streak in major college sports.',
    'Nebraska won back-to-back national titles in 1970 and 1971, then three more in the 1990s (1994, 1995, 1997) - five championships in all.',
    "The Tunnel Walk, Nebraska's entrance set to the Alan Parsons Project's \"Sirius,\" debuted in 1994.",
    "Fans have released red balloons after Nebraska's first score since the 1960s.",
    'Nebraska has the 4th-most all-time wins in FBS history and is one of only 11 programs with 800+ career victories.',
  ],
  // Oregon Ducks
  '2483': [
    "Oregon's partnership with Nike co-founder and alum Phil Knight has produced well over 500 different uniform combinations since the early 2000s.",
    'Oregon has no standard home or away uniform - it changes combinations essentially every week, a look pioneered under Nike in the late 1990s.',
    "The Ducks' 2010 team reached the BCS National Championship Game for the first time in program history, falling to Auburn.",
  ],
  // Alabama Crimson Tide
  '333': [
    'Alabama claims 18 national championships, tied for the most of any program in college football history.',
    'Paul "Bear" Bryant won six national titles at Alabama between 1961 and 1979.',
    'Nick Saban added six more national championships at Alabama (2009, 2011, 2012, 2015, 2017, 2020) after arriving in 2007.',
    '"Roll Tide" has been Alabama\'s rallying cry since the 1920s, reportedly coined by a sportswriter describing the team rolling over an opponent in the mud.',
  ],
  // Georgia Tech Yellow Jackets
  '59': [
    "Georgia Tech's 1990 team went from unranked in the preseason to a share of the national title, beating Nebraska 45-21 in the Citrus Bowl to finish 11-0-1.",
    'Georgia Tech won the 1990 UPI Coaches Poll national championship by a single vote over Colorado - who they shared the title with that year.',
    "The Ramblin' Wreck, a 1930 Ford Model A, has led the football team onto Grant Field for nearly 300 games since 1961.",
  ],
  // Colorado Buffaloes
  '38': [
    'Colorado shared the 1990 national championship (AP poll) with Georgia Tech after going 11-1-1, including the infamous "Fifth Down Game" win over Missouri.',
    'In the Fifth Down Game, officials mistakenly gave Colorado an extra down at the goal line, and Colorado scored the winning touchdown on the play that should never have happened.',
    "Folsom Field has hosted Colorado football since 1924, making it one of the oldest stadiums in major college football.",
  ],
}
