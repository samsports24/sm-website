import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

const TeamFinancialsComponent = () => {
  return (
    <div className='team_financials_box'>
      <div className='tf_header'>
        <p>Team Financials</p>
        <BiRightArrowAlt size={18} />
      </div>

      <div className='tf_row'>
        <p>League Salary Cap</p>
        <p>301,200,000 SP</p>
      </div>
      <div className='tf_row'>
        <p>Team Salary Cap</p>
        <p>189,890,858 SP</p>
      </div>
      <div className='tf_row'>
        <p>Team Cap Left</p>
        <p>9,868,588 SP</p>
      </div>
    </div>
  )
}

export default TeamFinancialsComponent
