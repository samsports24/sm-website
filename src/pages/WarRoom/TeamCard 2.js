import React, { useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
   FRANCHISE CARD — Empire-style card with gold accents
   Shows team name, league, record, value, revenue, form dots,
   and Manage/Sell action buttons
   ═══════════════════════════════════════════════════════════════ */

const fmtSP = (v) => {
  if (!v || isNaN(v)) return '0'
  const n = parseFloat(v)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n.toFixed(0)}`
}

const TeamCard = ({
  team = {},
  sportColors = { primary: '#D4AF37', dark: '#B8962E', rgba: '212,175,55' },
  onEnterLeague = null,
  onListForSale = null,
  onCancelSale = null,
  isListed = false,
  listingPrice = null,
  isActive = false,
}) => {
  const name = team.name || 'Unknown Team'
  const sport = (team.league?.sport || team.sport || 'nfl').toLowerCase()
  const sportEmoji = sport === 'nfl' ? '🏈' : sport === 'soccer' ? '⚽' : sport === 'nba' ? '🏀' : sport === 'mlb' ? '⚾' : '🏆'
  const leagueName = typeof team.league === 'object' ? (team.league?.name || 'League') : (team.league || 'League')
  const record = team.record || `${team.wins || 0}-${team.draws ?? team.ties ?? 0}-${team.losses || 0}`
  const position = team.position || 0
  const annualEarnings = team.annualEarnings || 0
  const marketValue = team.marketValue || 0
  const form = team.form || []

  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`franchise-card ${hovered ? 'hovered' : ''} ${isActive ? 'active' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="franchise-accent-bar" />
      <div className="franchise-body">
        {/* Header: Avatar + Name + Badge */}
        <div className="franchise-header">
          <div className="franchise-identity">
            <div className="franchise-avatar"
              style={{ background: `linear-gradient(135deg, ${sportColors.primary}44, ${sportColors.primary}11)` }}>
              <span style={{ color: sportColors.primary }}>{name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="franchise-name">{sportEmoji} {name}</div>
              <div className="franchise-league">{leagueName}</div>
            </div>
          </div>
          {position > 0 && (
            <div className="franchise-pos-badge">#{position}</div>
          )}
        </div>

        {/* Listed price badge */}
        {isListed && listingPrice && (
          <div style={{
            padding: '8px 12px', marginBottom: '12px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '8px', fontSize: '11px', color: '#D4AF37', fontWeight: 700,
            letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center',
          }}>
            Listed · Asking {fmtSP(listingPrice)} SP
          </div>
        )}

        {/* Stats Grid */}
        <div className="franchise-stats">
          <div className="franchise-stat">
            <span className="franchise-stat-label">Record</span>
            <span className="franchise-stat-value">{record}</span>
          </div>
          <div className="franchise-stat">
            <span className="franchise-stat-label">Value</span>
            <span className="franchise-stat-value gold">{fmtSP(marketValue)} SP</span>
          </div>
          <div className="franchise-stat">
            <span className="franchise-stat-label">Revenue</span>
            <span className="franchise-stat-value green">+{fmtSP(annualEarnings)} SP</span>
          </div>
          <div className="franchise-stat">
            <span className="franchise-stat-label">Form</span>
            <div className="franchise-form-dots">
              {form.length > 0 ? form.slice(-5).map((r, i) => (
                <span key={i} className={`franchise-form-dot ${r === 'W' ? 'win' : r === 'L' ? 'loss' : 'draw'}`} />
              )) : (
                <span style={{ fontSize: '10px', color: '#555' }}>—</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="franchise-actions">
          {onEnterLeague && (
            <button className="franchise-btn gold" onClick={onEnterLeague}>
              Manage Franchise
            </button>
          )}
          {isListed ? (
            <button className="franchise-btn red-outline" onClick={onCancelSale}>
              Delist
            </button>
          ) : onListForSale ? (
            <button className="franchise-btn outline" onClick={onListForSale}>
              List for Sale
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default TeamCard
