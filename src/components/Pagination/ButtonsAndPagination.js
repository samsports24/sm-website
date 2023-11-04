import { Button, Typography, Dropdown } from 'antd'
import WeekPagination from '../WeekPagination'
import { useNavigate } from 'react-router-dom'
import { isLocked } from '../../config/constants'
const ButtonsAndPagination = ({ noWeek, goLive = true }) => {
  const navigate = useNavigate()

  const playerItems = [
    {
      key: '1',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/free-agent')
          }}
          level={4}
          className='dropdown-link'
        >
          FREE AGENTS
        </Typography.Title>
      ),
    },
    {
      key: '2',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/player-auction')
          }}
          className='dropdown-link'
          level={4}
        >
          PLAYER AUCTIONS
        </Typography.Title>
      ),
    },
    {
      key: '3',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/player-standing')
          }}
          className='dropdown-link'
          level={4}
        >
          PLAYER STANDINGS
        </Typography.Title>
      ),
    },
  ]

  const teamItems = [
    {
      key: '1',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/player-roster')
          }}
          level={4}
          className='dropdown-link'
        >
          ROSTER
        </Typography.Title>
      ),
    },
    {
      key: '2',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/depth-chart')
          }}
          className='dropdown-link'
          level={4}
        >
          DEPTH CHART
        </Typography.Title>
      ),
    },
    // {
    //   key: '3',
    //   label: (
    //     <Typography.Title
    //       onClick={() => {
    //         navigate('/practice-squad')
    //       }}
    //       className='dropdown-link'
    //       level={4}
    //     >
    //       PRACTICE SQUAD
    //     </Typography.Title>
    //   ),
    // },
    {
      key: '4',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/team-trade')
          }}
          level={4}
          className='dropdown-link'
        >
          TEAM TRADE
        </Typography.Title>
      ),
    },
    {
      key: '5',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/gm-dashboard')
          }}
          className='dropdown-link'
          level={4}
        >
          GM DASHBOARD
        </Typography.Title>
      ),
    },
    {
      key: '6',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/team-schedule')
          }}
          className='dropdown-link'
          level={4}
        >
          TEAM SCHEDULE
        </Typography.Title>
      ),
    },
    {
      key: '7',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/team-setting')
          }}
          level={4}
          className='dropdown-link'
        >
          TEAM SETTINGS
        </Typography.Title>
      ),
    },
    {
      key: '8',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/injured-reserve')
          }}
          className='dropdown-link'
          level={4}
        >
          INJURED RESERVE
        </Typography.Title>
      ),
    },
  ]

  const leagueItems = [
    {
      key: '1',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/leagueScore')
          }}
          level={4}
          className='dropdown-link'
        >
          LIVE SCORING
        </Typography.Title>
      ),
    },
    {
      key: '2',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/league-standings')
          }}
          className='dropdown-link'
          level={4}
        >
          STANDINGS
        </Typography.Title>
      ),
    },
    {
      key: '3',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/playoff')
          }}
          className='dropdown-link'
          level={4}
        >
          PLAYOFF OUTLOOK
        </Typography.Title>
      ),
    },
    {
      key: '4',
      label: (
        <Typography.Title
          onClick={() => {
            navigate('/draft-picks')
          }}
          className='dropdown-link'
          level={4}
        >
          PLAYOFF DRAFTROOM
        </Typography.Title>
      ),
    },
  ]

  return (
    <>
      <section className='_buttons_and_pagination'>
        <div className='_buttons_group'>
          <Button
            type='primary'
            onClick={() => {
              navigate('/professional-league')
            }}
          >
            Home
          </Button>
          <Dropdown trigger={['hover', 'click']} menu={{ items: teamItems }}>
            <Button type='primary'>Team</Button>
          </Dropdown>
          <Dropdown trigger={['hover', 'click']} menu={{ items: playerItems }}>
            <Button type='primary'>Players</Button>
          </Dropdown>

          <Dropdown trigger={['hover', 'click']} menu={{ items: leagueItems }}>
            <Button type='primary'>League</Button>
          </Dropdown>
        </div>
        {!noWeek && <WeekPagination goLive={goLive} />}
      </section>
      {isLocked() && !window.location.href?.includes('/leagueScore') && (
        <div className='locked_box'>
          <p>You are viewing previous week data in view only mode.</p>
        </div>
      )}
    </>
  )
}

export default ButtonsAndPagination
