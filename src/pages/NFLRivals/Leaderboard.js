import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, notification } from 'antd'
import {
  TeamOutlined,
  TrophyOutlined,
  StarFilled,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import rank1Img from '../../assets/rivals/rank-1.png'
import rank2Img from '../../assets/rivals/rank-2.png'
import rank3Img from '../../assets/rivals/rank-3.png'
import lorTrophy from '../../assets/rivals/lor-trophy.png'
import './nfl-rivals.css'
import { DIVISIONS } from './rivalsConfig'

const LIMIT = 50

const Leaderboard = () => {
  const token = useSelector(s => s.user.token)
  const user = useSelector(s => s.user.userDetails || s.user.user)
  const userId = user?._id || user?.id
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [division, setDivision] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { loadLeaderboard() }, [token, division, page]) // eslint-disable-line

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      attachToken()
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (division) params.append('division', division)
      const { data } = await privateAPI.get(`/nfl-rivals/leaderboard?${params}`)
      setEntries(data.data?.entries || [])
      setTotal(data.data?.total || 0)
      setPages(data.data?.pages || 1)
    } catch (err) {
      notification.error({ message: 'Failed to load leaderboard' })
    } finally {
      setLoading(false)
    }
  }

  // ── helpers ──
  const managerName = (e) =>
    e?.user?.userName || e?.user?.username || e?.teamName || 'Unknown'

  const monogram = (name) => {
    const m = (name || '').match(/[a-zA-Z0-9]/)
    return m ? m[0].toUpperCase() : '?'
  }

  const isMe = (e) => userId && String(e?.user?._id) === String(userId)

  const rankOf = (i) => (page - 1) * LIMIT + i + 1

  // Current user's row + absolute rank
  const meIndex = entries.findIndex(isMe)
  const myEntry = meIndex >= 0 ? entries[meIndex] : null
  const myRank = meIndex >= 0 ? (page - 1) * LIMIT + meIndex + 1 : null

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const to = (page - 1) * LIMIT + entries.length

  // Season overview (from me row)
  let seasonOverview = null
  if (myEntry) {
    const cs = myEntry.careerStats || {}
    const w = cs.totalWins || 0
    const d = cs.totalDraws || 0
    const l = cs.totalLosses || 0
    const games = w + d + l
    seasonOverview = {
      seasons: cs.totalSeasons || 0,
      winRate: games ? Math.round((w / games) * 100) : 0,
      w, d, l,
    }
  }

  const rankImg = (rank) =>
    rank === 1 ? rank1Img : rank === 2 ? rank2Img : rank3Img

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  return (
    <div className="nflr-page rvz-lead-page">
      <div className="rvz-lead-wrap">
        {/* ── Header ── */}
        <div className="rvz-lead-header">
          <div className="rvz-lead-head-left">
            <span className="rvz-lead-head-icon"><TeamOutlined /></span>
            <div>
              <h2 className="rvz-lead-title">Leaderboard</h2>
              <div className="rvz-lead-subtitle">
                See how you rank against the best managers across all divisions.
              </div>
            </div>
          </div>
          <select
            className="rvz-lead-select"
            value={division}
            onChange={e => { setDivision(e.target.value); setPage(1) }}
          >
            <option value="">All Divisions</option>
            {Object.entries(DIVISIONS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* ── Main table ── */}
        <div className="rvz-lead-panel">
          {entries.length === 0 ? (
            <div className="rvz-lead-empty">No managers found for this division yet.</div>
          ) : (
            <>
              <div className="rvz-lead-scroll">
                <div className="rvz-lead-table">
                  <div className="rvz-lead-trow rvz-lead-thead">
                    <span className="rvz-lead-c-rank">#</span>
                    <span className="rvz-lead-c-mgr">Manager</span>
                    <span className="rvz-lead-c-div">Division</span>
                    <span className="rvz-lead-c-num">Seasons</span>
                    <span className="rvz-lead-c-wdl">W / D / L</span>
                    <span className="rvz-lead-c-pts">Career Points</span>
                    <span className="rvz-lead-c-tro">Trophies</span>
                  </div>

                  {entries.map((e, i) => {
                    const rank = rankOf(i)
                    const name = managerName(e)
                    const me = isMe(e)
                    const cs = e.careerStats || {}
                    const divName = e.divisionName || DIVISIONS[e.division] || '-'
                    return (
                      <div
                        key={e._id || e.user?._id || i}
                        className={`rvz-lead-trow${me ? ' rvz-lead-trow--me' : ''}`}
                      >
                        <span className="rvz-lead-c-rank">
                          {rank <= 3 ? (
                            <img
                              src={rankImg(rank)}
                              alt={`Rank ${rank}`}
                              className="rvz-lead-rank-img"
                            />
                          ) : (
                            <span className="rvz-lead-rank-n">{rank}</span>
                          )}
                        </span>
                        <span className="rvz-lead-c-mgr">
                          <span className={`rvz-lead-mono${me ? ' rvz-lead-mono--me' : ''}`}>
                            {monogram(name)}
                          </span>
                          <span className="rvz-lead-mgr-name">
                            {name}
                            {me && <StarFilled className="rvz-lead-me-star" />}
                          </span>
                        </span>
                        <span className="rvz-lead-c-div">
                          <span className="rvz-lead-divpill">★ {divName}</span>
                        </span>
                        <span className="rvz-lead-c-num">{cs.totalSeasons || 0}</span>
                        <span className="rvz-lead-c-wdl">
                          <span className="rvz-lead-w">{cs.totalWins || 0}</span>
                          <span className="rvz-lead-sep"> / </span>
                          <span className="rvz-lead-d">{cs.totalDraws || 0}</span>
                          <span className="rvz-lead-sep"> / </span>
                          <span className="rvz-lead-l">{cs.totalLosses || 0}</span>
                        </span>
                        <span className="rvz-lead-c-pts">
                          {(cs.totalPointsAllTime || 0).toFixed(1)}
                        </span>
                        <span className="rvz-lead-c-tro">
                          <span className="rvz-lead-tropill">
                            <TrophyOutlined /> {e.trophies?.length || 0}
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="rvz-lead-foot">
                <span className="rvz-lead-showing">
                  Showing {from} to {to} of {total} managers
                </span>
                <div className="rvz-lead-pager">
                  <button
                    className="rvz-lead-pgbtn"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ‹
                  </button>
                  <span className="rvz-lead-pgnum">{page}</span>
                  <button
                    className="rvz-lead-pgbtn"
                    disabled={page >= pages}
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Bottom cards ── */}
        <div className="rvz-lead-cards">
          {/* Your rank */}
          <div className="rvz-lead-card">
            <div className="rvz-lead-card-label">YOUR RANK</div>
            {myRank >= 1 && myRank <= 3
              ? <img src={rankImg(myRank)} alt="" className="rvz-lead-rank-badge" />
              : <div className="rvz-lead-card-badge">🏅</div>}
            <div className="rvz-lead-card-big">{myRank != null ? myRank : '—'}</div>
            <div className="rvz-lead-card-sub">of {total} managers</div>
          </div>

          {/* Top 3 podium */}
          <div className="rvz-lead-card">
            <div className="rvz-lead-card-label">TOP 3 PODIUM</div>
            <div className="rvz-lead-podium">
              {[1, 0, 2].map((idx) => {
                const e = entries[idx]
                if (!e) return <div key={idx} className="rvz-lead-pod-slot" />
                const rank = idx + 1
                return (
                  <div key={idx} className={`rvz-lead-pod-slot rvz-lead-pod-slot--${rank}`}>
                    <img
                      src={rankImg(rank)}
                      alt={`Rank ${rank}`}
                      className="rvz-lead-podium-img"
                    />
                    <span className="rvz-lead-pod-name">{managerName(e)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Season overview */}
          <div className="rvz-lead-card">
            <div className="rvz-lead-card-label">SEASON OVERVIEW</div>
            {seasonOverview ? (
              <div className="rvz-lead-overview">
                <div className="rvz-lead-ov-row">
                  <span className="rvz-lead-ov-label">Seasons</span>
                  <span className="rvz-lead-ov-val">{seasonOverview.seasons}</span>
                </div>
                <div className="rvz-lead-ov-row">
                  <span className="rvz-lead-ov-label">Win Rate</span>
                  <span className="rvz-lead-ov-val rvz-lead-w">{seasonOverview.winRate}%</span>
                </div>
                <div className="rvz-lead-ov-wdl">
                  <span className="rvz-lead-w">W {seasonOverview.w}</span>
                  <span className="rvz-lead-d">D {seasonOverview.d}</span>
                  <span className="rvz-lead-l">L {seasonOverview.l}</span>
                </div>
              </div>
            ) : (
              <div className="rvz-lead-overview">
                <div className="rvz-lead-ov-row">
                  <span className="rvz-lead-ov-label">Seasons</span>
                  <span className="rvz-lead-ov-val">—</span>
                </div>
                <div className="rvz-lead-ov-row">
                  <span className="rvz-lead-ov-label">Win Rate</span>
                  <span className="rvz-lead-ov-val">—</span>
                </div>
                <div className="rvz-lead-ov-wdl rvz-lead-muted">W — D — L —</div>
              </div>
            )}
          </div>

          {/* Trophy case */}
          <div className="rvz-lead-card">
            <img src={lorTrophy} alt="" className="rvz-lead-trophy-img" />
            <div className="rvz-lead-card-label">TROPHY CASE</div>
            <div className="rvz-lead-card-big">{myEntry?.trophies?.length || 0}</div>
            <div className="rvz-lead-card-sub">Total Trophies</div>
            <div className="rvz-lead-card-note">Keep competing to unlock more</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
