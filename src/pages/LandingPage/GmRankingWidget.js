import React, { useState, useEffect } from 'react'
import { getGlobalGmRankings } from '../../redux'
import './gmRankingWidget.css'

/* Sport tabs matching the backend enum */
const SPORTS = [
  { key: '', label: 'All', emoji: '🌐' },
  { key: 'football', label: 'A.Football', emoji: '🏈' },
  { key: 'basketball', label: 'NBA', emoji: '🏀', comingSoon: true },
  { key: 'soccer', label: 'Soccer', emoji: '⚽' },
  { key: 'hockey', label: 'NHL', emoji: '🏒', comingSoon: true },
  { key: 'baseball', label: 'MLB', emoji: '⚾', comingSoon: true },
]

const MAX_DISPLAY = 10

const getRatingColor = (rating) => {
  if (rating >= 80) return '#22C55E'
  if (rating >= 60) return '#3B82F6'
  if (rating >= 40) return '#F59E0B'
  if (rating >= 20) return '#F97316'
  return '#EF4444'
}

const getGrade = (rating) => {
  if (rating >= 95) return 'S'
  if (rating >= 85) return 'A'
  if (rating >= 75) return 'B'
  if (rating >= 60) return 'C'
  if (rating >= 45) return 'D'
  return 'F'
}

const GmRankingWidget = () => {
  const [activeSport, setActiveSport] = useState('')
  const [rankings, setRankings] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchRankings(activeSport)
  }, [activeSport])

  const fetchRankings = async (sport) => {
    setLoading(true)
    setExpanded(false)
    const data = await getGlobalGmRankings(sport || null)
    if (data) {
      // Filter out entries with no real username (broken user refs)
      const filtered = (data.rankings || []).filter(gm =>
        gm.userName && gm.userName !== 'Unknown' && gm.userName !== 'undefined'
      )
      // Re-number ranks after filtering
      filtered.forEach((gm, i) => { gm.rank = i + 1 })
      setRankings(filtered)
      setMyRank(data.myRank || null)
    } else {
      setRankings([])
      setMyRank(null)
    }
    setLoading(false)
  }

  const displayList = expanded ? rankings.slice(0, 15) : rankings.slice(0, MAX_DISPLAY)
  const currentSport = SPORTS.find(s => s.key === activeSport)

  return (
    <div className="gmw-container">
      {/* Header */}
      <div className="gmw-header">
        <div className="gmw-header-left">
          <span className="gmw-header-icon">🏆</span>
          <span className="gmw-header-title">GM RANKINGS</span>
        </div>
        <span className="gmw-header-badge">GLOBAL</span>
      </div>

      {/* Sport Tabs */}
      <div className="gmw-sport-tabs">
        {SPORTS.map((sport) => (
          <button
            key={sport.key}
            className={`gmw-sport-tab ${activeSport === sport.key ? 'active' : ''} ${sport.comingSoon ? 'coming-soon' : ''}`}
            onClick={() => !sport.comingSoon && setActiveSport(sport.key)}
            title={sport.comingSoon ? `${sport.label} — Coming Soon` : sport.label}
            style={sport.comingSoon ? { opacity: 0.3, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
          >
            <span className="gmw-sport-emoji">{sport.emoji}</span>
            <span className="gmw-sport-label">{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Rankings List */}
      <div className="gmw-list">
        {loading ? (
          <div className="gmw-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="gmw-loading-bar" />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="gmw-empty">
            <p>No {currentSport?.label || 'global'} rankings yet</p>
            <span>Join a league and start playing to get ranked</span>
          </div>
        ) : (
          displayList.map((gm, idx) => {
            const bestLeague = gm.leagues?.[0] || {}
            return (
              <div
                key={gm.userId}
                className={`gmw-row ${idx < 3 ? `gmw-row-top${idx + 1}` : ''}`}
              >
                {/* Rank */}
                <span className="gmw-rank">
                  {gm.rank <= 3
                    ? ['🥇', '🥈', '🥉'][gm.rank - 1]
                    : gm.rank}
                </span>

                {/* GM Info */}
                <div className="gmw-gm">
                  {gm.avatar ? (
                    <img src={gm.avatar} className="gmw-avatar" alt="" />
                  ) : (
                    <div className="gmw-avatar-ph">
                      {(gm.userName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="gmw-gm-info">
                    <span className="gmw-gm-name">{gm.userName}</span>
                    <span className="gmw-gm-leagues">
                      {gm.leagueCount} league{gm.leagueCount !== 1 ? 's' : ''}
                      {bestLeague.teamName ? ` · ${bestLeague.teamName}` : ''}
                    </span>
                  </div>
                </div>

                {/* Grade + Rating */}
                <div className="gmw-score-area">
                  <span
                    className="gmw-grade"
                    style={{
                      color: getRatingColor(gm.overallRating),
                      borderColor: getRatingColor(gm.overallRating),
                    }}
                  >
                    {gm.grade || getGrade(gm.overallRating)}
                  </span>
                  <span
                    className="gmw-rating"
                    style={{ color: getRatingColor(gm.overallRating) }}
                  >
                    {gm.overallRating.toFixed(1)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* My Rank callout */}
      {myRank && myRank.rank > MAX_DISPLAY && !expanded && (
        <div className="gmw-my-rank">
          <span className="gmw-my-rank-label">Your Rank</span>
          <span className="gmw-my-rank-pos">#{myRank.rank}</span>
          <span
            className="gmw-my-rank-score"
            style={{ color: getRatingColor(myRank.overallRating) }}
          >
            {myRank.overallRating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Show More / Less */}
      {rankings.length > MAX_DISPLAY && (
        <button
          className="gmw-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : `Show Top 15`}
        </button>
      )}
    </div>
  )
}

export default GmRankingWidget
