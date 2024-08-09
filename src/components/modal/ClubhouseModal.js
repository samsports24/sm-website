import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import { useSelector } from 'react-redux'
import sammdglogo from '../../assets/samlogomessage.png'

const ClubhouseModal = ({ visible, onClose }) => {
  console.log('🚀 ~ MessageModal ~ visible:', visible)
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

      <div className='clubhousetext'>
        <span>
          Welcome to the Clubhouse
          <br />
          The Clubhouse is your hub for connecting with friends and challenging your peers on
          SamSports. By inviting friends to join you on the platform, you can earn SamPoints as a
          reward. Invite and Earn Rewards:
          <br />
          <br />
          <h2>Pro Level Invitation:</h2>
          <ul>
            <li>Invite a user who creates a team within the Pro level.</li>
            <li>Earn 7,500,000 SamPoints as a reward.</li>
          </ul>
          <br />
          <h2>Freemium Invitation:</h2>
          <ul>
            <l1>Invite a friend to join a freemium league</l1>
            <li>Earn 3,500,000 SamPoints as a reward.</li>
          </ul>
          Use the Clubhouse to expand your network, challenge others, and boost your SamPoints
          earnings by inviting more friends to join SamSports.
        </span>
      </div>
    </Modal>
  )
}

export default ClubhouseModal


