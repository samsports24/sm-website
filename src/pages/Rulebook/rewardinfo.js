import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import rulebooksardium from '../../assets/rulebooksardium.png'

const RewardInfo = () => {
  const items = [
    {
      key: '1',
      label: 'Stadium Rewards',
      children: (
        <div className='stadiumrewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <div className='stadiuminfo'>
            <h2>
              Stadium <span>Tab</span>
            </h2>

            <p>
              Weekly rewards are all about filling your stadium seats with fans! In our American
              football league, each team starts with a stadium capacity of 60,000 seats. Each seat
              generates 85 SamPoints per week, creating a weekly league pot of 5,100,000 SamPoints.
              During week one, home games achieve 100% attendance.
            </p>
            <p>
              Each week, 30% of the SamPoints generated will go to the league&apos;s SamPoints Prize
              Pool. The remaining 70% is split into two pots: 75% goes to the winning team of each
              matchup, and 25% to the losing team.
            </p>
            <p>
              Attendance fluctuates with wins and losses: each loss results in a 3% decrease in home
              attendance, while each win results in a 3% increase until the team reaches 100%
              attendance again. A teams attendance can drop as low as 49% if they don’t win any
              games in a season.
              <span style={{ fontWeight: '700' }}>
                However, each team can earn back 1.5% attendance each week by logging in every day
                from Sunday to Wednesday.
              </span>
            </p>

            <p>
              Teams can also invest in stadium renovations to increase their stadium capacity and
              average ticket price. With all renovations completed, stadium capacity can reach up to
              80,000 seats. This will boost their home game SamPoints pots, offering the potential
              for greater returns with each home game.
            </p>
          </div>
          <img src={rulebooksardium} alt='Player Info A' />
        </div>
      ),
    },
    {
      key: '2',
      label: 'League Rewards',
      children: (
        <div className='leaguerewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>

          <h2>
            League <span>Rewards BreakDown</span>
          </h2>

          <ul>
            <li> Regular Season Winner: 14.727% of Regular Season SamPoints Prize Pool</li>
            <li> Opposite Conference Winner: 12.727% of SamPoints Prize Pool</li>
            <li>
              {' '}
              Next Best Division Winners (per conference, 2 each): 10.727% each of SamPoints Prize
              Pool
            </li>
            <li>
              Following Division Winners (per conference, 2 each): 8.727% each of SamPoints Prize
              Pool
            </li>
            <li>
              Final Division Winners (per conference, 2 each): 6.727% each of SamPoints Prize Pool
            </li>
            <li>Wildcard Spots (6 teams): 3.364% each of SamPoints Prize Pool</li>
          </ul>

          <h3>
            68% of the SamPoints prize pool is allocated to regular season rewards, while 32% is
            allocated to postseason rewards.
          </h3>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Playoff Rewards',
      children: (
        <div className='leaguerewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>

          <h2>
            Playoff and SAM BOWL <span>Rewards BreakDown</span>
          </h2>

          <ul>
            <li>
              Wildcard Week Winners (6 teams): Each will receive{' '}
              <span style={{ fontWeight: '900' }}>3.95778% </span> of the Postseason SamPoints Prize
              Pool.
            </li>
            <li>
              First Round Bye Teams (2 teams): Each will receive{' '}
              <span style={{ fontWeight: '900' }}>3.95778% </span> of the Postseason SamPoints Prize
              Pool.
            </li>
            <li>
              Divisional Round Winners (4 teams): Each will receive
              <span style={{ fontWeight: '900' }}>5.54090% </span> of the Postseason SamPoints Prize
              Pool.
            </li>
            <li>
              Conference Championship Winners (2 teams): Each will receive{' '}
              <span style={{ fontWeight: '900' }}>9.23483% </span> of the Postseason SamPoints Prize
              Pool.
            </li>
            <li>
              SAM Bowl Winners: They will receive the largest share,{' '}
              <span style={{ fontWeight: '900' }}>27.70449% </span> of the Postseason SamPoints
              Prize Pool.
            </li>
          </ul>

          <h3>
            68% of the SamPoints prize pool is allocated to regular season rewards, while 32% is
            allocated to postseason rewards.
          </h3>
        </div>
      ),
    },
  ]

  const navigate = useNavigate()
  const [activeTabKey, setActiveTabKey] = useState('0') // State to track active tab key, '0' for initial content

  const onChange = (key) => {
    setActiveTabKey(key)
  }

  return (
    <div className='roasterinfomain'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <p>ROSTER INFO</p>
          <Button onClick={() => navigate('/rule-book')}>Back</Button>
        </div>
      </div>

      <hr className='horizontal-line'></hr>

      <Tabs className='custom-tabs' activeKey={activeTabKey} onChange={onChange}>
        {items.map((item) => (
          <Tabs.TabPane tab={item.label} key={item.key}>
            {item.children}
          </Tabs.TabPane>
        ))}
      </Tabs>

      {/* Render initial content below the tabs if activeTabKey is '0' */}
      {activeTabKey === '0' && (
        <div className='initial-content'>
          <h2>REWARDS</h2>
          <p>
            Our platform offers a variety of rewards based on SamPoints accumulation, including
            weekly rewards accessed through our stadium tab. Additionally, users can earn rewards
            through our SFL leagues, with rewards for the regular season and playoffs winners. This
            incentivizes active participation and strategic team management throughout the season.
          </p>
        </div>
      )}
    </div>
  )
}

export default RewardInfo
