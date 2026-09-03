import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { notification } from 'antd'
import { attachToken, serverUrls } from '../../config/constants'
import store from '../../redux/store'
import { getUser, autoJoinPendingInvite } from '../../redux/actions/authActions'
import { getUserLeagues } from '../../redux/actions/leagueActions'
import CreateLeague from '../../components/modal/CreateLeague'
import CreateSoccerLeague from '../../soccer/components/CreateSoccerLeague'
import JoinLeagueModal from '../../components/modal/JoinLeagueModal'
import axios from 'axios'
import '../../styles/pages/onboardingWizard.css'

/* ── Sport Configuration ── */
const SPORTS = [
  {
    key: 'football',
    name: 'A.Football',
    emoji: '🏈',
    tagline: 'Dynasty 32, A.Football Fantasy',
    color: '#EF4444',
    enabled: true,
    frontEndUrl: null, // stays on front office
    features: ['Live Draft', '53-Man Rosters', 'Salary Cap', 'Dynasty Mode'],
  },
  {
    key: 'eleven_fc',
    name: 'Soccer',
    emoji: '⚽',
    tagline: 'Eleven F.C, Soccer Fantasy',
    color: '#D4A843',
    enabled: true,
    frontEndUrl: process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io',
    features: ['5 Leagues', 'AI Coach', 'Matchweek Scoring', 'Transfer Market'],
  },
  {
    key: 'hockey',
    name: 'Hockey',
    emoji: '🏒',
    tagline: 'NHL Fantasy',
    color: '#3B82F6',
    enabled: false,
    frontEndUrl: null,
    features: ['Coming Soon'],
  },
  {
    key: 'baseball',
    name: 'Baseball',
    emoji: '⚾',
    tagline: 'MLB Fantasy',
    color: '#F59E0B',
    enabled: false,
    frontEndUrl: null,
    features: ['Coming Soon'],
  },
  {
    key: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    tagline: 'NBA Fantasy',
    color: '#F97316',
    enabled: false,
    frontEndUrl: null,
    features: ['Coming Soon'],
  },
]

/* ── Step Indicator ── */
const StepIndicator = ({ current, total }) => (
  <div className="ob-steps">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`ob-step-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
      />
    ))}
  </div>
)

/* ── Step 1: Pick Your Sports ── */
const StepPickSports = ({ selected, onToggle, onNext }) => (
  <div className="ob-step-content">
    <h1 className="ob-title">Pick Your Sports</h1>
    <p className="ob-subtitle">Select the sports you want to play fantasy for. You can always add more later.</p>

    <div className="ob-sport-grid">
      {SPORTS.map((sport) => {
        const isSelected = selected.includes(sport.key)
        const isDisabled = !sport.enabled
        return (
          <button
            key={sport.key}
            className={`ob-sport-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && onToggle(sport.key)}
            style={{ '--sport-color': sport.color }}
            disabled={isDisabled}
          >
            <div className="ob-sport-emoji">{sport.emoji}</div>
            <div className="ob-sport-name">{sport.name}</div>
            <div className="ob-sport-tagline">{sport.tagline}</div>
            {isDisabled && <span className="ob-soon-badge">SOON</span>}
            {isSelected && <span className="ob-check">✓</span>}
            <div className="ob-sport-features">
              {sport.features.map((f, i) => (
                <span key={i} className="ob-feature-tag">{f}</span>
              ))}
            </div>
          </button>
        )
      })}
    </div>

    <button
      className="ob-btn-primary"
      onClick={onNext}
      disabled={selected.length === 0}
    >
      Continue with {selected.length} sport{selected.length !== 1 ? 's' : ''}
    </button>
  </div>
)

