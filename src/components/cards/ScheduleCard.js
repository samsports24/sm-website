import React from 'react'

const ScheduleCard = ({ data: propData }) => {
  const { title, data } = propData
  return (
    <div className='schedule_card_box'>
      <div className='schedule_title_header'>
        <h3>{title}</h3>
      </div>
      <div className='schedule_header'>
        <p className='heading1'>Matchup</p>
        <p className='heading2'>Score</p>
      </div>
      {data?.map((v, i) => {
        return (
          <div key={i} className={`content_row_wrapper ${i % 2 === 0 ? 'color_row' : ''}`}>
            <div className='content_row'>
              <div className='text1'>{v?.team1?.matchup}</div>
              <div className='text2'>{v?.team1?.score}</div>
            </div>
            <div className='content_row'>
              <div className='text1'>{v?.team2?.matchup}</div>
              <div className='text2'>{v?.team2?.score}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ScheduleCard
