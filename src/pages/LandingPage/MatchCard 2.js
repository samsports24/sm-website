import React from 'react'
import { getStatus } from './constants'

const TeamBadge = ({ team, size = 20 }) => {
  const t = team?.team || team
  const logo = t?.logos?.[0]?.href || t?.logo || team?.logos?.[0]?.href || team?.logo || ''
  const abbr = (t?.abbreviation || t?.shortDisplayName || team?.abbreviation || '?').slice(0, 3).toUpperCase()
  const color = (t?.color || team?.color) ? '#' + (t?.color || team?.color) : '#1A2332'

  if (logo) {
    return (
      <img
        src={logo}
        className="ls-team-badge"
        style={{ width: size, height: size }}
        alt={abbr}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className="ls-team-badge-ph"
      style={{ width: size, height: size, background: color }}
    >
      {abbr.slice(0, 2)}
    </div>
  )
}

const MatchCard = ({ event, onClick }) => {
  if (!event || !event.competitions || !event.competitions[0]) {
    return null
  }

  const competition = event.competitions[0]
  const competitors = competition.competitors || []
  const homeTeam = competitors.find((c) => c.homeAway === 'home')
  const awayTeam = competitors.find((c) => c.homeAway === 'away')

  if (!homeTeam || !awayTeam) {
    return null
  }

  const status = getStatus(event)
  const homeScore = homeTeam.score || 0
  const awayScore = awayTeam.score || 0
  const isLive = status.state === 'live' || status.state === 'halftime'
  const isFinal = status.state === 'final'
  const isScheduled = status.state === 'scheduled'
  const hasScore = homeTeam.score !== undefined && awayTeam.score !== undefined

  const homeWon = hasScore && isFinal && homeScore > awayScore
  const awayWon = hasScore && isFinal && awayScore > homeScore

  // For scheduled matches, show only kick-off time (e.g., "16:00")
  let statusLabel = status.label
  if (isScheduled && event.date) {
    const d = new Date(event.date)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    statusLabel = `${h}:${m}`
  }

  // Status class
  const statusCls = isLive
    ? 'is-live'
    : status.state === 'halftime'
      ? 'is-ht'
      : isFinal
        ? 'is-ft'
        : 'is-ns'

  return (
    <div
      className={`ls-mc ${isLive ? 'ls-mc-live' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
    >
      {/* Status column */}
      <div className={`ls-mc-status ${statusCls}`}>
        {statusLabel}
      </div>

      {/* Teams column */}
      <div className="ls-mc-teams">
        {/* Home team row */}
        <div className="ls-mc-team-row">
          <TeamBadge team={homeTeam} size={18} />
          <span className={`ls-mc-team-name ${homeWon ? 'winner' : ''}`}>
            {homeTeam.team?.displayName || homeTeam.team?.shortDisplayName || 'Home'}
          </span>
        </div>
        {/* Away team row */}
        <div className="ls-mc-team-row">
          <TeamBadge team={awayTeam} size={18} />
          <span className={`ls-mc-team-name ${awayWon ? 'winner' : ''}`}>
            {awayTeam.team?.displayName || awayTeam.team?.shortDisplayName || 'Away'}
          </span>
        </div>
      </div>

      {/* Scores column */}
      <div className="ls-mc-scores">
        <span className={`ls-mc-score-val ${homeWon ? 'ahead' : ''}`}>
          {hasScore ? homeScore : '-'}
        </span>
        <span className={`ls-mc-score-val ${awayWon ? 'ahead' : ''}`}>
          {hasScore ? awayScore : '-'}
        </span>
      </div>
    </div>
  )
}

export default MatchCard
export { TeamBadge }
