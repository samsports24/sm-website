import React, { useState, useEffect, useCallback } from 'react'
import { Spin, notification } from 'antd'
import { SearchOutlined, PlusOutlined, CheckOutlined, AlertOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'
import { SALARY_CAP } from './rivalsConfig'
import NFLPlayerPopup from '../../components/NFLPlayerPopup/NFLPlayerPopup'
import PlayerAvatar from '../../components/PlayerAvatar'
import './nfl-rivals.css'

/* ── Position dropdown: every code the roster actually publishes ── */
const POS_OPTIONS = [
  'QB', 'RB', 'FB', 'WR', 'TE',
  'OL', 'OT', 'LT', 'RT', 'OG', 'LG', 'RG', 'C',
  'DL', 'DE', 'EDGE', 'DT', 'NT',
  'LB', 'ILB', 'OLB', 'MLB',
  'CB', 'S', 'FS', 'SS',
  'K', 'P', 'LS',
]

/* ── Position pill row (grouped) ── */
const POS_PILLS = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P']

/* ── Second row: the specific codes inside a group ──
   You cannot search for a left tackle from a row of eleven umbrella terms, and
   putting all twenty codes in one row would be a wall. Pick OL and the line
   opens up underneath it. The API takes these directly - "LT" is an exact
   match, "C" matches centers and never corners. */
const SUB_PILLS = {
  OL: ['LT', 'LG', 'C', 'RG', 'RT'],
  DL: ['DE', 'EDGE', 'DT', 'NT'],
  LB: ['ILB', 'OLB', 'MLB'],
  S: ['FS', 'SS'],
  RB: ['FB'],
}

/* Which group pill a specific code belongs under, so picking LT keeps OL lit. */
const GROUP_OF = {}
Object.keys(SUB_PILLS).forEach(g => SUB_PILLS[g].forEach(code => { GROUP_OF[code] = g }))

/* ── Position color map (mockup palette) ── */
const PMK_POS_COLOR = {
  QB: '#EF4444', RB: '#3B82F6', WR: '#22C55E', TE: '#F59E0B',
  OL: '#8B5CF6', DL: '#A855F7', LB: '#EC4899', CB: '#38BDF8',
  S: '#0EA5E9', K: '#F59E0B', P: '#38BDF8',
}
/* ── Fallback colors for granular positions returned by the API ── */
const POS_COLOR_FALLBACK = {
  OT: '#8B5CF6', OG: '#8B5CF6', C: '#8B5CF6',
  LT: '#8B5CF6', RT: '#8B5CF6', LG: '#8B5CF6', RG: '#8B5CF6', T: '#8B5CF6', G: '#8B5CF6',
  DE: '#A855F7', DT: '#A855F7', NT: '#A855F7', EDGE: '#A855F7', IDL: '#A855F7',
  ILB: '#EC4899', OLB: '#EC4899', MLB: '#EC4899',
  DB: '#38BDF8', FS: '#0EA5E9', SS: '#0EA5E9',
  FB: '#3B82F6', HB: '#3B82F6', PK: '#F59E0B', LS: '#94A3B8',
}
const posColorOf = (pos) => PMK_POS_COLOR[pos] || POS_COLOR_FALLBACK[pos] || '#8b93a7'

const WATCH_KEY = 'nflr_watchlist'

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

const getSalary = (p) => p.otcCapHit || p.currentYearSalaryCap || p.PlayerCap || p.otcBaseSalary || p.marketValue || 0

/* ── Field accessors (real fields, "—"/null fallbacks — never fabricated) ── */
const getName = (p) => p.Name || p.DisplayName || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || 'Unknown'
const getPos = (p) => p.Position || p.FantasyPosition || ''
const getAdp = (p) => (p.samAdp24 || p.adp || null)
const getHeadshot = (p) => p.HostedHeadshotNoBackgroundUrl || p.photo || p.headshot || null
const teamLogoUrl = (abbr) => (abbr ? `https://a.espncdn.com/i/teamlogos/nfl/500/${String(abbr).toLowerCase()}.png` : null)
const getExperience = (p) => {
  if (p.ExperienceString) return p.ExperienceString
  if (p.Experience === 0) return 'Rookie'
  if (p.Experience != null) return `${p.Experience} yr${p.Experience > 1 ? 's' : ''}`
  return null
}

const PlayerSearch = () => {
  const [searchQ, setSearchQ] = useState('')
  const [searchPos, setSearchPos] = useState('')
  const [searchTeam, setSearchTeam] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [availableTeams, setAvailableTeams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Squad tracking
  const [squad, setSquad] = useState([])
  const [squadIds, setSquadIds] = useState(new Set())
  const [signing, setSigning] = useState(null)

  // Detail rail
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [railTab, setRailTab] = useState('overview')
  const [detailById, setDetailById] = useState({}) // { [playerId]: fullPlayerDetail }
  const [detailLoading, setDetailLoading] = useState(false)
  const [watchlist, setWatchlist] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(WATCH_KEY) || '[]')) } catch { return new Set() }
  })

  // Player popup
  const [popupPlayerId, setPopupPlayerId] = useState(null)
  const [popupPlayer, setPopupPlayer] = useState(null)
  const [popupOpen, setPopupOpen] = useState(false)

  // Load current squad to know who's already signed + compute cap usage
  useEffect(() => {
    const loadSquad = async () => {
      try {
        attachToken()
        const { data } = await privateAPI.get('/nfl-rivals/profile')
        const sq = data.data?.entry?.squad || []
        setSquad(sq)
        setSquadIds(new Set(sq.map(s => s.player?._id || s.player)))
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

  const handleSearch = useCallback(async (p = 1, opts = {}) => {
    const q = opts.q !== undefined ? opts.q : searchQ
    const position = opts.position !== undefined ? opts.position : searchPos
    const team = opts.team !== undefined ? opts.team : searchTeam
    try {
      setLoading(true)
      attachToken()
      const params = new URLSearchParams()
      if (q) params.append('q', q)
      if (position) params.append('position', position)
      if (team) params.append('team', team)
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

  // Initial population so the table + detail rail have content
  useEffect(() => { handleSearch(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep a selected player for the rail (defaults to first result)
  useEffect(() => {
    if (results.length > 0) {
      setSelectedPlayer(prev => (prev && results.some(r => r._id === prev._id)) ? prev : results[0])
    } else {
      setSelectedPlayer(null)
    }
  }, [results])

  // Fetch full detail (real Tank01 stats) for the selected player, cached by id
  useEffect(() => {
    const id = selectedPlayer?._id
    if (!id || detailById[id]) return
    let cancelled = false
    const fetchDetail = async () => {
      try {
        setDetailLoading(true)
        attachToken()
        const { data } = await privateAPI.get(`/nfl-rivals/players/${id}`)
        const full = data.data?.player
        if (!cancelled && full) setDetailById(prev => ({ ...prev, [id]: full }))
      } catch (err) {
        // Fall back to the row's own fields — mark as attempted so we don't loop
        if (!cancelled) setDetailById(prev => ({ ...prev, [id]: null }))
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [selectedPlayer, detailById])

  const handleSign = async (player) => {
    try {
      setSigning(player._id)
      attachToken()

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
        setSquad([...currentSquad, { player, role: 'reserve' }])
        setSquadIds(prev => new Set([...prev, player._id]))
        notification.success({
          message: `Signed ${getName(player)}`,
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

  const openPopup = (p) => { setPopupPlayerId(p._id); setPopupPlayer(p); setPopupOpen(true) }

  const selectPos = (pill) => {
    const val = pill === 'All' ? '' : pill
    setSearchPos(val); setPage(1); handleSearch(1, { position: val })
  }

  const handleReset = () => {
    setSearchQ(''); setSearchPos(''); setSearchTeam(''); setSortBy(''); setPage(1)
    handleSearch(1, { q: '', position: '', team: '' })
  }

  const toggleWatch = (id) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      try { localStorage.setItem(WATCH_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  /* ── Client-side sort ── */
  const sortedResults = [...results]
  if (sortBy === 'adp') sortedResults.sort((a, b) => (getAdp(a) || 9999) - (getAdp(b) || 9999))
  else if (sortBy === 'ppg') sortedResults.sort((a, b) => getPpg(b) - getPpg(a))
  else if (sortBy === 'salary') sortedResults.sort((a, b) => getSalary(b) - getSalary(a))

  /* ── Cap / roster HUD numbers ── */
  const usedSalary = squad.reduce((s, x) => s + getSalary(x.player || x), 0)
  const capM = SALARY_CAP / 1e6
  const usedM = usedSalary / 1e6
  const availM = capM - usedM
  const overCap = usedSalary > SALARY_CAP
  const diffM = Math.abs(usedM - capM)
  const playerCount = squad.length
  const openSlots = Math.max(0, 53 - playerCount)

  /* ── Pagination ── */
  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pageItems = () => {
    const items = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      items.push(1)
      if (page > 3) items.push('…')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i)
      if (page < totalPages - 2) items.push('…')
      items.push(totalPages)
    }
    return items
  }

  // Merge fetched detail (real stats) over the row's own fields for the rail
  const selDetail = selectedPlayer ? (detailById[selectedPlayer._id] || null) : null
  const sel = selectedPlayer ? { ...selectedPlayer, ...(selDetail || {}) } : null
  const detailPending = !!selectedPlayer && detailById[selectedPlayer._id] === undefined && detailLoading

  return (
    <div className="pmk-page">
      {/* ── Header ── */}
      <div className="pmk-header">
        <div className="pmk-header-left">
          <h1 className="pmk-title">PLAYER MARKET</h1>
          <p className="pmk-subtitle">Find and sign the best talent for your roster.</p>
        </div>
        <div className="pmk-infostrip">
          <div className={`pmk-info-block${overCap ? ' over' : ''}`}>
            <span className="pmk-info-label">Salary Cap</span>
            <span className="pmk-info-value">${usedM.toFixed(1)}M / ${capM.toFixed(0)}M</span>
            <span className={`pmk-info-sub${overCap ? ' red' : ''}`}>{overCap ? `Over by $${diffM.toFixed(1)}M` : 'Under cap'}</span>
          </div>
          <div className="pmk-info-divider" />
          <div className="pmk-info-block">
            <span className="pmk-info-label">Players</span>
            <span className="pmk-info-value">{playerCount} / 53</span>
            <span className="pmk-info-sub">{openSlots === 0 ? 'Roster Full' : `${openSlots} open`}</span>
          </div>
          <div className="pmk-info-divider" />
          <div className="pmk-info-block">
            <span className="pmk-info-label">Available Funds</span>
            <span className={`pmk-info-value${availM < 0 ? ' red' : ' green'}`}>${availM.toFixed(1)}M</span>
            <span className="pmk-info-sub">Free to Spend</span>
          </div>
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="pmk-controls">
        <div className="pmk-search">
          <SearchOutlined className="pmk-search-icon" />
          <input
            className="pmk-search-input"
            placeholder="Search players by name…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(1); handleSearch(1) } }}
          />
        </div>
        <select
          className="pmk-select"
          value={searchPos}
          onChange={e => { const v = e.target.value; setSearchPos(v); setPage(1); handleSearch(1, { position: v }) }}
        >
          <option value="">All Positions</option>
          {POS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          className="pmk-select"
          value={searchTeam}
          onChange={e => { const v = e.target.value; setSearchTeam(v); setPage(1); handleSearch(1, { team: v }) }}
        >
          <option value="">All Teams</option>
          {availableTeams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="pmk-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="adp">ADP</option>
          <option value="ppg">Avg Pts</option>
          <option value="salary">Salary</option>
        </select>
        <button
          className={`pmk-btn ghost${showMoreFilters ? ' active' : ''}`}
          onClick={() => setShowMoreFilters(v => !v)}
        >More Filters</button>
        <button className="pmk-btn ghost" onClick={handleReset}>Reset</button>
      </div>

      {/* ── Position pill row ── */}
      <div className="pmk-pills">
        {POS_PILLS.map(pill => {
          // A specific code keeps its group lit, so picking LT does not make the
          // row look like nothing is selected.
          const active = (pill === 'All' && !searchPos) ||
                         pill === searchPos ||
                         GROUP_OF[searchPos] === pill
          const color = pill === 'All' ? '#A78BFA' : posColorOf(pill)
          return (
            <button
              key={pill}
              className={`pmk-pill${active ? ' active' : ''}`}
              onClick={() => selectPos(pill)}
              style={active
                ? { background: `${color}22`, color, borderColor: `${color}66` }
                : { color: `${color}` }}
            >{pill}</button>
          )
        })}
      </div>

      {/* ── Specific codes inside the selected group ── */}
      {(function () {
        const group = GROUP_OF[searchPos] || searchPos
        const subs = SUB_PILLS[group]
        if (!subs) return null
        const color = posColorOf(group)
        return (
          <div className="pmk-pills pmk-pills-sub">
            <button
              className={`pmk-pill pmk-pill-sm${searchPos === group ? ' active' : ''}`}
              onClick={() => selectPos(group)}
              style={searchPos === group
                ? { background: `${color}22`, color, borderColor: `${color}66` }
                : { color }}
            >All {group}</button>
            {subs.map(code => {
              const on = searchPos === code
              return (
                <button
                  key={code}
                  className={`pmk-pill pmk-pill-sm${on ? ' active' : ''}`}
                  onClick={() => selectPos(code)}
                  style={on
                    ? { background: `${color}22`, color, borderColor: `${color}66` }
                    : { color }}
                >{code}</button>
              )
            })}
          </div>
        )
      })()}

      {/* ── Body: table + rail ── */}
      <div className="pmk-body">
        <div className="pmk-table-wrap">
          <div className="pmk-table-scroll">
            <table className="pmk-table">
              <thead>
                <tr>
                  <th className="pmk-c-rank">#</th>
                  <th className="pmk-c-player">Player</th>
                  <th className="pmk-c-pos">Pos</th>
                  <th className="pmk-c-team">Team</th>
                  <th className="pmk-c-num">ADP</th>
                  <th className="pmk-c-num">Avg Pts</th>
                  <th className="pmk-c-num">Salary</th>
                  <th className="pmk-c-opp">Next Opponent</th>
                  <th className="pmk-c-num">Trend</th>
                  <th className="pmk-c-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="pmk-loading"><Spin size="large" /></td></tr>
                ) : sortedResults.length === 0 ? (
                  <tr><td colSpan={10} className="pmk-empty">No players found. Adjust your filters.</td></tr>
                ) : sortedResults.map((p, idx) => {
                  const pos = getPos(p)
                  const color = posColorOf(pos)
                  const onRoster = squadIds.has(p._id)
                  const isSigning = signing === p._id
                  const isSel = sel && sel._id === p._id
                  const injured = p.isPlayerInjured
                  const meta = [p.Age && `${p.Age}y`, p.Height, p.Weight && `${p.Weight}lb`].filter(Boolean).join(' • ')
                  return (
                    <tr
                      key={p._id}
                      className={`pmk-row${isSel ? ' selected' : ''}${onRoster ? ' on-roster' : ''}`}
                      onClick={() => setSelectedPlayer(p)}
                    >
                      <td className="pmk-c-rank">{from + idx}</td>
                      <td className="pmk-c-player">
                        <div className="pmk-player-cell">
                          <div className="pmk-photo-wrap">
                            {p.Team && <img className="pmk-photo-logo" src={teamLogoUrl(p.Team)} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
                            <PlayerAvatar name={getName(p)} src={getHeadshot(p)} size={34} borderRadius={9} />
                          </div>
                          <div className="pmk-player-txt">
                            <span className="pmk-player-name">
                              {getName(p)}
                              {injured && <AlertOutlined className="pmk-inj" title={[p.InjuryStatus, p.InjuryBodyPart].filter(Boolean).join(' – ')} />}
                            </span>
                            <span className="pmk-player-meta">{meta || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="pmk-c-pos">
                        <span className="pmk-pos-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{pos || '—'}</span>
                      </td>
                      <td className="pmk-c-team">
                        <span className="pmk-team">
                          {p.teamLogo && <img className="pmk-team-logo" src={p.teamLogo} alt={p.Team} />}
                          {p.Team || '—'}
                        </span>
                      </td>
                      <td className="pmk-c-num">{getAdp(p) || '—'}</td>
                      <td className="pmk-c-num pmk-green">{getPpg(p) > 0 ? getPpg(p).toFixed(1) : '—'}</td>
                      <td className="pmk-c-num">{formatValue(getSalary(p))}</td>
                      <td className="pmk-c-opp">{p.UpcomingGameOpponent ? `${p.UpcomingGameWeek ? 'W' + p.UpcomingGameWeek + ' ' : ''}vs ${p.UpcomingGameOpponent}` : '—'}</td>
                      <td className="pmk-c-num pmk-muted">—</td>
                      <td className="pmk-c-action">
                        <div className="pmk-actions" onClick={e => e.stopPropagation()}>
                          <button className="pmk-view-btn" onClick={() => openPopup(p)}>View</button>
                          {onRoster ? (
                            <span className="pmk-signed"><CheckOutlined /> Signed</span>
                          ) : (
                            <button className="pmk-sign-btn" onClick={() => handleSign(p)} disabled={isSigning}>
                              {isSigning ? <Spin size="small" /> : <><PlusOutlined /> Sign</>}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          {!loading && total > 0 && (
            <div className="pmk-table-footer">
              <div className="pmk-pager">
                <button className="pmk-page-btn" disabled={page <= 1} onClick={() => handleSearch(page - 1)}>‹</button>
                {pageItems().map((it, i) => it === '…'
                  ? <span key={`e${i}`} className="pmk-page-ellipsis">…</span>
                  : <button key={it} className={`pmk-page-btn${it === page ? ' active' : ''}`} onClick={() => handleSearch(it)}>{it}</button>
                )}
                <button className="pmk-page-btn" disabled={page >= totalPages} onClick={() => handleSearch(page + 1)}>›</button>
              </div>
              <span className="pmk-showing">Showing {from}–{to} of {total} players</span>
            </div>
          )}
        </div>

        {/* ── Detail rail ── */}
        <aside className="pmk-rail">
          {!sel ? (
            <div className="pmk-rail-empty">Select a player to view details.</div>
          ) : (() => {
            const pos = getPos(sel)
            const color = posColorOf(pos)
            const nameParts = getName(sel).split(' ')
            const first = sel.FirstName || nameParts[0]
            const last = sel.LastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '')
            const jersey = sel.Number || sel.JersyNo
            const injured = sel.isPlayerInjured
            const ppg = getPpg(sel)
            const watched = watchlist.has(sel._id)
            const onRoster = squadIds.has(sel._id)
            const kv = [
              { l: 'Height', v: sel.Height || (sel.HeightFeet ? `${sel.HeightFeet}'${sel.HeightInches || 0}"` : null) },
              { l: 'Weight', v: sel.Weight ? `${sel.Weight} lbs` : null },
              { l: 'College', v: sel.College },
              { l: 'Experience', v: getExperience(sel) },
              { l: 'Bye Week', v: sel.ByeWeek ? `Wk ${sel.ByeWeek}` : null },
            ]
            /* ── Real stats from fetched detail ── */
            const totals = sel.seasonStatTotals || null
            const logs = Array.isArray(sel.gameLogs) ? sel.gameLogs : []
            const seasonLabel = totals?.season ? `${totals.season} SEASON STATS` : 'SEASON STATS'
            const posUpper = String(pos || '').toUpperCase()
            const isSkill = ['WR', 'RB', 'TE', 'FB'].includes(posUpper)
            const isDef = ['DE', 'DT', 'NT', 'EDGE', 'LB', 'ILB', 'OLB', 'MLB', 'CB', 'S', 'FS', 'SS', 'DB'].includes(posUpper)
            const fpts = (sel.projectedFantasyPoints != null ? sel.projectedFantasyPoints
              : (sel.FantasyPoints24 != null ? sel.FantasyPoints24 : null))
            const fmtN = (n) => (n != null && !Number.isNaN(n) ? Number(n).toLocaleString() : '—')
            const num0 = (n) => (typeof n === 'number' && !Number.isNaN(n) ? n : 0)
            // Overview season panel cells: real numbers, "—" only when the season data is absent
            const projCells = [
              { l: 'Pass Yds', v: totals ? fmtN(totals.passYds) : '—' },
              { l: 'Pass TDs', v: totals ? String(num0(totals.passTD)) : '—' },
              { l: 'INT', v: totals ? String(num0(totals.passInt)) : '—' },
              { l: 'Rush Yds', v: totals ? fmtN(totals.rushYds) : '—' },
              { l: 'FPTS', v: fpts != null ? Number(fpts).toFixed(1) : '—' },
            ]
            if (isSkill && totals && (num0(totals.rec) > 0 || num0(totals.recYds) > 0)) {
              projCells.splice(4, 0,
                { l: 'Rec', v: String(num0(totals.rec)) },
                { l: 'Rec Yds', v: fmtN(totals.recYds) },
              )
            }
            const compName = sel.compMedName || null
            const compPpg = sel.compMedPpg != null ? Number(sel.compMedPpg).toFixed(1) : null
            const newsDate = sel.NflNewsUpdatedAt
              ? new Date(sel.NflNewsUpdatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : null
            return (
              <>
                <div className="pmk-rail-head">
                  {sel.Team && (
                    <img
                      className="pmk-rail-teamlogo"
                      src={teamLogoUrl(sel.Team)}
                      alt=""
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className="pmk-rail-photo">
                    <PlayerAvatar name={getName(sel)} src={getHeadshot(sel)} size={92} borderRadius={16} />
                    <span className="pmk-rail-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}>
                      {pos || '—'}{jersey ? ` #${jersey}` : ''}
                    </span>
                  </div>
                  <div className="pmk-rail-nameblock">
                    <span className="pmk-rail-first">{first}</span>
                    <span className="pmk-rail-last">{last || first}</span>
                    <span className="pmk-rail-sub">{[sel.Team, pos, sel.Age && `${sel.Age}y`].filter(Boolean).join(' • ')}</span>
                  </div>
                </div>

                <div className="pmk-rail-stats">
                  <div className="pmk-rail-stat">
                    <span className="pmk-rail-stat-v">{sel.scoutGrade || '—'}</span>
                    <span className="pmk-rail-stat-l">OVR Rating</span>
                  </div>
                  <div className="pmk-rail-stat">
                    <span className="pmk-rail-stat-v green">{ppg > 0 ? ppg.toFixed(1) : '—'}</span>
                    <span className="pmk-rail-stat-l">Avg Pts</span>
                  </div>
                  <div className="pmk-rail-stat">
                    <span className="pmk-rail-stat-v">{sel.snapPct != null ? `${sel.snapPct}%` : '—'}</span>
                    <span className="pmk-rail-stat-l">Snap %</span>
                  </div>
                  <div className="pmk-rail-stat">
                    <span className="pmk-rail-stat-v">{getAdp(sel) || '—'}</span>
                    <span className="pmk-rail-stat-l">ADP</span>
                  </div>
                </div>

                <div className="pmk-rail-tabs">
                  {['overview', 'stats', 'gamelog', 'news'].map(t => (
                    <button
                      key={t}
                      className={`pmk-rail-tab${railTab === t ? ' active' : ''}`}
                      onClick={() => setRailTab(t)}
                    >{t === 'gamelog' ? 'Game Log' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>

                <div className="pmk-rail-scroll">
                  {detailPending && <div className="pmk-rail-loading"><Spin size="small" /> <span>Loading stats…</span></div>}
                  {railTab === 'overview' ? (
                    <>
                      <div className="pmk-kv-grid">
                        {kv.map(row => (
                          <div className="pmk-kv" key={row.l}>
                            <span className="pmk-kv-l">{row.l}</span>
                            <span className="pmk-kv-v">{row.v || '—'}</span>
                          </div>
                        ))}
                        <div className="pmk-kv">
                          <span className="pmk-kv-l">Injury Status</span>
                          <span className="pmk-kv-v">
                            {injured
                              ? <span className="pmk-inj-txt">{[sel.InjuryStatus, sel.InjuryBodyPart].filter(Boolean).join(' – ') || 'Injured'}</span>
                              : <span className="pmk-healthy"><i className="pmk-dot" /> Healthy</span>}
                          </span>
                        </div>
                      </div>

                      {compName && (
                        <div className="pmk-comp-line">
                          <span className="pmk-comp-l">Comparable</span>
                          <span className="pmk-comp-v">{compName}{compPpg ? ` · ${compPpg} PPG` : ''}</span>
                        </div>
                      )}

                      <div className="pmk-rail-section-title">{seasonLabel}</div>
                      <div className="pmk-proj-grid">
                        {projCells.map(x => (
                          <div className="pmk-proj" key={x.l}>
                            <span className="pmk-proj-v">{x.v}</span>
                            <span className="pmk-proj-l">{x.l}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pmk-rail-section-title">Next Matchup</div>
                      {sel.UpcomingGameOpponent ? (
                        <div className="pmk-matchups">
                          <div className="pmk-matchup">
                            <span className="pmk-matchup-wk">{sel.UpcomingGameWeek ? `Wk ${sel.UpcomingGameWeek}` : 'Next'}</span>
                            <span className="pmk-matchup-opp">vs {sel.UpcomingGameOpponent}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pmk-rail-nodata">No upcoming matchups.</div>
                      )}
                    </>
                  ) : railTab === 'stats' ? (
                    totals ? (
                      <>
                        <div className="pmk-rail-section-title">{seasonLabel}</div>
                        <table className="pmk-stats-table">
                          <tbody>
                            <tr><td>Games</td><td>{num0(totals.games)}</td></tr>
                            {(num0(totals.passYds) > 0 || num0(totals.passTD) > 0 || num0(totals.passInt) > 0) && (
                              <>
                                <tr><td>Pass Yds</td><td>{fmtN(totals.passYds)}</td></tr>
                                <tr><td>Pass TDs</td><td>{num0(totals.passTD)}</td></tr>
                                <tr><td>Interceptions</td><td>{num0(totals.passInt)}</td></tr>
                              </>
                            )}
                            {(num0(totals.rushYds) > 0 || num0(totals.rushTD) > 0) && (
                              <>
                                <tr><td>Rush Yds</td><td>{fmtN(totals.rushYds)}</td></tr>
                                <tr><td>Rush TDs</td><td>{num0(totals.rushTD)}</td></tr>
                              </>
                            )}
                            {(num0(totals.rec) > 0 || num0(totals.recYds) > 0) && (
                              <>
                                <tr><td>Receptions</td><td>{num0(totals.rec)}</td></tr>
                                <tr><td>Rec Yds</td><td>{fmtN(totals.recYds)}</td></tr>
                                <tr><td>Rec TDs</td><td>{num0(totals.recTD)}</td></tr>
                              </>
                            )}
                            {(isDef || num0(totals.tackles) > 0 || num0(totals.sacks) > 0 || num0(totals.defInt) > 0) && (
                              <>
                                <tr><td>Tackles</td><td>{num0(totals.tackles)}</td></tr>
                                <tr><td>Sacks</td><td>{num0(totals.sacks)}</td></tr>
                                <tr><td>Interceptions</td><td>{num0(totals.defInt)}</td></tr>
                              </>
                            )}
                            {fpts != null && <tr><td>Fantasy Pts</td><td>{Number(fpts).toFixed(1)}</td></tr>}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <div className="pmk-rail-nodata">No season stats available.</div>
                    )
                  ) : railTab === 'gamelog' ? (
                    logs.length ? (
                      <table className="pmk-stats-table pmk-gamelog-table">
                        <thead>
                          <tr><th>Wk</th><th>Stat Line</th><th>Pts</th></tr>
                        </thead>
                        <tbody>
                          {logs.map((g, i) => {
                            const parts = []
                            if (num0(g.passYds) > 0 || num0(g.passTD) > 0) parts.push(`${num0(g.passYds)} pass yd${num0(g.passTD) ? `, ${num0(g.passTD)} TD` : ''}`)
                            if (num0(g.rushYds) > 0 || num0(g.rushTD) > 0) parts.push(`${num0(g.rushYds)} rush yd${num0(g.rushTD) ? `, ${num0(g.rushTD)} TD` : ''}`)
                            if (num0(g.rec) > 0 || num0(g.recYds) > 0) parts.push(`${num0(g.rec)} rec, ${num0(g.recYds)} yd${num0(g.recTD) ? `, ${num0(g.recTD)} TD` : ''}`)
                            if (num0(g.tackles) > 0 || num0(g.sacks) > 0 || num0(g.defInt) > 0) parts.push(`${num0(g.tackles)} tkl${num0(g.sacks) ? `, ${num0(g.sacks)} sk` : ''}${num0(g.defInt) ? `, ${num0(g.defInt)} INT` : ''}`)
                            return (
                              <tr key={g.week != null ? g.week : i}>
                                <td>{g.week != null ? `W${g.week}` : '—'}</td>
                                <td className="pmk-gl-line">{parts.length ? parts.join(' · ') : '—'}</td>
                                <td>{g.points != null ? Number(g.points).toFixed(1) : '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="pmk-rail-nodata">No game log available.</div>
                    )
                  ) : railTab === 'news' ? (
                    sel.NflNewsHeadline ? (
                      <div className="pmk-news">
                        <div className="pmk-news-headline">{sel.NflNewsHeadline}</div>
                        {sel.NflNewsOutlook && <p className="pmk-news-outlook">{sel.NflNewsOutlook}</p>}
                        <div className="pmk-news-meta">
                          {newsDate && <span className="pmk-news-date">{newsDate}</span>}
                          {sel.NflNewsUrl && (
                            <a className="pmk-news-link" href={sel.NflNewsUrl} target="_blank" rel="noopener noreferrer">Read more ↗</a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pmk-rail-nodata">No recent news.</div>
                    )
                  ) : (
                    <div className="pmk-rail-nodata">No data yet.</div>
                  )}
                </div>

                <div className="pmk-rail-footer">
                  {onRoster ? (
                    <button className="pmk-rail-sign signed" disabled><CheckOutlined /> On Roster</button>
                  ) : (
                    <button
                      className="pmk-rail-sign"
                      onClick={() => handleSign(sel)}
                      disabled={signing === sel._id}
                    >
                      {signing === sel._id ? <Spin size="small" /> : <><PlusOutlined /> Sign Player</>}
                    </button>
                  )}
                  <button className="pmk-watch-btn" onClick={() => toggleWatch(sel._id)}>
                    {watched ? '★ On Watchlist' : '☆ Add to Watchlist'}
                  </button>
                </div>
              </>
            )
          })()}
        </aside>
      </div>

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
