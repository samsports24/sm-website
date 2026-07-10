import React from 'react'
import { useSelector } from 'react-redux'

const ALL_POSITIONS = [
  { key: 'ALL', label: 'ALL', color: '#22C55E' },
  { key: 'QB', label: 'QB', color: '#ef4444', group: 'OFF' },
  { key: 'RB', label: 'RB', color: '#a5a1a1', group: 'OFF' },
  { key: 'WR', label: 'WR', color: '#3b82f6', group: 'OFF' },
  { key: 'TE', label: 'TE', color: '#22c55e', group: 'OFF' },
  { key: 'OL', label: 'OL', color: '#fbbf24', group: 'OFF' },
  { key: 'DE', label: 'EDGE', color: '#f97316', group: 'DEF' },
  { key: 'DT', label: 'IDL', color: '#fb923c', group: 'DEF' },
  { key: 'LB', label: 'LB', color: '#a5b4fc', group: 'DEF' },
  { key: 'CB', label: 'CB', color: '#22d3ee', group: 'DEF' },
  { key: 'S', label: 'S', color: '#06b6d4', group: 'DEF' },
  { key: 'K/P', label: 'K/P', color: '#d97706', group: 'ST' },
]

const OFFENSE_ONLY_KEYS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']

const PositionComponent = ({ position, setPosition, playerType, setPlayerType }) => {
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'

  const POSITIONS = isOffenseOnly
    ? [
        { key: 'ALL', label: 'ALL', color: '#22C55E' },
        { key: 'QB', label: 'QB', color: '#ef4444', group: 'OFF' },
        { key: 'RB', label: 'RB', color: '#a5a1a1', group: 'OFF' },
        { key: 'WR', label: 'WR', color: '#3b82f6', group: 'OFF' },
        { key: 'TE', label: 'TE', color: '#22c55e', group: 'OFF' },
        { key: 'K', label: 'K', color: '#d97706', group: 'ST' },
      ]
    : ALL_POSITIONS
  const isRookieActive = playerType === 'Rookie'

  return (
    <div className='sp-pos-bar'>
      {POSITIONS.map((p) => {
        const isActive = position === p.key
        return (
          <button
            key={p.key}
            className={`sp-pos-btn ${isActive ? 'sp-pos-btn-active' : ''}`}
            onClick={() => setPosition(p.key)}
            style={{
              '--pos-color': p.color,
              '--pos-color-bg': `${p.color}15`,
              '--pos-color-border': `${p.color}40`,
            }}
          >
            {p.group && !isActive && (
              <span className='sp-pos-group'>{p.group}</span>
            )}
            <span className='sp-pos-label'>{p.label}</span>
          </button>
        )
      })}

      {/* Rookie toggle */}
      {setPlayerType && (
        <button
          className={`sp-pos-btn sp-pos-btn-rookie ${isRookieActive ? 'sp-pos-btn-active' : ''}`}
          onClick={() => setPlayerType(isRookieActive ? 'All' : 'Rookie')}
          style={{
            '--pos-color': '#e879f9',
            '--pos-color-bg': '#e879f915',
            '--pos-color-border': '#e879f940',
          }}
        >
          <span className='sp-pos-label'>Rookie</span>
        </button>
      )}
    </div>
  )
}

export default PositionComponent
