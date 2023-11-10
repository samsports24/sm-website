import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'
import { isLocked } from '../../config/constants'
import { MdLock } from 'react-icons/md'

const DepthCard = ({ data, index, getDepthChartData }) => {
  const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  // const _positions = {
  //   te: 'te',
  //   ol: 'ol',
  //   wr: 'wr',
  //   rbwrte: 'rbwrte',
  //   qb: 'qb',
  //   rb: 'rb',
  //   bqb: 'bqb',
  // }

  // const getImage = (position) => {
  //   const p = position
  //   return p === 'rb/wr/te' ? 'rbwrte' : p === 'backup qb' ? 'bqb' : p
  // }

  const { imageUrl, Name, Position, classKey, isPlayerLocked } = data
  // console.log('🚀 ~ file: index.js:14 ~ DepthCard ~ Position:', Position)

  const updatedName = (name) => {
    return name === 'k' ? 'kicker' : name === 'p' ? 'punter' : name
  }
  return (
    <>
      {isPlayerLocked && (
        <div className={`depth_card_player_locked ${classKey}`}>
          <MdLock size={50} color={'#fff'} />
        </div>
      )}
      {/* <div className={`new_depth_card_box ${classKey}`}>
        <img
          className='card_bg_img'
          src={require(`../../assets/offense-card/${getImage(Position)}.png`)}
        />
      </div> */}
      <div
        className={`depth_card_box ${classKey}`}
        onClick={() => {
          const check = () => {
            if (isLocked()) return false
            if (isPlayerLocked) return false
            if (!isPlayerLocked) return true
          }

          if (check()) {
            setModalIndex(index)
            setOpenModal(true)
          }
        }}
        style={{ cursor: isLocked() || isPlayerLocked ? 'no-drop' : 'pointer' }}
      >
        <div className='image_box'>
          <img src={imageUrl} />
        </div>
        <div className='name'>
          <Tooltip title={Name}>
            <p>{Name}</p>
          </Tooltip>
        </div>
        <div className='text'>
          <h2>{updatedName(Position)}</h2>
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
