import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
import { proLeagueStandingsData } from '../../pages/mockData'

const LeagueStandings = () => {
  return (
    <div className='league_standings_box'>
      <header>
        <h3>League Standings</h3>
        <p>
          See Details <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='league_standings_body'>
        {proLeagueStandingsData?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <div className='header'>
                <p>{v?.title}</p>
                <BiRightArrowAlt size={18} />
              </div>
              <div className='content'>
                <div>
                  <p className='text1'>W‑L‑T</p>
                  <p className='text2'>{v?.wlt}</p>
                </div>
                <div>
                  <p className='text1'>AVG PF</p>
                  <p className='text2'>{v?.avgPf}</p>
                </div>
                <div>
                  <p className='text1'>AVG PA</p>
                  <p className='text2'>{v?.avgPa}</p>
                </div>
                <div>
                  <p className='text1'>DIV W‑L‑T</p>
                  <p className='text2'>{v?.divWlt}</p>
                </div>
                <div>
                  <p className='text1'>DIV W‑L‑T</p>
                  <p className='text2'>{v?.divWlt2}</p>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default LeagueStandings
