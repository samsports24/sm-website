import moment from 'moment'
import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

const MatchUpOfTheWeek = () => {
  return (
    <div className='match_up_box'>
      <div className='header'>
        <h1>Match-Up Of The Week</h1>
      </div>
      <div className='date_and_time'>
        <h3>{moment(new Date()).format('ddd, Do MMM YYYY  |  h:mm a')}</h3>
      </div>
      <div className='teams'>
        <div className='team1'>
          <div className='image_div'>
            <img src={require('../../assets/teams/rowdys.png')} />
          </div>
          <div className='content'>
            <h3>Rowdys Square</h3>
            <p>
              <span>Points:</span> +3.214
            </p>
          </div>
        </div>
        <div className='versus'>
          <img src={require('../../assets/versus-12.png')} />
        </div>
        <div className='team1 team2'>
          <div className='content'>
            <h3>Kraken Square</h3>
            <p>
              <span>Points:</span> +3.214
            </p>
          </div>
          <div className='image_div'>
            <img src={require('../../assets/teams/kraken.png')} />
          </div>
        </div>
      </div>
      <div className='footer'>
        <h3>
          Must-Watch Game of the Week <BiRightArrowAlt size={20} style={{ marginBottom: '-4px' }} />
        </h3>
      </div>
    </div>
  )
}

export default MatchUpOfTheWeek
