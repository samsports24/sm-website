import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const AddPlayerToTrade = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <Button type='primary' style={{ float: 'right' }} onClick={showModal}>
        Add Another Team
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
          <h1 className='modal_header_heading main_heading'>ADD PLAYER TO TRADE</h1>

          <div className='center_content trade_player'>
            <h1 className='modal_header_heading'>BUILD YOUR DEAL</h1>
            <p
              style={{ textTransform: 'uppercase' }}
            >{`SELECT THE PLAYER YOU WISH TO BE APART OF THIS TRADE!`}</p>
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

export default AddPlayerToTrade
