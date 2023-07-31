// Component
import LeagueStandingCard from '../components/LeagueStandingCard'
import StandingHeader from '../components/StandingHeader'

const LeagueStandings = () => {
  const data = [
    {
      mainTitle: 'The Manning Conference - North',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'The Manning Conference - EAST',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Doom',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'GRIDIRON SEALS',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'TIGER SHARKS',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'TURF MONSTERS',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'The Manning Conference - South',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'The Manning Conference - West',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'JOHN MADDEN Conference - North',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'JOHN MADDEN Conference - East',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'JOHN MADDEN Conference - South',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
    {
      mainTitle: 'JOHN MADDEN Conference - West',
      data: [
        {
          imageUrl: require('../assets/dragons-red-zone-square-1.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/pradise.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/timber.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
        {
          imageUrl: require('../assets/surfdogs.png'),
          title: 'Red Zone Dragons',
          tableData: [
            {
              key: '1',
              wlt: '8-9-0',
              pct: '.471',
              gb: '3.0',
              strk: 'W1',
              pf: '4686.125',
              avgpf: '260.3',
              pa: '4919.300',
              avgpa: '289.4',
              divwlt: '4-2-0',
              confwlt: '6-6-0',
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className='standing_container'>
      {/* HEADER */}
      <StandingHeader pagination={true} />

      <div className='heading_box'>
        <h2>League Standings</h2>
      </div>

      <div className='league_standing_card_container' style={{ width: '100%' }}>
        {data.map((v, i) => (
          <LeagueStandingCard key={i} data={v} index={i} />
        ))}
      </div>
    </div>
  )
}

export default LeagueStandings
