import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const MakeOffer = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <h2 className='modal_button_text' onClick={showModal}>
        Move To Practice Squad
      </h2>
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

          <h1 className='modal_header_heading'>TEAM ROSTER</h1>
          {['', '', '', '', '']?.map((v, i) => {
            return (
              <div key={i} className='_row'>
                <p>Position</p>
                <p>Player Name</p>
                <p>$Player Hit Cap</p>
                <Button type='primary'>Select</Button>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

export default MakeOffer
