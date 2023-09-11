import React, { useState } from 'react'
import { Button, Modal, notification } from 'antd'
// import { useParams } from 'react-router-dom'
import { moveToPractice } from '../../../redux/actions/rosterAction'
import { activeRosterCount } from '../../../config/constants'
import { useSelector } from 'react-redux'

const MakeOffer = ({ disabled, practicePlayers, activePlayersCount, getData, playerId }) => {
  const SETTING = useSelector((state) => state?.user?.setting)

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)

  // const { id } = useParams()

  const showModal = () => setOpen(true)
  const closeModal = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const moveToPracticeSquad = async () => {
    setLoading(true)
    await moveToPractice({
      id: playerId,
      week: SETTING?.week,
    })
    await getData()
    setLoading(false)
    closeModal()
  }

  const handleSubmit = async () => {
    if (selectedId) {
      setLoading(true)
      await moveToPractice({
        id: playerId,
        replacedPlayer: selectedId,
        week: SETTING?.week,
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
        Move To
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
          <h1 className='modal_header_heading main_heading'>SEND PLAYER TO PRACTICE SQUAD</h1>

          <div className='center_content trade_player'>
            <h1 className='modal_header_heading'>WHO IS GOING DOWN?</h1>
            <p
              style={{ textTransform: 'uppercase' }}
            >{`You need to choose a player from your roster to assign to your practice squad.`}</p>
            <p style={{ textTransform: 'uppercase' }}>
              {`info: This action will lead to the player's Cap Hit being excluded from your team's overall total until the player is reinstated to your active roster.`}
            </p>
          </div>

          {/* in future we will use practice roster count variable */}
          {activePlayersCount > activeRosterCount ? (
            <div className='modal_footer'>
              <Button
                onClick={moveToPracticeSquad}
                type='primary'
                className='button_1'
                loading={loading}
              >
                MOVE TO PRACTICE SQUAD
              </Button>
              <Button onClick={closeModal} type='primary' className='button_2'>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className='modal_header_heading'>TEAM ROSTER</h1>
              <div className='team_roster_box'>
                {practicePlayers?.map((v, i) => {
                  return (
                    <div
                      key={i}
                      className={`_row ${selectedId === v?.players?.PlayerID && 'selected_row'}`}
                    >
                      <p style={{ minWidth: '70px' }}>{v?.players?.Position}</p>
                      <p style={{ minWidth: '300px' }}>{v?.players?.Name}</p>
                      <p>${v?.PlayerCap}</p>
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

export default MakeOffer
