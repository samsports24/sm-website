import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { privateAPI, attachToken } from '../../config/constants'

const Predictions = ({ leagueId, matchweek, accent = '#D4A843' }) => {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        attachToken()
        const res = await privateAPI.get(`/predictions/${leagueId}/matchweek/${matchweek}`)
        setPredictions(res?.data?.data)
      } catch (err) {
        console.warn('Predictions not available:', err)
      }
      setLoading(false)
    }
    if (leagueId && matchweek) fetchPredictions()
  }, [leagueId, matchweek])

  // ──────────────────────────────────────────────────────────────
  // Styles
  // ──────────────────────────────────────────────────────────────

  const styles = {
    container: {
      width: '100%',
      padding: '24px',
      background: 'rgba(20,28,45,0.4)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(110,105,128,0.15)',
      borderRadius: '20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px',
    },

    title: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#fff',
      fontFamily: "'Barlow Condensed', sans-serif",
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    matchInfo: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    matchDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: 'rgba(255,255,255,0.7)',
    },

    matchDetailLabel: {
      fontSize: '11px',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Rajdhani', sans-serif",
    },

    captainBanner: {
      background: `linear-gradient(135deg, rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.2) 0%, rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.05) 100%)`,
      border: `1px solid rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.3)`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },

    captainIcon: {
      fontSize: '32px',
    },

    captainContent: {
      flex: 1,
    },

    captainName: {
      fontSize: '20px',
      fontWeight: 700,
      color: accent,
      fontFamily: "'Barlow Condensed', sans-serif",
      margin: '0 0 4px 0',
    },

    captainStats: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.6)',
      margin: 0,
    },

    sectionTitle: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#fff',
      fontFamily: "'Rajdhani', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '32px',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: `2px solid ${accent}`,
    },

    bestXIGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '12px',
      marginBottom: '28px',
    },

    playerCard: {
      background: 'rgba(30,40,60,0.5)',
      border: '1px solid rgba(110,105,128,0.2)',
      borderRadius: '12px',
      padding: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
    },

    playerCardHover: {
      background: `rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.15)`,
      border: `1px solid rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.4)`,
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 16px rgba(${parseInt(accent.slice(1,3), 16)},${parseInt(accent.slice(3,5), 16)},${parseInt(accent.slice(5,7), 16)},0.2)`,
    },

    playerImage: {
      width: '56px',
      height: '56px',
      borderRadius: '8px',
      background: 'rgba(100,100,120,0.3)',
      margin: '0 auto 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
    },

    playerName: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#fff',
      margin: '0 0 4px 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    playerPoints: {
      fontSize: '18px',
      fontWeight: 800,
      color: accent,
      fontFamily: "'Barlow Condensed', sans-serif",
      margin: 0,
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
    },

    tableHead: {
      background: 'rgba(30,40,60,0.6)',
      borderBottom: `2px solid ${accent}`,
    },

    tableHeadCell: {
      padding: '14px 12px',
      textAlign: 'left',
      fontSize: '11px',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Rajdhani', sans-serif",
      borderRight: '1px solid rgba(110,105,128,0.1)',
    },

    tableRow: {
      borderBottom: '1px solid rgba(110,105,128,0.1)',
      transition: 'background 0.2s ease',
    },

    tableRowHover: {
      background: 'rgba(110,105,128,0.08)',
    },

    tableCell: {
      padding: '14px 12px',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'left',
    },

    playerNameCell: {
      fontWeight: 600,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    captainStar: {
      fontSize: '16px',
      color: accent,
    },

    positionBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      background: 'rgba(110,105,128,0.3)',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.7)',
    },

    predictedPts: {
      fontSize: '14px',
      fontWeight: 700,
      color: accent,
      fontFamily: "'Barlow Condensed', sans-serif",
    },

    confidenceBar: {
      width: '60px',
      height: '6px',
      background: 'rgba(110,105,128,0.2)',
      borderRadius: '3px',
      overflow: 'hidden',
      display: 'inline-block',
    },

    confidenceFill: {
      height: '100%',
      background: accent,
      borderRadius: '3px',
      transition: 'width 0.3s ease',
    },

    formTrend: {
      fontSize: '16px',
      letterSpacing: '3px',
      fontWeight: 600,
    },

    formTrendHot: {
      color: '#10B981',
    },

    formTrendSteady: {
      color: '#8B8B9A',
    },

    formTrendCold: {
      color: '#EF4444',
    },

    rangeBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      background: 'rgba(110,105,128,0.2)',
      borderRadius: '4px',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Rajdhani', sans-serif",
    },

    factorPills: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
    },

    factorPill: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      fontFamily: "'Rajdhani', sans-serif",
    },

    factorPositive: {
      background: 'rgba(16,185,129,0.25)',
      color: '#10B981',
      border: '1px solid rgba(16,185,129,0.3)',
    },

    factorNegative: {
      background: 'rgba(239,68,68,0.25)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.3)',
    },

    recommendationBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Rajdhani', sans-serif",
    },

    recommendationStart: {
      background: 'rgba(16,185,129,0.2)',
      color: '#10B981',
      border: `1px solid rgba(16,185,129,0.4)`,
    },

    recommendationBench: {
      background: 'rgba(245,158,11,0.2)',
      color: '#F59E0B',
      border: `1px solid rgba(245,158,11,0.4)`,
    },

    recommendationAvoid: {
      background: 'rgba(239,68,68,0.2)',
      color: '#EF4444',
      border: `1px solid rgba(239,68,68,0.4)`,
    },

    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
    },

    noData: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'rgba(255,255,255,0.5)',
    },

    noDataIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },

    noDataText: {
      fontSize: '16px',
      margin: 0,
    },
  }

  // ──────────────────────────────────────────────────────────────
  // Render Loading
  // ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────
  // No Data
  // ──────────────────────────────────────────────────────────────

  if (!predictions || !predictions.players || predictions.players.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.noData}>
          <div style={styles.noDataIcon}>🔮</div>
          <p style={styles.noDataText}>Predictions not yet available for this matchweek</p>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────
  // Helper Functions
  // ──────────────────────────────────────────────────────────────

  const getFormTrend = (trend) => {
    if (!trend) return '→'
    if (trend > 0) return '↑'
    if (trend < 0) return '↓'
    return '→'
  }

  const getFormTrendStyle = (trend) => {
    if (trend > 0) return styles.formTrendHot
    if (trend < 0) return styles.formTrendCold
    return styles.formTrendSteady
  }

  const getRecommendationStyle = (rec) => {
    if (rec === 'START') return styles.recommendationStart
    if (rec === 'BENCH') return styles.recommendationBench
    if (rec === 'AVOID') return styles.recommendationAvoid
    return {}
  }

  const getRecommendationBadgeClass = (rec) => {
    if (rec === 'START') return styles.recommendationStart
    if (rec === 'BENCH') return styles.recommendationBench
    if (rec === 'AVOID') return styles.recommendationAvoid
    return {}
  }

  // ──────────────────────────────────────────────────────────────
  // Prepare Data
  // ──────────────────────────────────────────────────────────────

  const captainPick = predictions.captainRecommendation || predictions.players[0]
  const bestXI =
    predictions.bestXI && predictions.bestXI.length > 0
      ? predictions.bestXI
      : predictions.players.slice(0, 11).sort((a, b) => (b.predictedPoints || 0) - (a.predictedPoints || 0))

  const allPlayers = predictions.players || []

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          🔮 Matchweek {matchweek} Predictions
        </h1>
        <div style={styles.matchInfo}>
          {predictions.opponent && (
            <div style={styles.matchDetail}>
              <div style={styles.matchDetailLabel}>Opponent</div>
              <div>{predictions.opponent}</div>
            </div>
          )}
          {predictions.weather && (
            <div style={styles.matchDetail}>
              <div style={styles.matchDetailLabel}>Weather</div>
              <div>{predictions.weather}</div>
            </div>
          )}
          {predictions.kickoffTime && (
            <div style={styles.matchDetail}>
              <div style={styles.matchDetailLabel}>Kickoff</div>
              <div>{predictions.kickoffTime}</div>
            </div>
          )}
        </div>
      </div>

      {/* Captain Pick Banner */}
      {captainPick && (
        <div style={styles.captainBanner}>
          <div style={styles.captainIcon}>⭐</div>
          <div style={styles.captainContent}>
            <p style={styles.captainName}>
              {captainPick.playerName || 'Captain Pick'}
            </p>
            <p style={styles.captainStats}>
              Predicted {captainPick.predictedPoints || 0} pts
              {captainPick.confidence && ` • ${Math.round(captainPick.confidence * 100)}% Confidence`}
            </p>
          </div>
        </div>
      )}

      {/* Best XI Section */}
      <h2 style={styles.sectionTitle}>Predicted Best XI</h2>
      <div style={styles.bestXIGrid}>
        {bestXI.map((player, idx) => (
          <div
            key={idx}
            style={styles.playerCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.playerCardHover.background
              e.currentTarget.style.border = styles.playerCardHover.border
              e.currentTarget.style.transform = styles.playerCardHover.transform
              e.currentTarget.style.boxShadow = styles.playerCardHover.boxShadow
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = styles.playerCard.background
              e.currentTarget.style.border = styles.playerCard.border
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {player.playerName === captainPick?.playerName && (
              <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '16px' }}>⭐</div>
            )}
            <div style={styles.playerImage}>{player.positionEmoji || '⚽'}</div>
            <p style={styles.playerName}>{player.playerName}</p>
            <p style={styles.playerPoints}>{player.predictedPoints || 0}</p>
          </div>
        ))}
      </div>

      {/* Full Squad Predictions Table */}
      <h2 style={styles.sectionTitle}>Full Squad Predictions</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeadCell}>Player</th>
              <th style={styles.tableHeadCell}>Position</th>
              <th style={styles.tableHeadCell}>Pred Pts</th>
              <th style={styles.tableHeadCell}>Confidence</th>
              <th style={styles.tableHeadCell}>Form</th>
              <th style={styles.tableHeadCell}>Range</th>
              <th style={styles.tableHeadCell}>Factors</th>
              <th style={styles.tableHeadCell}>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {allPlayers.map((player, idx) => (
              <tr
                key={idx}
                style={styles.tableRow}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = styles.tableRowHover.background
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Player Name */}
                <td style={styles.tableCell}>
                  <div style={styles.playerNameCell}>
                    {player.playerName === captainPick?.playerName && (
                      <span style={styles.captainStar}>⭐</span>
                    )}
                    <span>{player.playerName}</span>
                  </div>
                </td>

                {/* Position */}
                <td style={styles.tableCell}>
                  <span style={styles.positionBadge}>{player.position}</span>
                </td>

                {/* Predicted Points */}
                <td style={styles.tableCell}>
                  <span style={styles.predictedPts}>{player.predictedPoints || 0}</span>
                </td>

                {/* Confidence */}
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={styles.confidenceBar}>
                      <div
                        style={{
                          ...styles.confidenceFill,
                          width: `${Math.round((player.confidence || 0) * 100)}%`,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      {Math.round((player.confidence || 0) * 100)}%
                    </span>
                  </div>
                </td>

                {/* Form Trend */}
                <td style={styles.tableCell}>
                  <span style={{ ...styles.formTrend, ...getFormTrendStyle(player.formTrend) }}>
                    {getFormTrend(player.formTrend)}
                  </span>
                </td>

                {/* Range */}
                <td style={styles.tableCell}>
                  <span style={styles.rangeBadge}>
                    {player.rangeMin || 0}-{player.rangeMax || 0}
                  </span>
                </td>

                {/* Factors */}
                <td style={styles.tableCell}>
                  <div style={styles.factorPills}>
                    {player.factors && player.factors.length > 0
                      ? player.factors.map((factor, fidx) => (
                          <span
                            key={fidx}
                            style={{
                              ...styles.factorPill,
                              ...(factor.impact > 0 ? styles.factorPositive : styles.factorNegative),
                            }}
                          >
                            {factor.impact > 0 ? '+' : ''}
                            {factor.label}
                          </span>
                        ))
                      : <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>—</span>}
                  </div>
                </td>

                {/* Recommendation */}
                <td style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.recommendationBadge,
                      ...getRecommendationBadgeClass(player.recommendation),
                    }}
                  >
                    {player.recommendation || 'HOLD'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Predictions
