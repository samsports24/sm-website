import React from 'react'
import { ratingColor } from './samMetricCalc'

/* ═══════════════════════════════════════════════════════════
   FormationPitch v2 — Redesigned for clarity
   Larger player circles, bigger fonts, cleaner badge layout,
   better spacing between players on the pitch.
   ═══════════════════════════════════════════════════════════ */

/* Map a formation string like "4-3-3" into rows of player counts.
   GK is always 1 row at the back, then the formation groups. */
const parseFormation = (formation, playerCount) => {
  if (formation) {
    const parts = formation.split('-').map(Number).filter(Boolean)
    if (parts.length > 0) return [1, ...parts]
  }
  if (playerCount >= 11) return [1, 4, 3, 3]
  if (playerCount >= 7)  return [1, 3, 2, 1]
  return [1, Math.max(1, (playerCount || 1) - 1)]
}

/* Position rows on the pitch half (0=GK line, 1=top).
   Spread evenly across the half with more breathing room. */
const getRowY = (rowIdx, totalRows, isHome) => {
  const minY = 7
  const maxY = 45
  const step = totalRows > 1 ? (maxY - minY) / (totalRows - 1) : 0
  const y = minY + rowIdx * step
  return isHome ? (100 - y) : y
}

/* Distribute players evenly across the row width */
const getPlayerX = (playerIdx, playersInRow) => {
  if (playersInRow === 1) return 50
  const margin = 12
  const width = 100 - 2 * margin
  const step = width / (playersInRow - 1)
  return margin + playerIdx * step
}

