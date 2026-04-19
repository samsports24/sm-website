import React from 'react'
import userImg from '../../assets/account.svg'

const PlayerRanking = ({ data, maxHeight = '500px' }) => {
  // Limit to top 50 players
  const players = data?.playerRanks?.slice(0, 50) || []

  return (
    <div className='player_ranking_box'>
      <header>
        <h3>Player Ranking (Top 50)</h3>
      </header>
      <section className='player_ranking_body' style={{ maxHeight }}>
        {players.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            No player rankings yet
          </div>
        )}
        {players.map((v, i) => {
          const team = data?.teams?.find((x) => v?.teamId === x?._id)
          const isTop3 = i < 3
          return (
            <div key={i} className={`plr-row ${isTop3 ? 'plr-top3' : ''}`}>
              <span className={`plr-rank ${isTop3 ? 'plr-rank-top' : ''}`}>{i + 1}</span>
              <img
                className='plr-headshot'
                src={v?.players?.HostedHeadshotNoBackgroundUrl || userImg}
                alt=''
                onError={(e) => { e.target.src = userImg }}
              />
              <div className='plr-info'>
                <span className='plr-name'>
                  {v?.players?.FirstName} <strong>{v?.players?.LastName}</strong>
                </span>
                <span className='plr-team'>{team?.name || ''}</span>
              </div>
              <span className='plr-score'>{v?.players?.playerScore || '—'}</span>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PlayerRanking
