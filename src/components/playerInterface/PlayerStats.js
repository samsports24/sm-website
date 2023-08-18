import { proLeagueStandingsData } from '../../pages/mockData'

const PlayerStats = () => {
  return (
    <div className='player_info_card info_center'>
      <h2>Player Past & Projected Stats & Scores</h2>
      <div style={{ marginTop: '-12px' }}>
        {proLeagueStandingsData?.slice(0, 5)?.map((v, i) => {
          return (
            <div key={i} className='content'>
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
          )
        })}
      </div>
    </div>
  )
}

export default PlayerStats
