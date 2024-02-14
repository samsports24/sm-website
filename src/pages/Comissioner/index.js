import { Col, Row, Tabs, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import PopularLeagueCard from '../../components/NewPopularLeagueCard'
import { getLeagueDetails, getUserLeagues, selectLeague } from '../../redux'
import LeagueSetting from './LeagueSettings'

const Comissioner = () => {
  const navigate = useNavigate()
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

  console.log('league', league)

  return (
    <div className='total_payment_container'>
      <h1 className='heading'>Managing Your League</h1>
      <h1 className='heading'>Hello Comissioner (TL334)</h1>

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
            children: `Content of Tab Pane`,
          }, {
            label: `Team Trades`,
            key: 3,
            children: `Content of Tab Pane`,
          }
    ]}
  />
    </div>
  )
}

export default Comissioner
