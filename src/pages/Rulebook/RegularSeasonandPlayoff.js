import { Button } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   SEASON TIMELINE VISUAL
   ═══════════════════════════════════════════════════════════ */
const TIMELINE_STEPS = [
  { icon: '\u{1F3AF}', label: 'Draft Pick Auction', phase: 'PRE-DRAFT', color: '#F59E0B' },
  { icon: '\u{1F4CB}', label: 'Startup Draft (7 Rounds)', phase: 'DRAFT', color: '#3B82F6' },
  { icon: '\u{1F3C8}', label: '17-Game Season + Bye', phase: 'REGULAR', color: '#22C55E' },
  { icon: '\u{1F525}', label: '14-Team Playoffs', phase: 'PLAYOFFS', color: '#EF4444' },
  { icon: '\u{1F3C6}', label: 'SAM Bowl', phase: 'FINALS', color: '#F59E0B' },
  { icon: '\u{2B50}', label: 'Rookie Draft', phase: 'OFFSEASON', color: '#A78BFA' },
]

const SeasonTimeline = () => (
  <div className='rs-timeline'>
    <div className='rs-timeline-title'>Season Flow</div>
    <div className='rs-timeline-track'>
      {TIMELINE_STEPS.map((s, i) => (
        <div key={s.label} className='rs-timeline-step'>
          <div className='rs-timeline-dot' style={{ background: s.color }}>
            <span>{s.icon}</span>
          </div>
          <div className='rs-timeline-info'>
            <div className='rs-timeline-phase' style={{ color: s.color }}>{s.phase}</div>
            <div className='rs-timeline-label'>{s.label}</div>
          </div>
          {i < TIMELINE_STEPS.length - 1 && <div className='rs-timeline-line' />}
        </div>
      ))}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   PLAYOFF BRACKET MOCKUP
   ═══════════════════════════════════════════════════════════ */
const PlayoffBracket = () => (
  <div className='rs-bracket'>
    <div className='rs-bracket-title'>Playoff Structure</div>
    <div className='rs-bracket-grid'>
      <div className='rs-bracket-round'>
        <div className='rs-bracket-round-label'>Wildcard</div>
        <div className='rs-bracket-slot'>12 Teams Play</div>
        <div className='rs-bracket-slot'>2 Teams Bye</div>
      </div>
      <div className='rs-bracket-arrow'>&rarr;</div>
      <div className='rs-bracket-round'>
        <div className='rs-bracket-round-label'>Divisional</div>
        <div className='rs-bracket-slot'>8 Teams</div>
      </div>
      <div className='rs-bracket-arrow'>&rarr;</div>
      <div className='rs-bracket-round'>
        <div className='rs-bracket-round-label'>Conference</div>
        <div className='rs-bracket-slot'>4 Teams</div>
      </div>
      <div className='rs-bracket-arrow'>&rarr;</div>
      <div className='rs-bracket-round rs-bracket-round--final'>
        <div className='rs-bracket-round-label'>SAM Bowl</div>
        <div className='rs-bracket-slot rs-bracket-slot--gold'>2 Teams</div>
      </div>
    </div>
    <div className='rs-bracket-note'>Top team per conference gets a wildcard bye</div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   STAT CARDS
   ═══════════════════════════════════════════════════════════ */
const STATS = [
  { value: '17', label: 'Games per Season', icon: '\u{1F3C8}' },
  { value: '14', label: 'Playoff Teams', icon: '\u{1F525}' },
  { value: '7', label: 'Rookie Draft Picks', icon: '\u{2B50}' },
  { value: '2 min', label: 'Per Draft Pick (Default)', icon: '\u{23F1}' },
]

/* ═══════════════════════════════════════════════════════════
   TAB DATA
   ═══════════════════════════════════════════════════════════ */
const TAB_ITEMS = [
  { key: 'predraft', label: 'Pre-Draft', icon: '\u{1F3AF}' },
  { key: 'regular', label: 'Regular Season', icon: '\u{1F3C8}' },
  { key: 'playoff', label: 'Playoffs', icon: '\u{1F525}' },
  { key: 'rookie', label: 'Rookie Draft', icon: '\u{2B50}' },
]

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const RegularSeasonandPlayoff = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('predraft')

  return (
    <div className='rb-page'>
      {/* Header */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>REGULAR SEASON &amp; <span>PLAYOFFS</span></h1>
            <p className='rb-page-subtitle'>INFO &amp; BREAKDOWN</p>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      <div className='rb-divider' />

      {/* Stat Cards Row */}
      <div className='rs-stats-row'>
        {STATS.map((s) => (
          <div key={s.label} className='rs-stat-card'>
            <span className='rs-stat-icon'>{s.icon}</span>
            <div className='rs-stat-value'>{s.value}</div>
            <div className='rs-stat-label'>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Custom Tabs */}
      <div className='sp-tabs'>
        <button
          className={`sp-tab ${activeTab === 'overview' ? 'sp-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className='sp-tab-icon'>&#128214;</span>
          Overview
        </button>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            className={`sp-tab ${activeTab === tab.key ? 'sp-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className='sp-tab-icon'>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Overview ─── */}
      {activeTab === 'overview' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#128214;</span>
                  <h2>Season <span>Overview</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    This section covers every phase of the SFL season &mdash; from the
                    pre-draft auction process through the regular season, playoffs, SAM Bowl,
                    and into the offseason rookie draft. Navigate the tabs above to explore
                    each phase in detail.
                  </p>
                </div>
              </div>
              <SeasonTimeline />
            </div>
            <div className='sp-layout-side'>
              <PlayoffBracket />
            </div>
          </div>
        </div>
      )}

      {/* ─── Pre-Draft ─── */}
      {activeTab === 'predraft' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#127919;</span>
                  <h2>Pre-Draft <span>Process</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    Once you join an SFL league, you begin with the pre-draft process.
                    During the offseason, choose your desired draft weekend. On your league
                    dashboard, click the <strong>Draft Pick Auction</strong> button to
                    compete for draft position, conference, and division placement.
                  </p>
                  <div className='sp-callout sp-callout--gold'>
                    <span className='sp-callout-icon'>&#127915;</span>
                    <div>
                      <strong>1,000,000 SP</strong> allocated for the Draft Pick Auction
                      &mdash; outbid opponents for your preferred draft slot
                    </div>
                  </div>
                  <p>
                    Once the startup draft begins, use your separate
                    <strong> 300,000,000 SP </strong> league wallet to draft your roster.
                    Each participant gets 2 minutes per pick by default (commissioners can adjust this). The draft runs 6 hours per day,
                    pausing and resuming the next day. Player costs follow the NFL rookie
                    wage scale &mdash; higher picks cost more SP.
                  </p>
                </div>
              </div>
            </div>
            <div className='sp-layout-side'>
              <div className='sp-tip-card'>
                <div className='sp-tip-badge'>&#128161; DRAFT TIP</div>
                <div className='sp-tip-text'>
                  The draft runs in 6-hour daily windows. Plan your strategy in advance
                  and know which players you want at each slot to make the most of your
                  3-minute clock per pick.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Regular Season ─── */}
      {activeTab === 'regular' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#127944;</span>
                  <h2>Regular <span>Season</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    Each team plays a 17-game schedule with one bye week, mirroring the A.Football
                    format. You face your division opponents twice per year. Based on your
                    draft spot, you&apos;re assigned an A.Football team whose schedule you mirror
                    &mdash; playing their home and away games.
                  </p>
                  <div className='sp-callout sp-callout--green'>
                    <span className='sp-callout-icon'>&#127967;</span>
                    <div>
                      <strong>Home &amp; Away</strong> matter! Check the Stadium tab to see
                      how location affects your attendance rewards and SamPoints earnings.
                    </div>
                  </div>
                  <p>
                    During your bye week, you can&apos;t win or lose, but you can still
                    accumulate points towards your total score. Use the bye to plan trades
                    and optimize your roster for the stretch run.
                  </p>
                </div>
              </div>
            </div>
            <div className='sp-layout-side'>
              <div className='rs-season-card'>
                <div className='rs-season-card-title'>Season Format</div>
                <div className='rs-season-item'>
                  <span className='rs-season-item-dot' style={{ background: '#22C55E' }} />
                  <span>17 regular season games</span>
                </div>
                <div className='rs-season-item'>
                  <span className='rs-season-item-dot' style={{ background: '#3B82F6' }} />
                  <span>1 bye week</span>
                </div>
                <div className='rs-season-item'>
                  <span className='rs-season-item-dot' style={{ background: '#F59E0B' }} />
                  <span>Division rivals faced 2x</span>
                </div>
                <div className='rs-season-item'>
                  <span className='rs-season-item-dot' style={{ background: '#EF4444' }} />
                  <span>NFL schedule mirrored</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Playoffs ─── */}
      {activeTab === 'playoff' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#128293;</span>
                  <h2>Playoff <span>Format</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    14 teams qualify for the playoffs, with the top team from each conference
                    receiving a wildcard bye. SFL playoffs run concurrently with the NFL
                    playoffs &mdash; teams making the SFL playoffs retain all players from
                    NFL teams that also made the NFL playoffs.
                  </p>
                  <div className='sp-callout sp-callout--gold'>
                    <span className='sp-callout-icon'>&#128260;</span>
                    <div>
                      <strong>Weekly Playoff Draft</strong>, Each playoff week features a
                      linear draft where top-record teams pick first. Fill your roster from
                      the available pool of NFL playoff players.
                    </div>
                  </div>
                  <p>
                    During wildcard week, the draft pool consists of players from NFL playoff
                    teams on SFL teams that didn&apos;t qualify plus SFL teams with first-round
                    byes. As long as SFL teams keep winning, they retain drafted players
                    through to the SAM Bowl.
                  </p>
                </div>
              </div>
            </div>
            <div className='sp-layout-side'>
              <PlayoffBracket />
            </div>
          </div>
        </div>
      )}

      {/* ─── Rookie Draft ─── */}
      {activeTab === 'rookie' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#11088;</span>
                  <h2>Rookie <span>Draft</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    The rookie draft order is determined in reverse order of the previous
                    season&apos;s overall standings, with each team receiving 7 picks per
                    year. Teams are free to trade these picks as they see fit.
                  </p>
                  <div className='sp-callout sp-callout--green'>
                    <span className='sp-callout-icon'>&#128176;</span>
                    <div>
                      Each draft pick has a fixed SamPoints cost based on the NFL rookie
                      wage scale &mdash; the <strong>#1 overall pick costs 12,700,000 SP</strong>
                      {' '}while a 7th-round pick costs as low as <strong>795,000 SP</strong>.
                    </div>
                  </div>
                  <p>
                    If a team lacks sufficient SamPoints at the time of their pick, they
                    cannot make a selection. If the clock runs out, the pick is forfeited.
                    A typical 7-pick draft costs roughly 13,500,000 SP out of your
                    300,000,000 SP budget.
                  </p>
                </div>
              </div>
            </div>
            <div className='sp-layout-side'>
              <div className='sp-tip-card'>
                <div className='sp-tip-badge'>&#128161; ROOKIE TIP</div>
                <div className='sp-tip-text'>
                  Worst records from last season get the highest picks. Sometimes a
                  strategic rebuild can set you up with premium talent for years to come.
                  Trade draft picks to consolidate or spread your selections.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegularSeasonandPlayoff
