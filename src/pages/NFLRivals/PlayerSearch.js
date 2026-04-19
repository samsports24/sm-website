import React, { useState, useEffect, useCallback } from 'react'
import { Input, Select, Button, Spin, Empty, Pagination, notification } from 'antd'
import { SearchOutlined, AlertOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import NFLPlayerPopup from '../../components/NFLPlayerPopup/NFLPlayerPopup'
import PlayerAvatar from '../../components/PlayerAvatar'
import './nfl-rivals.css'

const POS_OPTIONS = [
  { label: 'QB', value: 'QB' }, { label: 'RB', value: 'RB' },
  { label: 'WR', value: 'WR' }, { label: 'TE', value: 'TE' },
  { label: 'OT', value: 'OT' }, { label: 'OG', value: 'OG' },
  { label: 'C', value: 'C' }, { label: 'DE', value: 'DE' },
  { label: 'DT', value: 'DT' }, { label: 'LB', value: 'LB' },
  { label: 'CB', value: 'CB' }, { label: 'S', value: 'S' },
  { label: 'K', value: 'K' }, { label: 'P', value: 'P' },
]

const POS_COLOR = {
  QB: '#ef4444', RB: '#3b82f6', WR: '#22c55e', TE: '#f59e0b',
  OT: '#64748b', OG: '#64748b', C: '#64748b',
  DE: '#a855f7', DT: '#a855f7', LB: '#ec4899', CB: '#06b6d4', S: '#06b6d4',
  K: '#78716c', P: '#78716c',
}

const formatValue = (v) => {
  if (!v) return '—'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K'
  return '$' + v
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

const PlayerSearch = () => {
  const [searchQ, setSearchQ] = useState('')
  const [searchPos, setSearchPos] = useState('')
  const [searchTeam, setSearchTeam] = useState('')
  const [availableTeams, setAvailableTeams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Squad tracking
  const [squadIds, setSquadIds] = useState(new Set())
  const [signing, setSigning] = useState(null)

  // Player popup
  const [popupPlayerId, setPopupPlayerId] = useState(null)
  const [popupPlayer, setPopupPlayer] = useState(null)
  const [popupOpen, setPopupOpen] = useState(false)

  // Load current squad to know who's already signed
  useEffect(() => {
    const loadSquad = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/profile')
        const squad = data.data?.entry?.squad || []
        const ids = new Set(squad.map(s => s.player?._id || s.player))
        setSquadIds(ids)
      } catch (err) { /* no entry yet */ }
    }
    loadSquad()
  }, [])

  // Fetch distinct NFL teams for filter dropdown
  useEffect(() => {
    let cancelled = false
    const fetchTeams = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/players/teams')
        if (!cancelled) setAvailableTeams(data.data?.teams || [])
      } catch (err) {
        console.warn('Could not fetch NFL teams')
      }
    }
    fetchTeams()
    return () => { cancelled = true }
  }, [])

  const handleSearch = useCallback(async (p = 1) => {
    try {
      setLoading(true)
      attachToken()
      const params = new URLSearchParams()
      if (searchQ) params.append('q', searchQ)
      if (searchPos) params.append('position', searchPos)
      if (searchTeam) params.append('team', searchTeam)
      params.append('page', p)
      params.append('limit', 25)
      const { data } = await privateAPI.get(`/nfl-rivals/players/search?${params}`)
      setResults(data.data?.players || [])
      setTotal(data.data?.total || 0)
      setPage(p)
    } catch (err) {
      notification.error({ message: 'Search failed' })
    } finally { setLoading(false) }
  }, [searchQ, searchPos, searchTeam])

  const handleSign = async (player) => {
    try {
      setSigning(player._id)
      attachToken()

      // Get current squad, add player as reserve, save
      const { data: profileData } = await privateAPI.get('/nfl-rivals/profile')
      const currentSquad = profileData.data?.entry?.squad || []

      if (currentSquad.length >= 53) {
        notification.warning({ message: 'Roster full (53/53)', description: 'Release a player first to make room.' })
        return
      }

      const alreadyOn = currentSquad.some(s => (s.player?._id || s.player) === player._id)
      if (alreadyOn) {
        notification.warning({ message: 'Already on your roster' })
        setSquadIds(prev => new Set([...prev, player._id]))
        return
      }

      const payload = [
        ...currentSquad.map(s => ({
          playerId: s.player?._id || s.player,
          role: s.role,
          position: s.player?.Position || s.position || '',
        })),
        { playerId: player._id, role: 'reserve', position: player.Position || '' }
      ]

      const { data } = await privateAPI.post('/nfl-rivals/squad', { squad: payload })
      if (data.success) {
        setSquadIds(prev => new Set([...prev, player._id]))
        notification.success({
          message: `Signed ${player.Name || player.FirstName || 'Player'}`,
          description: `Added to reserves. ${formatValue(getSalary(player))} cap hit.`,
          duration: 3,
        })
      }
    } catch (err) {
      notification.error({
        message: 'Sign failed',
        description: err.response?.data?.message || 'Check roster rules',
      })
    } finally {
      setSigning(null)
    }
  }

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><SearchOutlined /> Player Market</h2>
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        background: 'rgba(20,28,45,0.6)', border: '1px solid rgba(110,105,128,0.15)',
        borderRadius: 14, padding: 16,
      }}>
        <Input placeholder="Search by name..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
          onPressEnter={() => handleSearch(1)} allowClear style={{ flex: 1, minWidth: 200 }}
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} />
        <Select placeholder="Position" allowClear style={{ width: 140 }}
          value={searchPos || undefined} onChange={v => { setSearchPos(v || ''); setPage(1) }} options={POS_OPTIONS} />
        <Select
          placeholder="Team" allowClear showSearch
          style={{ width: 220 }}
          value={searchTeam || undefined}
          onChange={v => { setSearchTeam(v || ''); setPage(1) }}
          options={availableTeams.map(t => ({ label: t, value: t }))}
          filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
        />
        <Button type="primary" loading={loading} onClick={() => handleSearch(1)} className="nflr-gold-btn">Search</Button>
      </div>

      {/* Column Header */}
      {!loading && results.length > 0 && (
        <div className="rp-table-header">
          <span className="rp-th" style={{ flex: '0 0 220px' }}>Player</span>
          <span className="rp-th" style={{ width: 55, textAlign: 'center' }}>AVG</span>
          <span className="rp-th" style={{ width: 65, textAlign: 'center' }}>Salary</span>
          <span className="rp-th" style={{ width: 40, textAlign: 'center' }}>ADP</span>
          <span className="rp-th" style={{ width: 44, textAlign: 'center' }}>Bye</span>
          <span className="rp-th" style={{ width: 72, textAlign: 'center' }}>Next</span>
          <span className="rp-th" style={{ flex: 1 }}>Bio</span>
          <span className="rp-th" style={{ width: 64, textAlign: 'center' }}>Action</span>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : results.length > 0 ? (
        <>
          {results.map(p => {
            const playerName = p.Name || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
            const pos = p.Position || ''
            const posColor = POS_COLOR[pos] || '#94a3b8'
            const headshot = p.HostedHeadshotNoBackgroundUrl
            const injured = p.isPlayerInjured
            const jersey = p.Number || p.JersyNo
            const bio = [p.Age && `${p.Age}y`, p.College, p.Height, p.Weight && `${p.Weight}lb`].filter(Boolean).join(' · ')
            const injTip = injured ? [p.InjuryStatus, p.InjuryBodyPart].filter(Boolean).join(' – ') : ''
            const onRoster = squadIds.has(p._id)
            const isSigning = signing === p._id
            return (
              <div key={p._id} className={`rp-row rp-compact${onRoster ? ' on-roster' : ''}`}>
                {/* Player identity */}
                <div className="rp-row-identity" style={{ flex: '0 0 220px' }}>
                  <div className="rp-row-photo" style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden' }}>
                    <PlayerAvatar
                      name={playerName}
                      src={headshot}
                      size={30}
                      borderRadius={8}
                    />
                  </div>
                  <div className="rp-row-info" style={{ gap: 0 }}>
                    <div className="rp-row-name" style={{ fontSize: 12.5, gap: 5 }}>
                      <span
                        style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                        className="rp-clickable-name"
                        onClick={() => { setPopupPlayerId(p._id); setPopupPlayer(p); setPopupOpen(true) }}
                      >
                        {playerName}
                      </span>
                      {injured && <AlertOutlined style={{ color: '#ef4444', fontSize: 10 }} title={injTip} />}
                    </div>
                    <div className="rp-row-meta" style={{ fontSize: 10.5, gap: 4 }}>
                      <span className="rp-row-pos-tag" style={{ background: `${posColor}20`, color: posColor, border: `1px solid ${posColor}40`, fontSize: 9, padding: '0px 5px', lineHeight: '16px' }}>{pos}</span>
                      <span>{p.Team || '-'}</span>
                      {jersey && <span style={{ color: 'rgba(255,255,255,0.25)' }}>#{jersey}</span>}
                    </div>
                  </div>
                </div>

                {/* Stat cells */}
                <span className="rp-cell teal" style={{ width: 55 }}>{getPpg(p).toFixed(1)}</span>
                <span className="rp-cell" style={{ width: 65 }}>{formatValue(getSalary(p))}</span>
                <span className="rp-cell" style={{ width: 40 }}>{p.samAdp24 || '—'}</span>
                <span className="rp-cell" style={{ width: 44, color: '#f59e0b' }}>{p.ByeWeek ? `Wk${p.ByeWeek}` : '—'}</span>
                <span className="rp-cell" style={{ width: 72, color: '#a78bfa', fontSize: 10.5 }}>
                  {p.UpcomingGameOpponent ? `${p.UpcomingGameWeek ? 'W' + p.UpcomingGameWeek + ' ' : ''}${p.UpcomingGameOpponent}` : '—'}
                </span>
                <span className="rp-cell bio" style={{ flex: 1, textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: 10.5 }}>{bio || '—'}</span>

                {/* Sign / On Roster */}
                <div style={{ width: 64, textAlign: 'center', flexShrink: 0 }}>
                  {onRoster ? (
                    <span className="rp-signed-tag"><CheckOutlined /> Roster</span>
                  ) : (
                    <button
                      className="rp-sign-btn"
                      onClick={() => handleSign(p)}
                      disabled={isSigning}
                    >
                      {isSigning ? <Spin size="small" /> : <><PlusOutlined /> Sign</>}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {total > 25 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination current={page} total={total} pageSize={25} onChange={p => handleSearch(p)} showSizeChanger={false} size="small" />
            </div>
          )}
        </>
      ) : (
        <Empty description="Search for A.Football players" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {/* Player Popup */}
      <NFLPlayerPopup
        playerId={popupPlayerId}
        player={popupPlayer}
        isOpen={popupOpen}
        onClose={() => { setPopupOpen(false); setPopupPlayerId(null); setPopupPlayer(null) }}
      />
    </div>
  )
}

export default PlayerSearch
