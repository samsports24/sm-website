import { Checkbox } from 'antd'
import React from 'react'
import { isLocked } from '../../config/constants'
import { MdLock } from 'react-icons/md'
import PlayerDetailsModal from '../modal/PlayerDetailsModal'
import { useParams } from 'react-router-dom'

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
  } = props
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
      FantasyPosition,
    },
    team,
  } = data
  const { id } = useParams()

  const getColorObj = (value) => {
    const obj = {
      BQB: '#FFBA9E',
      K: '#D1D0C6',
      P: '#E77E7F',
      QB: '#FFE972',
      DE: '#E2E095',

      OL: '#FF72FF',

      RB: '#FFFF72',
      FB: '#FFFF72',

      TE: '#EE909F',
      WR: '#EE909F',

      CB: '#C3E2A6',
      DB: '#C3E2A6',

      DT: '#93FF93',
      DL: '#93FF93',
      NT: '#93FF93',

      LB: '#B3F6E3',
      OLB: '#B3F6E3',
      ILB: '#B3F6E3',

      S: '#98CCE6',
      SS: '#98CCE6',
    }
    return obj[value]
  }
  return (
    <div className='nrc_container'>
      <div className='serial_number'>
        <p>{index + 1}</p>
      </div>
      <div className='content_box'>
        <div className='content_box_left'>
          <span style={{ color: getColorObj(FantasyPosition === 'OL' ? 'OL' : Position) }}>
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
