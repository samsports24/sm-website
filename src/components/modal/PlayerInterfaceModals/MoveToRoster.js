import React, { useState } from 'react'
import { Button, Modal, Tooltip } from 'antd'

import dayjs from 'dayjs'

import { moveIrToPractice, moveIrToRoster } from '../../../redux/actions/rosterAction'

const MoveToRoster = ({ activeDate, injuredDate, injuredId, playerId, getData }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => {
    setIsError(false)
    setOpen(false)
  }

  var isBetween = require('dayjs/plugin/isBetween')
  dayjs.extend(isBetween)
  const isActive = dayjs().isBetween(injuredDate, activeDate, '[)') ? true : false

  const diffDays = Math.ceil(Math.abs(new Date(activeDate) - new Date()) / (1000 * 60 * 60 * 24))

  const _moveToRoster = async () => {
    setLoading(true)
    const res = await moveIrToRoster({ injuredId }, setIsError)
    if (res) {
      await getData()
      closeModal()
    }
    setLoading(false)
  }
  const _moveToPractice = async () => {
    console.log(playerId)
    setLoading(true)
    const res = await moveIrToPractice({
      // playerId,
      injuredId,
    })
    if (res) {
      await getData()
      closeModal()
    }
    setLoading(false)
  }

  return (
    <>
      {isActive ? (
        <Tooltip
          popupVisible={false}
          placement='top'
          title={`${diffDays} Days remaining till active`}
        >
          <Button disabled={true} type='primary' className='action-bar-btn' onClick={showModal}>
            Move to Roster
          </Button>
        </Tooltip>
      ) : (
        <Button type='primary' className='action-bar-btn' onClick={showModal}>
          Move to Roster
        </Button>
      )}
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
          {isError ? (
            <>
              <h1 className='modal_header_heading main_heading'>Move to Practice Squad</h1>
              <div className='center_content release_player' style={{ gap: '5px' }}>
                <p>Your roster is full, it has all 53 players</p>
                <p>However, you can move this player to the practice squad.</p>
              </div>
              <div className='modal_footer'>
                <Button
                  type='primary'
                  className='button_1'
                  onClick={_moveToPractice}
                  loading={loading}
                >
                  MOVE TO PRACTICE SQUAD
                </Button>
                <Button onClick={closeModal} type='primary' className='button_2'>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className='modal_header_heading main_heading'>Move to Roster</h1>
              <div className='center_content release_player' style={{ gap: '5px' }}></div>
              <div className='modal_footer'>
                <Button
                  type='primary'
                  className='button_1'
                  onClick={_moveToRoster}
                  loading={loading}
                >
                  MOVE TO ROSTER
                </Button>
                <Button onClick={closeModal} type='primary' className='button_2'>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export default MoveToRoster
