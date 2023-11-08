import React, { useState } from 'react'
import { Modal } from 'antd'
import PlayerInterfacePopup from '../PlayerInterfacePopup'

const PlayerDetailsModal = ({ button, state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showModal = () => setIsModalOpen(true)
  const handleOk = () => setIsModalOpen(false)
  const handleCancel = () => setIsModalOpen(false)

  return (
    <>
      <h2 onClick={showModal}>{button}</h2>
      <Modal
        title=''
        centered
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        className='player_details_modal'
      >
        <PlayerInterfacePopup closeModal={handleCancel} showModal={showModal} state={state} />
      </Modal>
    </>
  )
}

export default PlayerDetailsModal
