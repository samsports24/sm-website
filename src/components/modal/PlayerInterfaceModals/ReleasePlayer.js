import { Button, Modal } from 'antd'
import React, { useState } from 'react'
import { releasePlayer } from '../../../redux/actions/rosterAction'
import { useParams, useNavigate } from 'react-router-dom'
import Processed from './Processed'
import { useSelector } from 'react-redux'

const ReleasePlayer = ({ disabled }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [open, setOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { id } = useParams()
  const navigate = useNavigate()

  const _releasePlayer = async () => {
    setLoading(true)
    const res = await releasePlayer({ id: Number(id), week: SETTING?.week })
    if (res) {
      setConfirmModal(false)
      closeModal()
      navigate('/player-roster')
    }
    setLoading(false)
  }

  return (
    <>
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
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
          <h1 className='modal_header_heading main_heading'>Release Player</h1>

          <div className='center_content release_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>{`TO RELEASE THIS PLAYER, CLICK THE 'RELEASE' BUTTON ONCE YOU'RE SURE`}</p>
          </div>

          <div className='modal_footer'>
            <Button
              type='primary'
              className='button_1'
              onClick={() => setConfirmModal(true)}
              loading={loading}
            >
              RELEASE PLAYER
            </Button>
            <Button onClick={closeModal} type='primary' className='button_2'>
              Cancel
            </Button>
          </div>
          <Processed
            loading={loading}
            onClick={_releasePlayer}
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
          />
        </div>
      </Modal>
    </>
  )
}

export default ReleasePlayer
