import { Checkbox } from 'antd'
import React from 'react'
import { isLocked } from '../../config/constants'
import { MdLock } from 'react-icons/md'
import PlayerDetailsModal from '../modal/PlayerDetailsModal'
import { useParams } from 'react-router-dom'
import { getPf, getPositionColor, getRankAndPosition } from '../../config/helperFunctions'

const NewRosterCard = (props) => {
  const {
    data,
    index,
    checkBoxIds,
    state,
    handleClick,
    isPractice = false,
    playerCaps,
    checkBox = true,
    averagePf,
  } = props
  const {
    players: {
      PlayerID,
      Name,
      pts,
      Age,
      Team,
      ByeWeek,
      Position,
      UpcomingGameOpponent,
      isPlayerLocked,
      InjuryStatus,
      FantasyPosition,
    },
    team,
  } = data
  const { id } = useParams()

  return (
    <div className='nrc_container'>
      <div className='serial_number'>
        <p>{index + 1}</p>
      </div>
      <div className='content_box'>
        <div className='content_box_left'>
          <span style={{ color: getPositionColor(FantasyPosition === 'OL' ? 'OL' : Position) }}>
            {Position}
          </span>
        </div>
        <div className='content_box_center'>
          <div className='top'>
            {/* PLAYER DETAILS MODAL */}
            <PlayerDetailsModal
              button={Name}
              state={{
                ...state,
                playerID: PlayerID,
                teamId: id ? id : null,
                teamName: team?.name ? team?.name : '',
                teamLogo: team?.logo ? team?.logo : null,
              }}
            />

            <p style={{ marginLeft: '-10px' }}>-{Team}</p>
            {isPlayerLocked && <MdLock size={18} color={'#fff'} style={{ marginBottom: '-3px' }} />}
            {InjuryStatus === 'Out' ? (
              <>
                <img src={require('../../assets/plus-icon.png')} width={20} height={20} />
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
            <p>AGE:{Age || '-'}</p>
            <p>BYE:{ByeWeek || '-'}</p>
          </div>
          <div className='bottom'>
            <p>AVG.PF:{averagePf[PlayerID] ? getPf(averagePf[PlayerID])?.apf : '-'}</p>
            <p>PPG:{pts || '-'}</p>
            <p>P-RANK:{getRankAndPosition(averagePf[PlayerID])?.playerOverallRank}</p>
            <p>OPP:{UpcomingGameOpponent || '-'}</p>
            <p>
              CAPHIT:{playerCaps[PlayerID] ? `$${playerCaps[PlayerID]?.toLocaleString()}` : '-'}
            </p>
          </div>
        </div>
        <div className='content_box_right'>
          {checkBox && (
            <>
              {isPractice ? (
                <Checkbox
                  onChange={(event) => handleClick(event.target.checked, PlayerID)}
                  checked={checkBoxIds?.includes(PlayerID)}
                  disabled={isLocked() || isPlayerLocked}
                >
                  Protected
                </Checkbox>
              ) : (
                <Checkbox
                  onChange={(event) => handleClick(event.target.checked, PlayerID)}
                  checked={checkBoxIds?.includes(PlayerID)}
                  disabled={isLocked() || isPlayerLocked}
                >
                  Non-Active
                </Checkbox>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewRosterCard
