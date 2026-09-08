export interface FbsConference {
  groupId: string
  name: string
  shortName: string
  logo: string
}

const CONF_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos/ncaa_conf/500'

// ESPN's FBS conference group ids and logos, confirmed live via the
// standings/groups API (conference realignment makes these worth
// re-checking periodically rather than trusting old training data).
export const FBS_CONFERENCES: FbsConference[] = [
  {
    groupId: '1',
    name: 'Atlantic Coast Conference',
    shortName: 'ACC',
    logo: `${CONF_LOGO_BASE}/acc.png`,
  },
  {
    groupId: '151',
    name: 'American Conference',
    shortName: 'American',
    logo: `${CONF_LOGO_BASE}/american.png`,
  },
  {
    groupId: '4',
    name: 'Big 12 Conference',
    shortName: 'Big 12',
    logo: `${CONF_LOGO_BASE}/big_12.png`,
  },
  {
    groupId: '5',
    name: 'Big Ten Conference',
    shortName: 'Big Ten',
    logo: `${CONF_LOGO_BASE}/big_ten.png`,
  },
  {
    groupId: '12',
    name: 'Conference USA',
    shortName: 'C-USA',
    logo: `${CONF_LOGO_BASE}/conference_usa.png`,
  },
  {
    groupId: '18',
    name: 'FBS Independents',
    shortName: 'Independents',
    logo: `${CONF_LOGO_BASE}/fbs_independents.png`,
  },
  {
    groupId: '15',
    name: 'Mid-American Conference',
    shortName: 'MAC',
    logo: `${CONF_LOGO_BASE}/mid_american.png`,
  },
  {
    groupId: '17',
    name: 'Mountain West Conference',
    shortName: 'Mountain West',
    logo: `${CONF_LOGO_BASE}/mountain_west.png`,
  },
  {
    groupId: '9',
    name: 'Pac-12 Conference',
    shortName: 'Pac-12',
    logo: `${CONF_LOGO_BASE}/pac_12.png`,
  },
  {
    groupId: '8',
    name: 'Southeastern Conference',
    shortName: 'SEC',
    logo: `${CONF_LOGO_BASE}/sec.png`,
  },
  {
    groupId: '37',
    name: 'Sun Belt Conference',
    shortName: 'Sun Belt',
    logo: `${CONF_LOGO_BASE}/sun_belt.png`,
  },
]
