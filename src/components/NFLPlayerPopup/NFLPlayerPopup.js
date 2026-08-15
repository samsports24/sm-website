import React, { useState, useEffect } from 'react'
import { Modal, Spin } from 'antd'
import {
  CloseOutlined, AlertOutlined, DollarOutlined,
  TrophyOutlined, BarChartOutlined, FileTextOutlined,
  ThunderboltOutlined, HeartOutlined, StarFilled,
  CheckCircleFilled, LineChartOutlined, HistoryOutlined,
  PlusOutlined, StopOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import PlayerAvatar from '../PlayerAvatar'
import './nfl-player-popup.css'

const POS_COLOR = {
  QB: '#ef4444', RB: '#3b82f6', WR: '#22c55e', TE: '#f59e0b',
  OT: '#64748b', OG: '#64748b', C: '#64748b', OL: '#64748b',
  DE: '#a855f7', DT: '#a855f7', DL: '#a855f7', NT: '#a855f7',
  LB: '#ec4899', ILB: '#ec4899', OLB: '#ec4899', MLB: '#ec4899',
  CB: '#06b6d4', S: '#06b6d4', FS: '#06b6d4', SS: '#06b6d4', DB: '#06b6d4',
  K: '#78716c', P: '#78716c', LS: '#78716c', EDGE: '#a855f7',
}

const fmt = (v) => {
  if (v == null || v === 0) return '—'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K'
  return '$' + v
}

const fmtFull = (v) => {
  if (v == null || v === 0) return '—'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K'
  return '$' + v.toLocaleString()
}

/* Compute points per game from available data, with fallback chain */
const calcPpg = (p) => {
  if (p.pointsPerGame > 0) return p.pointsPerGame
  if (p.avgPf > 0) return p.avgPf
  if (p.AvgFantasyPoints24 > 0) return p.AvgFantasyPoints24
  const ws = p.weeklyScoring || []
  const scored = ws.filter(w => w.score > 0)
  if (scored.length > 0) {
    const total = scored.reduce((sum, w) => sum + (w.score || 0), 0)
    return Math.round((total / scored.length) * 100) / 100
  }
  return p.playerScore || 0
}

/* Projected season total points */
const calcProjected = (p) => {
  return p.projectedFantasyPoints || p.FantasyPoints24 || p.pf || 0
}

/* Best salary value from available fields */
const calcSalary = (p) => {
  return p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0
}

/* Latest weekly positional rank (real, from most recent non-bye week) */
const latestPosRank = (p) => {
  const ws = (p.weeklyScoring || []).filter(w => !w.isBye && w.playerPositionRank > 0)
  if (!ws.length) return 0
  return ws[ws.length - 1].playerPositionRank
}

/* Derive a star tier from real ADP (fallback to ppg) — a computed grade, not fabricated stats */
const ratingTier = (p) => {
  const adp = p.samAdp24
  let stars, label
  if (adp > 0) {
    if (adp <= 24) { stars = 5; label = 'Elite' }
    else if (adp <= 48) { stars = 4; label = 'High' }
    else if (adp <= 84) { stars = 3; label = 'Solid' }
    else if (adp <= 120) { stars = 2; label = 'Depth' }
    else { stars = 1; label = 'Flier' }
  } else {
    const ppg = calcPpg(p)
    if (ppg >= 15) { stars = 5; label = 'Elite' }
    else if (ppg >= 11) { stars = 4; label = 'High' }
    else if (ppg >= 7) { stars = 3; label = 'Solid' }
    else if (ppg >= 3) { stars = 2; label = 'Depth' }
    else { stars = 1; label = 'Flier' }
  }
  return { stars, label }
}

const NFLPlayerPopup = ({
  playerId, player: passedPlayer, isOpen, onClose,
  // Optional draft-mode footer actions — footer renders only when provided
  onDraft, onQueue, onBlacklist, currentPick, isQueued, isBlacklisted,
  // When true, render embedded in the page (no Modal wrapper, no close button)
  inline = false,
}) => {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!isOpen || !playerId) return
    setTab('overview')
    const fetchPlayer = async () => {
      setLoading(true)
      try {
        attachToken()
        const { data } = await privateAPI.get(`/nfl-rivals/players/${playerId}`)
        setPlayer(data.data?.player || null)
      } catch (err) {
        console.warn('Failed to load player detail:', err)
        setPlayer(passedPlayer || null)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayer()
  }, [isOpen, playerId]) // eslint-disable-line

  if (!isOpen && !inline) return null

  const p = player || passedPlayer || {}
  const name = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
  const pos = p.Position || p.otcPosition || ''
  const posColor = POS_COLOR[pos] || '#94a3b8'
  const headshot = p.HostedHeadshotNoBackgroundUrl
  const jersey = p.Number || p.JersyNo
  const injured = p.isPlayerInjured
  const ppg = calcPpg(p)
  const projected = calcProjected(p)
  const capHit = calcSalary(p)
  const totalVal = p.otcTotalValue || 0
  const contractYears = p.otcContractYears || 0
  const adp = p.samAdp24
  const posRank = latestPosRank(p)
  const { stars, label: tierLabel } = ratingTier(p)

  // Real depth-chart status (from the data feed, not derived)
  const depthPos = p.DepthPosition || ''
  const roleTag = p.inPracticeSquad
    ? { label: 'PRACTICE SQUAD', cls: 'ps' }
    : p.isStarter
      ? { label: 'STARTER', cls: 'starter' }
      : p.scoutTier
        ? { label: String(p.scoutTier).toUpperCase(), cls: 'role' }
        : { label: 'BACKUP', cls: 'role' }

  const hasOtcContract = totalVal > 0 || p.otcContractYears > 0
  const hasAnySalary = capHit > 0 || p.currentYearSalaryCap > 0 || p.PlayerCap > 0 || p.contractInfo
  const hasContract = hasOtcContract || hasAnySalary

  // Hero metric columns — only real values
  const metrics = []
  if (projected > 0) metrics.push({ label: 'Projected', value: projected.toFixed(1), sub: 'Total Pts', cls: 'green' })
  metrics.push({ label: 'Fantasy PPG', value: ppg.toFixed(1), sub: 'Per Game' })
  if (adp > 0) metrics.push({ label: 'ADP', value: adp, sub: 'Overall' })
  if (depthPos) metrics.push({ label: 'Depth', value: depthPos, sub: 'Chart', cls: 'gold' })
  else if (totalVal > 0 && contractYears > 0) metrics.push({ label: 'Contract', value: fmt(totalVal), sub: `${contractYears} yr`, cls: 'gold' })
  if (capHit > 0) metrics.push({ label: 'Cap Hit', value: fmt(capHit), sub: 'This Yr', cls: 'purple' })

  // Bio strip
  const bio = [
    p.Height && { label: 'Height', value: p.Height },
    p.Weight && { label: 'Weight', value: `${p.Weight} lbs` },
    p.Experience != null && { label: 'Exp', value: p.Experience === 0 ? 'Rookie' : `${p.Experience} yr${p.Experience > 1 ? 's' : ''}` },
    p.ByeWeek && { label: 'Bye Week', value: p.ByeWeek },
    p.UpcomingGameOpponent && { label: 'Opp', value: p.UpcomingGameOpponent },
    p.College && { label: 'College', value: p.College },
  ].filter(Boolean)

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChartOutlined /> },
    { key: 'stats', label: 'Stats', icon: <LineChartOutlined /> },
    { key: 'history', label: 'History', icon: <HistoryOutlined /> },
    { key: 'contract', label: 'Contract', icon: <DollarOutlined /> },
    { key: 'scouting', label: 'Scouting', icon: <FileTextOutlined /> },
  ]

  const showFooter = !!(onDraft || onQueue || onBlacklist)

  const body = loading ? (
        <div className="nflp-loading"><Spin size="large" /><p>Loading player data...</p></div>
      ) : (
        <div className="nflp-container">
          {!inline && <button className="nflp-close" onClick={onClose}><CloseOutlined /></button>}

          {/* ═══ HERO ═══ */}
          <div className="nflp-hero">
            <div className="nflp-avatar">
              <PlayerAvatar name={name} src={headshot} size={84} />
            </div>
            <div className="nflp-hero-info">
              <h2 className="nflp-name">{name}</h2>
              <div className="nflp-hero-meta">
                <span className="nflp-pos-pill" style={{ background: `${posColor}22`, color: posColor, border: `1px solid ${posColor}44` }}>{pos}</span>
                <span className="nflp-team">{p.Team || '-'}</span>
                {jersey && <span className="nflp-jersey">#{jersey}</span>}
                {p.Age && <span className="nflp-age">Age {p.Age}</span>}
                {depthPos && <span className="nflp-depth" title="Depth chart">{depthPos}</span>}
              </div>
              <div className="nflp-stars-row">
                {[1, 2, 3, 4, 5].map(i => (
                  <StarFilled key={i} className={`nflp-star${i <= stars ? ' on' : ''}`} />
                ))}
                <span className="nflp-tier">{tierLabel}</span>
                {roleTag && <span className={`nflp-tag ${roleTag.cls}`}>{roleTag.label}</span>}
                {injured && <span className="nflp-tag injury"><AlertOutlined /> {p.InjuryStatus || 'Injured'}</span>}
              </div>
            </div>

            {/* Metric columns */}
            <div className="nflp-metrics">
              {metrics.map((m, i) => (
                <div key={i} className="nflp-metric">
                  <span className="nflp-metric-label">{m.label}</span>
                  <span className={`nflp-metric-value${m.cls ? ' ' + m.cls : ''}`}>{m.value}</span>
                  <span className="nflp-metric-sub">{m.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ BIO STRIP ═══ */}
          {bio.length > 0 && (
            <div className="nflp-bio-strip">
              {bio.map((b, i) => (
                <div key={i} className="nflp-bio-cell">
                  <span className="nflp-bio-label">{b.label}</span>
                  <span className="nflp-bio-value">{b.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TABS ═══ */}
          <div className="nflp-tabs">
            {tabs.map(t => (
              <button key={t.key} className={`nflp-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB CONTENT ═══ */}
          <div className="nflp-body">
            {tab === 'overview' && <OverviewTab p={p} projected={projected} ppg={ppg} adp={adp} posRank={posRank} pos={pos} />}
            {tab === 'stats' && <StatsTab p={p} ppg={ppg} />}
            {tab === 'history' && <HistoryTab p={p} />}
            {tab === 'contract' && <ContractTab p={p} hasContract={hasContract} hasOtcContract={hasOtcContract} />}
            {tab === 'scouting' && <ScoutingTab p={p} />}
          </div>

          {/* ═══ DRAFT FOOTER (conditional) ═══ */}
          {showFooter && (
            <div className="nflp-footer">
              <div className="nflp-footer-pick">
                <span className="nflp-footer-pick-label">Current Pick</span>
                <span className="nflp-footer-pick-num">#{currentPick || '—'}</span>
              </div>
              {onDraft && (
                <button className="nflp-btn draft" onClick={() => onDraft(p)}>
                  <TrophyOutlined /> <div><b>DRAFT PLAYER</b><small>Draft {name.split(' ').slice(-1)[0]}</small></div>
                </button>
              )}
              {onQueue && (
                <button className={`nflp-btn queue${isQueued ? ' active' : ''}`} onClick={() => onQueue(p)}>
                  <PlusOutlined /> <div><b>{isQueued ? 'IN QUEUE' : 'ADD TO QUEUE'}</b></div>
                </button>
              )}
              {onBlacklist && (
                <button className={`nflp-btn block${isBlacklisted ? ' active' : ''}`} onClick={() => onBlacklist(p)}>
                  <StopOutlined /> <div><b>BLACKLIST</b><small>Do not draft</small></div>
                </button>
              )}
              <div className="nflp-footer-stat">
                <span className="nflp-footer-stat-label">Player ADP</span>
                <span className="nflp-footer-stat-val">{adp > 0 ? adp : '—'}</span>
              </div>
              {posRank > 0 && (
                <div className="nflp-footer-stat">
                  <span className="nflp-footer-stat-label">{pos} Rank</span>
                  <span className="nflp-footer-stat-val">{posRank}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )

  if (inline) return <div className="nflp-inline">{body}</div>

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={720}
      centered
      className="nfl-popup-modal"
      destroyOnClose
    >
      {body}
    </Modal>
  )
}

/* ═══ OVERVIEW TAB ═══ */
const OverviewTab = ({ p, projected, ppg, adp, posRank, pos }) => {
  const cards = [
    projected > 0 && { label: 'Projected Pts', value: projected.toFixed(1), color: '#22c55e' },
    { label: 'Fantasy PPG', value: ppg.toFixed(1) },
    { label: 'Games', value: p.nflGamesPlayed || (p.weeklyScoring || []).filter(w => w.score > 0).length || '—' },
    adp > 0 && { label: 'ADP', value: adp },
    posRank > 0 && { label: `${pos} Rank`, value: posRank, color: '#f59e0b' },
    p.otcValuation > 0 && { label: 'Market Value', value: fmt(p.otcValuation), color: '#A78BFA' },
  ].filter(Boolean)

  const strengths = p.scoutStrengths || []
  const comps = [
    p.compLowName && { tier: 'Floor', name: p.compLowName, ppg: p.compLowPpg },
    p.compMedName && { tier: 'Median', name: p.compMedName, ppg: p.compMedPpg },
    p.compHighName && { tier: 'Ceiling', name: p.compHighName, ppg: p.compHighPpg },
  ].filter(Boolean)

  return (
    <>
      {cards.length > 0 && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><BarChartOutlined /> Projection &amp; Production</h3>
          <div className="nflp-stats-grid">
            {cards.map((c, i) => <StatBox key={i} label={c.label} value={c.value} color={c.color} />)}
          </div>
        </div>
      )}

      <div className="nflp-two-col">
        {strengths.length > 0 && (
          <div className="nflp-section">
            <h3 className="nflp-section-title"><CheckCircleFilled /> Season Outlook</h3>
            <div className="nflp-outlook">
              {strengths.map((s, i) => (
                <div key={i} className="nflp-outlook-item"><CheckCircleFilled /> {s}</div>
              ))}
            </div>
          </div>
        )}

        {p.isPlayerInjured && (
          <div className="nflp-section">
            <h3 className="nflp-section-title"><HeartOutlined /> Injury Report</h3>
            <div className="nflp-injury-card">
              <div className="nflp-injury-row"><span className="nflp-injury-label">Status</span><span className="nflp-injury-val red">{p.InjuryStatus || 'Unknown'}</span></div>
              {p.InjuryBodyPart && <div className="nflp-injury-row"><span className="nflp-injury-label">Body Part</span><span className="nflp-injury-val">{p.InjuryBodyPart}</span></div>}
              {p.InjuryNotes && <div className="nflp-injury-row"><span className="nflp-injury-label">Notes</span><span className="nflp-injury-val">{p.InjuryNotes}</span></div>}
              {p.InjReturnDate && <div className="nflp-injury-row"><span className="nflp-injury-label">Est. Return</span><span className="nflp-injury-val">{p.InjReturnDate}</span></div>}
            </div>
          </div>
        )}
      </div>

      {comps.length > 0 && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><FileTextOutlined /> Compare Players</h3>
          <div className="nflp-comps">
            {comps.map((c, i) => (
              <div key={i} className={`nflp-comp ${c.tier.toLowerCase()}`}>
                <PlayerAvatar name={c.name} size={34} />
                <div className="nflp-comp-info">
                  <span className="nflp-comp-name">{c.name}</span>
                  <span className="nflp-comp-tier">{c.tier}</span>
                </div>
                {c.ppg > 0 && <span className="nflp-comp-ppg">{c.ppg} <small>ppg</small></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && strengths.length === 0 && comps.length === 0 && !p.isPlayerInjured && (
        <div className="nflp-empty">No overview data available for this player.</div>
      )}
    </>
  )
}

const StatBox = ({ label, value, color }) => (
  <div className="nflp-stat-box">
    <span className="nflp-stat-box-val" style={color ? { color } : {}}>{value}</span>
    <span className="nflp-stat-box-lbl">{label}</span>
  </div>
)

/* ═══ STATS TAB — Fantasy Points Trend (real weekly scores) ═══ */
const StatsTab = ({ p, ppg }) => {
  const weekly = (p.weeklyScoring || []).filter(w => !w.isBye)
  if (!weekly.length) {
    return <div className="nflp-empty">No weekly scoring data available yet.</div>
  }
  const scores = weekly.map(w => w.score || 0)
  const max = Math.max(...scores, 1)
  const total = scores.reduce((a, b) => a + b, 0)
  const best = Math.max(...scores)
  const gamesPlayed = weekly.filter(w => w.score > 0).length
  const avg = gamesPlayed > 0 ? total / gamesPlayed : ppg

  const barColor = (v) => v >= 15 ? '#22c55e' : v >= 8 ? '#4ade80' : v > 0 ? '#f59e0b' : 'rgba(255,255,255,0.12)'

  return (
    <>
      <div className="nflp-section">
        <div className="nflp-stats-grid">
          <StatBox label="Season Pts" value={total.toFixed(1)} color="#22c55e" />
          <StatBox label="Avg / Game" value={avg.toFixed(1)} />
          <StatBox label="Best Week" value={best.toFixed(1)} color="#4ade80" />
          <StatBox label="Games" value={gamesPlayed} />
        </div>
      </div>

      <div className="nflp-section">
        <h3 className="nflp-section-title"><LineChartOutlined /> Fantasy Points Trend</h3>
        <div className="nflp-trend">
          <div className="nflp-trend-avg" style={{ bottom: `${(avg / max) * 100}%` }}>
            <span>Avg {avg.toFixed(1)}</span>
          </div>
          <div className="nflp-trend-bars">
            {weekly.map((w, i) => (
              <div key={i} className="nflp-trend-col" title={`Wk ${w.week}: ${(w.score || 0).toFixed(1)}`}>
                <div className="nflp-trend-bar" style={{ height: `${Math.max((w.score || 0) / max * 100, 2)}%`, background: barColor(w.score || 0) }} />
                <span className="nflp-trend-wk">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══ HISTORY TAB — weekly game log (real) ═══ */
const HistoryTab = ({ p }) => {
  const weekly = (p.weeklyScoring || []).filter(w => w.week != null)
  if (!weekly.length) {
    return <div className="nflp-empty">No game history available yet.</div>
  }
  const seasons = [...new Set(weekly.map(w => w.season).filter(Boolean))]
  return (
    <>
      {p.FantasyPoints24 > 0 && (
        <div className="nflp-section">
          <div className="nflp-contract-summary">
            <div className="nflp-contract-row"><span>2024 Total Points</span><span className="nflp-contract-val green">{p.FantasyPoints24.toFixed(1)}</span></div>
            {p.AvgFantasyPoints24 > 0 && <div className="nflp-contract-row"><span>2024 Avg / Game</span><span className="nflp-contract-val">{p.AvgFantasyPoints24.toFixed(1)}</span></div>}
          </div>
        </div>
      )}
      <div className="nflp-section">
        <h3 className="nflp-section-title"><HistoryOutlined /> Weekly Log{seasons.length === 1 ? ` · ${seasons[0]}` : ''}</h3>
        <div className="nflp-log-header"><span>Week</span><span>Pts</span><span>Pos Rk</span><span>Ovr Rk</span></div>
        <div className="nflp-log-body">
          {weekly.map((w, i) => (
            <div key={i} className={`nflp-log-row${w.isBye ? ' bye' : ''}`}>
              <span className="nflp-log-wk">Wk {w.week}</span>
              <span className={w.isBye ? '' : 'nflp-log-pts'}>{w.isBye ? 'BYE' : (w.score || 0).toFixed(1)}</span>
              <span>{w.playerPositionRank > 0 ? `#${w.playerPositionRank}` : '—'}</span>
              <span>{w.playerOverallRank > 0 ? `#${w.playerOverallRank}` : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ═══ CONTRACT TAB ═══ */
const ContractTab = ({ p, hasContract, hasOtcContract }) => {
  if (!hasContract) {
    return <div className="nflp-empty">No contract data available for this player.</div>
  }
  const breakdown = p.otcYearlyBreakdown || []
  const currentCap = p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0

  return (
    <>
      <div className="nflp-contract-summary">
        <div className="nflp-contract-row"><span>Cap Hit (Current)</span><span className="nflp-contract-val purple">{fmtFull(currentCap)}</span></div>
        {p.otcContractYears > 0 && <div className="nflp-contract-row"><span>Contract Length</span><span className="nflp-contract-val">{p.otcContractYears} years</span></div>}
        {p.otcTotalValue > 0 && <div className="nflp-contract-row"><span>Total Value</span><span className="nflp-contract-val green">{fmtFull(p.otcTotalValue)}</span></div>}
        {p.otcTotalGuaranteed > 0 && <div className="nflp-contract-row"><span>Total Guaranteed</span><span className="nflp-contract-val gold">{fmtFull(p.otcTotalGuaranteed)}</span></div>}
        {p.otcAvgAnnualValue > 0 && <div className="nflp-contract-row"><span>Avg Annual Value</span><span className="nflp-contract-val purple">{fmtFull(p.otcAvgAnnualValue)}</span></div>}
        {p.otcFreeAgentYear > 0 && <div className="nflp-contract-row"><span>Free Agent Year</span><span className="nflp-contract-val">{p.otcFreeAgentYear}</span></div>}
        {p.yearsLeftSalaryCap > 0 && <div className="nflp-contract-row"><span>Years Remaining</span><span className="nflp-contract-val">{p.yearsLeftSalaryCap}</span></div>}
      </div>

      {hasOtcContract && (p.otcBaseSalary > 0 || p.otcSigningBonus > 0 || p.otcCapHit > 0) && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><DollarOutlined /> Current Year Breakdown</h3>
          <div className="nflp-cap-grid">
            <CapRow label="Base Salary" value={p.otcBaseSalary} />
            <CapRow label="Signing Bonus" value={p.otcSigningBonus} color="#22c55e" />
            <CapRow label="Roster Bonus" value={p.otcRosterBonus} color="#3b82f6" />
            <CapRow label="Cap Hit" value={p.otcCapHit} color="#4ade80" highlight />
            <CapRow label="Dead Cap" value={p.otcDeadCap} color="#ef4444" />
          </div>
        </div>
      )}

      {breakdown.length > 0 && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><FileTextOutlined /> Year-by-Year</h3>
          <div className="nflp-breakdown-header"><span>Year</span><span>Base</span><span>Bonus</span><span>Cap Hit</span><span>Dead</span></div>
          {breakdown.map((yr, i) => (
            <div key={i} className="nflp-breakdown-row">
              <span className="nflp-breakdown-year">{yr.year}</span>
              <span>{fmt(yr.baseSalary)}</span>
              <span className="green">{fmt((yr.signingBonus || 0) + (yr.rosterBonus || 0) + (yr.workoutBonus || 0) + (yr.otherBonus || 0))}</span>
              <span className="green">{fmt(yr.capHit)}</span>
              <span className="red">{fmt(yr.deadCap)}</span>
            </div>
          ))}
        </div>
      )}

      {p.otcContractNotes && (
        <div className="nflp-section"><h3 className="nflp-section-title">Notes</h3><p className="nflp-contract-notes">{p.otcContractNotes}</p></div>
      )}
      {p.contractInfo && !p.otcContractNotes && (
        <div className="nflp-section"><h3 className="nflp-section-title">Contract</h3><p className="nflp-contract-notes">{p.contractInfo}</p></div>
      )}
    </>
  )
}

const CapRow = ({ label, value, color, highlight }) => {
  const display = fmtFull(value)
  return (
    <div className={`nflp-cap-row${highlight ? ' highlight' : ''}`}>
      <span>{label}</span>
      <span style={color && display !== '—' ? { color, fontWeight: 700 } : display === '—' ? { color: 'rgba(255,255,255,0.2)' } : {}}>{display}</span>
    </div>
  )
}

/* ═══ SCOUTING TAB ═══ */
const ScoutingTab = ({ p }) => {
  const hasScout = p.scoutGrade || p.scoutOverview || p.samTier
  const hasCombine = p.fortyYard || p.verticalJump || p.broadJump
  const hasSW = p.scoutStrengths?.length > 0 || p.scoutWeaknesses?.length > 0

  if (!hasScout && !hasCombine && !hasSW) {
    return <div className="nflp-empty">No scouting data available for this player.</div>
  }

  return (
    <>
      {(p.scoutGrade || p.samTier) && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><TrophyOutlined /> Scout Profile</h3>
          <div className="nflp-scout-header">
            {p.scoutGrade && <div className="nflp-scout-grade"><span className="nflp-scout-grade-val">{p.scoutGrade}</span><span>Grade</span></div>}
            {p.scoutTier && <div className="nflp-scout-grade"><span className="nflp-scout-grade-val">{p.scoutTier}</span><span>Tier</span></div>}
            {p.samTier && <div className="nflp-scout-grade"><span className="nflp-scout-grade-val">{p.samTier}</span><span>SAM Tier</span></div>}
          </div>
          {p.scoutOverview && <p className="nflp-scout-overview">{p.scoutOverview}</p>}
        </div>
      )}

      {hasSW && (
        <div className="nflp-section">
          <div className="nflp-sw-grid">
            {p.scoutStrengths?.length > 0 && (
              <div className="nflp-sw-col">
                <h4 className="nflp-sw-title green">Strengths</h4>
                {p.scoutStrengths.map((s, i) => <div key={i} className="nflp-sw-item green">{s}</div>)}
              </div>
            )}
            {p.scoutWeaknesses?.length > 0 && (
              <div className="nflp-sw-col">
                <h4 className="nflp-sw-title red">Weaknesses</h4>
                {p.scoutWeaknesses.map((w, i) => <div key={i} className="nflp-sw-item red">{w}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {hasCombine && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><ThunderboltOutlined /> Combine</h3>
          <div className="nflp-stats-grid">
            {p.fortyYard && <StatBox label="40-Yard" value={`${p.fortyYard}s`} color="#4ade80" />}
            {p.verticalJump && <StatBox label="Vertical" value={`${p.verticalJump}"`} />}
            {p.broadJump && <StatBox label="Broad Jump" value={`${p.broadJump}"`} />}
            {p.combineRank && <StatBox label="Rank" value={`#${p.combineRank}`} color="#f59e0b" />}
          </div>
        </div>
      )}
    </>
  )
}

export default NFLPlayerPopup
