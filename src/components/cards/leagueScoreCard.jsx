import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AiOutlineArrowRight } from 'react-icons/ai'
import dayjs from 'dayjs'

const LeagueScoreCard = ({ data: v }) => {
  const navigate = useNavigate()

  return (
    <div className='league_score_card_new'>
      <div className='league_score_card_content_main'>
        <div className='league_score_card_content_left'>
          <div className='league_score_card_heading_top'>
            <h2>
              {`${dayjs(v?.matchStartDate).format('ddd DD')} / ${dayjs(v?.matchEndDate).format(
                'DD',
              )}`}
            </h2>
          </div>
          <div className='league_score_box'>
            <div className='d-flex' style={{ gap: '10px', alignItems: 'center' }}>
              {/* <div className='img_box'>
                <img src={v?.opponentOne?.logo} />
              </div> */}
              <h3 className='opacity'>{v?.opponentOne?.name}</h3>
            </div>
            <div className='d-flex' style={{ gap: '10px', alignItems: 'center' }}>
              {/* <div className='img_box'>
                <img src={v?.opponentTwo?.logo} />
              </div> */}
              <h3 className='opacity'>{v?.opponentTwo?.name}</h3>
            </div>
          </div>
        </div>
        <div className='league_score_card_content_center'>
          <div className='league_score_card_heading_top'>
            <h4>Record</h4>
          </div>
          <div className='league_score_box'>
            <p className='opacity'>
              {v?.record?.teamOne?.win}-{v?.record?.teamOne?.lose}-{v?.record?.teamOne?.tie}
            </p>
            <p className='opacity'>
              {v?.record?.teamTwo?.win}-{v?.record?.teamTwo?.lose}-{v?.record?.teamTwo?.tie}
            </p>
          </div>
        </div>
        <div className='league_score_card_content_right' style={{ flex: 1 }}>
          <div className='league_score_card_heading_top'>
            <h4 style={{ textAlign: 'right' }}>GAME SCORE</h4>
          </div>
          <div className='league_score_box'>
            <p style={{ textAlign: 'right' }}>{v?.scoreOne}</p>
            <p style={{ textAlign: 'right' }}>{v?.scoreTwo}</p>
          </div>
        </div>
      </div>
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
