import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const TradePlayer = ({ disabled }) => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
        Trade Player
      </Button>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='player_interface_modals'
        closable={false}
      >
        <div className='close_modal_button' onClick={closeModal}>
          x
        </div>
        <div className='modal_body'>
          <h1 className='modal_header_heading main_heading'>SEND PLAYER TO PRACTICE SQUAD</h1>

          <div className='center_content trade_player'>
            <h1 className='modal_header_heading'>WHO IS GOING DOWN?</h1>
            <p>YOU MUST SELECT A PLAYER FROM YOUR ROSTER TO SEND TO YOUR PRACTICE SQUAD</p>
            <p>
              INFO: This move will also remove the cap his of this player until he returns to your
              active roster.
            </p>
          </div>

          <h1 className='modal_header_heading'>TEAM ROSTER</h1>
          {['', '', '', '', '']?.map((v, i) => {
            return (
              <div key={i} className='_row'>
                <p>Position</p>
                <p>Player Name</p>
                <p>$Player Hit Cap</p>
                <Button type='primary'>Select</Button>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

export default TradePlayer
