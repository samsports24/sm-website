import React from 'react'

const AmericalFootballBanner = () => {
  return (
    <div className='american-football-banner'>
      <img src={require('../../assets/rectangle-9.png')} />
      <div className='content_wrapper'>
        <div className='left'>
          <h1>Try out a mock draft</h1>
          <p>Learn more about different types of draft modes.</p>
        </div>
      </div>
      <h1 className='play_now_text'>Play Now!</h1>
    </div>
  )
}

export default AmericalFootballBanner
