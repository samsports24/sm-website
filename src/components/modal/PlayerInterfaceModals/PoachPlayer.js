import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const PoachPlayer = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <h2 className='modal_button_text' onClick={showModal}>
        Poach Player
      </h2>
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
          <h1 className='modal_header_heading main_heading'>Poach Player</h1>

          <div className='center_content poach_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>IF YOU ARE SURE THAT YOU WISH TO STRAT POACHING PROCESS CLICK CONFIRM.</p>
            <p style={{ marginTop: '-15px' }}>
              INFO: This action will give the team owner of this player 24 hours to protect the
              player or to active the player to their 53-man rosters.
            </p>
          </div>

          <div className='modal_footer'>
            <Button type='primary' className='button_1'>
              confirm
            </Button>
            <Button onClick={closeModal} type='primary' className='button_2'>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PoachPlayer
