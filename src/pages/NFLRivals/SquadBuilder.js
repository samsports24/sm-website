import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Card, Button, Row, Col, Input, Select, Tag, Progress,
  Statistic, Spin, Empty, notification, Pagination
} from 'antd'
import {
  SearchOutlined, TeamOutlined, DeleteOutlined,
  SaveOutlined, HolderOutlined, MedicineBoxOutlined,
  AlertOutlined, ThunderboltOutlined, DollarOutlined
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
  { role: 'offense_starter',  label: 'Offense',       sublabel: '11 starters — QB, RB, WR, TE, OL', limit: OFFENSE_SIZE, color: '#22c55e' },
  { role: 'defense_starter',  label: 'Defense',        sublabel: '11 starters — DL, LB, CB, S',      limit: DEFENSE_SIZE, color: '#3b82f6' },
  { role: 'special_teams',    label: 'K / P',          sublabel: '1 Kicker + 1 Punter',               limit: SPECIAL_TEAMS_SIZE,  color: '#f59e0b' },
  { role: 'bench',            label: 'Bench',          sublabel: 'Depth & backups (29 slots)',         limit: BENCH_SIZE, color: '#64748b' },
]

const ROLE_COLORS = {}
const ROLE_LABELS = {}
const ROLE_LIMITS = {}
ZONES.forEach(z => { ROLE_COLORS[z.role] = z.color; ROLE_LABELS[z.role] = z.label; ROLE_LIMITS[z.role] = z.limit })

const POS_COLOR = {
  QB: '#ef4444', RB: '#3b82f6', WR: '#22c55e', TE: '#f59e0b',
  OL: '#64748b', OT: '#64748b', OG: '#64748b', C: '#64748b', G: '#64748b', T: '#64748b',
  DE: '#a855f7', DT: '#a855f7', LB: '#ec4899', CB: '#06b6d4', S: '#06b6d4', SS: '#06b6d4', FS: '#06b6d4',
  K: '#78716c', P: '#78716c',
}

const OFFENSE_POS = new Set(['QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C', 'G', 'T'])
const DEFENSE_POS = new Set(['DE', 'DT', 'LB', 'CB', 'S', 'SS', 'FS'])
const SPECIAL_POS = new Set(['K', 'P'])

