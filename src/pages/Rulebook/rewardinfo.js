import React, { useState } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  GiftOutlined,
  CrownOutlined,
  HomeOutlined,
  RiseOutlined,
  StarFilled,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   STADIUM MOCKUP, Replaces old stadium screenshot
   ═══════════════════════════════════════════════════════════ */
const StadiumMockup = () => (
  <div className='rw-mockup'>
    <div className='rw-mockup-header'>
      <span className='rw-mockup-badge'>STADIUM</span>
      <span className='rw-mockup-title'>Weekly Revenue Overview</span>
    </div>
    <div className='rw-stadium-visual'>
      <div className='rw-stadium-ring'>
        <div className='rw-stadium-center'>
          <div className='rw-stadium-capacity'>60,000</div>
          <div className='rw-stadium-label'>SEATS</div>
        </div>
      </div>
      <div className='rw-stadium-stats'>
        <div className='rw-stadium-stat'>
          <span className='rw-stadium-stat-val' style={{ color: '#22C55E' }}>85 SP</span>
          <span className='rw-stadium-stat-lbl'>Per Seat / Week</span>
        </div>
        <div className='rw-stadium-stat'>
          <span className='rw-stadium-stat-val' style={{ color: '#3B82F6' }}>5,100,000</span>
          <span className='rw-stadium-stat-lbl'>Weekly League Pot</span>
        </div>
        <div className='rw-stadium-stat'>
          <span className='rw-stadium-stat-val' style={{ color: '#F59E0B' }}>100%</span>
          <span className='rw-stadium-stat-lbl'>Week 1 Attendance</span>
        </div>
      </div>
    </div>
    <div className='rw-stadium-splits'>
      <div className='rw-stadium-split'>
        <div className='rw-split-bar' style={{ width: '90%', background: 'linear-gradient(90deg, #22C55E, rgba(34,197,94,0.4))' }} />
        <span className='rw-split-pct'>90%</span>
        <span className='rw-split-lbl'>Home Owner</span>
      </div>
      <div className='rw-stadium-split'>
        <div className='rw-split-bar' style={{ width: '10%', background: 'linear-gradient(90deg, #F59E0B, rgba(245,158,11,0.4))' }} />
        <span className='rw-split-pct'>10%</span>
        <span className='rw-split-lbl'>Away Team</span>
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   REWARD TIER COMPONENT
   ═══════════════════════════════════════════════════════════ */
const RewardRow = ({ label, value, desc, highlight }) => (
  <div className={`rw-reward-row ${highlight ? 'rw-reward-row--champ' : ''}`}>
    <div className='rw-reward-row-left'>
      {highlight && <CrownOutlined style={{ color: '#F59E0B', fontSize: 16 }} />}
      <div>
        <div className='rw-reward-label'>{label}</div>
        <div className='rw-reward-desc'>{desc}</div>
      </div>
    </div>
    <div className={`rw-reward-pct ${highlight ? 'rw-reward-pct--gold' : ''}`}>{value}</div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const RewardInfo = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stadium')

  const tabs = [
    { key: 'stadium', label: 'Stadium Rewards', icon: <HomeOutlined /> },
    { key: 'league', label: 'League Rewards', icon: <TrophyOutlined /> },
    { key: 'playoff', label: 'Playoff Rewards', icon: <CrownOutlined /> },
  ]

  return (
    <div className='rb-page rw-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>REWARDS <span>INFO & BREAKDOWN</span></h1>
            <span className='rb-page-subtitle'>SAMPOINTS ECONOMY</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Overview Card ── */}
      <div className='rw-overview'>
        <GiftOutlined className='rw-overview-icon' />
        <div className='rw-overview-text'>
          <div className='rw-overview-title'>How Rewards Work</div>
          <div className='rw-overview-desc'>
            Earn SamPoints through stadium attendance, regular season performance, and playoff victories.
            68% of the prize pool goes to regular season rewards, while 32% is reserved for postseason.
          </div>
        </div>
      </div>

      {/* ── Tab Buttons ── */}
      <div className='rw-tabs'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`rw-tab ${activeTab === tab.key ? 'rw-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Stadium Rewards ═══ */}
      {activeTab === 'stadium' && (
        <div className='rw-split-layout'>
          <div className='rw-text-col'>
            <div className='rb-section-card'>
              <div className='rb-section-header'>
                <h2>Stadium <span className='rb-highlight'>Rewards</span></h2>
              </div>
              <p className='ri-paragraph'>
                Weekly rewards are all about filling your stadium seats with fans! Each team starts with a
                stadium capacity of 60,000 seats. Each seat generates 85 SamPoints per week, creating a
                weekly league pot of 5,100,000 SamPoints. During week one, home games achieve 100% attendance.
              </p>
              <p className='ri-paragraph'>
                Each week, the SamPoints generated from ticket sales are split between both teams:
                90% goes to the home team owner, and 10% goes to the away team.
              </p>

              <div className='rw-attendance-card'>
                <div className='rw-attendance-header'>
                  <RiseOutlined /> ATTENDANCE DYNAMICS
                </div>
                <div className='rw-attendance-grid'>
                  <div className='rw-att-item rw-att-item--loss'>
                    <span className='rw-att-delta'>-3%</span>
                    <span className='rw-att-trigger'>Per Loss</span>
                  </div>
                  <div className='rw-att-item rw-att-item--win'>
                    <span className='rw-att-delta'>+3%</span>
                    <span className='rw-att-trigger'>Per Win</span>
                  </div>
                  <div className='rw-att-item rw-att-item--login'>
                    <span className='rw-att-delta'>+1.5%</span>
                    <span className='rw-att-trigger'>Daily Login (Sun-Wed)</span>
                  </div>
                  <div className='rw-att-item rw-att-item--floor'>
                    <span className='rw-att-delta'>49%</span>
                    <span className='rw-att-trigger'>Minimum Floor</span>
                  </div>
                </div>
              </div>

              <p className='ri-paragraph'>
                Teams can also invest in stadium renovations to increase capacity up to 80,000 seats,
                boosting home game SamPoints pots for greater returns.
              </p>
            </div>
          </div>
          <div className='rw-mockup-col'>
            <StadiumMockup />
          </div>
        </div>
      )}

      {/* ═══ League Rewards ═══ */}
      {activeTab === 'league' && (
        <div className='rw-rewards-section'>
          <div className='rb-section-card'>
            <div className='rb-section-header'>
              <h2>Regular Season <span className='rb-highlight'>Rewards Breakdown</span></h2>
              <p className='rb-section-subtitle'>68% of SamPoints Prize Pool</p>
            </div>
            <div className='rw-rewards-list'>
              <RewardRow label='Regular Season Winner' value='14.727%' desc='of Regular Season SamPoints Prize Pool' />
              <RewardRow label='Opposite Conference Winner' value='12.727%' desc='of SamPoints Prize Pool' />
              <RewardRow label='Next Best Division Winners (2 per conf.)' value='10.727% each' desc='of SamPoints Prize Pool' />
              <RewardRow label='Following Division Winners (2 per conf.)' value='8.727% each' desc='of SamPoints Prize Pool' />
              <RewardRow label='Final Division Winners (2 per conf.)' value='6.727% each' desc='of SamPoints Prize Pool' />
              <RewardRow label='Wildcard Spots (6 teams)' value='3.364% each' desc='of SamPoints Prize Pool' />
            </div>
          </div>
          <div className='rw-pool-callout'>
            <InfoCircleOutlined />
            <span>68% of the SamPoints prize pool is allocated to regular season rewards, while 32% goes to postseason.</span>
          </div>
        </div>
      )}

      {/* ═══ Playoff Rewards ═══ */}
      {activeTab === 'playoff' && (
        <div className='rw-rewards-section'>
          <div className='rb-section-card'>
            <div className='rb-section-header'>
              <h2>Playoff & SAM Bowl <span className='rb-highlight'>Rewards</span></h2>
              <p className='rb-section-subtitle'>32% of SamPoints Prize Pool</p>
            </div>
            <div className='rw-rewards-list'>
              <RewardRow label='First Round Bye Teams (2 teams)' value='3.958% each' desc='of Postseason SamPoints Prize Pool' />
              <RewardRow label='Wildcard Week Winners (6 teams)' value='3.958% each' desc='of Postseason SamPoints Prize Pool' />
              <RewardRow label='Divisional Round Winners (4 teams)' value='5.541% each' desc='of Postseason SamPoints Prize Pool' />
              <RewardRow label='Conf Finals Winners (2 teams)' value='9.235% each' desc='of Postseason SamPoints Prize Pool' />
              <RewardRow label='SAM Bowl Winner' value='27.704%' desc='of Postseason SamPoints Prize Pool' highlight />
            </div>
          </div>
          <div className='rw-pool-callout rw-pool-callout--gold'>
            <StarFilled />
            <span>The SAM Bowl Winner takes home the largest single reward, 27.704% of the entire postseason prize pool!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RewardInfo
