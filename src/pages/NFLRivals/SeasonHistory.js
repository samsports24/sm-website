import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty, notification } from 'antd'
import {
  ClockCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
  StarOutlined,
  SafetyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import { DIVISIONS, DIVISION_COLORS } from './rivalsConfig'
import './nfl-rivals.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Tier label from best division reached (1 = best). Same buckets as soccer.
const rankTier = (div) => {
  if (!div) return '-'
  if (div <= 2) return 'ELITE'
  if (div <= 5) return 'PRO'
  if (div <= 8) return 'SEMI-PRO'
  return 'ENTRY'
}

// Division accent color — reuse the NFL config, with a neutral fallback.
const divisionColor = (div) => DIVISION_COLORS[div] || '#8b93a7'

// Parse a "YYYY-MM" season id into a human "Mon YYYY" label. Returns null otherwise.
const seasonMonthLabel = (season) => {
  const m = /^(\d{4})-(\d{2})$/.exec(String(season || ''))
  if (!m) return null
  const year = m[1]
  const mon = MONTHS[parseInt(m[2], 10) - 1]
  return mon ? `${mon} ${year}` : null
}

const SeasonHistory = () => {
  const token = useSelector(s => s.user.token)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [careerStats, setCareerStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/history')
        setHistory(data.data?.history || [])
        setCareerStats(data.data?.careerStats || null)
      } catch (err) {
        notification.error({ message: 'Failed to load history' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const cs = careerStats || {}
  const totalSeasons = cs.totalSeasons || 0
  const totalWins = cs.totalWins || 0
  const totalDraws = cs.totalDraws || 0
  const totalLosses = cs.totalLosses || 0
  const gamesPlayed = totalWins + totalDraws + totalLosses
  const winRate = gamesPlayed > 0 ? Math.round((totalWins / gamesPlayed) * 100) : 0
  const allTimePoints = Math.round(cs.totalPointsAllTime || 0)
  const top3 = history.filter(h => h.finalRank >= 1 && h.finalRank <= 3).length
  const promotions = cs.promotions || 0
  const relegations = cs.relegations || 0
  const highestTier = rankTier(cs.highestDivision)

  // Milestone: next 1000 strictly above current all-time points.
  const milestoneTarget = Math.floor(allTimePoints / 1000) * 1000 + 1000
  const milestonePct = milestoneTarget > 0 ? Math.min(100, (allTimePoints / milestoneTarget) * 100) : 0

  const statItems = [
    { label: 'Seasons', value: totalSeasons, icon: <AppstoreOutlined /> },
    { label: 'Top 3 Finishes', value: top3, icon: <TrophyOutlined /> },
    { label: 'Win Rate', value: `${winRate}%`, icon: <LineChartOutlined /> },
    { label: 'All-Time Points', value: allTimePoints, icon: <StarOutlined /> },
    { label: 'Highest Rank', value: highestTier, icon: <SafetyOutlined />, green: true },
    { label: 'Promotions', value: promotions, icon: <RiseOutlined />, green: true },
    { label: 'Relegations', value: relegations, icon: <FallOutlined />, red: true },
  ]

  return (
    <div className="nflr-page">
      <div className="rvz-hist-head">
        <h2 className="nflr-page-title"><ClockCircleOutlined /> Season History</h2>
        <p className="rvz-hist-subtitle">Review your performance across all seasons</p>
      </div>

      {/* ── Stats bar ── */}
      <div className="rvz-hist-statsbar">
        {statItems.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className="rvz-hist-stat-divider" />}
            <div className="rvz-hist-stat">
              <div className="rvz-hist-stat-icon">{s.icon}</div>
              <div className="rvz-hist-stat-body">
                <span className={`rvz-hist-stat-value${s.green ? ' green' : ''}${s.red ? ' red' : ''}`}>{s.value}</span>
                <span className="rvz-hist-stat-label">{s.label}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Season table ── */}
      {history.length > 0 ? (
        <div className="rvz-hist-table-panel">
          <div className="rvz-hist-table-scroll">
            <table className="rvz-hist-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Division</th>
                  <th>Pod</th>
                  <th>Rank</th>
                  <th>Record</th>
                  <th>Points</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => {
                  const monthLabel = seasonMonthLabel(h.season)
                  const divColor = divisionColor(h.division)
                  const divName = (h.divisionName || DIVISIONS[h.division] || '-').toUpperCase()
                  return (
                    <tr key={`${h.season}-${idx}`}>
                      <td>
                        <div className="rvz-hist-season">
                          <CalendarOutlined className="rvz-hist-season-icon" />
                          <div className="rvz-hist-season-body">
                            <span className="rvz-hist-season-id">{h.season}</span>
                            {monthLabel && <span className="rvz-hist-season-sub">{monthLabel}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="rvz-hist-div">
                          <SafetyOutlined className="rvz-hist-div-icon" style={{ color: divColor }} />
                          <div className="rvz-hist-div-body">
                            <span className="rvz-hist-div-name">{divName}</span>
                            <span className="rvz-hist-div-sub">Pod #{h.podNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="rvz-hist-pod">#{h.podNumber}</td>
                      <td className="rvz-hist-rank">{h.finalRank ? `#${h.finalRank}` : '-'}</td>
                      <td>
                        <div className="rvz-hist-record">
                          <span className="rvz-hist-pill green">{h.wins}W</span>
                          <span className="rvz-hist-pill gray">{h.draws}D</span>
                          <span className="rvz-hist-pill red">{h.losses}L</span>
                        </div>
                      </td>
                      <td className="rvz-hist-points">{(h.totalPoints || 0).toFixed(1)}</td>
                      <td>
                        {h.movement === 'promoted' ? (
                          <span className="rvz-hist-result green">↗ Promoted</span>
                        ) : h.movement === 'relegated' ? (
                          <span className="rvz-hist-result red">↘ Relegated</span>
                        ) : (
                          <span className="rvz-hist-result-dash">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rvz-hist-table-panel rvz-hist-empty">
          <Empty
            description={<span style={{ color: 'rgba(255,255,255,0.4)' }}>No season history yet. Complete your first season!</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      {/* ── Footer / milestone panel ── */}
      <div className="rvz-hist-footer">
        <div className="rvz-hist-footer-left">
          <div className="rvz-hist-footer-icon"><LineChartOutlined /></div>
          <div className="rvz-hist-footer-copy">
            <span className="rvz-hist-footer-title">Keep climbing</span>
            <span className="rvz-hist-footer-sub">You&apos;re performing above average in your division.</span>
          </div>
        </div>
        <div className="rvz-hist-footer-right">
          <span className="rvz-hist-milestone-label">Next Milestone</span>
          <span className="rvz-hist-milestone-target">
            Reach <b>{milestoneTarget.toLocaleString()}</b> all-time points
          </span>
          <div className="rvz-hist-milestone-bar">
            <div className="rvz-hist-milestone-fill" style={{ width: `${milestonePct}%` }} />
          </div>
          <span className="rvz-hist-milestone-count">
            {allTimePoints.toLocaleString()} / {milestoneTarget.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SeasonHistory
