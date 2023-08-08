import { Modal } from 'antd'
import React from 'react'

import barIcon from '../../assets/bar-icon.svg'

const DepthChart = ({ openModal, setOpenModal }) => {
  return (
    <Modal
      centered
      open={openModal}
      onCancel={() => setOpenModal(false)}
      footer={null}
      closeIcon={false}
      className='depth_modal'
      closable={false}
    >
      <div className='depth_modal_content'>
        <div className='card_box'>
          <div className='header'>
            <h2>Starter</h2>
            <h2>QB</h2>
          </div>
          <div className='content_body'>
            <div className='image_box'>
              <img src={require('../../assets/player-img-6.png')} />
            </div>
            <div>
              <p className='text1'>Team</p>
              <p className='text2'>KCC</p>
            </div>
            <div>
              <p className='text1'>POS</p>
              <p className='text2'>KCC</p>
            </div>
            <div>
              <p className='text1'>Player Name</p>
              <p className='text2'>KCC</p>
            </div>
            <div>
              <p className='text1'>Injury</p>
              <p className='text2'>KCC</p>
            </div>
            <div>
              <p className='text1'>Game Info</p>
              <p className='text2'>KCC</p>
            </div>
            <div>
              <p className='text1'>Projection</p>
              <p className='text2'>7:05</p>
            </div>
            <img src={barIcon} />
          </div>
        </div>
        <div className='card_box'>
          <div className='header'>
            <h2>Back-up</h2>
          </div>
          <div className='content_body'>
            <div className='image_box'>
              <img src={require('../../assets/player-img-6.png')} />
            </div>
            <img src={barIcon} />
          </div>
        </div>
        <div className='card_box'>
          <div className='header'>
            <h2>Bench</h2>
          </div>
          <div className='content_body'>
            <div className='image_box'>
              <img src={require('../../assets/player-img-6.png')} />
            </div>
            <img src={barIcon} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DepthChart