/* Shorten "Kylian Mbappé" → "K. Mbappé" */
const shortName = (name) => {
  if (!name) return '—'
  const parts = name.trim().split(' ')
  if (parts.length <= 1) return name
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`
}

/* Single player on the pitch */
const PitchPlayer = ({ x, y, number, name, isHome, events, samScore }) => {
  const bgColor = isHome ? '#22C55E' : '#3B82F6'
  const hasGoal = events?.some(e => e.type === 'Goal' && e.detail !== 'Missed Penalty')
  const hasYellow = events?.some(e => e.type === 'Card' && e.detail?.includes('Yellow'))
  const hasRed = events?.some(e => e.type === 'Card' && e.detail === 'Red Card')
  const wasSub = events?.some(e => e.type === 'subst')

  const rc = samScore ? ratingColor(samScore.rating) : null
  const hasRating = samScore && samScore.rating > 0

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      zIndex: 2,
      width: 72,
    }}>
      {/* Player circle with number */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--ls-font-cd)',
          fontSize: 12,
          fontWeight: 800,
          color: '#000',
          border: '2px solid rgba(255,255,255,0.4)',
          boxShadow: `0 2px 10px ${bgColor}66`,
        }}>
          {number || ''}
        </div>

        {/* SAM rating badge — anchored top-right of circle */}
        {hasRating && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -14,
            fontFamily: 'var(--ls-font-cd)',
            fontSize: 9.5,
            fontWeight: 800,
            color: '#000',
            background: rc,
            padding: '1px 5px',
            borderRadius: 4,
            lineHeight: 1.3,
            boxShadow: `0 1px 5px ${rc}88`,
            whiteSpace: 'nowrap',
          }}>
            {samScore.rating.toFixed(1)}
          </span>
        )}

        {/* Event badges — anchored top-left of circle */}
        {(hasGoal || hasYellow || hasRed || wasSub) && (
          <div style={{
            position: 'absolute',
            top: -5,
            left: -10,
            display: 'flex',
            gap: 2,
          }}>
            {hasGoal && <span style={S.eventBadge('#22C55E')}>G</span>}
            {hasYellow && <span style={{ ...S.cardBadge, background: '#EAB308' }} />}
            {hasRed && <span style={{ ...S.cardBadge, background: '#DC2626' }} />}
            {wasSub && <span style={S.eventBadge('#60A5FA')}>S</span>}
          </div>
        )}
      </div>

      {/* Player name */}
      <div style={{
        fontFamily: 'var(--ls-font-cd)',
        fontSize: 9,
        fontWeight: 700,
        color: '#fff',
        textAlign: 'center',
        maxWidth: 72,
        lineHeight: 1.2,
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {shortName(name)}
      </div>

      {/* SAM points below name */}
      {samScore && samScore.points !== 0 && (
        <div style={{
          fontFamily: 'var(--ls-font-cd)',
          fontSize: 8.5,
          fontWeight: 700,
          color: rc || 'var(--ls-gdim)',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          lineHeight: 1,
        }}>
          {samScore.points > 0 ? '+' : ''}{samScore.points} pts
        </div>
      )}
    </div>
  )
}

/* Pitch markings (SVG) */
const PitchSVG = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{
    position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0,
  }}>
    <rect x="2" y="1" width="96" height="98" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
    <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.12)" />
    <rect x="22" y="1" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <rect x="34" y="1" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <circle cx="50" cy="12" r="0.6" fill="rgba(255,255,255,0.12)" />
    <rect x="22" y="83" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <rect x="34" y="93" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <circle cx="50" cy="88" r="0.6" fill="rgba(255,255,255,0.12)" />
    <path d="M2,4 A3,3 0 0,1 5,1" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <path d="M95,1 A3,3 0 0,1 98,4" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <path d="M2,96 A3,3 0 0,0 5,99" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
    <path d="M95,99 A3,3 0 0,0 98,96" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
  </svg>
)

/* ── Main component ── */
const FormationPitch = ({ lineups, events, samScores }) => {
  if (!lineups?.length) return null

  const homeTeam = lineups[0]
  const awayTeam = lineups[1]

  // Build event lookup: player name → list of events
  const eventMap = {}
  ;(events || []).forEach(ev => {
    const pName = ev.player?.name
    const aName = ev.assist?.name
    if (pName) {
      if (!eventMap[pName]) eventMap[pName] = []
      eventMap[pName].push(ev)
    }
    if (aName && ev.type === 'subst') {
      if (!eventMap[aName]) eventMap[aName] = []
      eventMap[aName].push({ ...ev, type: 'subst' })
    }
  })

  const hasSAMData = samScores && samScores.size > 0

  const lookupSAM = (p) => {
    if (!samScores) return undefined
    if (p.id && samScores.has(p.id)) return samScores.get(p.id)
    if (p.name && samScores.has(p.name)) return samScores.get(p.name)
    return undefined
  }

  const renderTeamOnPitch = (team, isHome) => {
    if (!team?.startXI?.length) return null
    const rows = parseFormation(team.formation, team.startXI.length)
    const totalRows = rows.length
    let playerIdx = 0

    return rows.map((count, rowIdx) => {
      const players = []
      for (let j = 0; j < count && playerIdx < team.startXI.length; j++) {
        const entry = team.startXI[playerIdx]
        const p = entry.player || entry
        const x = getPlayerX(j, count)
        const y = getRowY(rowIdx, totalRows, isHome)
        players.push(
          <PitchPlayer
            key={`${isHome ? 'h' : 'a'}-${playerIdx}`}
            x={x}
            y={y}
            number={p.number}
            name={p.name}
            isHome={isHome}
            events={eventMap[p.name]}
            samScore={lookupSAM(p)}
          />
        )
        playerIdx++
      }
      return players
    })
  }

  const renderSubsList = (team, isHome) => {
    if (!team.substitutes?.length) return null
    const color = isHome ? '#22C55E' : '#3B82F6'
    return (
      <div style={{ padding: '10px 16px' }}>
        <div style={{
          fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700,
          color: 'var(--ls-gdim)', textTransform: 'uppercase', letterSpacing: 1,
          marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {team.team?.logo && <img src={team.team.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />}
          <span>Substitutes</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {team.substitutes.map((entry, i) => {
            const p = entry.player || entry
            const ss = lookupSAM(p)
            const rc = ss ? ratingColor(ss.rating) : null
            return (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--ls-font-cd)', fontSize: 11, color: 'var(--ls-gray)',
              }}>
                <span style={{ fontWeight: 800, color, fontSize: 10 }}>{p.number || '—'}</span>
                {shortName(p.name)}
                {ss && ss.rating > 0 && (
                  <span style={{
                    fontWeight: 800, fontSize: 9, color: '#000',
                    background: rc, padding: '1px 5px', borderRadius: 4,
                    marginLeft: 2,
                  }}>{ss.rating.toFixed(1)}</span>
                )}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Team headers */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', margin: '0 16px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '12px 12px 0 0',
        border: '1px solid rgba(255,255,255,0.04)', borderBottom: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {homeTeam.team?.logo && <img src={homeTeam.team.logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
          <span style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 13, fontWeight: 700, color: '#22C55E' }}>
            {homeTeam.team?.name}
          </span>
          {homeTeam.formation && <span style={{
            fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: '#22C55E',
            background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 8,
          }}>{homeTeam.formation}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {awayTeam?.formation && <span style={{
            fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: '#3B82F6',
            background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 8,
          }}>{awayTeam.formation}</span>}
          <span style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>
            {awayTeam?.team?.name}
          </span>
          {awayTeam?.team?.logo && <img src={awayTeam.team.logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
        </div>
      </div>

      {/* Pitch */}
      <div style={{
        position: 'relative',
        margin: '0 16px',
        paddingTop: '120%',
      }}>
        {/* Grass background + markings */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: 'linear-gradient(180deg, #1a472a 0%, #15522a 25%, #1a472a 50%, #15522a 75%, #1a472a 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderTop: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.015) 10%, transparent 10%, transparent 20%)',
          }} />
          <PitchSVG />
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '50%',
            background: 'rgba(59,130,246,0.04)',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%',
            background: 'rgba(34,197,94,0.04)',
          }} />
        </div>
        {/* Players layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {homeTeam && renderTeamOnPitch(homeTeam, true)}
          {awayTeam && renderTeamOnPitch(awayTeam, false)}
        </div>
      </div>

      {/* SAM scoring unavailable message */}
      {!hasSAMData && (
        <div style={{
          margin: '0 16px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderLeft: '3px solid var(--ls-gdim, #555)',
          fontFamily: 'var(--ls-font-cd)',
          fontSize: 11,
          color: 'var(--ls-gdim, #888)',
          lineHeight: 1.4,
        }}>
          SAM Metric scoring is not available for this game.
        </div>
      )}

      {/* Coach info */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '8px 16px', margin: '0 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none',
        borderRadius: '0 0 12px 12px',
      }}>
        {homeTeam.coach && (
          <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 10, color: 'var(--ls-gdim)' }}>
            Coach: <span style={{ color: 'var(--ls-wdim)', fontWeight: 600 }}>{homeTeam.coach.name}</span>
          </span>
        )}
        {awayTeam?.coach && (
          <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 10, color: 'var(--ls-gdim)', textAlign: 'right' }}>
            Coach: <span style={{ color: 'var(--ls-wdim)', fontWeight: 600 }}>{awayTeam.coach.name}</span>
          </span>
        )}
      </div>

      {/* Substitutes */}
      {renderSubsList(homeTeam, true)}
      {awayTeam && renderSubsList(awayTeam, false)}
    </div>
  )
}

/* ── Inline styles ── */
const S = {
  eventBadge: (color) => ({
    width: 14, height: 14, borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 8, fontWeight: 800, fontFamily: 'var(--ls-font-cd)',
    background: color, color: '#000',
  }),
  cardBadge: {
    width: 9, height: 12, borderRadius: 2,
  },
}

export default FormationPitch
