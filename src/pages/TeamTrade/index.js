import React, { useState } from 'react'
import { Tabs } from 'antd'

// Component
import Header from '../../components/Header'
import NewTrade from './NewTrade'
import PendingTrade from './PendingTrade'
import OnboardingGuide from '../../components/OnboardingGuide'

import '../../styles/pages/teamTrade2.css'

const TeamTrade = () => {
  // Controlled tab so child modules (e.g. "View History") can switch tabs
  const [activeKey, setActiveKey] = useState('1')

  const items = [
    {
      key: '1',
      label: 'New Trade',
      children: <NewTrade tab={activeKey} onGoPending={() => setActiveKey('2')} />,
    },
    {
      key: '2',
      label: 'Pending Trades',
      children: <PendingTrade tab={activeKey} onGoNew={() => setActiveKey('1')} />,
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main tt-page'>
      <Header />

      <OnboardingGuide tabKey="transactions" />

      <div className='tt-headwrap'>
        <span className='tt-tick' />
        <h1 className='tt-title'>TEAM TRADE</h1>
      </div>

      <Tabs
        size='large'
        className='tt-tabs'
        activeKey={activeKey}
        items={items}
        onChange={(key) => setActiveKey(key)}
      />
    </div>
  )
}

export default TeamTrade
