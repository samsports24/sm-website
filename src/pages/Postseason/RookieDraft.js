import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button, Input, Table, Tag, Spin, Empty, Tabs, Switch, Modal, notification } from 'antd'
import { CiSearch } from 'react-icons/ci'
import { BiSolidPlusCircle } from 'react-icons/bi'
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  DeleteOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CalendarOutlined,
  StopOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import Header from '../../components/Header'
import DraftChatWidget from '../../components/DraftChatWidget'
import {
  getRookieDraftOrder,
  getRookiePool,
  makeRookiePick,
  toggleRookieDraftLive,
  toggleRookieAutoDraft,
  buildRookieDraftOrder,
  getRookieDraftQueue,
  addToRookieQueue,
  removeFromRookieQueue,
  reorderRookieQueue,
} from '../../redux/actions/rookieDraftAction'
import io from 'socket.io-client'
import { base_url, attachToken, privateAPI, leagueSalaryCap } from '../../config/constants'

const ALL_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K']
const OFFENSE_ONLY_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']

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
  const teamSalary = useSelector((s) => s.user?.teamSalaryCap)
  const myleagueSalaryCap = useSelector((s) => s.user?.leagueSalaryCap?.leagueSalaryCap)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const POSITIONS = isOffenseOnly ? OFFENSE_ONLY_POSITIONS : ALL_POSITIONS
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [searchVal, setSearchVal] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [autoDraftOn, setAutoDraftOn] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  const [draftLoading, setDraftLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState('')
  const [draftBudget, setDraftBudget] = useState(null) // SamPoints remaining for draft
  const [pickAnnouncement, setPickAnnouncement] = useState(null)
  const [rookieCardPlayer, setRookieCardPlayer] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
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

  const handleToggleDraftLive = async (isLive) => {
    await toggleRookieDraftLive(isLive)
  }

  const handleSaveSchedule = async () => {
    try {
      const parsed = scheduleDate ? new Date(scheduleDate) : null
      if (scheduleDate && isNaN(parsed?.getTime())) {
        notification.error({ message: 'Invalid date format' })
        return
      }
      await privateAPI.post('/rookie-draft/schedule', { scheduledDate: parsed?.toISOString() || null }, attachToken())
      notification.success({ message: parsed ? `Draft scheduled for ${parsed.toLocaleString()}` : 'Schedule cleared' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to schedule' })
    }
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

  const handleReorderQueue = async (index, direction) => {
    if (!draftQueue?.length) return
    const newOrder = [...draftQueue]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]
    const playerIds = newOrder.map((q) => q.player?._id)
    await reorderRookieQueue(playerIds)
  }

  // Is the player already in queue?
  const isInQueue = (playerId) =>
    draftQueue?.some((q) => String(q.player?._id) === String(playerId))

  // Next pick after current
  const nextPickInfo = draftOrder?.picks?.find(
    (p) => !p.isCompleted && p.overall > (currentPickInfo?.overall || 0)
  )

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

  // ── Tab 1: Rookie Pool ────────────────────────────────────
  const PoolTab = () => (
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
        rowClassName={(r) =>
          selectedPlayer?._id === r._id ? 'sd-selected-row' : ''
        }
        onRow={(record) => ({ onClick: () => setSelectedPlayer(record) })}
        scroll={{ x: 900 }}
      />
    </Spin>
  )

  // ── Tab 2: Draft Queue ────────────────────────────────────
  const queueColumns = [
    {
      width: 50,
      title: '#',
      key: 'order',
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      width: 60,
      title: ' ',
      key: 'arrows',
      render: (_, __, index) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CaretUpOutlined
            style={{ cursor: index > 0 ? 'pointer' : 'not-allowed', opacity: index > 0 ? 1 : 0.3 }}
            onClick={() => index > 0 && handleReorderQueue(index, 'up')}
          />
          <CaretDownOutlined
            style={{ cursor: index < (draftQueue?.length || 0) - 1 ? 'pointer' : 'not-allowed', opacity: index < (draftQueue?.length || 0) - 1 ? 1 : 0.3 }}
            onClick={() => index < (draftQueue?.length || 0) - 1 && handleReorderQueue(index, 'down')}
          />
        </div>
      ),
    },
    {
      width: 180,
      title: 'Player',
      key: 'player',
      render: (_, obj) => (
        <div className="table_player_name_box nrc_container">
          <p>{obj?.player?.Name || '-'}</p>
        </div>
      ),
    },
    {
      width: 100,
      title: 'POSITION',
      key: 'pos',
      render: (_, obj) => <p>{obj?.player?.Position || '-'}</p>,
    },
    {
      width: 100,
      title: 'TEAM',
      key: 'team',
      render: (_, obj) => <p>{obj?.player?.Team || '-'}</p>,
    },
    {
      width: 80,
      title: ' ',
      key: 'delete',
      render: (_, obj) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          loading={queueLoading === obj?.player?._id}
          onClick={() => handleRemoveQueue(obj?.player?._id)}
        />
      ),
    },
  ]

  const QueueTab = () => (
    <div>
      {draftQueue?.length > 0 ? (
        <Table
          dataSource={draftQueue}
          columns={queueColumns}
          pagination={false}
          size="small"
          rowKey={(record) => record._id || record.player?._id}
          className="sd-pool-table"
        />
      ) : (
        <Empty description="No players in your queue. Click the + icon in the Rookie Pool tab to add players." />
      )}
    </div>
  )

  // ── Tab 3: Team Rosters (picks so far) ────────────────────
  const TeamRostersTab = () => {
    const teamPicks = {}
    draftOrder?.picks
      ?.filter((p) => p.isCompleted && p.player)
      ?.forEach((p) => {
        const teamName = p.team?.name || p.team?.abbreviation || 'Unknown'
        const teamId = String(p.team?._id || p.team)
        if (!teamPicks[teamId]) teamPicks[teamId] = { name: teamName, picks: [] }
        teamPicks[teamId].picks.push(p)
      })

    return (
      <div className="sd-team-rosters-tab">
        {Object.keys(teamPicks).length > 0 ? (
          Object.entries(teamPicks).map(([teamId, data]) => (
            <div key={teamId} className="sd-roster-team-block">
              <div className="sd-roster-team-header">
                <span className="sd-roster-team-name">{data.name}</span>
                <span className="sd-roster-team-count">{data.picks.length} picks</span>
              </div>
              {data.picks.map((pick, idx) => (
                <div key={idx} className="sd-roster-pick-row">
                  <span className="sd-roster-pick-label">{pick.label}</span>
                  <span className="sd-roster-pick-player">
                    {pick.player?.Name || 'Unknown'}
                  </span>
                  <span className="sd-roster-pick-pos">{pick.player?.Position || '-'}</span>
                  <span className="sd-roster-pick-team">{pick.player?.Team || '-'}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <Empty description="No picks made yet" />
        )}
      </div>
    )
  }

  const tabItems = [
    { key: '1', label: 'Rookie Pool', children: <PoolTab /> },
    { key: '2', label: `Draft Queue (${draftQueue?.length || 0})`, children: <QueueTab /> },
    { key: '3', label: 'Team Rosters', children: <TeamRostersTab /> },
  ]

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="postseason-page">
      <Header />
      <main className="postseason-main sd-layout">
        {/* ─── Left Sidebar ─── */}
        <div className="sd-left">
          {/* Countdown Timer, always visible when draft exists */}
          {draftOrder && (
            <div className={`sd-timer-card ${draftOrder?.isLive && countdown.isUrgent ? 'sd-timer-urgent' : ''} ${!draftOrder?.isLive ? 'sd-timer-paused' : ''}`}>
              <ClockCircleOutlined className="sd-timer-icon" />
              <span className="sd-timer-display">
                {draftOrder?.isLive && currentPickInfo
                  ? countdown.display
                  : draftOrder?.isCompleted
                  ? 'DONE'
                  : 'PAUSED'}
              </span>
              <span className="sd-timer-label">
                {draftOrder?.isLive && currentPickInfo
                  ? isMyPick ? 'Your pick!' : currentPickInfo.team?.abbreviation
                  : draftOrder?.isCompleted
                  ? 'Draft Complete'
                  : 'Waiting to start'}
              </span>
            </div>
          )}

          {/* Draft Budget — matches header "Budget Left" */}
          {draftOrder && (() => {
            const effectiveCap = myleagueSalaryCap?.leagueSalaryCap || myleagueSalaryCap || leagueSalaryCap
            const capLeft = effectiveCap != null && teamSalary != null ? effectiveCap - teamSalary : 0
            const formatBudget = (val) => {
              if (val == null) return '$0'
              const abs = Math.abs(val)
              const sign = val < 0 ? '-' : ''
              if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
              if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
              if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
              return `${sign}$${abs}`
            }
            return (
            <div className="sd-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(59,130,246,0.06) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="sd-card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💎</span> Draft Budget
                </h3>
              </div>
              <div className="sd-card-body" style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: capLeft < 0 ? '#EF4444' : '#22C55E', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {formatBudget(capLeft)}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  Budget Remaining
                </div>
                {currentPickInfo && isMyPick && (
                  <div style={{ fontSize: 11, color: '#F97316', marginTop: 6, padding: '4px 8px', background: 'rgba(249,115,22,0.1)', borderRadius: 6 }}>
                    Pick #{currentPickInfo.overall} slot cost shown on selection
                  </div>
                )}
              </div>
            </div>
            )
          })()}

          {/* Any drafter can pause the draft */}
          {!isCommissioner && draftOrder?.isLive && !draftOrder?.isCompleted && (
            <div className="sd-card" style={{ marginBottom: '8px' }}>
              <div className="sd-card-header"><h3>Draft Control</h3></div>
              <div className="sd-card-body" style={{ padding: '10px 14px' }}>
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleTogglePause(true)}
                  block
                  style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#F59E0B', fontWeight: 700 }}
                >
                  CALL TIMEOUT
                </Button>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
                  Commissioner must resume
                </div>
              </div>
            </div>
          )}
          {!isCommissioner && !draftOrder?.isLive && draftPaused && !draftOrder?.isCompleted && (
            <div className="sd-card" style={{ marginBottom: '8px' }}>
              <div className="sd-card-body" style={{ padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>
                  ⏸ Draft Paused, Waiting for commissioner to resume
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>Auto-resumes in 5 min</div>
              </div>
            </div>
          )}

          {/* Commissioner Controls */}
          {isCommissioner && (
            <div className="sd-card sd-commissioner-card">
              <div className="sd-card-header">
                <h3>Commissioner</h3>
              </div>
              <div className="sd-card-body sd-commissioner-controls">
                {/* Schedule */}
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(110,105,128,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CalendarOutlined style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Schedule</span>
                    <span style={{ marginLeft: 'auto', color: draftOrder?.scheduledDate ? '#D4A843' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}>
                      {draftOrder?.scheduledDate ? new Date(draftOrder.scheduledDate).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Input
                      size="small"
                      placeholder="MM/DD/YYYY HH:MM"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(110,105,128,0.15)', color: '#fff', fontSize: 11 }}
                    />
                    <Button size="small" type="primary" onClick={handleSaveSchedule}>Set</Button>
                    {(draftOrder?.scheduledDate || scheduleDate) && (
                      <Button size="small" danger onClick={() => { setScheduleDate(''); handleSaveSchedule() }}>Clear</Button>
                    )}
                  </div>
                </div>

                {/* On/Off + Pause */}
                {draftOrder && !draftOrder?.isCompleted && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {draftOrder?.isLive || !draftPaused ? (
                      <Button
                        icon={<StopOutlined />}
                        danger
                        onClick={() => { handleToggleDraftLive(false); setDraftPaused(true) }}
                        style={{ flex: 1 }}
                      >
                        TURN OFF
                      </Button>
                    ) : (
                      <Button
                        icon={<PoweroffOutlined />}
                        type="primary"
                        onClick={() => { handleToggleDraftLive(true); setDraftPaused(false) }}
                        style={{ flex: 1, background: '#22C55E', borderColor: '#22C55E' }}
                      >
                        TURN ON
                      </Button>
                    )}
                    {draftOrder?.isLive && (
                      <Button
                        icon={<PauseCircleOutlined />}
                        onClick={() => { handleToggleDraftLive(false); setDraftPaused(true) }}
                        style={{ flex: 1, background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#F59E0B' }}
                      >
                        PAUSE
                      </Button>
                    )}
                  </div>
                )}

                {!draftOrder ? (
                  <Button
                    type="primary"
                    icon={<TrophyOutlined />}
                    onClick={() => buildRookieDraftOrder(7)}
                    loading={loading}
                    block
                  >
                    GENERATE {draftYear} ROOKIE DRAFT
                  </Button>
                ) : draftOrder?.isLive ? (
                  <Button
                    type="primary"
                    danger
                    icon={<PauseCircleOutlined />}
                    onClick={() => handleToggleDraftLive(false)}
                    block
                  >
                    PAUSE DRAFT
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleToggleDraftLive(true)}
                    disabled={draftOrder?.isCompleted}
                    block
                  >
                    {draftOrder?.isCompleted ? 'DRAFT COMPLETE' : 'START / RESUME DRAFT'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Autodraft Toggle */}
          {draftOrder && (
            <div className="sd-card sd-autodraft-card">
              <div className="sd-card-header">
                <h3>Autodraft</h3>
                <Switch
                  checked={autoDraftOn}
                  onChange={handleAutoDraftToggle}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  className="sd-autodraft-switch"
                />
              </div>
              <p className="sd-autodraft-desc">
                {autoDraftOn
                  ? 'Picks from your queue (or best available) when on the clock'
                  : 'Enable to auto-pick rookies when it\'s your turn'}
              </p>
            </div>
          )}

          {/* Draft Chat */}
          <DraftChatWidget leagueName="Rookie Draft" height="220px" />

          {/* Draft Order */}
          <div className="sd-card">
            <div className="sd-card-header">
              <h3>Draft Order</h3>
              {draftOrder?.isLive && (
                <Tag color="green" className="sd-live-tag">LIVE</Tag>
              )}
            </div>
            <div className="sd-card-body sd-order-list">
              {draftOrder?.picks?.length > 0 ? (
                <div className="sd-order-scroll">
                  {draftOrder.picks.map((pick, idx) => {
                    const isCurrent =
                      pick.round === draftOrder.currentRound &&
                      pick.pick === draftOrder.currentPick &&
                      !pick.isCompleted
                    const isNext =
                      nextPickInfo &&
                      pick.round === nextPickInfo.round &&
                      pick.pick === nextPickInfo.pick &&
                      !pick.isCompleted
                    const isMyTeamPick =
                      String(pick.team?._id) === String(user?.team?._id)
                    const posColors = { QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', K: '#A855F7', DE: '#EC4899', DT: '#EC4899', LB: '#8B5CF6', CB: '#06B6D4', S: '#14B8A6', OL: '#6B7280' }
                    const pickPosColor = pick.player?.Position ? (posColors[pick.player.Position] || '#6B7280') : '#6B7280'
                    return (
                      <div
                        key={idx}
                        className={`sd-order-row ${pick.isCompleted ? 'sd-order-completed' : ''} ${isCurrent ? 'sd-order-active' : ''} ${isNext ? 'sd-order-next' : ''}`}
                      >
                        <span className="sd-order-pick-label">{pick.label}</span>
                        <span className={`sd-order-team ${isMyTeamPick && !pick.isCompleted ? 'sd-order-my-team' : ''}`}>
                          {pick.team?.abbreviation || '?'}
                        </span>
                        {pick.isCompleted && !pick.skipped && pick.player ? (
                          <span className="sd-order-player sd-order-player-selected" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                            <span style={{
                              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              background: pick.player.HostedHeadshotNoBackgroundUrl
                                ? `url(${pick.player.HostedHeadshotNoBackgroundUrl}) center/cover`
                                : `linear-gradient(135deg, ${pickPosColor}40, ${pickPosColor}15)`,
                              border: `2px solid ${pickPosColor}60`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, color: pickPosColor, fontWeight: 700,
                            }}>
                              {!pick.player.HostedHeadshotNoBackgroundUrl && (pick.player.Name?.[0] || '?')}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {pick.player.Name}
                              </span>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                <span style={{ color: pickPosColor, fontWeight: 700 }}>{pick.player.Position}</span>
                                {pick.player.College ? ` · ${pick.player.College}` : pick.player.Team ? ` · ${pick.player.Team}` : ''}
                              </span>
                            </span>
                          </span>
                        ) : (
                          <span className="sd-order-player">
                            {pick.isCompleted
                              ? 'Skipped'
                              : isCurrent
                              ? 'ON CLOCK'
                              : isNext
                              ? 'NEXT'
                              : '—'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty description="No draft order yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        </div>

        {/* ─── Center: Main Content ─── */}
        <div className="sd-center">
          {/* Rookie Draft Header Banner */}
          <div className="rd-header-banner">
            <TrophyOutlined className="rd-header-icon" />
            <div className="rd-header-text">
              <h1 className="rd-header-title">{draftYear} ROOKIE DRAFT</h1>
              <span className="rd-header-subtitle">
                7 Rounds, Linear Order (Worst to First), 120s Timer, Rookies Only
              </span>
            </div>
            {draftOrder?.isCompleted && (
              <Tag color="green" style={{ marginLeft: 'auto', fontWeight: 700 }}>COMPLETED</Tag>
            )}
          </div>

          {/* On the Clock Banner with Countdown, always visible when draft exists */}
          {draftOrder && !draftOrder?.isCompleted && (
            <div className={`sd-clock-banner ${isMyPick && draftOrder?.isLive ? 'sd-my-pick' : ''} ${!draftOrder?.isLive ? 'sd-clock-paused' : ''}`}>
              <div className="rd-clock-left">
                {draftOrder?.isLive ? <ThunderboltOutlined /> : <PauseCircleOutlined />}
                <span>
                  {!draftOrder?.isLive
                    ? 'DRAFT PAUSED, Waiting for commissioner to start'
                    : isMyPick
                    ? 'YOU ARE ON THE CLOCK!'
                    : `On the clock: ${currentPickInfo?.team?.name || 'Unknown'}`}
                </span>
                {draftOrder?.isLive && currentPickInfo && (
                  <span className="sd-clock-pick">{currentPickInfo.label}</span>
                )}
                {autoDraftOn && isMyPick && draftOrder?.isLive && (
                  <Tag color="cyan" className="sd-auto-tag">AUTO in {countdown.display}</Tag>
                )}
              </div>
              <div className={`rd-clock-timer ${draftOrder?.isLive && countdown.isUrgent ? 'rd-clock-urgent' : ''} ${!draftOrder?.isLive ? 'rd-clock-paused' : ''}`}>
                <ClockCircleOutlined />
                <span>{draftOrder?.isLive && currentPickInfo ? countdown.display : '--:--'}</span>
              </div>
            </div>
          )}

          {/* Draft Action Bar */}
          {draftOrder && !draftOrder?.isCompleted && (
            <div className="rd-draft-action-bar">
              <Button
                type="primary"
                size="large"
                onClick={() => selectedPlayer ? handleDraftPlayer(selectedPlayer?._id) : null}
                loading={draftLoading}
                disabled={!selectedPlayer || !isMyPick || !draftOrder?.isLive}
                className="rd-draft-btn"
              >
                <ThunderboltOutlined />
                {selectedPlayer
                  ? `DRAFT ${selectedPlayer?.Name || 'PLAYER'}`
                  : 'SELECT A PLAYER TO DRAFT'}
              </Button>
            </div>
          )}

          {/* Position Filter Pills + AUTODRAFT + Search */}
          <div className="rd-filter-bar">
            <div className="rd-pills">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  className={`rd-pill ${posFilter === pos ? 'rd-pill-active' : ''}`}
                  onClick={() => setPosFilter(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
            <div className="rd-search-area">
              <Button
                loading={draftLoading}
                disabled={
                  draftOrder?.isCompleted || !(isMyPick && draftOrder?.isLive)
                }
                type="primary"
                onClick={handleAutoDraft}
                className="rd-autodraft-btn"
              >
                AUTODRAFT
              </Button>
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
          </div>

          {/* Tabs */}
          <div className="table_container">
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              className="tabs"
              onChange={(v) => {
                setActiveTab(v)
                if (v === '2') getRookieDraftQueue()
              }}
            />
          </div>

        </div>

        {/* ─── Right: Selected Player Detail ─── */}
        <div className="sd-right">
          {selectedPlayer ? (
            <div className="sd-card sd-detail-card">
              <div className="sd-card-header">
                <h3>Player Detail</h3>
              </div>
              <div className="sd-card-body">
                <div className="sd-detail-img-wrap">
                  <div
                    className="sd-detail-img"
                    style={{
                      backgroundImage: `url(${selectedPlayer?.HostedHeadshotNoBackgroundUrl || ''})`,
                    }}
                  />
                </div>
                <h2 className="sd-detail-name">{selectedPlayer?.Name}</h2>
                <div className="sd-detail-meta">
                  <Tag color="purple">{selectedPlayer?.Position}</Tag>
                  <Tag>{selectedPlayer?.Team || 'FA'}</Tag>
                  <Tag color="blue">Rookie</Tag>
                </div>
                {selectedPlayer?.College && (
                  <p className="sd-detail-from">College: {selectedPlayer.College}</p>
                )}
                <div className="sd-detail-stats">
                  <div className="sd-dstat">
                    <span className="sd-dstat-val">
                      {selectedPlayer?.samAdp24 ? Math.round(selectedPlayer.samAdp24) : '-'}
                    </span>
                    <span className="sd-dstat-label">SAM ADP</span>
                  </div>
                  <div className="sd-dstat">
                    <span className="sd-dstat-val">
                      {selectedPlayer?.FantasyPoints24?.toFixed(1) || '0.0'}
                    </span>
                    <span className="sd-dstat-label">Proj PTS</span>
                  </div>
                  <div className="sd-dstat">
                    <span className="sd-dstat-val">
                      ${(selectedPlayer?.currentYearSalaryCap || 0).toLocaleString()}
                    </span>
                    <span className="sd-dstat-label">Value</span>
                  </div>
                </div>
                {/* ── Combine Stats ── */}
                {(selectedPlayer?.fortyYard || selectedPlayer?.verticalJump || selectedPlayer?.broadJump) && (
                  <div className="sd-detail-stats" style={{ marginTop: 8 }}>
                    {selectedPlayer?.fortyYard && (
                      <div className="sd-dstat">
                        <span className="sd-dstat-val">{selectedPlayer.fortyYard}s</span>
                        <span className="sd-dstat-label">40-Yard</span>
                      </div>
                    )}
                    {selectedPlayer?.verticalJump && (
                      <div className="sd-dstat">
                        <span className="sd-dstat-val">{selectedPlayer.verticalJump}&quot;</span>
                        <span className="sd-dstat-label">Vert</span>
                      </div>
                    )}
                    {selectedPlayer?.broadJump && (
                      <div className="sd-dstat">
                        <span className="sd-dstat-val">{selectedPlayer.broadJump}</span>
                        <span className="sd-dstat-label">Broad</span>
                      </div>
                    )}
                    {selectedPlayer?.handSize && (
                      <div className="sd-dstat">
                        <span className="sd-dstat-val">{selectedPlayer.handSize}&quot;</span>
                        <span className="sd-dstat-label">Hand</span>
                      </div>
                    )}
                  </div>
                )}
                {selectedPlayer?.draftNote && (
                  <p className="sd-detail-from" style={{ marginTop: 6, color: '#D4A843', fontStyle: 'italic' }}>
                    {selectedPlayer.draftNote}
                  </p>
                )}
                <Button
                  block
                  className={`sd-queue-action-btn ${isInQueue(selectedPlayer?._id) ? 'sd-queue-remove-btn' : 'sd-queue-add-btn'}`}
                  icon={isInQueue(selectedPlayer?._id) ? <DeleteOutlined /> : <BiSolidPlusCircle />}
                  onClick={() =>
                    isInQueue(selectedPlayer?._id)
                      ? handleRemoveQueue(selectedPlayer?._id)
                      : handleAddQueue(selectedPlayer?._id)
                  }
                >
                  {isInQueue(selectedPlayer?._id) ? 'Remove from Queue' : 'Add to Pre-Pick Queue'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="sd-card">
              <div className="sd-card-header">
                <h3>Player Detail</h3>
              </div>
              <div className="sd-card-body sd-empty-detail">
                <Empty description="Select a player from the pool" />
              </div>
            </div>
          )}

          {/* Draft Info */}
          <div className="sd-card sd-pool-stats">
            <div className="sd-card-header">
              <h3>Draft Info</h3>
            </div>
            <div className="sd-card-body">
              <div className="sd-stat-row">
                <span className="sd-stat-label">Season</span>
                <span className="sd-stat-val">{draftYear}</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Rounds</span>
                <span className="sd-stat-val">{draftOrder?.totalRounds || 7}</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Order</span>
                <span className="sd-stat-val">Linear (Worst First)</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Eligible</span>
                <span className="sd-stat-val">Rookies Only</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Available</span>
                <span className="sd-stat-val">{pool.total || 0}</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Queue</span>
                <span className="sd-stat-val">{draftQueue?.length || 0} players</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Status</span>
                <span className="sd-stat-val">
                  {draftOrder?.isCompleted
                    ? 'Complete'
                    : draftOrder?.isLive
                    ? 'LIVE'
                    : draftOrder
                    ? 'Paused'
                    : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
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
