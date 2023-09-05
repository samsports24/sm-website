import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
// import { proLeagueStandingsData } from '../../pages/mockData'
import { useNavigate } from 'react-router-dom'

const LeagueStandings = ({ data }) => {
  const navigate = useNavigate()
  return (
    <div className='league_standings_box'>
      <header>
        <h3>League Standings</h3>
        <p
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate('/league-standings')
          }}
        >
          See Details <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='league_standings_body'>
        {data?.map((v) => {
          return (
            <div key={v._id} className='card_box'>
              <div className='header'>
                <p>{v?.team?.name}</p>
                <BiRightArrowAlt size={18} />
              </div>
              <div className='content'>
                <div>
                  <p className='text1'>W‑L‑T</p>
                  <p className='text2'>{`${v?.win}-${v?.lose}-${v?.tie}`}</p>
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
                  <p className='text2'>{`${v?.divWin}-${v?.divLose}-${v?.divTie}`}</p>
                </div>
                <div>
                  <p className='text1'>DIV W‑L‑T</p>
                  <p className='text2'>{`${v?.confWin}-${v?.confLose}-${v?.confTie}`}</p>
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
