import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'
import { isLocked } from '../../config/constants'
import { MdLock } from 'react-icons/md'
import { useParams } from 'react-router-dom'

const DepthCard = ({ data, index, getDepthChartData }) => {
  const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  const { teamID } = useParams()

  const getImage = (position) => {
    const p = position
    return p === 'rb/wr/te'
      ? 'rbwrte'
      : p === 'backup qb'
      ? 'bqb'
      : p === 'cb/s'
      ? 'cbs'
      : p === 'dt/de'
      ? 'dtde'
      : p === 'dt/lb'
      ? 'dtlb'
      : p === 'lb/cb/s'
      ? 'lbcbs'
      : p
  }

  const { imageUrl, Name, Position, classKey, Opponent, Team, InjuryStatus, isPlayerLocked } = data

  return (
    <>
      {isPlayerLocked && (
        <div className={`depth_card_player_locked ${classKey}`}>
          <MdLock size={30} color={'#fff'} />
        </div>
      )}
      <div
        className={`new_depth_card_box ${classKey}`}
        onClick={() => {
          if (!teamID) {
            const check = () => {
              if (isLocked()) return false
              if (isPlayerLocked) return false
              if (!isPlayerLocked) return true
            }

            if (check()) {
              setModalIndex(index)
              setOpenModal(true)
            }
          }
        }}
        style={{ cursor: isLocked() || isPlayerLocked ? 'no-drop' : 'pointer' }}
      >
        <div className='wrapper'>
          <img
            className='card_bg_img'
            src={require(`../../assets/offense-card/${getImage(Position)}.png`)}
          />
          <div className='image_box'>
            <img src={imageUrl} />
          </div>
          <div className='player_name'>
            <Tooltip title={Name}>
              <h2>{Name}</h2>
            </Tooltip>
          </div>
          <p className='opponent_text'>{Opponent || '-'}</p>
          <p className='team_text'>{Team || '-'}</p>
          <p className='injury_text'>{InjuryStatus || '-'}</p>
        </div>
      </div>

      {/* MODAL */}
      {modalIndex === index && (
        <DepthChartModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          data={data}
          getDepthChartData={getDepthChartData}
        />
      )}
    </>
  )
}

export default DepthCard
