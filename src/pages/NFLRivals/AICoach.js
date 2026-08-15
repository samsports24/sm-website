import React, { useState, useEffect, useCallback, useRef } from 'react'
import { privateAPI } from '../../config/constants'
import { Spin } from 'antd'
import {
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { SALARY_CAP, SALARY_FLOOR, SQUAD_SIZE, SPECIAL_TEAMS_SIZE } from './rivalsConfig'
import './nfl-rivals.css'

/* ═══════════════════════════════════════════════════════════════
   AI COACH — NFL Rivals Edition
   Dark sci-fi HUD (purple-on-near-black) roster health analysis.
   Fetches GET /nfl-rivals/profile → analyses squad locally.
   ═══════════════════════════════════════════════════════════════ */

const GRADE_COLOR = { 'A+': '#22C55E', A: '#22C55E', B: '#84CC16', C: '#EAB308', D: '#F97316', F: '#EF4444' }
const PRIO_COLOR  = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', info: '#4ADE80' }
const PRIO_ORDER  = { critical: 0, high: 1, medium: 2, info: 3 }

/* ─── Unit display (NFL position groups) ─── */
const UNIT_ICON  = { offense: '🏈', defense: '🛡️', special: '🦶' }
const UNIT_LABEL = { offense: 'OFFENSE', defense: 'DEFENSE', special: 'SPECIAL TEAMS' }

/* ─── Position helpers ─── */
const OFFENSE_POS = new Set(['QB','RB','WR','TE','OL','OT','OG','C','G','T'])
const DEFENSE_POS = new Set(['DE','DT','DL','LB','CB','S','SS','FS'])
const SPECIAL_POS = new Set(['K','P'])

const getUnit = (pos) => {
  const p = (pos || '').toUpperCase()
  if (OFFENSE_POS.has(p)) return 'offense'
  if (DEFENSE_POS.has(p)) return 'defense'
  if (SPECIAL_POS.has(p)) return 'special'
  return 'unknown'
}

const getSalary = (p) => {
  return p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0
}

const getPoints = (p) => {
  return p.pointsPerGame || p.avgPf || p.playerScore || 0
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/* ─── Health Score Computation ─── */
const computeHealth = (squad) => {
  const players = (squad || []).map(s => ({ ...s, playerData: s.player })).filter(s => s.playerData)
  const total = players.length

  // Unit counts
  const unitHealth = {
    offense: { total: 0, healthy: 0 },
    defense: { total: 0, healthy: 0 },
    special: { total: 0, healthy: 0 },
  }

  // Role counts
  const roleCounts = { offense_starter: 0, defense_starter: 0, special_teams: 0, bench: 0 }
  const injuries = []
  const suspensions = []
  let totalSalary = 0

  // Position detail
  const posCount = {}

  for (const s of players) {
    const p = s.playerData
    const pos = (p.Position || '').toUpperCase()
    const unit = getUnit(pos)
    const role = s.role || 'bench'

    if (unitHealth[unit]) {
      unitHealth[unit].total++
      if (!p.isPlayerInjured && !p.injured) unitHealth[unit].healthy++
    }

    if (roleCounts[role] !== undefined) roleCounts[role]++

    totalSalary += getSalary(p)

    // Track positions
    posCount[pos] = (posCount[pos] || 0) + 1

    if (p.isPlayerInjured || p.injured) {
      injuries.push({
        _id: p._id,
        name: p.Name || 'Unknown',
        position: pos,
        injuryType: p.injuryType || 'Undisclosed',
        severity: 'moderate',
        daysOut: '?',
      })
    }

    if (p.isSuspended) {
      suspensions.push({
        _id: p._id,
        name: p.Name || 'Unknown',
        position: pos,
      })
    }
  }

  // ── Score components (out of 100) ──
  let score = 0

  // Squad size: 53 = full marks (25 pts)
  score += Math.min((total / SQUAD_SIZE) * 25, 25)

  // Injury penalty: -4 per injury, up to -20
  score -= Math.min(injuries.length * 4, 20)

  // Role assignments (25 pts) — reward filling offense/defense/special correctly
  const offOk = roleCounts.offense_starter >= 8  // at least 8 of 11
  const defOk = roleCounts.defense_starter >= 8
  const spOk  = roleCounts.special_teams >= SPECIAL_TEAMS_SIZE
  score += (offOk ? 9 : Math.round((roleCounts.offense_starter / 11) * 9))
  score += (defOk ? 9 : Math.round((roleCounts.defense_starter / 11) * 9))
  score += (spOk ? 7 : Math.round((roleCounts.special_teams / SPECIAL_TEAMS_SIZE) * 7))

  // Unit depth (15 pts) — enough healthy bodies per unit
  const offDepth = unitHealth.offense.healthy >= 22
  const defDepth = unitHealth.defense.healthy >= 22
  const spDepth  = unitHealth.special.healthy >= SPECIAL_TEAMS_SIZE
  score += (offDepth ? 5 : Math.round((unitHealth.offense.healthy / 22) * 5))
  score += (defDepth ? 5 : Math.round((unitHealth.defense.healthy / 22) * 5))
  score += (spDepth ? 5 : Math.round((unitHealth.special.healthy / SPECIAL_TEAMS_SIZE) * 5))

  // Salary compliance (10 pts) — within the 280M-301M window
  if (totalSalary >= SALARY_FLOOR && totalSalary <= SALARY_CAP) {
    score += 10
  } else if (totalSalary > 0) {
    score += 3  // at least has some salary value
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  // Grade
  let grade
  if (score >= 90) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 70) grade = 'B'
  else if (score >= 55) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  // ── Actionable Tips ──
  const tips = []

  if (total < SQUAD_SIZE) {
    tips.push({
      priority: total < 30 ? 'critical' : 'high',
      icon: '📋',
      title: `Roster incomplete (${total}/${SQUAD_SIZE})`,
      text: `You need ${SQUAD_SIZE - total} more players to fill your ${SQUAD_SIZE}-man roster. Search the market to add depth.`,
    })
  }

  if (roleCounts.offense_starter < 11) {
    tips.push({
      priority: roleCounts.offense_starter < 6 ? 'critical' : 'high',
      icon: '🏈',
      title: `Offense needs starters (${roleCounts.offense_starter}/11)`,
      text: `Move ${11 - roleCounts.offense_starter} more offensive players from your bench into the Offense zone.`,
    })
  }

  if (roleCounts.defense_starter < 11) {
    tips.push({
      priority: roleCounts.defense_starter < 6 ? 'critical' : 'high',
      icon: '🛡️',
      title: `Defense needs starters (${roleCounts.defense_starter}/11)`,
      text: `Move ${11 - roleCounts.defense_starter} more defensive players from your bench into the Defense zone.`,
    })
  }

  if (roleCounts.special_teams < 2) {
    tips.push({
      priority: 'high',
      icon: '🦶',
      title: `Special teams incomplete (${roleCounts.special_teams}/2)`,
      text: 'You need a Kicker and a Punter in the K/P zone for complete scoring coverage.',
    })
  }

  // QB check
  const hasQB = players.some(s => (s.playerData.Position || '').toUpperCase() === 'QB' && s.role === 'offense_starter')
  if (!hasQB && total > 0) {
    tips.push({
      priority: 'critical',
      icon: '🎯',
      title: 'No QB in offense starters',
      text: 'Your offense has no starting quarterback. Move a QB into the Offense zone — this is essential for scoring.',
    })
  }

  if (injuries.length > 0) {
    tips.push({
      priority: injuries.length >= 4 ? 'high' : 'medium',
      icon: '🏥',
      title: `${injuries.length} injured player${injuries.length > 1 ? 's' : ''}`,
      text: 'Injuries are reducing your available depth. Make sure injured players aren\'t in starter roles.',
    })
  }

  if (totalSalary > SALARY_CAP) {
    tips.push({
      priority: 'critical',
      icon: '💰',
      title: 'Over salary cap',
      text: `Your squad salary ($${(totalSalary / 1e6).toFixed(1)}M) exceeds the $${(SALARY_CAP / 1e6).toFixed(0)}M cap. You must reduce salary to save your squad.`,
    })
  } else if (totalSalary < SALARY_FLOOR && total > 0) {
    tips.push({
      priority: 'medium',
      icon: '💰',
      title: 'Under salary floor',
      text: `Your squad salary ($${(totalSalary / 1e6).toFixed(1)}M) is below the $${(SALARY_FLOOR / 1e6).toFixed(0)}M floor. Add higher-value players.`,
    })
  }

  if (tips.length === 0) {
    tips.push({
      priority: 'info',
      icon: '✅',
      title: 'Roster looking strong',
      text: 'Your 53-man roster is healthy, complete, and salary-compliant. Focus on optimising your lineup for maximum weekly points.',
    })
  }

  return {
    score, grade, injuries, suspensions, tips,
    unitHealth,
    roleCounts,
    squadSize: total,
    injuredCount: injuries.length,
    suspendedCount: suspensions.length,
    totalSalary,
    posCount,
  }
}

/* ═══ Component ═══ */
const AICoachNFL = () => {
  const [data, setData] = useState(null)
  const [squad, setSquad] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Chat state
  const [messages, setMessages] = useState(() => ([
    { from: 'coach', text: "Hi! I'm your AI Coach. Ask me anything about your roster, players, strategy or upcoming fixtures.", time: nowTime() },
  ]))
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)

  const attachToken = () => {
    const token = localStorage.getItem('token')
    if (token) {
      privateAPI.defaults.headers.common.Authorization = `Bearer ${token}`
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      attachToken()
      const { data: res } = await privateAPI.get('/nfl-rivals/profile')
      const sq = res.data?.entry?.squad || []
      setSquad(sq)
      setData(computeHealth(sq))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch squad data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, typing])

  /* ─── Local coach brain (fallback when AI is unavailable) ─── */
  const coachReply = (qRaw) => {
    const q = (qRaw || '').toLowerCase()
    const players = (squad || []).map(s => s.player).filter(Boolean)

    const answerFlex = () => {
      if (!players.length) return 'Add some players to your roster first, then I can suggest your best play.'
      const best = players.reduce((a, b) => (getPoints(b) > getPoints(a) ? b : a))
      return `Start ${best.Name || 'your top player'} — leading your roster at ${getPoints(best).toFixed(1)} pts/game.`
    }

    const answerTrades = () => {
      const injured = players.filter(p => p.isPlayerInjured || p.injured)
      const seen = new Set(injured.map(p => p._id))
      const weak = players
        .filter(p => !seen.has(p._id))
        .sort((a, b) => getPoints(a) - getPoints(b))
      const picks = []
      injured.forEach(p => { if (picks.length < 3) picks.push({ p, reason: 'injured' }) })
      weak.forEach(p => { if (picks.length < 3) picks.push({ p, reason: `low output ${getPoints(p).toFixed(1)} pts` }) })
      if (!picks.length) return 'Your roster looks solid — no urgent trades.'
      return 'Players to consider moving on:\n' + picks
        .map(({ p, reason }) => `• ${p.Name || 'Player'} (${(p.Position || '—').toUpperCase()}) — ${reason}`)
        .join('\n')
    }

    const answerCoverage = () => {
      const uh = (data && data.unitHealth) || {}
      const parts = Object.entries(uh).map(([u, i]) => `${UNIT_LABEL[u] || u.toUpperCase()} ${i.healthy}/${i.total}`)
      if (!parts.length) return 'No roster data yet — add players to see your unit coverage.'
      const lows = Object.entries(uh).filter(([, i]) => i.total > 0 && i.healthy / i.total < 0.6).map(([u]) => UNIT_LABEL[u] || u.toUpperCase())
      let msg = parts.join(', ') + '.'
      msg += lows.length ? ` Needs more healthy depth at ${lows.join(', ')}.` : ' Coverage looks balanced across all units.'
      return msg
    }

    const answerFixtures = () => 'Head to the Matchday tab to see your upcoming fixtures and set your lineup.'

    if (/flex|start|captain|best play|lineup|who.*play/.test(q)) return answerFlex()
    if (/trade|sign|sell|buy|move|drop|cut/.test(q)) return answerTrades()
    if (/coverage|unit|depth|offen|defen|special/.test(q)) return answerCoverage()
    if (/fixture|match|opponent|schedule|upcoming/.test(q)) return answerFixtures()
    return 'I can help with your best flex play, trade targets, roster coverage and upcoming fixtures — try one of the quick suggestions above.'
  }

  const sendMessage = async (raw) => {
    const text = (raw || '').trim()
    if (!text) return
    const userMsg = { from: 'user', text, time: nowTime() }
    const history = [...messages, userMsg]
    setMessages(m => [...m, userMsg])
    setChatInput('')
    setTyping(true)
    try {
      attachToken()
      // Anthropic requires the conversation to start with a user turn.
      const convo = history.map(mm => ({ role: mm.from === 'user' ? 'user' : 'assistant', content: mm.text }))
      while (convo.length && convo[0].role === 'assistant') convo.shift()
      const { data: res } = await privateAPI.post('/nfl-rivals/coach-chat', { messages: convo })
      const reply = (res && res.data && res.data.reply) || coachReply(text)
      setMessages(m => [...m, { from: 'coach', text: reply, time: nowTime() }])
    } catch (err) {
      // Fall back to the local roster-analysis answer if the AI is unavailable.
      setMessages(m => [...m, { from: 'coach', text: coachReply(text), time: nowTime() }])
    } finally {
      setTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="aic2-loading">
        <Spin size="large" />
        <p>AI Coach is scanning your roster...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="aic2-error">
        <WarningOutlined style={{ fontSize: 40, color: '#F97316' }} />
        <p>{error || 'Something went wrong.'}</p>
        <button className="aic2-retry" onClick={refresh}>
          <ReloadOutlined /> Try Again
        </button>
      </div>
    )
  }

  const R = 85
  const C = 2 * Math.PI * R
  const dashOffset = C - (data.score / 100) * C

  const sortedTips = [...(data.tips || [])].sort(
    (a, b) => (PRIO_ORDER[a.priority] ?? 9) - (PRIO_ORDER[b.priority] ?? 9)
  )
  const topTip = sortedTips[0]
  const restTips = sortedTips.slice(1, 3)

  const quickChips = ['Best flex play?', 'Trade suggestions', 'Upcoming fixtures', 'Roster coverage']

  return (
    <div className="aic2-page">
      {/* ── Header ── */}
      <div className="aic2-header">
        <div className="aic2-header-left">
          <div className="aic2-hexbadge">
            <RobotOutlined />
          </div>
          <div>
            <h1 className="aic2-title">AI COACH</h1>
            <p className="aic2-subtitle">NFL RIVALS · ROSTER ANALYSIS</p>
          </div>
        </div>
        <button className="aic2-refresh" onClick={refresh}>
          <ReloadOutlined /> REFRESH
        </button>
      </div>

      {/* ── Body ── */}
      <div className="aic2-body">
        {/* MAIN column */}
        <div className="aic2-main">
          <div className="aic2-top-row">
            {/* Roster Health Score */}
            <section className="aic2-panel aic2-score-panel">
              <h2 className="aic2-panel-title">ROSTER HEALTH SCORE</h2>
              <div className="aic2-gauge-wrap">
                <svg className="aic2-gauge" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="aic2GaugeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <filter id="aic2GaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <circle
                    className="aic2-gauge-track"
                    cx="100" cy="100" r={R}
                  />
                  <circle
                    className="aic2-gauge-arc"
                    cx="100" cy="100" r={R}
                    transform="rotate(-90 100 100)"
                    style={{ strokeDasharray: C, strokeDashoffset: dashOffset }}
                  />
                </svg>
                <div className="aic2-gauge-center">
                  <span className="aic2-gauge-score">{data.score}</span>
                  <span className="aic2-gauge-grade">{data.grade}</span>
                </div>
              </div>

              <div className="aic2-score-divider" />

              <div className="aic2-stats">
                <div className="aic2-stat">
                  <span className="aic2-stat-icon">👥</span>
                  <span className="aic2-stat-num">{data.squadSize}</span>
                  <span className="aic2-stat-label">PLAYERS</span>
                </div>
                <div className="aic2-stat">
                  <span className="aic2-stat-icon">🔒</span>
                  <span className="aic2-stat-num aic2-red">{data.injuredCount}</span>
                  <span className="aic2-stat-label">INJURED</span>
                </div>
                <div className="aic2-stat">
                  <span className="aic2-stat-icon">⚠</span>
                  <span className="aic2-stat-num aic2-amber">{data.suspendedCount}</span>
                  <span className="aic2-stat-label">SUSPENDED</span>
                </div>
              </div>
            </section>

            {/* Actionable Tips */}
            <section className="aic2-panel aic2-tips-panel">
              <h2 className="aic2-panel-title">ACTIONABLE TIPS</h2>
              {topTip ? (
                <>
                  <div className="aic2-tip-head">
                    <div className="aic2-tip-hex">
                      <CheckCircleOutlined />
                    </div>
                    <span className="aic2-tip-title">{topTip.title}</span>
                    <span
                      className="aic2-info-pill"
                      style={{ color: PRIO_COLOR[topTip.priority] || '#4ADE80' }}
                    >
                      INFO
                    </span>
                  </div>
                  <p className="aic2-tip-text">{topTip.text}</p>
                  {restTips.length > 0 && (
                    <div className="aic2-tip-more">
                      {restTips.map((t, i) => (
                        <div
                          key={i}
                          className="aic2-tip-mini"
                          style={{ borderLeftColor: PRIO_COLOR[t.priority] || '#4ADE80' }}
                        >
                          <span className="aic2-tip-mini-icon">{t.icon}</span>
                          <span className="aic2-tip-mini-title">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="aic2-tip-text">No issues detected — your roster is in great shape.</p>
              )}
            </section>
          </div>

          {/* Unit Coverage */}
          <section className="aic2-panel aic2-coverage-panel">
            <h2 className="aic2-panel-title">UNIT COVERAGE</h2>
            <div className="aic2-coverage-grid aic2-coverage-grid--nfl">
              {Object.entries(data.unitHealth || {}).map(([unit, info]) => {
                const ratio = info.total > 0 ? info.healthy / info.total : 0
                return (
                  <div key={unit} className="aic2-cov-card">
                    <div className="aic2-cov-icon">{UNIT_ICON[unit] || '🏈'}</div>
                    <div className="aic2-cov-label">{UNIT_LABEL[unit] || unit.toUpperCase()}</div>
                    <div className="aic2-cov-bar">
                      <div className="aic2-cov-bar-fill" style={{ width: `${ratio * 100}%` }} />
                    </div>
                    <div className="aic2-cov-num">{info.healthy}/{info.total} FIT</div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* CHAT RAIL */}
        <section className="aic2-panel aic2-chat-panel">
          <div className="aic2-chat-head">
            <div className="aic2-chat-head-left">
              <div className="aic2-chat-hex"><RobotOutlined /></div>
              <span className="aic2-chat-title">AI COACH CHAT</span>
            </div>
            <MinusOutlined className="aic2-chat-min" />
          </div>

          <div className="aic2-chat-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`aic2-msg-row ${m.from === 'user' ? 'aic2-msg-user' : 'aic2-msg-coach'}`}>
                {m.from === 'coach' && (
                  <div className="aic2-msg-avatar"><RobotOutlined /></div>
                )}
                <div className="aic2-msg-block">
                  <div className="aic2-msg-bubble">{m.text}</div>
                  <div className="aic2-msg-time">{m.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="aic2-msg-row aic2-msg-coach">
                <div className="aic2-msg-avatar"><RobotOutlined /></div>
                <div className="aic2-msg-block">
                  <div className="aic2-msg-bubble aic2-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="aic2-chips">
            {quickChips.map((c) => (
              <button key={c} className="aic2-chip" onClick={() => sendMessage(c)}>
                {c}
              </button>
            ))}
          </div>

          <div className="aic2-chat-input">
            <input
              type="text"
              placeholder="Ask your AI Coach…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(chatInput) }}
            />
            <button className="aic2-send" onClick={() => sendMessage(chatInput)} aria-label="Send">
              <SendOutlined />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AICoachNFL
