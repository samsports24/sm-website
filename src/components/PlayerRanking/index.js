import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { playerRankingData } from '../../pages/mockData'

const PlayerRanking = () => {
  return (
    <div className='power_ranking_box'>
      <header>
        <h3>Player Ranking</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='league_standings_body'>
        {playerRankingData?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <h6>{i + 1}.</h6>
              <img src={v?.imageUrl} />
              <h3>{v?.title}</h3>
              <p>{v?.amount}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PlayerRanking
