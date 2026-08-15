import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOutlined,
  CrownOutlined,
  TeamOutlined,
  DollarOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  RiseOutlined,
  FireOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ArrowDownOutlined,
  ApartmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import './nfl-rivals.css'
import {
  SQUAD_SIZE,
  ACTIVE_SIZE,
  BENCH_SIZE,
  SALARY_CAP,
  SALARY_FLOOR,
  POD_SIZE,
  PROMO_SPOTS,
  RELEGATION_SPOTS,
} from './rivalsConfig'

/* ══════════════════════════════════════════════════════════
   NFL RIVALS — RULESBOOK (League of Rivals dark redesign)
   Mirrors the Soccer RivalsRulesbook layout.
   NFL-specific content · purple #A78BFA accent · Oxanium titles
   No stadium background asset on NFL — keep the dark bg.
   ══════════════════════════════════════════════════════════ */

const capM = `$${(SALARY_CAP / 1e6).toFixed(0)}M`
const floorM = `$${(SALARY_FLOOR / 1e6).toFixed(0)}M`

/* ── Stats bar items (real NFL config values) ── */
const STATS = [
  { icon: <ApartmentOutlined />, value: '4', label: 'Divisions' },
  { icon: <CalendarOutlined />, value: '18', label: 'Weeks Per Season' },
  { icon: <TeamOutlined />, value: String(SQUAD_SIZE), label: 'Players Per Roster' },
  { icon: <DollarOutlined />, value: capM, label: 'Salary Cap' },
  { icon: <RiseOutlined />, value: `${PROMO_SPOTS} / ${RELEGATION_SPOTS}`, label: 'Promoted / Relegated' },
  { icon: <TrophyOutlined />, value: '5', label: 'Trophies To Earn' },
]

/* ── Rule cards (NFL rule text reused from the previous Rulesbook) ── */
const RULES = [
  {
    icon: <CrownOutlined />,
    title: 'What Is League of Rivals?',
    text: 'League of Rivals is a standalone prestige-based ladder competition for American Football. Unlike traditional fantasy leagues, RIVALS requires no league or draft — any registered user can enter. You build a 53-man roster from all active NFL players and compete in weekly head-to-head seasons across 4 divisions. Win matches, earn promotions, climb the ranks, and collect trophies on your way to the ultimate goal: Gridiron Elite (Division 1).',
  },
  {
    icon: <TeamOutlined />,
    title: 'Squad Rules',
    text: 'Your RIVALS roster consists of exactly 53 players drawn from all 32 NFL teams. You must field a valid 24-man Active Gameday roster each week. The Active Gameday roster requires a minimum of: 1 QB, 2 RB, 3 WR, 1 TE, 5 OL (any combination of OT, OG, C), 3 DL (any combination of DE, DT), 3 LB, 2 CB, 2 S, 1 K, and 1 P. The remaining 29 players form your Practice Squad and serve as depth for injuries and bye weeks.',
  },
  {
    icon: <DollarOutlined />,
    title: 'Salary Cap & Floor',
    text: 'The total salary cap is $301,000,000 ($301M). Each player\'s salary counts against this cap. You must also maintain a salary floor of $280,000,000 ($280M), meaning you cannot hoard cap space by fielding a roster of minimum-salary players. Player salaries are derived from real NFL contract data and update periodically. If your total roster salary exceeds $301M you will not be able to save your squad until you make changes.',
  },
  {
    icon: <SwapOutlined />,
    title: 'Player Roles & Scoring',
    text: 'Each player on your 53-man roster is assigned one of two roles: Active (Gameday roster) or Practice Squad. You must have exactly 24 Active players. Active players contribute 100% of their SAM Metric points each week. Practice Squad players contribute 0% — they are depth only. Points are calculated using the proprietary SAM Metric system, where every stat is weighted by a position-specific multiplier derived from real NFL franchise tag values. All touchdowns are flat 1.0 points regardless of position. Full IDP (Individual Defensive Player) scoring is supported — tackles, sacks, interceptions, forced fumbles, and more all count.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'The 4 Divisions',
    text: 'RIVALS features 4 competitive divisions. Every new player starts in Division 4 — Rookie Tier. The full division ladder: 4. Rookie Tier — where every manager begins their journey. 3. Varsity Conference — earn your stripes against proven competitors. 2. All-Pro League — the proving ground for elite managers. 1. Gridiron Elite — the pinnacle. Only the best survive here.',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Season Structure',
    text: 'Each RIVALS season runs for the duration of the NFL regular season (Weeks 1–18). At the start of each season, players are assigned to pods of 12 managers within the same division. Each pod operates as a mini-league where all 12 managers compete against each other over the course of the season. Your season record (wins, draws, losses) determines your final pod standing.',
  },
  {
    icon: <FireOutlined />,
    title: 'Weekly Scoring',
    text: 'Each NFL week (Thursday through Monday Night Football), your Active Gameday roster earns real-time SAM Metric points from all NFL games. Stats are processed live and weighted by each player\'s position-specific franchise tag multiplier — so a QB\'s passing yards are worth more per yard than an RB\'s rushing yards, just like the NFL values them. Your total weekly SAM score is compared head-to-head against every other manager in your pod. A win awards 3 points, a draw awards 1 point, and a loss awards 0 points. Total points across all weeks determine your pod ranking. Bye-week management is critical — make sure you have Active players who are actually playing that week.',
  },
  {
    icon: <RiseOutlined />,
    title: 'Promotion & Relegation',
    text: 'At the end of each season, the top 3 managers in each pod earn promotion to the next higher division. The bottom 3 managers are relegated to the division below. Managers finishing in the middle remain in their current division. Division 1 (Gridiron Elite) has no promotion — only the glory of staying at the top. Division 4 (Rookie Tier) has no relegation — it is the starting point for all new entrants.',
  },
  {
    icon: <TrophyOutlined />,
    title: 'Trophies & Achievements',
    text: 'Earn permanent trophies for your achievements. Division Trophy — finish in the top 3 of any pod. Giant Killer — defeat a manager from a higher division in a cross-division event. The Invincible — go an entire season unbeaten. Scout Master — have rookie players score big while on your Active roster. Gridiron Elite — reach Division 1. Trophies are permanently displayed in your Trophy Cabinet.',
  },
]

