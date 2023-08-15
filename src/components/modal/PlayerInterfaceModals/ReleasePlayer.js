import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const ReleasePlayer = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <h2 className='modal_button_text' onClick={showModal}>
        Release Player
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
          <h1 className='modal_header_heading main_heading'>Release Player</h1>

          <div className='center_content release_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>
              IF YOU ARE SURE THAT YOU WISH TO RELEASE THIS PLAYER, CLICK THE CONFIRM BUTTON OF THE
              BOX.
            </p>
          </div>

          <div className='modal_footer'>
            <Button type='primary' className='button_1'>
              RELEASE PLAYER
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

export default ReleasePlayer
