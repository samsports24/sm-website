import React, { useState } from 'react'
import { Tabs } from 'antd'

// Component
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import NewTrade from './NewTrade'
import PendingTrade from './PendingTrade'

const TeamTrade = () => {
  const [tab, setTab] = useState(1)

  const items = [
    {
      key: '1',
      label: 'New Trade',
      children: <NewTrade tab={tab} />,
    },
    {
      key: '2',
      label: 'Pending Trade',
      children: <PendingTrade tab={tab} />,
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <HeadingAndWeek />

      <hr className='divider' />

      <h1 className='heading' style={{ marginBottom: '20px' }}>
        TEAM TRADE
      </h1>

      <Tabs size='large' defaultActiveKey='1' items={items} onChange={(key) => setTab(key)} />
    </div>
  )
}

export default TeamTrade
