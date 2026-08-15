import React, { useEffect, useRef, useState } from 'react'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Switch, notification, Modal, Input } from 'antd'
import { privateAPI, attachToken } from '../../config/constants'
import {
  ThunderboltOutlined, ClockCircleOutlined, TrophyOutlined,
  PlusOutlined, StopOutlined, SwapOutlined,
} from '@ant-design/icons'

import Header from '../../components/Header'
import Loader from '../../components/Loader'
import TableComponent from './TableComponent'
import DraftChatWidget from '../../components/DraftChatWidget'
import OnboardingGuide from '../../components/OnboardingGuide'
import EnablePushPrompt from '../../components/EnablePushPrompt'
import NFLPlayerPopup from '../../components/NFLPlayerPopup/NFLPlayerPopup'

import {
  getDraftRound, toggleAutoDraft, getSmartAutoDraftPick, addPlayerToDraft,
  createDraftQueue, deleteDraftQueue, createBlackListQueue, deleteBlacklistQueue,
  toggleDraftPause,
} from '../../redux/actions/draftAction'
import { getDraftTeamRoster } from '../../redux/actions/rosterAction'
import { getLeagueDetails } from '../../redux'
import './draftLive.css'

const POS_COLOR = {
  QB: '#ef4444', RB: '#3b82f6', WR: '#22c55e', TE: '#f59e0b',
  FLEX: '#22c55e', DST: '#8b5cf6', DEF: '#8b5cf6', K: '#78716c',
}

// ── Countdown (mm:ss until deadline) ──
const useCountdown = (deadline) => {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!deadline) { setSeconds(0); return }
    const calc = () => setSeconds(Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)))
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [deadline])
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return { seconds, display: `${mins}:${String(secs).padStart(2, '0')}`, isUrgent: seconds <= 10 && seconds > 0 }
}

const lastName = (nm) => (nm || '').trim().split(/\s+/).slice(-1)[0] || ''

