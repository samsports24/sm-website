import { useState, useEffect } from 'react'
import { privateAPI, attachToken } from '../config/constants'

/**
 * Hook to fetch prediction data for a player or squad
 *
 * Usage:
 *   const { prediction, loading } = usePrediction(leagueId, matchweek)
 *   // prediction.predictions = array of player predictions
 *   // prediction.captainPick = recommended captain
 *   // prediction.bestXI = recommended starting 11
 *
 * Or for a single player:
 *   const playerPred = prediction?.predictions?.find(p => p.playerId === playerId)
 */
const usePrediction = (leagueId, matchweek) => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leagueId || !matchweek) return

    const fetchPrediction = async () => {
      setLoading(true)
      try {
        attachToken()
        const res = await privateAPI.get(`/predictions/${leagueId}/matchweek/${matchweek}`)
        setPrediction(res?.data?.data || null)
      } catch (err) {
        // Predictions not available, silent fail
        console.warn('Predictions not available:', err?.response?.status || err.message)
      }
      setLoading(false)
    }

    fetchPrediction()
  }, [leagueId, matchweek])

  /**
   * Get prediction for a specific player
   * @param {string} playerId
   * @returns {Object|null} player prediction
   */
  const getPlayerPrediction = (playerId) => {
    if (!prediction?.predictions || !playerId) return null
    return prediction.predictions.find(
      (p) => String(p.playerId) === String(playerId)
    ) || null
  }

  return { prediction, loading, getPlayerPrediction }
}

/**
 * Inline prediction badge component
 * Shows predicted points as a small colored badge
 *
 * Usage: <PredictionBadge points={7.4} confidence={0.72} recommendation="START" />
 */
export const PredictionBadge = ({ points, confidence, recommendation, size = 'normal' }) => {
  if (!points && points !== 0) return null

  const getColor = () => {
    if (recommendation === 'START') return '#22C55E'
    if (recommendation === 'BENCH') return '#F59E0B'
    if (recommendation === 'AVOID') return '#EF4444'
    if (points >= 8) return '#22C55E'
    if (points >= 5) return '#F59E0B'
    return '#EF4444'
  }

  const color = getColor()
  const isSmall = size === 'small'

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? '3px' : '6px',
      padding: isSmall ? '2px 6px' : '3px 10px',
      borderRadius: '6px',
      background: `${color}15`,
      border: `1px solid ${color}30`,
    }}>
      <span style={{
        fontSize: isSmall ? '10px' : '12px',
        fontWeight: 700,
        color,
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        {points.toFixed(1)}
      </span>
      <span style={{
        fontSize: isSmall ? '8px' : '9px',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'Rajdhani', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        pred
      </span>
      {confidence !== undefined && !isSmall && (
        <div style={{
          width: '20px', height: '3px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.round(confidence * 100)}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
          }} />
        </div>
      )}
    </div>
  )
}

/**
 * Recommendation badge
 * Shows START / BENCH / AVOID
 */
export const RecommendationBadge = ({ recommendation, size = 'normal' }) => {
  if (!recommendation) return null

  const config = {
    START: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', icon: '✓' },
    BENCH: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '~' },
    AVOID: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: '✗' },
  }

  const c = config[recommendation] || config.BENCH
  const isSmall = size === 'small'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: isSmall ? '1px 5px' : '2px 8px',
      borderRadius: '4px',
      background: c.bg,
      color: c.color,
      fontSize: isSmall ? '9px' : '10px',
      fontWeight: 700,
      fontFamily: "'Rajdhani', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {c.icon} {recommendation}
    </span>
  )
}

/**
 * Captain pick indicator
 */
export const CaptainBadge = ({ isCaptainPick }) => {
  if (!isCaptainPick) return null

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: 'rgba(212,168,67,0.15)',
      color: '#D4A843',
      fontSize: '9px',
      fontWeight: 700,
      fontFamily: "'Rajdhani', sans-serif",
      textTransform: 'uppercase',
    }}>
      ⭐ CAPTAIN PICK
    </span>
  )
}

export default usePrediction
