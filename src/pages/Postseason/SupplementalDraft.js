import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button, Input, Table, Tag, Spin, Empty, Tabs, Tooltip, Switch, Image, notification } from 'antd'
import { CiSearch } from 'react-icons/ci'
import { BiSolidPlusCircle } from 'react-icons/bi'
import {
  ThunderboltOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CalendarOutlined,
  StopOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import Header from '../../components/Header'
import DraftChatWidget from '../../components/DraftChatWidget'
import {
  getPostseasonState,
  getSupplementalPool,
  getDraftOrder,
  makeSupplementalPick,
  setPoolSearch,
  setPoolPosition,
  setPoolPage,
  toggleAutoDraft,
  toggleDraftLive,
  getDraftQueue,
  addToQueue,
  removeFromQueue,
  reorderQueue,
  getRosterTags,
} from '../../redux/actions/postseasonAction'
import store from '../../redux/store'
import io from 'socket.io-client'
import { base_url, attachToken, privateAPI } from '../../config/constants'

const ALL_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K/P']
const OFFENSE_ONLY_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']

// ── Countdown Hook ───────────────────────────────────────────
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

const SupplementalDraft = () => {
  const {
    state: postseasonState,
    pool,
    draftOrder,
    loading,
    poolSearch,
    poolPosition,
    draftQueue,
    rosterTags,
  } = useSelector((s) => s.postseason)
  const user = useSelector((s) => s.user)
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const POSITIONS = isOffenseOnly ? OFFENSE_ONLY_POSITIONS : ALL_POSITIONS
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [searchVal, setSearchVal] = useState('')
  const [autoDraftOn, setAutoDraftOn] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  const [draftLoading, setDraftLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState('')
  const [pickAnnouncement, setPickAnnouncement] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [draftPaused, setDraftPaused] = useState(false)
  const socketRef = useRef(null)

  const countdown = useCountdown(draftOrder?.pickDeadline)

  // Commissioner check
  const isCommissioner =
    user?.userDetails?.team?.currentLeague?.createdBy === user?.userDetails?._id ||
    user?.userDetails?.team?.currentLeague?.coComissioner === user?.userDetails?._id

  // Init: load state
  useEffect(() => {
    getPostseasonState()
    getDraftQueue()
  }, [])

  // Load draft data when week changes
  useEffect(() => {
    if (postseasonState?.currentWeek) {
      getDraftOrder(postseasonState.currentWeek)
      getSupplementalPool({
        position: poolPosition !== 'ALL' ? poolPosition : undefined,
        search: poolSearch,
      })
    }
  }, [postseasonState?.currentWeek, poolPosition, poolSearch])

  // Sync autoDraft state from user's team
  useEffect(() => {
    setAutoDraftOn(!!user?.team?.autoDraft)
  }, [user?.team?.autoDraft])

  // Socket.IO listener
  useEffect(() => {
    const socket = io(base_url || 'https://backend.samsports.io', { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('supplemental_pick', async (data) => {
      // Show pick announcement
      if (data?.pick?.player) {
        setPickAnnouncement({
          playerName: data.pick.player.Name || 'Player',
          playerImage: data.pick.player.HostedHeadshotNoBackgroundUrl || null,
          teamName: data.pick.team?.name || data.pick.team?.abbreviation || 'Team',
          position: data.pick.player.Position || '',
          round: data.pick.round || 1,
          pick: data.pick.overall || data.pick.pick || 1,
        })
        setTimeout(() => setPickAnnouncement(null), 5000)
      }
      if (postseasonState?.currentWeek) {
        await getDraftOrder(postseasonState.currentWeek)
        await getSupplementalPool({
          position: poolPosition !== 'ALL' ? poolPosition : undefined,
          search: poolSearch,
        })
        await getDraftQueue()
      }
    })

    socket.on('supplemental_draft_status', async (data) => {
      if (postseasonState?.currentWeek) {
        await getDraftOrder(postseasonState.currentWeek)
      }
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

    return () => {
      socket.disconnect()
    }
  }, [postseasonState?.currentWeek, poolPosition, poolSearch])

  // ── Handlers ─────────────────────────────────────────────
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      store.dispatch(setPoolSearch(searchVal))
    }
  }

  const handlePositionChange = (pos) => {
    store.dispatch(setPoolPosition(pos))
    store.dispatch(setPoolPage(1))
  }

  // Smart autodraft, auto-pick when it's my turn and autodraft is ON (10s delay)
  useEffect(() => {
    if (autoDraftOn && isMyPick && draftOrder?.isLive && !draftLoading) {
      notification.info({ key: 'supp-autodraft', message: '🤖 Smart Autodraft', description: 'Analyzing squad needs... picking in 10s', duration: 10 })
      const timer = setTimeout(() => handleAutoDraft(), 10000)
      return () => { clearTimeout(timer); notification.destroy('supp-autodraft') }
    }
  }, [autoDraftOn, isMyPick, draftOrder?.isLive, draftLoading])

  const handleAutoDraft = async () => {
    if (!isMyPick || !draftOrder?.isLive) return
    setDraftLoading(true)
    notification.destroy('supp-autodraft')

    // Smart autodraft: analyze squad + pick best by position need
    try {
      attachToken()
      const res = await privateAPI.get('/postseason/smart-autodraft')
      const smartPick = res?.data?.data?.player
      if (smartPick?._id) {
        await makeSupplementalPick(smartPick._id, postseasonState?.currentWeek)
        notification.success({ message: `🤖 Smart pick: ${smartPick.Name}`, description: `${smartPick.Position}, ${res.data.data.position} need filled`, duration: 4 })
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
      playerId = pool.players[0]?.player?._id
    }
    if (playerId) {
      await makeSupplementalPick(playerId, postseasonState?.currentWeek)
    }
    setDraftLoading(false)
  }

  const handleDraftPlayer = async (playerId) => {
    if (!playerId || !postseasonState?.currentWeek) return
    setDraftLoading(true)
    await makeSupplementalPick(playerId, postseasonState.currentWeek)
    setSelectedPlayer(null)
    setDraftLoading(false)
  }

  const handleAutoDraftToggle = async (checked) => {
    setAutoDraftOn(checked)
    await toggleAutoDraft(checked, postseasonState?.currentWeek)
  }

  const handleToggleDraftLive = async (isLive) => {
    await toggleDraftLive(postseasonState?.currentWeek, isLive)
  }

  const handleSaveSchedule = async () => {
    try {
      const parsed = scheduleDate ? new Date(scheduleDate) : null
      if (scheduleDate && isNaN(parsed?.getTime())) {
        notification.error({ message: 'Invalid date format' })
        return
      }
      await privateAPI.post('/postseason/schedule', { scheduledDate: parsed?.toISOString() || null }, attachToken())
      notification.success({ message: parsed ? `Draft scheduled for ${parsed.toLocaleString()}` : 'Schedule cleared' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to schedule' })
    }
  }

  const handleTogglePause = async (paused) => {
    try {
      await privateAPI.post('/postseason/toggle-pause', { paused, week: postseasonState?.currentWeek }, attachToken())
      setDraftPaused(paused)
      notification.success({ message: paused ? 'Draft paused — waiting for commissioner to resume' : 'Draft resumed' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to toggle pause' })
    }
  }

  const handleAddQueue = async (playerId) => {
    setQueueLoading(playerId)
    await addToQueue(playerId)
    setQueueLoading('')
  }

  const handleRemoveQueue = async (playerId) => {
    setQueueLoading(playerId)
    await removeFromQueue(playerId)
    setQueueLoading('')
  }

  const handleReorderQueue = async (index, direction) => {
    if (!draftQueue?.length) return
    const newOrder = [...draftQueue]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]
    const playerIds = newOrder.map((q) => q.player?._id)
    await reorderQueue(playerIds)
  }

  // Is the selected player already in queue?
  const isInQueue = (playerId) =>
    draftQueue?.some((q) => String(q.player?._id) === String(playerId))

  // ── Roster count for 53-player cap display ──────────────
  const getTeamRosterCount = (teamId) => {
    if (!rosterTags?.length) return 0
    return rosterTags.filter((t) => String(t.team) === String(teamId)).length
  }

  // ══════════════════════════════════════════════════════════
  //  TAB 1: DRAFT POOL
  // ══════════════════════════════════════════════════════════
  const poolColumns = [
    {
      width: 50,
      title: ' ',
      dataIndex: 'plus-icon',
      key: 'plus-icon',
      render: (_, obj) => {
        const pid = obj?.player?._id
        const queued = isInQueue(pid)
        return (
          <div>
            {queueLoading === pid ? (
              <Spin size="small" />
            ) : (
              <BiSolidPlusCircle
                size={18}
                style={{ marginBottom: '-3px', cursor: 'pointer' }}
                color={queued ? 'var(--primary)' : 'none'}
                onClick={() => queued ? handleRemoveQueue(pid) : handleAddQueue(pid)}
              />
            )}
          </div>
        )
      },
    },
    {
      width: 90,
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (_, obj, index) => <p>{(pool.page - 1) * pool.limit + index + 1}</p>,
    },
    {
      width: 150,
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
      render: (_, obj) => {
        const inj = obj?.player?.InjuryStatus
        return (
          <div className='table_player_name_box nrc_container'>
            <p
              onClick={() => setSelectedPlayer(obj)}
              style={{ cursor: 'pointer' }}
            >
              {obj?.player?.Name || '-'}
            </p>
            {inj === 'Out' ? (
              <>
                <span className='injury_plus'><b>+</b></span>
                <p className='injury_plus_text'>O</p>
              </>
            ) : inj === 'Questionable' ? (
              <p className='injury_status'>Q</p>
            ) : inj === 'Doubtful' ? (
              <p className='injury_status'>D</p>
            ) : inj === 'Suspended' ? (
              <p className='injury_status'>SSPD</p>
            ) : inj === 'Injured Reserve' ? (
              <p className='injury_status'>IR</p>
            ) : ''}
          </div>
        )
      },
    },
    {
      width: 80,
      title: 'AGE',
      dataIndex: 'age',
      key: 'age',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.player?.Age || '-'}</p>
        </div>
      ),
    },
    {
      width: 100,
      title: 'POSITION',
      dataIndex: 'pos',
      key: 'pos',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.player?.Position || '-'}</p>
        </div>
      ),
    },
    {
      width: 80,
      title: 'TEAM',
      dataIndex: 'team',
      key: 'team',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.player?.Team || '-'}</p>
        </div>
      ),
    },
    {
      width: 100,
      title: 'CAP HIT',
      dataIndex: 'caphit',
      key: 'caphit',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{`${(obj?.player?.currentYearSalaryCap || 0).toLocaleString()} SP`}</p>
        </div>
      ),
    },
    {
      width: 100,
      title: 'SAM ADP',
      dataIndex: 'adp',
      key: 'adp',
      render: (_, obj) => <p>{obj?.player?.samAdp24?.toFixed(3) || '-'}</p>,
    },
    {
      width: 120,
      title: '26 TOTAL POINTS',
      dataIndex: 'totalPts',
      key: 'totalPts',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.player?.pf?.toFixed(3) || '-'}</p>
        </div>
      ),
    },
    {
      width: 120,
      title: '26 AVG.POINTS',
      dataIndex: 'avgPts',
      key: 'avgPts',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.player?.avgPf?.toFixed(3) || '-'}</p>
        </div>
      ),
    },
    {
      width: 140,
      title: '26 PROJ.TOTAL POINTS',
      dataIndex: 'projPts',
      key: 'projPts',
      render: (_, obj) => (
        <div className='table_player_name_box nrc_container'>
          <p>{obj?.stats?.stats?.FantasyPoints24?.toFixed(3) || '-'}</p>
        </div>
      ),
    },
  ]

  const DraftPoolTab = () => (
    <Spin spinning={loading}>
      <Table
        dataSource={pool.players}
        columns={poolColumns}
        pagination={{
          current: pool.page,
          pageSize: pool.limit,
          total: pool.total,
          onChange: (page) =>
            getSupplementalPool({
              page,
              position: poolPosition !== 'ALL' ? poolPosition : undefined,
              search: poolSearch,
            }),
          showSizeChanger: false,
          size: 'small',
        }}
        size="small"
        rowKey={(record) => record._id || record.player?._id}
        className="sd-pool-table"
        rowClassName={(record) =>
          selectedPlayer?.player?._id === record.player?._id ? 'sd-selected-row' : ''
        }
        onRow={(record) => ({
          onClick: () => setSelectedPlayer(record),
        })}
        scroll={{ x: 1200 }}
      />
    </Spin>
  )

  // ══════════════════════════════════════════════════════════
  //  TAB 2: DRAFT QUEUE
  // ══════════════════════════════════════════════════════════
  const queueColumns = [
    {
      width: 50,
      title: '#',
      dataIndex: 'order',
      key: 'order',
      render: (_, obj, index) => <span>{index + 1}</span>,
    },
    {
      width: 60,
      title: ' ',
      key: 'arrows',
      render: (_, obj, index) => (
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
      dataIndex: 'player',
      key: 'player',
      render: (player) => (
        <div className='table_player_name_box nrc_container'>
          <p>{player?.Name || '-'}</p>
        </div>
      ),
    },
    {
      width: 100,
      title: 'POSITION',
      dataIndex: 'player',
      key: 'pos',
      render: (player) => <p>{player?.Position || '-'}</p>,
    },
    {
      width: 100,
      title: 'TEAM',
      dataIndex: 'player',
      key: 'team',
      render: (player) => <p>{player?.Team || '-'}</p>,
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

  const DraftQueueTab = () => (
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
        <Empty description="No players in your queue. Add from Draft Pool tab." />
      )}
    </div>
  )

  // ══════════════════════════════════════════════════════════
  //  TAB 3: TEAM ROSTERS (draft picks so far)
  // ══════════════════════════════════════════════════════════
  const TeamRostersTab = () => {
    const teamPicks = {}
    draftOrder?.picks?.filter((p) => p.isCompleted)?.forEach((p) => {
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

  // ══════════════════════════════════════════════════════════
  //  TAB 4: BLACK LIST (placeholder, can be wired up later)
  // ══════════════════════════════════════════════════════════
  const BlackListTab = () => (
    <div>
      <Empty description="Blacklist feature, coming soon" />
    </div>
  )

  const tabItems = [
    { key: '1', label: 'Draft Pool', children: <DraftPoolTab /> },
    { key: '2', label: 'Draft Queue', children: <DraftQueueTab /> },
    { key: '3', label: 'Team Rosters', children: <TeamRostersTab /> },
    { key: '4', label: 'Black List', children: <BlackListTab /> },
  ]

  // ══════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="postseason-page">
      <Header />
      <main className="postseason-main sd-layout">
        {/* ─── Left: Draft Order + Timer + Controls ─── */}
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

          {/* Commissioner Controls: Schedule / On-Off / Pause */}
          {isCommissioner && (
            <div className="sd-card sd-commissioner-card">
              <div className="sd-card-header">
                <h3>Commissioner Controls</h3>
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
                {!draftOrder?.isCompleted && (
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

                {draftOrder?.isLive ? (
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
                {draftOrder?.isCompleted && (
                  <Tag color="green" style={{ marginTop: 8, textAlign: 'center', width: '100%' }}>
                    Draft is complete
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* Autodraft Toggle */}
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: autoDraftOn ? 'rgba(34,197,94,0.08)' : 'rgba(20,28,45,0.6)',
            border: autoDraftOn ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(110,105,128,0.15)',
            transition: 'all 200ms', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>🤖</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontWeight: 700,
                color: autoDraftOn ? '#22C55E' : 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Smart Autodraft {autoDraftOn ? 'Active' : 'Off'}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                {autoDraftOn ? 'Analyzes squad, picks best in 10s' : 'Enable for smart auto-picks'}
              </div>
            </div>
            <Switch
              checked={autoDraftOn}
              onChange={handleAutoDraftToggle}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{ background: autoDraftOn ? '#22C55E' : 'rgba(110,105,128,0.3)' }}
            />
          </div>

          {/* Draft Chat */}
          <DraftChatWidget leagueName="Supplemental Draft" height="220px" />

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
                    return (
                      <div
                        key={idx}
                        className={`sd-order-row ${pick.isCompleted ? 'sd-order-completed' : ''} ${isCurrent ? 'sd-order-active' : ''}`}
                      >
                        <span className="sd-order-pick-label">{pick.label}</span>
                        <span className="sd-order-team">{pick.team?.abbreviation || '?'}</span>
                        <span className="sd-order-player">
                          {pick.isCompleted ? (pick.player?.Name || 'Picked') : '—'}
                        </span>
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
          {/* On the Clock Banner with Countdown */}
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
                onClick={() => selectedPlayer ? handleDraftPlayer(selectedPlayer?.player?._id) : null}
                loading={draftLoading}
                disabled={!selectedPlayer || !isMyPick || !draftOrder?.isLive}
                className="rd-draft-btn"
              >
                <ThunderboltOutlined />
                {selectedPlayer
                  ? `DRAFT ${selectedPlayer?.player?.Name || 'PLAYER'}`
                  : 'SELECT A PLAYER TO DRAFT'}
              </Button>
            </div>
          )}

          {/* Position Filter Pills + AUTODRAFT + Search */}
          <div className='pro_table_header'>
            <div className='pro_button_box'>
              {POSITIONS.map((pos, i) => (
                <Button
                  key={i}
                  type='primary'
                  className={`${poolPosition === pos ? 'active' : ''}`}
                  onClick={() => handlePositionChange(pos)}
                >
                  {pos}
                </Button>
              ))}
            </div>

            <div className='pro_search_input_box'>
              <Button
                loading={draftLoading}
                disabled={
                  draftOrder?.isCompleted || !(isMyPick && draftOrder?.isLive)
                }
                type='primary'
                onClick={handleAutoDraft}
              >
                AUTODRAFT
              </Button>
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={handleKeyDown}
                allowClear
                placeholder='Search Player'
                suffix={<CiSearch color='var(--primary)' />}
              />
            </div>
          </div>

          {/* Tabs: Pool / Queue / Team Rosters / Black List */}
          <div className='table_container'>
            <Tabs
              defaultActiveKey='1'
              activeKey={activeTab}
              items={tabItems}
              className='tabs'
              onChange={(v) => {
                setActiveTab(v)
                if (v === '2') getDraftQueue()
              }}
            />
          </div>

        </div>

        {/* ─── Right: Selected Player Detail ─── */}
        <div className="sd-right">
          {selectedPlayer ? (
            <SelectedPlayerCard
              player={selectedPlayer?.player}
              source={selectedPlayer?.source}
              formerTeam={selectedPlayer?.formerFantasyTeam}
              isInQueue={isInQueue(selectedPlayer?.player?._id)}
              onAddToQueue={() => handleAddQueue(selectedPlayer?.player?._id)}
              onRemoveFromQueue={() => handleRemoveQueue(selectedPlayer?.player?._id)}
            />
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

          {/* Pool Breakdown */}
          <div className="sd-card sd-pool-stats">
            <div className="sd-card-header">
              <h3>Pool Info</h3>
            </div>
            <div className="sd-card-body">
              <div className="sd-stat-row">
                <span className="sd-stat-label">Total Available</span>
                <span className="sd-stat-val">{pool.total || 0}</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Week</span>
                <span className="sd-stat-val">{postseasonState?.currentWeek || '—'}</span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Status</span>
                <span className="sd-stat-val">
                  {draftOrder?.isCompleted
                    ? 'Complete'
                    : draftOrder?.isLive
                    ? 'LIVE'
                    : 'Paused'}
                </span>
              </div>
              <div className="sd-stat-row">
                <span className="sd-stat-label">Roster Cap</span>
                <span className="sd-stat-val">53 players</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ DRAFT PICK ANNOUNCEMENT POPUP ═══ */}
      {pickAnnouncement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, pointerEvents: 'none',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10,15,26,0.97), rgba(20,28,45,0.97))',
            backdropFilter: 'blur(24px)', border: '2px solid rgba(34,197,94,0.5)',
            borderRadius: '24px', padding: '40px 48px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.15)',
            animation: 'fadeInScale 0.4s ease-out', maxWidth: '420px', width: '90%', pointerEvents: 'auto',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
              background: pickAnnouncement.playerImage ? `url(${pickAnnouncement.playerImage}) center/cover` : 'linear-gradient(135deg, #22C55E, #22C55E88)',
              border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif",
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
            }}>
              {!pickAnnouncement.playerImage && (pickAnnouncement.position || '?')}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px' }}>
              Player Drafted
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.2, marginBottom: '4px' }}>
              {pickAnnouncement.playerName}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontFamily: "'Rajdhani', sans-serif" }}>
                {pickAnnouncement.position}
              </span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif", marginBottom: '4px' }}>goes to</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif", marginBottom: '16px' }}>
              {pickAnnouncement.teamName}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
              Round {pickAnnouncement.round} &bull; Pick #{pickAnnouncement.pick}
            </div>
            <div style={{ marginTop: '20px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #22C55E, #10B981)', borderRadius: '2px', animation: 'shrinkBar 5s linear forwards' }} />
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes shrinkBar { 0% { width: 100%; } 100% { width: 0%; } }
      `}</style>
    </div>
  )
}

// ── Selected Player Card ────────────────────────────────────
const SelectedPlayerCard = ({ player, source, formerTeam, isInQueue, onAddToQueue, onRemoveFromQueue }) => {
  if (!player) return null
  return (
    <div className="sd-card sd-detail-card">
      <div className="sd-card-header">
        <h3>Player Detail</h3>
      </div>
      <div className="sd-card-body">
        <div className="sd-detail-img-wrap">
          <div
            className="sd-detail-img"
            style={{ backgroundImage: `url(${player.HostedHeadshotNoBackgroundUrl || ''})` }}
          />
        </div>
        <h2 className="sd-detail-name">{player.Name}</h2>
        <div className="sd-detail-meta">
          <Tag color="purple">{player.Position}</Tag>
          <Tag>{player.Team || 'FA'}</Tag>
          {source && (
            <Tag
              color={
                source === 'sanitized'
                  ? 'orange'
                  : source === 'eliminated_fantasy_team'
                  ? 'red'
                  : 'default'
              }
            >
              {source === 'non_playoff_team'
                ? 'Non-Playoff'
                : source === 'sanitized'
                ? 'Sanitized'
                : 'Liquidated'}
            </Tag>
          )}
        </div>
        {formerTeam && <p className="sd-detail-from">Former team: {formerTeam.name}</p>}
        <div className="sd-detail-stats">
          <div className="sd-dstat">
            <span className="sd-dstat-val">{player.pf?.toFixed(1) || '0.0'}</span>
            <span className="sd-dstat-label">Total PTS</span>
          </div>
          <div className="sd-dstat">
            <span className="sd-dstat-val">{player.avgPf?.toFixed(1) || '0.0'}</span>
            <span className="sd-dstat-label">AVG/Wk</span>
          </div>
          <div className="sd-dstat">
            <span className="sd-dstat-val">
              ${(player.currentYearSalaryCap || 0).toLocaleString()}
            </span>
            <span className="sd-dstat-label">Value</span>
          </div>
        </div>
        {player.InjuryStatus && (
          <Tag color="red" className="sd-injury-tag">
            {player.InjuryStatus}
          </Tag>
        )}
        <Button
          block
          className={`sd-queue-action-btn ${isInQueue ? 'sd-queue-remove-btn' : 'sd-queue-add-btn'}`}
          icon={isInQueue ? <DeleteOutlined /> : <BiSolidPlusCircle />}
          onClick={isInQueue ? onRemoveFromQueue : onAddToQueue}
        >
          {isInQueue ? 'Remove from Queue' : 'Add to Pre-Pick Queue'}
        </Button>
      </div>
    </div>
  )
}

export default SupplementalDraft
