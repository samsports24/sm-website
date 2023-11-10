import React, { useState } from 'react'
import { Button, Modal, notification } from 'antd'
import { getRoster, moveFromPractice } from '../../../redux/actions/rosterAction'
import { activeRosterCount } from '../../../config/constants'
import { useSelector } from 'react-redux'

const ActivateFromPracticeSquad = ({ disabled, pInterfaceModalClose, activePlayers, playerId }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)

  const showModal = () => setOpen(true)
  const closeModal = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const moveFromPracticeSquad = async () => {
    setLoading(true)
    await moveFromPractice({
      id: playerId,
    })
    setLoading(false)
    closeModal()
    pInterfaceModalClose()
    getRoster(SETTING?.week)
  }

  const handleSubmit = async () => {
    if (selectedId) {
      setLoading(true)
      await moveFromPractice({
        id: playerId,
        replacedPlayer: selectedId,
      })
      await getData()
      setLoading(false)
      closeModal()
    } else {
      notification.error({
        message: `Please select player to replace!`,
        duration: 3,
      })
    }
  }

  return (
    <>
      <Button disabled={disabled} type='primary' className='action-bar-btn' onClick={showModal}>
        Activate From
        <span> Practice Squad</span>
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
          <h1 className='modal_header_heading main_heading'>Activate From Practice Squad</h1>

          <div className='center_content activate_from_practice_squad'>
            <h1 className='modal_header_heading'>ARE YOU SURE?</h1>
            <p style={{ textTransform: 'uppercase' }}>
              {`To release this player, click the "Release" button once you're sure.`}
            </p>
            <p style={{ textTransform: 'uppercase' }}>
              {`info: This action will lead to the player's Cap Hit being excluded from your team's overall total until the player is reinstated to your active roster.`}
            </p>
          </div>

          {activePlayers?.length < activeRosterCount ? (
            <div className='modal_footer'>
              <Button
                type='primary'
                className='button_1'
                onClick={moveFromPracticeSquad}
                loading={loading}
              >
                ACTIVATE FROM PRACTICE SQUAD
              </Button>
              <Button onClick={closeModal} type='primary' className='button_2'>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className='modal_header_heading'>TEAM ROSTER</h1>
              <div className='team_roster_box'>
                {activePlayers?.map((v, i) => {
                  return (
                    <div
                      key={i}
                      className={`_row ${selectedId === v?.players?.PlayerID && 'selected_row'}`}
                    >
                      <p style={{ minWidth: '70px' }}>{v?.players?.Position}</p>
                      <p style={{ minWidth: '300px' }}>{v?.players?.Name}</p>
                      <p>${v?.players?.PlayerCap}</p>
                      <Button type='primary' onClick={() => setSelectedId(v?.players?.PlayerID)}>
                        Select
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className='modal_footer'>
                <Button
                  onClick={handleSubmit}
                  type='primary'
                  className='button_1'
                  style={{ width: '150px' }}
                  loading={loading}
                >
                  Submit
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

export default ActivateFromPracticeSquad
