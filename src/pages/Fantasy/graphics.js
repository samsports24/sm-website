import React from 'react'

// ═══════════════════════════════════════════════════════════════════════════
//  FANTASY PAGE GRAPHICS — all SVG, no image files to host or ship.
//  Glossy shield badges (Sleeper's visual language), format diagrams that
//  actually show how each draft moves, and a product shot of the draft board.
// ═══════════════════════════════════════════════════════════════════════════

// ── Shield badge ───────────────────────────────────────────────────────────
// The shield outline, a two-stop gradient face, a gloss sweep across the top,
// and a sport glyph knocked out in white. One component, four looks.

const GLYPHS = {
  football: (
    <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
      <ellipse cx="0" cy="0" rx="11" ry="6.6" transform="rotate(-30)" fill="#fff" fillOpacity="0.18" />
      <path d="M-7.5 4.3 L7.5 -4.3" />
      <path d="M-3.4 -0.6 L-1.6 2.5 M-0.6 -2.2 L1.2 0.9 M2.2 -3.8 L4 -0.7" strokeWidth="1.8" />
    </g>
  ),
  soccer: (
    <g fill="none" stroke="#fff" strokeWidth="2">
      <circle cx="0" cy="0" r="10" fill="#fff" fillOpacity="0.16" />
      <path d="M0 -5.4 L5.1 -1.7 L3.2 4.4 L-3.2 4.4 L-5.1 -1.7 Z" fill="#fff" fillOpacity="0.9" stroke="none" />
      <path d="M0 -10 L0 -5.4 M9.5 -3.1 L5.1 -1.7 M5.9 8.7 L3.2 4.4 M-5.9 8.7 L-3.2 4.4 M-9.5 -3.1 L-5.1 -1.7" strokeWidth="1.6" />
    </g>
  ),
  bracket: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
      <path d="M-9 -7 H-3 V0 H2" />
      <path d="M-9 7 H-3 V0" />
      <path d="M2 0 H4" />
      <circle cx="7.5" cy="0" r="3.4" fill="#fff" />
      <circle cx="-11" cy="-7" r="1.8" fill="#fff" stroke="none" />
      <circle cx="-11" cy="7" r="1.8" fill="#fff" stroke="none" />
    </g>
  ),
  chart: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-9 6 L-3 -1 L1 3 L9 -6" />
      <path d="M9 -6 H4.5 M9 -6 V-1.6" />
      <path d="M-9 9 H9" strokeOpacity="0.45" />
    </g>
  ),
}

export const Shield = ({ glyph = 'football', from = '#22C55E', to = '#0E8F45', size = 76 }) => {
  const id = `sh-${glyph}-${from.replace('#', '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={from} floodOpacity="0.45" />
        </filter>
      </defs>

      {/* shield body */}
      <path
        d="M40 5 L69 15 V38 C69 55 56 68 40 75 C24 68 11 55 11 38 V15 Z"
        fill={`url(#${id}-face)`}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.6"
        filter={`url(#${id}-glow)`}
      />
      {/* gloss sweep across the top half */}
      <path
        d="M40 5 L69 15 V33 C58 27 22 27 11 33 V15 Z"
        fill={`url(#${id}-gloss)`}
      />
      {/* glyph */}
      <g transform="translate(40 41)">{GLYPHS[glyph]}</g>
    </svg>
  )
}

// ── Draft format diagrams ──────────────────────────────────────────────────
// Little boards that show the actual pick path, so the difference between
// snake and linear is obvious at a glance instead of needing a paragraph.

const dot = (x, y, on) => (
  <circle key={`${x}-${y}`} cx={x} cy={y} r="4.6" fill={on ? '#22C55E' : 'rgba(255,255,255,0.14)'} />
)

