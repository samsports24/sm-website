import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { getLeagueDetails } from '../../redux'

import LeagueSetting from './LeagueSettings'
import TeamAndOwnership from './TeamAndOwnership'
import Trades from './Trades'
import { useSelector } from 'react-redux'

const Comissioner = () => {
  const { currentLeague } = useSelector((state) => state.league)

  return (
    <div className='total_payment_container comissioner'>
      <h1 className='heading'>Managing Your League</h1>
      <h1 className='heading'>
        Hello Comissioner {currentLeague?.leagueId ? `(${currentLeague?.leagueId})` : ''}
      </h1>

      <Tabs
        defaultActiveKey={1}
        size='large'
        type='card'
        centered
        items={[
          {
            label: `General League Setting`,
            key: 1,
            children: <LeagueSetting />,
          },
          {
            label: `Teams & Ownerships`,
            key: 2,
            children: <TeamAndOwnership />,
          },
          {
            label: `Team Trades (3)`,
            key: 3,
            children: <Trades />,
          },
        ]}
      />
    </div>
  )
}

export default Comissioner
