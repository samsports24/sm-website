import React from 'react'

const PowerRanking = ({ data, maxHeight = '500px' }) => {
  return (
    <div className='power_ranking_box'>
      <header>
        <h3>Power Ranking</h3>
      </header>
      <section className='power_ranking_body' style={{ maxHeight }}>
        {(!data?.teamRanks || data.teamRanks.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            No power rankings yet
          </div>
        )}
        {data?.teamRanks
          ?.sort((a, b) => (b?.teamScore?.score || 0) - (a?.teamScore?.score || 0))
          ?.map((v, i) => {
            const team = data?.teams?.find((x) => v?.teamId === x?._id)
            const isTop3 = i < 3
            return (
              <div key={i} className={`pr-row ${isTop3 ? 'pr-top3' : ''}`}>
                <span className={`pr-rank ${isTop3 ? 'pr-rank-top' : ''}`}>{i + 1}</span>
                <div
                  className='pr-logo'
                  style={{
                    backgroundImage: team?.logo ? `url(${team.logo})` : 'none',
                    borderColor: team?.teamColor || '#1A2332'
                  }}
                >
                  {!team?.logo && (
                    <span className='pr-logo-ph' style={{ background: team?.teamColor || '#1A2332' }}>
                      {(team?.name || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <div className='pr-info'>
                  <span className='pr-team-name'>{team?.name || 'Unknown'}</span>
                </div>
                <span className='pr-score'>{v?.teamScore?.score?.toFixed?.(2) || v?.teamScore?.score || '—'}</span>
              </div>
            )
          })}
      </section>
    </div>
  )
}

export default PowerRanking
