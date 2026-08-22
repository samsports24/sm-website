import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Button, Spin, notification, Input,
} from 'antd'
import {
  TeamOutlined, TrophyOutlined,
  RiseOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, EditOutlined, CheckOutlined,
  MedicineBoxOutlined, WalletOutlined, RobotOutlined, FireOutlined,
  ClockCircleOutlined, RightOutlined, ArrowUpOutlined,
  CheckCircleOutlined, StarFilled, UsergroupAddOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import nflRivalsLogo from '../../assets/rivals/lor-logo.png'
import NFLRivalsInvite from './NFLRivalsInvite'
import './nfl-rivals.css'
import { DIVISIONS, DIVISION_COLORS } from './rivalsConfig'
import heroPlayer from '../../assets/rivals/nfl-hero-player.png'
import aiCoachRobot from '../../assets/rivals/ai-coach-robot.png'

/* ══════════════════════════════════════
   JOIN SPLASH
   ══════════════════════════════════════ */
const JoinSplash = ({ onJoin, loading, signedOut, onSignup }) => {
  const [teamName, setTeamName] = useState('')
  // App-level RefCapture stashes the code from an invite link. Saying so is the
  // difference between "what is this site" and "my mate sent me here".
  var invitedBy = null
  try { invitedBy = localStorage.getItem('samsports_ref') } catch (e) { invitedBy = null }

  return (
    <div className="nflr-splash">
      <div className="nflr-splash-inner">
        <img
          src={nflRivalsLogo}
          alt="LEAGUE OF RIVALS"
          style={{ display: 'block', margin: '0 auto 16px', width: 340, height: 'auto' }}
        />
        <p className="nflr-splash-sub">The Ultimate NFL Fantasy Competition</p>
        {invitedBy ? (
          <div className="nflr-splash-invited">
            <UsergroupAddOutlined /> You were invited to play. Create an account to take your pod place.
          </div>
        ) : null}

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

        {signedOut ? null : (
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
        )}

        {signedOut ? (
          // No account yet. Asking for a franchise name first would only lose it
          // at the signup redirect, so ask for the account and come back here.
          <Button size="large" onClick={onSignup} className="nflr-gold-btn nflr-join-btn">
            Create Account &amp; Play
          </Button>
        ) : (
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
        )}
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
  const [leaderboard, setLeaderboard] = useState([])
  const [economy, setEconomy] = useState(null)
  const [trending, setTrending] = useState([])
  const [editingName, setEditingName] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(function () {
    var t = setInterval(function () { setNow(Date.now()) }, 1000)
    return function () { clearInterval(t) }
  }, [])

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
          privateAPI.get('/nfl-rivals/leaderboard'),
          privateAPI.get('/nfl-rivals/economy'),
          privateAPI.get('/nfl-rivals/players/search?limit=8&sort=fantasyPointsAvg'),
        ])
        if (results[0].status === 'fulfilled') setSeason(results[0].value.data.data ? results[0].value.data.data.season : null)
        if (results[1].status === 'fulfilled') setWeek(results[1].value.data.data || null)
        if (results[2].status === 'fulfilled') setPod(results[2].value.data.data ? results[2].value.data.data.pod : null)
        if (results[3].status === 'fulfilled') {
          var lb = results[3].value.data.data
          setLeaderboard(lb && lb.leaderboard ? lb.leaderboard : (Array.isArray(lb) ? lb : []))
        }
        if (results[4].status === 'fulfilled') setEconomy(results[4].value.data.data || null)
        if (results[5].status === 'fulfilled') {
          var pl = results[5].value.data.data
          setTrending(pl && pl.players ? pl.players : (Array.isArray(pl) ? pl : []))
        }
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
  if (!hasJoined) return (
    <JoinSplash
      onJoin={handleJoin}
      loading={joining}
      signedOut={!token}
      onSignup={function () {
        // Come back to Rivals after signup, not to the generic dashboard. An
        // invite that lands people somewhere else is an invite that leaks.
        try { localStorage.setItem('redirectAfterLogin', '/nfl-rivals') } catch (e) { /* private mode */ }
        navigate('/select-game')
      }}
    />
  )

  var div = entry ? entry.division : 4
  var divColor = DIVISION_COLORS[div] || '#8b5cf6'
  var stats = (entry && entry.seasonStats) || {}
  var podMembers = (pod && pod.members) || []
  var activeWeek = week ? week.activeWeek : null
  var weekNum = activeWeek ? activeWeek.week : null
  var totalWeeks = (season && season.weekCount) || (week && week.season && week.season.weekCount) || 17
  var seasonName = (season && season.name) || (week && week.season && week.season.name) || (entry && entry.currentSeason) || 'PRE-SEASON'

  // ── identity / standings ──
  var myUserId = entry && entry.user ? (entry.user._id || entry.user) : null
  var idOf = function (ref) { return ref ? (ref._id || ref) : null }
  var isMe = function (ref) { var id = idOf(ref); return myUserId && id && String(id) === String(myUserId) }
  var sortedMembers = podMembers.slice() // backend already sorts by wins/points
  var myIdx = sortedMembers.findIndex(function (m) { return isMe(m.user) })
  var myMember = myIdx >= 0 ? sortedMembers[myIdx] : null
  var podSize = sortedMembers.length
  var myRank = null
  if (leaderboard && leaderboard.length) {
    var ri = leaderboard.findIndex(function (r) { return isMe(r.user) || (r.userId && myUserId && String(r.userId) === String(myUserId)) })
    if (ri >= 0) myRank = ri + 1
  }
  var placeNum = myIdx >= 0 ? myIdx + 1 : myRank
  var ordinal = function (n) {
    if (n == null) return '—'
    var s = ['th', 'st', 'nd', 'rd']; var v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' Place'
  }
  var memberName = function (uid) {
    var mm = sortedMembers.find(function (m) { return uid && idOf(m.user) && String(idOf(m.user)) === String(uid) })
    if (mm) return (mm.entry && mm.entry.teamName) || (mm.user && (mm.user.userName || mm.user.username)) || mm.username || 'Rival'
    return 'Rival'
  }
  var memberRecord = function (uid) {
    var mm = sortedMembers.find(function (m) { return uid && idOf(m.user) && String(idOf(m.user)) === String(uid) })
    return mm ? ((mm.wins || 0) + '-' + (mm.losses || 0)) : '—'
  }

  // ── record ──
  var wins = myMember && myMember.wins != null ? myMember.wins : (stats.wins || 0)
  var losses = myMember && myMember.losses != null ? myMember.losses : (stats.losses || 0)
  var recordStr = wins + '-' + losses
  var pf = myMember && myMember.totalPoints != null ? myMember.totalPoints : (stats.totalPoints || 0)

  // ── fixtures: flatten my matches ──
  var fixtures = (pod && pod.fixtures) || []
  var myMatches = []
  fixtures.forEach(function (fx) {
    ;(fx.matches || []).forEach(function (mt) {
      var h = idOf(mt.homeUserId); var a = idOf(mt.awayUserId)
      var meHome = myUserId && h && String(h) === String(myUserId)
      var meAway = myUserId && a && String(a) === String(myUserId)
      if (meHome || meAway) myMatches.push({ matchday: fx.matchday, mt: mt, isHome: meHome, oppId: meHome ? a : h })
    })
  })
  // Points Against (from completed matches)
  var paComputed = null
  var completedMatches = myMatches.filter(function (x) { return x.mt.status === 'completed' && (x.mt.homeScore != null || x.mt.awayScore != null) })
  if (completedMatches.length) {
    paComputed = 0
    completedMatches.forEach(function (x) { paComputed += (x.isHome ? (x.mt.awayScore || 0) : (x.mt.homeScore || 0)) })
  }
  var paDisplay = paComputed == null ? '—' : String(Math.round(paComputed))
  var diffDisplay = paComputed == null ? '—' : (function () { var d = Math.round(pf - paComputed); return (d >= 0 ? '+' : '') + d })()
  // Next unplayed matchup
  var upcoming = myMatches.filter(function (x) { return x.mt.status !== 'completed' }).sort(function (a, b) { return (a.matchday || 0) - (b.matchday || 0) })
  var nextX = upcoming[0] || null
  var oppName = nextX ? memberName(nextX.oppId) : null
  var oppRecord = nextX ? memberRecord(nextX.oppId) : '—'
  var fmtDate = function (d) { if (!d) return null; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch (e) { return null } }
  var nextDateRaw = nextX && season && season.matchdays ? (function () { var md = season.matchdays.find(function (m) { return m.week === nextX.matchday }); return md ? md.startDate : null })() : null
  var nextDate = fmtDate(nextDateRaw)

  // ── wallet (economy) ──
  var spBalance = economy ? (economy.earnedSamPoints || 0) : ((entry.earnedSamPoints || 0) + (entry.purchasedSamPoints || 0))
  var spDisplay = spBalance >= 1e6 ? `${(spBalance / 1e6).toFixed(1)}M` : spBalance >= 1e3 ? `${(spBalance / 1e3).toFixed(0)}K` : String(Math.round(spBalance))
  var weeklyIncome = economy && economy.currentRewards && economy.currentRewards.win != null ? economy.currentRewards.win : null

  // ── roster position groups ──
  var rosterGroups = (function () {
    var g = { QB: 0, RB: 0, WR: 0, TE: 0, OL: 0, DL: 0, LB: 0, DB: 0, ST: 0 }
    ;(entry.squad || []).forEach(function (s) {
      var p = String((s && (s.player && s.player.Position)) || (s && (s.position || s.pos)) || '').toUpperCase()
      if (p === 'QB') g.QB++
      else if (['RB', 'FB', 'HB'].indexOf(p) >= 0) g.RB++
      else if (p === 'WR') g.WR++
      else if (p === 'TE') g.TE++
      else if (['LT', 'RT', 'LG', 'RG', 'C', 'G', 'OT', 'OL', 'T'].indexOf(p) >= 0) g.OL++
      else if (['DE', 'DT', 'NT', 'DL', 'EDGE'].indexOf(p) >= 0) g.DL++
      else if (['ILB', 'OLB', 'MLB', 'LB'].indexOf(p) >= 0) g.LB++
      else if (['CB', 'S', 'FS', 'SS', 'DB'].indexOf(p) >= 0) g.DB++
      else if (['K', 'P', 'LS'].indexOf(p) >= 0) g.ST++
    })
    return g
  })()
  var squadLen = entry.squad ? entry.squad.length : 0
  // Counted from the same fields the Injury Report page shows, not from
  // isPlayerInjured alone.
  //
  // isPlayerInjured is a boolean written only by the full Tank01 endpoint sync.
  // InjuryStatus and the NFL.com game status are refreshed by other jobs on
  // other schedules, so the two drift - and this tile was reading the one the
  // Injury Report does not. It sat on "0 players to monitor" while the report
  // listed players. Any of the three counts now, so the tile can only ever be
  // as stale as the freshest thing we know.
  var CLEAR = ['', 'HEALTHY', 'ACTIVE', 'PROBABLE', 'NONE']
  var injuredCount = (entry.squad || []).filter(function (s) {
    var p = s.player
    if (!p) return false
    if (p.isPlayerInjured) return true
    var st = String(p.InjuryStatus || '').trim().toUpperCase()
    if (st && CLEAR.indexOf(st) === -1) return true
    var gs = String(p.NflGameStatus || '').trim().toUpperCase()
    return !!gs && CLEAR.indexOf(gs) === -1
  }).length

  // ── scoring breakdown — all 9 roster position groups, weighted by role ──
  // Starters score 100%, Bench 50%, Reserves 0% — so the projected total and the
  // per-position split reflect how the roster actually scores.
  var scoreColors = {
    QB: '#8B5CF6', RB: '#4ADE80', WR: '#A78BFA', TE: '#F59E0B', OL: '#38BDF8',
    DL: '#EF4444', LB: '#EC4899', DB: '#14B8A6', ST: '#FACC15',
  }
  var posGroupOf = function (pos) {
    var p = String(pos || '').toUpperCase()
    if (p === 'QB') return 'QB'
    if (['RB', 'FB', 'HB'].indexOf(p) >= 0) return 'RB'
    if (p === 'WR') return 'WR'
    if (p === 'TE') return 'TE'
    if (['LT', 'RT', 'LG', 'RG', 'C', 'G', 'OT', 'OL', 'T'].indexOf(p) >= 0) return 'OL'
    if (['DE', 'DT', 'NT', 'DL', 'EDGE'].indexOf(p) >= 0) return 'DL'
    if (['ILB', 'OLB', 'MLB', 'LB'].indexOf(p) >= 0) return 'LB'
    if (['CB', 'S', 'FS', 'SS', 'DB'].indexOf(p) >= 0) return 'DB'
    if (['K', 'P', 'LS'].indexOf(p) >= 0) return 'ST'
    return null
  }
  var roleWeight = { starter: 1, bench: 0.5, reserve: 0 }
  var scoreGroups = { QB: 0, RB: 0, WR: 0, TE: 0, OL: 0, DL: 0, LB: 0, DB: 0, ST: 0 }
  ;(entry.squad || []).forEach(function (s) {
    var pl = s.player || {}
    var grp = posGroupOf(pl.Position || s.position || s.pos)
    if (!grp) return
    var w = roleWeight[String(s.role || '').toLowerCase()]
    if (w === undefined) w = 1
    var pts = Number(pl.projectedPoints || pl.pointsPerGame || pl.avgPf || pl.fantasyPointsAvg || pl.samPoints || 0) * w
    if (pts > 0) scoreGroups[grp] += pts
  })
  var scoreOrder = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'ST']
  var scoreTotal = scoreOrder.reduce(function (a, k) { return a + scoreGroups[k] }, 0)
  var projTotal = Math.round(scoreTotal)
  // donut geometry
  var R = 46; var CIRC = 2 * Math.PI * R; var cumOffset = 0
  var donutSegs = scoreTotal > 0 ? scoreOrder.filter(function (k) { return scoreGroups[k] > 0 }).map(function (k) {
    var frac = scoreGroups[k] / scoreTotal
    var seg = { key: k, color: scoreColors[k], len: frac * CIRC, offset: cumOffset, pct: Math.round(frac * 100), val: Math.round(scoreGroups[k]) }
    cumOffset += frac * CIRC
    return seg
  }) : []

  // ── matchday countdown ──
  var deadlineRaw = (activeWeek && (activeWeek.endDate || activeWeek.startDate)) || null
  var cdMs = deadlineRaw ? (new Date(deadlineRaw).getTime() - now) : null
  var cd = { d: 0, h: 0, m: 0 }
  if (cdMs && cdMs > 0) { cd.d = Math.floor(cdMs / 86400000); cd.h = Math.floor((cdMs % 86400000) / 3600000); cd.m = Math.floor((cdMs % 3600000) / 60000) }
  var deadlineDate = fmtDate(deadlineRaw) || '—'

  // ── weekly challenge ──
  var challengeTarget = 400
  var challengeCurrent = projTotal || (stats.weekScores && stats.weekScores.length ? Math.round(stats.weekScores[stats.weekScores.length - 1]) : 0) || 0

  var TABS = [
    { label: 'MY SQUAD', to: '/nfl-rivals/squad', active: true },
    { label: 'MARKET', to: '/nfl-rivals/search' },
    { label: 'MATCHDAY', to: '/nfl-rivals/matchday' },
    { label: 'TRANSFER MARKET', to: '/nfl-rivals/search' },
    { label: 'AI COACH', to: '/nfl-rivals/ai-coach' },
  ]

  return (
    <div className="nflr-page ovr-page">
      {/* ═══ HERO BANNER ═══ */}
      <div className="ovr-hero">
        <img src={heroPlayer} alt="" className="ovr-hero-player" />
        <div className="ovr-hero-inner">
          <div className="ovr-hero-left">
            <div className="ovr-hex" title={`Division ${div}`}>
              <StarFilled className="ovr-hex-star" />
              <span className="ovr-hex-div">DIVISION</span>
              <span className="ovr-hex-num">{div}</span>
            </div>
            <div className="ovr-hero-id">
              <div className="ovr-team-row">
                {editingName ? (
                  <>
                    <input
                      className="ovr-edit-input"
                      value={newTeamName}
                      onChange={function (e) { setNewTeamName(e.target.value) }}
                      onKeyDown={function (e) { if (e.key === 'Enter') handleSaveTeamName() }}
                      maxLength={30} autoFocus
                    />
                    <CheckOutlined className="ovr-edit-btn" onClick={handleSaveTeamName} style={{ opacity: savingName ? 0.5 : 1 }} />
                  </>
                ) : (
                  <>
                    <h2 className="ovr-team-name">{entry.teamName || 'MY FRANCHISE'}</h2>
                    <EditOutlined className="ovr-edit-btn" onClick={function () { setNewTeamName(entry.teamName || ''); setEditingName(true) }} />
                  </>
                )}
              </div>
              <h1 className="ovr-hero-title">{entry.divisionName || DIVISIONS[div]}</h1>
              <div className="ovr-pills">
                <span className="ovr-pill">{seasonName} SEASON</span>
                <span className="ovr-pill">WEEK {weekNum || '—'} OF {totalWeeks}</span>
                <span className="ovr-pill">12 TEAM PPR</span>
              </div>
            </div>
          </div>

          <div className="ovr-hero-right">
            {/* CURRENT RECORD */}
            <div className="ovr-hblock">
              <div className="ovr-hblock-lbl">Current Record</div>
              <div className="ovr-rec-main">
                <span className="ovr-rec-wl">{recordStr}</span>
                <span className="ovr-rec-place">{ordinal(placeNum)}</span>
              </div>
              <div className="ovr-rec-line">
                <b>{Math.round(pf)}</b> PF &nbsp; <b>{paDisplay}</b> PA &nbsp; <b>{diffDisplay}</b> DIFF
              </div>
            </div>
            {/* NEXT MATCHUP */}
            <div className="ovr-hblock">
              <div className="ovr-hblock-lbl">Next Matchup</div>
              {nextX ? (
                <>
                  <div className="ovr-mu-opp">vs {oppName}</div>
                  <div className="ovr-mu-date">{nextDate || (weekNum ? `Week ${nextX.matchday}` : 'Scheduled')}</div>
                </>
              ) : (
                <>
                  <div className="ovr-mu-opp">TBD</div>
                  <div className="ovr-mu-date">No fixture yet</div>
                </>
              )}
              <button className="ovr-mu-btn" onClick={function () { navigate('/nfl-rivals/matchday') }}>View Matchup</button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="ovr-tabs">
        {TABS.map(function (t) {
          return (
            <button key={t.label} className={`ovr-tab${t.active ? ' active' : ''}`} onClick={function () { navigate(t.to) }}>{t.label}</button>
          )
        })}
      </div>

      {/* ═══ ROW 1 ═══ */}
      <div className="ovr-row ovr-row-3">
        {/* MY SQUAD */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><TeamOutlined /> My Squad</span>
            <span className="ovr-card-link" style={{ cursor: 'default' }}>53-Man Roster</span>
          </div>
          <div className="ovr-pos-grid">
            {[['QB', rosterGroups.QB], ['RB', rosterGroups.RB], ['WR', rosterGroups.WR], ['TE', rosterGroups.TE], ['OL', rosterGroups.OL], ['DL', rosterGroups.DL], ['LB', rosterGroups.LB], ['DB', rosterGroups.DB], ['ST', rosterGroups.ST]].map(function (x) {
              return (
                <div key={x[0]} className="ovr-pos-cell">
                  <div className="ovr-pos-num">{x[1]}</div>
                  <div className="ovr-pos-lbl">{x[0]}</div>
                </div>
              )
            })}
          </div>
          <div className="ovr-squad-foot">
            <div className="ovr-foot-stat"><div className="ovr-foot-val">{squadLen}/53</div><div className="ovr-foot-lbl">Players</div></div>
            <div className="ovr-foot-stat"><div className="ovr-foot-val">${((entry.squadValue || 0) / 1e6).toFixed(1)}M</div><div className="ovr-foot-lbl">Squad Value</div></div>
            <div className="ovr-foot-stat"><div className={`ovr-foot-val ${entry.squadValid ? 'green' : 'red'}`}>{entry.squadValid ? 'OK' : 'OVER'}</div><div className="ovr-foot-lbl">Cap</div></div>
          </div>
          <button className="ovr-btn-purple" onClick={function () { navigate('/nfl-rivals/squad') }}>Manage Squad</button>
        </div>

        {/* RIVALS WALLET */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><WalletOutlined /> Rivals Wallet</span>
            <button className="ovr-card-link" onClick={function () { navigate('/nfl-rivals/buy-sp') }}>Add Funds</button>
          </div>
          <div className="ovr-bal-lbl">Available Balance</div>
          <div className="ovr-bal-num">{spDisplay} <small>SP</small></div>
          <div className="ovr-kv"><span className="ovr-kv-k">Weekly Income</span><span className="ovr-kv-v">{weeklyIncome != null ? `${weeklyIncome} SP` : '—'}</span></div>
          <div className="ovr-kv"><span className="ovr-kv-k">Transfer Budget</span><span className="ovr-kv-v">—</span></div>
          <div className="ovr-kv"><span className="ovr-kv-k">Pending Bids</span><span className="ovr-kv-v">0</span></div>
          <div className="ovr-kv"><span className="ovr-kv-k">Won / Lost</span><span className="ovr-kv-v"><span style={{ color: '#4ADE80' }}>{wins}</span> / <span style={{ color: '#EF4444' }}>{losses}</span></span></div>
          <button className="ovr-card-link ovr-foot-link" onClick={function () { navigate('/nfl-rivals/history') }}>View Transactions ›</button>
        </div>

        {/* LEAGUE STANDINGS */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><TrophyOutlined /> League Standings</span>
            <button className="ovr-card-link" onClick={function () { navigate('/nfl-rivals/leaderboard') }}>View Full Table</button>
          </div>
          <div className="ovr-tbl-head"><span>#</span><span>Team</span><span style={{ textAlign: 'center' }}>W-L-D</span><span style={{ textAlign: 'right' }}>Pts</span></div>
          {(sortedMembers.length ? sortedMembers : leaderboard).length ? (sortedMembers.length ? sortedMembers : leaderboard).slice(0, 5).map(function (m, idx) {
            var me = isMe(m.user)
            var name = (m.entry && m.entry.teamName) || (m.user && (m.user.userName || m.user.username)) || m.username || m.teamName || 'Manager'
            return (
              <div key={idx} className={`ovr-tbl-row${me ? ' me' : ''}`}>
                <span className="ovr-tbl-rank">{idx + 1}</span>
                <span className="ovr-tbl-team">{name}{me ? ' (You)' : ''}</span>
                <span className="ovr-tbl-wl">{m.wins || 0}-{m.losses || 0}-{m.draws || 0}</span>
                <span className="ovr-tbl-pts">{Math.round(m.totalPoints || m.points || 0)}</span>
              </div>
            )
          }) : <div className="ovr-empty">Pod forming — standings appear once managers are placed.</div>}
          <button className="ovr-card-link ovr-foot-link" onClick={function () { navigate('/nfl-rivals/leaderboard') }}>View Full Standings ›</button>
        </div>
      </div>

      {/* ═══ ROW 2 ═══ */}
      <div className="ovr-row ovr-row-4">
        {/* MATCHDAY */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><ThunderboltOutlined /> Matchday</span>
            {activeWeek && <span className="ovr-badge ovr-badge-green">Week {weekNum} Active</span>}
          </div>
          <div className="ovr-count">
            <div className="ovr-count-cell"><div className="ovr-count-num">{cd.d}</div><div className="ovr-count-lbl">Days</div></div>
            <div className="ovr-count-cell"><div className="ovr-count-num">{cd.h}</div><div className="ovr-count-lbl">Hrs</div></div>
            <div className="ovr-count-cell"><div className="ovr-count-num">{cd.m}</div><div className="ovr-count-lbl">Mins</div></div>
          </div>
          <button className="ovr-card-link ovr-foot-link" onClick={function () { navigate('/nfl-rivals/matchday') }}>View Matchday ›</button>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="ovr-card">
          <div className="ovr-card-hd"><span className="ovr-card-title"><ClockCircleOutlined /> Recent Activity</span></div>
          <div className="ovr-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No recent activity yet.</div>
          <button className="ovr-card-link ovr-foot-link" onClick={function () { navigate('/nfl-rivals/history') }}>View All Activity ›</button>
        </div>

        {/* AI COACH */}
        <div className="ovr-card ovr-card--aicoach">
          <img src={aiCoachRobot} alt="" className="ovr-robot-bg" />
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><RobotOutlined /> AI Coach</span>
            <span className="ovr-badge ovr-badge-ghost">Active</span>
          </div>
          <div className="ovr-check">
            {['Lineup Optimization', 'Tactical Advice', 'Player Comparisons', 'Weekly Insights'].map(function (x) {
              return <div key={x} className="ovr-check-row"><CheckCircleOutlined /> {x}</div>
            })}
          </div>
          <button className="ovr-btn-purple" onClick={function () { navigate('/nfl-rivals/ai-coach') }}>Get Advice</button>
        </div>

        {/* WEEKLY CHALLENGE */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><FireOutlined /> Weekly Challenge</span>
            <span className="ovr-badge ovr-badge-ghost">Active</span>
          </div>
          <div className="ovr-chal-goal">Score 60+ points this Gameweek</div>
          <div className="ovr-prog"><div className="ovr-prog-bar" style={{ width: `${Math.min(100, (challengeCurrent / challengeTarget) * 100)}%` }} /></div>
          <div className="ovr-chal-foot"><span>{challengeCurrent} / {challengeTarget}</span><span>Reward: 100 SP</span></div>
        </div>
      </div>

      {/* ═══ ROW 3 ═══ */}
      <div className="ovr-row ovr-row-3">
        {/* SCORING BREAKDOWN */}
        <div className="ovr-card">
          <div className="ovr-card-hd"><span className="ovr-card-title">Scoring Breakdown</span></div>
          <div className="ovr-donut-wrap">
            <div className="ovr-donut" style={{ width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(139,92,246,0.14)" strokeWidth="12" />
                {donutSegs.map(function (s) {
                  return (
                    <circle key={s.key} cx="55" cy="55" r={R} fill="none" stroke={s.color} strokeWidth="12"
                      strokeDasharray={`${s.len} ${CIRC - s.len}`} strokeDashoffset={-s.offset}
                      transform="rotate(-90 55 55)" strokeLinecap="butt" />
                  )
                })}
              </svg>
              <div className="ovr-donut-center">
                <div className="ovr-donut-total">{projTotal}</div>
                <div className="ovr-donut-cap">Proj. Pts</div>
              </div>
            </div>
            <div className="ovr-legend">
              {scoreTotal > 0 ? scoreOrder.map(function (k) {
                var v = Math.round(scoreGroups[k]); var pct = scoreTotal > 0 ? Math.round((scoreGroups[k] / scoreTotal) * 100) : 0
                return (
                  <div key={k} className="ovr-legend-row">
                    <span className="ovr-dot" style={{ background: scoreColors[k] }} />
                    <span className="ovr-legend-name">{k}</span>
                    <span className="ovr-legend-val">{v}</span>
                    <span className="ovr-legend-pct">{pct}%</span>
                  </div>
                )
              }) : <div className="ovr-empty">Build your squad to see projected scoring.</div>}
            </div>
          </div>
        </div>

        {/* NEXT MATCHUP */}
        <div className="ovr-card">
          <div className="ovr-card-hd"><span className="ovr-card-title">Next Matchup</span></div>
          <div className="ovr-vs">
            <div className="ovr-vs-side">
              <div className="ovr-vs-helmet">🪖</div>
              <div className="ovr-vs-name">You</div>
              <div className="ovr-vs-rec">{recordStr}</div>
            </div>
            <div className="ovr-vs-mid">VS</div>
            <div className="ovr-vs-side">
              <div className="ovr-vs-helmet">🏈</div>
              <div className="ovr-vs-name">{oppName || 'TBD'}</div>
              <div className="ovr-vs-rec">{oppRecord}</div>
            </div>
          </div>
          <div className="ovr-proj">Projected <b>{projTotal}</b> vs <b>—</b></div>
        </div>

        {/* TRENDING PLAYERS */}
        <div className="ovr-card">
          <div className="ovr-card-hd">
            <span className="ovr-card-title"><FireOutlined /> Trending Players</span>
            <button className="ovr-card-link" onClick={function () { navigate('/nfl-rivals/search') }}>See All</button>
          </div>
          {trending && trending.length ? trending.slice(0, 5).map(function (p, i) {
            return (
              <div key={p._id || i} className="ovr-trend-row">
                <div className="ovr-trend-info">
                  <div className="ovr-trend-name">{p.Name || 'Player'}</div>
                  <div className="ovr-trend-meta">{(p.Position || '—')} - {(p.Team || '—')}</div>
                </div>
                <ArrowUpOutlined className="ovr-trend-arrow up" />
              </div>
            )
          }) : <div className="ovr-empty">No trending players right now.</div>}
        </div>
      </div>

      {/* ═══ INVITE ═══ */}
      <NFLRivalsInvite />

      {/* ═══ BOTTOM BAR ═══ */}
      <div className="ovr-bottom">
        <div className="ovr-bottom-half">
          <ClockCircleOutlined />
          <div>
            <div className="ovr-bottom-lbl">Week {weekNum || '—'} Deadline</div>
            <div className="ovr-bottom-val">{deadlineDate}</div>
          </div>
        </div>
        <div className="ovr-bottom-half">
          <MedicineBoxOutlined style={{ color: injuredCount > 0 ? '#EF4444' : '#A78BFA' }} />
          <div>
            <div className="ovr-bottom-lbl">Injury Report</div>
            <div className="ovr-bottom-val">{injuredCount} player{injuredCount === 1 ? '' : 's'} to monitor</div>
          </div>
          <button className="ovr-bottom-link" onClick={function () { navigate('/nfl-rivals/squad') }}><RightOutlined /></button>
        </div>
      </div>
    </div>
  )
}

export default NFLRivalsOverview
