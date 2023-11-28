import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import userImg from '../../assets/account.svg'

const PlayerRanking = ({ data }) => {
  return (
    <div className='player_ranking_box'>
      <header>
        <h3>Player Ranking (Top 200)</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='player_ranking_body'>
        {data?.playerRanks?.map((v, i) => {
          const team = data?.teams?.find((x) => v?.teamId === x?._id)

          return (
            <div
              key={i}
              className='card_box'
              style={{ backgroundColor: team?.teamColor || 'var(--primaryPurple)' }}
            >
              <div className='team_image_box' style={{ backgroundImage: `url(${team?.logo})` }} />
              <h3>
                {v?.players?.FirstName} <b>{v?.players?.LastName}</b>
              </h3>
              <div className='image_box'>
                <img src={v?.players?.HostedHeadshotNoBackgroundUrl || userImg} />
              </div>
              <div className='player_score_box'>
                <p>{v?.players?.playerScore}</p>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PlayerRanking
