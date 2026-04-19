import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { getStatus, fmtTime } from './constants'
import { TeamBadge } from './MatchCard'
import { prefetchMatchDetail } from './hooks/useAPIFootball'
// espnGet removed — standings popup uses direct fetch to avoid shared cooldown

/* ═══════════════════════════════════════════════════════════════
   Custom Widget Components, SamSports
   Replicates the visual design of API-Sports widgets as
   custom React components using the SamSports dark theme.
   ═══════════════════════════════════════════════════════════════ */

// ─── Shared theme tokens ───────────────────────────────────────
const T = {
  bg: '#0A0F1A',
  surface: '#111827',
  surface2: '#1A2235',
  card: '#1F2A3D',
  border: '#1E293B',
  borderLight: 'rgba(255,255,255,0.06)',
  accent: '#22C55E',
  accentDark: '#16a34a',
  blue: '#3B82F6',
  blueDark: '#2563EB',
  gold: '#f0b429',
  red: '#ff3b3b',
  white: '#ffffff',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDim: '#64748B',
  fontHd: "'Rajdhani', sans-serif",
  fontCd: "'Barlow Condensed', sans-serif",
  fontBd: "'Barlow', sans-serif",
  radius: 10,
  radiusSm: 6,
}

// ─── Utility: Circular gauge (like API-Sports team stats) ──────
const CircleGauge = ({ value, label, size = 72, stroke = 5, color = T.accent }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(value, 0), 100)
  const offset = circ - (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'relative', marginTop: -size + 4, height: size - 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: T.fontHd, fontSize: size * 0.22, fontWeight: 800,
          color: T.white, letterSpacing: -0.5,
        }}>{pct.toFixed(1)}%</span>
      </div>
      {label && (
        <span style={{
          fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
          color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{label}</span>
      )}
    </div>
  )
}

// ─── Utility: Stat bar (like API-Sports game statistics) ───────
const StatBar = ({ label, homeValue, awayValue, homeColor = T.accent, awayColor = T.blue }) => {
  const hN = parseFloat(String(homeValue).replace('%', '')) || 0
  const aN = parseFloat(String(awayValue).replace('%', '')) || 0
  const total = hN + aN || 1

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 5,
      }}>
        <span style={{
          fontFamily: T.fontCd, fontSize: 13, fontWeight: 800,
          color: hN >= aN ? homeColor : T.textPrimary,
        }}>{homeValue}</span>
        <span style={{
          fontFamily: T.fontCd, fontSize: 9, fontWeight: 600,
          color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{label}</span>
        <span style={{
          fontFamily: T.fontCd, fontSize: 13, fontWeight: 800,
          color: aN > hN ? awayColor : T.textPrimary,
        }}>{awayValue}</span>
      </div>
      <div style={{ display: 'flex', height: 5, gap: 3, borderRadius: 3 }}>
        <div style={{
          width: `${(hN / total) * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${homeColor}, ${homeColor}99)`,
          borderRadius: 3, transition: 'width 0.6s ease',
        }} />
        <div style={{ flex: 1 }} />
        <div style={{
          width: `${(aN / total) * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${awayColor}99, ${awayColor})`,
          borderRadius: 3, transition: 'width 0.6s ease', marginLeft: 'auto',
        }} />
      </div>
    </div>
  )
}

// ─── Utility: Tab strip ────────────────────────────────────────
const TabStrip = ({ tabs, active, onChange }) => (
  <div style={{
    display: 'flex', gap: 2, padding: '0 12px',
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
    borderRadius: `${T.radius}px ${T.radius}px 0 0`,
  }}>
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        style={{
          padding: '10px 14px',
          fontFamily: T.fontCd, fontSize: 11, fontWeight: 700,
          color: active === tab.key ? T.accent : T.textDim,
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: active === tab.key ? `2px solid ${T.accent}` : '2px solid transparent',
          textTransform: 'uppercase', letterSpacing: 0.5,
          transition: 'all 0.2s ease',
        }}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

// ─── Utility: Widget container wrapper ─────────────────────────
const WidgetBox = ({ children, style = {} }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
)

const WidgetHeader = ({ title, icon, right, onClick, onRankingClick }) => (
  <div
    style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px',
      borderBottom: `1px solid ${T.border}`,
      background: T.surface2,
    }}
  >
    <div style={{
      fontFamily: T.fontHd, fontSize: 13, fontWeight: 700,
      color: T.white, display: 'flex', alignItems: 'center', gap: 8,
      cursor: onClick ? 'pointer' : 'default',
    }} onClick={onClick}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = '0.8' }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.opacity = '1' }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {title}
      {onClick && (
        <span style={{
          fontFamily: T.fontCd, fontSize: 9, fontWeight: 600,
          color: T.textDim, letterSpacing: 0.5,
          marginLeft: 4,
        }}>▸ STANDINGS</span>
      )}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {onRankingClick && (
        <span
          onClick={onRankingClick}
          style={{
            fontFamily: T.fontCd, fontSize: 9, fontWeight: 700,
            color: T.accent, letterSpacing: 0.5,
            padding: '3px 8px', borderRadius: 4,
            background: 'rgba(34,197,94,0.12)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.12)'}
        >⭐ SAM RANKING</span>
      )}
      {right && <div>{right}</div>}
    </div>
  </div>
)


/* ═══════════════════════════════════════════════════════════════
   1. LIVE SCORES WIDGET, Game cards with live updates
   Replicates: API-Sports "Games" widget
   ═══════════════════════════════════════════════════════════════ */

