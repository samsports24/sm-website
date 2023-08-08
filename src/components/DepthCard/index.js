import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'

const DepthCard = ({ data, index }) => {
  const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  const { imageUrl, name, text } = data
  return (
    <>
      <div
        className='depth_card_box'
        onClick={() => {
          setModalIndex(index)
          setOpenModal(true)
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
