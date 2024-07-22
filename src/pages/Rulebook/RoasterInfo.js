import { Button, Tabs } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import active from '../../assets/activepic.png'
import active2 from '../../assets/active2.png'
import practic1 from '../../assets/practice1.png'
import practic2 from '../../assets/practice2.png'
import playerinfoa from '../../assets/playerinfoa.png'
import playerinfob from '../../assets/playerinfob.png'
import defensepic from '../../assets/defensive pci.png'
import offensepic from '../../assets/offensepic.png'
import formation from '../../assets/formation.png'
import adminpica from '../../assets/adminpica.png'
import adminpicb from '../../assets/adminpicb.png'

const RoasterInfo = () => {
  // const onChange = (key) => {
  //   console.log(key);
  // };
  const items = [
    {
      key: '1',
      label: 'Active Squad',
      children: () => (
        <div className='activesquad'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <h2>
            Active <span>Squad</span>
          </h2>
          <h3>Active and Non-Active Roster Management</h3>
          <p>
            On the roster page, you will need to select 7 non-active players each week. These can be
            players on a bye or players you think will not have a good scoring week. To do this,
            simply check the non-active box next to a Player&apos;s name. Once you have checked 7
            boxes, hit submit. You must have 7 non-active players each week to maintain a legal
            roster.
          </p>
          <div>
            <img src={active}></img>
            <img src={active2}></img>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Practice Squad',
      children: () => (
        <div className='practicesquad'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <h2>
            Practice <span>Squad Information</span>
            <p>
              On your SFL roster, you can have up to 16 players on your practice squad. This squad
              serves as a reserve pool of players who are not part of the active roster but can be
              called up if needed. Additionally, you can protect up to 4 players from your practice
              squad to prevent other teams from poaching them.
            </p>
            <p>
              Players on the practice squad can be moved to the active roster and vice versa up to 3
              times without triggering a 24-hour auction. For example, if you move a cornerback from
              your practice squad to your active roster, or from your active roster to your practice
              squad, that counts as one move. However, after the third move (either direction), the
              player must clear a 24-hour auction before being added to your practice squad again.
              This system allows flexibility in managing your roster while ensuring fair
              opportunities for all teams to acquire talent.
            </p>
          </h2>

          <div style={{ border: '2px solid white' }}>
            <img src={practic1}></img>
            <img className='practicb' src={practic2}></img>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Player Info',
      children: () => (
        <div className='playerinfo'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <h2>
            Players <span>Free Agency</span>
            <p>
              Each player on your roster has a player pop-up, which you can access by clicking on
              the player&apos;s name. From the player pop-up, you will be able to perform various
              tasks needed for your day-to-day operations.
            </p>
            <p>
              When it comes to Free Agency, you can click on the Player Search tab to see the list
              of all available free agents and poachable players. You can acquire these players by
              starting a 24-hour auction. Note that when you start a 24-hour auction, you will also
              be submitting the starting bid. The starting bid for each player will be equal to the
              player&apos;s cap hit in SamPoints.
            </p>
          </h2>

          <div>
            <img src={playerinfoa}></img>
            <img style={{ marginTop: '20px' }} src={playerinfob}></img>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: 'Starting Line-Ups',
      children: () => (
        <div className='playerinfo'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <h2>
            Starting <span>Lineup And Formation</span>
            <p>
              Each week, you will need to set your starting lineup and choose your team&apos;s
              formation. Your starting lineup will consist of 24 players plus a backup quarterback.
              You can customize your formation to best suit your strategy and the strengths of your
              players.
            </p>
            <p>
              To set your lineup and formation, navigate to the roster page, select your desired
              formation, and assign players to each position. Make sure to finolize your selections
              before the weekly deadline to ensure your toam is ready for the upcoming matchup.
            </p>
            <p style={{ fontWeight: '700' }}>
              Backup quarterback&apos;s scores will only count towards your weekly score it your
              starting quarterback plays fewer than 35 snaps in their weekly game and it your backup
              quarterback outscores your starter&apos;s weekly score.
            </p>
            <p>
              Property managing your starting lineup and formation is crucial for maximizing your
              weekly score and achieving success in the league.
            </p>
          </h2>

          <div>
            <img src={offensepic}></img>
            <img className='defensepic' style={{ marginTop: '20px' }} src={defensepic}></img>
            <img className='formations' src={formation}></img>
          </div>
        </div>
      ),
    },
    {
      key: '5',
      label: 'Salary Cap Info',
      children: () => (
        <div className='salarycapinfo'>
          <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
          <h2>
            League Salary Cap, League Salary Floor, <span>and NFL Dead Money</span>
            <p>
              <h1 style={{ fontWeight: '700' }}>League Salary Cap</h1>
              The SFL League Salary Cap is a financial limit set for each team, ensuring competitive
              balance by restricting the total amount teams can spend on player salaries. We have
              removed all the NFL&apos;s dead money-salaries of players no longer on the roster or
              those with guaranteed money that does not count against the cap-to create a clear and
              fair SFL League Salary Cap. This cap allows all teams to operate on a level playing
              field without the complications of inherited financial obligations from the NFL.
            </p>
            <p>
              <h1 style={{ fontWeight: '700' }}>League Salary Floor</h1>
              The League Salary Floor is set at 89% of the SFL League Salary Cap. This ensures that
              all teams spend a minimum amount on player salaries, promoting a competitive
              environment where teams cannot underfund their rosters to gain an unfair advantage. By
              maintaining spending within this range, we ensure that all teams are investing
              adequately in their players, fostering a healthy and competitive league.
            </p>
            <p>
              You must be compliant with both the League Salary Cap and the League Salary Floor in
              order to have a legal weekly roster. Understanding and managing these financial limits
              are essential for maintaining a balanced and competitive team. By following these
              guidelines, you can ensure your roster remains financially compliant while maximizing
              your team&apos;s potential.
            </p>
          </h2>

          <div>
            <img src={adminpicb}></img>
            <img style={{ marginTop: '20px' }} src={adminpica}></img>
          </div>
        </div>
      ),
    },
  ]

  const navigate = useNavigate()
  const [activeTabKey, setActiveTabKey] = useState('1') // State to track active tab key

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

      {/* <Tabs  className="custom-tabs" defaultActiveKey="1" items={items} onChange={onChange} /> */}
      <Tabs className='custom-tabs' defaultActiveKey='1' onChange={onChange}>
        {items.map((item) => (
          <Tabs.TabPane tab={item.label} key={item.key}>
            {item.children()} {/* Call the function to render the JSX */}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  )
}

export default RoasterInfo
