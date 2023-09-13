import { Button, Modal } from 'antd'
import React, { useState } from 'react'
import { moveToIr } from '../../../redux/actions/rosterAction'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const MoveToInjured = ({ disabled, getData }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { id } = useParams()
  const navigate = useNavigate()

  const _moveToIr = async () => {
    setLoading(true)
    const res = await moveToIr({
      id,
      week: SETTING?.week,
    })
    if (res) {
      await getData()
      closeModal()
      navigate('/player-roster')
    }
    setLoading(false)
  }

  return (
    <>
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
        MOVE TO (I.R.)
        <span>Practice Squad</span>
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
          <h1 className='modal_header_heading main_heading'>MOVE TO INJURED RESERVE (I.R.)</h1>

          <div className='center_content move_to_injured'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p style={{ textTransform: 'uppercase' }}>
              {`To place this player on the Injured Reserve, click the "Move to I.R." button if you're sure.`}
            </p>
            <p style={{ textTransform: 'uppercase' }}>
              {`info: This action will lead to the player's Cap Hit being excluded from your team's overall total until the player is reinstated to your active roster.`}
            </p>
          </div>

          <div className='modal_footer'>
            <Button loading={loading} type='primary' className='button_1' onClick={_moveToIr}>
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
