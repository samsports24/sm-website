import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useSelector } from 'react-redux'

const NewLeagueScoreCard = ({ data }) => {
  const USER = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  const getName = (name) => {
    const array = name.split(' ')
    const length = array[0]?.length <= 3 ? true : false
    return length ? `${array[0]} ${array[1]}` : array[0]
  }

  const handleNavigate = (id) => {
    if (USER?.team?._id === id) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${id}`)
    }
  }

  return (
    <div className='nls_card'>
      <div className='nls_card_top'>
        <div className='nls_card_top_left'>
          <p onClick={() => handleNavigate(data?.opponentOne?._id)}>
            {getName(data?.opponentOne?.name)}
          </p>
          <p>
            ({data?.record?.teamOne?.win}-{data?.record?.teamOne?.lose})
          </p>
        </div>
        <div className='nls_card_top_center'>
          <div
            className='game_detail'
            onClick={() => {
              navigate('/game-details', {
                state: {
                  data,
                },
              })
            }}
          >
            <p>GAME DETAILS</p>
          </div>
        </div>
        <div className='nls_card_top_right'>
          <p>
            ({data?.record?.teamTwo?.win}-{data?.record?.teamTwo?.lose})
          </p>
          <p onClick={() => handleNavigate(data?.opponentTwo?._id)}>
            {getName(data?.opponentTwo?.name)}
          </p>
        </div>
      </div>
      <div className='nls_card_bottom'>
        <div className='nls_card_left'>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentOne?.logo})` }}
          ></div>
          <div className='nls_score_box_1'>
            <p>{data?.scoreOne || '0.00'}</p>
          </div>
        </div>
        <div className='nls_card_right'>
          <div className='nls_score_box_2'>
            <p>{data?.scoreTwo || '0.00'}</p>
          </div>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentTwo?.logo})` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default NewLeagueScoreCard
