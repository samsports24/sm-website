import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty, Tag, Tooltip, Progress } from 'antd'
import {
  BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FireOutlined, TrophyOutlined, SwapOutlined, CrownOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import { SEASON_WEEKS } from './rivalsConfig'
import './nfl-rivals.css'

/* ── Helpers ── */
const fmt = (n) => n != null ? Number(n).toFixed(1) : '—'
const dt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

/* ═══════════════════════════════════════════════════
   H2H MATCH CARD
   ═══════════════════════════════════════════════════ */
const H2HMatchCard = ({ match, userId, expanded, onClick }) => {
  if (!match) return null

  const isHome = String(match.homeUserId) === String(userId) || String(match.homeUserId?._id) === String(userId)
  const myScore = isHome ? match.homeScore : match.awayScore
  const oppScore = isHome ? match.awayScore : match.homeScore
  const myName = isHome
    ? (match.homeUsername || match.home?.username || match.homeTeamName || 'You')
    : (match.awayUsername || match.away?.username || match.awayTeamName || 'You')
  const oppName = isHome
    ? (match.awayUsername || match.away?.username || match.awayTeamName || 'Opponent')
    : (match.homeUsername || match.home?.username || match.homeTeamName || 'Opponent')
  const isCompleted = match.status === 'completed'
  const isWin = isCompleted && myScore > oppScore
  const isDraw = isCompleted && myScore === oppScore
  const isLoss = isCompleted && myScore < oppScore

  const resultColor = isWin ? '#10b981' : isLoss ? '#ef4444' : isDraw ? '#f59e0b' : '#94a3b8'
  const resultLabel = isWin ? 'WIN' : isLoss ? 'LOSS' : isDraw ? 'DRAW' : 'PENDING'
  const resultBg = isWin
    ? 'rgba(16,185,129,0.08)' : isLoss
    ? 'rgba(239,68,68,0.08)' : isDraw
    ? 'rgba(245,158,11,0.08)' : 'rgba(148,163,184,0.04)'

  return (
    <div
      onClick={onClick}
      style={{
        background: resultBg,
        border: `1px solid ${resultColor}33`,
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 10,
        cursor: isCompleted ? 'pointer' : 'default',
        transition: 'all .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, textAlign: 'right', paddingRight: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{myName}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>You</div>
        </div>
        <div style={{
          minWidth: 130, textAlign: 'center',
          background: 'rgba(15,23,42,0.5)', borderRadius: 12, padding: '8px 16px',
        }}>
          {isCompleted ? (
            <>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26, fontWeight: 800, color: resultColor, letterSpacing: 1,
              }}>
                {fmt(myScore)} — {fmt(oppScore)}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 800, color: resultColor,
                textTransform: 'uppercase', letterSpacing: 2, marginTop: 2,
              }}>
                {resultLabel}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>VS</div>
          )}
        </div>
        <div style={{ flex: 1, paddingLeft: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{oppName}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Opponent</div>
        </div>
      </div>
      {isCompleted && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {expanded ? '▲ Hide details' : '▼ Tap for details'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   POD STANDINGS TABLE
   ═══════════════════════════════════════════════════ */
const PodStandingsTable = ({ members, userId }) => {
  if (!members?.length) return null

  return (
    <div style={{
      background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
      borderRadius: 14, overflow: 'hidden', marginBottom: 20,
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(110,105,128,0.15)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <TrophyOutlined style={{ color: '#f59e0b' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Pod Standings</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(110,105,128,0.15)' }}>
            {['#', 'Manager', 'W', 'D', 'L', 'Pts', 'Total Score'].map(h => (
              <th key={h} style={{
                padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: 1, textAlign: h === 'Manager' ? 'left' : 'center',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => {
            const isYou = String(m.user?._id || m.user) === String(userId)
            const zone = idx < 3 ? 'promo' : idx >= members.length - 3 ? 'releg' : 'mid'
            return (
              <tr key={m._id || idx} style={{
                borderBottom: '1px solid rgba(110,105,128,0.08)',
                background: isYou ? 'rgba(167,139,250,0.06)' : 'transparent',
              }}>
                <td style={{
                  padding: '8px 12px', textAlign: 'center', fontSize: 13, fontWeight: 700,
                  color: zone === 'promo' ? '#10b981' : zone === 'releg' ? '#ef4444' : '#94a3b8',
                }}>
                  {zone === 'promo' && <ArrowUpOutlined style={{ fontSize: 10, marginRight: 2 }} />}
                  {zone === 'releg' && <ArrowDownOutlined style={{ fontSize: 10, marginRight: 2 }} />}
                  {idx + 1}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: isYou ? 700 : 500, color: isYou ? '#A78BFA' : '#e2e8f0', textAlign: 'left' }}>
                  {m.user?.username || m.username || '—'} {isYou && <Tag color="purple" style={{ fontSize: 9 }}>YOU</Tag>}
                </td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600, color: '#10b981' }}>{m.wins || 0}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>{m.draws || 0}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{m.losses || 0}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{(m.wins || 0) * 3 + (m.draws || 0)}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{fmt(m.totalPoints)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div style={{ padding: '8px 16px', display: 'flex', gap: 16, borderTop: '1px solid rgba(110,105,128,0.1)' }}>
        <span style={{ fontSize: 10, color: '#10b981' }}>▲ Promotion zone (Top 3)</span>
        <span style={{ fontSize: 10, color: '#ef4444' }}>▼ Relegation zone (Bottom 3)</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN MATCHDAY VIEW
   NFL: S1(5wk) + S2(5wk) + S3(4wk) + S4(4wk) = 18wk cycle
   ═══════════════════════════════════════════════════ */
const MatchdayView = () => {
  const token = useSelector(s => s.user.token)
  const user = useSelector(s => s.user.user)
  const userId = user?._id

  const [loading, setLoading] = useState(true)
  const [season, setSeason] = useState(null)
  const [matchdayData, setMatchdayData] = useState(null)
  const [pod, setPod] = useState(null)
  const [activeWeek, setActiveWeek] = useState(null)
  const [expandedMatch, setExpandedMatch] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const [weekRes, podRes] = await Promise.all([
          privateAPI.get('/nfl-rivals/week'),
          privateAPI.get('/nfl-rivals/pod'),
        ])
        const weekData = weekRes.data.data || null
        const podData = podRes.data.data?.pod || null
        setSeason(weekData?.season || null)
        setMatchdayData(weekData)
        setPod(podData)

        // Default to the active week
        if (weekData?.activeWeek) {
          setActiveWeek(weekData.activeWeek.week)
        } else if (weekData?.matchdays?.length) {
          const completed = weekData.matchdays.filter(m => m.status === 'completed')
          setActiveWeek(completed.length ? completed[completed.length - 1].week : weekData.matchdays[0].week)
        }
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  // All matchdays for this season
  const matchdays = matchdayData?.matchdays || []
  const totalWeeks = matchdays.length || (season?.weekCount) || 5
  const completedCount = matchdays.filter(m => m.status === 'completed').length
  const progressPct = totalWeeks > 0 ? (completedCount / totalWeeks) * 100 : 0

  // Determine season label (S1-S4)
  const seasonNumber = season?.seasonNumber || season?.number || null
  const seasonLabel = season?.name || (seasonNumber ? `S${seasonNumber}` : 'Current Season')
  const weeksInSeason = seasonNumber && SEASON_WEEKS[seasonNumber] ? SEASON_WEEKS[seasonNumber] : totalWeeks

  // Extract fixtures for the selected week
  const currentFixtures = useMemo(() => {
    if (!pod?.fixtures || !activeWeek) return []
    const mdFix = pod.fixtures.find(f => f.matchday === activeWeek || f.week === activeWeek)
    return mdFix?.matches || []
  }, [pod, activeWeek])

  // Find the user's specific match
  const myMatch = useMemo(() => {
    return currentFixtures.find(m =>
      String(m.homeUserId) === String(userId) || String(m.awayUserId) === String(userId) ||
      String(m.homeUserId?._id) === String(userId) || String(m.awayUserId?._id) === String(userId)
    )
  }, [currentFixtures, userId])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  if (!matchdayData && !pod) {
    return (
      <div className="nflr-page">
        <h2 className="nflr-page-title"><BarChartOutlined /> H2H Matchday</h2>
        <Empty description="No active matchday. Check back when the season starts." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><BarChartOutlined /> H2H Matchday</h2>

      {/* Season progress card */}
      <div style={{
        background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
        borderRadius: 16, padding: 20, marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 800, color: '#A78BFA', marginBottom: 4 }}>
            {seasonLabel}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginLeft: 10 }}>
              ({weeksInSeason} weeks)
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            {season?.status === 'active' && <Tag color="gold"><FireOutlined /> LIVE</Tag>}
            {season?.status === 'completed' && <Tag color="green"><CheckCircleOutlined /> Done</Tag>}
            {pod && (
              <span style={{ marginLeft: 8 }}>
                {pod.divisionName || `Division ${pod.division}`} · Pod #{pod.podNumber}
              </span>
            )}
          </div>
        </div>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Season Progress</span>
            <strong style={{ fontSize: 12, color: '#e2e8f0' }}>{completedCount} / {totalWeeks} Weeks</strong>
          </div>
          <Progress percent={progressPct} strokeColor="#A78BFA" showInfo={false} />
        </div>
      </div>

      {/* Week selector tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {matchdays.map(md => {
          const selected = activeWeek === md.week
          const isActive = md.status === 'active'
          const isCompleted = md.status === 'completed'
          return (
            <button
              key={md.week}
              onClick={() => { setActiveWeek(md.week); setExpandedMatch(null) }}
              style={{
                padding: '8px 16px', borderRadius: 10,
                border: selected ? '1px solid #A78BFA' : '1px solid rgba(100,116,139,0.2)',
                background: selected
                  ? 'rgba(167,139,250,0.15)'
                  : isCompleted ? 'rgba(16,185,129,0.05)' : 'rgba(20,28,45,0.6)',
                color: selected ? '#A78BFA' : isActive ? '#f59e0b' : isCompleted ? '#10b981' : '#64748b',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .2s',
              }}
            >
              Wk {md.week}
              {isActive && <span style={{ fontSize: 8, color: '#f59e0b' }}>● LIVE</span>}
              {isCompleted && <CheckCircleOutlined style={{ fontSize: 12 }} />}
            </button>
          )
        })}
      </div>

      {/* Active week bar */}
      {activeWeek && (() => {
        const md = matchdays.find(m => m.week === activeWeek)
        return md ? (
          <div style={{
            background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
            borderRadius: 14, padding: '12px 20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>
                Week {md.week}
              </span>
              <span style={{ marginLeft: 10 }}>
                {md.status === 'active' && <Tag color="gold"><FireOutlined /> LIVE</Tag>}
                {md.status === 'completed' && <Tag color="green"><CheckCircleOutlined /> Completed</Tag>}
                {md.status === 'pending' && <Tag color="default"><ClockCircleOutlined /> Upcoming</Tag>}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Thu → Mon scoring window
              {md.startDate && <span style={{ marginLeft: 8 }}>{dt(md.startDate)}</span>}
              {md.endDate && <span> — {dt(md.endDate)}</span>}
            </div>
          </div>
        ) : null
      })()}

      {/* Your match highlight */}
      {myMatch && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <FireOutlined style={{ color: '#f59e0b' }} />
            Your Week {activeWeek} Match
          </h3>
          <H2HMatchCard
            match={myMatch}
            userId={userId}
            expanded={expandedMatch === 'my'}
            onClick={() => setExpandedMatch(expandedMatch === 'my' ? null : 'my')}
          />
        </div>
      )}

      {/* All other fixtures */}
      {currentFixtures.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{
            fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: 10,
          }}>
            <SwapOutlined /> All Pod Fixtures
          </h4>
          {currentFixtures.map((fix, idx) => {
            const isMyMatch = String(fix.homeUserId) === String(userId) ||
              String(fix.awayUserId) === String(userId) ||
              String(fix.homeUserId?._id) === String(userId) ||
              String(fix.awayUserId?._id) === String(userId)
            if (isMyMatch) return null

            const key = `fix-${idx}`
            return (
              <H2HMatchCard
                key={key}
                match={fix}
                userId={userId}
                expanded={expandedMatch === key}
                onClick={() => setExpandedMatch(expandedMatch === key ? null : key)}
              />
            )
          })}
        </div>
      )}

      {currentFixtures.length === 0 && activeWeek && (
        <div style={{
          background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
          borderRadius: 12, padding: 40, textAlign: 'center', marginBottom: 20,
        }}>
          <ClockCircleOutlined style={{ fontSize: 24, color: '#64748b', marginBottom: 8 }} />
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            No fixtures scheduled for this week yet.
          </p>
        </div>
      )}

      {/* Pod standings */}
      {pod?.members && <PodStandingsTable members={pod.members} userId={userId} />}

      {/* Season overview - week result cards */}
      {matchdays.length > 0 && (
        <>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: 12, marginTop: 8,
          }}>
            <CrownOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
            Season Overview ({weeksInSeason} weeks)
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(matchdays.length, 5)}, 1fr)`,
            gap: 10,
          }}>
            {matchdays.map((md, idx) => {
              const isActive = md.status === 'active'
              const isCompleted = md.status === 'completed'

              let myResult = null
              if (pod?.fixtures) {
                const mdFix = pod.fixtures.find(f => f.matchday === md.week || f.week === md.week)
                const match = mdFix?.matches?.find(m =>
                  String(m.homeUserId) === String(userId) || String(m.awayUserId) === String(userId) ||
                  String(m.homeUserId?._id) === String(userId) || String(m.awayUserId?._id) === String(userId)
                )
                if (match && match.status === 'completed') {
                  const isHome = String(match.homeUserId) === String(userId) || String(match.homeUserId?._id) === String(userId)
                  const my = isHome ? match.homeScore : match.awayScore
                  const opp = isHome ? match.awayScore : match.homeScore
                  myResult = { my, opp, win: my > opp, draw: my === opp }
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => { setActiveWeek(md.week); setExpandedMatch(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  style={{
                    background: 'rgba(20,28,45,0.6)',
                    border: activeWeek === md.week ? '1px solid #A78BFA' : '1px solid rgba(110,105,128,0.15)',
                    borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color .2s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Wk {md.week}</div>
                  {isActive && <Tag color="gold" style={{ marginBottom: 4 }}>LIVE</Tag>}
                  {isCompleted && <Tag color="green" style={{ marginBottom: 4 }}>Done</Tag>}
                  {md.status === 'pending' && <Tag color="default" style={{ marginBottom: 4 }}>—</Tag>}
                  {myResult && (
                    <div style={{
                      fontSize: 14, fontWeight: 800, marginTop: 4,
                      color: myResult.win ? '#10b981' : myResult.draw ? '#f59e0b' : '#ef4444',
                    }}>
                      {fmt(myResult.my)} — {fmt(myResult.opp)}
                    </div>
                  )}
                  {md.startDate && <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{dt(md.startDate)}</div>}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default MatchdayView
