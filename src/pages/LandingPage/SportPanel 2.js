import React from 'react'
import MatchCard from './MatchCard'

const Spinner = () => (
  <div className="ls-spinner">
    <div className="ls-spinner-circle" />
    <p>Loading matches...</p>
  </div>
)

const EmptyState = () => (
  <div className="ls-empty-state">
    <p>No matches available at the moment</p>
  </div>
)

const LeagueBlock = ({ name, emoji, events, sport, league, onMatchClick }) => {
  // Try to extract matchday/week from the first event
  const firstComp = events[0]?.competitions?.[0]
  const matchday = firstComp?.series?.summary
    || events[0]?.week?.text
    || events[0]?.week?.number && `Matchday ${events[0].week.number}`
    || ''

  return (
  <div className="ls-league-block">
    <div className="ls-league-hd">
      <span className="ls-league-name">
        {emoji} {name}{matchday ? `, ${matchday}` : ''}
      </span>
    </div>
    <div className="ls-matches">
      {events.map((ev) => (
        <MatchCard
          key={ev.id}
          event={ev}
          onClick={() => onMatchClick(ev.id, sport, league, name)}
        />
      ))}
    </div>
  </div>
  )
}

const SportPanel = ({ activeSport, currentTab, soccerData, tennisData, leagueData, onMatchClick }) => {
  const isSoccer = activeSport === 'soccer'
  const isTennis = activeSport === 'tennis'
  const isMultiLeague = isSoccer || isTennis

  // Determine loading state
  const isLoading = isSoccer
    ? soccerData?.loading
    : isTennis
      ? tennisData?.loading
      : leagueData?.loading

  // Determine which data source to use
  let leaguesToRender = []

  if (isMultiLeague) {
    // Multi-league sports (soccer, tennis): render from multiData.leagues
    const multiData = isSoccer ? soccerData : tennisData
    if (multiData?.leagues) {
      leaguesToRender = multiData.leagues
        .filter(item => item.events?.length > 0)
        .map((item) => ({
          name: item.lg.name,
          emoji: item.lg.emoji || (isSoccer ? '⚽' : '🎾'),
          events: item.events || [],
          sport: isSoccer ? 'soccer' : 'tennis',
          league: item.lg.id,
        }))
    }
  } else if (leagueData?.events) {
    // Single-league sports: render from leagueData
    const leagueName =
      leagueData.leagueName || currentTab?.label || activeSport.charAt(0).toUpperCase() + activeSport.slice(1)
    const emoji = currentTab?.emoji || leagueData.emoji || '🏆'
    leaguesToRender = [
      {
        name: leagueName,
        emoji,
        events: leagueData.events,
        sport: currentTab?.sport || activeSport,
        league: currentTab?.league || leagueData.league || activeSport,
      },
    ]
  }

  // Filter out empty leagues and flatten all events
  const hasMatches = leaguesToRender.some((lb) => lb.events && lb.events.length > 0)

  if (isLoading) {
    return <Spinner />
  }

  if (!hasMatches) {
    return <EmptyState />
  }

  return (
    <div className="ls-sport-panel">
      {leaguesToRender.map((leagueBlock) => (
        <LeagueBlock
          key={leagueBlock.league}
          name={leagueBlock.name}
          emoji={leagueBlock.emoji}
          events={leagueBlock.events}
          sport={leagueBlock.sport}
          league={leagueBlock.league}
          onMatchClick={onMatchClick}
        />
      ))}
    </div>
  )
}

export default SportPanel
export { MatchCard, LeagueBlock }