/* Suggest which zone a position belongs to */
const suggestRole = (pos) => {
  if (OFFENSE_POS.has(pos)) return 'offense_starter'
  if (DEFENSE_POS.has(pos)) return 'defense_starter'
  if (SPECIAL_POS.has(pos)) return 'special_teams'
  return 'bench'
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

/* ═══ AI Coach Inline ═══ */
const analyzeSquad = (squad) => {
  const tips = []
  if (!squad || squad.length === 0) return [{ icon: '🧠', text: 'Start building your roster — the AI Coach will analyze it as you add players.', color: '#A78BFA' }]

  const offense = squad.filter(s => s.role === 'offense_starter')
  const defense = squad.filter(s => s.role === 'defense_starter')
  const special = squad.filter(s => s.role === 'special_teams')

  if (offense.length < 11) tips.push({ icon: '🏈', text: `Offense: ${offense.length}/11 starters. Drag players from Bench to Offense.`, color: '#22c55e' })
  if (defense.length < 11) tips.push({ icon: '🛡️', text: `Defense: ${defense.length}/11 starters. Drag players from Bench to Defense.`, color: '#3b82f6' })
  if (special.length < 2) tips.push({ icon: '🦶', text: `Special Teams: ${special.length}/2. Add a Kicker and Punter.`, color: '#f59e0b' })

  const activeQBs = offense.filter(s => (s.player?.Position || s.position) === 'QB')
  if (offense.length >= 1 && activeQBs.length === 0) tips.push({ icon: '⚠️', text: 'No QB in Offense — you need exactly 1 starting quarterback.', color: '#ef4444' })
  if (activeQBs.length > 1) tips.push({ icon: '⚠️', text: `${activeQBs.length} QBs in Offense — only 1 is allowed.`, color: '#ef4444' })

  if (squad.length < 40) tips.push({ icon: '📋', text: `${squad.length}/53 roster spots used. Fill your roster for maximum depth.`, color: '#A78BFA' })

  const injured = squad.filter(s => s.player?.isPlayerInjured)
  if (injured.length > 0) tips.push({ icon: '🏥', text: `${injured.length} injured player${injured.length > 1 ? 's' : ''}. Check your depth chart.`, color: '#ef4444' })

  if (tips.length === 0) tips.push({ icon: '✅', text: 'Roster looks solid! Save when ready.', color: '#22c55e' })
  return tips.slice(0, 3)
}

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
      notification.warning({ message: `${movingPos} can't play Offense`, description: `${movingPos} is a defensive/special teams position. Move to Defense, K/P, or Bench.` })
      return
    }
    if (newRole === 'defense_starter' && !DEFENSE_POS.has(movingPos)) {
      notification.warning({ message: `${movingPos} can't play Defense`, description: `${movingPos} is an offensive/special teams position. Move to Offense, K/P, or Bench.` })
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

  /* ─── Mini Player Card ─── */
  const renderMiniCard = (s, zone) => {
    const p = s.player || {}
    const pid = p._id || s.player
    const pos = p.Position || s.position || ''
    const posColor = POS_COLOR[pos] || '#94a3b8'
    const playerName = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
    const headshot = p.HostedHeadshotNoBackgroundUrl || p.Photo
    const isDragging = dragPlayerId === pid
    const rating = getPpg(p)
    const ratingTier = rating >= 15 ? 'elite' : rating >= 8 ? 'good' : 'avg'

    return (
      <div key={pid} className={`mc-card${isDragging ? ' mc-dragging' : ''}`}
        style={{ '--mc-pos-color': posColor }}
        draggable onDragStart={(e) => handleDragStart(e, pid)} onDragEnd={handleDragEnd}
        onClick={() => openPopup(p)}>
        <button className="mc-cut" onClick={(e) => { e.stopPropagation(); removePlayer(pid) }} title="Cut player">
          <DeleteOutlined />
        </button>
        <div className="mc-pos-badge" style={{ background: posColor }}>{pos}</div>
        <div className="mc-photo-wrap">
          <div className="mc-photo-ring"><div className="mc-photo-ring-inner" /></div>
          {headshot ? (
            <img src={headshot} alt="" className="mc-photo" />
          ) : (
            <div className="mc-photo-ph"><span>{playerName.charAt(0)}</span></div>
          )}
          {p.isPlayerInjured && <span className="mc-injured"><AlertOutlined /></span>}
        </div>
        <div className="mc-name">{playerName.split(' ').pop()}</div>
        <div className="mc-details">
          <span className={`mc-rating mc-rating--${ratingTier}`}>
            {rating.toFixed(1)}
          </span>
          <span className="mc-value">{formatValue(getSalary(p))}</span>
        </div>
        <select className="mc-zone-select" value={zone.role}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => changeRole(pid, e.target.value)}>
          {ZONES.map(z => <option key={z.role} value={z.role}>{z.label}</option>)}
        </select>
      </div>
    )
  }

  /* ─── Empty slot placeholder ─── */
  const renderEmptySlot = (zone, idx) => (
    <div key={`empty-${zone.role}-${idx}`} className="mc-card mc-empty">
      <div className="mc-empty-icon">+</div>
      <div className="mc-empty-label">{zone.label}</div>
    </div>
  )

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><TeamOutlined /> Roster Builder</h2>

      {/* ═══ Stats Bar ═══ */}
      <Card className="nflr-card" bordered={false} style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col xs={12} sm={3}>
            <Statistic title="Players" value={squad.length} suffix="/ 53" valueStyle={{ color: squad.length === 53 ? '#4ade80' : '#e2e8f0' }} />
          </Col>
          {ZONES.map(z => (
            <Col xs={12} sm={3} key={z.role}>
              <Statistic title={z.label} value={squad.filter(s => s.role === z.role).length} suffix={`/ ${z.limit}`} valueStyle={{ color: z.color }} />
            </Col>
          ))}
          <Col xs={24} sm={9}>
            <div className="nflr-stat-row" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Salary Cap</span>
              <strong style={{ color: totalSalary > SALARY_CAP ? '#ef4444' : totalSalary < SALARY_FLOOR ? '#f59e0b' : '#A78BFA', fontSize: 14 }}>
                {formatValue(totalSalary)} / {formatValue(SALARY_CAP)}
              </strong>
            </div>
            <Progress percent={capPct} strokeColor={totalSalary > SALARY_CAP ? '#ef4444' : '#A78BFA'} showInfo={false} size="small" />
            {totalSalary < SALARY_FLOOR && (
              <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>Min floor: {formatValue(SALARY_FLOOR)}</div>
            )}
          </Col>
        </Row>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Button type="primary" size="large" icon={<ThunderboltOutlined />} loading={drafting}
            disabled={draftAttempts >= MAX_DRAFT_ATTEMPTS} onClick={handleRandomDraft}
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', fontWeight: 700, flex: '0 0 auto' }}>
            {drafting ? 'Drafting...' : `Random Draft${draftAttempts > 0 ? ` (${MAX_DRAFT_ATTEMPTS - draftAttempts} left)` : ''}`}
          </Button>
          <Button block type="primary" size="large" icon={<SaveOutlined />}
            loading={saving} disabled={saving || squad.length === 0} onClick={() => handleSave(null, false)} className="nflr-gold-btn">
            {saving ? 'Saving…' : dirty ? 'Save Roster' : 'Roster Saved ✓'}
          </Button>
          <Button size="large" icon={<DollarOutlined />} onClick={() => navigate('/nfl-rivals/buy-sp')}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700, color: '#fff', flex: '0 0 auto' }}>
            Buy SP
          </Button>
        </div>
      </Card>

      {/* ═══ AI Coach ═══ */}
      <div style={{
        background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 'fit-content' }}>
          <MedicineBoxOutlined style={{ fontSize: 20, color: '#A78BFA' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#A78BFA', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px' }}>AI COACH</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analyzeSquad(squad).map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#CBD5E1' }}>
              <span>{tip.icon}</span>
              <span style={{ color: tip.color, fontWeight: 500 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Drag Instruction ═══ */}
      <div style={{ marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
        Drag players between zones, or use the dropdown on each player card
      </div>

      {/* ═══ Starter Zones (Offense, Defense, K/P) — Card Grid ═══ */}
      {ZONES.filter(z => z.role !== 'bench').map(zone => {
        const zonePlayers = squad.filter(s => s.role === zone.role)
        const emptySlots = Math.max(0, zone.limit - zonePlayers.length)
        return (
          <div key={zone.role}
            className={`mc-zone${dropTarget === zone.role ? ' mc-zone-drop' : ''}${dragPlayerId ? ' mc-zone-dragging' : ''}`}
            onDragOver={(e) => handleDragOver(e, zone.role)}
            onDragLeave={(e) => handleDragLeave(e, zone.role)}
            onDrop={(e) => handleDrop(e, zone.role)}
            style={{ '--zone-accent': zone.color }}>
            <div className="mc-zone-header">
              <span className="mc-zone-dot" style={{ background: zone.color }} />
              <span className="mc-zone-label">{zone.label}</span>
              <span className="mc-zone-count">{zonePlayers.length}/{zone.limit}</span>
              <span className="mc-zone-scoring">{zone.sublabel}</span>
            </div>
            <div className="mc-grid">
              {zonePlayers.map(s => renderMiniCard(s, zone))}
              {emptySlots > 0 && Array.from({ length: Math.min(emptySlots, 4) }).map((_, i) => renderEmptySlot(zone, i))}
            </div>
          </div>
        )
      })}

      {/* ═══ Bench — Horizontal Scroll Carousel ═══ */}
      {(() => {
        const benchZone = ZONES.find(z => z.role === 'bench')
        const benchPlayers = squad.filter(s => s.role === 'bench')
        return (
          <div
            className={`mc-zone mc-zone-bench${dropTarget === 'bench' ? ' mc-zone-drop' : ''}${dragPlayerId ? ' mc-zone-dragging' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'bench')}
            onDragLeave={(e) => handleDragLeave(e, 'bench')}
            onDrop={(e) => handleDrop(e, 'bench')}
            style={{ '--zone-accent': benchZone.color }}>
            <div className="mc-zone-header">
              <span className="mc-zone-dot" style={{ background: benchZone.color }} />
              <span className="mc-zone-label">Bench</span>
              <span className="mc-zone-count">{benchPlayers.length}/{benchZone.limit}</span>
              <span className="mc-zone-scoring">Drag up to promote</span>
            </div>
            {benchPlayers.length > 0 ? (
              <div className="mc-carousel">
                <div className="mc-carousel-track">
                  {benchPlayers.map(s => renderMiniCard(s, benchZone))}
                </div>
              </div>
            ) : (
              <div className="mc-zone-empty-msg">
                {dragPlayerId ? 'Drop here for Bench' : 'No bench players — search below to sign players'}
              </div>
            )}
          </div>
        )
      })()}

      {/* ═══ Player Search ═══ */}
      <Card className="nflr-card" bordered={false} style={{ marginBottom: 20, marginTop: 24 }}>
        <h3 className="nflr-card-heading"><SearchOutlined /> Find Players</h3>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10}>
            <Input placeholder="Search by name..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onPressEnter={() => handleSearch(1)} allowClear prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} />
          </Col>
          <Col xs={12} sm={6}>
            <Select placeholder="Position" allowClear style={{ width: '100%' }}
              value={searchPos || undefined} onChange={v => setSearchPos(v || '')} options={POS_OPTIONS} />
          </Col>
          <Col xs={12} sm={8}>
            <Button type="primary" block loading={searchLoading} onClick={() => handleSearch(1)} className="nflr-gold-btn">Search</Button>
          </Col>
        </Row>

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
                const posColor = POS_COLOR[pos] || '#94a3b8'
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
      </Card>

      <NFLPlayerPopup playerId={popupPlayerId} player={popupPlayer} isOpen={popupOpen}
        onClose={() => { setPopupOpen(false); setPopupPlayerId(null); setPopupPlayer(null) }} />
    </div>
  )
}

export default SquadBuilder
