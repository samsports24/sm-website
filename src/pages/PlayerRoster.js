import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button } from 'antd'
import Arrow from '../assets/arrow-right.svg'
// Component
import DepthCard from '../components/DepthCard'
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'

// Mock Data
import { depthCardData, playerRosterData } from './mockData'
import PlayerRosterCard from '../components/PlayerRosterCard'

const PlayerRoster = () => {
  const [activeFilter] = useState('Roster')
  const [data, setData] = useState([])

  useEffect(() => {
    const filterdData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterdData)
  }, [activeFilter])

  return (
    <div className='player_roster_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Depth-Chart</p>,
            },
            {
              title: <p>{activeFilter}</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      {/* FILTER */}

      <section className='depth_chart_wrapper'>
        <div
          className={`depth_chart_cards ${
            activeFilter === 'special team' ? 'special_team_container' : activeFilter + '_container'
          }`}
        >
          {data?.map((v, i) => {
            return <DepthCard key={i} data={v} index={i} />
          })}
        </div>
      </section>


      {/* STATS */}
      <section className='stats_container'>
        {playerRosterData?.map((v, i) => {
          return <PlayerRosterCard style={{margin:"20px 0px"}} key={i} data={v} index={i} />
        })}
      </section>
    </div>
  )
}

export default PlayerRoster
