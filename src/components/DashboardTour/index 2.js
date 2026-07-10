import { useState, useEffect, useCallback } from 'react'
import { Modal } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import './dashboardTour.css'

/**
 * DashboardTour — Animated multi-step guided tour for the Dashboard.
 *
 * Shows first-time users a "video-like" walkthrough of key dashboard areas:
 * news feed, standings, trades, auctions, draft, roster, chat, and more.
 * Each step auto-advances after a few seconds (user can also click through).
 *
 * Only appears once per user (localStorage flag).
 */

const STORAGE_KEY = 'onboarding_seen_dashboard'

// ── Tour Steps ────────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    icon: '🏈',
    title: 'Welcome to Your Dashboard!',
    subtitle: 'Your command center for everything in your league.',
    body: 'Let\u2019s take a quick tour of the key areas. This only takes a moment.',
    visual: 'welcome',
  },
  {
    id: 'news',
    icon: '📰',
    title: 'Live News Feed',
    subtitle: 'Real-time A.Football updates at your fingertips',
    body: 'Breaking trades, injury reports, and league headlines scroll through your ticker and news feed — so you never miss a beat.',
    visual: 'news',
    route: null,
  },
  {
    id: 'standings',
    icon: '📊',
    title: 'League Standings',
    subtitle: 'Track the playoff race',
    body: 'Your sidebar shows live standings, conference rankings, and top performers on both sides of the ball.',
    visual: 'standings',
    route: '/league',
  },
  {
    id: 'transactions',
    icon: '🔄',
    title: 'Transaction Tracker',
    subtitle: 'Every move, all in one place',
    body: 'Trades, waiver claims, roster moves, and auction wins — see everything that\u2019s happening across your league in real time.',
    visual: 'transactions',
    route: '/league',
  },
  {
    id: 'trade',
    icon: '🤝',
    title: 'Trades & Negotiations',
    subtitle: 'Wheeling and dealing starts here',
    body: 'Navigate to Team Trade to propose deals, negotiate player-for-player swaps, or include draft picks. You\u2019ll get notified when someone sends you an offer.',
    visual: 'trade',
    route: '/team-trade',
  },
  {
    id: 'auction',
    icon: '🔨',
    title: 'Player Auctions',
    subtitle: 'Bid on free agents and unclaimed talent',
    body: 'Head to Player Auctions to list free agents or bid on players other teams have put up. Watch the countdown — highest bid wins!',
    visual: 'auction',
    route: '/player-auction',
  },
  {
    id: 'roster',
    icon: '👥',
    title: 'Your Roster',
    subtitle: 'Manage your active squad',
    body: 'Check your Roster to see your full lineup, cap hits, and player stats. Set your starters each week in the Depth Chart.',
    visual: 'roster',
    route: '/player-roster',
  },
  {
    id: 'draft',
    icon: '📝',
    title: 'The Draft',
    subtitle: 'Build your dynasty',
    body: 'Live drafts, supplemental picks, and rookie drafts — all accessible from the Draft tab. Build for now or plan for the future.',
    visual: 'draft',
    route: '/draft',
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'League Chat',
    subtitle: 'Talk trash and strategize',
    body: 'Hit up League Chat to message your league mates, talk trash, negotiate trades, or coordinate on league decisions.',
    visual: 'chat',
    route: '/chat',
  },
  {
    id: 'countdown',
    icon: '⏱️',
    title: 'Draft Countdown',
    subtitle: 'Always know when the next event is',
    body: 'Your dashboard banner shows a live countdown to the next draft, auction deadline, or playoff draft — so you\u2019re always prepared.',
    visual: 'countdown',
    route: null,
  },
  {
    id: 'ready',
    icon: '🚀',
    title: 'You\u2019re All Set!',
    subtitle: 'Time to dominate your league.',
    body: 'That\u2019s the tour! Explore each section at your own pace. Good luck, GM.',
    visual: 'ready',
  },
]

