import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { getLeagueDetails } from '../../redux'

import LeagueSetting from './LeagueSettings'
import TeamAndOwnership from './TeamAndOwnership'
import Trades from './Trades'

const Comissioner = () => {
  const isAuthenticated = localStorage.getItem('token')
  const [league, setLeague] = useState(null)

  const getData = async () => {
    if (isAuthenticated) {
      let leagueData = await getLeagueDetails()
      setLeague(leagueData)
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <div className='total_payment_container comissioner'>
      <h1 className='heading'>Managing Your League</h1>
      <h1 className='heading'>Hello Comissioner ({league?.leagueId})</h1>

      <Tabs
        defaultActiveKey={1}
        size='large'
        type='card'
        centered
        items={[
          {
            label: `General League Setting`,
            key: 1,
            children: <LeagueSetting data={league} />,
          },
          {
            label: `Teams & Ownerships`,
            key: 2,
            children: <TeamAndOwnership data={league} />,
          },
          {
            label: `Team Trades (3)`,
            key: 3,
            children: <Trades data={league} />,
          },
        ]}
      />
    </div>
  )
}

export default Comissioner
