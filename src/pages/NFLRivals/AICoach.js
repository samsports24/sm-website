import React, { useState, useEffect, useCallback } from 'react'
import { privateAPI } from '../../config/constants'
import { Spin } from 'antd'
import { SALARY_CAP, SALARY_FLOOR, SQUAD_SIZE, SPECIAL_TEAMS_SIZE } from './rivalsConfig'

/* ═══════════════════════════════════════════════════════════════
   AI COACH — NFL Rivals Edition
   Purple-themed (#A78BFA) Roster Health Analysis.
   Fetches GET /nfl-rivals/profile → analyses squad locally.
   ═══════════════════════════════════════════════════════════════ */

const GRADE_COLOR = { 'A+': '#22C55E', A: '#22C55E', B: '#84CC16', C: '#EAB308', D: '#F97316', F: '#EF4444' }
const PRIO_COLOR  = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', info: '#818CF8' }
const SEV_COLOR   = { minor: '#EAB308', moderate: '#F97316', severe: '#EF4444' }

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
    score, grade, injuries, tips,
    unitHealth,
    roleCounts,
    squadSize: total,
    injuredCount: injuries.length,
    totalSalary,
    posCount,
  }
}

/* ═══ Component ═══ */
const AICoachNFL = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        privateAPI.defaults.headers.common.Authorization = `Bearer ${token}`
      }
      const { data: res } = await privateAPI.get('/nfl-rivals/profile')
      const squad = res.data?.entry?.squad || []
      const analysis = computeHealth(squad)
      setData(analysis)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch squad data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  if (loading) {
    return (
      <div style={S.loading}>
        <Spin size="large" />
        <p style={{ color: '#94A3B8', marginTop: 12 }}>AI Coach is scanning your roster...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={S.loading}>
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: '#F97316', marginTop: 12 }}>{error || 'Something went wrong.'}</p>
        <button style={S.refreshBtn} onClick={refresh}>↻ Try Again</button>
      </div>
    )
  }

  const circ = 2 * Math.PI * 54
  const off = circ - (data.score / 100) * circ
  const gc = GRADE_COLOR[data.grade] || '#A78BFA'

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <span style={{ fontSize: 28 }}>🧠</span>
          <div>
            <h1 style={S.title}>AI Coach</h1>
            <p style={S.subtitle}>NFL RIVALS &bull; Roster Health Analysis</p>
          </div>
        </div>
        <button style={S.refreshBtn} onClick={refresh}>↻ Refresh</button>
      </div>

      {/* Score + Tips */}
      <div style={S.topRow}>
        <div style={S.scoreCard}>
          <h2 style={S.cardTitle}>Roster Health Score</h2>
          <div style={S.gaugeWrap}>
            <svg viewBox="0 0 120 120" style={{ width: 140, height: 140, transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={gc} strokeWidth="8" strokeLinecap="round"
                style={{ strokeDasharray: circ, strokeDashoffset: off, transition: 'stroke-dashoffset 1.2s ease-out' }} />
            </svg>
            <div style={S.gaugeCenter}>
              <span style={{ ...S.gaugeNum, color: gc }}>{data.score}</span>
              <span style={{ ...S.gaugeGrade, color: gc }}>{data.grade}</span>
            </div>
          </div>
          <div style={S.meta}>
            <span style={S.metaItem}>🏈 {data.squadSize}/53</span>
            <span style={S.metaItem}>🏥 {data.injuredCount} hurt</span>
            <span style={S.metaItem}>💰 ${(data.totalSalary / 1e6).toFixed(0)}M</span>
          </div>
        </div>

        <div style={S.tipsCard}>
          <h2 style={S.cardTitle}>Actionable Tips</h2>
          {data.tips.slice(0, 4).map((tip, i) => (
            <div key={i} style={{ ...S.tip, borderLeftColor: PRIO_COLOR[tip.priority] || '#A78BFA' }}>
              <div style={S.tipHeader}>
                <span style={{ fontSize: 18 }}>{tip.icon}</span>
                <span style={S.tipTitle}>{tip.title}</span>
                <span style={{ ...S.tipBadge, background: `${PRIO_COLOR[tip.priority]}22`, color: PRIO_COLOR[tip.priority] }}>{tip.priority}</span>
              </div>
              <p style={S.tipText}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Coverage */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Unit Coverage</h2>
        <div style={S.coverageGrid}>
          {Object.entries(data.unitHealth).map(([unit, info]) => {
            const ratio = info.total > 0 ? info.healthy / info.total : 0
            const clr = ratio >= 0.8 ? '#22C55E' : ratio >= 0.5 ? '#EAB308' : '#EF4444'
            return (
              <div key={unit} style={{ textAlign: 'center' }}>
                <div style={S.coverageLabel}>{unit}</div>
                <div style={S.barBg}><div style={{ ...S.barFill, width: `${ratio * 100}%`, background: clr }} /></div>
                <div style={{ ...S.coverageNum, color: clr }}>{info.healthy}/{info.total} fit</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role Assignment Summary */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Zone Assignment</h2>
        <div style={S.zoneGrid}>
          {[
            { key: 'offense_starter', label: 'Offense', target: 11, color: '#22c55e' },
            { key: 'defense_starter', label: 'Defense', target: 11, color: '#3b82f6' },
            { key: 'special_teams', label: 'K / P', target: 2, color: '#f59e0b' },
            { key: 'bench', label: 'Bench', target: 29, color: '#64748b' },
          ].map(z => {
            const count = data.roleCounts[z.key] || 0
            const full = count >= z.target
            return (
              <div key={z.key} style={S.zoneItem}>
                <div style={{ ...S.zoneDot, background: z.color }} />
                <span style={S.zoneLabel}>{z.label}</span>
                <span style={{ ...S.zoneCount, color: full ? '#22C55E' : '#F97316' }}>
                  {count}/{z.target}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Injury Table */}
      {data.injuries.length > 0 && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>🏥 Injured Players</h2>
          <div style={S.tableHeader}>
            <span>Player</span><span>Pos</span><span>Injury</span><span>Severity</span>
          </div>
          {data.injuries.map((inj, i) => (
            <div key={inj._id || i} style={S.tableRow}>
              <span style={{ fontWeight: 600 }}>{inj.name}</span>
              <span style={{ color: '#94A3B8' }}>{inj.position}</span>
              <span>{inj.injuryType}</span>
              <span style={{ fontWeight: 700, color: SEV_COLOR[inj.severity] || '#94A3B8', textTransform: 'capitalize' }}>{inj.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Inline styles (purple theme) ── */
const S = {
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  page: { padding: '24px 28px 40px', maxWidth: 1000, margin: '0 auto', color: '#F1F5F9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  title: { fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 13, color: '#94A3B8', margin: '2px 0 0' },
  refreshBtn: { background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  topRow: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 20 },
  scoreCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, textAlign: 'center' },
  tipsCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 18px', color: '#CBD5E1', letterSpacing: '0.2px' },
  gaugeWrap: { position: 'relative', width: 140, height: 140, margin: '0 auto 16px' },
  gaugeCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  gaugeNum: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  gaugeGrade: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  meta: { display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: '#94A3B8', marginTop: 8 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6 },
  tip: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #A78BFA', borderRadius: 10, padding: '16px 18px', marginBottom: 14 },
  tipHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  tipTitle: { fontSize: 14, fontWeight: 700, flex: 1 },
  tipBadge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  tipText: { fontSize: 13, color: '#94A3B8', lineHeight: 1.55, margin: 0 },
  coverageGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  coverageLabel: { fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  barBg: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.8s ease-out' },
  coverageNum: { fontSize: 13, fontWeight: 700 },
  zoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  zoneItem: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '12px 14px' },
  zoneDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  zoneLabel: { fontSize: 13, fontWeight: 600, flex: 1 },
  zoneCount: { fontSize: 15, fontWeight: 800 },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1fr', gap: 12, padding: '10px 14px', color: '#64748B', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.5fr 1fr', gap: 12, padding: '10px 14px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.03)' },
}

export default AICoachNFL
