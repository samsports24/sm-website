import React from 'react'

/**
 * StadiumImage, Renders a unique SVG stadium illustration per upgrade tier.
 * Level 0: Small community field
 * Level 1: High school stadium with lights
 * Level 2: College stadium with stands
 * Level 3: Pro stadium with upper deck
 * Level 4: Modern mega-dome
 * Level 5+: Elite futuristic arena
 */
const StadiumImage = ({ level = 0, className = '', style = {} }) => {
  const lvl = typeof level === 'string' ? parseInt(level.replace(/\D/g, ''), 10) : level
  const safeLevel = isNaN(lvl) ? 0 : Math.min(lvl, 6)

  const configs = {
    0: {
      // Community field, small bleachers, open sky
      sky: ['#1a1a2e', '#16213e'],
      field: '#1b5e20',
      fieldLight: '#2e7d32',
      stands: '#4a4458',
      standsHeight: 30,
      lights: 0,
      roof: false,
      glow: '#22C55E',
      stars: 3,
      label: 'The Grasslands',
    },
    1: {
      // Gridiron Park — taller stands, 2 light towers
      sky: ['#0A1628', '#0F1F35'],
      field: '#1b5e20',
      fieldLight: '#388e3c',
      stands: '#1E3A5F',
      standsHeight: 45,
      lights: 2,
      roof: false,
      glow: '#22C55E',
      stars: 6,
      label: 'Gridiron Park',
    },
    2: {
      // Thunder Dome — bigger stands, 4 lights, scoreboard
      sky: ['#0A1628', '#0D1B2E'],
      field: '#1b5e20',
      fieldLight: '#43a047',
      stands: '#1F4068',
      standsHeight: 60,
      lights: 4,
      roof: false,
      glow: '#4ADE80',
      stars: 10,
      label: 'Thunder Dome',
    },
    3: {
      // Legends Arena — upper deck, full lights, jumbotron
      sky: ['#0A0F1A', '#0D1B2E'],
      field: '#1b5e20',
      fieldLight: '#4caf50',
      stands: '#234B72',
      standsHeight: 80,
      lights: 6,
      roof: false,
      glow: '#4ADE80',
      stars: 15,
      label: 'Legends Arena',
    },
    4: {
      // Empire Stadium — partial roof, LED ring
      sky: ['#0A0F1A', '#0D1926'],
      field: '#1b5e20',
      fieldLight: '#66bb6a',
      stands: '#27557C',
      standsHeight: 95,
      lights: 6,
      roof: true,
      glow: '#34D399',
      stars: 20,
      label: 'Empire Stadium',
    },
    5: {
      // The Colosseum — full dome, neon accents
      sky: ['#0A0F1A', '#081420'],
      field: '#1b5e20',
      fieldLight: '#81c784',
      stands: '#2C5F88',
      standsHeight: 110,
      lights: 8,
      roof: true,
      glow: '#10B981',
      stars: 25,
      label: 'The Colosseum',
    },
    6: {
      // The Pantheon — futuristic, glowing, holographic
      sky: ['#050D15', '#071220'],
      field: '#1b5e20',
      fieldLight: '#a5d6a7',
      stands: '#306A94',
      standsHeight: 120,
      lights: 10,
      roof: true,
      glow: '#6EE7B7',
      stars: 30,
      label: 'The Pantheon',
    },
  }

  const c = configs[safeLevel] || configs[0]

  return (
    <svg
      viewBox="0 0 400 220"
      className={className}
      style={{ width: '100%', height: 'auto', borderRadius: 12, ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`sky-${safeLevel}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky[0]} />
          <stop offset="100%" stopColor={c.sky[1]} />
        </linearGradient>
        <radialGradient id={`glow-${safeLevel}`} cx="50%" cy="70%" r="40%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fieldGrad-${safeLevel}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.fieldLight} />
          <stop offset="100%" stopColor={c.field} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="220" fill={`url(#sky-${safeLevel})`} />

      {/* Stars */}
      {Array.from({ length: c.stars }).map((_, i) => (
        <circle
          key={i}
          cx={15 + (i * 137.5) % 370}
          cy={8 + (i * 23.7) % 80}
          r={0.5 + (i % 3) * 0.4}
          fill="white"
          opacity={0.3 + (i % 4) * 0.15}
        />
      ))}

      {/* Stadium glow */}
      <rect width="400" height="220" fill={`url(#glow-${safeLevel})`} />

      {/* Left stand */}
      <polygon
        points={`40,${180 - c.standsHeight} 20,180 130,180 120,${180 - c.standsHeight}`}
        fill={c.stands}
        opacity="0.9"
      />
      {/* Left stand tiers */}
      {Array.from({ length: Math.ceil(c.standsHeight / 20) }).map((_, i) => (
        <line
          key={`lt-${i}`}
          x1={25 + i * 3}
          y1={180 - i * 20}
          x2={125 - i * 3}
          y2={180 - i * 20}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Right stand */}
      <polygon
        points={`280,${180 - c.standsHeight} 270,180 380,180 360,${180 - c.standsHeight}`}
        fill={c.stands}
        opacity="0.9"
      />
      {/* Right stand tiers */}
      {Array.from({ length: Math.ceil(c.standsHeight / 20) }).map((_, i) => (
        <line
          key={`rt-${i}`}
          x1={275 + i * 3}
          y1={180 - i * 20}
          x2={375 - i * 3}
          y2={180 - i * 20}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Back stand (if level >= 2) */}
      {safeLevel >= 2 && (
        <polygon
          points={`100,${160 - c.standsHeight * 0.4} 80,160 320,160 300,${160 - c.standsHeight * 0.4}`}
          fill={c.stands}
          opacity="0.6"
        />
      )}

      {/* Roof/dome (if applicable) */}
      {c.roof && (
        <>
          <path
            d={`M 30,${180 - c.standsHeight} Q 200,${100 - c.standsHeight} 370,${180 - c.standsHeight}`}
            fill="none"
            stroke={c.glow}
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d={`M 50,${180 - c.standsHeight + 5} Q 200,${110 - c.standsHeight} 350,${180 - c.standsHeight + 5}`}
            fill={c.stands}
            opacity="0.15"
          />
        </>
      )}

      {/* Field */}
      <rect x="60" y="155" width="280" height="45" rx="4" fill={`url(#fieldGrad-${safeLevel})`} />
      {/* Field lines */}
      <line x1="130" y1="155" x2="130" y2="200" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="200" y1="155" x2="200" y2="200" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="270" y1="155" x2="270" y2="200" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <circle cx="200" cy="177" r="12" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />

      {/* Light towers */}
      {Array.from({ length: c.lights }).map((_, i) => {
        const spacing = 340 / (c.lights + 1)
        const x = 30 + spacing * (i + 1)
        const topY = Math.max(10, 130 - c.standsHeight)
        return (
          <g key={`light-${i}`}>
            <line x1={x} y1={topY} x2={x} y2={155} stroke="#555" strokeWidth="1.5" />
            <rect x={x - 4} y={topY - 2} width="8" height="4" rx="1" fill="#888" />
            <rect x={x - 3} y={topY + 1} width="6" height="2" fill={c.glow} opacity="0.8" />
            {/* Light beam */}
            <polygon
              points={`${x - 3},${topY + 3} ${x + 3},${topY + 3} ${x + 15},155 ${x - 15},155`}
              fill={c.glow}
              opacity="0.04"
            />
          </g>
        )
      })}

      {/* Jumbotron (level >= 3) */}
      {safeLevel >= 3 && (
        <g>
          <rect x="170" y={135 - c.standsHeight * 0.3} width="60" height="18" rx="2" fill="#111" stroke={c.glow} strokeWidth="0.5" opacity="0.8" />
          <text x="200" y={148 - c.standsHeight * 0.3} textAnchor="middle" fill={c.glow} fontSize="7" fontWeight="bold" opacity="0.7">
            {safeLevel >= 5 ? 'SAM SPORTS' : 'SCORE'}
          </text>
        </g>
      )}

      {/* LED ring (level >= 4) */}
      {safeLevel >= 4 && (
        <ellipse
          cx="200"
          cy={180 - c.standsHeight}
          rx="160"
          ry="8"
          fill="none"
          stroke={c.glow}
          strokeWidth="1.5"
          opacity="0.3"
          strokeDasharray="4 6"
        />
      )}

      {/* Bottom fade */}
      <rect x="0" y="195" width="400" height="25" fill={c.sky[1]} />

      {/* Level badge */}
      <rect x="10" y="8" width={safeLevel >= 4 ? 90 : 70} height="20" rx="10" fill="rgba(0,0,0,0.5)" />
      <text x={safeLevel >= 4 ? 55 : 45} y="21" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
        {c.label}
      </text>
    </svg>
  )
}

export default StadiumImage
