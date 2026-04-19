import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getGmRatings } from '../../redux'
import { Tooltip } from 'antd'
import './gmRatingRanking.css'

const GmRatingRanking = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchRatings()
  }, [SETTING?.week])

  const fetchRatings = async () => {
    setLoading(true)
    const data = await getGmRatings(SETTING?.week)
    if (data?.ratings) {
      setRatings(data.ratings)
    }
    setLoading(false)
  }

  const getRatingColor = (rating) => {
    if (rating >= 80) return '#22C55E' // green - elite
    if (rating >= 60) return '#3B82F6' // blue - good
    if (rating >= 40) return '#F59E0B' // amber - average
    if (rating >= 20) return '#F97316' // orange - below avg
    return '#EF4444' // red - poor
  }

  const getRatingLabel = (rating) => {
    if (rating >= 90) return 'ELITE'
    if (rating >= 75) return 'GREAT'
    if (rating >= 60) return 'GOOD'
    if (rating >= 45) return 'AVG'
    if (rating >= 30) return 'BELOW'
    return 'POOR'
  }

  const displayList = expanded ? ratings : ratings.slice(0, 8)

  return (
    <div className='gmr-container'>
      {/* Header */}
      <div className='gmr-header'>
        <div className='gmr-header-left'>
          <span className='gmr-header-icon'>&#128202;</span>
          <h3>GM RATING</h3>
        </div>
        <span className='gmr-header-week'>WK {SETTING?.week || 1}</span>
      </div>

      {/* Formula Legend */}
      <div className='gmr-formula'>
        <Tooltip title='How well your starters outscore your bench, measures lineup decision quality'>
          <span className='gmr-formula-tag gmr-formula-diff'>55% Lineup IQ</span>
        </Tooltip>
        <span className='gmr-formula-plus'>+</span>
        <Tooltip title='Your average weekly team score normalized across the league'>
          <span className='gmr-formula-tag gmr-formula-score'>45% Scoring</span>
        </Tooltip>
      </div>

      {/* Rankings List */}
      <div className='gmr-list'>
        {loading ? (
          <div className='gmr-loading'>
            <div className='gmr-loading-bar' />
            <div className='gmr-loading-bar' />
            <div className='gmr-loading-bar' />
          </div>
        ) : ratings.length === 0 ? (
          <div className='gmr-empty'>
            <p>No ratings available yet</p>
            <span>Ratings calculate after Week 1</span>
          </div>
        ) : (
          displayList.map((r, idx) => (
            <div
              key={r.teamId}
              className={`gmr-row ${idx === 0 ? 'gmr-row-first' : ''} ${idx === 1 ? 'gmr-row-second' : ''} ${idx === 2 ? 'gmr-row-third' : ''}`}
            >
              {/* Rank */}
              <span className='gmr-rank'>
                {r.rank <= 3 ? (
                  <span className={`gmr-medal gmr-medal-${r.rank}`}>
                    {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  r.rank
                )}
              </span>

              {/* Team Info */}
              <div className='gmr-team'>
                {r.teamLogo ? (
                  <img src={r.teamLogo} className='gmr-logo' alt='' />
                ) : (
                  <div
                    className='gmr-logo-ph'
                    style={{ background: r.teamColor || '#1A2332' }}
                  >
                    {(r.teamName || '?').charAt(0)}
                  </div>
                )}
                <div className='gmr-team-info'>
                  <span className='gmr-team-name'>{r.teamAbbr || r.teamName}</span>
                  <span className='gmr-gm-name'>{r.gmName}</span>
                </div>
              </div>

              {/* Rating Bar */}
              <div className='gmr-rating-area'>
                <div className='gmr-bar-track'>
                  <div
                    className='gmr-bar-fill'
                    style={{
                      width: `${r.gmRating}%`,
                      background: getRatingColor(r.gmRating),
                    }}
                  />
                </div>
              </div>

              {/* Rating Score */}
              <div className='gmr-score-area'>
                <span
                  className='gmr-score'
                  style={{ color: getRatingColor(r.gmRating) }}
                >
                  {r.gmRating.toFixed(1)}
                </span>
                <span
                  className='gmr-label'
                  style={{ color: getRatingColor(r.gmRating) }}
                >
                  {getRatingLabel(r.gmRating)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More / Less */}
      {ratings.length > 8 && (
        <button className='gmr-toggle' onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Less' : `Show All ${ratings.length} Teams`}
        </button>
      )}
    </div>
  )
}

export default GmRatingRanking
