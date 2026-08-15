import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Spin, notification } from 'antd'
import { TrophyOutlined, BarChartOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import './nfl-rivals.css'

const DIVISIONS = {
  1: 'GRIDIRON LEGENDS', 2: 'IRON CURTAIN', 3: 'BLITZ DIVISION', 4: 'ROOKIE LEAGUE',
}

const TROPHY_DEFS = [
  { type: 'gridiron_elite', label: 'Gridiron Elite', icon: '👑', desc: 'Reached Division 1 — the top of NFL RIVALS', rarity: 'Legendary', rarityColor: '#ffd700' },
  { type: 'the_invincible', label: 'The Invincible', icon: '🛡️', desc: 'Unbeaten across an entire season', rarity: 'Epic', rarityColor: '#a855f7' },
  { type: 'giant_killer', label: 'Giant Killer', icon: '⚔️', desc: 'Beat a team from a higher division', rarity: 'Rare', rarityColor: '#3b82f6' },
  { type: 'wonderkid_whisperer', label: 'Scout Master', icon: '🌟', desc: 'Had 5+ rookies score big', rarity: 'Rare', rarityColor: '#3b82f6' },
  { type: 'division_trophy', label: 'Division Champion', icon: '🏆', desc: 'Finish Top 3 in your pod to earn promotion', rarity: 'Common', rarityColor: '#4ade80' },
]

const TROPHY_BY_TYPE = TROPHY_DEFS.reduce((acc, d) => { acc[d.type] = d; return acc }, {})

const fmtDate = (d) => (
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
)

const TrophyCabinet = () => {
  const token = useSelector(s => s.user.token)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [seasonSummary, setSeasonSummary] = useState(null)
  const [nextReward, setNextReward] = useState(null)
  const [recentlyUnlocked, setRecentlyUnlocked] = useState([])
  const [showAllTimeline, setShowAllTimeline] = useState(false)
  const carouselRef = useRef(null)

  useEffect(() => { loadTrophies() }, [token]) // eslint-disable-line

  const loadTrophies = async () => {
    try {
      setLoading(true)
      attachToken()
      const { data: res } = await privateAPI.get('/nfl-rivals/trophies')
      const payload = res.data || {}
      setData(payload)
      setSeasonSummary(payload.seasonSummary || null)
      setNextReward(payload.nextReward || null)
      setRecentlyUnlocked(payload.recentlyUnlocked || [])
    } catch (err) {
      const status = err.response?.status
      if (status !== 401 && status !== 404) {
        notification.error({ message: 'Failed to load trophies' })
      }
    } finally {
      setLoading(false)
    }
  }

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const trophies = data.trophies || []
  const stats = data.careerStats || {}
  const totalMatches = (stats.totalWins || 0) + (stats.totalDraws || 0) + (stats.totalLosses || 0)
  const winRate = totalMatches > 0 ? ((stats.totalWins / totalMatches) * 100).toFixed(0) : 0

  // Timeline — newest first, so the first item is the freshest achievement.
  const sortedTrophies = trophies
    .slice()
    .sort((a, b) => new Date(b.earnedAt || 0) - new Date(a.earnedAt || 0))
  const timelineItems = showAllTimeline ? sortedTrophies : sortedTrophies.slice(0, 4)

  // Season summary values (fall back to em-dash when unknown)
  const ss = seasonSummary || {}
  const dash = '—'

  return (
    <div className="nflr-page rvz-tc-page">
      <div className="rvz-tc-inner">
        <div className="rvz-tc-head">
          <h2 className="nflr-page-title"><TrophyOutlined /> Trophy Cabinet</h2>
          <p className="rvz-tc-subtitle">Collect trophies, unlock rewards, and showcase your achievements.</p>
        </div>

        <div className="rvz-tc-layout">
          {/* ═══ MAIN COLUMN ═══ */}
          <div className="rvz-tc-main">
            {/* ── Hero Stats Bar ── */}
            <div className="tc-stats-bar">
              <div className="tc-stat-block">
                <span className="tc-stat-number accent">{stats.totalSeasons || 0}</span>
                <span className="tc-stat-label">Seasons</span>
              </div>
              <div className="tc-stat-divider" />
              <div className="tc-stat-block">
                <span className="tc-stat-number green">{stats.totalWins || 0}</span>
                <span className="tc-stat-label">Wins</span>
              </div>
              <div className="tc-stat-block">
                <span className="tc-stat-number dim">{stats.totalDraws || 0}</span>
                <span className="tc-stat-label">Draws</span>
              </div>
              <div className="tc-stat-block">
                <span className="tc-stat-number red">{stats.totalLosses || 0}</span>
                <span className="tc-stat-label">Losses</span>
              </div>
              <div className="tc-stat-divider" />
              <div className="tc-stat-block">
                <span className="tc-stat-number accent">{winRate}%</span>
                <span className="tc-stat-label">Win Rate</span>
              </div>
              <div className="tc-stat-divider" />
              <div className="tc-stat-block">
                <span className="tc-stat-number accent">{(stats.totalPointsAllTime || 0).toFixed(0)}</span>
                <span className="tc-stat-label">All-Time Pts</span>
              </div>
              <div className="tc-stat-divider" />
              <div className="tc-stat-block tc-stat-badge-block">
                <span className="tc-stat-badge">{DIVISIONS[stats.highestDivision] || 'ROOKIE LEAGUE'}</span>
                <span className="tc-stat-label">Peak Division</span>
              </div>
              <div className="tc-stat-divider" />
              <div className="tc-stat-block">
                <div className="tc-promo-row">
                  <span className="tc-promo-up">▲ {stats.promotions || 0}</span>
                  <span className="tc-promo-down">▼ {stats.relegations || 0}</span>
                </div>
                <span className="tc-stat-label">Pro / Rel</span>
              </div>
            </div>

            {/* ── Trophy Carousel ── */}
            <div className="rvz-tc-carousel">
              <button
                type="button"
                className="rvz-sq-arrow rvz-sq-arrow-l"
                aria-label="Scroll left"
                onClick={() => scrollCarousel(-1)}
              >‹</button>
              <div className="rvz-tc-carousel-row" ref={carouselRef}>
                {TROPHY_DEFS.map(def => {
                  const earned = trophies.filter(t => (t.type || t) === def.type)
                  const count = earned.length
                  const isUnlocked = count > 0

                  return (
                    <div
                      key={def.type}
                      className={`tc-trophy-card${isUnlocked ? ' unlocked' : ' locked'}`}
                      style={{ '--trophy-color': isUnlocked ? def.rarityColor : 'rgba(255,255,255,0.08)' }}
                    >
                      {/* Glow ring */}
                      <div className="tc-trophy-ring">
                        <span className="tc-trophy-icon">{def.icon}</span>
                      </div>

                      {/* Info */}
                      <div className="tc-trophy-name">{def.label}</div>
                      <div className="tc-trophy-desc">{def.desc}</div>

                      {/* Rarity + count */}
                      <div className="tc-trophy-footer">
                        <span className="tc-trophy-rarity" style={{ color: def.rarityColor }}>
                          {def.rarity}
                        </span>
                        {isUnlocked && (
                          <span className="tc-trophy-count">×{count}</span>
                        )}
                      </div>

                      {/* Lock overlay */}
                      {!isUnlocked && <div className="tc-trophy-lock-overlay" />}
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                className="rvz-sq-arrow rvz-sq-arrow-r"
                aria-label="Scroll right"
                onClick={() => scrollCarousel(1)}
              >›</button>
            </div>

            {/* ── Earned Trophy Timeline ── */}
            {sortedTrophies.length > 0 && (
              <div className="tc-timeline">
                <h3 className="tc-timeline-title">Trophy Timeline</h3>
                {timelineItems.map((t, idx) => {
                  const def = TROPHY_BY_TYPE[t.type]
                  const dotColor = idx === 0 ? '#A78BFA' : 'rgba(255,255,255,0.25)'
                  return (
                    <div key={idx} className="tc-timeline-item">
                      <div className="tc-timeline-dot" style={{ background: dotColor, color: dotColor }} />
                      <div className="tc-timeline-content">
                        <div className="tc-timeline-row">
                          <span className="tc-timeline-icon">{def?.icon || '🏅'}</span>
                          <span className="tc-timeline-label">{def?.label || t.type}</span>
                          {t.divisionName && (
                            <span className="tc-timeline-badge">{t.divisionName}</span>
                          )}
                        </div>
                        <div className="tc-timeline-meta">
                          {t.description}
                          {t.seasonId && <span> · {t.seasonId}</span>}
                          {t.earnedAt && <span> · {fmtDate(t.earnedAt)}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {sortedTrophies.length > 4 && (
                  <button
                    type="button"
                    className="rvz-tc-ghost-btn rvz-tc-ghost-full"
                    onClick={() => setShowAllTimeline(v => !v)}
                  >
                    {showAllTimeline ? 'Show Less ↑' : 'View Full Timeline ↓'}
                  </button>
                )}
              </div>
            )}

            {/* ── Empty state ── */}
            {sortedTrophies.length === 0 && (
              <div className="tc-empty">
                <span className="tc-empty-icon">🏆</span>
                <p className="tc-empty-text">No trophies earned yet. Compete in seasons to unlock achievements!</p>
              </div>
            )}
          </div>

          {/* ═══ RIGHT RAIL ═══ */}
          <div className="rvz-tc-rail">
            {/* ── Next Reward ── */}
            {nextReward && (
              <div className="rvz-tc-card rvz-tc-reward">
                <div className="rvz-tc-hex">
                  <TrophyOutlined />
                </div>
                <div className="rvz-tc-reward-label">NEXT REWARD</div>
                <div className="rvz-tc-reward-name">{nextReward.name}</div>
                {nextReward.allUnlocked ? (
                  <div className="rvz-tc-reward-line">All rewards unlocked 🎉</div>
                ) : (
                  <div className="rvz-tc-reward-line">
                    Win {nextReward.remaining} more troph{nextReward.remaining === 1 ? 'y' : 'ies'} to unlock
                  </div>
                )}
                <div className="rvz-tc-progress">
                  <div
                    className="rvz-tc-progress-fill"
                    style={{
                      width: nextReward.allUnlocked
                        ? '100%'
                        : `${Math.min(100, Math.round(((nextReward.earned || 0) / (nextReward.target || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="rvz-tc-progress-caption">
                  {nextReward.earned} / {nextReward.target}
                </div>
              </div>
            )}

            {/* ── Season Summary ── */}
            <div className="rvz-tc-card">
              <div className="rvz-tc-card-title"><BarChartOutlined /> SEASON SUMMARY</div>
              <div className="rvz-tc-kv">
                <span className="rvz-tc-kv-label">Best Finish</span>
                <span className="rvz-tc-kv-value">{ss.bestFinish || dash}</span>
              </div>
              <div className="rvz-tc-kv">
                <span className="rvz-tc-kv-label">Highest Points</span>
                <span className="rvz-tc-kv-value">{ss.highestPoints != null ? ss.highestPoints : dash}</span>
              </div>
              <div className="rvz-tc-kv">
                <span className="rvz-tc-kv-label">Biggest Win</span>
                <span className="rvz-tc-kv-value">{ss.biggestWin || dash}</span>
              </div>
              <div className="rvz-tc-kv">
                <span className="rvz-tc-kv-label">Longest Win Streak</span>
                <span className="rvz-tc-kv-value">{ss.longestWinStreak != null ? ss.longestWinStreak : dash}</span>
              </div>
              <button
                type="button"
                className="rvz-tc-ghost-btn rvz-tc-ghost-full"
                onClick={() => navigate('/nfl-rivals/history')}
              >
                View Season History →
              </button>
            </div>

            {/* ── Recently Unlocked ── */}
            <div className="rvz-tc-card">
              <div className="rvz-tc-card-title"><TrophyOutlined /> RECENTLY UNLOCKED</div>
              {recentlyUnlocked.length === 0 ? (
                <div className="rvz-tc-empty-mini">No trophies unlocked yet.</div>
              ) : (
                recentlyUnlocked.slice(0, 3).map((t, idx) => {
                  const def = TROPHY_BY_TYPE[t.type]
                  return (
                    <div key={idx} className="rvz-tc-recent-row">
                      <span className="rvz-tc-recent-icon">{def?.icon || '🏅'}</span>
                      <div className="rvz-tc-recent-info">
                        <span className="rvz-tc-recent-label">{def?.label || t.type}</span>
                        <span className="rvz-tc-recent-date">Unlocked on {fmtDate(t.earnedAt) || '—'}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <button
                type="button"
                className="rvz-tc-ghost-btn rvz-tc-ghost-full"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
              >
                View All Trophies →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrophyCabinet
