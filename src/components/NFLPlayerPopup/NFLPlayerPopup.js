import React, { useState, useEffect } from 'react'
import { Modal, Spin } from 'antd'
import {
  CloseOutlined, AlertOutlined, DollarOutlined,
  TrophyOutlined, BarChartOutlined, FileTextOutlined,
  ThunderboltOutlined, HeartOutlined,
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
  // Compute from weeklyScoring if available
  const ws = p.weeklyScoring || []
  const scored = ws.filter(w => w.score > 0)
  if (scored.length > 0) {
    const total = scored.reduce((sum, w) => sum + (w.score || 0), 0)
    return Math.round((total / scored.length) * 100) / 100
  }
  return p.playerScore || 0
}

/* Get best salary value from available fields */
const calcSalary = (p) => {
  return p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0
}

const NFLPlayerPopup = ({ playerId, player: passedPlayer, isOpen, onClose }) => {
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

  if (!isOpen) return null

  const p = player || passedPlayer || {}
  const name = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
  const pos = p.Position || p.otcPosition || ''
  const posColor = POS_COLOR[pos] || '#94a3b8'
  const headshot = p.HostedHeadshotNoBackgroundUrl
  const jersey = p.Number || p.JersyNo
  const injured = p.isPlayerInjured
  const ppg = calcPpg(p)
  const capHit = calcSalary(p)
  const apy = p.otcAvgAnnualValue || 0
  const totalVal = p.otcTotalValue || 0
  const totalGuar = p.otcTotalGuaranteed || 0
  const hasOtcContract = totalVal > 0 || p.otcContractYears > 0
  const hasAnySalary = capHit > 0 || p.currentYearSalaryCap > 0 || p.PlayerCap > 0 || p.contractInfo
  const hasContract = hasOtcContract || hasAnySalary

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={560}
      centered
      className="nfl-popup-modal"
      destroyOnClose
    >
      {loading ? (
        <div className="nflp-loading"><Spin size="large" /><p>Loading player data...</p></div>
      ) : (
        <div className="nflp-container">
          {/* Close button */}
          <button className="nflp-close" onClick={onClose}><CloseOutlined /></button>

          {/* ═══ HERO ═══ */}
          <div className="nflp-hero">
            <div className="nflp-hero-left">
              <div className="nflp-avatar">
                <PlayerAvatar name={name} src={headshot} size={80} />
              </div>
              <div className="nflp-hero-info">
                <h2 className="nflp-name">{name}</h2>
                <div className="nflp-hero-meta">
                  <span className="nflp-pos-pill" style={{ background: `${posColor}20`, color: posColor, border: `1px solid ${posColor}40` }}>{pos}</span>
                  <span className="nflp-team">{p.Team || '-'}</span>
                  {jersey && <span className="nflp-jersey">#{jersey}</span>}
                </div>
                <div className="nflp-hero-tags">
                  {injured && <span className="nflp-tag injury"><AlertOutlined /> {p.InjuryStatus || 'Injured'}{p.InjuryBodyPart ? ` (${p.InjuryBodyPart})` : ''}</span>}
                  {p.isStarter && <span className="nflp-tag starter">STARTER</span>}
                  {p.isFreeAgent && <span className="nflp-tag fa">FREE AGENT</span>}
                </div>
              </div>
            </div>
            <div className="nflp-hero-right">
              <div className="nflp-score-ring">
                <span className="nflp-score-val">{ppg.toFixed(1)}</span>
                <span className="nflp-score-label">AVG/W</span>
              </div>
            </div>
          </div>

          {/* ═══ KEY METRICS BAR ═══ */}
          <div className="nflp-metrics">
            <div className="nflp-metric">
              <span className="nflp-metric-label">Cap Hit</span>
              <span className="nflp-metric-value purple">{fmt(capHit)}</span>
            </div>
            <div className="nflp-metric">
              <span className="nflp-metric-label">APY</span>
              <span className="nflp-metric-value">{fmt(apy)}</span>
            </div>
            <div className="nflp-metric">
              <span className="nflp-metric-label">Total Value</span>
              <span className="nflp-metric-value green">{fmt(totalVal)}</span>
            </div>
            <div className="nflp-metric">
              <span className="nflp-metric-label">Guaranteed</span>
              <span className="nflp-metric-value gold">{fmt(totalGuar)}</span>
            </div>
            <div className="nflp-metric">
              <span className="nflp-metric-label">ADP</span>
              <span className="nflp-metric-value">{p.samAdp24 || '—'}</span>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div className="nflp-tabs">
            {[
              { key: 'overview', label: 'Overview', icon: <BarChartOutlined /> },
              { key: 'contract', label: 'Contract', icon: <DollarOutlined /> },
              { key: 'scouting', label: 'Scouting', icon: <FileTextOutlined /> },
            ].map(t => (
              <button key={t.key} className={`nflp-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB CONTENT ═══ */}
          <div className="nflp-body">
            {tab === 'overview' && <OverviewTab p={p} />}
            {tab === 'contract' && <ContractTab p={p} hasContract={hasContract} hasOtcContract={hasOtcContract} capHit={capHit} />}
            {tab === 'scouting' && <ScoutingTab p={p} />}
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ═══ OVERVIEW TAB ═══ */
const OverviewTab = ({ p }) => {
  const bio = [
    p.Age && { label: 'Age', value: p.Age },
    p.Height && { label: 'Height', value: p.Height },
    p.Weight && { label: 'Weight', value: `${p.Weight} lbs` },
    p.Experience != null && { label: 'Experience', value: p.Experience === 0 ? 'Rookie' : `${p.Experience} yr${p.Experience > 1 ? 's' : ''}` },
    p.College && { label: 'College', value: p.College },
    p.BirthDateString && { label: 'Born', value: p.BirthDateString },
    p.ByeWeek && { label: 'Bye Week', value: `Week ${p.ByeWeek}` },
  ].filter(Boolean)

  const weekly = p.weeklyScoring || []
  const last5 = weekly.slice(-5).reverse()

  return (
    <>
      {/* Bio Grid */}
      <div className="nflp-bio-grid">
        {bio.map((b, i) => (
          <div key={i} className="nflp-bio-item">
            <span className="nflp-bio-label">{b.label}</span>
            <span className="nflp-bio-value">{b.value}</span>
          </div>
        ))}
      </div>

      {/* Upcoming Game */}
      {p.UpcomingGameOpponent && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><ThunderboltOutlined /> Next Game</h3>
          <div className="nflp-next-game">
            <span className="nflp-next-week">Week {p.UpcomingGameWeek || '?'}</span>
            <span className="nflp-next-vs">vs</span>
            <span className="nflp-next-opp">{p.UpcomingGameOpponent}</span>
          </div>
        </div>
      )}

      {/* Injury Details */}
      {p.isPlayerInjured && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><HeartOutlined /> Injury Report</h3>
          <div className="nflp-injury-card">
            <div className="nflp-injury-row">
              <span className="nflp-injury-label">Status</span>
              <span className="nflp-injury-val red">{p.InjuryStatus || 'Unknown'}</span>
            </div>
            {p.InjuryBodyPart && <div className="nflp-injury-row"><span className="nflp-injury-label">Body Part</span><span className="nflp-injury-val">{p.InjuryBodyPart}</span></div>}
            {p.InjuryNotes && <div className="nflp-injury-row"><span className="nflp-injury-label">Notes</span><span className="nflp-injury-val">{p.InjuryNotes}</span></div>}
            {p.InjReturnDate && <div className="nflp-injury-row"><span className="nflp-injury-label">Est. Return</span><span className="nflp-injury-val">{p.InjReturnDate}</span></div>}
          </div>
        </div>
      )}

      {/* Recent Scoring */}
      {last5.length > 0 && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><TrophyOutlined /> Recent Form</h3>
          <div className="nflp-form-row">
            {last5.map((w, i) => {
              const pts = w.score || 0
              const clr = pts >= 15 ? '#22c55e' : pts >= 8 ? '#f59e0b' : '#ef4444'
              return (
                <div key={i} className="nflp-form-gw">
                  <span className="nflp-form-week">Wk{w.week || '?'}</span>
                  <span className="nflp-form-pts" style={{ color: clr }}>{pts.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="nflp-section">
        <h3 className="nflp-section-title"><BarChartOutlined /> Key Numbers</h3>
        <div className="nflp-stats-grid">
          <StatBox label="Avg Wk Pts" value={calcPpg(p).toFixed(1)} color="#A78BFA" />
          <StatBox label="Games" value={p.nflGamesPlayed || (p.weeklyScoring || []).filter(w => w.score > 0).length || '—'} />
          <StatBox label="Cap Hit" value={fmt(calcSalary(p))} color="#A78BFA" />
          {p.otcDeadCap > 0 && <StatBox label="Dead Cap" value={fmt(p.otcDeadCap)} color="#ef4444" />}
          {!p.otcDeadCap && p.otcAvgAnnualValue > 0 && <StatBox label="APY" value={fmt(p.otcAvgAnnualValue)} color="#A78BFA" />}
        </div>
      </div>
    </>
  )
}

const StatBox = ({ label, value, color }) => (
  <div className="nflp-stat-box">
    <span className="nflp-stat-box-val" style={color ? { color } : {}}>{value}</span>
    <span className="nflp-stat-box-lbl">{label}</span>
  </div>
)

/* ═══ CONTRACT TAB ═══ */
const ContractTab = ({ p, hasContract, hasOtcContract, capHit }) => {
  if (!hasContract) {
    return <div className="nflp-empty">No contract data available for this player.</div>
  }

  const breakdown = p.otcYearlyBreakdown || []
  const currentCap = p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0

  return (
    <>
      {/* Contract Summary */}
      <div className="nflp-contract-summary">
        {/* Always show cap hit — we always have this from some source */}
        <div className="nflp-contract-row">
          <span>Cap Hit (Current)</span>
          <span className="nflp-contract-val purple">{fmtFull(currentCap)}</span>
        </div>
        {p.otcContractYears > 0 && (
          <div className="nflp-contract-row">
            <span>Contract Length</span>
            <span className="nflp-contract-val">{p.otcContractYears} years</span>
          </div>
        )}
        {p.otcTotalValue > 0 && (
          <div className="nflp-contract-row">
            <span>Total Value</span>
            <span className="nflp-contract-val green">{fmtFull(p.otcTotalValue)}</span>
          </div>
        )}
        {p.otcTotalGuaranteed > 0 && (
          <div className="nflp-contract-row">
            <span>Total Guaranteed</span>
            <span className="nflp-contract-val gold">{fmtFull(p.otcTotalGuaranteed)}</span>
          </div>
        )}
        {p.otcAvgAnnualValue > 0 && (
          <div className="nflp-contract-row">
            <span>Avg Annual Value</span>
            <span className="nflp-contract-val purple">{fmtFull(p.otcAvgAnnualValue)}</span>
          </div>
        )}
        {p.otcFreeAgentYear > 0 && (
          <div className="nflp-contract-row">
            <span>Free Agent Year</span>
            <span className="nflp-contract-val">{p.otcFreeAgentYear}</span>
          </div>
        )}
        {p.yearsLeftSalaryCap > 0 && (
          <div className="nflp-contract-row">
            <span>Years Remaining</span>
            <span className="nflp-contract-val">{p.yearsLeftSalaryCap}</span>
          </div>
        )}
      </div>

      {/* Current Year Breakdown — only if OTC detail available */}
      {hasOtcContract && (p.otcBaseSalary > 0 || p.otcSigningBonus > 0 || p.otcCapHit > 0) && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><DollarOutlined /> Current Year Breakdown</h3>
          <div className="nflp-cap-grid">
            <CapRow label="Base Salary" value={p.otcBaseSalary} />
            <CapRow label="Signing Bonus" value={p.otcSigningBonus} color="#22c55e" />
            <CapRow label="Roster Bonus" value={p.otcRosterBonus} color="#3b82f6" />
            <CapRow label="Cap Hit" value={p.otcCapHit} color="#A78BFA" highlight />
            <CapRow label="Dead Cap" value={p.otcDeadCap} color="#ef4444" />
          </div>
        </div>
      )}

      {/* Multi-Year Cap Projections */}
      {(p.currentYearSalaryCap > 0 || p.nextYearSalaryCap > 0) && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><BarChartOutlined /> Cap Projections</h3>
          <div className="nflp-cap-bars">
            {[
              { label: '2025', val: p.currentYearSalaryCap || p.otcCapHit },
              { label: '2026', val: p.nextYearSalaryCap },
              { label: '2027', val: p.yearAfterSalaryCap },
              { label: '2028', val: p.yearAfterNextSalaryCap },
            ].filter(y => y.val > 0).map((y, i) => {
              const max = Math.max(p.currentYearSalaryCap || p.otcCapHit || 0, p.nextYearSalaryCap || 0, p.yearAfterSalaryCap || 0, p.yearAfterNextSalaryCap || 0)
              const pct = max > 0 ? (y.val / max) * 100 : 0
              return (
                <div key={i} className="nflp-cap-bar-row">
                  <span className="nflp-cap-bar-label">{y.label}</span>
                  <div className="nflp-cap-bar-track">
                    <div className="nflp-cap-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="nflp-cap-bar-value">{fmt(y.val)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Yearly Breakdown Table */}
      {breakdown.length > 0 && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><FileTextOutlined /> Year-by-Year</h3>
          <div className="nflp-breakdown-header">
            <span>Year</span><span>Base</span><span>Bonus</span><span>Cap Hit</span><span>Dead</span>
          </div>
          {breakdown.map((yr, i) => (
            <div key={i} className="nflp-breakdown-row">
              <span className="nflp-breakdown-year">{yr.year}</span>
              <span>{fmt(yr.baseSalary)}</span>
              <span className="green">{fmt((yr.signingBonus || 0) + (yr.rosterBonus || 0) + (yr.workoutBonus || 0) + (yr.otherBonus || 0))}</span>
              <span className="purple">{fmt(yr.capHit)}</span>
              <span className="red">{fmt(yr.deadCap)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contract Notes */}
      {p.otcContractNotes && (
        <div className="nflp-section">
          <h3 className="nflp-section-title">Notes</h3>
          <p className="nflp-contract-notes">{p.otcContractNotes}</p>
        </div>
      )}

      {p.contractInfo && !p.otcContractNotes && (
        <div className="nflp-section">
          <h3 className="nflp-section-title">Contract</h3>
          <p className="nflp-contract-notes">{p.contractInfo}</p>
        </div>
      )}

      {/* If only PlayerCap data, show a note */}
      {!hasOtcContract && hasContract && (
        <div className="nflp-section">
          <p className="nflp-contract-notes" style={{ fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
            Full contract detail will be available after OTC data sync completes.
          </p>
        </div>
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
  const hasComps = p.compMedName

  if (!hasScout && !hasCombine && !hasComps) {
    return <div className="nflp-empty">No scouting data available for this player.</div>
  }

  return (
    <>
      {/* Scout Grade */}
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

      {/* Strengths & Weaknesses */}
      {(p.scoutStrengths?.length > 0 || p.scoutWeaknesses?.length > 0) && (
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

      {/* Combine */}
      {hasCombine && (
        <div className="nflp-section">
          <h3 className="nflp-section-title"><ThunderboltOutlined /> Combine</h3>
          <div className="nflp-stats-grid">
            {p.fortyYard && <StatBox label="40-Yard" value={`${p.fortyYard}s`} color="#A78BFA" />}
            {p.verticalJump && <StatBox label="Vertical" value={`${p.verticalJump}"`} />}
            {p.broadJump && <StatBox label="Broad Jump" value={`${p.broadJump}"`} />}
            {p.combineRank && <StatBox label="Rank" value={`#${p.combineRank}`} color="#f59e0b" />}
          </div>
        </div>
      )}

      {/* Player Comps */}
      {hasComps && (
        <div className="nflp-section">
          <h3 className="nflp-section-title">Player Comparisons</h3>
          <div className="nflp-comps">
            {p.compLowName && <div className="nflp-comp"><span className="nflp-comp-tier">Floor</span><span className="nflp-comp-name">{p.compLowName}</span><span className="nflp-comp-ppg">{p.compLowPpg} ppg</span></div>}
            {p.compMedName && <div className="nflp-comp med"><span className="nflp-comp-tier">Median</span><span className="nflp-comp-name">{p.compMedName}</span><span className="nflp-comp-ppg">{p.compMedPpg} ppg</span></div>}
            {p.compHighName && <div className="nflp-comp high"><span className="nflp-comp-tier">Ceiling</span><span className="nflp-comp-name">{p.compHighName}</span><span className="nflp-comp-ppg">{p.compHighPpg} ppg</span></div>}
          </div>
        </div>
      )}
    </>
  )
}

export default NFLPlayerPopup
