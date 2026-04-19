import React from 'react'

import { Checkbox } from 'antd'

import { useNavigate, useParams } from 'react-router-dom'
import { isLocked,positions } from '../../config/constants'

import { MdLock } from 'react-icons/md'
import { HiPlusCircle } from 'react-icons/hi'

const PlayerRosterCard = ({
  data,
  index,
  style,
  state,
  handleClick,
  isPractice = false,
  playerCaps,
}) => {
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
      Position,
      UpcomingGameOpponent,
      isPlayerLocked,
      InjuryStatus,
    },
    // _id: lineupId,
    team,
  } = data
  const navigate = useNavigate()
  const { id } = useParams()

  function mapPosition(position) {
  return positions[position] || position;
}

  return (
    <div className='stats_card_container' style={style || null}>
      {/* <div className='stats_card_locked_box' style={{ display: isPlayerLocked ? 'flex' : 'none' }}>
        <MdLock size={25} color={'#fff'}></MdLock>
      </div> */}
      <header>
        <h3
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => {
            navigate(`/player-interface/${PlayerID}`, {
              state: {
                teamId: id ? id : null,
                teamName: team?.name ? team?.name : '',
              },
            })
          }}
        >
          {index + 1}. &nbsp;&nbsp; {Name} ({Position}){' '}
          {isPlayerLocked && <MdLock size={20} color={'#fff'} style={{ marginBottom: '-3px' }} />}
          {InjuryStatus === 'Out' ? (
            <>
              <span className='injury_plus_circle'>
                <b>+</b>
              </span>
              <span style={{ marginLeft: '5px', color: 'red' }}>O</span>
            </>
          ) : InjuryStatus === 'Questionable' ? (
            <span className='injury_plus_Span'>Q</span>
          ) : InjuryStatus === 'Doubtful' ? (
            <span className='injury_plus_Span'>D</span>
          ) : InjuryStatus === 'Suspended' ? (
            <span className='injury_plus_Span'>SSPD</span>
          ) : InjuryStatus === 'Injured Reserve' ? (
            <span className='injury_plus_Span'>IR</span>
          ) : (
            ''
          )}
        </h3>
        {isPractice ? (
          <Checkbox
            onChange={(event) => handleClick(event.target.checked, PlayerID)}
            checked={state?.includes(PlayerID)}
            disabled={isLocked() || isPlayerLocked}
          >
            Protected
          </Checkbox>
        ) : (
          <Checkbox
            onChange={(event) => handleClick(event.target.checked, PlayerID)}
            checked={state?.includes(PlayerID)}
            disabled={isLocked() || isPlayerLocked}
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
          <p className='text2'>
            {playerCaps[PlayerID] ? `${playerCaps[PlayerID]?.toLocaleString()} SP` : '-'}
          </p>
        </div>
        <div>
          <p className='text1'>Player Rank:</p>
          <p className='text2'>{PlayerRank ? `${PlayerRank} SP` : '-'}</p>
        </div>
      </section>
    </div>
  )
}

export default PlayerRosterCard