export const FormatDiagram = ({ kind, width = 168, height = 74 }) => {
  const cols = [18, 48, 78, 108, 138]
  const rows = [16, 38, 60]

  if (kind === 'auction') {
    return (
      <svg width={width} height={height} viewBox="0 0 168 74" aria-hidden="true">
        {/* SP cap space draining at different rates — the auction in one picture */}
        {[0, 1, 2, 3].map((i) => {
          const pct = [0.9, 0.62, 0.44, 0.75][i]
          const y = 10 + i * 16
          return (
            <g key={i}>
              <rect x="14" y={y} width="120" height="7" rx="3.5" fill="rgba(255,255,255,0.1)" />
              <rect x="14" y={y} width={120 * pct} height="7" rx="3.5" fill={i === 1 ? '#D4A843' : 'rgba(212,168,67,0.45)'} />
              <text x="138" y={y + 7} fill="rgba(255,255,255,0.5)" fontSize="7.5" fontWeight="700">
                {Math.round(320 * pct)}M
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  // snake reverses on the middle row; linear repeats left-to-right.
  const path =
    kind === 'snake'
      ? 'M18 16 H138 M138 16 Q152 27 138 38 H18 M18 38 Q4 49 18 60 H138'
      : 'M18 16 H138 M138 16 Q152 27 138 38 M138 38 H18 M18 16 M18 38 H138'

  const linearPath = 'M18 16 H138 M18 38 H138 M18 60 H138'

  return (
    <svg width={width} height={height} viewBox="0 0 168 74" aria-hidden="true">
      <path
        d={kind === 'snake' ? path : linearPath}
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.6"
        strokeOpacity="0.55"
        strokeDasharray={kind === 'linear' ? '4 4' : 'none'}
      />
      {kind === 'linear' && (
        // the "back to the start" jump that defines a linear draft
        <path d="M138 22 C150 22 150 32 138 32" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      )}
      {rows.map((y, ri) =>
        cols.map((x, ci) => {
          const on = kind === 'snake'
            ? (ri % 2 === 0 ? ci === 0 : ci === cols.length - 1)
            : ci === 0
          return dot(x, y, on)
        })
      )}
    </svg>
  )
}

// ── Laptop product shot ────────────────────────────────────────────────────
// A laptop showing the real draft room: the colour-filled board, the player
// list, the clock. Sleeper sells the mock draft with a device shot of the
// product — this is ours, drawn in SVG so there's no screenshot to keep updated.

const LAP_POS = ['QB', 'RB', 'WR', 'OL', 'DE', 'LB', 'CB', 'TE', 'S', 'DT', 'WR', 'OL']
const LAP_FILL = {
  QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', OL: '#8B5CF6',
  DE: '#EC4899', DT: '#F43F5E', LB: '#14B8A6', CB: '#6366F1', S: '#0EA5E9',
}

export const LaptopMock = ({ width = '100%', maxWidth = 560 }) => (
  <svg viewBox="0 0 620 400" style={{ width, maxWidth }} aria-hidden="true">
    <defs>
      <linearGradient id="lap-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#141A26" />
        <stop offset="100%" stopColor="#0A0E15" />
      </linearGradient>
      <linearGradient id="lap-base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A4354" />
        <stop offset="100%" stopColor="#1B212C" />
      </linearGradient>
      <filter id="lap-shadow" x="-15%" y="-15%" width="130%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000" floodOpacity="0.6" />
      </filter>
    </defs>

    {/* lid */}
    <rect x="60" y="14" width="500" height="330" rx="14" fill="#2A3240" filter="url(#lap-shadow)" />
    <rect x="70" y="24" width="480" height="300" rx="8" fill="url(#lap-screen)" />

    {/* top bar: on the clock */}
    <rect x="70" y="24" width="480" height="30" rx="8" fill="rgba(34,197,94,0.10)" />
    <rect x="70" y="46" width="480" height="8" fill="url(#lap-screen)" />
    <circle cx="86" cy="39" r="4" fill="#22C55E" />
    <text x="97" y="43" fill="#E8EBF0" fontSize="9" fontWeight="700">You’re on the clock</text>
    <text x="452" y="43" fill="#22C55E" fontSize="11" fontWeight="800">0:47</text>
    <text x="492" y="43" fill="#D4A843" fontSize="9" fontWeight="800">184M SP</text>

    {/* left: player list */}
    <rect x="80" y="62" width="150" height="252" rx="6" fill="rgba(255,255,255,0.03)" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const pos = LAP_POS[i % LAP_POS.length]
      return (
        <g key={i}>
          <rect x={86} y={70 + i * 34} width={18} height={11} rx="2.5" fill={LAP_FILL[pos]} />
          <rect x={110} y={70 + i * 34} width={72} height={5} rx="2.5" fill="rgba(255,255,255,0.30)" />
          <rect x={110} y={79 + i * 34} width={44} height={4} rx="2" fill="rgba(255,255,255,0.13)" />
          <text x={214} y={80 + i * 34} fill="#D4A843" fontSize="7" fontWeight="800" textAnchor="end">
            {[38, 24, 19, 12, 9, 6, 4][i]}M
          </text>
        </g>
      )
    })}

    {/* right: the colour-filled draft board */}
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2, 3, 4, 5].map((c) => {
        const i = r * 6 + c
        const filled = i < 20
        const pos = LAP_POS[i % LAP_POS.length]
        const x = 244 + c * 50
        const y = 62 + r * 46
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={46} height={42} rx="5"
              fill={filled ? `${LAP_FILL[pos]}33` : 'rgba(255,255,255,0.03)'}
              stroke={i === 20 ? '#22C55E' : filled ? `${LAP_FILL[pos]}55` : 'rgba(255,255,255,0.05)'}
              strokeWidth={i === 20 ? 1.6 : 1}
            />
            {filled && (
              <>
                <rect x={x} y={y} width={3} height={42} rx="1.5" fill={LAP_FILL[pos]} />
                <text x={x + 8} y={y + 14} fill={LAP_FILL[pos]} fontSize="6.5" fontWeight="900">{pos}</text>
                <rect x={x + 8} y={y + 20} width={30} height={4} rx="2" fill="rgba(255,255,255,0.34)" />
                <rect x={x + 8} y={y + 28} width={18} height={3} rx="1.5" fill="rgba(255,255,255,0.15)" />
              </>
            )}
            {i === 20 && (
              <text x={x + 23} y={y + 26} fill="#22C55E" fontSize="9" fontWeight="900" textAnchor="middle">⏱</text>
            )}
          </g>
        )
      })
    )}

    {/* base */}
    <rect x="30" y="344" width="560" height="14" rx="6" fill="url(#lap-base)" />
    <rect x="270" y="344" width="80" height="5" rx="2.5" fill="rgba(0,0,0,0.35)" />
  </svg>
)

