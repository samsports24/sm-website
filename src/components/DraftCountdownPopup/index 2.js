import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import './draftCountdownPopup.css'

/**
 * DraftCountdownPopup, Global popup that appears center-screen when a
 * draft date is scheduled. Shows a live countdown timer and lets the user
 * dismiss it or jump to the draft page.
 *
 * Mounted once in App.js so it works on every page.
 */
const DraftCountdownPopup = () => {
  const navigate = useNavigate()
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const isAuthenticated = !!localStorage.getItem('authToken')

  // Grab draft-related dates from league
  const draftStart = currentLeague?.draftStart
  const computedAuctionDate = currentLeague?.computedAuctionDate
  const spotAuctionEnd = currentLeague?.spotAuctionEnd

  // Pick the nearest upcoming event
  const nextDraftEvent = draftStart || computedAuctionDate || spotAuctionEnd || null
  const eventLabel = draftStart
    ? 'Startup Draft'
    : computedAuctionDate
      ? 'Draft Pick Auction'
      : spotAuctionEnd
        ? 'Spot Auction'
        : 'Draft'

  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLive, setIsLive] = useState(false)

  // Build a storage key per league so we only show once per session per league
  const leagueId = currentLeague?._id || currentLeague?.id
  const storageKey = leagueId ? `draftPopupDismissed_${leagueId}` : null

  const calcCountdown = useCallback(() => {
    if (!nextDraftEvent) return null
    const now = Date.now()
    const target = new Date(nextDraftEvent).getTime()
    const diff = target - now
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    }
  }, [nextDraftEvent])

  // Decide whether to show popup
  useEffect(() => {
    if (!isAuthenticated || !nextDraftEvent || !storageKey) {
      setVisible(false)
      return
    }
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(storageKey)) {
      setDismissed(true)
      return
    }
    const target = new Date(nextDraftEvent).getTime()
    const now = Date.now()
    const diff = target - now

    // Show if within 7 days or already live
    if (diff <= 7 * 86400000 && diff > -3600000) {
      setVisible(true)
      if (diff <= 0) setIsLive(true)
    }
  }, [isAuthenticated, nextDraftEvent, storageKey])

  // Tick every second
  useEffect(() => {
    if (!visible || dismissed) return
    const tick = () => {
      const c = calcCountdown()
      if (!c) return
      setCountdown(c)
      if (c.expired) setIsLive(true)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [visible, dismissed, calcCountdown])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    if (storageKey) sessionStorage.setItem(storageKey, '1')
  }

  const handleGoToDraft = () => {
    handleDismiss()
    navigate('/draft')
  }

  if (!visible || dismissed) return null

  const leagueName = currentLeague?.name || currentLeague?.leagueName || 'Your League'
  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="dcp-backdrop" onClick={handleDismiss}>
      <div className="dcp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="dcp-close" onClick={handleDismiss} aria-label="Close">✕</button>

        {/* Pulse ring */}
        <div className="dcp-pulse-ring">
          <div className="dcp-icon">{isLive ? '🔴' : '🏈'}</div>
        </div>

        {/* Title */}
        <h2 className="dcp-title">
          {isLive ? `${eventLabel} is LIVE!` : `${eventLabel} Starting Soon`}
        </h2>
        <p className="dcp-league">{leagueName}</p>

        {/* Countdown grid */}
        {!isLive && (
          <div className="dcp-countdown">
            <div className="dcp-unit">
              <span className="dcp-num">{pad(countdown.days)}</span>
              <span className="dcp-label">Days</span>
            </div>
            <span className="dcp-sep">:</span>
            <div className="dcp-unit">
              <span className="dcp-num">{pad(countdown.hours)}</span>
              <span className="dcp-label">Hours</span>
            </div>
            <span className="dcp-sep">:</span>
            <div className="dcp-unit">
              <span className="dcp-num">{pad(countdown.minutes)}</span>
              <span className="dcp-label">Mins</span>
            </div>
            <span className="dcp-sep">:</span>
            <div className="dcp-unit">
              <span className="dcp-num">{pad(countdown.seconds)}</span>
              <span className="dcp-label">Secs</span>
            </div>
          </div>
        )}

        {isLive && (
          <div className="dcp-live-badge">
            <span className="dcp-live-dot" />
            LIVE NOW
          </div>
        )}

        {/* Scheduled date */}
        <p className="dcp-date">
          {new Date(nextDraftEvent).toLocaleString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>

        {/* Actions */}
        <div className="dcp-actions">
          <button className="dcp-btn-primary" onClick={handleGoToDraft}>
            {isLive ? '🚀 Enter Draft Room' : '📋 View Draft'}
          </button>
          <button className="dcp-btn-secondary" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraftCountdownPopup
