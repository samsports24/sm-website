import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button, Input, Table, Tag, Spin, Switch, Modal, notification } from 'antd'
import { CiSearch } from 'react-icons/ci'
import { BiSolidPlusCircle } from 'react-icons/bi'
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import Header from '../../components/Header'
import DraftChatWidget from '../../components/DraftChatWidget'
import NFLPlayerPopup from '../../components/NFLPlayerPopup/NFLPlayerPopup'
import {
  getRookieDraftOrder,
  getRookiePool,
  makeRookiePick,
  toggleRookieAutoDraft,
  getRookieDraftQueue,
  addToRookieQueue,
  removeFromRookieQueue,
} from '../../redux/actions/rookieDraftAction'
import io from 'socket.io-client'
import { base_url, attachToken, privateAPI } from '../../config/constants'
import './../Draft/draftLive.css'

const ALL_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K']
const OFFENSE_ONLY_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']

const POS_COLOR = {
  QB: '#ef4444', RB: '#3b82f6', WR: '#22c55e', TE: '#f59e0b', K: '#78716c',
}
const posColor = (pos) => POS_COLOR[pos] || '#64748b'
const lastName = (nm) => (nm || '').trim().split(/\s+/).slice(-1)[0] || ''

// ── Countdown Hook ──────────────────────────────────────────
const useCountdown = (deadline) => {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!deadline) { setSeconds(0); return }
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
      setSeconds(diff)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [deadline])
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${mins}:${String(secs).padStart(2, '0')}`
  const isUrgent = seconds <= 10 && seconds > 0
  return { seconds, display, isUrgent }
}

const RookieDraft = () => {
  const { draftOrder, pool, loading, draftQueue } = useSelector((s) => s.rookieDraft)
  const user = useSelector((s) => s.user)
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const draftYear = currentLeague?.season || new Date().getFullYear()
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const POSITIONS = isOffenseOnly ? OFFENSE_ONLY_POSITIONS : ALL_POSITIONS
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [searchVal, setSearchVal] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [autoDraftOn, setAutoDraftOn] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState('')
  const [draftBudget, setDraftBudget] = useState(null) // SamPoints remaining for draft
  const [pickAnnouncement, setPickAnnouncement] = useState(null)
  const [rookieCardPlayer, setRookieCardPlayer] = useState(null)
  const [draftPaused, setDraftPaused] = useState(false)
  const socketRef = useRef(null)

  const countdown = useCountdown(draftOrder?.pickDeadline)

  const isCommissioner =
    user?.userDetails?.team?.currentLeague?.createdBy === user?.userDetails?._id ||
    user?.userDetails?.team?.currentLeague?.coComissioner === user?.userDetails?._id

  // Init: load state
  useEffect(() => {
    getRookieDraftOrder()
    getRookiePool({ position: 'ALL' })
    getRookieDraftQueue()
  }, [])

  // Reload pool when filter changes
  useEffect(() => {
    getRookiePool({
      position: posFilter !== 'ALL' ? posFilter : undefined,
      search: searchVal || undefined,
    })
  }, [posFilter])

  // Sync autoDraft state
  useEffect(() => {
    setAutoDraftOn(!!user?.team?.autoDraft)
  }, [user?.team?.autoDraft])

  // Socket.IO listener
  useEffect(() => {
    const socket = io(base_url || 'https://backend.samsports.io', { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('rookie_draft_pick', async (data) => {
      // Show A.Football-style pick announcement popup
      if (data?.pick?.player) {
        const pl = data.pick.player
        setPickAnnouncement({
          playerName: pl.Name || 'Player',
          playerImage: pl.HostedHeadshotNoBackgroundUrl || null,
          teamName: data.pick.team?.name || data.pick.team?.abbreviation || 'Team',
          teamAbbr: data.pick.team?.abbreviation || '',
          teamLogo: data.pick.team?.logo || null,
          position: pl.Position || '',
          college: pl.College || '',
          round: data.pick.round || 1,
          pickNum: data.pick.pick || 1,
          overall: data.pick.overall || data.pick.pick || 1,
          label: data.pick.label || `${data.pick.round}.${String(data.pick.pick).padStart(2, '0')}`,
          samAdp: pl.samAdp24 || 0,
          projPts: pl.FantasyPoints24 || 0,
          fortyYard: pl.fortyYard || null,
          age: pl.Age || null,
          weight: pl.Weight || null,
        })
        setTimeout(() => setPickAnnouncement(null), 7000)
      }
      // Update SamPoints balance in real-time from socket
      if (data?.remainingSamPoints !== undefined && String(data?.pick?.teamId) === String(user?.team?._id)) {
        setDraftBudget(data.remainingSamPoints)
      }
      await getRookieDraftOrder()
      await getRookiePool({
        position: posFilter !== 'ALL' ? posFilter : undefined,
        search: searchVal || undefined,
      })
      await getRookieDraftQueue()
    })

    socket.on('rookie_draft_status', async (data) => {
      await getRookieDraftOrder()
      // Sync local pause state with server
      if (data?.paused !== undefined) {
        setDraftPaused(!!data.paused)
      } else if (data?.isLive !== undefined) {
        setDraftPaused(!data.isLive)
      }
      if (data?.autoResumed) {
        notification.warning({
          message: 'Draft Auto-Resumed',
          description: '5-minute pause timeout has expired.',
          duration: 5,
        })
      }
    })

    return () => { socket.disconnect() }
  }, [posFilter, searchVal])

  // Current pick info (moved above useEffect that depends on isMyPick)
  const currentPickInfo = draftOrder?.picks?.find(
    (p) =>
      p.round === draftOrder.currentRound &&
      p.pick === draftOrder.currentPick &&
      !p.isCompleted
  )

  const isMyPick =
    currentPickInfo &&
    String(currentPickInfo.team?._id) === String(user?.team?._id)

  // ── Handlers ──────────────────────────────────────────────
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      getRookiePool({
        position: posFilter !== 'ALL' ? posFilter : undefined,
        search: searchVal || undefined,
      })
    }
  }

  // Smart autodraft, auto-pick when it's my turn and autodraft is ON (10s delay)
  useEffect(() => {
    if (autoDraftOn && isMyPick && draftOrder?.isLive && !draftLoading) {
      notification.info({ key: 'rookie-autodraft', message: '🤖 Smart Autodraft', description: 'Analyzing squad needs... picking in 10s', duration: 10 })
      const timer = setTimeout(() => handleAutoDraft(), 10000)
      return () => { clearTimeout(timer); notification.destroy('rookie-autodraft') }
    }
  }, [autoDraftOn, isMyPick, draftOrder?.isLive, draftLoading])

  const handleAutoDraft = async () => {
    if (!isMyPick || !draftOrder?.isLive) return
    setDraftLoading(true)
    notification.destroy('rookie-autodraft')

    // Smart autodraft: analyze squad + pick best by position need
    try {
      attachToken()
      const res = await privateAPI.get('/rookie-draft/smart-autodraft')
      const smartPick = res?.data?.data?.player
      if (smartPick?._id) {
        await makeRookiePick(smartPick._id)
        notification.success({ message: `🤖 Smart pick: ${smartPick.Name}`, description: `${smartPick.Position}, ${res.data.data.position} need filled`, duration: 4 })
        await getRookieDraftOrder()
        await getRookiePool({ position: posFilter !== 'ALL' ? posFilter : undefined, search: searchVal || undefined })
        await getRookieDraftQueue()
        setDraftLoading(false)
        return
      }
    } catch (err) {
      console.warn('Smart autodraft unavailable, falling back')
    }

    // Fallback: queue first, then best available
    let playerId = null
    if (draftQueue?.length > 0) {
      playerId = draftQueue[0]?.player?._id
    }
    if (!playerId && pool.players?.length > 0) {
      playerId = pool.players[0]?._id
    }
    if (playerId) {
      await makeRookiePick(playerId)
      await getRookieDraftOrder()
      await getRookiePool({
        position: posFilter !== 'ALL' ? posFilter : undefined,
        search: searchVal || undefined,
      })
      await getRookieDraftQueue()
    }
    setDraftLoading(false)
  }

  const handleDraftPlayer = async (playerId) => {
    if (!playerId) return
    setDraftLoading(true)
    // Capture player info BEFORE the pick clears the selection
    const draftedPlayer = pool?.players?.find(p => p._id === playerId) || selectedPlayer
    const result = await makeRookiePick(playerId)
    // Update budget from server response
    if (result?.remainingSamPoints !== undefined) {
      setDraftBudget(result.remainingSamPoints)
    }
    // Show announcement for own pick (socket will also fire but this ensures immediate display)
    if (draftedPlayer) {
      const posColors = { QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', K: '#A855F7', DE: '#EC4899', DT: '#EC4899', LB: '#8B5CF6', CB: '#06B6D4', S: '#14B8A6', OL: '#6B7280' }
      setPickAnnouncement({
        playerName: draftedPlayer.Name || 'Player',
        playerImage: draftedPlayer.HostedHeadshotNoBackgroundUrl || null,
        teamName: user?.team?.name || user?.team?.abbreviation || 'My Team',
        teamAbbr: user?.team?.abbreviation || '',
        teamLogo: user?.team?.logo || null,
        position: draftedPlayer.Position || '',
        college: draftedPlayer.College || '',
        round: draftOrder?.currentRound || 1,
        pickNum: draftOrder?.currentPick || 1,
        overall: currentPickInfo?.overall || draftOrder?.currentPick || 1,
        label: currentPickInfo?.label || `${draftOrder?.currentRound}.${String(draftOrder?.currentPick).padStart(2, '0')}`,
        samAdp: draftedPlayer.samAdp24 || 0,
        projPts: draftedPlayer.FantasyPoints24 || 0,
        fortyYard: draftedPlayer.fortyYard || null,
        age: draftedPlayer.Age || null,
        weight: draftedPlayer.Weight || null,
      })
      setTimeout(() => setPickAnnouncement(null), 7000)
    }
    await getRookieDraftOrder()
    await getRookiePool({
      position: posFilter !== 'ALL' ? posFilter : undefined,
      search: searchVal || undefined,
    })
    await getRookieDraftQueue()
    setSelectedPlayer(null)
    setDraftLoading(false)
  }

  const handleAutoDraftToggle = async (checked) => {
    setAutoDraftOn(checked)
    await toggleRookieAutoDraft(checked)
  }

  const handleTogglePause = async (paused) => {
    try {
      await privateAPI.post('/rookie-draft/toggle-pause', { paused }, attachToken())
      setDraftPaused(paused)
      notification.success({ message: paused ? 'Draft paused' : 'Draft resumed' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to toggle pause' })
    }
  }

  const handleAddQueue = async (playerId) => {
    setQueueLoading(playerId)
    await addToRookieQueue(playerId)
    setQueueLoading('')
  }

  const handleRemoveQueue = async (playerId) => {
    setQueueLoading(playerId)
    await removeFromRookieQueue(playerId)
    setQueueLoading('')
  }

  // Is the player already in queue?
  const isInQueue = (playerId) =>
    draftQueue?.some((q) => String(q.player?._id) === String(playerId))

  // ── Pool Columns ──────────────────────────────────────────
  const poolColumns = [
    {
      width: 50,
      title: ' ',
      key: 'queue',
      render: (_, obj) => {
        const pid = obj?._id
        const queued = isInQueue(pid)
        return (
          <div>
            {queueLoading === pid ? (
              <Spin size="small" />
            ) : (
              <BiSolidPlusCircle
                size={18}
                style={{ marginBottom: '-3px', cursor: 'pointer' }}
                color={queued ? '#a5b4fc' : 'rgba(255,255,255,0.3)'}
                onClick={() => queued ? handleRemoveQueue(pid) : handleAddQueue(pid)}
              />
            )}
          </div>
        )
      },
    },
    {
      width: 60,
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => <span>{(pool.page - 1) * pool.limit + index + 1}</span>,
    },
    {
      width: 180,
      title: 'Player',
      key: 'player',
      render: (_, obj) => (
        <div className="table_player_name_box nrc_container">
          <p
            onClick={() => { setSelectedPlayer(obj); setRookieCardPlayer(obj) }}
            style={{ cursor: 'pointer' }}
          >
            {obj?.Name || '-'}
          </p>
        </div>
      ),
    },
    {
      width: 80,
      title: 'POS',
      key: 'pos',
      render: (_, obj) => <p>{obj?.Position || '-'}</p>,
    },
    {
      width: 60,
      title: 'AGE',
      key: 'age',
      render: (_, obj) => <p>{obj?.Age || '-'}</p>,
    },
    {
      width: 80,
      title: 'PRO TEAM',
      key: 'team',
      render: (_, obj) => <p>{obj?.Team || 'FA'}</p>,
    },
    {
      width: 100,
      title: 'SAM ADP',
      key: 'adp',
      render: (_, obj) => <p>{obj?.samAdp24 ? Math.round(obj.samAdp24) : '-'}</p>,
    },
    {
      width: 120,
      title: '26 PROJ. POINTS',
      key: 'proj',
      render: (_, obj) => <p>{obj?.FantasyPoints24?.toFixed(1) || '-'}</p>,
    },
    {
      width: 100,
      title: 'CAP HIT',
      key: 'cap',
      render: (_, obj) => <p>${(obj?.currentYearSalaryCap || 0).toLocaleString()}</p>,
    },
    {
      width: 80,
      title: '40-YD',
      key: 'forty',
      render: (_, obj) => <p>{obj?.fortyYard ? `${obj.fortyYard}s` : '-'}</p>,
    },
    {
      width: 70,
      title: 'VERT',
      key: 'vert',
      render: (_, obj) => <p>{obj?.verticalJump ? `${obj.verticalJump}"` : '-'}</p>,
    },
    {
      width: 80,
      title: 'BROAD',
      key: 'broad',
      render: (_, obj) => <p>{obj?.broadJump || '-'}</p>,
    },
  ]

  // ── Derived rail data ─────────────────────────────────────
  const myPicks = (draftOrder?.picks || []).filter(
    (p) => p.isCompleted && p.player && String(p.team?._id) === String(user?.team?._id)
  )
  const upNextPicks = (draftOrder?.picks || [])
    .filter((p) => !p.isCompleted)
    .sort((a, b) => a.overall - b.overall)
    .slice(0, 10)
  const recentPicks = (draftOrder?.picks || [])
    .filter((p) => p.isCompleted && p.player)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 5)

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="pro_league_container dl-root">
      <Header />

      <div className="dl-shell">
        {/* ── Top bar ── */}
        <div className="dl-topbar">
          <div className="dl-title">
            ROOKIE DRAFT
            <span className="dl-sub">{draftYear} · Round {draftOrder?.currentRound}, Pick {draftOrder?.currentPick}</span>
            {draftOrder?.isLive && currentPickInfo && (
              <span className={`dl-onclock ${isMyPick ? 'me' : ''}`}>
                ● {isMyPick ? "You're on the clock" : `${currentPickInfo.team?.name || ''} on the clock`}
              </span>
            )}
          </div>
          <div className="dl-trade-btn" style={{ cursor: 'default' }}>
            💎 ${(draftBudget ?? 0).toLocaleString()} SP
          </div>
        </div>

        {/* ── Up Next strip ── */}
        <div className="dl-upnext">
          <span className="dl-upnext-label">Up Next</span>
          <div className="dl-upnext-list">
            {upNextPicks.map((p) => {
              const isNow = p.overall === currentPickInfo?.overall
              return (
                <div key={p.overall} className={`dl-pill ${isNow ? 'now' : ''}`}>
                  {p.team?.logo
                    ? <div className="dl-pill-logo" style={{ backgroundImage: `url(${p.team.logo})` }} />
                    : <div className="dl-pill-logo dl-pill-logo--ph">{(p.team?.abbreviation || p.team?.name || '?').slice(0, 2).toUpperCase()}</div>}
                  <div className="dl-pill-info">
                    <span className="dl-pill-num">#{p.overall}</span>
                    <span className="dl-pill-team">{p.team?.abbreviation || p.team?.name || 'TBD'}</span>
                  </div>
                  {isNow && <span className="dl-pill-tag">NOW</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Body: pool | card | rail ── */}
        <div className="dl-body">
          {/* Player pool */}
          <div className="dl-col dl-col-pool">
            <div className="rd-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 12px 0' }}>
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  className={`rd-pill ${posFilter === pos ? 'rd-pill-active' : ''}`}
                  onClick={() => setPosFilter(pos)}
                  style={{
                    padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: "'Rajdhani', sans-serif",
                    background: posFilter === pos ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)',
                    border: posFilter === pos ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: posFilter === pos ? '#22c55e' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                allowClear
                placeholder="Search Rookie"
                suffix={<CiSearch color="var(--primary)" />}
                className="rd-search-input"
              />
            </div>
            <Spin spinning={loading}>
              <Table
                dataSource={pool.players}
                columns={poolColumns}
                pagination={{
                  current: pool.page,
                  pageSize: pool.limit,
                  total: pool.total,
                  onChange: (page) =>
                    getRookiePool({
                      page,
                      position: posFilter !== 'ALL' ? posFilter : undefined,
                      search: searchVal || undefined,
                    }),
                  showSizeChanger: false,
                  size: 'small',
                }}
                size="small"
                rowKey={(r) => r._id}
                className="sd-pool-table"
                rowClassName={(r) => (selectedPlayer?._id === r._id ? 'sd-selected-row' : '')}
                onRow={(record) => ({ onClick: () => setSelectedPlayer(record) })}
                scroll={{ x: 900 }}
              />
            </Spin>
          </div>

          {/* Inline player card */}
          <div className="dl-col dl-col-card">
            {selectedPlayer ? (
              <NFLPlayerPopup
                inline
                isOpen
                playerId={selectedPlayer._id}
                player={selectedPlayer}
                onClose={() => {}}
                onQueue={(p) => (isInQueue(p?._id) ? handleRemoveQueue(p?._id) : handleAddQueue(p?._id))}
                isQueued={isInQueue(selectedPlayer?._id)}
              />
            ) : (
              <div className="dl-card-empty">
                <BiSolidPlusCircle size={40} color="rgba(255,255,255,0.15)" />
                <p>Select a player from the pool to view their card</p>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="dl-col dl-col-rail">
            {/* Draft Control (commissioner) */}
            {isCommissioner && (
              <div className="dl-rail-card">
                <div className="dl-rail-head">Draft Control</div>
                <button
                  className={`dl-ctrl-btn ${draftPaused ? 'resume' : 'pause'}`}
                  onClick={() => handleTogglePause(!draftPaused)}
                >
                  {draftPaused ? 'Resume Draft' : 'Pause Draft'}
                </button>
              </div>
            )}

            {/* Your Pick */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">Your Pick</div>
              <div className="dl-yourpick">
                <div className="dl-yourpick-slot">Round {draftOrder?.currentRound || '—'}, Pick {draftOrder?.currentPick || '—'}</div>
                <div className={`dl-clock ${countdown.isUrgent ? 'urgent' : ''}`}>
                  <ClockCircleOutlined /> {draftOrder?.isLive ? countdown.display : '--:--'}
                </div>
              </div>
              <div className="dl-autopick">
                <span>Auto Pick</span>
                <Switch size="small" checked={autoDraftOn} checkedChildren="ON" unCheckedChildren="OFF" onChange={handleAutoDraftToggle} />
              </div>
            </div>

            {/* Your Roster */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">
                Your Roster
                <span className="dl-rail-count">{myPicks.length}{draftOrder?.totalRounds ? ` / ${draftOrder.totalRounds}` : ''}</span>
              </div>
              <div className="dl-roster">
                {myPicks.length === 0 && <div className="dl-empty-line">No players drafted yet</div>}
                {myPicks.map((p, i) => (
                  <div key={i} className="dl-roster-row">
                    <span className="dl-pos" style={{ background: `${posColor(p.player?.Position)}22`, color: posColor(p.player?.Position) }}>{p.player?.Position || '—'}</span>
                    <span className="dl-roster-name">{p.player?.Name}</span>
                    <span className="dl-roster-team">{p.player?.Team}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">Queue <span className="dl-rail-count">{draftQueue?.length || 0}</span></div>
              <div className="dl-roster">
                {(!draftQueue || draftQueue.length === 0) && <div className="dl-empty-line">Queue is empty</div>}
                {(draftQueue || []).map((q, i) => (
                  <div key={q._id || i} className="dl-roster-row">
                    <span className="dl-qnum">{i + 1}</span>
                    <span className="dl-roster-name">{q.player?.Name}</span>
                    <span className="dl-pos" style={{ background: `${posColor(q.player?.Position)}22`, color: posColor(q.player?.Position) }}>{q.player?.Position}</span>
                    <span className="dl-roster-team">{q.player?.Team}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Picks */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">Recent Picks</div>
              <div className="dl-roster">
                {recentPicks.length === 0 && <div className="dl-empty-line">No picks yet</div>}
                {recentPicks.map((p, i) => (
                  <div key={i} className="dl-roster-row">
                    <span className="dl-qnum">{p.label}</span>
                    <span className="dl-roster-name">{p.player?.Name}</span>
                    <span className="dl-pos" style={{ background: `${posColor(p.player?.Position)}22`, color: posColor(p.player?.Position) }}>{p.player?.Position}</span>
                    <span className="dl-roster-team">{p.team?.abbreviation || p.team?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="dl-actionbar">
          <div className="dl-ab-pick">
            <span className="dl-ab-label">Current Pick</span>
            <span className="dl-ab-num">#{currentPickInfo?.overall || '—'}</span>
          </div>
          <button
            className="dl-ab-btn draft"
            disabled={!(selectedPlayer && isMyPick && draftOrder?.isLive && !draftPaused && !draftLoading)}
            onClick={() => handleDraftPlayer(selectedPlayer?._id)}
          >
            <ThunderboltOutlined /> <div><b>{draftLoading ? 'DRAFTING…' : 'DRAFT PLAYER'}</b><small>{selectedPlayer ? `Draft ${lastName(selectedPlayer?.Name)}` : 'Select a player'}</small></div>
          </button>
          <button
            className={`dl-ab-btn queue ${selectedPlayer && isInQueue(selectedPlayer?._id) ? 'active' : ''}`}
            disabled={!selectedPlayer}
            onClick={() => (isInQueue(selectedPlayer?._id) ? handleRemoveQueue(selectedPlayer?._id) : handleAddQueue(selectedPlayer?._id))}
          >
            <BiSolidPlusCircle /> <div><b>{selectedPlayer && isInQueue(selectedPlayer?._id) ? 'IN QUEUE' : 'ADD TO QUEUE'}</b></div>
          </button>
          <div className="dl-ab-stat">
            <span className="dl-ab-label">Player ADP</span>
            <span className="dl-ab-val">{selectedPlayer?.samAdp24 || '—'}</span>
          </div>
          <div className="dl-ab-stat">
            <span className="dl-ab-label">Depth</span>
            <span className="dl-ab-val">{selectedPlayer?.DepthPosition || '—'}</span>
          </div>
        </div>
      </div>

      {/* Draft Chat - fixed bottom left */}
      <div style={{ position: 'fixed', bottom: '16px', left: '200px', width: '320px', zIndex: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '16px', overflow: 'hidden' }}>
        <DraftChatWidget leagueName="Rookie Draft" height="360px" />
      </div>

      {/* ═══ NFL-STYLE DRAFT PICK ANNOUNCEMENT ═══ */}
      {pickAnnouncement && (() => {
        const pa = pickAnnouncement
        const posClr = { QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', K: '#A855F7', DE: '#EC4899', DT: '#EC4899', LB: '#8B5CF6', CB: '#06B6D4', S: '#14B8A6', OL: '#6B7280' }
        const pc = posClr[pa.position] || '#22C55E'
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
            zIndex: 9999, animation: 'draftOverlayIn 0.3s ease-out',
          }} onClick={() => setPickAnnouncement(null)}>
            <div style={{
              width: '480px', maxWidth: '94vw', borderRadius: '20px', overflow: 'hidden',
              background: 'linear-gradient(170deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)',
              border: `2px solid ${pc}50`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 60px ${pc}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
              animation: 'draftCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }} onClick={e => e.stopPropagation()}>
              {/* Top accent bar */}
              <div style={{ height: '5px', background: `linear-gradient(90deg, ${pc}, #D4A843, ${pc})` }} />

              {/* Pick label banner */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '14px 24px', background: `linear-gradient(135deg, ${pc}15, transparent)`,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  padding: '4px 16px', borderRadius: 8, fontFamily: "'Barlow Condensed', 'Rajdhani', sans-serif",
                  fontSize: 26, fontWeight: 800, color: '#D4A843', letterSpacing: 1,
                  background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)',
                }}>
                  {pa.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 3, fontFamily: "'Rajdhani', sans-serif" }}>
                  WITH THE {pa.overall ? `#${pa.overall}` : ''} PICK
                </div>
              </div>

              {/* Player section */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '28px 28px 20px', gap: 22 }}>
                {/* Headshot */}
                <div style={{
                  width: 110, height: 110, borderRadius: '50%', flexShrink: 0,
                  background: pa.playerImage
                    ? `url(${pa.playerImage}) center/cover`
                    : `linear-gradient(135deg, ${pc}30, ${pc}10)`,
                  border: `4px solid ${pc}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, fontWeight: 800, color: pc, fontFamily: "'Rajdhani', sans-serif",
                  boxShadow: `0 8px 30px ${pc}30`,
                  animation: 'draftPhotoIn 0.6s ease-out 0.2s both',
                }}>
                  {!pa.playerImage && (pa.playerName?.[0] || '?')}
                </div>

                {/* Name + info */}
                <div style={{ flex: 1, minWidth: 0, animation: 'draftTextIn 0.5s ease-out 0.3s both' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: pc, textTransform: 'uppercase', letterSpacing: 3, fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>
                    PICK IS IN
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.1, marginBottom: 6, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {pa.playerName}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 14px', borderRadius: 6, fontSize: 12, fontWeight: 800,
                      background: `${pc}20`, border: `1px solid ${pc}50`, color: pc,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}>{pa.position}</span>
                    {pa.college && (
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
                        {pa.college}
                      </span>
                    )}
                    {pa.age && (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                        Age {pa.age}{pa.weight ? ` \u00B7 ${pa.weight} lbs` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              {(pa.samAdp || pa.projPts || pa.fortyYard) && (
                <div style={{
                  display: 'flex', gap: 1, margin: '0 20px', borderRadius: 12, overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)', animation: 'draftStatsIn 0.4s ease-out 0.5s both',
                }}>
                  {[
                    pa.samAdp && { label: 'SAM ADP', value: pa.samAdp.toFixed?.(1) || pa.samAdp, color: '#D4A843' },
                    pa.projPts && { label: 'PROJ PTS', value: pa.projPts.toFixed?.(1) || pa.projPts, color: '#22C55E' },
                    pa.fortyYard && { label: '40-YD', value: `${pa.fortyYard}s`, color: '#3B82F6' },
                  ].filter(Boolean).map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Team selection banner */}
              <div style={{
                margin: '16px 20px 0', padding: '14px 20px', borderRadius: 12,
                background: `linear-gradient(135deg, ${pc}10, rgba(212,168,67,0.06))`,
                border: `1px solid ${pc}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                animation: 'draftTeamIn 0.4s ease-out 0.6s both',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>selects</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#D4A843', fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                  {pa.teamName}
                </span>
              </div>

              {/* Timer bar */}
              <div style={{ margin: '16px 20px 20px', height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: `linear-gradient(90deg, ${pc}, #D4A843)`,
                  animation: 'draftTimerShrink 7s linear forwards',
                }} />
              </div>
            </div>
          </div>
        )
      })()}
      <style>{`
        @keyframes draftOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes draftCardIn { from { opacity: 0; transform: scale(0.8) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes draftPhotoIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes draftTextIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes draftStatsIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes draftTeamIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes draftTimerShrink { from { width: 100%; } to { width: 0%; } }
      `}</style>

      {/* ═══ ROOKIE PLAYER CARD POPUP ═══ */}
      <Modal
        open={!!rookieCardPlayer}
        onCancel={() => setRookieCardPlayer(null)}
        footer={null}
        width={560}
        centered
        bodyStyle={{ background: '#0d1117', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 20, padding: 0, overflow: 'hidden', maxHeight: '85vh', overflowY: 'auto' }}
        maskStyle={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        className="rookie-card-modal"
      >
        {rookieCardPlayer && (() => {
          const p = rookieCardPlayer
          const pos = p.Position || '-'
          const posColors = { QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', K: '#A855F7', 'K/P': '#A855F7', P: '#A855F7', EDGE: '#EC4899', DE: '#EC4899', DT: '#EC4899', DL: '#EC4899', LB: '#8B5CF6', CB: '#06B6D4', S: '#14B8A6', OL: '#6B7280' }
          const posColor = posColors[pos] || '#6B7280'
          const sg = p.scoutGrade || 0
          const tierLabel = { cornerstone: 'CORNERSTONE', starter: 'STARTER', flex: 'FLEX', bench: 'BENCH', stash: 'STASH', taxi: 'TAXI' }
          const tierColor = { cornerstone: '#D4A843', starter: '#22C55E', flex: '#3B82F6', bench: '#F59E0B', stash: '#A855F7', taxi: '#6B7280' }
          const isFantasyPos = ['QB', 'RB', 'WR', 'TE'].includes(pos)
          const tLabel = tierLabel[p.scoutTier] || ''
          const tColor = tierColor[p.scoutTier] || '#6B7280'

          // SPP calculation for AI coach
          const SAM_POS_MULT = { QB: 1.45, WR: 1.10, RB: 0.85, TE: 0.95 }
          const posMult = SAM_POS_MULT[pos] || 1.0
          const medPpg = p.compMedPpg || 0
          const spp = (sg / 100) * medPpg * posMult

          // AI Round recommendation
          const aiRound = spp >= 5.0 ? 1 : spp >= 1.3 ? 2 : spp >= 0.6 ? 3 : spp >= 0.35 ? 4 : spp >= 0.24 ? 5 : spp >= 0.17 ? 6 : 7
          const aiLabels = { 1: 'MUST DRAFT', 2: 'TARGET', 3: 'SOLID PICK', 4: 'STASH', 5: 'STASH', 6: 'LATE FLIER', 7: 'LATE FLIER' }
          const aiColors = { 1: '#22C55E', 2: '#3B82F6', 3: '#F59E0B', 4: '#A855F7', 5: '#A855F7', 6: '#6B7280', 7: '#6B7280' }

          const hasScoutData = p.scoutOverview || (p.scoutStrengths && p.scoutStrengths.length > 0)
          const hasComps = p.compMedName

          return (
            <div style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif" }}>
              {/* Header gradient */}
              <div style={{ height: 6, background: `linear-gradient(90deg, ${posColor}, #D4A843)` }} />

              {/* Player Identity */}
              <div style={{ padding: '24px 24px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Headshot */}
                <div style={{
                  width: 80, height: 80, borderRadius: 14, flexShrink: 0,
                  background: p.HostedHeadshotNoBackgroundUrl
                    ? `url(${p.HostedHeadshotNoBackgroundUrl}) center/cover`
                    : `linear-gradient(135deg, ${posColor}30, ${posColor}10)`,
                  border: `2px solid ${posColor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: posColor,
                }}>
                  {!p.HostedHeadshotNoBackgroundUrl && (p.FirstName?.[0] || p.Name?.[0] || '?')}
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: 0.5, lineHeight: 1.1 }}>
                    {p.Name}
                  </h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Tag style={{ background: `${posColor}20`, border: `1px solid ${posColor}50`, color: posColor, fontWeight: 700, fontSize: 11, borderRadius: 6, margin: 0 }}>{pos}</Tag>
                    <Tag style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', fontWeight: 600, fontSize: 11, borderRadius: 6, margin: 0 }}>{p.Team || 'FA'}</Tag>
                    {tLabel && <Tag style={{ background: `${tColor}15`, border: `1px solid ${tColor}40`, color: tColor, fontWeight: 700, fontSize: 10, borderRadius: 6, margin: 0 }}>{tLabel}</Tag>}
                    {p.isGem && <Tag style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.4)', color: '#D4A843', fontWeight: 700, fontSize: 10, borderRadius: 6, margin: 0 }}>💎 GEM</Tag>}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    {p.College && <span style={{ color: '#D4A843' }}>{p.College}</span>}
                    {p.Age ? ` · ${p.Age} yrs` : ''}
                    {p.Height ? ` · ${p.Height}` : ''}
                    {p.Weight ? ` · ${p.Weight} lbs` : ''}
                  </div>
                </div>

                {/* Scout Grade Circle */}
                {sg > 0 && (
                  <div style={{
                    width: 58, height: 58, borderRadius: '50%', flexShrink: 0,
                    background: `conic-gradient(${posColor} ${sg}%, rgba(255,255,255,0.08) ${sg}%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', background: '#0d1117',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column',
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: posColor, lineHeight: 1 }}>{sg.toFixed(1)}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Grade</div>
                    </div>
                  </div>
                )}
              </div>

              {/* SAM Metrics Row */}
              <div style={{ display: 'flex', gap: 1, margin: '16px 16px 0', background: 'rgba(0,0,0,0.4)', borderRadius: 12, overflow: 'hidden' }}>
                {(isFantasyPos ? [
                  { label: 'SAM Rank', value: `#${p.samAdp24 ? Math.round(p.samAdp24) : '-'}`, color: '#D4A843' },
                  { label: 'SAM PPG', value: medPpg ? medPpg.toFixed(1) : '-', color: '#22C55E' },
                  { label: 'SPP', value: spp ? spp.toFixed(2) : '-', color: '#3B82F6' },
                  { label: 'Cap Hit', value: `$${((p.currentYearSalaryCap || 795000) / 1000000).toFixed(1)}M`, color: '#A855F7' },
                ] : [
                  { label: 'SAM Rank', value: `#${p.samAdp24 ? Math.round(p.samAdp24) : '-'}`, color: '#D4A843' },
                  { label: 'Scout Grade', value: sg ? sg.toFixed(1) : '-', color: '#22C55E' },
                  { label: 'Position', value: pos, color: '#3B82F6' },
                  { label: 'Cap Hit', value: `$${((p.currentYearSalaryCap || 795000) / 1000000).toFixed(1)}M`, color: '#A855F7' },
                ]).map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: '12px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Scouting Overview */}
              {p.scoutOverview && (
                <div style={{ margin: '14px 16px 0', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Scout Overview</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{p.scoutOverview}</p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              {hasScoutData && (
                <div style={{ display: 'flex', gap: 8, margin: '12px 16px 0' }}>
                  {p.scoutStrengths?.length > 0 && (
                    <div style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>✓ Strengths</div>
                      {p.scoutStrengths.map((s, i) => (
                        <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3, lineHeight: 1.3 }}>· {s}</div>
                      ))}
                    </div>
                  )}
                  {p.scoutWeaknesses?.length > 0 && (
                    <div style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>✗ Weaknesses</div>
                      {p.scoutWeaknesses.map((w, i) => (
                        <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 3, lineHeight: 1.3 }}>· {w}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Player Comparisons */}
              {hasComps && (
                <div style={{ margin: '12px 16px 0' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Player Comparisons</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      p.compLowName && { label: 'Floor', name: p.compLowName, ppg: p.compLowPpg, color: '#EF4444' },
                      p.compMedName && { label: 'Median', name: p.compMedName, ppg: p.compMedPpg, color: '#F59E0B' },
                      p.compHighName && { label: 'Ceiling', name: p.compHighName, ppg: p.compHighPpg, color: '#22C55E' },
                    ].filter(Boolean).map((c, i) => (
                      <div key={i} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: `${c.color}08`, border: `1px solid ${c.color}20`, textAlign: 'center' }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{c.name}</div>
                        {c.ppg > 0 ? (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{c.ppg} SAM PPG</div>
                        ) : (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Pro Comp</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combine Stats */}
              {(p.fortyYard || p.verticalJump || p.broadJump || p.handSize) && (
                <div style={{ margin: '12px 16px 0' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Combine</div>
                  <div style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden' }}>
                    {[
                      p.fortyYard && { label: '40-YD', value: `${p.fortyYard}s` },
                      p.verticalJump && { label: 'VERT', value: `${p.verticalJump}"` },
                      p.broadJump && { label: 'BROAD', value: p.broadJump },
                      p.handSize && { label: 'HAND', value: `${p.handSize}"` },
                    ].filter(Boolean).map((s, i) => (
                      <div key={i} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', background: 'rgba(255,255,255,0.015)' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{s.value}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Coach Recommendation */}
              <div style={{ margin: '12px 16px 0', padding: '12px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1 }}>AI Coach</span>
                  {isFantasyPos ? (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                      background: `${aiColors[aiRound]}20`, color: aiColors[aiRound], border: `1px solid ${aiColors[aiRound]}40`,
                    }}>{aiLabels[aiRound]}</span>
                  ) : (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)',
                    }}>IDP / DEPTH</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
                  {isFantasyPos ? (
                    aiRound <= 2
                      ? `${p.Name} projects as a high-impact rookie. Target in Round ${aiRound} of your 32-team rookie draft.`
                      : aiRound <= 4
                      ? `Solid contributor. Worth a pick in Round ${aiRound} of your rookie draft.`
                      : `Developmental prospect. Consider as a late-round stash in Round ${aiRound}+.`
                  ) : (
                    sg >= 72
                      ? `${p.Name} is an elite ${pos} prospect who could be a Day 1 starter. High-value IDP pick — draft early if your league scores defense.`
                      : sg >= 60
                      ? `${p.Name} projects as a quality A.Football ${pos}. In IDP leagues, worth a mid-round pick. Could start by Year 2.`
                      : sg >= 50
                      ? `Developmental ${pos} prospect. In IDP/deep leagues, a late-round dart throw with upside if he earns playing time.`
                      : `Roster depth ${pos} prospect. Only relevant in deep IDP leagues or as a taxi squad stash.`
                  )}
                </div>
              </div>

              {/* A.Football Draft Info */}
              {p.nflDraftRound > 0 && (
                <div style={{ margin: '10px 16px 0', padding: '8px 14px', borderRadius: 8, background: 'rgba(0,180,120,0.05)', border: '1px solid rgba(0,180,120,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🏈</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                    A.Football Draft: Rd {p.nflDraftRound} · Pick #{p.nflDraftPick}
                    {p.nflDraftTeam && p.nflDraftTeam !== 'TBD' ? ` · ${p.nflDraftTeam}` : ''}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, padding: '16px 16px 20px', marginTop: 6 }}>
                <Button
                  block
                  onClick={() => {
                    if (isInQueue(p._id)) { handleRemoveQueue(p._id) } else { handleAddQueue(p._id) }
                  }}
                  className={isInQueue(p._id) ? 'sd-queue-remove-btn' : 'sd-queue-add-btn'}
                  icon={isInQueue(p._id) ? <DeleteOutlined /> : <BiSolidPlusCircle />}
                  style={{ height: 40, borderRadius: 10, fontWeight: 700 }}
                >
                  {isInQueue(p._id) ? 'Remove from Queue' : 'Add to Queue'}
                </Button>
                {isMyPick && draftOrder?.isLive && (
                  <Button
                    type="primary"
                    block
                    onClick={() => { handleDraftPlayer(p._id); setRookieCardPlayer(null) }}
                    icon={<ThunderboltOutlined />}
                    style={{ height: 40, borderRadius: 10, fontWeight: 700, background: 'linear-gradient(135deg, #22C55E, #16A34A)', border: 'none' }}
                  >
                    DRAFT
                  </Button>
                )}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default RookieDraft
