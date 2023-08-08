import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'

const DepthCard = ({ data, index }) => {
  const [modalIndex] = useState(-1)
  // const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  const { imageUrl, name, text, type } = data
  console.log(`${type}_${text}`)

  const getPositionClass = (key) => {
    switch (key) {
      // case 'defence_s':
      //   return 'defence_s'
      case 'defence_cb/s':
        return 'defence_cbs'
      case 'defence_lb-1':
        return 'defence_lb-1'
      case 'defence_lb-2':
        return 'defence_lb-2'
      case 'defence_lb/cb/s':
        return 'defence_lbcbs'
      case 'defence_cb-1':
        return 'defence_cb-1'
      case 'defence_cb-2':
        return 'defence_cb-2'
      // case 'defence_de':
      //   return 'defence_de'
      // case 'defence_dt':
      //   return 'defence_dt'
      case 'defence_dt/de':
        return 'defence_dtde'
      case 'defence_dt/lb':
        return 'defence_dtlb'
      case 'special team_pk':
        return 'special_team_pk'
      case 'special team_pn':
        return 'special_team_pn'
      // case 'offence_te':
      //   return 'offence_te'
      // case 'offence_ol-1':
      //   return 'offence_ol-1'
      // case 'offence_ol-2':
      //   return 'offence_ol-2'
      // case 'offence_ol-3':
      //   return 'offence_ol-3'
      // case 'offence_ol-4':
      //   return 'offence_ol-4'
      // case 'offence_ol-5':
      //   return 'offence_ol-5'
      // case 'offence_wr-1':
      //   return 'offence_wr-1'
      // case 'offence_wr-2':
      //   return 'offence_wr-2'
      case 'offence_rb/wr/te':
        return 'offence_rbwrte'
      // case 'offence_qb':
      //   return 'offence_qb'
      // case 'offence_rb':
      //   return 'offence_rb'

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
          <Tooltip title='Damien Harris'>
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
