import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import userImg from '../../assets/account.svg'

// Mock Data
// import { playerRankingData } from '../../pages/mockData'

const PlayerRanking = ({ data }) => {
  return (
    <div className='player_ranking_box'>
      <header>
        <h3>Player Ranking (Top 50)</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='player_ranking_body'>
        {data?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <h6>{i + 1}.</h6>
              <div className='image_box'>
                <img src={v?.players?.HostedHeadshotNoBackgroundUrl || userImg} />
              </div>
              <h3>{v?.players?.Name}</h3>
              <p>{v?.players?.playerScore}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PlayerRanking
