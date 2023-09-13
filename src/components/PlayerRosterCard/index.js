import React from 'react'

import { Checkbox } from 'antd'

import { useNavigate } from 'react-router-dom'
import { isLocked } from '../../config/constants'

const PlayerRosterCard = ({ data, index, style, state, handleClick, isPractice = false }) => {
  const {
    players: {
      PlayerID,
      // _id,
      Name,
      pts,
      Age,
      Team,
      ByeWeek,
      PlayerRank,
      PlayerCap,
      Position,
      UpcomingGameOpponent,
    },
    // _id: lineupId,
  } = data
  const navigate = useNavigate()

  return (
    <div className='stats_card_container' style={style || null}>
      <header>
        <h3
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(`/player-interface/${PlayerID}`)
          }}
        >
          {index + 1}. &nbsp;&nbsp; {Name} ({Position})
        </h3>
        {isPractice ? (
          <Checkbox
            onChange={(event) => handleClick(event.target.checked, PlayerID)}
            checked={state?.includes(PlayerID)}
            disabled={isLocked()}
          >
            Protected
          </Checkbox>
        ) : (
          <Checkbox
            onChange={(event) => handleClick(event.target.checked, PlayerID)}
            checked={state?.includes(PlayerID)}
            disabled={isLocked()}
          >
            Non-Active
          </Checkbox>
        )}
      </header>

      <section className='center'>
        <div>
          <p className='text1'>PTS Per Game:</p>
          <p className='text2'>{pts || '-'}</p>
        </div>
        <div>
          <p className='text1'>Age:</p>
          <p className='text2'>{Age || '-'}</p>
        </div>
        <div>
          <p className='text1'>Team:</p>
          <p className='text2'>{Team || '-'}</p>
        </div>
        <div>
          <p className='text1'>OPP:</p>
          <p className='text2'>{UpcomingGameOpponent || '-'}</p>
        </div>
        <div>
          <p className='text1'>BYE:</p>
          <p className='text2'>{ByeWeek || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Cap #:</p>
          <p className='text2'>{PlayerCap ? `$${PlayerCap}` : '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Rank:</p>
          <p className='text2'>{PlayerRank ? `$${PlayerRank}` : '-'}</p>
        </div>
      </section>
    </div>
  )
}

export default PlayerRosterCard
