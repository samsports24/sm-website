import { Button } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   MOCKUP, Wallet Split Visual
   ═══════════════════════════════════════════════════════════ */
const WalletSplit = () => (
  <div className='sp-wallet'>
    <div className='sp-wallet-title'>Your SamPoints Wallet</div>
    <div className='sp-wallet-bars'>
      <div className='sp-wallet-bar'>
        <div className='sp-wallet-bar-fill sp-wallet-bar--auction' style={{ width: '25%' }} />
        <div className='sp-wallet-bar-label'>
          <span className='sp-wallet-bar-name'>Draft Pick Auction</span>
          <span className='sp-wallet-bar-val sp-wallet-bar-val--gold'>1,000,000 SP</span>
        </div>
      </div>
      <div className='sp-wallet-bar'>
        <div className='sp-wallet-bar-fill sp-wallet-bar--draft' style={{ width: '100%' }} />
        <div className='sp-wallet-bar-label'>
          <span className='sp-wallet-bar-name'>Startup Draft Budget</span>
          <span className='sp-wallet-bar-val sp-wallet-bar-val--green'>300,000,000 SP</span>
        </div>
      </div>
    </div>
    <div className='sp-wallet-note'>Draft wallet is league-locked &bull; Earned SP transfers between leagues</div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   MOCKUP, Rookie Cost Tiers
   ═══════════════════════════════════════════════════════════ */
const ROOKIE_TIERS = [
  { round: '1st Overall', cost: '12,700,000', pct: 100, accent: '#F59E0B' },
  { round: 'Mid 1st', cost: '~8,000,000', pct: 63, accent: '#F59E0B' },
  { round: '2nd Round', cost: '~3,500,000', pct: 28, accent: '#3B82F6' },
  { round: '3rd Round', cost: '~2,000,000', pct: 16, accent: '#3B82F6' },
  { round: '4th Round', cost: '~1,200,000', pct: 9, accent: '#22C55E' },
  { round: '5th-6th', cost: '~900,000', pct: 7, accent: '#22C55E' },
  { round: '7th Round', cost: '795,000', pct: 6, accent: '#94A3B8' },
]

const RookieCostChart = () => (
  <div className='sp-rookies'>
    <div className='sp-rookies-title'>Rookie Wage Scale (NFL-Based)</div>
    <div className='sp-rookies-bars'>
      {ROOKIE_TIERS.map((t) => (
        <div key={t.round} className='sp-rookie-row'>
          <div className='sp-rookie-round'>{t.round}</div>
          <div className='sp-rookie-bar-wrap'>
            <div
              className='sp-rookie-bar-fill'
              style={{ width: t.pct + '%', background: t.accent }}
            />
          </div>
          <div className='sp-rookie-cost'>{t.cost} SP</div>
        </div>
      ))}
    </div>
    <div className='sp-rookies-note'>Full 7-round draft &#8776; 13,500,000 SP of your 300M budget</div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   EARN METHODS
   ═══════════════════════════════════════════════════════════ */
const EARN_METHODS = [
  { icon: '\u{1F3DF}', label: 'Stadium Tab', desc: 'Earn weekly SP from attendance and match performance' },
  { icon: '\u{1F504}', label: 'Trading Players', desc: 'Earn SP from successful trades, flips, and smart roster moves' },
  { icon: '\u{1F50D}', label: 'Scouting (Coming Soon)', desc: 'Scout future draft picks, buy them early, and earn SP when they get selected' },
]

/* ═══════════════════════════════════════════════════════════
   TAB DATA
   ═══════════════════════════════════════════════════════════ */
const TAB_ITEMS = [
  { key: 'economy', label: 'Economy', icon: '\u{1F4B0}' },
  { key: 'rookies', label: 'Rookie Scale', icon: '\u{2B50}' },
  { key: 'earning', label: 'Earning SP', icon: '\u{1F4C8}' },
]

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const SampointsBreakdown = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('economy')

  return (
    <div className='rb-page'>
      {/* Header */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>SamPoints <span>Breakdown</span></h1>
            <p className='rb-page-subtitle'>IN-GAME ECONOMY</p>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      <div className='rb-divider' />

      {/* Custom Tabs */}
      <div className='sp-tabs'>
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

      {/* ─── Economy Tab ─── */}
      {activeTab === 'economy' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#128176;</span>
                  <h2>SamPoints <span>Economy</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    <strong>SamPoints</strong> are the cornerstone of our in-game economy,
                    facilitating player acquisitions, upgrades, and rewarding activities.
                    When you join a league, you receive two separate SamPoints allocations:
                  </p>
                  <div className='sp-callout sp-callout--gold'>
                    <span className='sp-callout-icon'>&#127915;</span>
                    <div>
                      <strong>1,000,000 SP</strong> for the Draft Pick Auction &mdash; challenge
                      other users to secure your preferred draft position
                    </div>
                  </div>
                  <div className='sp-callout sp-callout--green'>
                    <span className='sp-callout-icon'>&#128101;</span>
                    <div>
                      <strong>300,000,000 SP</strong> for the Startup Draft &mdash; build your
                      roster across 7 rounds using the NFL rookie wage scale
                    </div>
                  </div>
                  <p>
                    Your 300M draft wallet is locked to your league and cannot be transferred.
                    Each week, earn additional SamPoints through the stadium tab. Earned SP are
                    freely transferable between leagues and fund incoming rookies annually.
                  </p>
                </div>
              </div>
            </div>

            <div className='sp-layout-side'>
              <WalletSplit />
            </div>
          </div>
        </div>
      )}

      {/* ─── Rookie Scale Tab ─── */}
      {activeTab === 'rookies' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#11088;</span>
                  <h2>Rookie <span>Wage Scale</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    Each rookie&apos;s cost follows the NFL rookie wage scale based on their draft
                    slot position, ensuring that higher picks require a greater investment of
                    SamPoints. This system ensures fairness and strategic planning in roster
                    management. A full 7-pick draft typically costs around 13,500,000 SP.
                  </p>
                </div>
              </div>
              <RookieCostChart />
            </div>

            <div className='sp-layout-side'>
              <div className='sp-tip-card'>
                <div className='sp-tip-badge'>&#128161; KEY INSIGHT</div>
                <div className='sp-tip-text'>
                  The #1 overall pick costs <strong>12.7M SP</strong> while a 7th-rounder
                  costs just <strong>795K SP</strong>. A full 7-round draft uses roughly
                  4.5% of your 300M budget &mdash; leaving plenty for trades and free agency.
                </div>
              </div>
              <div className='sp-tip-card'>
                <div className='sp-tip-badge'>&#9889; DRAFT STRATEGY</div>
                <div className='sp-tip-text'>
                  Trading down from early 1st-round picks can save millions of SP. Consider
                  acquiring extra mid-round picks to build roster depth while preserving
                  your long-term budget.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Earning Tab ─── */}
      {activeTab === 'earning' && (
        <div className='rb-content-area'>
          <div className='sp-layout'>
            <div className='sp-layout-main'>
              <div className='rb-section-card'>
                <div className='rb-section-header'>
                  <span className='rb-section-icon'>&#128200;</span>
                  <h2>Earning <span>SamPoints</span></h2>
                </div>
                <div className='rb-section-body'>
                  <p>
                    Beyond your initial allocations, SamPoints can be earned through multiple
                    in-game activities. Earned SP are transferable between leagues, giving you
                    flexibility across all your teams. Check the Rewards section for full details.
                  </p>
                </div>
              </div>

              <div className='sp-earn-grid'>
                {EARN_METHODS.map((m) => (
                  <div key={m.label} className='sp-earn-card'>
                    <span className='sp-earn-icon'>{m.icon}</span>
                    <div className='sp-earn-label'>{m.label}</div>
                    <div className='sp-earn-desc'>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='sp-layout-side'>
              <div className='sp-tip-card'>
                <div className='sp-tip-badge'>&#128161; PRO TIP</div>
                <div className='sp-tip-text'>
                  Manage your 300M draft budget wisely. Higher picks cost significantly more &mdash;
                  sometimes it&apos;s smarter to trade down and spread your SP across more rounds.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SampointsBreakdown
