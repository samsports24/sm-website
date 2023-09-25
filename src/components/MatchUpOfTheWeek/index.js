import React from 'react'
import dayjs from 'dayjs'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

const MatchUpOfTheWeek = ({ data: v }) => {
  const navigate = useNavigate()

  return (
    <div className='match_up_box'>
      <div className='header'>
        <h1>Match-Up Of The Week</h1>
      </div>
      <div className='date_and_time'>
        <h3>{dayjs(v?.matchStartDate).format('ddd, Do MMM YYYY')}</h3>
      </div>
      <div className='teams'>
        <div className='team1'>
          <div className='image_div'>
            <img src={v?.opponentOne?.logo} />
          </div>
          <div className='content'>
            <h3>{v?.opponentOne?.name}</h3>
            <p>
              <span>Points:</span> {v?.scoreOne || 0}
            </p>
          </div>
        </div>
        <div className='versus'>
          <img src={require('../../assets/versus-12.png')} />
        </div>
        <div className='team1 team2'>
          <div className='content'>
            <h3>{v?.opponentTwo?.name}</h3>
            <p>
              <span>Points:</span> {v?.scoreTwo || 0}
            </p>
          </div>
          <div className='image_div'>
            <img src={v?.opponentTwo?.logo} />
          </div>
        </div>
      </div>
      <div
        className='footer'
        onClick={() => {
          navigate('/game-details', {
            state: {
              team1: v?.opponentOne,
              team2: v?.opponentTwo,
              scoreOne: v?.scoreOne ? v?.scoreOne : null,
              scoreTwo: v?.scoreTwo ? v?.scoreTwo : null,
            },
          })
        }}
      >
        <h3>
          Must-Watch Game of the Week <BiRightArrowAlt size={20} style={{ marginBottom: '-4px' }} />
        </h3>
      </div>
    </div>
  )
}

export default MatchUpOfTheWeek
