import React from 'react'
import dayjs from 'dayjs'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

const MatchUpOfTheWeek = ({ data: v }) => {
  const navigate = useNavigate()

  const goToGame = () => {
    navigate('/game-details', {
      state: {
        team1: v?.opponentOne,
        team2: v?.opponentTwo,
        scoreOne: v?.scoreOne || null,
        scoreTwo: v?.scoreTwo || null,
      },
    })
  }

  const r1 = v?.record?.teamOne || {}
  const r2 = v?.record?.teamTwo || {}

  return (
    <div className='motw-card' onClick={goToGame}>
      {/* Top bar */}
      <div className='motw-top'>
        <span className='motw-badge'>Featured Matchup</span>
        <span className='motw-date'>
          {v?.matchStartDate
            ? dayjs(v.matchStartDate).format('ddd, MMM D YYYY')
            : '—'}
        </span>
      </div>

      {/* Matchup area */}
      <div className='motw-matchup'>
        {/* Team 1 */}
        <div className='motw-side'>
          <div className='motw-logo-wrap'>
            {v?.opponentOne?.logo ? (
              <img src={v.opponentOne.logo} alt='' className='motw-logo' />
            ) : (
              <div className='motw-logo-ph'>
                {(v?.opponentOne?.name || '?').charAt(0)}
              </div>
            )}
          </div>
          <span className='motw-team-name'>{v?.opponentOne?.name || 'TBD'}</span>
          {(r1.win != null || r1.lose != null) && (
            <span className='motw-record'>
              {r1.win ?? 0}-{r1.lose ?? 0}
              {r1.avgPf ? ` · ${r1.avgPf.toFixed(1)} PPG` : ''}
            </span>
          )}
        </div>

        {/* Score / VS center */}
        <div className='motw-center'>
          <div className='motw-scores'>
            <span className='motw-score'>{v?.scoreOne ?? 0}</span>
            <span className='motw-vs'>VS</span>
            <span className='motw-score'>{v?.scoreTwo ?? 0}</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className='motw-side'>
          <div className='motw-logo-wrap'>
            {v?.opponentTwo?.logo ? (
              <img src={v.opponentTwo.logo} alt='' className='motw-logo' />
            ) : (
              <div className='motw-logo-ph'>
                {(v?.opponentTwo?.name || '?').charAt(0)}
              </div>
            )}
          </div>
          <span className='motw-team-name'>{v?.opponentTwo?.name || 'TBD'}</span>
          {(r2.win != null || r2.lose != null) && (
            <span className='motw-record'>
              {r2.win ?? 0}-{r2.lose ?? 0}
              {r2.avgPf ? ` · ${r2.avgPf.toFixed(1)} PPG` : ''}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className='motw-footer'>
        <span>View Game Details</span>
        <BiRightArrowAlt size={16} />
      </div>
    </div>
  )
}

export default MatchUpOfTheWeek
