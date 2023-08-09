import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'

const DepthCard = ({ data, index }) => {
  const [modalIndex] = useState(-1)
  // const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  const { imageUrl, name, text, type } = data

  const getPositionClass = (key) => {
    switch (key) {
      case 'defence_cb/s':
        return 'defence_cbs'
      case 'defence_lb/cb/s':
        return 'defence_lbcbs'
      case 'defence_dt/de':
        return 'defence_dtde'
      case 'defence_dt/lb':
        return 'defence_dtlb'
      case 'special team_pk':
        return 'special_team_pk'
      case 'special team_pn':
        return 'special_team_pn'
      case 'offence_rb/wr/te':
        return 'offence_rbwrte'
      default:
        return key
    }
  }

  return (
    <>
      <div
        className={`depth_card_box ${getPositionClass(`${type}_${text}`)}`}
        onClick={() => {
          // setModalIndex(index)
          // setOpenModal(true)
        }}
      >
        <div className='image_box'>
          <img src={imageUrl} />
        </div>
        <div className='name'>
          <Tooltip title={name}>
            <p>{name}</p>
          </Tooltip>
        </div>
        <div className='text'>
          <h2>{text}</h2>
        </div>
      </div>

      {/* MODAL */}
      {modalIndex === index && (
        <DepthChartModal openModal={openModal} setOpenModal={setOpenModal} />
      )}
    </>
  )
}

export default DepthCard
