import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import { useSelector } from 'react-redux'
import sammdglogo from '../../assets/samlogomessage.png'

const MessageModal = ({ visible, onClose }) => {
  //  console.log('user',user?.team?.currentLeague?.name);

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
          participate in the draft spot auction.
          <br />
          Weve added 1,000,000 SP (SamPoints) to
          <br />
          your user wallet, which you can use to
          <br />
          move up the draft board.
        </span>
      </div>
    </Modal>
  )
}

export default MessageModal
