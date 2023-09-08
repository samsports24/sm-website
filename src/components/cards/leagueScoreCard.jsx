import { Button } from 'antd'
// import moment from 'moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineArrowRight } from 'react-icons/ai'
import dayjs from 'dayjs'

const LeagueScoreCard = ({ data: v }) => {
  const navigate = useNavigate()

  return (
    <div className='league-score-card'>
      <h2>
        {`${dayjs(v?.matchStartDate).format('ddd DD')} / ${dayjs(v?.matchEndDate).format('DD')}`}
      </h2>
      <div className='line'></div>
      {/* {data?.scores?.map((v, index) => ( */}
      <div className='score-row'>
        <div className='d-flex' style={{ gap: '10px' }}>
          <img src={v?.image} />
          <p>
            {v?.opponentOne?.name}&nbsp;
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600 }}>
              ({v?.scoreOne})
            </span>
          </p>
        </div>
        <h6>
          0-0-<span>0</span>
        </h6>
      </div>
      <div className='score-row'>
        <div className='d-flex' style={{ gap: '10px' }}>
          <img src={v?.image} />
          <p>
            {v?.opponentTwo?.name}&nbsp;
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600 }}>
              ({v?.scoreTwo})
            </span>
          </p>
        </div>
        <h6>
          0-0-<span>0</span>
        </h6>
      </div>
      {/* ))} */}
      <div className='line'></div>
      <Button
        onClick={() => {
          navigate('/game-details', {
            state: {
              team1: v?.opponentOne,
              team2: v?.opponentTwo,
              scoreOne: v?.scoreOne,
              scoreTwo: v?.scoreTwo,
            },
          })
        }}
        type='primary'
        style={{ alignSelf: 'end' }}
      >
        Game Details &nbsp; <AiOutlineArrowRight className='button-icon' size={16} />
      </Button>
    </div>
  )
}

export default LeagueScoreCard
