import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { notification } from 'antd'
import { attachToken, serverUrls } from '../../config/constants'
import store from '../../redux/store'
import { getUser } from '../../redux/actions/authActions'
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
const StepSetupSport = ({ sport, onCreateSuccess, onJoinLeague, onSkip }) => {
  const [mode, setMode] = useState(null) // null | 'join'
  const [teamName, setTeamName] = useState('')
  const [leagueId, setLeagueId] = useState('')
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const sportInfo = SPORTS.find(s => s.key === sport)

  return (
    <div className="ob-step-content">
      <div className="ob-setup-header" style={{ '--sport-color': sportInfo.color }}>
        <span className="ob-setup-emoji">{sportInfo.emoji}</span>
        <div>
          <h2 className="ob-setup-title">{sportInfo.name} Setup</h2>
          <p className="ob-setup-tag">{sportInfo.tagline}</p>
        </div>
      </div>

      {!mode && (
        <div className="ob-setup-options">
          {/* Browse & Join — primary action for new users */}
          <JoinLeagueModal
            sport={sport}
            frontEndUrl={sportInfo.frontEndUrl}
            button={
              <button className="ob-option-card ob-option-card--featured">
                <span className="ob-option-icon">🔍</span>
                <div>
                  <div className="ob-option-title">Browse & Join a League</div>
                  <div className="ob-option-desc">Find open leagues and start playing right away</div>
                </div>
              </button>
            }
          />
          <button className="ob-option-card" onClick={() => setCreateModalOpen(true)}>
            <span className="ob-option-icon">🏟️</span>
            <div>
              <div className="ob-option-title">Create a League</div>
              <div className="ob-option-desc">Start your own league and invite friends</div>
            </div>
          </button>
          <button className="ob-option-card" onClick={() => setMode('join')}>
            <span className="ob-option-icon">🤝</span>
            <div>
              <div className="ob-option-title">Join with League ID</div>
              <div className="ob-option-desc">Got an invite code? Enter it here</div>
            </div>
          </button>
          <button className="ob-option-card ob-option-card--skip" onClick={() => onSkip(sport)}>
            <span className="ob-option-icon">⏭️</span>
            <div>
              <div className="ob-option-title">Skip for Now</div>
              <div className="ob-option-desc">Set up later from the homepage</div>
            </div>
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
          <div className="ob-form-group">
            <label>League ID</label>
            <input
              className="ob-input"
              placeholder="Enter the league invitation code"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
            />
          </div>
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

/* ── Step 3: All Done ── */
const StepDone = ({ selectedSports, setupResults, onFinish }) => (
  <div className="ob-step-content ob-done">
    <div className="ob-done-icon">🎉</div>
    <h1 className="ob-title">You&apos;re All Set!</h1>
    <p className="ob-subtitle">Your front office is ready. Here&apos;s what&apos;s set up:</p>

    <div className="ob-done-summary">
      {selectedSports.map((key) => {
        const sport = SPORTS.find(s => s.key === key)
        const result = setupResults[key]
        return (
          <div key={key} className="ob-done-row" style={{ '--sport-color': sport.color }}>
            <span className="ob-done-emoji">{sport.emoji}</span>
            <span className="ob-done-name">{sport.name}</span>
            <span className="ob-done-status">
              {result?.action === 'created' && `Created: ${result.leagueName}`}
              {result?.action === 'joined' && `Joined league`}
              {result?.action === 'skipped' && 'Browse leagues later'}
              {!result && 'Ready to go'}
            </span>
          </div>
        )
      })}
    </div>

    <button className="ob-btn-primary ob-btn-launch" onClick={onFinish}>
      Launch Front Office
    </button>
  </div>
)

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

  const [step, setStep] = useState(0) // 0 = pick sports, 1..N = setup each, last = done
  const [selectedSports, setSelectedSports] = useState([])
  const [currentSportIndex, setCurrentSportIndex] = useState(0)
  const [setupResults, setSetupResults] = useState({}) // { sportKey: { action, ... } }

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

      // Build FormData, backend uses global multer middleware
      const formData = new FormData()
      formData.append('leagueId', data.leagueId)
      formData.append('teamName', data.teamName)
      if (email) formData.append('email', email)

      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post(`${server.url}/league/join`, formData, { headers, withCredentials: true })

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
    navigate('/hub')
  }

  return (
    <div className="ob-page">
      {/* Header */}
      <div className="ob-header">
        <div className="ob-logo">
          <img src="/samsports-logo.svg" alt="" className="ob-logo-icon" />
          <span>SAMSPORTS</span>
        </div>
        <div className="ob-welcome">Welcome, {userName}</div>
      </div>

      <StepIndicator current={step} total={totalSteps || 3} />

      <div className="ob-body">
        {step === 0 && (
          <StepPickSports
            selected={selectedSports}
            onToggle={handleToggleSport}
            onNext={handlePickDone}
          />
        )}

        {step > 0 && step <= selectedSports.length && (
          <StepSetupSport
            key={selectedSports[currentSportIndex]}
            sport={selectedSports[currentSportIndex]}
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
