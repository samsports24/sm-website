import React from 'react'

/*
 * RaceCard — landing "Live & Upcoming" card for racing events (F1).
 * Racing has no home/away teams, so the standard MatchCard can't render it.
 * Built defensively around ESPN's racing/f1 scoreboard shape:
 *   event.name / shortName, event.date,
 *   event.competitions[0].venue.fullName (circuit),
 *   event.competitions[0].status.type { state, completed, description },
 *   event.competitions[0].competitors[] { athlete.displayName, order, winner }
 */
const fmtDate = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  } catch { return '' }
}

const RaceCard = ({ event }) => {
  if (!event) return null
  const comp = event.competitions?.[0] || {}
  const status = comp.status?.type || event.status?.type || {}
  const state = status.state // 'pre' | 'in' | 'post'
  const isLive = state === 'in'
  const isFinal = state === 'post' || status.completed === true

  const raceName = event.shortName || event.name || 'Grand Prix'
  const circuit = comp.venue?.fullName || comp.circuit?.fullName || ''
  const city = comp.venue?.address?.city || ''
  const location = [circuit, city].filter(Boolean).join(' · ')

  // Top finishers (only meaningful once the race is running / done)
  const competitors = Array.isArray(comp.competitors) ? [...comp.competitors] : []
  competitors.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99))
  const podium = (isLive || isFinal) ? competitors.slice(0, 3) : []

  const driverName = (c) =>
    c.athlete?.displayName || c.athlete?.shortName || c.displayName || c.athlete?.fullName || 'Driver'

  return (
    <div className={`ls-race-card${isLive ? ' ls-race-card--live' : ''}`}>
      <div className="ls-race-top">
        <span className="ls-race-flag" aria-hidden>🏁</span>
        <span className="ls-race-name">{raceName}</span>
        {isLive ? (
          <span className="ls-race-status ls-race-status--live"><span className="ls-race-dot" /> LIVE</span>
        ) : isFinal ? (
          <span className="ls-race-status ls-race-status--final">FINAL</span>
        ) : (
          <span className="ls-race-status">{fmtDate(event.date)}</span>
        )}
      </div>

      {location && <div className="ls-race-circuit">{location}</div>}

      {podium.length > 0 ? (
        <div className="ls-race-podium">
          {podium.map((c, i) => (
            <div key={c.id || i} className="ls-race-pos">
              <span className={`ls-race-p ls-race-p${i + 1}`}>P{i + 1}</span>
              <span className="ls-race-driver">{driverName(c)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ls-race-upcoming">
          {isFinal ? 'Result pending' : `Lights out ${fmtDate(event.date)}`}
        </div>
      )}
    </div>
  )
}

export default RaceCard
