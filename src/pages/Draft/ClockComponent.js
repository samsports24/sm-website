import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { Tag, Button } from 'antd'
import { toggleDraftPause } from '../../redux/actions/draftAction'

// ── Countdown Hook (same as supplemental/rookie drafts) ──
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

const ClockComponent = () => {
  const { currentLeague } = useSelector((state) => state.league)
  const {
    draftRounds,
    draftCounter,
    onTheClock,
  } = useSelector((state) => state.draft)
  const user = useSelector((state) => state.user)
  const [pauseLoading, setPauseLoading] = useState(false)

  const isLive = !!currentLeague?.isDraftLive
  const isCompleted = !!currentLeague?.draftCompleted
  const isPaused = !!currentLeague?.draftPaused

  const isCommissioner =
    String(currentLeague?.createdBy) === String(user?.userDetails?._id) ||
    String(currentLeague?.coComissioner) === String(user?.userDetails?._id)

  const isMyPick =
    onTheClock &&
    String(onTheClock?.team?._id) === String(user?.team?._id)

  // Build deadline from draftCounter.time
  const deadline = isLive && onTheClock && draftCounter?.time ? draftCounter.time : null
  const countdown = useCountdown(deadline)

  const pickNumber = onTheClock
    ? draftRounds?.findIndex((v) => v?._id === onTheClock?._id) + 1
    : null

  const handleTogglePause = async () => {
    setPauseLoading(true)
    await toggleDraftPause(!isPaused)
    setPauseLoading(false)
  }

  return (
    <div className="draft-clock-wrapper">
      {/* ── Sidebar Timer Card ── */}
      <div className={`sd-timer-card ${isLive && countdown.isUrgent ? 'sd-timer-urgent' : ''} ${!isLive ? 'sd-timer-paused' : ''}`}>
        <ClockCircleOutlined className="sd-timer-icon" />
        <span className="sd-timer-display">
          {isLive && onTheClock
            ? countdown.display
            : isCompleted
            ? 'DONE'
            : isPaused
            ? 'PAUSED'
            : '--:--'}
        </span>
        <span className="sd-timer-label">
          {isLive && onTheClock
            ? isMyPick ? 'Your pick!' : onTheClock?.team?.abbreviation || onTheClock?.team?.name
            : isCompleted
            ? 'Draft Complete'
            : isPaused
            ? 'Draft Paused'
            : 'Waiting to start'}
        </span>
      </div>

      {/* ── Draft Pause / Resume Controls — always visible when draft not completed ── */}
      {!isCompleted && (
        <div className="sd-card sd-commissioner-card">
          <div className="sd-card-header">
            <h3>{isCommissioner ? 'Commissioner' : 'Draft Control'}</h3>
          </div>
          <div className="sd-card-body sd-commissioner-controls">
            {isPaused ? (
              // Draft is paused
              isCommissioner ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleTogglePause}
                  loading={pauseLoading}
                  block
                >
                  RESUME DRAFT
                </Button>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', padding: '6px' }}>
                  Draft paused, waiting for commissioner to resume
                </div>
              )
            ) : isLive ? (
              // Draft is live — any drafter can pause
              <Button
                type="primary"
                danger
                icon={<PauseCircleOutlined />}
                onClick={handleTogglePause}
                loading={pauseLoading}
                block
              >
                {isCommissioner ? 'PAUSE DRAFT' : 'CALL TIMEOUT'}
              </Button>
            ) : (
              // Draft not started yet
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', padding: '6px' }}>
                Pause will be available once the draft is live
              </div>
            )}
            {isPaused && (
              <div style={{ color: '#faad14', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
                Auto-resumes in 5 minutes
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── On the Clock Banner ── */}
      {!isCompleted && (
        <div className={`sd-clock-banner ${isMyPick && isLive ? 'sd-my-pick' : ''} ${!isLive ? 'sd-clock-paused' : ''}`}>
          <div className="rd-clock-left">
            {isLive ? <ThunderboltOutlined /> : <PauseCircleOutlined />}
            <span>
              {!isLive
                ? isPaused ? 'DRAFT PAUSED' : 'WAITING TO START'
                : isMyPick
                ? 'YOU ARE ON THE CLOCK!'
                : `On the clock: ${onTheClock?.team?.name || 'Unknown'}`}
            </span>
            {isLive && onTheClock && pickNumber && (
              <Tag className="sd-clock-pick">#{pickNumber}</Tag>
            )}
          </div>
          <div className={`rd-clock-timer ${isLive && countdown.isUrgent ? 'rd-clock-urgent' : ''} ${!isLive ? 'rd-clock-paused' : ''}`}>
            <ClockCircleOutlined />
            <span>{isLive && onTheClock ? countdown.display : '--:--'}</span>
          </div>
        </div>
      )}

      {/* ── Team Logo + Name (when live) ── */}
      {isLive && onTheClock && (
        <div className="sd-card" style={{ marginTop: '8px' }}>
          <div className="sd-card-body" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
            {onTheClock?.team?.logo && (
              <div
                style={{
                  width: 40, height: 40, borderRadius: 8,
                  backgroundImage: `url(${onTheClock.team.logo})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>On The Clock</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{onTheClock?.team?.name}</div>
            </div>
            {pickNumber && (
              <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>
                #{pickNumber}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClockComponent
