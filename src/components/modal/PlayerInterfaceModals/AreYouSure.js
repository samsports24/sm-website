import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const AreYouSureModal = ({ loading, onClick }) => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <Button type='primary' className='action-bar-btn' onClick={showModal}>
        Release Player
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
          <div className='center_content release_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            {/* <p>{`TO RELEASE THIS PLAYER, CLICK THE 'RELEASE' BUTTON ONCE YOU'RE SURE`}</p> */}
          </div>

          <div className='modal_footer'>
            <Button type='primary' className='button_1' onClick={onClick} loading={loading}>
              PROCESSED
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

export default AreYouSureModal
