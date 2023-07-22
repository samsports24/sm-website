import { Button } from 'antd'
import moment from 'moment'
import React from 'react'
import { AiOutlineArrowRight } from 'react-icons/ai'

const LeagueScoreCard = ({ data }) => {
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
      <Button type='primary' style={{ alignSelf: 'end' }}>
        Game Details <AiOutlineArrowRight className='button-icon' />
      </Button>
    </div>
  )
}

export default LeagueScoreCard
