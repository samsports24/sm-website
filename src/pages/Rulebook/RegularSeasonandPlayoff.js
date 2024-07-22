import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import playoffbreak from '../../assets/playoffbreak.png'
import rookiedraft from '../../assets/rookiedraft.png'

const RegularSeasonandPlayoff = () => {
  const items = [
    {
      key: '1',
      label: 'Pre-Draft Info',
      children: (
        <div className='stadiumrewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <div className='stadiuminfo'>
            <h2>
              Pre-Draft<span>Info</span>
            </h2>

            <p>
              Once you have decided on your user level and joined one of our SAM Leagues, which
              mirror our ultimate league, the SFL (SAM Football League), you will begin with our
              pre-draft process. During the offseason, you&apos;ll choose your desired draft
              weekend. Upon entering your league and viewing the league dashboard, you&apos;ll see a
              button at the top labeled
              <span style={{ fontWeight: '700' }}> Draft Pick Auction </span>Click on this button to
              participate in the auction, which will determine your draft position, conference, and
              division placement. To get you started, you are given 1 million SamPoints, which you
              can use to bid for your preferred draft pick.
            </p>
            <p>
              Once the draft begins, each participant is given 3 minutes per pick. The draft will
              run for 6 hours each day, pausing and then resuming the next day at the same time.
              This structured approach ensures an efficient and organized draft process.
            </p>
          </div>
          {/* <img src={rulebooksardium} alt='Player Info A' /> */}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Regular Season',
      children: (
        <div className='stadiumrewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <div className='stadiuminfo'>
            <h2>
              Regular<span>Season</span>
            </h2>

            <p>
              In our regular season, each team plays a 17-game schedule with one bye week. Like the
              NFL, you will face your division mates twice per year. Based on your draft spot, you
              are assigned an NFL team whose schedule you will mirror, playing their home and away
              games.
            </p>

            <p>
              Wondering why home and away games matter? Be sure to check out the Stadium tab for
              details. During your bye week, you can&apos;t win or lose, but you can still
              accumulate points towards your total score.
            </p>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Playoff',
      children: (
        <div className='stadiumrewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <div className='stadiuminfo'>
            <h2>
              Playoff<span> Info</span>
            </h2>

            <p>
              Our playoff system begins with 14 teams qualifying for the playoffs, with the top team
              from each conference receiving a bye in the wildcard round. The SFL playoffs run
              concurrently with the NFL playoffs, and teams making the SFL playoffs retain all
              players from NFL teams that also made the NFL playoffs.
            </p>

            <p>
              There will be a weekly draft to fill rosters, with a linear draft order where teams
              with the best records get the top picks. This process continues every week of the
              playoffs and the week before the NFL Super Bowl, which coincides with our championship
              game, the SAM Bowl.
            </p>

            <p>
              During the wildcard week, the draft pool consists of players from NFL playoff teams on
              SFL teams that did not make the SFL playoffs and SFL teams with a first-round bye. For
              the wildcard week, there will be six game winners plus the two teams with byes. In the
              divisional round, all teams keep their players from NFL playoff teams that are still
              in contention. As long as the SFL teams keep winning, they retain the players they
              draft. This process continues all the way to the SAM Bowl.
            </p>
          </div>

          <a href='https://canva.com/design/DAFXGveIboY/IsjZNG48LUWlfMbC-JDehg/view?utm_content=DAFXGveIboY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink#8'>
            <img src={playoffbreak} alt='Description of the image' />
          </a>

          {/* <img  style={{position:'relative',bottom:'130px'}} src={playoffbreak} alt='playoffbreak' /> */}
        </div>
      ),
    },

    {
      key: '4',
      label: 'Rookie Draft',
      children: (
        <div className='stadiumrewards'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <div className='stadiuminfo'>
            <h2>
              Rookie Draft <span> Info</span>
            </h2>
            <p style={{ fontSize: '35px' }}>
              The SFL rookie draft order is determined in reverse order of the previous
              season&apos;s overall standings, with each team receiving 7 picks per year. Teams are
              free to trade these picks as they see fit. It is each team&apos;s responsibility to
              ensure they have enough SamPoints to cover the first-year cap hit for each drafted
              player. If a team lacks sufficient SamPoints at the time of their pick, they will not
              be allowed to make a selection. Additionally, if the clock runs out on a pick, that
              pick will be forfeited.
            </p>
          </div>

          <img style={{ width: '30%' }} src={rookiedraft} alt='rookiedraft' />
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
          {/* <h1>
            REGULAR SEASON &
            <br/> 
            <span>PLAYOFFS</span>
          
            </h1> */}
          <p>
            REGULAR SEASON &
            <br />
            <span>PLAYOFFS</span>
            <h2>INFO & BREAKDOWN</h2>
          </p>
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
          <h2>
            REGULAR SEASON
            <span style={{ fontWeight: '700' }}>& PLAYOFFS</span>
          </h2>
          <p>
            This tab provides a comprehensive guide on how every aspect of our season operates. It
            covers all stages, including the pre-draft process, regular season activities, playoffs,
            the SamBowl, offseason events, and the rookie draft process. By navigating through the
            tabs above, you&apos;ll find detailed information and guidelines for each phase,
            ensuring you have everything you need to understand how our league functions from start
            to finish.
          </p>
        </div>
      )}
    </div>
  )
}

export default RegularSeasonandPlayoff
