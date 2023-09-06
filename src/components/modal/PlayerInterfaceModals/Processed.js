import { Button, Modal } from 'antd'
import React from 'react'

const Processed = ({ onClick, loading, confirmModal, setConfirmModal }) => {
  const closeModal = () => setConfirmModal(false)

  return (
    <>
      <Modal
        centered
        open={confirmModal}
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

export default Processed