const GameRow = ({ event, onClick, onHover }) => {
  if (!event?.competitions?.[0]) return null

  const comp = event.competitions[0]
  const competitors = comp.competitors || []
  const home = competitors.find(c => c.homeAway === 'home')
  const away = competitors.find(c => c.homeAway === 'away')
  if (!home || !away) return null

  const status = getStatus(event)
  const isLive = status.state === 'live' || status.state === 'halftime'
  const isFinal = status.state === 'final'
  const hasScore = home.score !== undefined && away.score !== undefined
  const homeWon = hasScore && isFinal && Number(home.score) > Number(away.score)
  const awayWon = hasScore && isFinal && Number(away.score) > Number(home.score)

  // Time display
  let timeDisplay = status.label
  if (status.state === 'scheduled' && event.date) {
    timeDisplay = fmtTime(new Date(event.date))
  }

  const homeName = home.team?.abbreviation || home.team?.shortDisplayName || 'HOM'
  const awayName = away.team?.abbreviation || away.team?.shortDisplayName || 'AWY'
  const homeFullName = home.team?.displayName || home.team?.shortDisplayName || 'Home'
  const awayFullName = away.team?.displayName || away.team?.shortDisplayName || 'Away'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="widget-game-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '10px 16px',
        gap: 10,
        borderBottom: `1px solid ${T.borderLight}`,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        background: isLive ? 'rgba(34,197,94,0.04)' : 'transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; onHover?.() }}
      onMouseLeave={e => e.currentTarget.style.background = isLive ? 'rgba(34,197,94,0.04)' : 'transparent'}
    >
      {/* Home team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TeamBadge team={home} size={24} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: T.fontHd, fontSize: 13, fontWeight: 700,
            color: homeWon ? T.accent : T.white,
            lineHeight: 1.2,
          }}>{homeFullName}</span>
          <span style={{
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
            color: T.textDim, letterSpacing: 0.5,
          }}>{homeName}</span>
        </div>
      </div>

      {/* Score / Status center */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minWidth: 60,
      }}>
        {hasScore ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: T.fontHd, fontSize: 20, fontWeight: 800,
            color: T.white, letterSpacing: 2,
          }}>
            <span style={{ color: homeWon ? T.accent : T.white }}>{home.score}</span>
            <span style={{ color: T.textDim, fontSize: 14 }}>-</span>
            <span style={{ color: awayWon ? T.accent : T.white }}>{away.score}</span>
          </div>
        ) : (
          <span style={{
            fontFamily: T.fontCd, fontSize: 14, fontWeight: 700,
            color: T.textSecondary,
          }}>{timeDisplay}</span>
        )}

        {/* Status chip */}
        <span style={{
          fontFamily: T.fontCd, fontSize: 9, fontWeight: 700,
          color: isLive ? T.accent : isFinal ? T.textDim : T.gold,
          letterSpacing: 0.5, textTransform: 'uppercase',
          marginTop: 2,
          ...(isLive ? {
            animation: 'widgetPulse 2s ease-in-out infinite',
          } : {}),
        }}>
          {isLive ? (status.state === 'halftime' ? 'HT' : status.clock || 'LIVE')
            : isFinal ? (status.label || 'FT')
            : ''}
        </span>
      </div>

      {/* Away team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{
            fontFamily: T.fontHd, fontSize: 13, fontWeight: 700,
            color: awayWon ? T.accent : T.white,
            lineHeight: 1.2,
          }}>{awayFullName}</span>
          <span style={{
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
            color: T.textDim, letterSpacing: 0.5,
          }}>{awayName}</span>
        </div>
        <TeamBadge team={away} size={24} />
      </div>
    </div>
  )
}

/**
 * LiveScoresWidget, Shows a list of games with scores, like API-Sports games widget.
 * Props:
 *   events: Array of ESPN event objects
 *   leagueName: String (e.g. "NFL", "Premier League")
 *   emoji: String emoji
 *   onGameClick: (eventId) => void
 *   filter: 'all' | 'live' | 'finished' | 'scheduled'
 */
export const LiveScoresWidget = ({
  events = [],
  leagueName = 'Scores',
  emoji = '⚽',
  onGameClick,
  onLeagueClick,
  onRankingClick,
  filter = 'all',
}) => {
  const [activeFilter, setActiveFilter] = useState(filter)

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events
    return events.filter(ev => {
      const s = getStatus(ev)
      if (activeFilter === 'live') return s.state === 'live' || s.state === 'halftime'
      if (activeFilter === 'finished') return s.state === 'final'
      if (activeFilter === 'scheduled') return s.state === 'scheduled'
      return true
    })
  }, [events, activeFilter])

  const liveCt = events.filter(ev => { const s = getStatus(ev); return s.state === 'live' || s.state === 'halftime' }).length

  const filterTabs = [
    { key: 'all', label: `All (${events.length})` },
    { key: 'live', label: `Live${liveCt ? ` (${liveCt})` : ''}` },
    { key: 'finished', label: 'Finished' },
    { key: 'scheduled', label: 'Upcoming' },
  ]

  return (
    <WidgetBox>
      <WidgetHeader
        title={`${emoji} ${leagueName}`}
        onClick={onLeagueClick}
        onRankingClick={onRankingClick}
        right={liveCt > 0 && (
          <span style={{
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
            color: T.accent, letterSpacing: 0.5,
            padding: '3px 8px', borderRadius: 4,
            background: 'rgba(34,197,94,0.12)',
            animation: 'widgetPulse 2s ease-in-out infinite',
          }}>{liveCt} LIVE</span>
        )}
      />
      <TabStrip
        tabs={filterTabs}
        active={activeFilter}
        onChange={setActiveFilter}
      />
      <div className="widget-scores-list">
        {filteredEvents.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            fontFamily: T.fontBd, fontSize: 13, color: T.textDim,
          }}>No matches found</div>
        ) : (
          filteredEvents.map(ev => (
            <GameRow
              key={ev.id}
              event={ev}
              onClick={() => onGameClick?.(ev.id)}
              onHover={() => prefetchMatchDetail(ev.id)}
            />
          ))
        )}
      </div>
    </WidgetBox>
  )
}


/* ═══════════════════════════════════════════════════════════════
   2. STANDINGS WIDGET, League table
   Replicates: API-Sports "Standings" widget
   ═══════════════════════════════════════════════════════════════ */

/**
 * StandingsWidget, Full league standings table.
 * Props:
 *   standings: Array of team standing objects (from ESPN standings API)
 *     Each entry: { team: { displayName, abbreviation, logos }, stats: [{ name, value }] }
 *   leagueName: String
 *   emoji: String
 *   type: 'soccer' | 'nfl' | 'nba' | 'nhl' | 'mlb'
 *   zones: { cl: [1,4], el: [5,6], rel: [18,20] }, for colored row zones
 */
export const StandingsWidget = ({
  standings = [],
  leagueName = 'Standings',
  emoji = '📊',
  type = 'soccer',
  zones = {},
}) => {
  // Determine column headers based on sport type
  const getColumns = () => {
    switch (type) {
      case 'soccer':
        return [
          { key: 'gamesPlayed', label: 'MP', width: 32 },
          { key: 'wins', label: 'W', width: 28 },
          { key: 'draws', label: 'D', width: 28 },
          { key: 'losses', label: 'L', width: 28 },
          { key: 'pointsFor', label: 'GF', width: 32 },
          { key: 'pointsAgainst', label: 'GA', width: 32 },
          { key: 'pointDifferential', label: 'GD', width: 32 },
          { key: 'points', label: 'PTS', width: 36, bold: true },
        ]
      case 'nfl':
        return [
          { key: 'wins', label: 'W', width: 30 },
          { key: 'losses', label: 'L', width: 30 },
          { key: 'ties', label: 'T', width: 30 },
          { key: 'winPercent', label: 'PCT', width: 42 },
          { key: 'pointsFor', label: 'PF', width: 36 },
          { key: 'pointsAgainst', label: 'PA', width: 36 },
          { key: 'streak', label: 'STK', width: 36 },
        ]
      case 'nba':
      case 'nhl':
        return [
          { key: 'wins', label: 'W', width: 30 },
          { key: 'losses', label: 'L', width: 30 },
          { key: 'winPercent', label: 'PCT', width: 42 },
          { key: 'gamesBehind', label: 'GB', width: 36 },
          { key: 'streak', label: 'STK', width: 40 },
          { key: 'differential', label: 'DIFF', width: 42 },
        ]
      case 'mlb':
        return [
          { key: 'wins', label: 'W', width: 30 },
          { key: 'losses', label: 'L', width: 30 },
          { key: 'winPercent', label: 'PCT', width: 42 },
          { key: 'gamesBehind', label: 'GB', width: 36 },
          { key: 'streak', label: 'STK', width: 40 },
          { key: 'differential', label: 'DIFF', width: 42 },
        ]
      default:
        return [
          { key: 'wins', label: 'W', width: 30 },
          { key: 'losses', label: 'L', width: 30 },
          { key: 'winPercent', label: 'PCT', width: 42 },
        ]
    }
  }

  const columns = getColumns()

  // Get stat value from ESPN standings entry
  const getStatVal = (entry, key) => {
    if (!entry?.stats) return '—'
    const stat = entry.stats.find(s => s.name === key || s.abbreviation === key)
    return stat?.displayValue ?? stat?.value ?? '—'
  }

  // Determine zone color for a row
  const getZoneColor = (rank) => {
    if (zones.cl && rank >= zones.cl[0] && rank <= zones.cl[1]) return T.accent
    if (zones.el && rank >= zones.el[0] && rank <= zones.el[1]) return T.blue
    if (zones.conf && rank >= zones.conf[0] && rank <= zones.conf[1]) return '#8B5CF6'
    if (zones.rel && rank >= zones.rel[0] && rank <= zones.rel[1]) return T.red
    if (zones.playoff && rank >= zones.playoff[0] && rank <= zones.playoff[1]) return T.accent
    return 'transparent'
  }

  // Column header width calculation
  const colsWidth = columns.reduce((sum, c) => sum + c.width, 0)

  return (
    <WidgetBox>
      <WidgetHeader title={`${emoji} ${leagueName}`} />

      {/* Table header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 16px',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface2,
      }}>
        <span style={{
          fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
          color: T.textDim, width: 28, textAlign: 'center',
          letterSpacing: 0.3, textTransform: 'uppercase',
        }}>#</span>
        <span style={{
          fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
          color: T.textDim, flex: 1, paddingLeft: 8,
          letterSpacing: 0.3, textTransform: 'uppercase',
        }}>TEAM</span>
        {columns.map(col => (
          <span key={col.key} style={{
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
            color: T.textDim, width: col.width, textAlign: 'center',
            letterSpacing: 0.3, textTransform: 'uppercase',
          }}>{col.label}</span>
        ))}
      </div>

      {/* Table body */}
      <div style={{ maxHeight: 520, overflowY: 'auto' }}>
        {standings.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            fontFamily: T.fontBd, fontSize: 13, color: T.textDim,
          }}>No standings available</div>
        ) : (
          standings.map((entry, idx) => {
            const rank = idx + 1
            const team = entry.team || {}
            const logo = team.logos?.[0]?.href || ''
            const zoneColor = getZoneColor(rank)

            return (
              <div key={team.id || idx} style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 16px',
                borderBottom: `1px solid ${T.borderLight}`,
                borderLeft: `3px solid ${zoneColor}`,
                transition: 'background 0.15s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Rank */}
                <span style={{
                  fontFamily: T.fontCd, fontSize: 12, fontWeight: 700,
                  color: T.textSecondary, width: 28, textAlign: 'center',
                }}>{rank}</span>

                {/* Team */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, flex: 1,
                  paddingLeft: 8,
                }}>
                  {logo && (
                    <img src={logo} alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <span style={{
                    fontFamily: T.fontHd, fontSize: 12.5, fontWeight: 700,
                    color: T.white, lineHeight: 1.2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 140,
                  }}>
                    {team.displayName || team.shortDisplayName || team.name || '—'}
                  </span>
                </div>

                {/* Stats */}
                {columns.map(col => (
                  <span key={col.key} style={{
                    fontFamily: T.fontCd,
                    fontSize: col.bold ? 13 : 12,
                    fontWeight: col.bold ? 800 : 600,
                    color: col.bold ? T.accent : T.textPrimary,
                    width: col.width, textAlign: 'center',
                  }}>
                    {getStatVal(entry, col.key)}
                  </span>
                ))}
              </div>
            )
          })
        )}
      </div>

      {/* Zone legend for soccer */}
      {type === 'soccer' && (
        <div style={{
          display: 'flex', gap: 16, padding: '10px 16px',
          borderTop: `1px solid ${T.border}`,
          background: T.surface2,
        }}>
          {zones.cl && <ZoneLegend color={T.accent} label="Champions League" />}
          {zones.el && <ZoneLegend color={T.blue} label="Europa League" />}
          {zones.conf && <ZoneLegend color="#8B5CF6" label="Conference League" />}
          {zones.rel && <ZoneLegend color={T.red} label="Relegation" />}
        </div>
      )}
      {(type === 'nfl' || type === 'nba' || type === 'nhl' || type === 'mlb') && zones.playoff && (
        <div style={{
          display: 'flex', gap: 16, padding: '10px 16px',
          borderTop: `1px solid ${T.border}`,
          background: T.surface2,
        }}>
          <ZoneLegend color={T.accent} label="Playoff spot" />
        </div>
      )}
    </WidgetBox>
  )
}

