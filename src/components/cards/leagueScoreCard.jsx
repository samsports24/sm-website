import { Button } from 'antd'
import moment from 'moment'
import React from 'react'
import {useNavigate} from 'react-router-dom'
import { AiOutlineArrowRight } from 'react-icons/ai'

const LeagueScoreCard = ({ data }) => {

  const navigate = useNavigate()

  let date = () => `${moment(data?.date).format('ddd MM/YY')}`.toUpperCase()
  return (
    <div className='league-score-card'>
      <h2>
        FINAL <span>{` - ${date()}`}</span>
      </h2>
      <div className='line'></div>
      {data?.scores?.map((value, index) => (
        <div className='score-row' key={index}>
          <div className='d-flex' style={{ gap: '10px' }}>
            <img src={value?.image} />
            <p>{value?.title || 'Heat Wave Square'}</p>
          </div>
          <h6>
            1-2 <span>17</span>
          </h6>
        </div>
      ))}
      <div className='line'></div>
      <Button onClick={() => {
        navigate("/game-details")
      }} type='primary' style={{ alignSelf: 'end' }}>
        Game Details &nbsp; <AiOutlineArrowRight className='button-icon' size={16} />
      </Button>
    </div>
  )
}

export default LeagueScoreCard