const VISIBLE_COUNT = 6

/* ── At a glance rows (real NFL config values) ── */
const AT_A_GLANCE = [
  { label: 'Roster Size', value: `${SQUAD_SIZE} players` },
  { label: 'Salary Cap', value: capM },
  { label: 'Salary Floor', value: floorM },
  { label: 'Active Gameday', value: String(ACTIVE_SIZE) },
  { label: 'Practice Squad', value: String(BENCH_SIZE) },
  { label: 'Pod Size', value: `${POD_SIZE} managers` },
  { label: 'Promoted / Relegated', value: `${PROMO_SPOTS} / ${RELEGATION_SPOTS}` },
]

/* ── Division ladder (1 top → 4 bottom) ── */
const LADDER = [
  'Gridiron Elite',
  'All-Pro League',
  'Varsity Conference',
  'Rookie Tier',
]

/* gold (#fbbf24) → purple (#A78BFA) lerp for the pyramid rows */
const lerp = (a, b, t) => Math.round(a + (b - a) * t)
const ladderColor = (i) => {
  const t = i / (LADDER.length - 1)
  const r = lerp(0xfb, 0xa7, t)
  const g = lerp(0xbf, 0x8b, t)
  const b = lerp(0x24, 0xfa, t)
  return `rgb(${r}, ${g}, ${b})`
}

/* ── Top trophies (NFL uses emoji badges, per Trophy Cabinet) ── */
const TOP_TROPHIES = [
  { icon: '👑', name: 'Gridiron Elite' },
  { icon: '🛡️', name: 'The Invincible' },
  { icon: '⚔️', name: 'Giant Killer' },
]