const ZoneLegend = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
    <span style={{
      fontFamily: T.fontCd, fontSize: 9.5, fontWeight: 600,
      color: T.textDim, letterSpacing: 0.3,
    }}>{label}</span>
  </div>
)


/* ═══════════════════════════════════════════════════════════════
   3. GAME DETAIL WIDGET, Full match detail with tabs
   Replicates: API-Sports "Game" widget
   ═══════════════════════════════════════════════════════════════ */

/**
 * GameDetailWidget, Full game detail view with stats, events, etc.
 * Props:
 *   matchData: ESPN match detail data object (from useMatchDetail)
 *   sport: 'soccer' | 'football' | 'basketball' | 'hockey' | 'baseball'
 */
export const GameDetailWidget = ({ matchData, sport = 'soccer' }) => {
  const [activeTab, setActiveTab] = useState('stats')

  if (!matchData) {
    return (
      <WidgetBox>
        <div style={{
          padding: 40, textAlign: 'center',
          fontFamily: T.fontBd, fontSize: 13, color: T.textDim,
        }}>Loading match details...</div>
      </WidgetBox>
    )
  }

  const comp = matchData.header?.competitions?.[0]
  const competitors = comp?.competitors || []
  const home = competitors.find(c => c.homeAway === 'home') || competitors[1]
  const away = competitors.find(c => c.homeAway === 'away') || competitors[0]

  const homeTeamName = home?.team?.displayName || home?.team?.shortDisplayName || 'Home'
  const awayTeamName = away?.team?.displayName || away?.team?.shortDisplayName || 'Away'

  const status = getStatus(matchData)

  // Stats
  const statKeysMap = {
    soccer: [
      { key: 'possessionPct', label: 'Possession' },
      { key: 'shotsOnTarget', label: 'Shots on Target' },
      { key: 'shots', label: 'Total Shots' },
      { key: 'corners', label: 'Corners' },
      { key: 'fouls', label: 'Fouls' },
      { key: 'yellowCards', label: 'Yellow Cards' },
      { key: 'offsides', label: 'Offsides' },
    ],
    football: [
      { key: 'totalYards', label: 'Total Yards' },
      { key: 'passingYards', label: 'Passing Yards' },
      { key: 'rushingYards', label: 'Rushing Yards' },
      { key: 'firstDowns', label: 'First Downs' },
      { key: 'turnovers', label: 'Turnovers' },
      { key: 'penalties', label: 'Penalties' },
      { key: 'thirdDownEff', label: '3rd Down Eff.' },
    ],
    basketball: [
      { key: 'fieldGoalPct', label: 'FG %' },
      { key: 'threePointPct', label: '3PT %' },
      { key: 'freeThrowPct', label: 'FT %' },
      { key: 'rebounds', label: 'Rebounds' },
      { key: 'assists', label: 'Assists' },
      { key: 'turnovers', label: 'Turnovers' },
    ],
    hockey: [
      { key: 'shotsOnGoal', label: 'Shots on Goal' },
      { key: 'faceOffWinPct', label: 'Faceoff Win %' },
      { key: 'powerPlayGoals', label: 'Power Play Goals' },
      { key: 'hits', label: 'Hits' },
      { key: 'blockedShots', label: 'Blocked Shots' },
    ],
    baseball: [
      { key: 'hits', label: 'Hits' },
      { key: 'errors', label: 'Errors' },
      { key: 'leftOnBase', label: 'Left on Base' },
    ],
  }
  const statKeys = statKeysMap[sport] || statKeysMap.soccer
  const teamStats = matchData.boxscore?.teams || []

  const getStatVal = (team, statKey) => {
    const stat = team?.statistics?.find(s => s.name === statKey)
    return stat?.displayValue || stat?.value || '—'
  }

  // Events for soccer
  const events = []
  if (sport === 'soccer' && matchData.keyEvents?.length > 0) {
    matchData.keyEvents.forEach(evt => {
      const play = evt?.play || evt
      const minute = play?.clock?.displayValue || play?.gameMinute || ''
      const participants = play?.participants || []
      const playerName = participants[0]?.athlete?.displayName || play?.text || ''
      const assist = participants[1]?.athlete?.displayName || ''
      const teamId = play?.team?.id || ''
      const homeTeamId = home?.team?.id || home?.id || ''
      const type = (play?.type?.text || play?.type || '').toLowerCase()
      let eventType = null
      if (type.includes('own goal')) eventType = 'owngoal'
      else if (type.includes('goal')) eventType = 'goal'
      else if (type.includes('second yellow') || (type.includes('yellow') && type.includes('red'))) eventType = 'red'
      else if (type.includes('yellow')) eventType = 'yellow'
      else if (type.includes('red')) eventType = 'red'
      else if (type.includes('substitution')) eventType = 'sub'
      if (eventType) events.push({ type: eventType, minute, player: playerName, assist, side: String(teamId) === String(homeTeamId) ? 'home' : 'away' })
    })
  }

  // Scoring plays for other sports
  const scoringPlays = []
  if (sport !== 'soccer') {
    const plays = matchData.scoringPlays || []
    const homeTeamId = home?.team?.id || home?.id || ''
    plays.forEach(play => {
      const teamId = play?.team?.id || ''
      const clock = play?.clock?.displayValue || play?.displayClock || ''
      const period = play?.period?.number || play?.quarter || ''
      const text = play?.text || play?.description || ''
      const scoringType = play?.type?.text || play?.scoringType?.displayName || ''
      const score = (play?.homeScore != null && play?.awayScore != null) ? `${play.homeScore}-${play.awayScore}` : ''
      let periodLabel = ''
      if (sport === 'football') periodLabel = period ? `Q${period}` : ''
      else if (sport === 'basketball') periodLabel = period ? `Q${period}` : ''
      else if (sport === 'hockey') periodLabel = period ? `P${period}` : ''
      else if (sport === 'baseball') periodLabel = period ? `Inn ${period}` : ''
      scoringPlays.push({ minute: [periodLabel, clock].filter(Boolean).join(' '), text, scoringType, score, side: String(teamId) === String(homeTeamId) ? 'home' : 'away' })
    })
  }

  // Lineups / Rosters
  const rosters = matchData.rosters || []

  const tabs = [
    { key: 'stats', label: 'Statistics' },
    { key: 'events', label: sport === 'soccer' ? 'Events' : 'Scoring' },
    ...(rosters.length > 0 ? [{ key: 'lineups', label: sport === 'soccer' ? 'Lineups' : 'Players' }] : []),
  ]

  return (
    <WidgetBox>
      {/* Score hero */}
      <div style={{
        padding: '28px 20px 20px',
        background: `linear-gradient(180deg, rgba(34,197,94,0.08) 0%, transparent 100%)`,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 16,
        }}>
          {/* Home */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 56, height: 56, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
              borderRadius: 14, border: `1px solid ${T.borderLight}`,
            }}>
              <TeamBadge team={home} size={40} />
            </div>
            <span style={{
              fontFamily: T.fontHd, fontSize: 12.5, fontWeight: 700,
              color: T.white, textAlign: 'center', lineHeight: 1.2,
              maxWidth: 120,
            }}>{homeTeamName}</span>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              fontFamily: T.fontHd, fontSize: 44, fontWeight: 800,
              color: T.white, letterSpacing: 6, lineHeight: 1,
              textShadow: '0 2px 20px rgba(34,197,94,0.2)',
            }}>
              {home?.score ?? '—'} <span style={{ color: T.textDim, fontSize: 28 }}>:</span> {away?.score ?? '—'}
            </div>
            <span style={{
              fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
              color: status.state === 'live' ? T.accent : T.textDim,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>{status.label}</span>
          </div>

          {/* Away */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 56, height: 56, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
              borderRadius: 14, border: `1px solid ${T.borderLight}`,
            }}>
              <TeamBadge team={away} size={40} />
            </div>
            <span style={{
              fontFamily: T.fontHd, fontSize: 12.5, fontWeight: 700,
              color: T.white, textAlign: 'center', lineHeight: 1.2,
              maxWidth: 120,
            }}>{awayTeamName}</span>
          </div>
        </div>

        {/* Venue */}
        {matchData.gameInfo?.venue && (
          <div style={{
            textAlign: 'center', marginTop: 12,
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
            color: T.textDim, letterSpacing: 0.3,
          }}>{matchData.gameInfo.venue.fullName || matchData.gameInfo.venue.name}</div>
        )}
      </div>

      {/* Tabs */}
      <TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div style={{ padding: '12px 16px', minHeight: 200 }}>
        {activeTab === 'stats' && teamStats.length >= 2 && (
          <div>
            {/* Team header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0 0 8px', borderBottom: `1px solid ${T.borderLight}`,
              marginBottom: 4,
            }}>
              <span style={{ fontFamily: T.fontCd, fontSize: 11, fontWeight: 700, color: T.accent }}>{homeTeamName}</span>
              <span style={{ fontFamily: T.fontCd, fontSize: 11, fontWeight: 700, color: T.blue }}>{awayTeamName}</span>
            </div>
            {statKeys.map(({ key, label }) => (
              <StatBar
                key={key}
                label={label}
                homeValue={getStatVal(teamStats[0], key)}
                awayValue={getStatVal(teamStats[1], key)}
              />
            ))}
          </div>
        )}

        {activeTab === 'events' && sport === 'soccer' && (
          <div>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: T.textDim, fontFamily: T.fontBd, fontSize: 13 }}>
                No events recorded yet
              </div>
            ) : (
              events.map((evt, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: evt.side === 'home' ? '1fr 40px auto' : 'auto 40px 1fr',
                  padding: '8px 0',
                  borderBottom: `1px solid ${T.borderLight}`,
                  alignItems: 'center',
                }}>
                  {evt.side === 'home' ? (
                    <>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: T.fontHd, fontSize: 12, fontWeight: 700, color: T.white }}>
                          {evt.player}
                        </span>
                        {evt.assist && <span style={{ fontSize: 10, color: T.textSecondary, marginLeft: 4 }}>({evt.assist})</span>}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: T.fontCd, fontSize: 10, fontWeight: 700, color: T.textDim }}>{evt.minute}&apos;</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <EventIcon type={evt.type} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: 'right' }}>
                        <EventIcon type={evt.type} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: T.fontCd, fontSize: 10, fontWeight: 700, color: T.textDim }}>{evt.minute}&apos;</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontFamily: T.fontHd, fontSize: 12, fontWeight: 700, color: T.white }}>
                          {evt.player}
                        </span>
                        {evt.assist && <span style={{ fontSize: 10, color: T.textSecondary, marginLeft: 4 }}>({evt.assist})</span>}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'events' && sport !== 'soccer' && (
          <div>
            {scoringPlays.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: T.textDim, fontFamily: T.fontBd, fontSize: 13 }}>
                No scoring plays recorded
              </div>
            ) : (
              scoringPlays.map((play, idx) => (
                <div key={idx} style={{
                  padding: '10px 14px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.borderLight}`,
                  borderLeft: `3px solid ${play.side === 'home' ? T.accent : T.blue}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: T.fontCd, fontSize: 10, fontWeight: 700, color: T.textDim }}>{play.minute}</span>
                    {play.score && <span style={{ fontFamily: T.fontCd, fontSize: 11, fontWeight: 800, color: T.accent }}>{play.score}</span>}
                  </div>
                  <div style={{ fontFamily: T.fontBd, fontSize: 11.5, color: T.textPrimary, marginTop: 3 }}>{play.text}</div>
                  {play.scoringType && <div style={{ fontFamily: T.fontCd, fontSize: 10, color: T.textSecondary, marginTop: 1 }}>{play.scoringType}</div>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'lineups' && rosters.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {rosters.slice(0, 2).map((roster, rIdx) => (
              <div key={rIdx}>
                <div style={{
                  fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
                  color: rIdx === 0 ? T.accent : T.blue,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  paddingBottom: 6, borderBottom: `1px solid ${T.borderLight}`,
                  marginBottom: 6,
                }}>{rIdx === 0 ? homeTeamName : awayTeamName}</div>
                {(roster.roster || []).slice(0, 14).map((entry, pIdx) => {
                  const player = entry.athlete || entry
                  return (
                    <div key={pIdx} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 0',
                      borderBottom: `1px solid ${T.borderLight}`,
                    }}>
                      {entry.jersey && (
                        <span style={{
                          fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
                          color: T.textDim, width: 20, textAlign: 'right',
                        }}>{entry.jersey}</span>
                      )}
                      <span style={{
                        fontFamily: T.fontHd, fontSize: 11.5, fontWeight: 600,
                        color: entry.starter ? T.white : T.textSecondary,
                      }}>
                        {player.displayName || player.shortName || '—'}
                      </span>
                      {entry.position?.abbreviation && (
                        <span style={{
                          fontFamily: T.fontCd, fontSize: 9, fontWeight: 600,
                          color: T.textDim, marginLeft: 'auto',
                        }}>{entry.position.abbreviation}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </WidgetBox>
  )
}

const EventIcon = ({ type }) => {
  const icons = {
    goal: { symbol: '⚽', color: T.accent },
    owngoal: { symbol: 'OG', color: T.red },
    yellow: { symbol: '🟨', color: T.gold },
    red: { symbol: '🟥', color: T.red },
    sub: { symbol: '🔄', color: T.textSecondary },
  }
  const cfg = icons[type] || { symbol: '•', color: T.textDim }
  return (
    <span style={{ fontSize: type === 'owngoal' ? 9 : 12, color: cfg.color, fontFamily: T.fontCd, fontWeight: 700 }}>
      {cfg.symbol}
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════
   4. TEAM PROFILE WIDGET, Team overview with gauges and stats
   Replicates: API-Sports "Team" widget with circular gauges
   ═══════════════════════════════════════════════════════════════ */

/**
 * TeamProfileWidget, Team card with logo, gauges, record breakdown.
 * Props:
 *   team: { displayName, abbreviation, logo, logos, color }
 *   stats: { wins, losses, draws, winPct, goalsFor, goalsAgainst, cleanSheets, failedToScore }
 *   leagueName: String
 *   type: 'soccer' | 'nfl' | 'nba' etc.
 */
export const TeamProfileWidget = ({
  team = {},
  stats = {},
  leagueName = '',
  type = 'soccer',
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  const logo = team.logos?.[0]?.href || team.logo || ''
  const teamName = team.displayName || team.shortDisplayName || team.name || '—'
  const teamColor = team.color ? `#${team.color}` : T.accent

  // Calculate percentages for gauges
  const totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0)
  const winPct = totalGames > 0 ? ((stats.wins || 0) / totalGames) * 100 : 0
  const lossPct = totalGames > 0 ? ((stats.losses || 0) / totalGames) * 100 : 0
  const drawPct = totalGames > 0 ? ((stats.draws || 0) / totalGames) * 100 : 0

  const tabs = type === 'soccer'
    ? [
      { key: 'overview', label: 'Overview' },
      { key: 'stats', label: 'Statistics' },
    ]
    : [
      { key: 'overview', label: 'Overview' },
      { key: 'stats', label: 'Statistics' },
    ]

  return (
    <WidgetBox>
      {/* Team hero */}
      <div style={{
        padding: '24px 20px',
        background: `linear-gradient(180deg, ${teamColor}10 0%, transparent 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 72, height: 72, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
          borderRadius: 18, border: `1px solid ${T.borderLight}`,
        }}>
          {logo ? (
            <img src={logo} alt={teamName} style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'} />
          ) : (
            <span style={{ fontFamily: T.fontHd, fontSize: 22, fontWeight: 800, color: teamColor }}>
              {(team.abbreviation || '?').slice(0, 3)}
            </span>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: T.fontHd, fontSize: 18, fontWeight: 800,
            color: T.white, lineHeight: 1.2,
          }}>{teamName}</div>
          {leagueName && (
            <div style={{
              fontFamily: T.fontCd, fontSize: 11, fontWeight: 600,
              color: T.textDim, marginTop: 4, letterSpacing: 0.3,
            }}>{leagueName}</div>
          )}
        </div>
      </div>

      <TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div style={{ padding: '16px' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Circular gauges row */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 24,
              padding: '12px 0 20px',
            }}>
              <CircleGauge value={winPct} label="Wins" color={T.accent} size={80} />
              {type === 'soccer' && <CircleGauge value={drawPct} label="Draws" color={T.gold} size={80} />}
              <CircleGauge value={lossPct} label="Losses" color={T.red} size={80} />
            </div>

            {/* Record breakdown bars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: type === 'soccer' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: 8,
              marginTop: 8,
            }}>
              <RecordBar label="Wins" value={stats.wins || 0} max={totalGames} color={T.accent} />
              {type === 'soccer' && <RecordBar label="Draws" value={stats.draws || 0} max={totalGames} color={T.gold} />}
              <RecordBar label="Losses" value={stats.losses || 0} max={totalGames} color={T.red} />
            </div>

            {/* Extra stats */}
            {type === 'soccer' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8, marginTop: 12,
              }}>
                {stats.cleanSheets != null && <RecordBar label="Clean Sheets" value={stats.cleanSheets} max={totalGames} color={T.blue} />}
                {stats.failedToScore != null && <RecordBar label="Failed to Score" value={stats.failedToScore} max={totalGames} color={T.textDim} />}
                {stats.goalsFor != null && (
                  <StatBox label="Goals For" value={stats.goalsFor} />
                )}
                {stats.goalsAgainst != null && (
                  <StatBox label="Goals Against" value={stats.goalsAgainst} />
                )}
              </div>
            )}

            {type !== 'soccer' && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8, marginTop: 12,
              }}>
                {stats.pointsFor != null && <StatBox label={type === 'nfl' ? 'Points For' : 'Pts For'} value={stats.pointsFor} />}
                {stats.pointsAgainst != null && <StatBox label={type === 'nfl' ? 'Points Against' : 'Pts Against'} value={stats.pointsAgainst} />}
                {stats.streak && <StatBox label="Streak" value={stats.streak} />}
                {stats.winPct && <StatBox label="Win %" value={stats.winPct} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ textAlign: 'center', padding: 20, color: T.textDim, fontFamily: T.fontBd, fontSize: 13 }}>
            Detailed season statistics will appear here when connected to the API-Sports data feed.
          </div>
        )}
      </div>
    </WidgetBox>
  )
}

const RecordBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: T.radiusSm,
      padding: '10px 12px',
      border: `1px solid ${T.borderLight}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <span style={{
          fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
          color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.3,
        }}>{label}</span>
        <span style={{
          fontFamily: T.fontHd, fontSize: 14, fontWeight: 800,
          color, lineHeight: 1,
        }}>{value}</span>
      </div>
      <div style={{
        height: 4, borderRadius: 2, background: T.border,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 2,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

const StatBox = ({ label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    borderRadius: T.radiusSm,
    padding: '12px',
    border: `1px solid ${T.borderLight}`,
    textAlign: 'center',
  }}>
    <div style={{
      fontFamily: T.fontHd, fontSize: 20, fontWeight: 800,
      color: T.white, lineHeight: 1,
    }}>{value}</div>
    <div style={{
      fontFamily: T.fontCd, fontSize: 9.5, fontWeight: 600,
      color: T.textDim, textTransform: 'uppercase',
      letterSpacing: 0.3, marginTop: 4,
    }}>{label}</div>
  </div>
)


/* ═══════════════════════════════════════════════════════════════
   5. H2H WIDGET, Head-to-head comparison
   Replicates: API-Sports "H2H" widget
   ═══════════════════════════════════════════════════════════════ */

/**
 * H2HWidget, Head to head comparison between two teams.
 * Props:
 *   team1: { displayName, logo/logos, color }
 *   team2: { displayName, logo/logos, color }
 *   recentGames: Array of { date, home, away, homeScore, awayScore, competition }
 *   stats: { team1Wins, team2Wins, draws, totalGames }
 */
export const H2HWidget = ({
  team1 = {},
  team2 = {},
  recentGames = [],
  stats = {},
}) => {
  const t1Name = team1.displayName || team1.shortDisplayName || 'Team 1'
  const t2Name = team2.displayName || team2.shortDisplayName || 'Team 2'
  const t1Logo = team1.logos?.[0]?.href || team1.logo || ''
  const t2Logo = team2.logos?.[0]?.href || team2.logo || ''
  const t1Color = team1.color ? `#${team1.color}` : T.accent
  const t2Color = team2.color ? `#${team2.color}` : T.blue

  const total = stats.totalGames || (stats.team1Wins || 0) + (stats.team2Wins || 0) + (stats.draws || 0)
  const t1Pct = total > 0 ? ((stats.team1Wins || 0) / total) * 100 : 0
  const t2Pct = total > 0 ? ((stats.team2Wins || 0) / total) * 100 : 0
  const drawPct = total > 0 ? ((stats.draws || 0) / total) * 100 : 0

  return (
    <WidgetBox>
      <WidgetHeader title="Head to Head" icon="⚔️" />

      {/* Teams comparison hero */}
      <div style={{
        padding: '24px 16px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {t1Logo ? (
              <img src={t1Logo} alt={t1Name} style={{ width: 48, height: 48, objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 12, background: t1Color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontHd, fontSize: 16, fontWeight: 800, color: T.white }}>
                {(team1.abbreviation || '?').slice(0, 3)}
              </div>
            )}
            <span style={{ fontFamily: T.fontHd, fontSize: 12, fontWeight: 700, color: T.white, textAlign: 'center' }}>{t1Name}</span>
          </div>

          <div style={{
            fontFamily: T.fontHd, fontSize: 16, fontWeight: 800,
            color: T.textDim,
          }}>VS</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {t2Logo ? (
              <img src={t2Logo} alt={t2Name} style={{ width: 48, height: 48, objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 12, background: t2Color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontHd, fontSize: 16, fontWeight: 800, color: T.white }}>
                {(team2.abbreviation || '?').slice(0, 3)}
              </div>
            )}
            <span style={{ fontFamily: T.fontHd, fontSize: 12, fontWeight: 700, color: T.white, textAlign: 'center' }}>{t2Name}</span>
          </div>
        </div>

        {/* Win distribution bar */}
        {total > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 6,
            }}>
              <span style={{ fontFamily: T.fontCd, fontSize: 12, fontWeight: 800, color: t1Color }}>
                {stats.team1Wins || 0} wins
              </span>
              {(stats.draws || 0) > 0 && (
                <span style={{ fontFamily: T.fontCd, fontSize: 11, fontWeight: 700, color: T.textDim }}>
                  {stats.draws} draws
                </span>
              )}
              <span style={{ fontFamily: T.fontCd, fontSize: 12, fontWeight: 800, color: t2Color }}>
                {stats.team2Wins || 0} wins
              </span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
              <div style={{ width: `${t1Pct}%`, background: t1Color, transition: 'width 0.6s ease' }} />
              {drawPct > 0 && <div style={{ width: `${drawPct}%`, background: T.textDim, transition: 'width 0.6s ease' }} />}
              <div style={{ width: `${t2Pct}%`, background: t2Color, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{
              textAlign: 'center', marginTop: 6,
              fontFamily: T.fontCd, fontSize: 10, fontWeight: 600,
              color: T.textDim, letterSpacing: 0.3,
            }}>{total} total matches</div>
          </div>
        )}
      </div>

      {/* Recent matches */}
      {recentGames.length > 0 && (
        <div>
          <div style={{
            padding: '10px 16px',
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
            fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
            color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
            background: T.surface2,
          }}>Recent Matches</div>
          {recentGames.slice(0, 6).map((game, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center', padding: '10px 16px',
              borderBottom: `1px solid ${T.borderLight}`,
            }}>
              <span style={{
                fontFamily: T.fontHd, fontSize: 12, fontWeight: 600,
                color: T.white, textAlign: 'right',
              }}>{game.home}</span>
              <span style={{
                fontFamily: T.fontHd, fontSize: 14, fontWeight: 800,
                color: T.accent, padding: '0 12px', letterSpacing: 2,
              }}>{game.homeScore} - {game.awayScore}</span>
              <span style={{
                fontFamily: T.fontHd, fontSize: 12, fontWeight: 600,
                color: T.white,
              }}>{game.away}</span>
            </div>
          ))}
        </div>
      )}
    </WidgetBox>
  )
}


/* ═══════════════════════════════════════════════════════════════
   6. SPORT WIDGET PANEL, Combined widget for a sport's landing tab
   Orchestrates LiveScoresWidget for different sports
   ═══════════════════════════════════════════════════════════════ */

/**
 * SportWidgetPanel, Drop-in replacement/supplement for SportPanel.
 * Uses the widget-style game cards instead of the existing MatchCard layout.
 * Props:
 *   activeSport: string (e.g. 'soccer', 'nfl')
 *   soccerData / leagueData: data from existing hooks
 *   currentTab: tab config object
 *   onMatchClick: callback
 */
/* ═══════════════════════════════════════════════════════════════
   STANDINGS POPUP, Modal overlay showing league table
   ═══════════════════════════════════════════════════════════════ */
const LEAGUE_SPORT_MAP = {
  'eng.1': 'soccer', 'esp.1': 'soccer', 'ger.1': 'soccer',
  'ita.1': 'soccer', 'fra.1': 'soccer', 'usa.1': 'soccer',
  'eng.fa': 'soccer', 'uefa.champions': 'soccer', 'uefa.europa': 'soccer',
  'nfl': 'football', 'nba': 'basketball', 'nhl': 'hockey', 'mlb': 'baseball',
}

const LEAGUE_ZONES = {
  'eng.1': { cl: [1, 4], el: [5, 5], conf: [6, 6], rel: [18, 20] },
  'esp.1': { cl: [1, 4], el: [5, 6], rel: [18, 20] },
  'ger.1': { cl: [1, 4], el: [5, 6], rel: [16, 18] },
  'ita.1': { cl: [1, 4], el: [5, 6], rel: [18, 20] },
  'fra.1': { cl: [1, 3], el: [4, 4], rel: [16, 18] },
}

// Map ESPN league IDs to soccer server leagueKey for API-Football proxy
const ESPN_TO_SOCCER_KEY = {
  'eng.1': 'premier_league',
  'esp.1': 'la_liga',
  'ger.1': 'bundesliga',
  'ita.1': 'serie_a',
  'fra.1': 'ligue_1',
}

const SOCCER_API_URL = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'

// Client-side standings cache — prevents redundant API calls when re-opening popups
const _standingsCache = {}
const STANDINGS_CLIENT_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

const StandingsPopup = ({ league, onClose }) => {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableName, setTableName] = useState('')

  useEffect(() => {
    if (!league) return
    const fetchStandings = async () => {
      const cacheKey = league.league
      const cached = _standingsCache[cacheKey]
      if (cached && Date.now() - cached.ts < STANDINGS_CLIENT_CACHE_TTL) {
        setStandings(cached.entries)
        setTableName(cached.name)
        setLoading(false)
        return
      }

      setLoading(true)
      const sportType = LEAGUE_SPORT_MAP[league.league] || 'soccer'
      const soccerKey = ESPN_TO_SOCCER_KEY[league.league]

      // For soccer leagues, use the soccer server proxy (avoids CORS)
      if (sportType === 'soccer' && soccerKey) {
        try {
          const res = await fetch(`${SOCCER_API_URL}/api/v1/leagues/real-standings/${soccerKey}`)
          if (res.ok) {
            const json = await res.json()
            if (json.success && json.data && json.data.length > 0) {
              const entries = json.data.map((team) => ({
                team: {
                  id: team.teamId,
                  displayName: team.teamName,
                  shortDisplayName: team.teamName,
                  logos: team.teamLogo ? [{ href: team.teamLogo }] : [],
                },
                _description: team.description || '',
                stats: [
                  { name: 'gamesPlayed', displayValue: String(team.played || 0) },
                  { name: 'wins', displayValue: String(team.wins || 0) },
                  { name: 'draws', displayValue: String(team.draws || 0) },
                  { name: 'losses', displayValue: String(team.losses || 0) },
                  { name: 'pointsFor', displayValue: String(team.goalsFor || 0) },
                  { name: 'pointsAgainst', displayValue: String(team.goalsAgainst || 0) },
                  { name: 'pointDifferential', displayValue: String(team.goalDifference || 0) },
                  { name: 'points', displayValue: String(team.points || 0) },
                ],
              }))
              _standingsCache[cacheKey] = { entries, name: league.name, ts: Date.now() }
              setStandings(entries)
              setTableName(league.name)
              setLoading(false)
              return
            }
          }
        } catch (err) {
          console.warn('[Standings] Soccer proxy error:', err.message)
        }
      }

      // Fallback: ESPN direct fetch (works for US sports, CORS-blocked for soccer)
      const espnSport = sportType === 'soccer' ? 'soccer' : sportType
      const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/${league.league}/standings`
      let data = null
      try {
        const res = await fetch(url)
        if (res.ok) data = await res.json()
        else console.warn('[Standings] ESPN returned', res.status, 'for', url)
      } catch (err) {
        console.warn('[Standings] Failed to fetch standings:', err.message)
      }

      if (data) {
        const extractEntries = (node) => {
          if (!node) return []
          if (Array.isArray(node.entries)) return node.entries
          if (node.standings && !Array.isArray(node.standings)) {
            if (Array.isArray(node.standings.entries)) return node.standings.entries
            const fromStandings = extractEntries(node.standings)
            if (fromStandings.length) return fromStandings
          }
          if (Array.isArray(node.standings)) {
            for (const s of node.standings) {
              const entries = extractEntries(s)
              if (entries?.length) return entries
            }
          }
          if (Array.isArray(node.children)) {
            for (const c of node.children) {
              const entries = extractEntries(c)
              if (entries?.length) return entries
            }
          }
          return []
        }

        const entries = extractEntries(data)
        _standingsCache[cacheKey] = { entries, name: data?.name || data?.season?.displayName || league.name, ts: Date.now() }
        setStandings(entries)
        setTableName(data?.name || data?.season?.displayName || league.name)
      }
      setLoading(false)
    }
    fetchStandings()
  }, [league])

  if (!league) return null

  const sportType = LEAGUE_SPORT_MAP[league.league] || 'soccer'
  const isSoccer = sportType === 'soccer'
  const zones = LEAGUE_ZONES[league.league] || {}

  // Get stat value
  const getStat = (entry, key) => {
    if (!entry?.stats) return '—'
    const s = entry.stats.find(st => st.name === key || st.abbreviation === key)
    return s?.displayValue ?? s?.value ?? '—'
  }

  const getZoneColor = (rank, entry) => {
    // Prefer the API-Football description field (dynamic, per-season accurate)
    const desc = (entry?._description || '').toLowerCase()
    if (desc) {
      if (desc.includes('champions league') || desc.includes('promotion - champions')) return T.accent
      if (desc.includes('europa league') || desc.includes('promotion - europa')) return T.blue
      if (desc.includes('conference') || desc.includes('promotion - conference')) return '#8B5CF6'
      if (desc.includes('relegation')) return T.red
    }
    // Fallback to hardcoded position ranges
    if (zones.cl && rank >= zones.cl[0] && rank <= zones.cl[1]) return T.accent
    if (zones.el && rank >= zones.el[0] && rank <= zones.el[1]) return T.blue
    if (zones.conf && rank >= zones.conf[0] && rank <= zones.conf[1]) return '#8B5CF6'
    if (zones.rel && rank >= zones.rel[0] && rank <= zones.rel[1]) return T.red
    return 'transparent'
  }

  const cols = isSoccer
    ? [
        { key: 'gamesPlayed', label: 'MP', w: 30 },
        { key: 'wins', label: 'W', w: 26 },
        { key: 'draws', label: 'D', w: 26 },
        { key: 'losses', label: 'L', w: 26 },
        { key: 'pointsFor', label: 'GF', w: 30 },
        { key: 'pointsAgainst', label: 'GA', w: 30 },
        { key: 'pointDifferential', label: 'GD', w: 30 },
        { key: 'points', label: 'PTS', w: 34, bold: true },
      ]
    : [
        { key: 'wins', label: 'W', w: 30 },
        { key: 'losses', label: 'L', w: 30 },
        { key: 'winPercent', label: 'PCT', w: 40 },
        { key: 'pointsFor', label: 'PF', w: 34 },
        { key: 'pointsAgainst', label: 'PA', w: 34 },
      ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'widgetFadeIn 0.2s ease',
    }} onClick={onClose}>
      <style>{`@keyframes widgetFadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes widgetSlideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '92%', maxWidth: 620, maxHeight: '82vh',
        background: `linear-gradient(180deg, ${T.surface2}, ${T.bg})`,
        border: `1px solid ${T.border}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'widgetSlideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
          background: T.surface2,
        }}>
          <span style={{
            fontFamily: T.fontHd, fontSize: 15, fontWeight: 800, color: T.white,
          }}>{league.emoji} {league.name} Standings</span>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.borderLight}`,
            borderRadius: 8, width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: T.textDim, cursor: 'pointer', fontSize: 14,
          }}>&times;</button>
        </div>

        {/* Table */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 60, gap: 12,
            }}>
              <div style={{
                width: 20, height: 20, border: `2px solid ${T.border}`,
                borderTopColor: T.accent, borderRadius: '50%',
                animation: 'widgetSpin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: T.fontBd, fontSize: 13, color: T.textDim }}>
                Loading standings...
              </span>
            </div>
          ) : standings.length === 0 ? (
            <div style={{
              padding: 48, textAlign: 'center',
              fontFamily: T.fontBd, fontSize: 13, color: T.textDim,
            }}>No standings available for this league</div>
          ) : (
            <>
              {/* Column headers */}
              <div style={{
                display: 'flex', alignItems: 'center', padding: '8px 16px',
                borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)',
                position: 'sticky', top: 0, zIndex: 1,
              }}>
                <span style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, width: 28, textAlign: 'center', letterSpacing: 0.3 }}>#</span>
                <span style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, flex: 1, paddingLeft: 8, letterSpacing: 0.3 }}>TEAM</span>
                {cols.map(c => (
                  <span key={c.key} style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, width: c.w, textAlign: 'center', letterSpacing: 0.3 }}>{c.label}</span>
                ))}
              </div>

              {/* Rows */}
              {standings.map((entry, idx) => {
                const rank = idx + 1
                const team = entry.team || {}
                const logo = team.logos?.[0]?.href || ''
                return (
                  <div key={team.id || idx} style={{
                    display: 'flex', alignItems: 'center', padding: '9px 16px',
                    borderBottom: `1px solid ${T.borderLight}`,
                    borderLeft: `3px solid ${getZoneColor(rank, entry)}`,
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontFamily: T.fontCd, fontSize: 12, fontWeight: 700, color: rank <= 1 ? T.gold : T.textSecondary, width: 28, textAlign: 'center' }}>
                      {rank}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, paddingLeft: 8, minWidth: 0 }}>
                      {logo && <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                      <span style={{
                        fontFamily: T.fontHd, fontSize: 12, fontWeight: 700, color: T.white,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {team.shortDisplayName || team.displayName || '—'}
                      </span>
                    </div>
                    {cols.map(c => (
                      <span key={c.key} style={{
                        fontFamily: T.fontCd, fontSize: c.bold ? 12 : 11,
                        fontWeight: c.bold ? 800 : 600,
                        color: c.bold ? T.accent : T.textPrimary,
                        width: c.w, textAlign: 'center',
                      }}>
                        {getStat(entry, c.key)}
                      </span>
                    ))}
                  </div>
                )
              })}

              {/* Zone legend for soccer */}
              {isSoccer && Object.keys(zones).length > 0 && (
                <div style={{
                  display: 'flex', gap: 14, padding: '10px 16px',
                  borderTop: `1px solid ${T.border}`, background: T.surface2,
                  flexWrap: 'wrap',
                }}>
                  {zones.cl && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.fontCd, fontSize: 9, color: T.textDim }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.accent }} /> Champions League</span>}
                  {zones.el && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.fontCd, fontSize: 9, color: T.textDim }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.blue }} /> Europa League</span>}
                  {zones.conf && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.fontCd, fontSize: 9, color: T.textDim }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#8B5CF6' }} /> Conf. League</span>}
                  {zones.rel && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.fontCd, fontSize: 9, color: T.textDim }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.red }} /> Relegation</span>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   TOP PERFORMERS POPUP — SAM Ranking modal
   Shows top 20 players with stats + SAM metric points
   Works for both soccer (via soccer server) and NFL (via NFL server)
   ═══════════════════════════════════════════════════════════════ */