/* ── Step 2: Set Up Each Sport ── */
const StepSetupSport = ({ sport, userName, onCreateSuccess, onJoinLeague, onSkip }) => {
  // If the user arrived via a league invite, open the join view with the
  // invited league pre-filled so they never have to fetch a code from email
  // (fallback in case the auto-join at finish doesn't complete).
  const _pendingInvite = typeof window !== 'undefined' ? localStorage.getItem('pendingInviteLeague') : ''
  const [mode, setMode] = useState(_pendingInvite ? 'join' : null) // null | 'join'
  // The NAME of the league they were invited to, stashed by SelectGame from the
  // invite token. `_pendingInvite` itself is the league's Mongo _id — the thing
  // the join endpoint needs and the last thing a person should ever be shown.
  const _pendingInviteName = typeof window !== 'undefined' ? (localStorage.getItem('pendingInviteLeagueName') || '') : ''
  const _pendingInviteCode = typeof window !== 'undefined' ? (localStorage.getItem('pendingInviteLeagueCode') || '') : ''
  const [teamName, setTeamName] = useState('')
  const [leagueId, setLeagueId] = useState(_pendingInvite || '')
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const sportInfo = SPORTS.find(s => s.key === sport)

  // Decorative/status only — no new data fetch.
  const email = typeof window !== 'undefined' ? (localStorage.getItem('email') || '') : ''
  const initials = (userName || 'M')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'M'
  // Real chips from the SPORTS entry so this works for any sport (Soccer, etc.).
  const recChips = (sportInfo.features || []).slice(0, 3)

  const WHY = [
    { icon: '🏆', title: 'Competitive Leagues', desc: 'Join thousands of serious fantasy players' },
    { icon: '📊', title: 'Advanced Tools', desc: 'Powerful analytics and insights to dominate your league' },
    { icon: '⚡', title: 'Live Scoring', desc: 'Real-time updates and alerts keep you in the game' },
    { icon: '🔒', title: 'Secure & Fair', desc: 'Your data is protected with industry-standard security' },
  ]
  const PROGRESS = ['Setup', 'League', 'Draft', 'Members', 'Ready']

  return (
    <div className="ob-setup-page" style={{ '--sport-color': sportInfo.color }}>
      {/* ── Top status bar ── */}
      <div className="ob-topbar">
        <div className="ob-brand">
          <img src="/samsports-logo.svg" alt="" className="ob-brand-icon" />
          <span>SAMSPORTS</span>
        </div>
        <div className="ob-verify">
          <div className="ob-verify-status">
            <span className="ob-verify-check">✓</span>
            Verification Code: <span className="ob-verify-ok">Verified</span>
          </div>
          {email && <div className="ob-verify-email">{email}</div>}
        </div>
        <div className="ob-topbar-right">
          <span className="ob-league-pill">🏆 {_pendingInviteName || 'Fantasy A.Football League'}</span>
          <span className="ob-avatar">{initials}</span>
        </div>
      </div>

      {/* ── Heading ── */}
      <div className="ob-setup-heading">
        {/* An invited manager was being told to "create your league" on the very
            screen where their league was already waiting. Say what is actually
            happening, and name it. */}
        {_pendingInvite ? (
          <>
            <h1 className="ob-setup-h1">
              YOU&apos;RE JOINING <span className="ob-accent">{_pendingInviteName || 'YOUR LEAGUE'}</span>
            </h1>
            <p className="ob-setup-sub">
              Your spot is already reserved. Name your team and you&apos;re in.
            </p>
          </>
        ) : (
          <>
            <h1 className="ob-setup-h1">
              LET&apos;S GET YOUR LEAGUE <span className="ob-accent">SET UP</span>
            </h1>
            <p className="ob-setup-sub">
              Follow these steps to create your league and start your fantasy journey.
            </p>
          </>
        )}
      </div>

      {/* ── 5-step progress bar ── */}
      <div className="ob-progress">
        {PROGRESS.map((label, i) => (
          <div key={label} className={`ob-progress-step ${i === 0 ? 'active' : ''}`}>
            <span className="ob-progress-circle">{i + 1}</span>
            <span className="ob-progress-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="ob-setup-layout">
        <div className="ob-setup-main">
          {!mode && (
            <div className="ob-setup-options">
              {/* Featured RECOMMENDED card → primary action = Create a League */}
              <button
                className="ob-rec-card"
                onClick={() => setCreateModalOpen(true)}
                style={{ '--sport-color': sportInfo.color }}
              >
                <span className="ob-rec-badge">RECOMMENDED</span>
                <div className="ob-rec-body">
                  <span className="ob-rec-icon">{sportInfo.emoji}</span>
                  <div className="ob-rec-text">
                    <div className="ob-rec-title">{sportInfo.name} Setup</div>
                    <div className="ob-rec-sub">{sportInfo.tagline}</div>
                    <div className="ob-rec-chips">
                      {recChips.map((c) => (
                        <span key={c} className="ob-rec-chip">{c}</span>
                      ))}
                    </div>
                  </div>
                  <span className="ob-option-chevron">›</span>
                </div>
              </button>

              {/* Browse & Join — keeps the JoinLeagueModal wrapper */}
              <JoinLeagueModal
                sport={sport}
                frontEndUrl={sportInfo.frontEndUrl}
                button={
                  <button className="ob-option-card ob-option-card--featured">
                    <span className="ob-option-icon">🔍</span>
                    <div className="ob-option-text">
                      <div className="ob-option-title">Browse & Join a League</div>
                      <div className="ob-option-desc">Find open leagues and start playing right away</div>
                    </div>
                    <span className="ob-option-chevron">›</span>
                  </button>
                }
              />
              <button className="ob-option-card" onClick={() => setCreateModalOpen(true)}>
                <span className="ob-option-icon">🏟️</span>
                <div className="ob-option-text">
                  <div className="ob-option-title">Create a League</div>
                  <div className="ob-option-desc">Start your own league and invite friends</div>
                </div>
                <span className="ob-option-chevron">›</span>
              </button>
              <button className="ob-option-card" onClick={() => setMode('join')}>
                <span className="ob-option-icon">✉️</span>
                <div className="ob-option-text">
                  <div className="ob-option-title">Join with a league code</div>
                  <div className="ob-option-desc">Got an invite code? Enter it here</div>
                </div>
                <span className="ob-option-chevron">›</span>
              </button>
              <button className="ob-option-card ob-option-card--skip" onClick={() => onSkip(sport)}>
                <span className="ob-option-icon">⏭️</span>
                <div className="ob-option-text">
                  <div className="ob-option-title">Skip for Now</div>
                  <div className="ob-option-desc">Set up later from the homepage</div>
                </div>
                <span className="ob-option-chevron">›</span>
              </button>
            </div>
          )}

          {mode === 'join' && (
        <div className="ob-form">
          <div className="ob-form-group">
            <label>Team Name</label>
            <input
              className="ob-input"
              placeholder="e.g. Thunder Hawks"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          {_pendingInvite ? (
            /* Invited: this field was pre-filled with the league's 24-character
               Mongo _id under the label "League code" — meaningless, and not the
               code. Show the league; keep the id in state where it belongs. */
            <div className="ob-form-group">
              <label>League</label>
              <div className="ob-invite-league">
                <span className="ob-invite-league-name">{_pendingInviteName || 'Your invited league'}</span>
                {_pendingInviteCode ? (
                  <span className="ob-invite-league-code">Code {_pendingInviteCode}</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="ob-form-group">
              <label>League code</label>
              <input
                className="ob-input"
                placeholder="Enter the league invitation code"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
              />
            </div>
          )}
          <div className="ob-form-actions">
            <button className="ob-btn-secondary" onClick={() => setMode(null)}>← Back</button>
            <button
              className="ob-btn-primary"
              disabled={!teamName || !leagueId || loading}
              onClick={async () => {
                setLoading(true)
                await onJoinLeague(sport, { teamName, leagueId })
                setLoading(false)
              }}
            >
              {loading ? 'Joining...' : 'Join League'}
            </button>
          </div>
        </div>
          )}
        </div>

        {/* ── Why-Play rail ── */}
        <aside className="ob-setup-aside">
          <div className="ob-why">
            <div className="ob-why-title">WHY PLAY ON SAMSPORTS?</div>
            {WHY.map((item) => (
              <div key={item.title} className="ob-why-item">
                <span className="ob-why-icon">{item.icon}</span>
                <div>
                  <div className="ob-why-item-title">{item.title}</div>
                  <div className="ob-why-item-desc">{item.desc}</div>
                </div>
              </div>
            ))}
            <div className="ob-why-box">
              <div className="ob-why-box-title">🛡️ Your data is protected</div>
              <div className="ob-why-box-desc">
                We use industry-standard security to keep your information safe.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <div className="ob-footer">🔒 Protected by reCAPTCHA · Privacy · Terms</div>

      {/* Uses sport-specific Create League wizard */}
      {sport === 'eleven_fc' ? (
        <CreateSoccerLeague
          externalOpen={createModalOpen}
          onExternalClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false)
            if (onCreateSuccess) onCreateSuccess(sport)
          }}
        />
      ) : (
        <CreateLeague
          externalOpen={createModalOpen}
          onExternalClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false)
            if (onCreateSuccess) onCreateSuccess(sport)
          }}
        />
      )}
    </div>
  )
}

