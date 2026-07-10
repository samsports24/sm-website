import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Button, Spin, notification, Input,
} from 'antd'
import {
  CrownOutlined, TeamOutlined, TrophyOutlined, FireOutlined,
  RiseOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, BarChartOutlined, EditOutlined, CheckOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import nflRivalsLogo from '../../assets/nfl-rivals-logo.svg'
import './nfl-rivals.css'
import { DIVISIONS, DIVISION_COLORS, TROPHY_ICONS } from './rivalsConfig'

/* ══════════════════════════════════════
   JOIN SPLASH
   ══════════════════════════════════════ */
const JoinSplash = ({ onJoin, loading }) => {
  const [teamName, setTeamName] = useState('')

  return (
    <div className="nflr-splash">
      <div className="nflr-splash-inner">
        <img
          src={nflRivalsLogo}
          alt="SAM RIVALS"
          style={{ display: 'block', margin: '0 auto 16px', width: 340, height: 'auto' }}
        />
        <p className="nflr-splash-sub">The Ultimate NFL Fantasy Competition</p>

        <div className="nflr-splash-features">
          <div className="nflr-feature">
            <SafetyCertificateOutlined />
            <h3>4 Divisions</h3>
            <p>From Rookie Tier to Gridiron Elite. Climb the ranks.</p>
          </div>
          <div className="nflr-feature">
            <ThunderboltOutlined />
            <h3>H2H Competition</h3>
            <p>Thu→Mon scoring windows. 53-man rosters.</p>
          </div>
          <div className="nflr-feature">
            <TrophyOutlined />
            <h3>Trophy Cabinet</h3>
            <p>Earn badges: Giant Killer, The Invincible, and more.</p>
          </div>
          <div className="nflr-feature">
            <RiseOutlined />
            <h3>Promotion &amp; Relegation</h3>
            <p>Top 3 rise. Bottom 3 fall. Every week matters.</p>
          </div>
        </div>

        <div className="nflr-splash-rules">
          <h3>Squad Rules</h3>
          <div className="nflr-rules-grid">
            <span>53 Players</span>
            <span>$301M Cap</span>
            <span>$280M Floor</span>
            <span>24 Active Gameday</span>
            <span>1 QB Mandatory</span>
            <span>5 OL Mandatory</span>
            <span>3 DL Mandatory</span>
            <span>3-4 Defense Base</span>
          </div>
        </div>

        <div style={{ maxWidth: 400, margin: '0 auto 24px', textAlign: 'left' }}>
          <label style={{
            display: 'block', fontFamily: "'Rajdhani', sans-serif",
            fontSize: 14, fontWeight: 700, color: '#A78BFA',
            marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            Choose Your Franchise Name
          </label>
          <Input
            placeholder="e.g. Thunder Bolts, Grid Warriors..."
            value={teamName}
            onChange={function (e) { setTeamName(e.target.value) }}
            maxLength={30} size="large"
            onPressEnter={function () { if (teamName.trim()) onJoin(teamName.trim()) }}
            style={{
              background: 'rgba(20, 28, 45, 0.8)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: 10, color: '#e2e8f0', fontSize: 16,
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
            }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'right' }}>
            {teamName.length}/30
          </div>
        </div>

        <Button
          size="large"
          onClick={function () {
            if (!teamName.trim()) {
              notification.warning({ message: 'Please enter a franchise name to continue' })
              return
            }
            onJoin(teamName.trim())
          }}
          loading={loading}
          disabled={!teamName.trim()}
          className="nflr-gold-btn nflr-join-btn"
        >
          Enter RIVALS
        </Button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   NFL RIVALS OVERVIEW
   ══════════════════════════════════════ */
const NFLRivalsOverview = () => {
  const userDetails = useSelector(function (s) { return s.user?.userDetails })
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [entry, setEntry] = useState(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [season, setSeason] = useState(null)
  const [week, setWeek] = useState(null)
  const [pod, setPod] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const loadAll = useCallback(async function () {
    try {
      setLoading(true)
      attachToken()
      var res = await privateAPI.get('/nfl-rivals/profile')
      var profileData = res.data && res.data.data
      if (profileData && profileData.entry) {
        setEntry(profileData.entry)
        setHasJoined(true)
        var results = await Promise.allSettled([
          privateAPI.get('/nfl-rivals/season'),
          privateAPI.get('/nfl-rivals/week'),
          privateAPI.get('/nfl-rivals/pod'),
        ])
        if (results[0].status === 'fulfilled') setSeason(results[0].value.data.data ? results[0].value.data.data.season : null)
        if (results[1].status === 'fulfilled') setWeek(results[1].value.data.data || null)
        if (results[2].status === 'fulfilled') setPod(results[2].value.data.data ? results[2].value.data.data.pod : null)
      } else {
        setHasJoined(false)
      }
    } catch (err) {
      console.error('Error loading NFL RIVALS:', err)
      setHasJoined(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function () { loadAll() }, [loadAll])

  var handleJoin = async function (teamName) {
    try {
      setJoining(true)
      attachToken()
      var joinRes = await privateAPI.post('/nfl-rivals/join', { teamName: teamName })
      if (joinRes.data && joinRes.data.success) {
        notification.success({ message: 'Welcome to NFL RIVALS!', description: 'Division 4 — ROOKIE LEAGUE. Build your 53-man roster!' })
        await loadAll()
        navigate('/nfl-rivals/squad')
      } else {
        notification.error({ message: 'Could not join', description: (joinRes.data && joinRes.data.message) || 'Unexpected response' })
        setJoining(false)
      }
    } catch (err) {
      var msg = err.response && err.response.data ? err.response.data.message : err.message || 'Server error'
      notification.error({ message: 'Failed to join NFL RIVALS', description: msg, duration: 8 })
      setJoining(false)
    }
  }

  var handleSaveTeamName = async function () {
    if (!newTeamName.trim()) return
    try {
      setSavingName(true)
      attachToken()
      var res = await privateAPI.put('/nfl-rivals/team-name', { teamName: newTeamName.trim() })
      if (res.data && res.data.success) {
        setEntry(function (prev) { return Object.assign({}, prev, { teamName: newTeamName.trim() }) })
        setEditingName(false)
        notification.success({ message: 'Franchise name updated!' })
      }
    } catch (err) {
      notification.error({ message: 'Failed to update name' })
    } finally { setSavingName(false) }
  }

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>
  if (!hasJoined) return <JoinSplash onJoin={handleJoin} loading={joining} />

  var div = entry ? entry.division : 4
  var divColor = DIVISION_COLORS[div] || '#8b5cf6'
  var stats = (entry && entry.seasonStats) || {}
  var career = (entry && entry.careerStats) || {}
  var podMembers = (pod && pod.members) || []
  var activeWeek = week ? week.activeWeek : null
  var totalMatches = (stats.wins || 0) + (stats.draws || 0) + (stats.losses || 0)

  var spBalance = ((entry.earnedSamPoints || 0) + (entry.purchasedSamPoints || 0))
  var spDisplay = spBalance >= 1e6 ? `${(spBalance / 1e6).toFixed(1)}M` : spBalance >= 1e3 ? `${(spBalance / 1e3).toFixed(0)}K` : String(spBalance)

  return (
    <div className="nflr-page">
      {/* ═══ HERO BANNER ═══ */}
      <div className="rv2-hero" style={{ '--div-glow': divColor }}>
        <div className="rv2-hero-stripe" style={{ background: `linear-gradient(135deg, ${divColor}, transparent)` }} />
        <div className="rv2-hero-content">
          {/* Badge + Identity */}
          <div className="rv2-hero-left">
            <div className="rv2-hero-badge" style={{ borderColor: divColor, boxShadow: `0 0 30px ${divColor}40` }}>
              <CrownOutlined style={{ color: divColor, fontSize: 22 }} />
              <span className="rv2-hero-badge-num" style={{ color: divColor }}>{div}</span>
            </div>
            <div className="rv2-hero-identity">
              <div className="rv2-hero-team-row">
                {editingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      className="rv2-hero-edit-input"
                      value={newTeamName}
                      onChange={function (e) { setNewTeamName(e.target.value) }}
                      onKeyDown={function (e) { if (e.key === 'Enter') handleSaveTeamName() }}
                      maxLength={30} autoFocus
                    />
                    <CheckOutlined onClick={handleSaveTeamName} style={{ color: divColor, cursor: 'pointer', fontSize: 18 }} />
                  </div>
                ) : (
                  <>
                    <h2 className="rv2-hero-team-name">{entry.teamName || 'MY FRANCHISE'}</h2>
                    <EditOutlined className="rv2-hero-edit-btn" onClick={function () { setNewTeamName(entry.teamName || ''); setEditingName(true) }} />
                  </>
                )}
              </div>
              <h1 className="rv2-hero-division" style={{ color: divColor }}>{entry.divisionName || DIVISIONS[div]}</h1>
              <div className="rv2-hero-tags">
                <span className="rv2-tag">{(season && season.name) || (entry && entry.currentSeason) || 'PRE-SEASON'}</span>
                {pod && <span className="rv2-tag">POD {pod.podNumber}</span>}
                {activeWeek && <span className="rv2-tag rv2-tag-live">WEEK {activeWeek.week}</span>}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="rv2-hero-stats">
            <div className="rv2-stat rv2-stat-win">
              <span className="rv2-stat-num">{stats.wins || 0}</span>
              <span className="rv2-stat-lbl">WIN</span>
            </div>
            <div className="rv2-stat rv2-stat-draw">
              <span className="rv2-stat-num">{stats.draws || 0}</span>
              <span className="rv2-stat-lbl">DRW</span>
            </div>
            <div className="rv2-stat rv2-stat-loss">
              <span className="rv2-stat-num">{stats.losses || 0}</span>
              <span className="rv2-stat-lbl">LOSS</span>
            </div>
            <div className="rv2-stat-sep" />
            <div className="rv2-stat rv2-stat-pts">
              <span className="rv2-stat-num">{(stats.totalPoints || 0).toFixed(1)}</span>
              <span className="rv2-stat-lbl">PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS BAR ═══ */}
      <div className="rv2-quick-bar">
        <button className="rv2-quick-btn rv2-quick-primary" onClick={() => navigate('/nfl-rivals/squad')}>
          <TeamOutlined /> {entry && entry.squadValid ? 'MY SQUAD' : 'BUILD SQUAD'}
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/nfl-rivals/search')}>
          <ThunderboltOutlined /> MARKET
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/nfl-rivals/matchday')}>
          <BarChartOutlined /> MATCHDAY
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/nfl-rivals/ai-coach')}>
          <MedicineBoxOutlined /> AI COACH
        </button>
      </div>

      {/* ═══ FEED-STYLE DASHBOARD ═══ */}
      <div className="rv2-feed">
        {/* Left column: main cards */}
        <div className="rv2-feed-main">
          {/* Featured: Squad status */}
          <div className="rv2-card-featured" onClick={() => navigate('/nfl-rivals/squad')}>
            <div className="rv2-card-featured-stripe" />
            <div className="rv2-card-featured-body">
              <div className="rv2-card-featured-icon" style={{ background: 'linear-gradient(135deg, #A78BFA, #7c3aed)' }}>
                <TeamOutlined />
              </div>
              <div className="rv2-card-featured-text">
                <span className="rv2-card-featured-title">Squad</span>
                <span className="rv2-card-featured-sub">
                  {entry && entry.squadValid
                    ? `${entry.squad ? entry.squad.length : 0}/53 · $${((entry.squadValue || 0) / 1e6).toFixed(0)}M cap`
                    : 'Build your roster to compete'}
                </span>
              </div>
              {!(entry && entry.squadValid) && <span className="rv2-card-featured-cta">GET STARTED</span>}
            </div>
          </div>

          {/* Two-col action grid */}
          <div className="rv2-action-grid">
            <div className="rv2-action-card" onClick={() => navigate('/nfl-rivals/pod')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}><FireOutlined /></div>
              <span className="rv2-action-title">Pod Standings</span>
              <span className="rv2-action-sub">{podMembers.length > 0 ? `${podMembers.length} managers` : 'Awaiting placement'}</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/nfl-rivals/matchday')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}><BarChartOutlined /></div>
              <span className="rv2-action-title">Matchday</span>
              <span className="rv2-action-sub">{activeWeek ? `Week ${activeWeek.week} active` : 'No active week'}</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/nfl-rivals/trophies')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}><TrophyOutlined /></div>
              <span className="rv2-action-title">Trophies</span>
              <span className="rv2-action-sub">{entry.trophies && entry.trophies.length > 0 ? `${entry.trophies.length} earned` : 'No trophies yet'}</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/nfl-rivals/leaderboard')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}><StarOutlined /></div>
              <span className="rv2-action-title">Leaderboard</span>
              <span className="rv2-action-sub">Global rankings</span>
            </div>
          </div>
        </div>

        {/* Right column: sidebar widgets */}
        <div className="rv2-feed-side">
          {/* Wallet widget */}
          <div className="rv2-widget">
            <div className="rv2-widget-header">
              <WalletOutlined style={{ color: '#2dd4bf' }} />
              <span>Rivals Wallet</span>
            </div>
            <div className="rv2-wallet-balance">
              <span className="rv2-wallet-amount">{spDisplay}</span>
              <span className="rv2-wallet-unit">SP</span>
            </div>
            <button className="rv2-wallet-buy" onClick={() => navigate('/nfl-rivals/buy-sp')}>
              <DollarOutlined /> Buy SamPoints
            </button>
          </div>

          {/* Pod Standings widget */}
          <div className="rv2-widget">
            <div className="rv2-widget-header">
              <FireOutlined style={{ color: '#f97316' }} />
              <span>Pod Standings</span>
              <button className="rv2-widget-link" onClick={() => navigate('/nfl-rivals/pod')}>View All</button>
            </div>
            {podMembers.length > 0 ? (
              <div className="rv2-pod-list">
                {podMembers.slice(0, 5).map(function (m, idx) {
                  var myUserId = entry ? (entry.user._id || entry.user) : null
                  var memberId = m.user ? (m.user._id || m.user) : null
                  var isMe = myUserId && memberId && String(myUserId) === String(memberId)
                  return (
                    <div key={(m.entry && m.entry._id) || idx} className={`rv2-pod-row ${isMe ? 'rv2-pod-me' : ''}`}>
                      <span className="rv2-pod-rank">{idx + 1}</span>
                      <span className="rv2-pod-name">{(m.user && (m.user.userName || m.user.username)) || (m.entry && m.entry.teamName) || m.username || 'Manager'}</span>
                      <span className="rv2-pod-record">
                        <span className="rv2-pod-w">{m.wins || 0}</span>
                        <span className="rv2-pod-sep">-</span>
                        <span className="rv2-pod-d">{m.draws || 0}</span>
                        <span className="rv2-pod-sep">-</span>
                        <span className="rv2-pod-l">{m.losses || 0}</span>
                      </span>
                      <span className="rv2-pod-pts">{(m.totalPoints || 0).toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rv2-widget-empty">
                {entry && entry.squadValid ? 'Pod forming — waiting for managers' : 'Build your squad to join a pod'}
              </div>
            )}
          </div>

          {/* AI Coach widget */}
          <div className="rv2-widget rv2-widget-cta" onClick={() => navigate('/nfl-rivals/ai-coach')}>
            <MedicineBoxOutlined className="rv2-widget-cta-icon" />
            <div>
              <div className="rv2-widget-cta-title">AI Coach</div>
              <div className="rv2-widget-cta-sub">Get strategy & lineup advice</div>
            </div>
            <span className="rv2-widget-cta-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard Card Component ── */
const DashCard = ({ icon, iconBg, iconColor, title, value, warn, onClick }) => (
  <div className="rv-dash-card" onClick={onClick}>
    <div className="rv-dash-card-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div className="rv-dash-card-title">{title}</div>
      <div className={`rv-dash-card-value ${warn ? 'warn' : ''}`}>{value}</div>
    </div>
    <span className="rv-dash-card-chevron">›</span>
  </div>
)

export default NFLRivalsOverview