// ── Product shot: a live draft board ───────────────────────────────────────
// Not a stock illustration — this is what the room actually looks like.

const BOARD_POS = ['RB', 'WR', 'QB', 'TE', 'WR', 'RB', 'WR', 'QB', 'RB', 'TE', 'WR', 'K']
const POS_FILL = { QB: '#EF4444', RB: '#22C55E', WR: '#3B82F6', TE: '#F59E0B', K: '#A855F7' }

export const HeroBoard = () => (
  <svg viewBox="0 0 420 300" style={{ width: '100%', maxWidth: 460 }} aria-hidden="true">
    <defs>
      <linearGradient id="hb-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#151B27" />
        <stop offset="100%" stopColor="#0C1017" />
      </linearGradient>
      <filter id="hb-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity="0.55" />
      </filter>
    </defs>

    <rect x="8" y="8" width="404" height="284" rx="16" fill="url(#hb-bg)" stroke="rgba(255,255,255,0.09)" filter="url(#hb-shadow)" />

    {/* status strip */}
    <rect x="8" y="8" width="404" height="34" rx="16" fill="rgba(34,197,94,0.08)" />
    <rect x="8" y="34" width="404" height="8" fill="url(#hb-bg)" />
    <circle cx="30" cy="25" r="5" fill="#22C55E" />
    <text x="44" y="29" fill="#E8EBF0" fontSize="11" fontWeight="700">You’re on the clock</text>
    <text x="360" y="29" fill="#22C55E" fontSize="14" fontWeight="800">0:42</text>

    {/* column headers */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <text key={i} x={40 + i * 62} y="62" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="700" textAnchor="middle">
        {i === 2 ? 'YOU' : `TEAM ${i + 1}`}
      </text>
    ))}

    {/* board cells */}
    {[0, 1].map((r) =>
      [0, 1, 2, 3, 4, 5].map((c) => {
        const i = r * 6 + c
        const pos = BOARD_POS[i]
        const mine = c === 2
        return (
          <g key={i}>
            <rect
              x={14 + c * 62} y={70 + r * 42} width="58" height="38" rx="6"
              fill={mine ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.03)'}
              stroke={mine ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.06)'}
            />
            <rect x={20 + c * 62} y={76 + r * 42} width="16" height="8" rx="2" fill={POS_FILL[pos]} />
            <rect x={20 + c * 62} y={90 + r * 42} width="38" height="4" rx="2" fill="rgba(255,255,255,0.22)" />
            <rect x={20 + c * 62} y={97 + r * 42} width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
          </g>
        )
      })
    )}

    {/* the live pick */}
    <rect x={14 + 2 * 62} y={70 + 2 * 42} width="58" height="38" rx="6" fill="rgba(34,197,94,0.18)" stroke="#22C55E" strokeWidth="1.6" />
    <text x={43 + 2 * 62} y={95 + 2 * 42} fill="#22C55E" fontSize="14" fontWeight="800" textAnchor="middle">⏱</text>
    {[0, 1, 3, 4, 5].map((c) => (
      <rect key={c} x={14 + c * 62} y={70 + 2 * 42} width="58" height="38" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" />
    ))}

    {/* player row being drafted */}
    <rect x="14" y="240" width="392" height="44" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" />
    <rect x="26" y="254" width="22" height="16" rx="4" fill="#22C55E" />
    <text x="37" y="266" fill="#06210f" fontSize="9" fontWeight="800" textAnchor="middle">RB</text>
    <rect x="58" y="252" width="120" height="7" rx="3.5" fill="rgba(255,255,255,0.28)" />
    <rect x="58" y="264" width="76" height="5" rx="2.5" fill="rgba(255,255,255,0.13)" />
    <rect x="330" y="252" width="64" height="20" rx="6" fill="#22C55E" />
    <text x="362" y="266" fill="#06210f" fontSize="10" fontWeight="800" textAnchor="middle">DRAFT</text>
  </svg>
)
