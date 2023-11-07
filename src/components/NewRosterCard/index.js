import { Checkbox } from 'antd'
import React from 'react'
import { isLocked } from '../../config/constants'
import { MdLock } from 'react-icons/md'

const NewRosterCard = (props) => {
  const { data, index, state, handleClick, isPractice = false, playerCaps } = props
  const {
    players: {
      PlayerID,
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
    team,
  } = data
  console.log(InjuryStatus)

  const getColor = () => {
    const red = Math.floor(Math.random() * 128) + 128 // 128-255
    const green = Math.floor(Math.random() * 128) + 128 // 128-255
    const blue = Math.floor(Math.random() * 128) + 128 // 128-255
    const lightColor = `rgb(${red},${green},${blue})`
    return lightColor
  }

  return (
    <div className='nrc_container'>
      <div className='serial_number'>
        <p>{index + 1}</p>
      </div>
      <div className='content_box'>
        <div className='content_box_left'>
          <span style={{ color: getColor() }}>{Position}</span>
        </div>
        <div className='content_box_center'>
          <div className='top'>
            <h2>{Name}</h2>
            <p style={{ marginLeft: '-10px' }}>-{Team}</p>
            {isPlayerLocked && <MdLock size={18} color={'#fff'} style={{ marginBottom: '-3px' }} />}
            {InjuryStatus === 'Out' ? (
              <>
                <span className='injury_plus'>
                  <b>+</b>
                </span>
                <p className='injury_plus_text'>O</p>
              </>
            ) : InjuryStatus === 'Questionable' ? (
              <p className='injury_status'>Q</p>
            ) : InjuryStatus === 'Doubtful' ? (
              <p className='injury_status'>D</p>
            ) : InjuryStatus === 'Suspended' ? (
              <p className='injury_status'>SSPD</p>
            ) : InjuryStatus === 'Injured Reserve' ? (
              <p className='injury_status'>IR</p>
            ) : (
              ''
            )}
            {/* <p style={{ color: 'green' }}>ACTIVE</p> */}
            <p>AGE:{Age || '-'}</p>
            <p>BYE:{ByeWeek || '-'}</p>
          </div>
          <div className='bottom'>
            <p>PPG:{pts || '-'}</p>
            <p>P-RANK:{PlayerRank ? `#${PlayerRank}` : '-'}</p>
            <p>OPP:{UpcomingGameOpponent || '-'}</p>
            <p>
              CAPHIT:{playerCaps[PlayerID] ? `$${playerCaps[PlayerID]?.toLocaleString()}` : '-'}
            </p>
          </div>
        </div>
        <div className='content_box_right'>
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
        </div>
      </div>
    </div>
  )
}

export default NewRosterCard