const Draft = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { socket } = useSelector((state) => state.socket)
  const { currentLeague } = useSelector((state) => state.league)
  const {
    roundLoading, completed, onTheClock, draftRounds, draftCounter,
    selectedPlayer, draftQueues, blacklistQueues,
  } = useSelector((state) => state.draft)
  const user = useSelector((state) => state.user)
  const roster = useSelector((state) => state.roster?.roasterdraftdata)
  const SETTING = useSelector((state) => state?.user?.setting)
  const [loading, setLoading] = useState(true)
  const [autoDraftOn, setAutoDraftOn] = useState(false)
  const [pickAnnouncement, setPickAnnouncement] = useState(null)
  const [drafting, setDrafting] = useState(false)   // in-flight guard for the pick
  const [pauseBusy, setPauseBusy] = useState(false)
  const [commishPickBusy, setCommishPickBusy] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetText, setResetText] = useState('')
  const [resetBusy, setResetBusy] = useState(false)

  const isLive = !!currentLeague?.isDraftLive
  const isPaused = !!currentLeague?.draftPaused
  const isMyPick = onTheClock?.team?._id === user?.userDetails?.team?._id
  const myTeamId = user?.userDetails?.team?._id
  const isCommissioner =
    String(currentLeague?.createdBy) === String(user?.userDetails?._id) ||
    String(currentLeague?.coComissioner) === String(user?.userDetails?._id)

  // Smart autodraft when it's my turn and autodraft is ON
  useEffect(() => {
    if (autoDraftOn && isMyPick && !loading) {
      notification.info({ key: 'autodraft-countdown', message: '🤖 Autodraft Active', description: 'Analyzing squad needs... picking in 3 seconds', duration: 3 })
      const autoPickTimer = setTimeout(async () => {
        try {
          const result = await getSmartAutoDraftPick()
          if (result?.player?._id) {
            const draftState = require('../../redux/store').default.getState().draft
            await addPlayerToDraft({
              playerId: result.player._id,
              position: draftState?.draftCounter?.position,
              round: draftState?.draftCounter?.round,
              remainingTime: 0,
              teamId: user?.userDetails?.team?._id,
              teamName: user?.userDetails?.team?.name,
            })
            notification.destroy('autodraft-countdown')
            notification.success({ message: `🤖 Auto-drafted: ${result.player.Name}`, duration: 5 })
            getData()
          }
        } catch (err) {
          console.error('Autodraft pick failed:', err)
          notification.destroy('autodraft-countdown')
        }
      }, 3000)
      return () => { clearTimeout(autoPickTimer); notification.destroy('autodraft-countdown') }
    }
  }, [autoDraftOn, isMyPick, loading])

  useEffect(() => { getData() }, [])

  const getData = async () => {
    !loading && setLoading(true)
    await getLeagueDetails()
    await getDraftRound(true)
    try { await getDraftTeamRoster(SETTING?.week) } catch (e) { /* roster rail optional */ }
    setLoading(false)
  }

  useEffect(() => {
    if (socket) {
      socket.on('draftLive', getData)
      socket.on('draftPick', (data) => {
        if (data) {
          setPickAnnouncement({
            playerName: data.playerName || data.player?.Name || 'Player',
            playerImage: data.playerImage || data.player?.HostedHeadshotNoBackgroundUrl || null,
            teamName: data.teamName || 'Team',
            position: data.position || data.player?.Position || '',
            round: data.round || 1,
            pick: data.pick || 1,
          })
          setTimeout(() => setPickAnnouncement(null), 5000)
        }
        getData()
      })
      socket.on('draft_pause_status', (data) => {
        getLeagueDetails()
        if (data?.autoResumed) notification.warning({ message: 'Draft Auto-Resumed', description: '5-minute pause timeout has expired. The draft has resumed.', duration: 5 })
        else if (data?.paused) notification.info({ message: 'Draft Paused', description: 'A team has called a timeout. Waiting for commissioner to resume.', duration: 5 })
        else notification.success({ message: 'Draft Resumed', description: 'The commissioner has resumed the draft.', duration: 3 })
      })
      return () => { socket.off('draftLive', getData); socket.off('draftPick'); socket.off('draft_pause_status') }
    }
  }, [socket])

  // ── Derived draft-order data ──
  const orderedRounds = [...(draftRounds || [])].sort((a, b) => (a.round - b.round) || (a.position - b.position))
  const onClockIdx = onTheClock ? orderedRounds.findIndex((v) => v._id === onTheClock._id) : -1
  const currentPickNo = onClockIdx >= 0 ? onClockIdx + 1 : (draftCounter?.position || null)
  const currentRound = onTheClock?.round || draftCounter?.round || null

  // Up-next: the on-the-clock slot + the following unpicked slots
  const upNext = (onClockIdx >= 0 ? orderedRounds.slice(onClockIdx) : orderedRounds.filter((v) => !v.playerPick)).slice(0, 10)
  // Recent picks: most recently filled slots
  const recentPicks = orderedRounds.filter((v) => v.playerPick).slice(-5).reverse()

  const deadline = isLive && onTheClock && draftCounter?.time ? draftCounter.time : null
  const countdown = useCountdown(deadline)

  const rosterList = Array.isArray(roster) ? roster : []
  // Real roster size: full (SAM Metric) = 53, offense-only = 20. Prefer the value
  // the backend derived from the league's roster preset; fall back to leagueMode.
  const ROSTER_SIZE_BY_FORMAT = { sam_default: 53, offense_standard: 20, offense_superflex: 20 }
  const rosterSize =
    currentLeague?.activeRosterSize ||
    (currentLeague?.rosterSlots && currentLeague.rosterSlots.activeRoster) ||
    ROSTER_SIZE_BY_FORMAT[currentLeague?.rosterFormat] ||
    (currentLeague?.leagueMode === 'offense_only' ? 20 : 53)

  // Tolerate every setSelectedPlayer caller shape: {player:{...}} (pool/queue),
  // a bare player object (blacklist), or a roster item — always resolve to the
  // player with an _id, else null.
  const sp = selectedPlayer?.player?._id ? selectedPlayer.player : (selectedPlayer?._id ? selectedPlayer : null)
  const isQueued = !!draftQueues?.find((v) => v?.player?._id === sp?._id)
  const isBlacklisted = !!blacklistQueues?.find((v) => v?.player?._id === sp?._id)
  const canDraft = !!sp?._id && isMyPick && isLive && !isPaused && !completed && !drafting

  const doDraft = async () => {
    if (!canDraft) return
    setDrafting(true)
    try {
      await addPlayerToDraft({
        playerId: sp._id,
        position: draftCounter?.position,
        round: draftCounter?.round,
        remainingTime: countdown.seconds,
        teamId: myTeamId,
        teamName: user?.userDetails?.team?.name,
      })
    } finally {
      setDrafting(false)
    }
  }

  // Commissioner / drafter pause controls (restored from the old ClockComponent).
  const doTogglePause = async () => {
    setPauseBusy(true)
    try { await toggleDraftPause(!isPaused) } finally { setPauseBusy(false) }
  }
  // Commissioner: make the pick for whoever is on the clock.
  const doCommishAutoPick = async () => {
    if (!onTheClock?.team?._id || !draftCounter) return
    setCommishPickBusy(true)
    try {
      const result = await getSmartAutoDraftPick(onTheClock.team._id)
      if (result?.player?._id) {
        await addPlayerToDraft({
          playerId: result.player._id,
          position: draftCounter?.position,
          round: draftCounter?.round,
          remainingTime: 0,
          teamId: onTheClock.team._id,
          teamName: onTheClock.team.name,
        })
      } else {
        notification.error({ message: 'No available player found for auto-pick', duration: 3 })
      }
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Auto-pick failed', duration: 3 })
    } finally {
      setCommishPickBusy(false)
    }
  }

  // Commissioner: full reset — wipes all picks and restarts at Round 1, Pick 1.
  const doResetDraft = async () => {
    setResetBusy(true)
    try {
      attachToken()
      const { data } = await privateAPI.post('/draft/reset', { leagueId: currentLeague?._id })
      notification.success({ message: 'Draft reset', description: data?.data?.message || 'Restarted at Round 1, Pick 1.', duration: 5 })
      setResetOpen(false)
      setResetText('')
      getData()
    } catch (err) {
      notification.error({ message: 'Reset failed', description: err?.response?.data?.message || 'Could not reset the draft.', duration: 5 })
    } finally {
      setResetBusy(false)
    }
  }
  const doQueue = async () => {
    if (!sp?._id) return
    const ex = draftQueues?.find((v) => v?.player?._id === sp._id)
    if (ex) await deleteDraftQueue(ex._id)
    else await createDraftQueue({ team: myTeamId, player: sp._id })
  }
  const doBlacklist = async () => {
    if (!sp?._id) return
    const ex = blacklistQueues?.find((v) => v?.player?._id === sp._id)
    if (ex) await deleteBlacklistQueue(ex._id)
    else await createBlackListQueue({ team: myTeamId, player: sp._id, season: SETTING?.season })
  }

  if (loading || roundLoading) {
    return (<div className="pro_league_container"><Header /><div className="main_draft_container"><Loader /></div></div>)
  }

  if (currentLeague?.draftCompleted) {
    return (<div className="pro_league_container"><Header /><LeagueEnd /></div>)
  }

  return (
    <div className="pro_league_container dl-root">
      <Header />
      <OnboardingGuide tabKey="draft" />
      <div style={{ margin: '0 16px' }}><EnablePushPrompt context="draft" /></div>

      <div className="dl-shell">
        {/* ── Draft top bar ── */}
        <div className="dl-topbar">
          <div className="dl-title">
            DRAFT LIVE
            {currentRound && <span className="dl-sub">Round {currentRound}, Pick {currentPickNo}</span>}
            {isLive && onTheClock && (
              <span className={`dl-onclock ${isMyPick ? 'me' : ''}`}>
                ● {isMyPick ? "You're on the clock" : `${onTheClock?.team?.name || ''} on the clock`}
              </span>
            )}
          </div>
          <button className="dl-trade-btn" onClick={() => navigate('/team-trade')}>
            <SwapOutlined /> TRADE
          </button>
        </div>

        {/* ── Up Next strip ── */}
        <div className="dl-upnext">
          <span className="dl-upnext-label">Up Next</span>
          <div className="dl-upnext-list">
            {upNext.map((v, i) => {
              const idx = orderedRounds.findIndex((r) => r._id === v._id)
              const isNow = v._id === onTheClock?._id
              return (
                <div key={v._id} className={`dl-pill ${isNow ? 'now' : ''}`}>
                  {v.team?.logo
                    ? <div className="dl-pill-logo" style={{ backgroundImage: `url(${v.team.logo})` }} />
                    : <div className="dl-pill-logo dl-pill-logo--ph">{(v.team?.abbreviation || v.team?.name || '?').slice(0, 2).toUpperCase()}</div>}
                  <div className="dl-pill-info">
                    <span className="dl-pill-num">#{idx + 1}</span>
                    <span className="dl-pill-team">{v.team?.abbreviation || v.team?.name || 'TBD'}</span>
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
            <TableComponent professionalDraft tableScroll={{ x: 900, y: 520 }} autoDraftOn={autoDraftOn} />
          </div>

          {/* Inline player card */}
          <div className="dl-col dl-col-card">
            {sp ? (
              <NFLPlayerPopup inline isOpen playerId={sp._id} player={sp} onClose={() => {}} />
            ) : (
              <div className="dl-card-empty">
                <GiAmericanFootballPlayer size={48} color="rgba(255,255,255,0.15)" />
                <p>Select a player from the pool to view their card</p>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="dl-col dl-col-rail">
            {/* Draft Control — pause/resume (any drafter) + commissioner auto-pick */}
            {!completed && (
              <div className="dl-rail-card">
                <div className="dl-rail-head">{isCommissioner ? 'Commissioner' : 'Draft Control'}</div>
                {isPaused ? (
                  isCommissioner ? (
                    <button className="dl-ctrl-btn resume" disabled={pauseBusy} onClick={doTogglePause}>
                      {pauseBusy ? 'Resuming…' : '▶ Resume Draft'}
                    </button>
                  ) : (
                    <div className="dl-empty-line">Draft paused — waiting for the commissioner to resume.</div>
                  )
                ) : isLive ? (
                  <button className="dl-ctrl-btn pause" disabled={pauseBusy} onClick={doTogglePause}>
                    {pauseBusy ? 'Please wait…' : (isCommissioner ? '⏸ Pause Draft' : '⏸ Call Timeout')}
                  </button>
                ) : (
                  <div className="dl-empty-line">Pause is available once the draft is live.</div>
                )}
                {isCommissioner && isLive && onTheClock && !isPaused && (
                  <button className="dl-ctrl-btn autopick" disabled={commishPickBusy} onClick={doCommishAutoPick}>
                    {commishPickBusy ? 'Picking…' : `⚡ Auto-Pick for ${onTheClock?.team?.abbreviation || onTheClock?.team?.name || 'team'}`}
                  </button>
                )}
                {isCommissioner && (
                  <button className="dl-ctrl-btn reset" onClick={() => setResetOpen(true)}>
                    ↺ Reset Draft
                  </button>
                )}
              </div>
            )}

            {/* Your Pick */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">Your Pick</div>
              <div className="dl-yourpick">
                <div className="dl-yourpick-slot">Round {currentRound || '—'}, Pick {currentPickNo || '—'}</div>
                <div className={`dl-clock ${countdown.isUrgent ? 'urgent' : ''}`}>
                  <ClockCircleOutlined /> {isLive && onTheClock ? countdown.display : '--:--'}
                </div>
              </div>
              <div className="dl-autopick">
                <span>Auto Pick</span>
                <Switch size="small" checked={autoDraftOn} checkedChildren="ON" unCheckedChildren="OFF"
                  onChange={async (c) => { setAutoDraftOn(c); await toggleAutoDraft(c) }} />
              </div>
            </div>

            {/* Your Roster */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">
                Your Roster
                <span className="dl-rail-count">{rosterList.length}{rosterSize ? ` / ${rosterSize}` : ''}</span>
              </div>
              <div className="dl-roster">
                {rosterList.length === 0 && <div className="dl-empty-line">No players drafted yet</div>}
                {rosterList.map((r, i) => (
                  <div key={i} className="dl-roster-row">
                    <span className="dl-pos" style={{ background: `${POS_COLOR[r.Position || r._id?.Position] || '#64748b'}22`, color: POS_COLOR[r.Position || r._id?.Position] || '#94a3b8' }}>{r.Position || r._id?.Position || '—'}</span>
                    <span className="dl-roster-name">{r.Name || r._id?.Name}</span>
                    <span className="dl-roster-team">{r.Team || r._id?.Team}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div className="dl-rail-card">
              <div className="dl-rail-head">Queue <span className="dl-rail-count">{draftQueues?.length || 0}</span></div>
              <div className="dl-roster">
                {(!draftQueues || draftQueues.length === 0) && <div className="dl-empty-line">Queue is empty</div>}
                {(draftQueues || []).map((q, i) => (
                  <div key={q._id || i} className="dl-roster-row">
                    <span className="dl-qnum">{i + 1}</span>
                    <span className="dl-roster-name">{q.player?.Name}</span>
                    <span className="dl-pos" style={{ background: `${POS_COLOR[q.player?.Position] || '#64748b'}22`, color: POS_COLOR[q.player?.Position] || '#94a3b8' }}>{q.player?.Position}</span>
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
                {recentPicks.map((v, i) => (
                  <div key={v._id || i} className="dl-roster-row">
                    <span className="dl-qnum">{v.round}.{v.position}</span>
                    <span className="dl-roster-name">{`${v.playerPick?.FirstName || ''} ${v.playerPick?.LastName || ''}`.trim() || v.playerPick?.Name || 'Player'}</span>
                    <span className="dl-pos" style={{ background: `${POS_COLOR[v.playerPick?.Position] || '#64748b'}22`, color: POS_COLOR[v.playerPick?.Position] || '#94a3b8' }}>{v.playerPick?.Position}</span>
                    <span className="dl-roster-team">{v.team?.abbreviation || v.team?.name}</span>
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
            <span className="dl-ab-num">#{currentPickNo || '—'}</span>
          </div>
          <button className="dl-ab-btn draft" disabled={!canDraft} onClick={doDraft}>
            <TrophyOutlined /> <div><b>{drafting ? 'DRAFTING…' : 'DRAFT PLAYER'}</b><small>{isPaused ? 'Draft paused' : sp ? `Draft ${lastName(sp.Name)}` : 'Select a player'}</small></div>
          </button>
          <button className={`dl-ab-btn queue ${isQueued ? 'active' : ''}`} disabled={!sp} onClick={doQueue}>
            <PlusOutlined /> <div><b>{isQueued ? 'IN QUEUE' : 'ADD TO QUEUE'}</b></div>
          </button>
          <button className={`dl-ab-btn block ${isBlacklisted ? 'active' : ''}`} disabled={!sp} onClick={doBlacklist}>
            <StopOutlined /> <div><b>BLACKLIST</b><small>Do not draft</small></div>
          </button>
          <div className="dl-ab-stat">
            <span className="dl-ab-label">Player ADP</span>
            <span className="dl-ab-val">{sp?.samAdp24 > 0 ? sp.samAdp24 : '—'}</span>
          </div>
          <div className="dl-ab-stat">
            <span className="dl-ab-label">Depth</span>
            <span className="dl-ab-val">{sp?.DepthPosition || (sp?.isStarter ? 'Starter' : '—')}</span>
          </div>
        </div>
      </div>

      {/* Reset Draft confirmation (commissioner) */}
      <Modal
        open={resetOpen}
        onCancel={() => { setResetOpen(false); setResetText('') }}
        title="Reset the entire draft?"
        okText={resetBusy ? 'Resetting…' : 'Reset draft'}
        okButtonProps={{ danger: true, disabled: resetText.trim().toUpperCase() !== 'RESET' || resetBusy }}
        onOk={doResetDraft}
        cancelButtonProps={{ disabled: resetBusy }}
      >
        <p style={{ marginBottom: 12 }}>
          This <b>permanently clears every pick</b>, removes all drafted players from every roster, and restarts the draft at <b>Round 1, Pick 1</b>. The draft order is kept. This cannot be undone.
        </p>
        <p style={{ marginBottom: 8, color: 'rgba(0,0,0,0.65)' }}>Type <b>RESET</b> to confirm:</p>
        <Input
          value={resetText}
          onChange={(e) => setResetText(e.target.value)}
          placeholder="RESET"
          onPressEnter={() => { if (resetText.trim().toUpperCase() === 'RESET') doResetDraft() }}
        />
      </Modal>

      {/* Draft Chat - fixed bottom left */}
      <div style={{ position: 'fixed', bottom: '16px', left: '200px', width: '320px', zIndex: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '16px', overflow: 'hidden' }}>
        <DraftChatWidget leagueName={currentLeague?.name || 'Draft Chat'} height='360px' />
      </div>

      {/* Draft Pick Announcement Popup */}
      {pickAnnouncement && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(10,15,26,0.97), rgba(20,28,45,0.97))', backdropFilter: 'blur(24px)', border: '2px solid rgba(34,197,94,0.5)', borderRadius: '24px', padding: '40px 48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.15)', animation: 'fadeInScale 0.4s ease-out', maxWidth: '420px', width: '90%', pointerEvents: 'auto' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px', background: pickAnnouncement.playerImage ? `url(${pickAnnouncement.playerImage}) center/cover` : 'linear-gradient(135deg, #22C55E, #22C55E88)', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
              {!pickAnnouncement.playerImage && <GiAmericanFootballPlayer size={40} color='rgba(255,255,255,0.7)' />}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px' }}>Player Drafted</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.2, marginBottom: '4px' }}>{pickAnnouncement.playerName}</div>
            <div style={{ marginBottom: '12px' }}><span style={{ padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontFamily: "'Rajdhani', sans-serif" }}>{pickAnnouncement.position}</span></div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif", marginBottom: '4px' }}>goes to</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#22C55E', fontFamily: "'Rajdhani', sans-serif", marginBottom: '16px' }}>{pickAnnouncement.teamName}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>Round {pickAnnouncement.round} &bull; Pick #{pickAnnouncement.pick}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}

const LeagueEnd = () => (
  <section className='coming_soon'>
    <h1>Live Draft is Completed!</h1>
    <div className='time_container'></div>
  </section>
)

export default Draft
