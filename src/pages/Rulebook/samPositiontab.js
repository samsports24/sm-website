import React, { useEffect } from 'react'
import { Button } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getSamMetric } from '../../redux'
import {
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   2026 FALLBACK SCORING DATA, shown ONLY when API has no data
   Matches actual database structure (per-1-yard granularity).
   QB stats taken directly from the real database.
   Other positions follow the same structure scaled by their %.
   RULE: All TDs are flat 1.00 pts (not affected by metric %).
   NOTE: The API / database is always the source of truth.
   ═══════════════════════════════════════════════════════════ */
const FALLBACK_DATA = {
  QB: {
    FranchiseTagCost: 43895000, Percentage: 100,
    sammetricstats: [
      { label: 'Passing Yards (For every 1 Passing Yard)', fullScale: 0.004, percentvalue: 0.0040 },
      { label: 'Passing Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Passing 2-Pointer', fullScale: 0.218, percentvalue: 0.2180 },
      { label: 'Passing Attempts', fullScale: 0.005, percentvalue: 0.0050 },
      { label: 'Passing Completions', fullScale: 0.035, percentvalue: 0.0350 },
      { label: 'Interception Thrown', fullScale: -0.092, percentvalue: -0.0920 },
      { label: 'Incompletions', fullScale: -0.018, percentvalue: -0.0180 },
      { label: 'Sacked', fullScale: -0.032, percentvalue: -0.0320 },
      { label: 'Rushing Yards (For Every 1 Rushing Yard)', fullScale: 0.025, percentvalue: 0.0250 },
      { label: 'Rushing TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Rushing Attempts', fullScale: 0.015, percentvalue: 0.0150 },
      { label: 'Rushing 2-Pointer', fullScale: 0.218, percentvalue: 0.2180 },
      { label: 'Fumble', fullScale: -0.032, percentvalue: -0.0320 },
      { label: 'Receiving Yards (For Every 1 Receiving Yard)', fullScale: 0.026, percentvalue: 0.0260 },
      { label: 'Receiving TD', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  RB: {
    FranchiseTagCost: 14293000, Percentage: 32.6,
    sammetricstats: [
      { label: 'Rushing Yards (For Every 1 Rushing Yard)', fullScale: 0.025, percentvalue: 0.0082 },
      { label: 'Rushing TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Rushing Attempts', fullScale: 0.015, percentvalue: 0.0049 },
      { label: 'Rushing 2-Pointer', fullScale: 0.218, percentvalue: 0.0711 },
      { label: 'Receiving Yards (For Every 1 Receiving Yard)', fullScale: 0.026, percentvalue: 0.0085 },
      { label: 'Receiving TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Receptions', fullScale: 0.035, percentvalue: 0.0114 },
      { label: 'Fumble', fullScale: -0.032, percentvalue: -0.0104 },
      { label: 'Passing Yards (For every 1 Passing Yard)', fullScale: 0.004, percentvalue: 0.0013 },
      { label: 'Passing Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  WR: {
    FranchiseTagCost: 27298000, Percentage: 62.2,
    sammetricstats: [
      { label: 'Receiving Yards (For Every 1 Receiving Yard)', fullScale: 0.026, percentvalue: 0.0162 },
      { label: 'Receiving TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Receptions', fullScale: 0.035, percentvalue: 0.0218 },
      { label: 'Rushing Yards (For Every 1 Rushing Yard)', fullScale: 0.025, percentvalue: 0.0156 },
      { label: 'Rushing TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Rushing Attempts', fullScale: 0.015, percentvalue: 0.0093 },
      { label: 'Rushing 2-Pointer', fullScale: 0.218, percentvalue: 0.1356 },
      { label: 'Fumble', fullScale: -0.032, percentvalue: -0.0199 },
      { label: 'Passing Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Receiving 2-Pointer', fullScale: 0.218, percentvalue: 0.1356 },
    ],
  },
  TE: {
    FranchiseTagCost: 15045000, Percentage: 34.3,
    sammetricstats: [
      { label: 'Receiving Yards (For Every 1 Receiving Yard)', fullScale: 0.026, percentvalue: 0.0089 },
      { label: 'Receiving TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Receptions', fullScale: 0.035, percentvalue: 0.0120 },
      { label: 'Rushing Yards (For Every 1 Rushing Yard)', fullScale: 0.025, percentvalue: 0.0086 },
      { label: 'Rushing TD', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Rushing 2-Pointer', fullScale: 0.218, percentvalue: 0.0748 },
      { label: 'Fumble', fullScale: -0.032, percentvalue: -0.0110 },
      { label: 'Passing Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  // The real offensive-line table, copied from the sammetrics collection on
  // 17 Sep 2026. What used to sit here - pancake blocks, QB hurries allowed,
  // run and pass block win rate - appears in no version of the rule book and
  // in no feed we buy. Tank01 sends no offensive-line stats at all. It was
  // showing seven made-up rows to anybody not logged in.
  //
  // A lineman is paid a share of what his offence did in front of him,
  // multiplied by how much of it he was on the field for. The team touchdown
  // rows are scaled like every other row: he blocked, he did not score. A
  // touchdown he scores HIMSELF pays a flat 1.00, same as anybody.
  OL: {
    FranchiseTagCost: 25773000, Percentage: 58.7,
    sammetricstats: [
      { label: 'Team Rushing Stats', fullScale: 0.014, percentvalue: 0.008218 },
      { label: 'Team Rushing TD', fullScale: 0.031, percentvalue: 0.018197 },
      { label: 'Team Passing TD', fullScale: 0.016, percentvalue: 0.009392 },
      { label: '0 Sacks Given-up', fullScale: 1.866, percentvalue: 1.095342 },
      { label: '1 Sacks Given-up', fullScale: 1.455, percentvalue: 0.854085 },
      { label: '2 Sacks Given-up', fullScale: 1.044, percentvalue: 0.612828 },
      { label: '3 Sacks Given-up', fullScale: 0.496, percentvalue: 0.291152 },
      { label: '4 Sacks Given-up', fullScale: -0.052, percentvalue: -0.030524 },
      { label: '5 Sacks Given-up', fullScale: -0.6, percentvalue: -0.3522 },
      { label: '6 Sacks Given-up', fullScale: -1.148, percentvalue: -0.673876 },
      { label: '7 Sacks Given-up', fullScale: -1.696, percentvalue: -0.995552 },
      { label: '8 Sacks Given-up', fullScale: -2.244, percentvalue: -1.317228 },
      { label: '9 Sacks Given-up', fullScale: -2.792, percentvalue: -1.638904 },
      { label: '10 Sacks Given-up', fullScale: -3.339, percentvalue: -1.959993 },
      { label: '11 Sacks Given-up', fullScale: -3.887, percentvalue: -2.281669 },
      { label: '12 Sacks Given-up', fullScale: -4.435, percentvalue: -2.603345 },
      { label: '13 Sacks Given-up', fullScale: -4.983, percentvalue: -2.925021 },
      { label: '14 Sacks Given-up', fullScale: -5.531, percentvalue: -3.246697 },
      { label: '15 Sacks Given-up', fullScale: -6.079, percentvalue: -3.568373 },
    ],
  },
  DT: {
    FranchiseTagCost: 27127000, Percentage: 61.8,
    sammetricstats: [
      { label: 'Sacks', fullScale: 0.100, percentvalue: 0.0618 },
      { label: 'Tackles', fullScale: 0.020, percentvalue: 0.0124 },
      { label: 'Tackles for Loss', fullScale: 0.050, percentvalue: 0.0309 },
      { label: 'QB Hits', fullScale: 0.040, percentvalue: 0.0247 },
      { label: 'Forced Fumbles', fullScale: 0.080, percentvalue: 0.0494 },
      { label: 'Fumble Recoveries', fullScale: 0.080, percentvalue: 0.0494 },
      { label: 'Pass Deflections', fullScale: 0.030, percentvalue: 0.0185 },
      { label: 'Safeties', fullScale: 0.200, percentvalue: 0.1236 },
      { label: 'Defensive Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  DE: {
    FranchiseTagCost: 24434000, Percentage: 55.7,
    sammetricstats: [
      { label: 'Sacks', fullScale: 0.100, percentvalue: 0.0557 },
      { label: 'Tackles', fullScale: 0.020, percentvalue: 0.0111 },
      { label: 'Tackles for Loss', fullScale: 0.050, percentvalue: 0.0279 },
      { label: 'QB Hits', fullScale: 0.040, percentvalue: 0.0223 },
      { label: 'Forced Fumbles', fullScale: 0.080, percentvalue: 0.0446 },
      { label: 'Fumble Recoveries', fullScale: 0.080, percentvalue: 0.0446 },
      { label: 'Pass Deflections', fullScale: 0.030, percentvalue: 0.0167 },
      { label: 'Safeties', fullScale: 0.200, percentvalue: 0.1114 },
      { label: 'Defensive Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  LB: {
    FranchiseTagCost: 26865000, Percentage: 61.2,
    sammetricstats: [
      { label: 'Tackles', fullScale: 0.020, percentvalue: 0.0122 },
      { label: 'Sacks', fullScale: 0.100, percentvalue: 0.0612 },
      { label: 'Tackles for Loss', fullScale: 0.050, percentvalue: 0.0306 },
      { label: 'QB Hits', fullScale: 0.040, percentvalue: 0.0245 },
      { label: 'Interceptions', fullScale: 0.080, percentvalue: 0.0490 },
      { label: 'Forced Fumbles', fullScale: 0.080, percentvalue: 0.0490 },
      { label: 'Fumble Recoveries', fullScale: 0.080, percentvalue: 0.0490 },
      { label: 'Pass Deflections', fullScale: 0.030, percentvalue: 0.0184 },
      { label: 'Safeties', fullScale: 0.200, percentvalue: 0.1224 },
      { label: 'Defensive Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  CB: {
    FranchiseTagCost: 21161000, Percentage: 48.2,
    sammetricstats: [
      { label: 'Interceptions', fullScale: 0.080, percentvalue: 0.0386 },
      { label: 'Tackles', fullScale: 0.020, percentvalue: 0.0096 },
      { label: 'Pass Deflections', fullScale: 0.030, percentvalue: 0.0145 },
      { label: 'Forced Fumbles', fullScale: 0.080, percentvalue: 0.0386 },
      { label: 'Fumble Recoveries', fullScale: 0.080, percentvalue: 0.0386 },
      { label: 'Tackles for Loss', fullScale: 0.050, percentvalue: 0.0241 },
      { label: 'Safeties', fullScale: 0.200, percentvalue: 0.0964 },
      { label: 'Defensive Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
      { label: 'Pick Six', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  S: {
    FranchiseTagCost: 20149000, Percentage: 45.9,
    sammetricstats: [
      { label: 'Interceptions', fullScale: 0.080, percentvalue: 0.0367 },
      { label: 'Tackles', fullScale: 0.020, percentvalue: 0.0092 },
      { label: 'Pass Deflections', fullScale: 0.030, percentvalue: 0.0138 },
      { label: 'Forced Fumbles', fullScale: 0.080, percentvalue: 0.0367 },
      { label: 'Fumble Recoveries', fullScale: 0.080, percentvalue: 0.0367 },
      { label: 'Tackles for Loss', fullScale: 0.050, percentvalue: 0.0230 },
      { label: 'Sacks', fullScale: 0.100, percentvalue: 0.0459 },
      { label: 'Safeties', fullScale: 0.200, percentvalue: 0.0918 },
      { label: 'Defensive Touchdown', fullScale: 1.0, percentvalue: 1.0000 },
    ],
  },
  ST: {
    FranchiseTagCost: 6649000, Percentage: 15.1,
    sammetricstats: [
      { label: 'FG Made (0-39 yards)', fullScale: 0.060, percentvalue: 0.0091 },
      { label: 'FG Made (40-49 yards)', fullScale: 0.080, percentvalue: 0.0121 },
      { label: 'FG Made (50+ yards)', fullScale: 0.100, percentvalue: 0.0151 },
      { label: 'FG Missed', fullScale: -0.040, percentvalue: -0.0060 },
      { label: 'Extra Point Made', fullScale: 0.020, percentvalue: 0.0030 },
      { label: 'Extra Point Missed', fullScale: -0.040, percentvalue: -0.0060 },
      { label: 'Punts Inside 20', fullScale: 0.030, percentvalue: 0.0045 },
      { label: 'Punts (50+ yards)', fullScale: 0.030, percentvalue: 0.0045 },
      { label: 'Touchbacks (Punter)', fullScale: -0.015, percentvalue: -0.0023 },
    ],
  },
}

/* ═══════════════════════════════════════════════════════════
   2025 NFL Franchise Tag Percentages (Past Year, $272.5 M cap)
   Used to compute "Past Year" column values
   ═══════════════════════════════════════════════════════════ */
const PCT_2025 = {
  QB: 100,   LB: 63.2,  DT: 62.4,  WR: 59.5,
  OL: 58.1,  DE: 54.8,  CB: 50.1,  S: 46.2,
  TE: 34.4,  RB: 33.9,  ST: 15.7,
}

/** Touchdown stat labels, these are always flat 1.00 pts, unaffected by metric %.
 *  Matches real database label names (case-insensitive check used below). */
const TD_LABELS = [
  'Passing Touchdown', 'Rushing TD', 'Receiving TD',
  'Defensive Touchdown', 'Pick Six', 'Kick Return Touchdown', 'Punt Return Touchdown',
  // Legacy label variants (in case old data uses these)
  'Passing Touchdowns', 'Rushing Touchdowns', 'Receiving Touchdowns',
  'Defensive Touchdowns',
]

/** Compute the past-year percentvalue for a stat.
 *  Touchdowns are always 1.00 (not affected by franchise tag / metric %).
 *  Everything else scales by (pct2025 / pct2026). */
const getPastYearValue = (stat, pct2026, position) => {
  const pct2025 = PCT_2025[position]
  if (!pct2025 || !pct2026) return null
  // Touchdowns are always 1.00, same every year, every position
  // Case-insensitive check to handle both DB and fallback label variants
  const lbl = (stat.label || '').toLowerCase()
  const isTD = TD_LABELS.some((td) => td.toLowerCase() === lbl) || lbl.includes('touchdown') || lbl.includes(' td')
  if (isTD) return 1.0
  const ratio = pct2025 / pct2026
  return +(stat.percentvalue * ratio).toFixed(4)
}

const SamPositiontab = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { allSamMetric } = useSelector((state) => state?.league)
  const { playerName, playerPosition, playerColor } = location.state || {}

  const apiMetrics = allSamMetric?.sammetric?.filter(
    (metric) => metric?.Position === playerPosition,
  )

  useEffect(() => {
    const fetchData = async () => {
      try { await getSamMetric() } catch (e) { console.error('Failed to load SAM Metric:', e) }
    }
    fetchData()
  }, [])

  // Use API data if available, otherwise use 2026 fallback
  const fallback = FALLBACK_DATA[playerPosition]
  const hasApiData = apiMetrics && apiMetrics.length > 0 && apiMetrics[0]?.sammetricstats?.length > 0
  const metrics = hasApiData ? apiMetrics : (fallback ? [{ ...fallback, Position: playerPosition }] : [])

  return (
    <div className='rb-page sp-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>{playerName || 'POSITION'} <span>BREAKDOWN</span></h1>
            <span className='rb-page-subtitle' style={{ color: playerColor }}>{playerPosition}</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book/sammetric')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Position Info Cards ── */}
      {metrics?.map((metric, index) => (
        <div key={index}>
          {/* Stats Summary */}
          <div className='sp-summary'>
            <div className='sp-summary-card' style={{ '--sp-color': playerColor }}>
              <div className='sp-summary-label'>POSITION</div>
              <div className='sp-summary-value' style={{ color: playerColor }}>
                {playerPosition}
              </div>
              <div className='sp-summary-sub'>{playerName}</div>
            </div>
            <div className='sp-summary-card' style={{ '--sp-color': playerColor }}>
              <div className='sp-summary-label'>FRANCHISE TAG</div>
              <div className='sp-summary-value' style={{ color: playerColor }}>
                ${metric?.FranchiseTagCost?.toLocaleString()}
              </div>
              <div className='sp-summary-sub'>2026 Value</div>
            </div>
            <div className='sp-summary-card' style={{ '--sp-color': playerColor }}>
              <div className='sp-summary-label'>METRIC %</div>
              <div className='sp-summary-value' style={{ color: playerColor }}>
                {metric?.Percentage}%
              </div>
              <div className='sp-summary-sub'>Scoring Weight</div>
            </div>
          </div>

          {/* Scoring Table */}
          <div className='sp-table-wrap'>
            <div className='sp-table-header'>
              <span style={{ flex: 3 }}>SCORING TOPIC</span>
              <span style={{ flex: 1.5 }}>FULL SCALE</span>
              <span style={{ flex: 1 }}>METRIC %</span>
              <span style={{ flex: 1 }}>PAST YEAR</span>
              <span style={{ flex: 0.5, textAlign: 'center' }}></span>
              <span style={{ flex: 1.5 }}>CURRENT YEAR</span>
            </div>
            <div className='sp-table-body'>
              {metric?.sammetricstats?.map((stat, idx) => (
                <div
                  key={idx}
                  className={`sp-table-row ${idx % 2 === 0 ? 'sp-table-row--alt' : ''}`}
                >
                  <span className='sp-cell-topic' style={{ flex: 3 }}>
                    {stat.label}
                  </span>
                  <span style={{ flex: 1.5 }}>{stat.fullScale}</span>
                  <span className='sp-cell-pct' style={{ flex: 1, color: playerColor }}>
                    {metric?.Percentage}%
                  </span>
                  <span style={{ flex: 1, color: 'var(--rb-text-muted)' }}>
                    {(() => {
                      const pv = getPastYearValue(stat, metric?.Percentage, playerPosition)
                      return pv !== null ? pv.toFixed(4) : '—'
                    })()}
                  </span>
                  <span style={{ flex: 0.5, textAlign: 'center' }}>
                    {stat.percentvalue > 0 ? (
                      <RiseOutlined style={{ color: '#22C55E', fontSize: 12 }} />
                    ) : (
                      <FallOutlined style={{ color: '#EF4444', fontSize: 12 }} />
                    )}
                  </span>
                  <span className='sp-cell-current' style={{ flex: 1.5 }}>
                    {stat.percentvalue?.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SamPositiontab
