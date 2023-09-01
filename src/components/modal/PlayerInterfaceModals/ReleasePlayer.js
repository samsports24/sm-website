import {
  Button,
  Modal,
  //  Popover
} from 'antd'
import React, { useState } from 'react'
import { releasePlayer } from '../../../redux/actions/rosterAction'
import { useParams } from 'react-router-dom'

const ReleasePlayer = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { id } = useParams()

  const _releasePlayer = async () => {
    setLoading(true)
    const res = await releasePlayer(id)
    if (res) {
      closeModal()
    }
    setLoading(false)
  }

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
          <h1 className='modal_header_heading main_heading'>Release Player</h1>

          <div className='center_content release_player'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p>{`TO RELEASE THIS PLAYER, CLICK THE 'RELEASE' BUTTON ONCE YOU'RE SURE`}</p>
          </div>

          <div className='modal_footer'>
            {/* <Popover
              content={
                <Button
                  type='primary'
                  className='processed_button'
                  onClick={_releasePlayer}
                  loading={loading}
                >
                  Processed
                </Button>
              }
              title='Are you sure?'
              trigger='click'
            >
              <Button type='primary' className='button_1'>
                RELEASE PLAYER
              </Button>
            </Popover> */}
            <Button type='primary' className='button_1' onClick={_releasePlayer} loading={loading}>
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
