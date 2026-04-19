import moment from 'moment'
import React from 'react'

const UpcomingMatchCard = ({ data }) => {
  let date = (_date) => moment(_date).format('ddd, DD MMM YYYY'),
    time = (_date) => moment(_date).format('hh:mm a')
  return (
    <div className='match-card'>
      <img src={data?.opponents[0]} alt='' />

      <div className='content'>
        <h4>{date(data?.date)}</h4>
        <h1>{time(data?.date)}</h1>
        <h5>Django Stadium</h5>
      </div>
      <img src={data?.opponents[1]} alt='' />
    </div>
  )
}

export default UpcomingMatchCard
