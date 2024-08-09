import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import '../../styles/modals/pointstransfermessage.css'
import { useSelector } from 'react-redux'
import sammdglogo from '../../assets/samlogomessage.png'

const StadiumModal = ({ visible, onClose }) => {
  console.log('🚀 ~ MessageModal ~ visible:', visible)
  //  console.log('user',user?.team?.currentLeague?.name);

  // const cancel = () => {
  //   // setPlayerInfo({})
  //   onClose()
  // }

  return (
    <Modal
      className='stadiummodal'
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

        By effectively managing your stadium, you can create a thriving, profitable environment for your team, ensure a steady flow of SamPoints, and enhance your overall gameplay experience by engaging more virtual fans
        <br>
        </br>
        <h2>Getting Started:</h2>
          
          <br />
          When joining the SFL, each user is given a stadium with a 100% attendance rate to start
          the season and a ticket price of 85 SamPoints
          <br />
          Each week, 30% of the SamPoints generated will go to the leaguea&apos;s SamPoints Prize
          Pool. The remaining 70% is split into two pots
          <br />
          <h2>Weekly Earnings</h2>
          <br></br>
          <ul>
            <li>75% goes to the winning team of each matchup.</li>
            <li>25% goes to the losing team..</li>
          </ul>
          <br />
          <h2>Attendance Variations:</h2>
          <p> Attendance will vary during the season depending on your weekly performance:</p>
          <ul>
            <li>Winning a Game: Increases your attendance by 3%</li>
            <li>Losing a Game: Decreases your attendance by 3%.</li>
          </ul>
          <h2>Daily Login Impact:</h2>
          <p>
            Your daily login from Sunday to Wednesday will also impact your attendance. Users who
            log in daily during this period will improve their attendance by 1.5%.
          </p>
          <h2>Upgrading Your Stadium:</h2>
          <p> Upgrading your stadium is crucial for long-term success in the SFL</p>

          <ul>
  <li>A larger, well-maintained stadium attracts more virtual fans</li>
  <li>Increases revenue as your ticket price increases</li>
  <li>Allows users to earn more SamPoints</li>
</ul>

          By leveraging these features, you can maximize your team&apos;s success and ensure a
          robust engagement with your virtual fans, driving up your earnings and overall performance
          in the league
        </span>
      </div>
    </Modal>
  )
}

export default StadiumModal
