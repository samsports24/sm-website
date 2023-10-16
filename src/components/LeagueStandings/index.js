import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// Mock Data
// import { proLeagueStandingsData } from '../../pages/mockData'
import { useNavigate } from 'react-router-dom'

const LeagueStandings = ({ data, maxHeight }) => {
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
      <section
        className='league_standings_body'
        style={{ maxHeight: maxHeight ? maxHeight : '1172px' }}
      >
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
                  <p className='text2'>{`${v?.teamScore?.win}-${v?.teamScore?.lose}-${v?.teamScore?.tie}`}</p>
                </div>
                <div>
                  <p className='text1'>AVG PF</p>
                  <p className='text2'>{v?.teamScore?.avgPf?.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text1'>AVG PA</p>
                  <p className='text2'>{v?.teamScore?.avgPa?.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text1'>DIV W‑L‑T</p>
                  <p className='text2'>{`${v?.teamScore?.divWin}-${v?.teamScore?.divLose}-${v?.teamScore?.divTie}`}</p>
                </div>
                <div>
                  <p className='text1'>DIV W‑L‑T</p>
                  <p className='text2'>{`${v?.teamScore?.confWin}-${v?.teamScore?.confLose}-${v?.teamScore?.confTie}`}</p>
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
