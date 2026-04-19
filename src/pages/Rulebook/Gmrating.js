import { Button } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  DashboardOutlined,
  TrophyOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  StarFilled,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   GM RATING GAUGE, Visual Score Display
   ═══════════════════════════════════════════════════════════ */
const GmGauge = ({ score = 78.5 }) => {
  const radius = 90
  const stroke = 12
  const circumference = Math.PI * radius
  const progress = (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 85) return '#22C55E'
    if (s >= 65) return '#3B82F6'
    if (s >= 40) return '#F59E0B'
    return '#EF4444'
  }

  const getLabel = (s) => {
    if (s >= 85) return 'ELITE'
    if (s >= 65) return 'STRONG'
    if (s >= 40) return 'AVERAGE'
    return 'POOR'
  }

  const color = getColor(score)

  return (
    <div className='gm-gauge'>
      <svg width='200' height='120' viewBox='0 0 200 120'>
        {/* Background arc */}
        <path
          d='M 10 110 A 90 90 0 0 1 190 110'
          fill='none'
          stroke='rgba(255,255,255,0.06)'
          strokeWidth={stroke}
          strokeLinecap='round'
        />
        {/* Progress arc */}
        <path
          d='M 10 110 A 90 90 0 0 1 190 110'
          fill='none'
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={`${progress} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className='gm-gauge-value' style={{ color }}>
        {score.toFixed(2)}
      </div>
      <div className='gm-gauge-label' style={{ color }}>{getLabel(score)}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FORMULA BREAKDOWN VISUAL
   ═══════════════════════════════════════════════════════════ */
const FormulaBreakdown = () => (
  <div className='gm-formula'>
    <div className='gm-formula-title'>
      <DashboardOutlined /> RATING FORMULA
    </div>
    <div className='gm-formula-equation'>
      <div className='gm-formula-component gm-formula-component--lineup'>
        <div className='gm-formula-weight'>55%</div>
        <div className='gm-formula-name'>Lineup IQ</div>
        <div className='gm-formula-desc'>Starter vs Bench differential</div>
      </div>
      <div className='gm-formula-operator'>+</div>
      <div className='gm-formula-component gm-formula-component--score'>
        <div className='gm-formula-weight'>45%</div>
        <div className='gm-formula-name'>Weekly Score</div>
        <div className='gm-formula-desc'>Normalized across platform</div>
      </div>
      <div className='gm-formula-operator'>=</div>
      <div className='gm-formula-component gm-formula-component--total'>
        <div className='gm-formula-weight'>
          <DashboardOutlined />
        </div>
        <div className='gm-formula-name'>GM Rating</div>
        <div className='gm-formula-desc'>0.00, 100.00</div>
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   EXAMPLE SCENARIOS
   ═══════════════════════════════════════════════════════════ */
const ScenarioCard = ({ icon, title, rating, color, items, type }) => (
  <div className={`gm-scenario gm-scenario--${type}`}>
    <div className='gm-scenario-header'>
      <span className='gm-scenario-icon'>{icon}</span>
      <div>
        <div className='gm-scenario-title'>{title}</div>
        <div className='gm-scenario-rating' style={{ color }}>
          {rating}
        </div>
      </div>
    </div>
    <div className='gm-scenario-list'>
      {items.map((item, i) => (
        <div key={i} className='gm-scenario-item'>
          <span className='gm-scenario-bullet' style={{ background: color }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   RATING TIERS TABLE
   ═══════════════════════════════════════════════════════════ */
const RatingTiers = () => {
  const tiers = [
    { range: '85, 100', label: 'Elite', color: '#22C55E', icon: <StarFilled />, desc: 'Top-tier GM decisions, optimal lineups consistently' },
    { range: '65, 84', label: 'Strong', color: '#3B82F6', icon: <RiseOutlined />, desc: 'Solid management with room for improvement' },
    { range: '40, 64', label: 'Average', color: '#F59E0B', icon: <InfoCircleOutlined />, desc: 'Inconsistent lineup choices, mixed results' },
    { range: '0, 39', label: 'Poor', color: '#EF4444', icon: <FallOutlined />, desc: 'Bench players frequently outscoring starters' },
  ]

  return (
    <div className='gm-tiers'>
      <div className='gm-tiers-title'>
        <TrophyOutlined /> RATING TIERS
      </div>
      <div className='gm-tiers-grid'>
        {tiers.map((t) => (
          <div key={t.label} className='gm-tier-row'>
            <div className='gm-tier-bar' style={{ background: t.color }} />
            <div className='gm-tier-icon' style={{ color: t.color }}>{t.icon}</div>
            <div className='gm-tier-info'>
              <div className='gm-tier-label' style={{ color: t.color }}>{t.label}</div>
              <div className='gm-tier-desc'>{t.desc}</div>
            </div>
            <div className='gm-tier-range'>{t.range}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const GmRating = () => {
  const navigate = useNavigate()
  const [activeDetail, setActiveDetail] = useState('lineup')

  const detailTabs = [
    { key: 'lineup', label: 'Lineup IQ (55%)', icon: <ThunderboltOutlined /> },
    { key: 'score', label: 'Weekly Score (45%)', icon: <RiseOutlined /> },
  ]

  const detailContent = {
    lineup: {
      title: 'Bench vs. Starting',
      highlight: 'Lineup (55%)',
      paragraphs: [
        'This is the largest component of your GM Rating. It measures how well you set your starting lineup each week by comparing the total points scored by your starters against your bench players at each position.',
        'When your starting players outscore bench players in the same positions, your Lineup IQ increases. Selecting the optimal formation for both offense and defense, ensuring that the highest-scoring players are on the field, is crucial.',
        'Points are deducted whenever a bench player outscores the starter at their position. The formula calculates: Starter Sum / (Starter Sum + Bench Sum) × 100, then averages across all weeks played.',
      ],
      tips: [
        'Always check injury reports before setting lineups',
        'Consider bye weeks when selecting non-active players',
        'Review matchup data to identify favorable starts',
        'Monitor practice participation for last-minute changes',
      ],
    },
    score: {
      title: 'Average Weekly',
      highlight: 'Score (45%)',
      paragraphs: [
        'This component assesses your overall performance by calculating the average points scored per week across the entire season. Your score is then normalized against all other GMs in the platform.',
        'The normalization works on a 0-100 scale: the highest average weekly scorer across all leagues receives 100, and the lowest receives 0. Everyone else falls in between based on their relative performance.',
        'This ensures that your GM Rating reflects not just good lineup decisions but also overall team strength, trade savvy, and draft performance that contribute to higher weekly totals.',
      ],
      tips: [
        'Target high-floor players for consistent weekly scores',
        'Use the waiver wire and free agency aggressively',
        'Make strategic trades to strengthen weak positions',
        'Monitor the auction house for undervalued talent',
      ],
    },
  }

  const detail = detailContent[activeDetail]

  return (
    <div className='rb-page gm-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>GM RATING</h1>
            <span className='rb-page-subtitle'>LIVE IN YOUR WAR ROOM</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Hero Section: Gauge + Formula ── */}
      <div className='gm-hero'>
        <div className='gm-hero-gauge'>
          <div className='gm-hero-gauge-label'>EXAMPLE RATING</div>
          <GmGauge score={78.5} />
          <div className='gm-hero-gauge-sub'>
            Your rating updates weekly in your War Room
          </div>
        </div>
        <div className='gm-hero-formula'>
          <FormulaBreakdown />
        </div>
      </div>

      {/* ── Detail Tabs ── */}
      <div className='gm-detail-tabs'>
        {detailTabs.map((tab) => (
          <button
            key={tab.key}
            className={`gm-detail-tab ${activeDetail === tab.key ? 'gm-detail-tab--active' : ''}`}
            onClick={() => setActiveDetail(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Detail Content ── */}
      <div className='gm-detail-content'>
        <div className='gm-detail-text'>
          <div className='rb-section-card'>
            <div className='rb-section-header'>
              <h2>{detail.title} <span className='rb-highlight'>{detail.highlight}</span></h2>
            </div>
            {detail.paragraphs.map((p, i) => (
              <p key={i} className='ri-paragraph'>{p}</p>
            ))}
          </div>
        </div>

        <div className='gm-detail-tips'>
          <div className='gm-tips-card'>
            <div className='gm-tips-title'>
              <CheckCircleOutlined /> PRO TIPS
            </div>
            {detail.tips.map((tip, i) => (
              <div key={i} className='gm-tip-item'>
                <span className='gm-tip-num'>{String(i + 1).padStart(2, '0')}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Rating Tiers ── */}
      <RatingTiers />

      {/* ── Scenarios ── */}
      <div className='gm-scenarios'>
        <div className='gm-scenarios-title'>PERFORMANCE EXAMPLES</div>
        <div className='gm-scenarios-grid'>
          <ScenarioCard
            type='optimal'
            icon={<StarFilled style={{ color: '#22C55E' }} />}
            title='Optimal Performance'
            rating='100.00 GM Rating'
            color='#22C55E'
            items={[
              'All highest-scoring players set as starters every week',
              'Correct formations selected for offense and defense',
              'Zero instances of bench players outscoring starters',
              'Highest average weekly score across all leagues',
            ]}
          />
          <ScenarioCard
            type='poor'
            icon={<WarningOutlined style={{ color: '#EF4444' }} />}
            title='Poor Performance'
            rating='0.00 GM Rating'
            color='#EF4444'
            items={[
              'Incorrect formations consistently selected',
              'Bench players frequently outscore starters',
              'Lowest weekly average score in the league',
              'No strategic adjustments made week-to-week',
            ]}
          />
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className='gm-cta'>
        <div className='gm-cta-inner'>
          <DashboardOutlined className='gm-cta-icon' />
          <div>
            <div className='gm-cta-title'>Check Your GM Rating</div>
            <div className='gm-cta-sub'>View your live rating in the War Room alongside league standings</div>
          </div>
          <Button
            className='gm-cta-btn'
            onClick={() => navigate('/war-room')}
          >
            GO TO WAR ROOM
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GmRating
