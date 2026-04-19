import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import { useSelector } from 'react-redux'
import sammdglogo from '../../assets/samcoinlogo.png'

const MessageModal = ({ visible, onClose }) => {

  // const cancel = () => {
  //   // setPlayerInfo({})
  //   onClose()
  // }

  return (
    <Modal
      className='pointstransfermsg'
      title=''
      open={visible}
      onCancel={onClose}
      centered
      footer={[
        <Button onClick={onClose} className='customBTN' key='save' type='primary'>
          GOT IT!
        </Button>,
      ]}
    >
      <img src={sammdglogo} className='msgimg' alt='samlogo' />

      <div className='msgtext'>
        <span>
          Welcome to SAMSPORTS, and thank you
          <br />
          for joining us. Your first task is to
          <br />
          participate in the Draft Pick Auction.
          <br />
          We&apos;ve added 1,000,000 SP (SamPoints)
          <br />
          to your wallet for the auction. Use them
          <br />
          to bid for your preferred draft position.
        </span>
      </div>
    </Modal>
  )
}

export default MessageModal