/* ── Step 3: All Done — "You're All Set!" (redesigned) ── */
const humanizeDraftOrder = (mode) => {
  switch (mode) {
    case 'inverse_standings': return 'Linear (Worst First)'
    case 'standings': return 'Linear (Best First)'
    case 'random': return 'Random'
    case 'snake': return 'Snake'
    default:
      return mode
        ? String(mode).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : '—'
  }
}

const humanizeDraftType = (type) => {
  if (!type) return 'Draft'
  const t = String(type).toLowerCase()
  if (t === 'live') return 'Live Draft'
  if (t === 'auto') return 'Auto Draft'
  return String(type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Draft'
}

const humanizeLeagueType = (league) => {
  if (league?.leagueMode === 'full') return 'Full Roster'
  if (league?.leagueMode) {
    return String(league.leagueMode).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (league?.leagueType) {
    return String(league.leagueType).replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return 'League'
}

const StepDone = ({ selectedSports, setupResults, onFinish }) => {
  const navigate = useNavigate()
  const currentLeague = useSelector(state => state?.league?.currentLeague)

  const sportKey = selectedSports && selectedSports[0]
  const sport = SPORTS.find(s => s.key === sportKey) || SPORTS[0]

  const leagueName = currentLeague?.name || 'Your League'
  const numberOfTeams = currentLeague?.numberOfTeams
  const teamsFilled = `${currentLeague?.teams?.length || 1} of ${currentLeague?.numberOfTeams || '?'}`
  const draftTimer = `${currentLeague?.draftPickTimer || 120} Seconds`
  const draftOrder = humanizeDraftOrder(currentLeague?.draftPositionMode)
  const draftType = humanizeDraftType(currentLeague?.draftType)
  const leagueTypeBadge = humanizeLeagueType(currentLeague)
  const leagueCode = currentLeague?.leagueId || '—'

  const email = typeof window !== 'undefined' ? (localStorage.getItem('email') || '') : ''
  const initials = (leagueName || 'L')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L'

  const copyCode = () => {
    if (!currentLeague?.leagueId) return
    try {
      navigator.clipboard.writeText(currentLeague.leagueId)
      notification.success({ message: 'Copied', duration: 2 })
    } catch (err) {
      notification.error({ message: 'Could not copy code', duration: 2 })
    }
  }

  const PROGRESS = ['Setup', 'League', 'Draft', 'Members', 'Ready']

  const STATS = [
    { icon: '🏆', label: 'League Type', value: leagueTypeBadge },
    { icon: '👥', label: 'Teams', value: teamsFilled },
    { icon: '🎯', label: 'Draft Type', value: draftType },
    { icon: '⏱️', label: 'Draft Timer', value: draftTimer },
    { icon: '🔀', label: 'Order', value: draftOrder },
  ]

  const NEXT = [
    {
      icon: '✉️',
      title: 'Invite Your League',
      desc: 'Invite friends and fill your league',
      sub: `${teamsFilled} teams filled`,
      onClick: () => navigate('/hub'),
    },
    {
      icon: '⚙️',
      title: 'Set League Rules',
      desc: 'Configure scoring, roster settings, and league rules',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: '📋',
      title: 'Prepare for Draft',
      desc: 'Review draft order and league settings before draft day',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: '🚀',
      title: 'Start Draft',
      desc: "When everyone's ready, start the draft and have fun!",
      onClick: () => navigate('/dashboard'),
    },
  ]

  return (
    <div className="ob-setup-page ob-done-page" style={{ '--sport-color': sport.color }}>
      {/* ── Top status bar ── */}
      <div className="ob-topbar">
        <div className="ob-brand">
          <img src="/samsports-logo.svg" alt="" className="ob-brand-icon" />
          <span>SAMSPORTS</span>
        </div>
        <div className="ob-verify">
          <div className="ob-verify-status">
            <span className="ob-verify-check">✓</span>
            Verification Code: <span className="ob-verify-ok">Verified</span>
          </div>
          {email && <div className="ob-verify-email">{email}</div>}
        </div>
        <div className="ob-topbar-right">
          <span className="ob-league-pill">🏆 {leagueName}</span>
          <span className="ob-avatar">{initials}</span>
        </div>
      </div>

      {/* ── 5-step progress bar (all complete, Ready active) ── */}
      <div className="ob-progress">
        {PROGRESS.map((label, i) => {
          const isReady = i === PROGRESS.length - 1
          return (
            <div
              key={label}
              className={`ob-progress-step done ${isReady ? 'active' : ''}`}
            >
              <span className="ob-progress-circle">{isReady ? '5' : '✓'}</span>
              <span className="ob-progress-label">{label}</span>
            </div>
          )
        })}
      </div>

      {/* ── Center hero ── */}
      <div className="ob-done-hero">
        <div className="ob-done-icon">🎉</div>
        <h1 className="ob-done-h1">
          You&apos;re <span className="ob-accent">All Set!</span>
        </h1>
        <p className="ob-setup-sub">Your front office is ready. Here&apos;s what&apos;s set up:</p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="ob-done-layout">
        <div className="ob-done-main">
          {/* League summary card */}
          <div className="ob-summary-card">
            <div className="ob-summary-head">
              <span className="ob-summary-emoji">{sport.emoji}</span>
              <div className="ob-summary-titles">
                <div className="ob-summary-name">
                  {sport.name}
                  <span className="ob-summary-badge">{leagueTypeBadge}</span>
                </div>
                <div className="ob-summary-sub">{leagueName}</div>
              </div>
              {numberOfTeams != null && (
                <span className="ob-summary-teams">{numberOfTeams} Teams</span>
              )}
            </div>

            <div className="ob-summary-divider" />

            <div className="ob-summary-stats">
              {STATS.map((s) => (
                <div key={s.label} className="ob-stat">
                  <span className="ob-stat-icon">{s.icon}</span>
                  <span className="ob-stat-label">{s.label}</span>
                  <span className="ob-stat-value">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="ob-summary-foot">
              🗓 Draft will begin when the commish starts the draft.
            </div>
          </div>

          <button className="ob-launch-btn" onClick={onFinish}>
            Launch Front Office →
          </button>
          <button className="ob-dash-link" onClick={() => navigate('/dashboard')}>
            Go to League Dashboard
          </button>
        </div>

        {/* ── Right rail ── */}
        <aside className="ob-done-aside">
          {/* What's next */}
          <div className="ob-next">
            <div className="ob-next-title">WHAT&apos;S NEXT?</div>
            {NEXT.map((row) => (
              <button key={row.title} className="ob-next-row" onClick={row.onClick}>
                <span className="ob-next-icon">{row.icon}</span>
                <div className="ob-next-text">
                  <div className="ob-next-row-title">{row.title}</div>
                  <div className="ob-next-row-desc">{row.desc}</div>
                  {row.sub && <div className="ob-next-row-sub">{row.sub}</div>}
                </div>
                <span className="ob-next-chevron">›</span>
              </button>
            ))}
          </div>

          {/* League code */}
          <div className="ob-code-card">
            <div className="ob-code-title">LEAGUE CODE</div>
            <div className="ob-code-row">
              <span className="ob-code-value">{leagueCode}</span>
              <button className="ob-code-copy" onClick={copyCode} title="Copy code">📋</button>
            </div>
            <div className="ob-code-hint">Share this code to invite others</div>
          </div>

          {/* Need help */}
          <div className="ob-help-card">
            <div className="ob-help-title">NEED HELP?</div>
            <button className="ob-help-row" onClick={() => navigate('/hub')}>
              <span className="ob-help-icon">💬</span>
              <span className="ob-help-text">Visit our Help Center</span>
              <span className="ob-next-chevron">›</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <div className="ob-footer">🔒 Protected by reCAPTCHA · Privacy · Terms</div>
    </div>
  )
}

/* ── Main Wizard ── */
const OnboardingWizard = () => {
  const navigate = useNavigate()
  const user = useSelector(state => state?.user?.userDetails)
  const userName = user?.name || localStorage.getItem('userName') || 'Manager'

  // Auto-skip onboarding if user already has a league/team
  const userTeam = user?.team
  useEffect(() => {
    if (userTeam?.currentLeague || localStorage.getItem('onboardingComplete') === 'true') {
      navigate('/homepage', { replace: true })
    }
  }, [userTeam, navigate])

  // The sport the user ALREADY chose during signup (SelectGame stored it as
  // `selectedGame`). Map it to an onboarding sport key so we don't ask again.
  const SIGNUP_TO_SPORT = { football: 'football', eleven_fc: 'eleven_fc', soccer: 'eleven_fc' }
  const rawSignupSport = typeof window !== 'undefined' ? (localStorage.getItem('selectedGame') || '') : ''
  const mappedSignupSport = SIGNUP_TO_SPORT[rawSignupSport] || rawSignupSport
  const signupSport = SPORTS.some((s) => s.key === mappedSignupSport && s.enabled) ? mappedSignupSport : ''

  const [step, setStep] = useState(0) // 0 = pick sports, 1..N = setup each, last = done
  const [selectedSports, setSelectedSports] = useState(signupSport ? [signupSport] : [])
  const [currentSportIndex, setCurrentSportIndex] = useState(0)
  const [setupResults, setSetupResults] = useState({}) // { sportKey: { action, ... } }

  // Skip the redundant "Pick Your Sports" step when the user already chose a
  // sport at signup — go straight to setting up that sport.
  const autoSkippedRef = useRef(false)
  useEffect(() => {
    if (autoSkippedRef.current) return
    if (step === 0 && signupSport) {
      autoSkippedRef.current = true
      localStorage.setItem('selectedSports', JSON.stringify([signupSport]))
      setCurrentSportIndex(0)
      setStep(1)
    }
  }, [step, signupSport])

  const totalSteps = selectedSports.length + 2 // pick + N sports + done

  const handleToggleSport = useCallback((key) => {
    setSelectedSports(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }, [])

  const handlePickDone = () => {
    if (selectedSports.length === 0) return
    // Save selected sports to localStorage for the hub
    localStorage.setItem('selectedSports', JSON.stringify(selectedSports))
    setStep(1)
    setCurrentSportIndex(0)
  }

  const handleCreateSuccess = async (sportKey) => {
    // The CreateLeague modal handles creation internally (API call + Redux refresh).
    // We just need to update the onboarding state and advance.
    try {
      await store.dispatch(getUser())
      await getUserLeagues()
    } catch (err) {
      // ignore, modal already handled the API call
    }
    setSetupResults(prev => ({
      ...prev,
      [sportKey]: { action: 'created' },
    }))
    advanceToNextSport()
  }

  const handleJoinLeague = async (sportKey, data) => {
    try {
      const server = serverUrls.find(s => s.key === sportKey)
      const email = localStorage.getItem('email')
      const token = localStorage.getItem('token')

      // An INVITED user carries the league's Mongo _id (24 hex chars) from the
      // invite token, not the SAM-XXXX join code. The code-based /league/join
      // resolves by code (findOne({leagueId})) and would return "No League Found"
      // for an _id — so invited joins must go to /league/join-from-platform,
      // which resolves by _id (findById). Manual code entry keeps using /league/join.
      const isInvite = /^[a-f0-9]{24}$/i.test(String(data.leagueId || ''))
      const joinPath = isInvite ? '/league/join-from-platform' : '/league/join'

      // Build FormData, backend uses global multer middleware
      const formData = new FormData()
      formData.append('leagueId', data.leagueId)
      formData.append('teamName', data.teamName)
      if (email) formData.append('email', email)

      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post(`${server.url}${joinPath}`, formData, { headers, withCredentials: true })

      // Reset stale league state and refresh Redux
      store.dispatch({ type: 'RESET_LEAGUE_DATA' })

      if (res.data?.data?.token) {
        // TODO: Migrate to httpOnly cookies (requires backend cookie support)
        localStorage.setItem('token', res.data.data.token)
        attachToken()
      }

      // Refresh user state so header/sidebar see the new team & league
      await store.dispatch(getUser())
      await getUserLeagues()

      // Invited managers just needed to create their account + team — drop them
      // straight into the league they were invited to (their new dashboard).
      if (isInvite) {
        localStorage.removeItem('pendingInviteLeague')
        localStorage.removeItem('pendingInviteSport')
        localStorage.removeItem('pendingInviteLeagueName')
        localStorage.removeItem('pendingInviteLeagueCode')
        notification.success({ message: 'Joined league!', duration: 2 })
        window.location.href = '/dashboard'
        return
      }

      setSetupResults(prev => ({
        ...prev,
        [sportKey]: { action: 'joined', ...data },
      }))
      advanceToNextSport()
      notification.success({ message: `Joined league!`, duration: 2 })
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Failed to join league',
        duration: 4,
      })
    }
  }

  const handleSkipSport = (sportKey) => {
    setSetupResults(prev => ({
      ...prev,
      [sportKey]: { action: 'skipped' },
    }))
    advanceToNextSport()
  }

  const advanceToNextSport = () => {
    const nextIndex = currentSportIndex + 1
    if (nextIndex >= selectedSports.length) {
      // All sports configured → done step
      setStep(selectedSports.length + 1)
    } else {
      setCurrentSportIndex(nextIndex)
      setStep(nextIndex + 1)
    }
  }

  const handleFinish = async () => {
    localStorage.setItem('onboardingComplete', 'true')
    // Ensure Redux is fully up to date before navigating
    await store.dispatch(getUser())
    await getUserLeagues()
    // If the user arrived via a league invite, drop them straight into that
    // league instead of sending them back to their email for a code.
    const joined = await autoJoinPendingInvite({ teamName: userName, email: localStorage.getItem('email') })
    if (joined) return // autoJoinPendingInvite already redirects into the league
    navigate('/hub')
  }

  const isSetupStep = step > 0 && step <= selectedSports.length
  const isDoneStep = step === selectedSports.length + 1
  // Both the setup and done steps render their own top status bar + progress,
  // so we hide the generic header/dot-indicator and go full-width for them.
  const isFullBleed = isSetupStep || isDoneStep

  return (
    <div className="ob-page">
      {!isFullBleed && (
        <div className="ob-header">
          <div className="ob-logo">
            <img src="/samsports-logo.svg" alt="" className="ob-logo-icon" />
            <span>SAMSPORTS</span>
          </div>
          <div className="ob-welcome">Welcome, {userName}</div>
        </div>
      )}

      {!isFullBleed && <StepIndicator current={step} total={totalSteps || 3} />}

      <div className={`ob-body ${isFullBleed ? 'ob-body--wide' : ''}`}>
        {step === 0 && (
          <StepPickSports
            selected={selectedSports}
            onToggle={handleToggleSport}
            onNext={handlePickDone}
          />
        )}

        {isSetupStep && (
          <StepSetupSport
            key={selectedSports[currentSportIndex]}
            sport={selectedSports[currentSportIndex]}
            userName={userName}
            onCreateSuccess={handleCreateSuccess}
            onJoinLeague={handleJoinLeague}
            onSkip={handleSkipSport}
          />
        )}

        {step === selectedSports.length + 1 && (
          <StepDone
            selectedSports={selectedSports}
            setupResults={setupResults}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  )
}

export default OnboardingWizard
