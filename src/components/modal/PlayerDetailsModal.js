import React, { useState } from 'react'
import { Modal } from 'antd'
import PlayerInterfacePopup from '../PlayerInterfacePopup'

const PlayerDetailsModal = ({ button, state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [remountKey, setRemountKey] = useState(0)
  const showModal = () => {
    setIsModalOpen(true)
    setRemountKey((prevKey) => prevKey + 1)
  }
  const handleCancel = () => setIsModalOpen(false)

  return (
    <>
      <h2 onClick={showModal}>{button}</h2>
      <Modal
        title=''
        centered
        open={isModalOpen}
        onCancel={handleCancel}
        footer={false}
        className='player_details_modal'
        key={remountKey}
      >
        <PlayerInterfacePopup closeModal={handleCancel} isModalOpen={isModalOpen} state={state} />
      </Modal>
    </>
  )
}

export default PlayerDetailsModal
