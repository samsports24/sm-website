import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Spin, Empty } from 'antd'
import {
  FireOutlined, TeamOutlined, TrophyOutlined, RiseOutlined,
  ThunderboltOutlined, AimOutlined, CrownOutlined, StarOutlined,
  CalendarOutlined, ArrowDownOutlined, RightOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

const idOf = (ref) => (ref ? (ref._id || ref) : null)

const ordinal = (n) => {
  if (n == null) return '—'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const monogram = (name) => {
  const m = (name || '').match(/[a-zA-Z0-9]/)
  return m ? m[0].toUpperCase() : '?'
}

const memberName = (m) =>
  (m && m.user && (m.user.userName || m.user.username)) ||
  (m && m.entry && m.entry.teamName) ||
  (m && m.username) || 'Manager'

const PodStandings = () => {
  const token = useSelector(s => s.user.token)
  const userId = useSelector(s => s.user.userDetails?._id || s.user.user?._id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [pod, setPod] = useState(null)
  const [podCount, setPodCount] = useState(1)

  useEffect(() => {
    const load = async () => {
      try {
        attachToken()
        const results = await Promise.allSettled([
          privateAPI.get('/nfl-rivals/pod'),
          privateAPI.get('/nfl-rivals/leaderboard'),
        ])
        let loadedPod = null
        if (results[0].status === 'fulfilled') {
          loadedPod = results[0].value.data.data?.pod || null
          setPod(loadedPod)
        }
        if (results[1].status === 'fulfilled') {
          const lb = results[1].value.data.data || {}
          const total = lb.total || (Array.isArray(lb.entries) ? lb.entries.length : 0)
          const size = (loadedPod && loadedPod.members && loadedPod.members.length) || 0
          if (total && size) setPodCount(Math.max(1, Math.ceil(total / size)))
        }
      } catch (err) { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  if (!pod) {
    return (
      <div className="nflr-page npod-root">
        <Empty description="No pod assigned yet. Build your roster to get placed." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  // ── members (defensive sort: wins desc, then totalPoints desc) ──
  const members = (pod.members || []).slice().sort(
    (a, b) => (b.wins || 0) - (a.wins || 0) || (b.totalPoints || 0) - (a.totalPoints || 0)
  )
  const fixtures = pod.fixtures || []
  const isMe = (m) => userId && idOf(m.user) && String(idOf(m.user)) === String(userId)

  // ── per-member derived stats from fixtures (PA + last-5 results) ──
  const memberFx = {}
  members.forEach(m => { memberFx[String(idOf(m.user))] = { pa: 0, results: [], completed: 0 } })
  const sortedFixtures = fixtures.slice().sort((a, b) => (a.week || a.matchday || 0) - (b.week || b.matchday || 0))
  const completedActivity = []
  sortedFixtures.forEach(fx => {
    ;(fx.matches || []).forEach(mt => {
      const h = String(idOf(mt.homeUserId))
      const a = String(idOf(mt.awayUserId))
      const done = mt.status === 'completed' && (mt.homeScore != null || mt.awayScore != null)
      if (!done) return
      const hs = mt.homeScore || 0
      const as = mt.awayScore || 0
      if (memberFx[h]) {
        memberFx[h].pa += as
        memberFx[h].completed += 1
        memberFx[h].results.push(hs > as ? 'W' : hs < as ? 'L' : 'D')
      }
      if (memberFx[a]) {
        memberFx[a].pa += hs
        memberFx[a].completed += 1
        memberFx[a].results.push(as > hs ? 'W' : as < hs ? 'L' : 'D')
      }
      completedActivity.push({ week: fx.week || fx.matchday, home: h, away: a, hs, as })
    })
  })

  const nameById = {}
  members.forEach(m => { nameById[String(idOf(m.user))] = memberName(m) })

  // ── current user + rank ──
  const myIndex = members.findIndex(isMe)
  const myMember = myIndex >= 0 ? members[myIndex] : null
  const myRank = myIndex >= 0 ? myIndex + 1 : null

  const gamesOf = (m) => (m.wins || 0) + (m.draws || 0) + (m.losses || 0)
  const anyGames = members.some(m => gamesOf(m) > 0)
  const anyPoints = members.some(m => (m.totalPoints || 0) > 0 || (m.wins || 0) > 0)

  // ── stat bar values ──
  const myGames = myMember ? gamesOf(myMember) : 0
  const myAvg = myMember ? ((myMember.totalPoints || 0) / Math.max(1, myGames)) : 0
  const myWins = myMember ? (myMember.wins || 0) : 0

  // ── matchday score data for chart ──
  const hasScores = myMember && Array.isArray(myMember.matchdayScores) && myMember.matchdayScores.length > 0
  const yourScores = hasScores ? myMember.matchdayScores.slice(0, 12) : []
  const weekCount = yourScores.length
  const leagueAvg = []
  for (let i = 0; i < weekCount; i++) {
    let sum = 0; let cnt = 0
    members.forEach(m => {
      const arr = m.matchdayScores
      if (Array.isArray(arr) && arr[i] != null) { sum += arr[i]; cnt += 1 }
    })
    leagueAvg.push(cnt ? sum / cnt : 0)
  }

  // ── chart geometry ──
  const CW = 640; const CH = 240; const PL = 40; const PR = 20; const PT = 12; const PB = 30
  const plotW = CW - PL - PR
  const plotH = CH - PT - PB
  const yFor = (v) => PT + plotH - (Math.min(100, Math.max(0, v)) / 100) * plotH
  const xFor = (i) => weekCount <= 1 ? PL + plotW / 2 : PL + (i / (weekCount - 1)) * plotW
  const toPoints = (arr) => arr.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ')

  // ── points leader / top scorers ──
  const leader = anyPoints ? members[0] : null
  const topScorers = members.slice(0, 3)

  // ── recent activity (most recent completed matches) ──
  const recent = completedActivity.slice().reverse().slice(0, 4)

  const last5Dot = (r) =>
    r === 'W' ? '#4ADE80' : r === 'L' ? '#EF4444' : '#8b93a7'

  return (
    <div className="nflr-page npod-root">
      {/* ══ HEADER ══ */}
      <div className="npod-header">
        <div className="npod-head-left">
          <span className="npod-head-icon"><FireOutlined /></span>
          <div>
            <h2 className="npod-title">Pod Standings</h2>
            <div className="npod-subtitle">
              Pod {pod.podNumber} • {members.length} manager{members.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
        <div className="npod-head-right">
          <select className="npod-select" value={pod.podNumber} onChange={() => {}}>
            <option value={pod.podNumber}>Pod {pod.podNumber}</option>
          </select>
          <button className="npod-viewall-btn" onClick={() => navigate('/nfl-rivals/leaderboard')}>
            <TeamOutlined /> View All Pods
          </button>
        </div>
      </div>

      {/* ══ STATS BAR ══ */}
      <div className="npod-stats">
        <div className="npod-stat-card">
          <span className="npod-stat-icon"><TrophyOutlined /></span>
          <div className="npod-stat-value">{myRank ? ordinal(myRank) : '—'}</div>
          <div className="npod-stat-label">Pod Status</div>
          <div className="npod-stat-sub">Out of {podCount} pod{podCount === 1 ? '' : 's'}</div>
        </div>
        <div className="npod-stat-card">
          <span className="npod-stat-icon"><RiseOutlined /></span>
          <div className="npod-stat-value">{myAvg.toFixed(1)}</div>
          <div className="npod-stat-label">Points Average</div>
          <div className="npod-stat-sub">League Average</div>
        </div>
        <div className="npod-stat-card">
          <span className="npod-stat-icon"><ThunderboltOutlined /></span>
          <div className="npod-stat-value">{myWins}</div>
          <div className="npod-stat-label">Total Weeks Won</div>
          <div className="npod-stat-sub">Best Streak: 0</div>
        </div>
        <div className="npod-stat-card">
          <span className="npod-stat-icon"><AimOutlined /></span>
          <div className="npod-stat-value">0%</div>
          <div className="npod-stat-label">Playoff Odds</div>
          <div className="npod-stat-sub">Current Projection</div>
        </div>
      </div>

      {/* ══ BODY (main + rail) ══ */}
      <div className="npod-body">
        <div className="npod-main">
          {/* ── STANDINGS TABLE ── */}
          <div className="npod-panel">
            <div className="npod-panel-head">
              <span className="npod-panel-title"><TrophyOutlined /> Standings</span>
            </div>
            <div className="npod-table-wrap">
              <div className="npod-table">
                <div className="npod-trow npod-thead">
                  <span className="npod-c-rank">#</span>
                  <span className="npod-c-mgr">Manager</span>
                  <span className="npod-c-num">W</span>
                  <span className="npod-c-num">D</span>
                  <span className="npod-c-num">L</span>
                  <span className="npod-c-num">PF</span>
                  <span className="npod-c-num">PA</span>
                  <span className="npod-c-num">Diff</span>
                  <span className="npod-c-num">Points</span>
                  <span className="npod-c-last">Last 5</span>
                </div>
                {members.map((m, idx) => {
                  const me = isMe(m)
                  const fx = memberFx[String(idOf(m.user))] || { pa: 0, results: [] }
                  const pf = m.totalPoints || 0
                  const pa = fx.pa || 0
                  const diff = pf - pa
                  const points = (m.wins || 0) * 3 + (m.draws || 0)
                  const promo = idx < 3
                  const rele = idx >= members.length - 3 && members.length > 3
                  const last5 = fx.results.slice(-5)
                  return (
                    <div
                      key={idOf(m.user) || idx}
                      className={`npod-trow${me ? ' npod-trow--me' : ''}${promo ? ' npod-promo' : ''}${rele ? ' npod-rele' : ''}`}
                    >
                      <span className="npod-c-rank">{idx + 1}</span>
                      <span className="npod-c-mgr">
                        {m.user && m.user.image
                          ? <img className="npod-avatar" src={m.user.image} alt="" />
                          : <span className="npod-avatar npod-avatar--mono">{monogram(memberName(m))}</span>}
                        <span className="npod-mgr-name">{memberName(m)}</span>
                        {me && <span className="npod-you">YOU</span>}
                      </span>
                      <span className="npod-c-num npod-w">{m.wins || 0}</span>
                      <span className="npod-c-num npod-d">{m.draws || 0}</span>
                      <span className="npod-c-num npod-l">{m.losses || 0}</span>
                      <span className="npod-c-num">{pf.toFixed(1)}</span>
                      <span className="npod-c-num">{pa.toFixed(1)}</span>
                      <span className="npod-c-num npod-diff">{diff >= 0 ? '+' : ''}{diff.toFixed(1)}</span>
                      <span className="npod-c-num npod-points">{points}</span>
                      <span className="npod-c-last">
                        {(last5.length ? last5 : ['', '', '', '', '']).map((r, i) => (
                          <span
                            key={i}
                            className="npod-dot"
                            style={{ background: r ? last5Dot(r) : 'rgba(255,255,255,0.12)' }}
                          />
                        ))}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="npod-legend">
              <span><span className="npod-legend-sq" style={{ background: '#4ADE80' }} /> Promotion zone (top 3)</span>
              <span><span className="npod-legend-sq" style={{ background: '#EF4444' }} /> Relegation zone (bottom 3)</span>
            </div>
          </div>

          {/* ── LOWER TWO COLUMN ── */}
          <div className="npod-lower">
            {/* Points Breakdown */}
            <div className="npod-panel">
              <div className="npod-panel-head">
                <span className="npod-panel-title"><RiseOutlined /> Points Breakdown</span>
              </div>
              {hasScores ? (
                <>
                  <div className="npod-chart-wrap">
                    <svg viewBox={`0 0 ${CW} ${CH}`} className="npod-chart" preserveAspectRatio="none">
                      {[0, 25, 50, 75, 100].map(v => (
                        <g key={v}>
                          <line x1={PL} y1={yFor(v)} x2={CW - PR} y2={yFor(v)} stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
                          <text x={PL - 8} y={yFor(v) + 4} textAnchor="end" className="npod-axis-txt">{v}</text>
                        </g>
                      ))}
                      {yourScores.map((v, i) => (
                        <text key={i} x={xFor(i)} y={CH - 8} textAnchor="middle" className="npod-axis-txt">W{i + 1}</text>
                      ))}
                      <polyline fill="none" stroke="#8b93a7" strokeWidth="2" points={toPoints(leagueAvg)} />
                      <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" points={toPoints(yourScores)} />
                      {yourScores.map((v, i) => (
                        <circle key={i} cx={xFor(i)} cy={yFor(v)} r="3" fill="#A78BFA" />
                      ))}
                    </svg>
                  </div>
                  <div className="npod-chart-legend">
                    <span><span className="npod-dot" style={{ background: '#8B5CF6' }} /> Your Team</span>
                    <span><span className="npod-dot" style={{ background: '#8b93a7' }} /> League Average</span>
                  </div>
                </>
              ) : (
                <div className="npod-empty">
                  <CalendarOutlined className="npod-empty-icon" />
                  <div className="npod-empty-title">No data yet</div>
                  <div className="npod-empty-text">Points breakdown will appear after the first matchday.</div>
                  <div className="npod-chart-legend">
                    <span><span className="npod-dot" style={{ background: '#8B5CF6' }} /> Your Team</span>
                    <span><span className="npod-dot" style={{ background: '#8b93a7' }} /> League Average</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pod Insights */}
            <div className="npod-panel">
              <div className="npod-panel-head">
                <span className="npod-panel-title"><ThunderboltOutlined /> Pod Insights</span>
              </div>
              <div className="npod-insight-list">
                {[
                  { icon: <RiseOutlined />, label: 'Strongest Position' },
                  { icon: <ArrowDownOutlined />, label: 'Needs Improvement' },
                  { icon: <ThunderboltOutlined />, label: 'Biggest Threat' },
                ].map(row => (
                  <div key={row.label} className="npod-insight-row">
                    <span className="npod-insight-icon">{row.icon}</span>
                    <div className="npod-insight-body">
                      <div className="npod-insight-label">{row.label}</div>
                      <div className="npod-insight-sub">Not enough data</div>
                    </div>
                    <span className="npod-insight-val">—</span>
                    <RightOutlined className="npod-insight-chev" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SEASON NOT STARTED BANNER ── */}
          {!anyGames && (
            <div className="npod-banner">
              <CalendarOutlined className="npod-banner-icon" />
              <div>
                <div className="npod-banner-title">Season hasn&apos;t started yet</div>
                <div className="npod-banner-text">Standings will update after the first matchday.</div>
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT RAIL ══ */}
        <div className="npod-rail">
          {/* Points Leader */}
          <div className="npod-panel">
            <div className="npod-panel-head">
              <span className="npod-panel-title"><CrownOutlined /> Points Leader</span>
            </div>
            <div className="npod-leader">
              <div className="npod-ring">
                <span className="npod-ring-val">{leader ? Math.round(leader.totalPoints || 0) : '—'}</span>
              </div>
              {leader ? (
                <>
                  <div className="npod-leader-name">{memberName(leader)}</div>
                  <div className="npod-leader-sub">{(leader.totalPoints || 0).toFixed(1)} pts</div>
                </>
              ) : (
                <>
                  <div className="npod-leader-name">No data yet</div>
                  <div className="npod-leader-sub">Be the first to take the lead!</div>
                </>
              )}
            </div>
          </div>

          {/* Top Scorers */}
          <div className="npod-panel">
            <div className="npod-panel-head">
              <span className="npod-panel-title"><StarOutlined /> Top Scorers</span>
              <button className="npod-panel-link" onClick={() => navigate('/nfl-rivals/leaderboard')}>View All</button>
            </div>
            {anyPoints ? (
              <div className="npod-scorer-list">
                {topScorers.map((m, i) => (
                  <div key={idOf(m.user) || i} className="npod-scorer-row">
                    <span className="npod-scorer-rank">{['🥇', '🥈', '🥉'][i] || i + 1}</span>
                    <span className="npod-scorer-name">{memberName(m)}</span>
                    <span className="npod-scorer-pts">{(m.totalPoints || 0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="npod-empty npod-empty--sm">
                <span className="npod-empty-medal">🏅</span>
                <div className="npod-empty-title">No data yet</div>
                <div className="npod-empty-text">Top scorers will appear after the first matchday.</div>
              </div>
            )}
          </div>

          {/* Recent Pod Activity */}
          <div className="npod-panel">
            <div className="npod-panel-head">
              <span className="npod-panel-title"><ThunderboltOutlined /> Recent Pod Activity</span>
            </div>
            {recent.length ? (
              <div className="npod-activity-list">
                {recent.map((r, i) => {
                  const winner = r.hs === r.as ? null : (r.hs > r.as ? r.home : r.away)
                  const loser = winner === r.home ? r.away : r.home
                  return (
                    <div key={i} className="npod-activity-row">
                      <span className="npod-activity-dot" />
                      <span className="npod-activity-txt">
                        {winner
                          ? <>{nameById[winner] || 'Manager'} def. {nameById[loser] || 'Manager'}</>
                          : <>{nameById[r.home] || 'Manager'} drew {nameById[r.away] || 'Manager'}</>}
                        <span className="npod-activity-score"> {r.hs}–{r.as} · W{r.week}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="npod-empty npod-empty--sm">
                <div className="npod-empty-title">No recent activity</div>
                <div className="npod-empty-text">Pod activity will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PodStandings
