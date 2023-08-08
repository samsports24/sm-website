import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { powerRankingData } from '../../pages/mockData'

const PowerRanking = () => {
  return (
    <div className='power_ranking_box'>
      <header>
        <h3>Power Ranking</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='power_ranking_body'>
        {powerRankingData?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <h6>{i + 1}.</h6>
              <div className='image_box'>
                <img src={v?.imageUrl} />
              </div>
              <h3>{v?.title}</h3>
              <p>{v?.text1}</p>
              <p>{v?.text2}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PowerRanking