const NFL_API_URL = process.env.REACT_APP_API_URL || 'https://backend.samsports.io'

// Map API-Football league IDs to soccer server leagueKey
const AF_ID_TO_LEAGUE_KEY = {
  39: 'premier_league',
  140: 'la_liga',
  78: 'bundesliga',
  135: 'serie_a',
  61: 'ligue_1',
}

const TopPerformersPopup = ({ league, sport, onClose }) => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!league && sport !== 'nfl') return
    const fetchPlayers = async () => {
      setLoading(true)
      try {
        if (sport === 'nfl') {
          // NFL: use NFL server public endpoint
          const res = await fetch(`${NFL_API_URL}/nfl-top-performers?limit=20`)
          if (res.ok) {
            const json = await res.json()
            if (json.success && json.data) {
              setPlayers(json.data.map(p => ({
                rank: p.rank,
                name: p.name,
                position: p.position,
                team: p.team,
                photo: p.photo,
                samPoints: p.totalScore,
                ppg: p.ppg,
                gamesPlayed: p.gamesPlayed,
                stat1: p.totalScore,
                stat1Label: 'Total',
                stat2: p.ppg,
                stat2Label: 'PPG',
                stat3: p.bestWeek,
                stat3Label: 'Best Wk',
                stat4: p.gamesPlayed,
                stat4Label: 'GP',
              })))
            }
          }
        } else {
          // Soccer: use soccer server public endpoint
          const leagueKey = AF_ID_TO_LEAGUE_KEY[league.league] || ESPN_TO_SOCCER_KEY[league.league]
          if (!leagueKey) return
          const res = await fetch(`${SOCCER_API_URL}/api/v1/players/top?limit=20&realLeague=${leagueKey}&sortBy=points`)
          if (res.ok) {
            const json = await res.json()
            if (json.success && json.data) {
              setPlayers(json.data.map((p, idx) => ({
                rank: idx + 1,
                name: p.displayName,
                position: p.primaryPosition,
                team: p.realClub,
                photo: p.photo,
                samPoints: p.fantasyPointsTotal || 0,
                ppg: p.fantasyPointsAvg || 0,
                gamesPlayed: p.appearances || 0,
                stat1: p.fantasyPointsTotal || 0,
                stat1Label: 'SAM Pts',
                stat2: p.fantasyPointsAvg ? Math.round(p.fantasyPointsAvg * 10) / 10 : 0,
                stat2Label: 'PPG',
                stat3: p.goalsScored || 0,
                stat3Label: 'Goals',
                stat4: p.assists || 0,
                stat4Label: 'Assists',
              })))
            }
          }
        }
      } catch (err) {
        console.warn('[TopPerformers] Error:', err.message)
      }
      setLoading(false)
    }
    fetchPlayers()
  }, [league, sport])

  const title = sport === 'nfl'
    ? '🏈 A.Football Top Performers'
    : `${league?.emoji || '⚽'} ${league?.name || 'Soccer'} — SAM Ranking`

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'widgetFadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '92%', maxWidth: 660, maxHeight: '82vh',
        background: `linear-gradient(180deg, ${T.surface2}, ${T.bg})`,
        border: `1px solid ${T.border}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'widgetSlideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
          background: T.surface2,
        }}>
          <span style={{
            fontFamily: T.fontHd, fontSize: 15, fontWeight: 800, color: T.white,
          }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.borderLight}`,
            borderRadius: 8, width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: T.textDim, cursor: 'pointer', fontSize: 14,
          }}>&times;</button>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '8px 14px',
          borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)',
          position: 'sticky', top: 0, zIndex: 1,
        }}>
          <span style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, width: 26, textAlign: 'center' }}>#</span>
          <span style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, flex: 1, paddingLeft: 6 }}>PLAYER</span>
          <span style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, width: 36, textAlign: 'center' }}>POS</span>
          {players[0] && ['stat1Label', 'stat2Label', 'stat3Label', 'stat4Label'].map((key, i) => (
            <span key={i} style={{ fontFamily: T.fontCd, fontSize: 9, fontWeight: 700, color: T.textDim, width: 48, textAlign: 'center' }}>
              {players[0][key]}
            </span>
          ))}
        </div>

        {/* Player rows */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 60, gap: 12,
            }}>
              <div style={{
                width: 20, height: 20, border: `2px solid ${T.border}`,
                borderTopColor: T.accent, borderRadius: '50%',
                animation: 'widgetSpin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: T.fontBd, fontSize: 13, color: T.textDim }}>
                Loading top performers...
              </span>
            </div>
          ) : players.length === 0 ? (
            <div style={{
              padding: 48, textAlign: 'center',
              fontFamily: T.fontBd, fontSize: 13, color: T.textDim,
            }}>No ranking data available yet</div>
          ) : (
            players.map((p, idx) => {
              const isTop3 = idx < 3
              const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 14px',
                  borderBottom: `1px solid ${T.borderLight}`,
                  borderLeft: isTop3 ? `3px solid ${medalColors[idx]}` : '3px solid transparent',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Rank */}
                  <span style={{
                    fontFamily: T.fontCd, fontSize: 12, fontWeight: 800,
                    color: isTop3 ? medalColors[idx] : T.textDim,
                    width: 26, textAlign: 'center',
                  }}>{p.rank}</span>

                  {/* Photo + Name + Team */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 2, minWidth: 0 }}>
                    {p.photo ? (
                      <img src={p.photo} alt="" style={{
                        width: 30, height: 30, borderRadius: '50%', objectFit: 'cover',
                        background: T.surface2, border: `1px solid ${T.borderLight}`,
                      }} onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: T.surface2, border: `1px solid ${T.borderLight}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: T.fontCd, fontSize: 10, color: T.textDim,
                      }}>{(p.name || '?')[0]}</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: T.fontBd, fontSize: 12, fontWeight: 700, color: T.white,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: 160,
                      }}>{p.name}</div>
                      <div style={{
                        fontFamily: T.fontCd, fontSize: 9, color: T.textDim,
                      }}>{p.team}</div>
                    </div>
                  </div>

                  {/* Position */}
                  <span style={{
                    fontFamily: T.fontCd, fontSize: 10, fontWeight: 700,
                    color: T.accent, width: 36, textAlign: 'center',
                    background: 'rgba(34,197,94,0.1)', borderRadius: 4, padding: '2px 0',
                  }}>{p.position}</span>

                  {/* Stats */}
                  {[p.stat1, p.stat2, p.stat3, p.stat4].map((val, i) => (
                    <span key={i} style={{
                      fontFamily: T.fontCd, fontSize: 11,
                      fontWeight: i === 0 ? 800 : 600,
                      color: i === 0 ? T.accent : T.white,
                      width: 48, textAlign: 'center',
                    }}>{typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(1)) : val}</span>
                  ))}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px', borderTop: `1px solid ${T.border}`,
          background: T.surface2, textAlign: 'center',
        }}>
          <span style={{ fontFamily: T.fontCd, fontSize: 9, color: T.textDim, letterSpacing: 0.3 }}>
            SAM SPORTS METRIC — Top 20 Performers by SAM Points
          </span>
        </div>
      </div>
    </div>
  )
}


export const SportWidgetPanel = ({
  activeSport,
  currentTab,
  soccerData,
  tennisData,
  leagueData,
  onMatchClick,
}) => {
  const [popupLeague, setPopupLeague] = useState(null)
  const [rankingPopup, setRankingPopup] = useState(null)
  const isSoccer = activeSport === 'soccer'
  const isTennis = activeSport === 'tennis'
  const isMultiLeague = isSoccer || isTennis

  const isLoading = isSoccer
    ? soccerData?.loading
    : isTennis
      ? tennisData?.loading
      : leagueData?.loading

  // Build league groups
  let leagueGroups = []

  if (isMultiLeague) {
    const multiData = isSoccer ? soccerData : tennisData
    if (multiData?.leagues) {
      leagueGroups = multiData.leagues
        .filter(item => item.events?.length > 0)
        .map(item => ({
          name: item.lg.name,
          emoji: item.lg.emoji || (isSoccer ? '⚽' : '🎾'),
          events: item.events || [],
          sport: isSoccer ? 'soccer' : 'tennis',
          league: item.lg.id,
        }))
    }
  } else if (leagueData?.events) {
    const leagueName = leagueData.leagueName || currentTab?.label || activeSport.charAt(0).toUpperCase() + activeSport.slice(1)
    const emoji = currentTab?.emoji || leagueData.emoji || '🏆'
    leagueGroups = [{
      name: leagueName,
      emoji,
      events: leagueData.events,
      sport: currentTab?.sport || activeSport,
      league: currentTab?.league || leagueData.league || activeSport,
    }]
  }

  const hasMatches = leagueGroups.some(lb => lb.events?.length > 0)

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 60, color: T.textDim,
      }}>
        <div style={{
          width: 24, height: 24, border: `2px solid ${T.border}`,
          borderTopColor: T.accent, borderRadius: '50%',
          animation: 'widgetSpin 0.8s linear infinite',
        }} />
        <span style={{ marginLeft: 12, fontFamily: T.fontBd, fontSize: 13 }}>Loading matches...</span>
      </div>
    )
  }

  if (!hasMatches) {
    return (
      <WidgetBox style={{ padding: '40px 20px', textAlign: 'center' }}>
        <span style={{
          fontFamily: T.fontBd, fontSize: 14, color: T.textDim,
        }}>No matches available for this date</span>
      </WidgetBox>
    )
  }

  // Soccer leagues that have SAM ranking data
  const SAM_RANKING_LEAGUES = [39, 140, 78, 135, 61] // EPL, La Liga, Bundesliga, Serie A, Ligue 1
  const hasSamRanking = (lg) => {
    if (lg.sport === 'nfl' || lg.sport === 'football') return true
    if (lg.sport === 'soccer') return SAM_RANKING_LEAGUES.includes(lg.league)
    return false
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {leagueGroups.map(lg => (
        <LiveScoresWidget
          key={lg.league}
          events={lg.events}
          leagueName={lg.name}
          emoji={lg.emoji}
          onGameClick={(eventId) => onMatchClick?.(eventId, lg.sport, lg.league, lg.name)}
          onLeagueClick={() => setPopupLeague(lg)}
          onRankingClick={hasSamRanking(lg) ? () => setRankingPopup(lg) : undefined}
        />
      ))}
      {popupLeague && (
        <StandingsPopup
          league={popupLeague}
          onClose={() => setPopupLeague(null)}
        />
      )}
      {rankingPopup && (
        <TopPerformersPopup
          league={rankingPopup}
          sport={rankingPopup.sport === 'football' ? 'nfl' : rankingPopup.sport}
          onClose={() => setRankingPopup(null)}
        />
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   CSS Keyframes, injected once
   ═══════════════════════════════════════════════════════════════ */
const WIDGET_CSS = `
@keyframes widgetPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes widgetSpin {
  to { transform: rotate(360deg); }
}
`

// Inject CSS once
if (typeof document !== 'undefined') {
  const existing = document.getElementById('samsports-widget-css')
  if (!existing) {
    const style = document.createElement('style')
    style.id = 'samsports-widget-css'
    style.textContent = WIDGET_CSS
    document.head.appendChild(style)
  }
}


/* ═══════════════════════════════════════════════════════════════
   Exports
   ═══════════════════════════════════════════════════════════════ */
export {
  CircleGauge,
  StatBar,
  TabStrip,
  WidgetBox,
  WidgetHeader,
  GameRow,
}
