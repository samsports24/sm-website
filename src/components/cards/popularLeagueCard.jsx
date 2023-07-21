import React from 'react'

// icons
import Icons from '../../assets/icons.svg'
import Dice from '../../assets/dice.svg'
import Refresh from '../../assets/refresh.svg'
import Hammer from '../../assets/hammer.svg'
import Crown from '../../assets/crown.svg'

const PopularLeagueCard = ({ data }) => {
  return (
    <div className='league-card '>
      <div
        className='container1'
        style={{
          backgroundImage: `url(${data?.image})`,
        }}
      >
        <div className='content'>
          <h1>{data?.title || ''}</h1>
          <h3>{data?.description}</h3>
        </div>
      </div>
      <div className='container2'>
        <div className='row1'>
          <div className='col'>
            <span>PLAYERS</span>
            <p>
              <img src={Dice} /> {data.players[0]}-{data.players[1]}
            </p>
          </div>
          <div className='col'>
            <span>DRAFT OPENS</span>
            <p>
              <img src={Icons} /> Open Now
            </p>
          </div>
        </div>
        <div className='row2'>
          <div style={{ width: '100%' }}>
            <p>popular ways to play</p>
            <div className='labels'>
              <div className='d-flex'>
                <img src={Refresh} />
                Redraft
              </div>
              <div className='d-flex'>
                <img src={Hammer} />
                Auction
              </div>
              <div className='d-flex'>
                <img src={Crown} />
                Dynasty
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='container3'>
        <img src={require('../../assets/players.png')} />
        <span>3,000,000+ players</span>
      </div>
    </div>
  )
}

export default PopularLeagueCard