// ── Visual Mockup for each step ───────────────────────────────
const StepVisual = ({ visual, animating }) => {
  const cls = `dt-visual dt-visual--${visual} ${animating ? 'dt-visual--enter' : ''}`

  const visuals = {
    welcome: (
      <div className={cls}>
        <div className="dt-mock-dashboard">
          <div className="dt-mock-header" />
          <div className="dt-mock-ticker" />
          <div className="dt-mock-grid">
            <div className="dt-mock-main">
              <div className="dt-mock-card dt-mock-card--lg" />
              <div className="dt-mock-card dt-mock-card--md" />
            </div>
            <div className="dt-mock-sidebar">
              <div className="dt-mock-card dt-mock-card--sm" />
              <div className="dt-mock-card dt-mock-card--sm" />
            </div>
          </div>
        </div>
      </div>
    ),
    news: (
      <div className={cls}>
        <div className="dt-mock-feed">
          {['Breaking: Trade alert! Star WR traded...', 'Injury Report: QB questionable for Sunday', 'Waiver Wire: Top pickups this week'].map((t, i) => (
            <div key={i} className="dt-mock-feed-item" style={{ animationDelay: `${i * 0.3}s` }}>
              <span className="dt-mock-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    standings: (
      <div className={cls}>
        <div className="dt-mock-table">
          <div className="dt-mock-table-header">
            <span>Team</span><span>W</span><span>L</span><span>PF</span>
          </div>
          {[{ t: 'Your Team', w: 8, l: 2, pf: 1240, you: true }, { t: 'Rival Squad', w: 7, l: 3, pf: 1180 }, { t: 'Dark Horse', w: 6, l: 4, pf: 1110 }].map((r, i) => (
            <div key={i} className={`dt-mock-table-row ${r.you ? 'dt-mock-table-row--you' : ''}`} style={{ animationDelay: `${i * 0.2}s` }}>
              <span>{r.t}</span><span>{r.w}</span><span>{r.l}</span><span>{r.pf}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    transactions: (
      <div className={cls}>
        <div className="dt-mock-txns">
          {[{ type: 'TRADE', desc: 'WR A. Cooper → Team Alpha', color: '#22C55E' }, { type: 'WAIVER', desc: 'RB J. Taylor claimed', color: '#60A5FA' }, { type: 'AUCTION', desc: 'K. Williams — Bid $12M', color: '#F59E0B' }].map((tx, i) => (
            <div key={i} className="dt-mock-txn" style={{ animationDelay: `${i * 0.25}s` }}>
              <span className="dt-mock-txn-badge" style={{ background: tx.color }}>{tx.type}</span>
              <span>{tx.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    trade: (
      <div className={cls}>
        <div className="dt-mock-trade">
          <div className="dt-mock-trade-side">
            <div className="dt-mock-trade-label">You Send</div>
            <div className="dt-mock-trade-player">🏃 RB - D. Henry</div>
          </div>
          <div className="dt-mock-trade-arrow">⇄</div>
          <div className="dt-mock-trade-side">
            <div className="dt-mock-trade-label">You Receive</div>
            <div className="dt-mock-trade-player">🎯 WR - J. Chase</div>
          </div>
        </div>
      </div>
    ),
    auction: (
      <div className={cls}>
        <div className="dt-mock-auction">
          <div className="dt-mock-auction-player">
            <span className="dt-mock-auction-name">TE - T. Kelce</span>
            <span className="dt-mock-auction-pos">Free Agent</span>
          </div>
          <div className="dt-mock-auction-bids">
            <div className="dt-mock-bid dt-mock-bid--winning">Your Bid: $14.5M</div>
            <div className="dt-mock-bid">Team Bravo: $12.0M</div>
            <div className="dt-mock-bid">Team Charlie: $10.5M</div>
          </div>
          <div className="dt-mock-auction-timer">⏱ 2h 14m remaining</div>
        </div>
      </div>
    ),
    roster: (
      <div className={cls}>
        <div className="dt-mock-roster">
          {[{ pos: 'QB', name: 'P. Mahomes', cap: '$8.2M' }, { pos: 'RB', name: 'S. Barkley', cap: '$5.1M' }, { pos: 'WR', name: 'J. Jefferson', cap: '$6.8M' }, { pos: 'TE', name: 'T. Hockenson', cap: '$3.2M' }].map((p, i) => (
            <div key={i} className="dt-mock-roster-row" style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="dt-mock-roster-pos">{p.pos}</span>
              <span className="dt-mock-roster-name">{p.name}</span>
              <span className="dt-mock-roster-cap">{p.cap}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    draft: (
      <div className={cls}>
        <div className="dt-mock-draft">
          <div className="dt-mock-draft-round">Round 1</div>
          {['Pick 1: QB C. Williams', 'Pick 2: RB B. Robinson', 'Pick 3: WR M. Harrison'].map((p, i) => (
            <div key={i} className="dt-mock-draft-pick" style={{ animationDelay: `${i * 0.2}s` }}>
              {p}
            </div>
          ))}
          <div className="dt-mock-draft-clock">⏱ On the Clock: YOU</div>
        </div>
      </div>
    ),
    chat: (
      <div className={cls}>
        <div className="dt-mock-chat">
          {[{ from: 'RivalGM', msg: 'You interested in trading your WR1?', align: 'left' }, { from: 'You', msg: 'What are you offering?', align: 'right' }, { from: 'RivalGM', msg: '1st round pick + RB2', align: 'left' }].map((m, i) => (
            <div key={i} className={`dt-mock-chat-msg dt-mock-chat-msg--${m.align}`} style={{ animationDelay: `${i * 0.4}s` }}>
              <span className="dt-mock-chat-from">{m.from}</span>
              <span className="dt-mock-chat-text">{m.msg}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    countdown: (
      <div className={cls}>
        <div className="dt-mock-countdown">
          <div className="dt-mock-countdown-label">A.Football Draft begins in</div>
          <div className="dt-mock-countdown-nums">
            {[{ v: '04', l: 'Days' }, { v: '12', l: 'Hrs' }, { v: '37', l: 'Min' }, { v: '09', l: 'Sec' }].map((u, i) => (
              <div key={i} className="dt-mock-countdown-unit">
                <span className="dt-mock-countdown-val">{u.v}</span>
                <span className="dt-mock-countdown-lbl">{u.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ready: (
      <div className={cls}>
        <div className="dt-mock-ready">
          <div className="dt-mock-ready-trophy">🏆</div>
          <div className="dt-mock-ready-text">Your league awaits</div>
        </div>
      </div>
    ),
  }

  return visuals[visual] || null
}

// ── Progress Bar ──────────────────────────────────────────────
const ProgressBar = ({ current, total }) => (
  <div className="dt-progress">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`dt-progress-dot ${i === current ? 'dt-progress-dot--active' : i < current ? 'dt-progress-dot--done' : ''}`}
      />
    ))}
  </div>
)

// ═══ Main Component ═══════════════════════════════════════════
const DashboardTour = () => {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const userName = useSelector((s) => s.user?.userDetails?.user?.name || s.user?.userDetails?.name || '')
  const navigate = useNavigate()

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (!visible || !autoPlay) return
    const timer = setTimeout(() => {
      if (step < STEPS.length - 1) {
        goToStep(step + 1)
      }
    }, 6000) // 6 seconds per step
    return () => clearTimeout(timer)
  }, [step, visible, autoPlay])

  const goToStep = useCallback((nextStep) => {
    setAnimating(false)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(true)
    }, 200)
  }, [])

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleNext = () => {
    setAutoPlay(false)
    if (step < STEPS.length - 1) goToStep(step + 1)
    else handleClose()
  }

  const handlePrev = () => {
    setAutoPlay(false)
    if (step > 0) goToStep(step - 1)
  }

  const handleGoTo = (route) => {
    handleClose()
    if (route) navigate(route)
  }

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const greeting = isFirst ? (userName ? `Hey ${userName}!` : 'Hey there!') : null

  return (
    <Modal
      className="dt-modal"
      open={visible}
      onCancel={handleClose}
      centered
      footer={null}
      closeIcon={false}
      closable={false}
      width={560}
    >
      <div className="dt-content">
        {/* Close button */}
        <button className="dt-close" onClick={handleClose}>✕</button>

        {/* Auto-play progress bar at top */}
        {autoPlay && (
          <div className="dt-autoplay-bar">
            <div className="dt-autoplay-fill" style={{ animationDuration: '6s' }} key={step} />
          </div>
        )}

        {/* Step Visual */}
        <div className="dt-visual-wrap">
          <StepVisual visual={current.visual} animating={animating} />
        </div>

        {/* Step Content */}
        <div className={`dt-step-content ${animating ? 'dt-step-content--enter' : ''}`}>
          {greeting && <p className="dt-greeting">{greeting}</p>}
          <div className="dt-step-header">
            <span className="dt-step-icon">{current.icon}</span>
            <h2 className="dt-step-title">{current.title}</h2>
          </div>
          <p className="dt-step-subtitle">{current.subtitle}</p>
          <p className="dt-step-body">{current.body}</p>

          {current.route && (
            <button className="dt-go-btn" onClick={() => handleGoTo(current.route)}>
              {"Go to " + current.title}
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <ProgressBar current={step} total={STEPS.length} />

        {/* Navigation */}
        <div className="dt-nav">
          <button className="dt-nav-btn dt-nav-btn--secondary" onClick={handlePrev} disabled={isFirst}>
            ← Back
          </button>
          <button className="dt-nav-skip" onClick={handleClose}>
            Skip Tour
          </button>
          <button className="dt-nav-btn dt-nav-btn--primary" onClick={handleNext}>
            {isLast ? "Let's Go!" : "Next"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DashboardTour
