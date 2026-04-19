import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import './draftCountdownBanner.css'

/**
 * DraftCountdownBanner — Always-visible countdown on the dashboard.
 *
 * Shows a sleek banner with a live countdown for:
 *  1. Startup Draft (draftStart)
 *  2. Draft Pick Auction (computedAuctionDate / spotAuctionEnd)
 *  3. Playoff Draft (playoffDraftDate)
 *
 * Automatically hides when the event passes (no dismiss needed).
 * Multiple events can stack if they exist.
 */
const DraftCountdownBanner = () => {
  const navigate = useNavigate()
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const [now, setNow] = useState(Date.now())

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Build list of upcoming events
  const events = []

  // 1. Startup Draft
  if (currentLeague?.draftStart && !currentLeague?.draftCompleted) {
    events.push({
      key: 'draft',
      label: currentLeague?.isDraftLive ? 'Draft is LIVE' : 'Startup Draft',
      date: new Date(currentLeague.draftStart).getTime(),
      isLive: !!currentLeague.isDraftLive,
      route: '/live-draft',
      icon: '🏈',
      accent: '#22C55E',
    })
  }

  // 2. Draft Pick Auction
  const auctionDate = currentLeague?.computedAuctionDate || currentLeague?.spotAuctionEnd
  if (auctionDate && !currentLeague?.draftCompleted) {
    const auctionTime = new Date(auctionDate).getTime()
    // Only show if it hasn't ended (allow 1hr grace)
    if (auctionTime > now - 3600000) {
      events.push({
        key: 'auction',
        label: auctionTime <= now ? 'Auction is LIVE' : 'Draft Pick Auction',
        date: auctionTime,
        isLive: auctionTime <= now,
        route: '/draft-spot-auction',
        icon: '🔨',
        accent: '#a855f7',
      })
    }
  }

  // 3. Playoff Draft
  if (currentLeague?.playoffDraftDate) {
    const pdTime = new Date(currentLeague.playoffDraftDate).getTime()
    if (pdTime > now - 3600000) {
      events.push({
        key: 'playoff-draft',
        label: pdTime <= now ? 'Playoff Draft is LIVE' : 'Playoff Draft',
        date: pdTime,
        isLive: pdTime <= now,
        route: '/playoff-draft',
        icon: '🏆',
        accent: '#f59e0b',
      })
    }
  }

  // 4. Supplemental Draft
  if (currentLeague?.supplementalDraftDate) {
    const sdTime = new Date(currentLeague.supplementalDraftDate).getTime()
    if (sdTime > now - 3600000) {
      events.push({
        key: 'supplemental-draft',
        label: sdTime <= now ? 'Supplemental Draft is LIVE' : 'Supplemental Draft',
        date: sdTime,
        isLive: sdTime <= now,
        route: '/supplemental-draft',
        icon: '📋',
        accent: '#3b82f6',
      })
    }
  }

  // 5. Rookie Draft
  if (currentLeague?.rookieDraftDate) {
    const rdTime = new Date(currentLeague.rookieDraftDate).getTime()
    if (rdTime > now - 3600000) {
      events.push({
        key: 'rookie-draft',
        label: rdTime <= now ? 'Rookie Draft is LIVE' : 'Rookie Draft',
        date: rdTime,
        isLive: rdTime <= now,
        route: '/rookie-draft',
        icon: '🌟',
        accent: '#06b6d4',
      })
    }
  }

  // Filter out expired events (past by more than 1 hour)
  const activeEvents = events.filter((e) => e.isLive || e.date > now)

  if (activeEvents.length === 0) return null

  const pad = (n) => String(n).padStart(2, '0')

  const getCountdown = (targetMs) => {
    const diff = targetMs - now
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }

  return (
    <div className="dcb-wrapper">
      {activeEvents.map((evt) => {
        const cd = getCountdown(evt.date)
        return (
          <div
            key={evt.key}
            className={`dcb-banner ${evt.isLive ? 'dcb-live' : ''}`}
            style={{ '--dcb-accent': evt.accent }}
            onClick={() => navigate(evt.route)}
          >
            {/* Left: Icon + Label */}
            <div className="dcb-left">
              <span className="dcb-icon">{evt.icon}</span>
              <div className="dcb-info">
                <span className="dcb-label">{evt.label}</span>
                <span className="dcb-date">
                  {new Date(evt.date).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Center: Countdown or LIVE badge */}
            {evt.isLive ? (
              <div className="dcb-live-badge">
                <span className="dcb-live-dot" />
                LIVE NOW
              </div>
            ) : cd ? (
              <div className="dcb-countdown">
                <div className="dcb-unit">
                  <span className="dcb-num">{pad(cd.days)}</span>
                  <span className="dcb-unit-label">D</span>
                </div>
                <span className="dcb-sep">:</span>
                <div className="dcb-unit">
                  <span className="dcb-num">{pad(cd.hours)}</span>
                  <span className="dcb-unit-label">H</span>
                </div>
                <span className="dcb-sep">:</span>
                <div className="dcb-unit">
                  <span className="dcb-num">{pad(cd.minutes)}</span>
                  <span className="dcb-unit-label">M</span>
                </div>
                <span className="dcb-sep">:</span>
                <div className="dcb-unit">
                  <span className="dcb-num">{pad(cd.seconds)}</span>
                  <span className="dcb-unit-label">S</span>
                </div>
              </div>
            ) : null}

            {/* Right: Action */}
            <button className="dcb-action" onClick={(e) => { e.stopPropagation(); navigate(evt.route) }}>
              {evt.isLive ? 'Enter' : 'View'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default DraftCountdownBanner
