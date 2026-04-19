import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { useNavigate } from 'react-router-dom'

const PublicLeagueBank = ({ data }) => {
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
        {data?.map((item, i) => (
          <div className='bank-data-div' key={i}>
            <p>
              <span>{i + 1} </span> {item?.League}
            </p>
            <h5> {item?.Rank}</h5>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PublicLeagueBank
