import React, { useState } from 'react'
import { Button, Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  TeamOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  OrderedListOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   MOCKUP COMPONENTS, Replace old purple screenshots
   ═══════════════════════════════════════════════════════════ */

const MockActiveSquad = () => (
  <div className='ri-mockup'>
    <div className='ri-mockup-header'>
      <span className='ri-mockup-badge'>ROSTER</span>
      <span className='ri-mockup-title'>Active Squad Management</span>
    </div>
    <div className='ri-mockup-table'>
      <div className='ri-mockup-row ri-mockup-row--head'>
        <span style={{ flex: 0.4 }}>#</span>
        <span style={{ flex: 2 }}>Player</span>
        <span style={{ flex: 1 }}>Pos</span>
        <span style={{ flex: 1 }}>SAMetric</span>
        <span style={{ flex: 1 }}>Non-Active</span>
      </div>
      {[
        { n: 1, name: 'Patrick Mahomes', pos: 'QB', sam: '94.2', active: false },
        { n: 2, name: 'Tyreek Hill', pos: 'WR', sam: '91.7', active: false },
        { n: 3, name: 'Derrick Henry', pos: 'RB', sam: '88.5', active: false },
        { n: 4, name: 'Travis Kelce', pos: 'TE', sam: '87.3', active: true },
        { n: 5, name: 'CeeDee Lamb', pos: 'WR', sam: '90.1', active: false },
        { n: 6, name: 'Nick Bosa', pos: 'DE', sam: '86.4', active: true },
        { n: 7, name: 'Micah Parsons', pos: 'LB', sam: '89.0', active: false },
      ].map((p) => (
        <div key={p.n} className='ri-mockup-row'>
          <span style={{ flex: 0.4 }} className='ri-mockup-num'>{p.n}</span>
          <span style={{ flex: 2 }} className='ri-mockup-player'>{p.name}</span>
          <span style={{ flex: 1 }}>
            <span className='ri-mockup-pos'>{p.pos}</span>
          </span>
          <span style={{ flex: 1 }} className='ri-mockup-sam'>{p.sam}</span>
          <span style={{ flex: 1 }}>
            <div className={`ri-mockup-check ${p.active ? 'ri-mockup-check--on' : ''}`}>
              {p.active && <CheckCircleOutlined />}
            </div>
          </span>
        </div>
      ))}
    </div>
    <div className='ri-mockup-footer'>
      <span className='ri-mockup-footer-note'>
        <ExclamationCircleOutlined /> Select 7 non-active players each week
      </span>
      <div className='ri-mockup-btn'>SUBMIT</div>
    </div>
  </div>
)

const MockPracticeSquad = () => (
  <div className='ri-mockup'>
    <div className='ri-mockup-header'>
      <span className='ri-mockup-badge ri-mockup-badge--blue'>PRACTICE SQUAD</span>
      <span className='ri-mockup-title'>Reserve Player Pool</span>
    </div>
    <div className='ri-mockup-table'>
      <div className='ri-mockup-row ri-mockup-row--head'>
        <span style={{ flex: 0.4 }}>#</span>
        <span style={{ flex: 2 }}>Player</span>
        <span style={{ flex: 1 }}>Pos</span>
        <span style={{ flex: 1 }}>Status</span>
        <span style={{ flex: 1 }}>Protected</span>
      </div>
      {[
        { n: 1, name: 'Jordan Love', pos: 'QB', status: 'Reserve', prot: true },
        { n: 2, name: 'Jaylen Waddle', pos: 'WR', status: 'Reserve', prot: true },
        { n: 3, name: 'Kenneth Walker', pos: 'RB', status: 'Reserve', prot: false },
        { n: 4, name: 'George Kittle', pos: 'TE', status: 'Reserve', prot: true },
        { n: 5, name: 'Jalen Ramsey', pos: 'CB', status: 'Reserve', prot: true },
        { n: 6, name: 'Roquan Smith', pos: 'LB', status: 'Reserve', prot: false },
      ].map((p) => (
        <div key={p.n} className='ri-mockup-row'>
          <span style={{ flex: 0.4 }} className='ri-mockup-num'>{p.n}</span>
          <span style={{ flex: 2 }} className='ri-mockup-player'>{p.name}</span>
          <span style={{ flex: 1 }}>
            <span className='ri-mockup-pos'>{p.pos}</span>
          </span>
          <span style={{ flex: 1 }}>
            <span className='ri-mockup-status'>Reserve</span>
          </span>
          <span style={{ flex: 1 }}>
            {p.prot ? (
              <LockOutlined style={{ color: '#22C55E', fontSize: 14 }} />
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            )}
          </span>
        </div>
      ))}
    </div>
    <div className='ri-mockup-footer'>
      <span className='ri-mockup-footer-note'>
        <InfoCircleOutlined /> Up to 16 players · 4 protected slots
      </span>
      <div className='ri-mockup-counter'>
        <span>Moves Used</span>
        <div className='ri-mockup-counter-dots'>
          <div className='ri-mockup-dot ri-mockup-dot--used' />
          <div className='ri-mockup-dot ri-mockup-dot--used' />
          <div className='ri-mockup-dot' />
        </div>
        <span style={{ color: '#F59E0B', fontSize: 11 }}>2 / 3</span>
      </div>
    </div>
  </div>
)

const MockPlayerInfo = () => (
  <div className='ri-mockup'>
    <div className='ri-mockup-header'>
      <span className='ri-mockup-badge ri-mockup-badge--gold'>PLAYER POPUP</span>
      <span className='ri-mockup-title'>Player Details &amp; Free Agency</span>
    </div>
    <div className='ri-mockup-player-card'>
      <div className='ri-mockup-player-top'>
        <div className='ri-mockup-player-avatar'>
          <TeamOutlined style={{ fontSize: 28, color: '#22C55E' }} />
        </div>
        <div className='ri-mockup-player-details'>
          <span className='ri-mockup-player-name-lg'>Patrick Mahomes</span>
          <span className='ri-mockup-player-meta'>QB · Kansas City Chiefs · #15</span>
        </div>
        <div className='ri-mockup-player-sam-big'>94.2</div>
      </div>
      <div className='ri-mockup-player-stats'>
        {[
          { label: 'Value', value: '45,000,000 SP' },
          { label: 'Contract', value: '3 Years' },
          { label: 'Weekly Avg', value: '22.4 pts' },
          { label: 'Status', value: 'Active' },
        ].map((s) => (
          <div key={s.label} className='ri-mockup-stat-item'>
            <span className='ri-mockup-stat-label'>{s.label}</span>
            <span className='ri-mockup-stat-value'>{s.value}</span>
          </div>
        ))}
      </div>
      <div className='ri-mockup-player-actions'>
        <div className='ri-mockup-action-btn'>
          <SearchOutlined /> Player Search
        </div>
        <div className='ri-mockup-action-btn ri-mockup-action-btn--green'>
          <ThunderboltOutlined /> Start 24h Auction
        </div>
      </div>
    </div>
  </div>
)

const MockStartingLineup = () => (
  <div className='ri-mockup'>
    <div className='ri-mockup-header'>
      <span className='ri-mockup-badge ri-mockup-badge--green'>LINEUP</span>
      <span className='ri-mockup-title'>Starting Lineup &amp; Formation</span>
    </div>
    <div className='ri-mockup-formation'>
      <div className='ri-mockup-formation-grid'>
        {/* Offense Side */}
        <div className='ri-mockup-formation-col'>
          <div className='ri-mockup-formation-label'>OFFENSE</div>
          <div className='ri-mockup-formation-positions'>
            {['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'WR3', 'TE', 'OL×5'].map((pos) => (
              <div key={pos} className='ri-mockup-pos-slot'>
                <span className='ri-mockup-pos-dot ri-mockup-pos-dot--off' />
                <span>{pos}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Defense Side */}
        <div className='ri-mockup-formation-col'>
          <div className='ri-mockup-formation-label'>DEFENSE</div>
          <div className='ri-mockup-formation-positions'>
            {['DE1', 'DE2', 'DT1', 'DT2', 'LB1', 'LB2', 'LB3', 'CB1', 'CB2', 'S1', 'S2'].map((pos) => (
              <div key={pos} className='ri-mockup-pos-slot'>
                <span className='ri-mockup-pos-dot ri-mockup-pos-dot--def' />
                <span>{pos}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Special Teams */}
        <div className='ri-mockup-formation-col'>
          <div className='ri-mockup-formation-label'>SPECIAL</div>
          <div className='ri-mockup-formation-positions'>
            {['K', 'P', 'Backup QB'].map((pos) => (
              <div key={pos} className='ri-mockup-pos-slot'>
                <span className='ri-mockup-pos-dot ri-mockup-pos-dot--sp' />
                <span>{pos}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='ri-mockup-formation-bar'>
        <span>Formation</span>
        <div className='ri-mockup-formation-chips'>
          <span className='ri-mockup-chip ri-mockup-chip--active'>4-3</span>
          <span className='ri-mockup-chip'>3-4</span>
          <span className='ri-mockup-chip'>Nickel</span>
          <span className='ri-mockup-chip'>Dime</span>
        </div>
      </div>
    </div>
  </div>
)

const MockSalaryCap = () => (
  <div className='ri-mockup'>
    <div className='ri-mockup-header'>
      <span className='ri-mockup-badge ri-mockup-badge--gold'>SALARY CAP</span>
      <span className='ri-mockup-title'>Cap Space Overview</span>
    </div>
    <div className='ri-mockup-cap'>
      <div className='ri-mockup-cap-bars'>
        <div className='ri-mockup-cap-item'>
          <div className='ri-mockup-cap-label-row'>
            <span>SFL League Salary Cap</span>
            <span style={{ color: '#22C55E' }}>$255,400,000</span>
          </div>
          <div className='ri-mockup-bar-track'>
            <div className='ri-mockup-bar-fill ri-mockup-bar-fill--green' style={{ width: '100%' }} />
          </div>
        </div>
        <div className='ri-mockup-cap-item'>
          <div className='ri-mockup-cap-label-row'>
            <span>Current Spending</span>
            <span style={{ color: '#3B82F6' }}>$241,200,000</span>
          </div>
          <div className='ri-mockup-bar-track'>
            <div className='ri-mockup-bar-fill ri-mockup-bar-fill--blue' style={{ width: '94.4%' }} />
          </div>
        </div>
        <div className='ri-mockup-cap-item'>
          <div className='ri-mockup-cap-label-row'>
            <span>Salary Floor (89%)</span>
            <span style={{ color: '#F59E0B' }}>$227,306,000</span>
          </div>
          <div className='ri-mockup-bar-track'>
            <div className='ri-mockup-bar-fill ri-mockup-bar-fill--gold' style={{ width: '89%' }} />
          </div>
        </div>
      </div>
      <div className='ri-mockup-cap-status'>
        <CheckCircleOutlined style={{ color: '#22C55E', fontSize: 16 }} />
        <span style={{ color: '#22C55E', fontWeight: 600 }}>Roster Compliant</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontSize: 11 }}>
          Cap Space Remaining: $14,200,000
        </span>
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const RoasterInfo = () => {
  const navigate = useNavigate()
  const [activeTabKey, setActiveTabKey] = useState('1')

  const tabItems = [
    {
      key: '1',
      icon: <TeamOutlined />,
      label: 'Active Squad',
      content: {
        title: 'Active',
        highlight: 'Squad',
        subtitle: 'Active and Non-Active Roster Management',
        paragraphs: [
          'On the roster page, you will need to select 7 non-active players each week. These can be players on a bye or players you think will not have a good scoring week. To do this, simply check the non-active box next to a player\'s name.',
          'Once you have checked 7 boxes, hit submit. You must have 7 non-active players each week to maintain a legal roster.',
        ],
        mockup: <MockActiveSquad />,
      },
    },
    {
      key: '2',
      icon: <UserSwitchOutlined />,
      label: 'Practice Squad',
      content: {
        title: 'Practice',
        highlight: 'Squad Information',
        subtitle: 'Reserve Pool & Protected Players',
        paragraphs: [
          'On your SFL roster, you can have up to 16 players on your practice squad. This squad serves as a reserve pool of players who are not part of the active roster but can be called up if needed. Additionally, you can protect up to 4 players from your practice squad to prevent other teams from poaching them.',
          'Players on the practice squad can be moved to the active roster and vice versa up to 3 times without triggering a 24-hour auction. After the third move (either direction), the player must clear a 24-hour auction before being added to your practice squad again.',
        ],
        mockup: <MockPracticeSquad />,
      },
    },
    {
      key: '3',
      icon: <SearchOutlined />,
      label: 'Player Info',
      content: {
        title: 'Players',
        highlight: 'Free Agency',
        subtitle: 'Player Popup & Auction System',
        paragraphs: [
          'Each player on your roster has a player pop-up, which you can access by clicking on the player\'s name. From the player pop-up, you will be able to perform various tasks needed for your day-to-day operations.',
          'When it comes to Free Agency, you can click on the Player Search tab to see the list of all available free agents and poachable players. You can acquire these players by starting a 24-hour auction. The starting bid for each player will be equal to the player\'s cap hit in SamPoints.',
        ],
        mockup: <MockPlayerInfo />,
      },
    },
    {
      key: '4',
      icon: <OrderedListOutlined />,
      label: 'Starting Line-Ups',
      content: {
        title: 'Starting',
        highlight: 'Lineup & Formation',
        subtitle: '24 Starters + Backup QB',
        paragraphs: [
          'Each week, you will need to set your starting lineup and choose your team\'s formation. Your starting lineup will consist of 24 players plus a backup quarterback. You can customize your formation to best suit your strategy and the strengths of your players.',
          'To set your lineup and formation, navigate to the roster page, select your desired formation, and assign players to each position. Make sure to finalize your selections before the weekly deadline to ensure your team is ready for the upcoming matchup.',
        ],
        callout: 'Backup quarterback\'s scores will only count towards your weekly score if your starting quarterback plays fewer than 35 snaps in their weekly game and if your backup quarterback outscores your starter\'s weekly score.',
        mockup: <MockStartingLineup />,
      },
    },
    {
      key: '5',
      icon: <DollarOutlined />,
      label: 'Salary Cap Info',
      content: {
        title: 'Salary Cap,',
        highlight: 'Floor & Dead Money',
        subtitle: 'Financial Compliance & Competitive Balance',
        sections: [
          {
            heading: 'League Salary Cap',
            text: 'The SFL League Salary Cap is a financial limit set for each team, ensuring competitive balance by restricting the total amount teams can spend on player salaries. We have removed all the NFL\'s dead money, salaries of players no longer on the roster or those with guaranteed money that does not count against the cap, to create a clear and fair SFL League Salary Cap.',
          },
          {
            heading: 'League Salary Floor',
            text: 'The League Salary Floor is set at 89% of the SFL League Salary Cap. This ensures that all teams spend a minimum amount on player salaries, promoting a competitive environment where teams cannot underfund their rosters to gain an unfair advantage.',
          },
          {
            heading: 'Compliance',
            text: 'You must be compliant with both the League Salary Cap and the League Salary Floor in order to have a legal weekly roster. Understanding and managing these financial limits are essential for maintaining a balanced and competitive team.',
          },
        ],
        mockup: <MockSalaryCap />,
      },
    },
  ]

  const activeItem = tabItems.find((t) => t.key === activeTabKey)

  return (
    <div className='rb-page ri-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>ROSTER INFO</h1>
            <span className='rb-page-subtitle'>Manage your squad, lineup, and salary cap</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='rb-tabs ri-tabs'>
        <Tabs
          activeKey={activeTabKey}
          onChange={(key) => setActiveTabKey(key)}
          items={tabItems.map((item) => ({
            key: item.key,
            label: (
              <span className='ri-tab-label'>
                {item.icon} {item.label}
              </span>
            ),
          }))}
        />
      </div>

      {/* ── Tab Content ── */}
      {activeItem && (
        <div className='ri-content'>
          {/* Text Column */}
          <div className='ri-text-col'>
            <div className='rb-section-card'>
              <div className='rb-section-header'>
                <h2>
                  {activeItem.content.title}{' '}
                  <span className='rb-highlight'>{activeItem.content.highlight}</span>
                </h2>
                <p className='rb-section-subtitle'>{activeItem.content.subtitle}</p>
              </div>

              {/* Regular paragraphs */}
              {activeItem.content.paragraphs &&
                activeItem.content.paragraphs.map((p, i) => (
                  <p key={i} className='ri-paragraph'>
                    {p}
                  </p>
                ))}

              {/* Salary Cap sections */}
              {activeItem.content.sections &&
                activeItem.content.sections.map((s, i) => (
                  <div key={i} className='ri-sub-section'>
                    <h3 className='ri-sub-heading'>{s.heading}</h3>
                    <p className='ri-paragraph'>{s.text}</p>
                  </div>
                ))}

              {/* Callout */}
              {activeItem.content.callout && (
                <div className='rb-callout'>
                  <ExclamationCircleOutlined />
                  <span>{activeItem.content.callout}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mockup Column */}
          <div className='ri-mockup-col'>{activeItem.content.mockup}</div>
        </div>
      )}
    </div>
  )
}

export default RoasterInfo
