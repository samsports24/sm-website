import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const MoveToPracticeSquad = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <h2 className='modal_button_text' onClick={showModal}>
        make offer
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
          <h1 className='modal_header_heading main_heading'>Activate From Practice Squad</h1>

          <div className='center_content move_to_practice_squad'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>
              IF YOU ARE SURE THAT YOU WISH TO MAKE THIS MOVE YOU WILL HAVE TO SELECT A PLAYER FROM
              YOUR PRACTICE SQUAD TO GO TO YOUR ACTIVE ROSTER IF YOU PRACTICE SQUAD IS FULL.
            </p>
            <p style={{ marginTop: '-15px' }}>
              INFO: This move will also remove the cap his of this player until he returns to your
              active roster.
            </p>
          </div>

          <div className='modal_footer'>
            <Button type='primary' className='button_1'>
              Move To Practice Squad
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

export default MoveToPracticeSquad
