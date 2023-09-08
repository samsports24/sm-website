import React from 'react'
// import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
// import { powerRankingData } from '../../pages/mockData'

const PowerRanking = ({ data }) => {
  return (
    <div className='power_ranking_box'>
      <header>
        <h3>Power Ranking</h3>
        {/* <p>
          View All <BiRightArrowAlt size={18} />
        </p> */}
      </header>
      <section className='power_ranking_body'>
        {data?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <h6>{i + 1}.</h6>
              <div className='image_box'>
                <img src={v?.team?.logo} />
              </div>
              <h3>{v?.team?.name}</h3>
              <p>{v?.teamScore?.score}</p>
              {/* <p>{v?.score2}</p> */}
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PowerRanking
