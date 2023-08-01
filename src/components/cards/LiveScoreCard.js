import React from 'react'

const LiveScoreCard = ({ data }) => {
  const { title, starters, starter, nonStarter } = data
  return (
    <div className='live_score_card'>
      <div className='header'>
        <h3>{title}</h3>
      </div>
      <div className='content'>
        <div className='row'>
          <p className='name'>STARTERS</p>
          <p className='value'>{starters}</p>
        </div>
        <div className='row'>
          <p className='name'>STARTER</p>
          <p className='value'>{starter}</p>
        </div>
        <div className='row' style={{ borderBottom: 'none' }}>
          <p className='name'>NON-STARTERS</p>
          <p className='value'>{nonStarter}</p>
        </div>
      </div>
    </div>
  )
}

export default LiveScoreCard
