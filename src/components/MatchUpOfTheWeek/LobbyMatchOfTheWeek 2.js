import React from 'react'

const LobbyMatchOfTheWeek = ({ data: v }) => {
  const s1 = parseFloat(v?.scoreOne) || 0
  const s2 = parseFloat(v?.scoreTwo) || 0
  const t1Winning = s1 > s2
  const t2Winning = s2 > s1
  const isTied = s1 === s2

  return (
    <div className='lmw-matchup'>
      {/* Team 1 */}
      <div className={`lmw-team ${t1Winning ? 'lmw-team-leading' : ''}`}>
        <div className='lmw-logo-ring'>
          {v?.opponentOne?.logo ? (
            <img src={v.opponentOne.logo} alt='' className='lmw-logo' />
          ) : (
            <div className='lmw-logo-fallback'>
              {(v?.opponentOne?.name || '?').charAt(0)}
            </div>
          )}
        </div>
        <span className='lmw-team-name'>
          {v?.opponentOne?.name || 'Team 1'}
        </span>
      </div>

      {/* Scoreboard */}
      <div className='lmw-score-block'>
        <div className='lmw-scores'>
          <span className={`lmw-score ${t1Winning ? 'lmw-score-win' : ''}`}>
            {s1.toFixed(2)}
          </span>
          <span className='lmw-score-divider'>—</span>
          <span className={`lmw-score ${t2Winning ? 'lmw-score-win' : ''}`}>
            {s2.toFixed(2)}
          </span>
        </div>
        {!isTied && (s1 > 0 || s2 > 0) && (
          <span className='lmw-status'>
            {t1Winning ? v?.opponentOne?.name : v?.opponentTwo?.name} leads
          </span>
        )}
        {isTied && s1 > 0 && (
          <span className='lmw-status'>Tied</span>
        )}
      </div>

      {/* Team 2 */}
      <div className={`lmw-team ${t2Winning ? 'lmw-team-leading' : ''}`}>
        <div className='lmw-logo-ring'>
          {v?.opponentTwo?.logo ? (
            <img src={v.opponentTwo.logo} alt='' className='lmw-logo' />
          ) : (
            <div className='lmw-logo-fallback'>
              {(v?.opponentTwo?.name || '?').charAt(0)}
            </div>
          )}
        </div>
        <span className='lmw-team-name'>
          {v?.opponentTwo?.name || 'Team 2'}
        </span>
      </div>
    </div>
  )
}

export default LobbyMatchOfTheWeek
