export interface FbsConference {
  groupId: string
  name: string
  shortName: string
}

// ESPN's FBS conference group ids, confirmed live via the standings/groups
// API (conference realignment makes these worth re-checking periodically
// rather than trusting old training data).
export const FBS_CONFERENCES: FbsConference[] = [
  { groupId: '1', name: 'Atlantic Coast Conference', shortName: 'ACC' },
  { groupId: '151', name: 'American Conference', shortName: 'American' },
  { groupId: '4', name: 'Big 12 Conference', shortName: 'Big 12' },
  { groupId: '5', name: 'Big Ten Conference', shortName: 'Big Ten' },
  { groupId: '12', name: 'Conference USA', shortName: 'C-USA' },
  { groupId: '18', name: 'FBS Independents', shortName: 'Independents' },
  { groupId: '15', name: 'Mid-American Conference', shortName: 'MAC' },
  { groupId: '17', name: 'Mountain West Conference', shortName: 'Mountain West' },
  { groupId: '9', name: 'Pac-12 Conference', shortName: 'Pac-12' },
  { groupId: '8', name: 'Southeastern Conference', shortName: 'SEC' },
  { groupId: '37', name: 'Sun Belt Conference', shortName: 'Sun Belt' },
]
