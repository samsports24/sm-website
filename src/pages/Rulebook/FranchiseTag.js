import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getSamMetric } from '../../redux'
import {
  ArrowLeftOutlined,
  DollarOutlined,
} from '@ant-design/icons'

/* Position color mapping */
const POS_COLORS = {
  QB: '#F59E0B', RB: '#F59E0B', WR: '#22C55E', TE: '#22C55E',
  OL: '#A78BFA', ST: '#3B82F6', DT: '#EF4444', DE: '#EF4444',
  LB: '#06B6D4', CB: '#EC4899', S: '#06B6D4',
}

const POS_NAMES = {
  QB: 'Quarter Back', RB: 'Running Back', WR: 'Wide Receiver', TE: 'Tight End',
  OL: 'Offensive Lineman', ST: 'Special Teams', DT: 'Interior D-Lineman', DE: 'Edge Rusher',
  LB: 'Linebacker', CB: 'Corner Back', S: 'Safeties',
}

/* ═══════════════════════════════════════════════════════════
   2026 NFL FRANCHISE TAG VALUES (Official, Feb 27, 2026)
   Salary Cap: $301.2 M
   ═══════════════════════════════════════════════════════════ */
const FRANCHISE_TAG_2026 = [
  { Position: 'QB', FranchiseTagCost: 43895000, Percentage: 100 },
  { Position: 'WR', FranchiseTagCost: 27298000, Percentage: 62.2 },
  { Position: 'DT', FranchiseTagCost: 27127000, Percentage: 61.8 },
  { Position: 'LB', FranchiseTagCost: 26865000, Percentage: 61.2 },
  { Position: 'OL', FranchiseTagCost: 25773000, Percentage: 58.7 },
  { Position: 'DE', FranchiseTagCost: 24434000, Percentage: 55.7 },
  { Position: 'CB', FranchiseTagCost: 21161000, Percentage: 48.2 },
  { Position: 'S',  FranchiseTagCost: 20149000, Percentage: 45.9 },
  { Position: 'TE', FranchiseTagCost: 15045000, Percentage: 34.3 },
  { Position: 'RB', FranchiseTagCost: 14293000, Percentage: 32.6 },
  { Position: 'ST', FranchiseTagCost: 6649000,  Percentage: 15.1 },
]

/* ═══════════════════════════════════════════════════════════
   2025 NFL FRANCHISE TAG VALUES (Official)
   Salary Cap: $272.5 M
   ═══════════════════════════════════════════════════════════ */
const FRANCHISE_TAG_2025 = [
  { Position: 'QB', FranchiseTagCost: 40242000, Percentage: 100 },
  { Position: 'LB', FranchiseTagCost: 25452000, Percentage: 63.2 },
  { Position: 'DT', FranchiseTagCost: 25123000, Percentage: 62.4 },
  { Position: 'WR', FranchiseTagCost: 23959000, Percentage: 59.5 },
  { Position: 'OL', FranchiseTagCost: 23402000, Percentage: 58.1 },
  { Position: 'DE', FranchiseTagCost: 22062000, Percentage: 54.8 },
  { Position: 'CB', FranchiseTagCost: 20187000, Percentage: 50.1 },
  { Position: 'S',  FranchiseTagCost: 18601000, Percentage: 46.2 },
  { Position: 'TE', FranchiseTagCost: 13826000, Percentage: 34.4 },
  { Position: 'RB', FranchiseTagCost: 13640000, Percentage: 33.9 },
  { Position: 'ST', FranchiseTagCost: 6313000,  Percentage: 15.7 },
]

const YEAR_DATA = {
  2026: { data: FRANCHISE_TAG_2026, cap: '$301.2M' },
  2025: { data: FRANCHISE_TAG_2025, cap: '$272.5M' },
}

const FranchiseTag = () => {
  const navigate = useNavigate()
  const { allSamMetric } = useSelector((state) => state?.league)
  const [activeYear, setActiveYear] = useState(2026)

  useEffect(() => {
    const fetchData = async () => {
      try { await getSamMetric() } catch (e) { console.error('Failed to load SAM Metric:', e) }
    }
    fetchData()
  }, [])

  // For 2026 (current year): use API data if available, otherwise hardcoded
  // For 2025 (past year): always use hardcoded
  const metrics = activeYear === 2026
    ? (allSamMetric?.sammetric?.length > 0 ? allSamMetric.sammetric : FRANCHISE_TAG_2026)
    : YEAR_DATA[activeYear].data

  return (
    <div className='rb-page ft-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>FRANCHISE TAG <span>BREAKDOWN</span></h1>
            <span className='rb-page-subtitle'>SAMMETRIC FOUNDATION</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book/sammetric')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Year Tabs ── */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 24px', marginBottom: 16,
      }}>
        {Object.keys(YEAR_DATA).sort((a, b) => b - a).map((year) => {
          const yr = Number(year)
          const isActive = yr === activeYear
          return (
            <button
              key={yr}
              onClick={() => setActiveYear(yr)}
              style={{
                padding: '6px 18px', borderRadius: 6,
                border: isActive ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.1)',
                background: isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#22C55E' : 'rgba(255,255,255,0.45)',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                letterSpacing: 0.5, textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {yr}{yr === 2026 ? ' (Current)' : ' (Past Year)'}
            </button>
          )
        })}
        <span style={{
          display: 'flex', alignItems: 'center', fontSize: 11,
          color: 'rgba(255,255,255,0.3)', marginLeft: 8,
        }}>
          Salary Cap: {YEAR_DATA[activeYear].cap}
        </span>
      </div>

      {/* ── Intro Card ── */}
      <div className='ft-intro'>
        <DollarOutlined className='ft-intro-icon' />
        <div className='ft-intro-text'>
          <div className='ft-intro-title'>How Franchise Tags Drive Scoring</div>
          <div className='ft-intro-desc'>
            The main goal of the SamMetric Scoring System is to replicate real-world dynamics. Player values
            are assigned based on the Franchise Tag scale, resulting in each player&apos;s weekly score reflecting
            their real-world positional value. Higher-paid positions earn proportionally higher fantasy points.
          </div>
        </div>
      </div>

      {/* ── Franchise Tag Cards ── */}
      <div className='ft-grid'>
        {metrics?.map((metric, index) => {
          const color = POS_COLORS[metric?.Position] || '#94A3B8'
          const posName = POS_NAMES[metric?.Position] || metric?.Position

          return (
            <div key={index} className='ft-card' style={{ '--ft-color': color }}>
              <div className='ft-card-accent' style={{ background: color }} />
              <div className='ft-card-body'>
                <div className='ft-card-top'>
                  <div className='ft-card-pos' style={{ color, background: `${color}18` }}>
                    {metric?.Position}
                  </div>
                  <div className='ft-card-name'>{posName}</div>
                </div>
                <div className='ft-card-stats'>
                  <div className='ft-card-stat'>
                    <span className='ft-card-stat-label'>Franchise Tag</span>
                    <span className='ft-card-stat-value' style={{ color }}>
                      ${metric?.FranchiseTagCost?.toLocaleString()}
                    </span>
                  </div>
                  <div className='ft-card-stat'>
                    <span className='ft-card-stat-label'>Metric %</span>
                    <span className='ft-card-stat-value' style={{ color }}>
                      {metric?.Percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FranchiseTag