const RulesBook = () => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(() => new Set([0, 1, 2, 3, 4, 5]))
  const [showAll, setShowAll] = useState(false)

  const toggle = (idx) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const shownRules = showAll ? RULES : RULES.slice(0, VISIBLE_COUNT)
  const hasMore = RULES.length > VISIBLE_COUNT

  return (
    <div className="nflr-page rvz-rules-page">
      {/* ── Header ── */}
      <div className="rvz-rules-header">
        <div className="rvz-rules-head-icon"><BookOutlined /></div>
        <div>
          <h1 className="rvz-rules-title">Rulesbook</h1>
          <p className="rvz-rules-subtitle">
            Everything you need to know to compete and dominate in League of Rivals.
          </p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="rvz-rules-statsbar">
        {STATS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className="rvz-rules-stat-divider" />}
            <div className="rvz-rules-stat">
              <div className="rvz-rules-stat-icon">{s.icon}</div>
              <div className="rvz-rules-stat-body">
                <span className="rvz-rules-stat-value">{s.value}</span>
                <span className="rvz-rules-stat-label">{s.label}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Body: main + rail ── */}
      <div className="rvz-rules-grid">
        {/* Main column: rule cards */}
        <div className="rvz-rules-main">
          {shownRules.map((rule, idx) => {
            const isOpen = expanded.has(idx)
            return (
              <button
                type="button"
                key={rule.title}
                className={`rvz-rules-card${isOpen ? ' is-open' : ''}`}
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <div className="rvz-rules-card-num">{idx + 1}</div>
                <div className="rvz-rules-card-icon">{rule.icon}</div>
                <div className="rvz-rules-card-body">
                  <h3 className="rvz-rules-card-title">{rule.title}</h3>
                  {isOpen && <p className="rvz-rules-card-text">{rule.text}</p>}
                </div>
                <div className="rvz-rules-card-chevron"><RightOutlined /></div>
              </button>
            )
          })}

          {hasMore && (
            <button
              type="button"
              className="rvz-rules-more"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show fewer rules' : 'See more rules'} <ArrowDownOutlined className={showAll ? 'flip' : ''} />
            </button>
          )}
        </div>

        {/* Right rail */}
        <div className="rvz-rules-rail">
          {/* At a glance */}
          <div className="rvz-rules-railcard">
            <h3 className="rvz-rules-railtitle"><InfoCircleOutlined /> At a Glance</h3>
            <div className="rvz-rules-glance">
              {AT_A_GLANCE.map((row) => (
                <div className="rvz-rules-glance-row" key={row.label}>
                  <span className="rvz-rules-glance-label">{row.label}</span>
                  <span className="rvz-rules-glance-val">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Division ladder */}
          <div className="rvz-rules-railcard">
            <h3 className="rvz-rules-railtitle"><ArrowDownOutlined /> Division Ladder</h3>
            <div className="rvz-rules-pyramid">
              {LADDER.map((name, i) => (
                <div
                  className="rvz-rules-pyr-row"
                  key={name}
                  style={{
                    width: `${45 + (i / (LADDER.length - 1)) * 55}%`,
                    background: ladderColor(i),
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <ol className="rvz-rules-ladder-list">
              {LADDER.map((name, i) => (
                <li key={name}>
                  <span className="rvz-rules-ladder-n" style={{ color: ladderColor(i) }}>{i + 1}</span>
                  <span className="rvz-rules-ladder-name">{name}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="rvz-rules-ghost-btn"
              onClick={() => navigate('/nfl-rivals/leaderboard')}
            >
              View Full Ladder <RightOutlined />
            </button>
          </div>

          {/* Top trophies */}
          <div className="rvz-rules-railcard">
            <div className="rvz-rules-railhead">
              <h3 className="rvz-rules-railtitle"><TrophyOutlined /> Top Trophies</h3>
              <button
                type="button"
                className="rvz-rules-viewall"
                onClick={() => navigate('/nfl-rivals/trophies')}
              >
                View All Trophies
              </button>
            </div>
            <div className="rvz-rules-trophies">
              {TOP_TROPHIES.map((tr) => (
                <div className="rvz-rules-trophy" key={tr.name}>
                  <span className="rvz-rules-trophy-emoji" role="img" aria-label={tr.name}>{tr.icon}</span>
                  <span className="rvz-rules-trophy-cap">{tr.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RulesBook
