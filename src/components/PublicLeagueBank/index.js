import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { useNavigate } from 'react-router-dom'

const PublicLeagueBank = () => {
  const navigate = useNavigate()
  return (
    <div className='public-league-bank'>
      <div className='head'>
        <h3>Public League Bank</h3>
        <p
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate('/league-standings')
          }}
        >
          view all <BiRightArrowAlt size={18} />
        </p>
      </div>
      <div className='bank-data'>
        <div className='bank-data-div'>
          <p>
            <span>1. </span> League #009771
          </p>
          <h5> $54.06 .937</h5>
        </div>
        <div className='bank-data-div'>
          <p>
            <span>1. </span> League #009771
          </p>
          <h5> $54.06 .937</h5>
        </div>
      </div>
    </div>
  )
}

export default PublicLeagueBank
