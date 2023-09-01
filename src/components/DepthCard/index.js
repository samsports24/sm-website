import { Tooltip } from 'antd'

import React, { useState } from 'react'

import DepthChartModal from '../modal/DepthChart'

const DepthCard = ({ data, index, getDepthChartData }) => {
  const [modalIndex, setModalIndex] = useState(-1)
  const [openModal, setOpenModal] = useState(false)

  const { imageUrl, Name, Position, classKey } = data

  const updatedName = (name) => {
    return name === 'k' ? 'kicker' : name === 'p' ? 'punter' : name
  }

  return (
    <>
      <div
        className={`depth_card_box ${classKey}`}
        onClick={() => {
          setModalIndex(index)
          setOpenModal(true)
        }}
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
