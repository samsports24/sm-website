import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const AuctionPlayer = () => {
  const [open, setOpen] = useState(false)
  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <Button type='primary' className='action-bar-btn' onClick={showModal}>
        auction player
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
          <h1 className='modal_header_heading main_heading'>Player Auction Creation</h1>
          <div className='auction_button_groups'>
            <Button type='default'>Auction Start Date</Button>
            <Button type='default'>Auction End Date</Button>
            <Button type='default'>Opening Bid Price</Button>
            <Button type='default'>Reserve Bid Price</Button>
          </div>
          <div className='modal_footer'>
            <Button type='primary' className='button_1'>
              Create Auction
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

export default AuctionPlayer
