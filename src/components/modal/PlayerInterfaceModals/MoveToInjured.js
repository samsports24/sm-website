import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const MoveToInjured = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <h2 className='modal_button_text' onClick={showModal}>
        MOVE TO INJURED RESERVE (I.R.)
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
          <h1 className='modal_header_heading'>MOVE TO INJURED RESERVE (I.R.)</h1>

          <div className='release_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>
              IF YOU ARE SURE THAT YOU WISH TO MOVE THIS PLAYER TO I.R., CLICK THE CONFIRM BUTTON OF
              THE BOX.
            </p>
            <p>
              INFO: This move will also remove the cap his of this player until he returns to your
              active roster.
            </p>
          </div>

          <div className='modal_footer'>
            <Button type='primary' className='button_1'>
              MOVE TO INJURED I.R.
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

export default MoveToInjured
