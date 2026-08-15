import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Spin, Empty } from 'antd'
import {
  BarChartOutlined, TrophyOutlined, CalendarOutlined, CrownOutlined,
  BulbOutlined, RightOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

/* ── Helpers ── */
const idOf = (ref) => (ref ? (ref._id || ref) : null)

const monogram = (name) => {
  const m = (name || '').match(/[a-zA-Z0-9]/)
  return m ? m[0].toUpperCase() : '?'
}

const memberName = (m) =>
  (m && m.user && (m.user.userName || m.user.username)) ||
  (m && m.entry && m.entry.teamName) ||
  (m && m.username) || 'Manager'

const fmtCountdown = (deadline, now) => {
  if (!deadline) return '—'
  const diff = new Date(deadline).getTime() - now
  if (isNaN(diff)) return '—'
  if (diff <= 0) return '0d 0h 0m'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${d}d ${h}h ${m}m`
}

/* ═══════════════════════════════════════════════════
   H2H MATCHDAY VIEW
   ═══════════════════════════════════════════════════ */
const MatchdayView = () => {
  const token = useSelector(s => s.user.token)
  const userId = useSelector(s => s.user.userDetails?._id || s.user.user?._id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [matchdayData, setMatchdayData] = useState(null)
  const [pod, setPod] = useState(null)
  const [season, setSeason] = useState(null)
  const [tab, setTab] = useState('current')
  const [now, setNow] = useState(Date.now())

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
        setMatchdayData(weekData)
        setPod(podData)
        setSeason(weekData?.season || null)
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  // Live countdown ticker (cleared on unmount)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  if (!matchdayData && !pod) {
    return (
      <div className="nflr-page nmd-root">
        <h2 className="nflr-page-title"><BarChartOutlined /> H2H Matchday</h2>
        <Empty description="No active matchday. Check back when the season starts." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  /* ── Derivations ── */
  const matchdays = matchdayData?.matchdays || []
  const totalWeeks = matchdays.length || season?.weekCount || 5
  const completedCount = matchdays.filter(m => m.status === 'completed').length
  const progressPct = totalWeeks > 0 ? Math.min(100, (completedCount / totalWeeks) * 100) : 0

  const currentWeek = matchdayData?.activeWeek?.week
    || (completedCount < totalWeeks ? completedCount + 1 : totalWeeks)

  // members sorted by standings (defensive)
  const members = (pod?.members || []).slice().sort(
    (a, b) => (b.wins || 0) - (a.wins || 0) || (b.totalPoints || 0) - (a.totalPoints || 0)
  )
  const isMe = (m) => userId && idOf(m.user) && String(idOf(m.user)) === String(userId)
  const myMember = members.find(isMe) || null

  const myWins = myMember ? (myMember.wins || 0) : 0
  const myDraws = myMember ? (myMember.draws || 0) : 0
  const myLosses = myMember ? (myMember.losses || 0) : 0
  const myGames = myWins + myDraws + myLosses
  const recordPts = myWins * 3 + myDraws
  const pointsFor = myMember ? (myMember.totalPoints || 0) : 0

  // Points Against = sum of opponent scores from the current user's completed fixtures
  let pointsAgainst = 0
  ;(pod?.fixtures || []).forEach(fx => {
    ;(fx.matches || []).forEach(mt => {
      const done = mt.status === 'completed' && (mt.homeScore != null || mt.awayScore != null)
      if (!done) return
      const h = String(idOf(mt.homeUserId))
      const a = String(idOf(mt.awayUserId))
      if (userId && h === String(userId)) pointsAgainst += (mt.awayScore || 0)
      if (userId && a === String(userId)) pointsAgainst += (mt.homeScore || 0)
    })
  })

  const winRate = myGames > 0 ? (myWins / myGames) * 100 : 0
  const avgFor = myGames > 0 ? pointsFor / myGames : 0
  const avgAgainst = myGames > 0 ? pointsAgainst / myGames : 0

  // Points leader
  const anyPoints = members.some(m => (m.totalPoints || 0) > 0)
  const leader = anyPoints
    ? members.slice().sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))[0]
    : (myMember || members[0] || null)

  // Upcoming matchday + deadline
  const upcoming = matchdays.find(m => m.status === 'active')
    || matchdays.find(m => m.status === 'pending')
    || matchdays[matchdays.length - 1]
    || null
  const nextWeek = upcoming?.week || currentWeek
  const deadline = matchdayData?.activeWeek?.deadline
    || upcoming?.deadline || upcoming?.endDate || upcoming?.startDate || null

  // Division label
  const divisionName = (pod?.divisionName || (pod?.division ? `Division ${pod.division}` : 'Division'))
  const podNumber = pod?.podNumber != null ? pod.podNumber : '—'

  // Matchday performance chart
  const hasScores = myMember && Array.isArray(myMember.matchdayScores) && myMember.matchdayScores.length > 0
  const yourScores = hasScores ? myMember.matchdayScores.slice(0, totalWeeks) : []
  const scoreLen = yourScores.length
  const leagueAvg = []
  for (let i = 0; i < scoreLen; i++) {
    let sum = 0; let cnt = 0
    members.forEach(m => {
      const arr = m.matchdayScores
      if (Array.isArray(arr) && arr[i] != null) { sum += arr[i]; cnt += 1 }
    })
    leagueAvg.push(cnt ? sum / cnt : 0)
  }

  const nPts = Math.max(1, totalWeeks)
  const CW = 640; const CH = 240; const PL = 40; const PR = 20; const PT = 12; const PB = 30
  const plotW = CW - PL - PR
  const plotH = CH - PT - PB
  const yFor = (v) => PT + plotH - (Math.min(100, Math.max(0, v)) / 100) * plotH
  const xFor = (i) => nPts <= 1 ? PL + plotW / 2 : PL + (i / (nPts - 1)) * plotW
  const toPoints = (arr) => arr.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ')

  // History: completed fixtures
  const historyFixtures = (pod?.fixtures || [])
    .slice()
    .sort((a, b) => (a.week || a.matchday || 0) - (b.week || b.matchday || 0))
    .map(fx => ({
      week: fx.week || fx.matchday,
      matches: (fx.matches || []).filter(mt => mt.status === 'completed'),
    }))
    .filter(fx => fx.matches.length > 0)

  const nameById = {}
  members.forEach(m => { nameById[String(idOf(m.user))] = memberName(m) })

  return (
    <div className="nflr-page nmd-root">
      {/* ══ HEADER ══ */}
      <div className="nmd-header">
        <div className="nmd-head-left">
          <span className="nmd-head-icon"><BarChartOutlined /></span>
          <h2 className="nmd-title">H2H Matchday</h2>
        </div>
        <div className="nmd-head-right">
          <select className="nmd-select" value={podNumber} onChange={() => {}}>
            <option value={podNumber}>{divisionName} - Pod {podNumber}</option>
          </select>
          <button className="nmd-icon-btn" title="Calendar" onClick={() => setTab('history')}>
            <CalendarOutlined />
          </button>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="nmd-tabs">
        <button
          className={`nmd-tab${tab === 'current' ? ' nmd-tab--active' : ''}`}
          onClick={() => setTab('current')}
        >
          Current Matchday
        </button>
        <button
          className={`nmd-tab${tab === 'history' ? ' nmd-tab--active' : ''}`}
          onClick={() => setTab('history')}
        >
          Matchday History
        </button>
      </div>

      {tab === 'history' ? (
        /* ══ HISTORY ══ */
        <div className="nmd-panel">
          <div className="nmd-panel-head">
            <span className="nmd-panel-title"><CalendarOutlined /> Matchday History</span>
          </div>
          {historyFixtures.length ? (
            <div className="nmd-history-list">
              {historyFixtures.map(fx => (
                <div key={fx.week} className="nmd-history-week">
                  <div className="nmd-history-week-title">Matchday {fx.week}</div>
                  {fx.matches.map((mt, i) => {
                    const h = String(idOf(mt.homeUserId))
                    const a = String(idOf(mt.awayUserId))
                    return (
                      <div key={i} className="nmd-history-row">
                        <span className="nmd-history-name">{nameById[h] || 'Manager'}</span>
                        <span className="nmd-history-score">{(mt.homeScore || 0).toFixed(1)} – {(mt.awayScore || 0).toFixed(1)}</span>
                        <span className="nmd-history-name nmd-history-name--r">{nameById[a] || 'Manager'}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="nmd-empty">
              <CalendarOutlined className="nmd-empty-icon" />
              <div className="nmd-empty-title">No completed matchdays yet</div>
              <div className="nmd-empty-text">History will appear after the first matchday is played.</div>
            </div>
          )}
        </div>
      ) : (
        /* ══ CURRENT MATCHDAY ══ */
        <div className="nmd-body">
          <div className="nmd-main">
            {/* ── CURRENT SEASON CARD ── */}
            <div className="nmd-panel nmd-season">
              <div className="nmd-season-head">
                <div className="nmd-season-title">
                  Current Season <span className="nmd-season-weeks">({totalWeeks} weeks)</span>
                </div>
                <div className="nmd-season-sub">{divisionName.toUpperCase()} - POD {podNumber}</div>
              </div>

              <div className="nmd-season-stats">
                <div className="nmd-scell">
                  <div className="nmd-scell-label">Matchdays</div>
                  <div className="nmd-scell-val">{currentWeek} / {totalWeeks}</div>
                </div>
                <div className="nmd-scell">
                  <div className="nmd-scell-label">Your Record</div>
                  <div className="nmd-scell-val">{myWins} - {myDraws} - {myLosses}</div>
                  <div className="nmd-scell-sub">({recordPts} pts)</div>
                </div>
                <div className="nmd-scell">
                  <div className="nmd-scell-label">Points For</div>
                  <div className="nmd-scell-val nmd-green">{pointsFor.toFixed(1)}</div>
                </div>
                <div className="nmd-scell">
                  <div className="nmd-scell-label">Points Against</div>
                  <div className="nmd-scell-val nmd-red">{pointsAgainst.toFixed(1)}</div>
                </div>
              </div>

              <div className="nmd-progress">
                <div className="nmd-progress-top">
                  <span>Season Progress</span>
                  <strong>{completedCount} / {totalWeeks} Weeks</strong>
                </div>
                <div className="nmd-progress-track">
                  <div className="nmd-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* ── POD STANDINGS ── */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><TrophyOutlined /> Pod Standings</span>
              </div>
              <div className="nmd-table-wrap">
                <div className="nmd-table">
                  <div className="nmd-trow nmd-thead">
                    <span className="nmd-c-rank">#</span>
                    <span className="nmd-c-mgr">Manager</span>
                    <span className="nmd-c-num">W</span>
                    <span className="nmd-c-num">D</span>
                    <span className="nmd-c-num">L</span>
                    <span className="nmd-c-num">Pts</span>
                    <span className="nmd-c-num">Total Score</span>
                  </div>
                  {members.map((m, idx) => {
                    const me = isMe(m)
                    const promo = idx < 3
                    const rele = idx >= members.length - 3 && members.length > 3
                    const pts = (m.wins || 0) * 3 + (m.draws || 0)
                    return (
                      <div
                        key={idOf(m.user) || idx}
                        className={`nmd-trow${me ? ' nmd-trow--me' : ''}${promo ? ' nmd-promo' : ''}${rele ? ' nmd-rele' : ''}`}
                      >
                        <span className="nmd-c-rank">
                          {promo && <ArrowUpOutlined className="nmd-rank-ico nmd-green" />}
                          {rele && <ArrowDownOutlined className="nmd-rank-ico nmd-red" />}
                          {idx + 1}
                        </span>
                        <span className="nmd-c-mgr">
                          {m.user && m.user.image
                            ? <img className="nmd-avatar" src={m.user.image} alt="" />
                            : <span className="nmd-avatar nmd-avatar--mono">{monogram(memberName(m))}</span>}
                          <span className="nmd-mgr-name">{memberName(m)}</span>
                          {me && <span className="nmd-you">YOU</span>}
                        </span>
                        <span className="nmd-c-num nmd-w">{m.wins || 0}</span>
                        <span className="nmd-c-num nmd-d">{m.draws || 0}</span>
                        <span className="nmd-c-num nmd-l">{m.losses || 0}</span>
                        <span className="nmd-c-num nmd-points">{pts}</span>
                        <span className="nmd-c-num">{(m.totalPoints || 0).toFixed(1)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="nmd-legend">
                <span><span className="nmd-legend-sq" style={{ background: '#4ADE80' }} /> Promotion zone (top 3)</span>
                <span><span className="nmd-legend-sq" style={{ background: '#EF4444' }} /> Relegation zone (bottom 3)</span>
              </div>
            </div>

            {/* ── MATCHDAY PERFORMANCE ── */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><BarChartOutlined /> Matchday Performance</span>
              </div>
              {hasScores ? (
                <>
                  <div className="nmd-chart-wrap">
                    <svg viewBox={`0 0 ${CW} ${CH}`} className="nmd-chart" preserveAspectRatio="none">
                      {[0, 25, 50, 75, 100].map(v => (
                        <g key={v}>
                          <line x1={PL} y1={yFor(v)} x2={CW - PR} y2={yFor(v)} stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
                          <text x={PL - 8} y={yFor(v) + 4} textAnchor="end" className="nmd-axis-txt">{v}</text>
                        </g>
                      ))}
                      {Array.from({ length: nPts }).map((_, i) => (
                        <text key={i} x={xFor(i)} y={CH - 8} textAnchor="middle" className="nmd-axis-txt">MD{i + 1}</text>
                      ))}
                      <polyline fill="none" stroke="#8b93a7" strokeWidth="2" points={toPoints(leagueAvg)} />
                      <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" points={toPoints(yourScores)} />
                      {yourScores.map((v, i) => (
                        <circle key={i} cx={xFor(i)} cy={yFor(v)} r="3.5" fill="#A78BFA" />
                      ))}
                    </svg>
                  </div>
                  <div className="nmd-chart-legend">
                    <span><span className="nmd-dot" style={{ background: '#8B5CF6' }} /> Your Score</span>
                    <span><span className="nmd-dot" style={{ background: '#8b93a7' }} /> League Average</span>
                  </div>
                </>
              ) : (
                <div className="nmd-empty">
                  <CalendarOutlined className="nmd-empty-icon" />
                  <div className="nmd-empty-title">No performance data yet</div>
                  <div className="nmd-empty-text">Data will appear after the first matchday.</div>
                  <div className="nmd-chart-legend">
                    <span><span className="nmd-dot" style={{ background: '#8B5CF6' }} /> Your Score</span>
                    <span><span className="nmd-dot" style={{ background: '#8b93a7' }} /> League Average</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ RIGHT RAIL ══ */}
          <div className="nmd-rail">
            {/* Pod Insights */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><BarChartOutlined /> Pod Insights</span>
              </div>
              <div className="nmd-insights">
                <div className="nmd-winring">
                  <div className="nmd-ring">
                    <span className="nmd-ring-val">{Math.round(winRate)}%</span>
                  </div>
                  <div className="nmd-ring-label">Win Rate</div>
                </div>
                <div className="nmd-insight-rows">
                  <div className="nmd-insight-row">
                    <span className="nmd-insight-label">Avg. Points For</span>
                    <span className="nmd-insight-val nmd-green">{avgFor.toFixed(1)}</span>
                  </div>
                  <div className="nmd-insight-row">
                    <span className="nmd-insight-label">Avg. Points Against</span>
                    <span className="nmd-insight-val nmd-red">{avgAgainst.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Points Leader */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><CrownOutlined /> Points Leader</span>
              </div>
              <div className="nmd-leader">
                {leader && leader.user && leader.user.image
                  ? <img className="nmd-leader-av" src={leader.user.image} alt="" />
                  : <span className="nmd-leader-av nmd-avatar--mono">{monogram(memberName(leader))}</span>}
                <div className="nmd-leader-body">
                  <div className="nmd-leader-name">{leader ? memberName(leader) : '—'}</div>
                  <div className="nmd-leader-pts">{(leader ? (leader.totalPoints || 0) : 0).toFixed(1)} PTS</div>
                </div>
              </div>
            </div>

            {/* Upcoming Matchday */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><CalendarOutlined /> Upcoming Matchday</span>
              </div>
              <div className="nmd-upcoming">
                <div className="nmd-upcoming-week">Matchday {nextWeek}</div>
                <div className="nmd-upcoming-label">Starts in</div>
                <div className="nmd-countdown">{fmtCountdown(deadline, now)}</div>
                <button className="nmd-cta" onClick={() => navigate('/nfl-rivals/pod')}>
                  View Fixtures
                </button>
              </div>
            </div>

            {/* Matchday Tips */}
            <div className="nmd-panel">
              <div className="nmd-panel-head">
                <span className="nmd-panel-title"><BulbOutlined /> Matchday Tips</span>
              </div>
              <button className="nmd-tip-row" onClick={() => navigate('/nfl-rivals/squad')}>
                <span className="nmd-tip-icon"><BarChartOutlined /></span>
                <span className="nmd-tip-text">Check your lineup and make sure all players are starting</span>
                <RightOutlined className="nmd-tip-chev" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchdayView
