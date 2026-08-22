import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Button, Input, Select, Spin, Empty, notification, Pagination } from 'antd'
import {
  SearchOutlined, TeamOutlined, DeleteOutlined, SaveOutlined,
  ThunderboltOutlined, DollarOutlined, AlertOutlined, LockOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { privateAPI, attachToken } from '../../config/constants'
import { SALARY_CAP, SALARY_FLOOR, OFFENSE_SIZE, DEFENSE_SIZE, SPECIAL_TEAMS_SIZE, BENCH_SIZE } from './rivalsConfig'
import NFLPlayerPopup from '../../components/NFLPlayerPopup/NFLPlayerPopup'
import './nfl-rivals.css'

const POS_OPTIONS = [
  { label: 'Quarterback', value: 'QB' },
  { label: 'Running Back', value: 'RB' },
  { label: 'Wide Receiver', value: 'WR' },
  { label: 'Tight End', value: 'TE' },
  { label: 'Offensive Line', value: 'OL' },
  { label: 'Defensive End', value: 'DE' },
  { label: 'Defensive Tackle', value: 'DT' },
  { label: 'Linebacker', value: 'LB' },
  { label: 'Cornerback', value: 'CB' },
  { label: 'Safety', value: 'S' },
  { label: 'Kicker', value: 'K' },
  { label: 'Punter', value: 'P' },
]

/* ─── Zone config matching backend validation ─── */
const ZONES = [
  { role: 'offense_starter',  label: 'Offense', limit: OFFENSE_SIZE,        color: '#22c55e' },
  { role: 'defense_starter',  label: 'Defense', limit: DEFENSE_SIZE,        color: '#3b82f6' },
  { role: 'special_teams',    label: 'K / P',   limit: SPECIAL_TEAMS_SIZE,  color: '#f59e0b' },
  { role: 'bench',            label: 'Bench',   limit: BENCH_SIZE,          color: '#8b5cf6' },
]

const ROLE_LABELS = {}
const ROLE_LIMITS = {}
ZONES.forEach(z => { ROLE_LABELS[z.role] = z.label; ROLE_LIMITS[z.role] = z.limit })

/* Muted HUD sublabel per zone */
const ZONE_SUB = {
  offense_starter: '11 STARTERS — QB, RB, WR, TE, OL',
  defense_starter: '11 STARTERS — DL, LB, CB, S',
  special_teams: '1 KICKER + 1 PUNTER',
  bench: 'DRAG UP TO PROMOTE',
}
/* Short zone label rendered on each card */
const ZONE_SHORT = {
  offense_starter: 'OFFENSE',
  defense_starter: 'DEFENSE',
  special_teams: 'K/P',
  bench: 'BENCH',
}

/* Position → tint color (purple HUD accents) */
const POS_COLOR = {
  QB: '#EF4444', RB: '#3B82F6', WR: '#22C55E', TE: '#F59E0B',
  // Every code the roster actually publishes, so a left tackle is not a grey
  // badge sitting next to a purple guard doing the same job.
  OL: '#8B5CF6', C: '#8B5CF6', G: '#8B5CF6', OG: '#8B5CF6', OT: '#8B5CF6', T: '#8B5CF6',
  LT: '#8B5CF6', RT: '#8B5CF6', LG: '#8B5CF6', RG: '#8B5CF6',
  DL: '#A855F7', DE: '#A855F7', DT: '#A855F7', NT: '#A855F7', EDGE: '#A855F7', IDL: '#A855F7',
  LB: '#EC4899', ILB: '#EC4899', OLB: '#EC4899', MLB: '#EC4899',
  CB: '#38BDF8', DB: '#38BDF8', S: '#0EA5E9', FS: '#0EA5E9', SS: '#0EA5E9',
  K: '#F59E0B', PK: '#F59E0B', P: '#38BDF8', LS: '#94A3B8',
}

// Real roster data uses granular position codes. These sets held coarse ones
// only, so a left tackle was not an offensive lineman and an inside linebacker
// was not a defender - you could not fill eleven of either, which is the whole
// squad.
//
// Worse, the rejection message asserted the opposite bucket: anything missing
// from OFFENSE_POS was announced as "a defensive/special teams position", so
// the app told users that RT and LG were defensive and ILB was offensive.
// A guess presented as a fact.
const OFFENSE_POS = new Set([
  'QB',
  'RB', 'FB', 'HB',
  'WR', 'TE',
  // Offensive line, every way the data spells it
  'OL', 'OT', 'OG', 'C', 'G', 'T', 'LT', 'RT', 'LG', 'RG',
])
const DEFENSE_POS = new Set([
  // Line
  'DE', 'DT', 'DL', 'NT', 'EDGE', 'IDL',
  // Linebackers
  'LB', 'ILB', 'OLB', 'MLB',
  // Secondary
  'CB', 'DB', 'S', 'SS', 'FS',
])
const SPECIAL_POS = new Set(['K', 'PK', 'P'])

// What a position actually is, for an honest error message.
const zoneOf = (pos) => {
  const p = String(pos || '').toUpperCase()
  if (OFFENSE_POS.has(p)) return 'an offensive'
  if (DEFENSE_POS.has(p)) return 'a defensive'
  if (SPECIAL_POS.has(p)) return 'a special teams'
  return 'an unrecognised'
}

const formatValue = (v) => {
  if (!v) return '—'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K'
  return '$' + v.toString()
}

const getPpg = (p) => {
  if (p.pointsPerGame > 0) return p.pointsPerGame
  if (p.avgPf > 0) return p.avgPf
  const ws = p.weeklyScoring || []
  const scored = ws.filter(w => w.score > 0)
  if (scored.length > 0) return scored.reduce((s, w) => s + w.score, 0) / scored.length
  return p.playerScore || 0
}

const getSalary = (p) => p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || 0

const SquadBuilder = () => {
  const token = useSelector(s => s.user.token)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)
  const [squad, setSquad] = useState([])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const [searchQ, setSearchQ] = useState('')
  const [searchPos, setSearchPos] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [sortField, setSortField] = useState('pointsPerGame')
  const [sortDir, setSortDir] = useState('desc')

  const [dragPlayerId, setDragPlayerId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  const [draftAttempts, setDraftAttempts] = useState(0)
  const [drafting, setDrafting] = useState(false)
  const MAX_DRAFT_ATTEMPTS = 5

  const [collapsed, setCollapsed] = useState({})
  const [recentlyAdded, setRecentlyAdded] = useState([])

  const [popupPlayerId, setPopupPlayerId] = useState(null)
  const [popupPlayer, setPopupPlayer] = useState(null)
  const [popupOpen, setPopupOpen] = useState(false)

  const openPopup = (player) => {
    setPopupPlayerId(player._id || player)
    setPopupPlayer(player)
    setPopupOpen(true)
  }

  const handleRandomDraft = async () => {
    if (draftAttempts >= MAX_DRAFT_ATTEMPTS) {
      notification.warning({ message: 'Draft limit reached', description: "You've used all 5 random drafts. Save your roster to reset." })
      return
    }
    try {
      setDrafting(true)
      attachToken()
      const { data } = await privateAPI.post('/nfl-rivals/random-draft')
      if (data.success && data.data?.squad) {
        setSquad(data.data.squad.map(s => ({
          player: s.player || { _id: s.playerId },
          playerId: s.playerId,
          role: 'bench', // All drafted players go to bench — user arranges them
          position: s.position || '',
        })))
        setDirty(true)
        setDraftAttempts(prev => prev + 1)
        notification.success({
          message: `Random Draft #${draftAttempts + 1}`,
          description: `53 players drafted to Bench! Drag them into Offense, Defense & K/P. ${MAX_DRAFT_ATTEMPTS - draftAttempts - 1} drafts remaining.`,
          duration: 5,
        })
      }
    } catch (err) {
      notification.error({ message: 'Draft failed', description: err.response?.data?.message || 'Could not generate roster' })
    } finally {
      setDrafting(false)
    }
  }

  /* Client-side Auto Fill — promote eligible Bench players into open starter slots */
  const handleAutoFill = () => {
    const updated = squad.map(s => ({ ...s }))
    const fillOrder = [
      { role: 'offense_starter', posSet: OFFENSE_POS, limit: OFFENSE_SIZE },
      { role: 'defense_starter', posSet: DEFENSE_POS, limit: DEFENSE_SIZE },
      { role: 'special_teams', posSet: SPECIAL_POS, limit: SPECIAL_TEAMS_SIZE },
    ]
    let moved = 0
    fillOrder.forEach(z => {
      let count = updated.filter(s => s.role === z.role).length
      let hasQB = z.role === 'offense_starter' &&
        updated.some(s => s.role === 'offense_starter' && (s.player?.Position || s.position) === 'QB')
      for (let i = 0; i < updated.length && count < z.limit; i++) {
        const s = updated[i]
        if (s.role !== 'bench') continue
        const pos = s.player?.Position || s.position || ''
        if (!z.posSet.has(pos)) continue
        if (z.role === 'offense_starter' && pos === 'QB') {
          if (hasQB) continue
          hasQB = true
        }
        updated[i] = { ...s, role: z.role }
        count++
        moved++
      }
    })
    if (moved > 0) {
      setSquad(updated)
      setDirty(true)
      notification.success({ message: 'Auto Fill', description: `Promoted ${moved} bench player${moved > 1 ? 's' : ''} into open starter slots.` })
    } else {
      notification.info({ message: 'Auto Fill', description: 'No eligible bench players to promote — add players or draft first.' })
    }
  }

  useEffect(() => { loadProfile() }, [token]) // eslint-disable-line

  const loadProfile = async () => {
    try {
      setLoading(true)
      attachToken()
      const { data } = await privateAPI.get('/nfl-rivals/profile')
      if (data.data.entry) {
        setEntry(data.data.entry)
        setSquad(data.data.entry.squad || [])
      }
    } catch (err) {
      if (err.response?.status !== 404) console.warn('Squad load issue:', err.response?.status || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async (page = 1) => {
    try {
      setSearchLoading(true)
      attachToken()
      const params = new URLSearchParams()
      if (searchQ) params.append('q', searchQ)
      if (searchPos) params.append('position', searchPos)
      params.append('page', page)
      params.append('limit', 20)
      const { data } = await privateAPI.get(`/nfl-rivals/players/search?${params}`)
      setSearchResults(data.data?.players || [])
      setSearchTotal(data.data?.total || 0)
      setSearchPage(page)
    } catch (err) {
      notification.error({ message: 'Search failed' })
    } finally {
      setSearchLoading(false)
    }
  }, [searchQ, searchPos])

  const addPlayer = (player) => {
    if (squad.length >= 53) { notification.warning({ message: 'Roster full (53/53)' }); return }
    if (squad.find(s => (s.player?._id || s.player) === player._id)) { notification.warning({ message: 'Player already on roster' }); return }
    setSquad([...squad, {
      player: player, playerId: player._id,
      role: 'bench', position: player.Position || '',
    }])
    setRecentlyAdded(prev => [player, ...prev.filter(x => x._id !== player._id)].slice(0, 6))
    setDirty(true)
  }

  const removePlayer = (playerId) => {
    setSquad(squad.filter(s => (s.player?._id || s.player) !== playerId))
    setDirty(true)
  }

  const changeRole = (playerId, newRole) => {
    const movingPlayer = squad.find(s => (s.player?._id || s.player) === playerId)
    const movingPos = movingPlayer?.player?.Position || movingPlayer?.position || ''

    // Position-to-zone validation (bench accepts anyone)
    if (newRole === 'offense_starter' && !OFFENSE_POS.has(movingPos)) {
      notification.warning({
        message: `${movingPos} can't play Offense`,
        description: `${movingPos} is ${zoneOf(movingPos)} position. Move to Defense, K/P, or Bench.`,
      })
      return
    }
    if (newRole === 'defense_starter' && !DEFENSE_POS.has(movingPos)) {
      notification.warning({
        message: `${movingPos} can't play Defense`,
        description: `${movingPos} is ${zoneOf(movingPos)} position. Move to Offense, K/P, or Bench.`,
      })
      return
    }
    if (newRole === 'special_teams' && !SPECIAL_POS.has(movingPos)) {
      notification.warning({ message: `${movingPos} can't play K/P`, description: `Only Kickers (K) and Punters (P) go in Special Teams.` })
      return
    }

    // Zone capacity check
    const currentCount = squad.filter(s => s.role === newRole).length
    if (currentCount >= ROLE_LIMITS[newRole]) {
      notification.warning({ message: `${ROLE_LABELS[newRole]} is full (${ROLE_LIMITS[newRole]}/${ROLE_LIMITS[newRole]})` })
      return
    }

    // QB rule: only 1 QB in offense
    if (newRole === 'offense_starter' && movingPos === 'QB') {
      const offenseQBs = squad.filter(s => s.role === 'offense_starter' && (s.player?.Position || s.position) === 'QB')
      if (offenseQBs.length >= 1) {
        notification.warning({ message: 'Only 1 starting QB allowed', description: 'Move your current QB to Bench first.' })
        return
      }
    }

    const updated = squad.map(s => {
      const pid = s.player?._id || s.player
      return pid === playerId ? { ...s, role: newRole } : s
    })
    setSquad(updated)
    setDirty(true)

    // Auto-save silently after zone change — but keep dirty=true
    // so the Save button stays enabled for the user to confirm
    handleSave(updated, true, true)
  }

  const handleSave = useCallback(async (squadToSave, silent = false, keepDirty = false) => {
    const sq = squadToSave || squad
    if (sq.length === 0) return

    try {
      setSaving(true)
      attachToken()
      const payload = sq.map(s => ({
        playerId: s.player?._id || s.player,
        role: s.role,
        position: s.player?.Position || s.position || '',
      }))
      const { data } = await privateAPI.post('/nfl-rivals/squad', { squad: payload })
      if (data.data?.entry) { setEntry(data.data.entry); setSquad(data.data.entry.squad || []) }
      if (!keepDirty) setDirty(false)
      setDraftAttempts(0)
      if (!silent) {
        const alloc = data.data?.allocation
        if (alloc) {
          notification.success({ message: 'Roster saved & allocated!', description: `Placed in ${alloc.divisionName} — ${alloc.seasonName}, Pod ${alloc.podNumber}`, duration: 6 })
        } else {
          notification.success({ message: 'Roster saved!' })
        }
      }
    } catch (err) {
      if (!silent) {
        notification.error({ message: 'Save failed', description: err.response?.data?.message || 'Check roster rules' })
      }
    } finally {
      setSaving(false)
    }
  }, [squad]) // eslint-disable-line

  /* ─── Drag & Drop ─── */
  const handleDragStart = (e, playerId) => { setDragPlayerId(playerId); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e, role) => { e.preventDefault(); if (dropTarget !== role) setDropTarget(role) }
  const handleDragLeave = (e, role) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      if (dropTarget === role) setDropTarget(null)
    }
  }
  const handleDrop = (e, targetRole) => {
    e.preventDefault(); setDropTarget(null)
    if (!dragPlayerId) return
    const currentSlot = squad.find(s => (s.player?._id || s.player) === dragPlayerId)
    if (!currentSlot || currentSlot.role === targetRole) { setDragPlayerId(null); return }
    changeRole(dragPlayerId, targetRole)
    setDragPlayerId(null)
  }
  const handleDragEnd = () => { setDragPlayerId(null); setDropTarget(null) }

  const sortedResults = [...searchResults].sort((a, b) => {
    const aVal = a[sortField] || 0, bVal = b[sortField] || 0
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal
  })
  const isInSquad = (pid) => squad.some(s => (s.player?._id || s.player) === pid)

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>

  const totalSalary = squad.reduce((sum, s) => sum + getSalary(s.player || {}), 0)
  const capPct = Math.min((totalSalary / SALARY_CAP) * 100, 100)
  const overCap = totalSalary > SALARY_CAP
  const underFloor = totalSalary < SALARY_FLOOR
  const overBy = totalSalary - SALARY_CAP

  const offCount = squad.filter(s => s.role === 'offense_starter').length
  const defCount = squad.filter(s => s.role === 'defense_starter').length
  const stCount = squad.filter(s => s.role === 'special_teams').length
  const benchCount = squad.filter(s => s.role === 'bench').length

  const trending = [...searchResults].sort((a, b) => getPpg(b) - getPpg(a)).slice(0, 5)

  const SortHeader = ({ field, label }) => {
    const isActive = sortField === field
    return (
      <span onClick={() => {
        if (isActive) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
        else { setSortField(field); setSortDir('desc') }
      }} style={{
        cursor: 'pointer', color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.4)',
        userSelect: 'none', display: 'flex', alignItems: 'center', gap: 2,
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
        textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif",
      }}>
        {label}{isActive && <span style={{ fontSize: 9 }}>{sortDir === 'desc' ? ' ▼' : ' ▲'}</span>}
      </span>
    )
  }

  /* ─── Player Card ─── */
  const renderMiniCard = (s) => {
    const p = s.player || {}
    const pid = p._id || s.player
    const pos = p.Position || s.position || ''
    const posColor = POS_COLOR[pos] || '#94A3B8'
    const playerName = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
    const headshot = p.HostedHeadshotNoBackgroundUrl || p.Photo || p.photo || p.headshot
    const isDragging = dragPlayerId === pid
    const rating = getPpg(p)
    const ratingTier = rating >= 15 ? 'elite' : rating >= 8 ? 'good' : 'avg'

    return (
      <div key={pid} className={`nrb-card${isDragging ? ' nrb-card--drag' : ''}`}
        style={{ '--pos-color': posColor }}
        draggable onDragStart={(e) => handleDragStart(e, pid)} onDragEnd={handleDragEnd}
        onClick={() => openPopup(p)}>
        <span className="nrb-card-pos" style={{ background: posColor }}>{pos}</span>
        <button className="nrb-card-lock" onClick={(e) => { e.stopPropagation(); removePlayer(pid) }} title="Remove player">
          <LockOutlined className="nrb-lock-i" />
          <DeleteOutlined className="nrb-del-i" />
        </button>
        <div className="nrb-card-photo" style={{ '--ring': posColor }}>
          {p.Team && <img className="nrb-card-teamlogo" src={`https://a.espncdn.com/i/teamlogos/nfl/500/${String(p.Team).toLowerCase()}.png`} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
          <span className="nrb-card-ph">{playerName.charAt(0)}</span>
          {headshot && <img src={headshot} alt="" className="nrb-card-img" onError={(e) => { e.currentTarget.remove() }} />}
          {p.isPlayerInjured && <span className="nrb-card-inj"><AlertOutlined /></span>}
        </div>
        <div className="nrb-card-name">{playerName.split(' ').pop()}</div>
        <div className="nrb-card-meta">
          <span className={`nrb-card-rating nrb-card-rating--${ratingTier}`}>{rating.toFixed(1)}</span>
          <span className="nrb-card-value">{formatValue(getSalary(p))}</span>
        </div>
        <div className="nrb-card-zonelbl">{ZONE_SHORT[s.role] || 'BENCH'}</div>
      </div>
    )
  }

  const renderEmptySlot = (role, idx) => (
    <div key={`empty-${role}-${idx}`} className="nrb-card nrb-card--empty">
      <div className="nrb-empty-plus">+</div>
      <div className="nrb-empty-label">{ZONE_SHORT[role]}</div>
    </div>
  )

  const renderZone = (zone) => {
    const players = squad.filter(s => s.role === zone.role)
    const emptySlots = Math.max(0, zone.limit - players.length)
    const isCollapsed = collapsed[zone.role]
    return (
      <section key={zone.role}
        className={`nrb-zone${dropTarget === zone.role ? ' nrb-zone--drop' : ''}`}
        style={{ '--zone-color': zone.color }}
        onDragOver={(e) => handleDragOver(e, zone.role)}
        onDragLeave={(e) => handleDragLeave(e, zone.role)}
        onDrop={(e) => handleDrop(e, zone.role)}>
        <div className="nrb-zone-head">
          <span className="nrb-zone-dot" />
          <span className="nrb-zone-title">{zone.label.toUpperCase()}</span>
          <span className="nrb-zone-count">{players.length}/{zone.limit}</span>
          <span className="nrb-zone-sub">{ZONE_SUB[zone.role]}</span>
          <button type="button" className="nrb-zone-chev"
            onClick={() => setCollapsed(c => ({ ...c, [zone.role]: !c[zone.role] }))}
            aria-label="Toggle section">
            {isCollapsed ? '▸' : '▾'}
          </button>
        </div>
        {!isCollapsed && (
          <div className="nrb-row-wrap">
            <button type="button" className="nrb-arrow nrb-arrow-l" aria-label="Scroll left"
              onClick={(e) => { const r = e.currentTarget.parentElement.querySelector('.nrb-card-row'); if (r) r.scrollBy({ left: -320, behavior: 'smooth' }) }}>‹</button>
            <div className="nrb-card-row">
              {players.map(s => renderMiniCard(s))}
              {Array.from({ length: emptySlots }).map((_, i) => renderEmptySlot(zone.role, i))}
            </div>
            <button type="button" className="nrb-arrow nrb-arrow-r" aria-label="Scroll right"
              onClick={(e) => { const r = e.currentTarget.parentElement.querySelector('.nrb-card-row'); if (r) r.scrollBy({ left: 320, behavior: 'smooth' }) }}>›</button>
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="nflr-page nrb-page">
      {/* ═══ Header ═══ */}
      <div className="nrb-header">
        <h2 className="nrb-title"><TeamOutlined /> Roster Builder</h2>
        <button
          className={`nrb-savepill${dirty ? ' nrb-savepill--dirty' : ''}`}
          disabled={saving || squad.length === 0}
          onClick={() => handleSave(null, false)}>
          <SaveOutlined /> {saving ? 'Saving…' : dirty ? 'Save Roster' : 'Roster Saved ✓'}
        </button>
      </div>

      {/* ═══ Stats Bar ═══ */}
      <div className="nrb-statsbar">
        <div className="nrb-statcells">
          <div className="nrb-stat">
            <span className="nrb-stat-num" style={{ color: squad.length === 53 ? '#4ADE80' : '#e2e8f0' }}>{squad.length}/53</span>
            <span className="nrb-stat-lbl">Players</span>
          </div>
          <div className="nrb-stat">
            <span className="nrb-stat-num" style={{ color: '#22c55e' }}>{offCount}/11</span>
            <span className="nrb-stat-lbl">Offense</span>
          </div>
          <div className="nrb-stat">
            <span className="nrb-stat-num" style={{ color: '#3b82f6' }}>{defCount}/11</span>
            <span className="nrb-stat-lbl">Defense</span>
          </div>
          <div className="nrb-stat">
            <span className="nrb-stat-num" style={{ color: '#f59e0b' }}>{stCount}/2</span>
            <span className="nrb-stat-lbl">K / P</span>
          </div>
          <div className="nrb-stat">
            <span className="nrb-stat-num" style={{ color: '#A78BFA' }}>{benchCount}/29</span>
            <span className="nrb-stat-lbl">Bench</span>
          </div>
        </div>

        <div className="nrb-cap">
          <div className="nrb-cap-head">
            <span className="nrb-cap-lbl">Salary Cap</span>
            <span className="nrb-cap-val" style={{ color: overCap ? '#EF4444' : underFloor ? '#f59e0b' : '#4ADE80' }}>
              {formatValue(totalSalary)} / {formatValue(SALARY_CAP)}
            </span>
          </div>
          <div className="nrb-cap-bar">
            <div className="nrb-cap-fill" style={{ width: `${capPct}%`, background: overCap ? '#EF4444' : 'linear-gradient(90deg,#22c55e,#4ADE80)' }} />
          </div>
          {overCap
            ? <div className="nrb-cap-note nrb-cap-note--over">Over by {formatValue(overBy)}</div>
            : underFloor
              ? <div className="nrb-cap-note nrb-cap-note--warn">Min floor: {formatValue(SALARY_FLOOR)}</div>
              : <div className="nrb-cap-note nrb-cap-note--ok">Under cap ✓</div>}
        </div>

        <div className="nrb-actions">
          <button className="nrb-btn nrb-btn--primary" disabled={drafting || draftAttempts >= MAX_DRAFT_ATTEMPTS} onClick={handleRandomDraft}>
            <ThunderboltOutlined /> {drafting ? 'Drafting…' : `Random Draft${draftAttempts > 0 ? ` (${MAX_DRAFT_ATTEMPTS - draftAttempts})` : ''}`}
          </button>
          <button className="nrb-btn nrb-btn--dark" onClick={handleAutoFill}>Auto Fill</button>
          <button className="nrb-btn nrb-btn--green" onClick={() => navigate('/nfl-rivals/buy-sp')}>
            <DollarOutlined /> Buy SP
          </button>
        </div>
      </div>

      {/* ═══ Zone Sections ═══ */}
      {ZONES.map(renderZone)}

      {/* ═══ Bottom: Find Players + side panels ═══ */}
      <div className="nrb-bottom">
        <div className="nrb-panel nrb-find">
          <h3 className="nrb-find-title"><SearchOutlined /> Find Players</h3>
          <div className="nrb-find-row">
            <Input className="nrb-find-input" placeholder="Search by name…" value={searchQ}
              onChange={e => setSearchQ(e.target.value)} onPressEnter={() => handleSearch(1)} allowClear
              prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} />
            <Select className="nrb-find-sel" placeholder="Position" allowClear style={{ minWidth: 150 }}
              value={searchPos || undefined} onChange={v => setSearchPos(v || '')} options={POS_OPTIONS} />
            <Button className="nrb-find-btn" type="primary" loading={searchLoading} onClick={() => handleSearch(1)}
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', fontWeight: 700 }}>
              Search
            </Button>
          </div>

          <div style={{ marginTop: 16 }}>
            {searchLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
            ) : sortedResults.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, padding: '0 16px', flexWrap: 'wrap' }}>
                  <SortHeader field="pointsPerGame" label="Avg Wk Pts" />
                  <SortHeader field="PlayerCap" label="Salary" />
                  <SortHeader field="samAdp24" label="ADP" />
                </div>
                {sortedResults.map(p => {
                  const pos = p.Position || ''
                  const posColor = POS_COLOR[pos] || '#94A3B8'
                  const playerName = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
                  const headshot = p.HostedHeadshotNoBackgroundUrl
                  const inSquad = isInSquad(p._id)
                  return (
                    <div key={p._id} className={`rp-row${inSquad ? ' in-squad' : ''}`}>
                      <div className="rp-row-identity">
                        {headshot ? <img src={headshot} alt="" className="rp-row-photo" /> : (
                          <div className="rp-row-photo-placeholder"><span className="rp-row-photo-letter">{playerName.charAt(0)}</span></div>
                        )}
                        <div className="rp-row-info">
                          <div className="rp-row-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="rp-clickable-name" style={{ cursor: 'pointer' }} onClick={() => openPopup(p)}>{playerName}</span>
                            {p.isPlayerInjured && <AlertOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
                          </div>
                          <div className="rp-row-meta">
                            <span className="rp-row-pos-tag" style={{ background: `${posColor}20`, color: posColor, border: `1px solid ${posColor}40` }}>{pos}</span>
                            <span>{p.Team || '-'}</span>
                            {p.Number && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>#{p.Number}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="rp-row-center">
                        <div className="rp-row-stats">
                          <div className="rp-row-stat"><span className="rp-row-stat-label">Avg Wk Pts</span><span className="rp-row-stat-value teal">{getPpg(p).toFixed(1)}</span></div>
                          <div className="rp-row-stat"><span className="rp-row-stat-label">Salary</span><span className="rp-row-stat-value">{formatValue(getSalary(p))}</span></div>
                        </div>
                      </div>
                      <div className="rp-row-actions">
                        {inSquad ? <span className="rp-row-btn in-squad-tag">On Roster</span> : (
                          <button className="rp-row-btn buy" onClick={() => addPlayer(p)}>+ Sign</button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {searchTotal > 20 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination current={searchPage} total={searchTotal} pageSize={20} onChange={(p) => handleSearch(p)} showSizeChanger={false} size="small" />
                  </div>
                )}
              </>
            ) : (
              <Empty description="Search for players to add to your roster" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>

        <div className="nrb-side">
          <div className="nrb-panel nrb-mini">
            <div className="nrb-mini-head">TRENDING PLAYERS</div>
            {trending.length > 0 ? trending.map(p => {
              const pos = p.Position || ''
              const posColor = POS_COLOR[pos] || '#94A3B8'
              const name = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
              return (
                <div key={p._id} className="nrb-mini-row" onClick={() => openPopup(p)}>
                  <div className="nrb-mini-info">
                    <span className="nrb-mini-name">{name}</span>
                    <span className="nrb-mini-sub" style={{ color: posColor }}>{pos} · {p.Team || '-'}</span>
                  </div>
                  <span className="nrb-mini-val">{getPpg(p).toFixed(1)}</span>
                </div>
              )
            }) : <div className="nrb-mini-empty">Search to see top-rated players</div>}
          </div>

          <div className="nrb-panel nrb-mini">
            <div className="nrb-mini-head">RECENTLY ADDED</div>
            {recentlyAdded.length > 0 ? recentlyAdded.map(p => {
              const pos = p.Position || ''
              const posColor = POS_COLOR[pos] || '#94A3B8'
              const name = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
              return (
                <div key={p._id} className="nrb-mini-row" onClick={() => openPopup(p)}>
                  <div className="nrb-mini-info">
                    <span className="nrb-mini-name">{name}</span>
                    <span className="nrb-mini-sub" style={{ color: posColor }}>{pos} · {p.Team || '-'}</span>
                  </div>
                  <span className="nrb-mini-val">{getPpg(p).toFixed(1)}</span>
                </div>
              )
            }) : <div className="nrb-mini-empty">Players you sign this session appear here</div>}
          </div>
        </div>
      </div>

      <NFLPlayerPopup playerId={popupPlayerId} player={popupPlayer} isOpen={popupOpen}
        onClose={() => { setPopupOpen(false); setPopupPlayerId(null); setPopupPlayer(null) }} />
    </div>
  )
}

export default SquadBuilder
