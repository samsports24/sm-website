import React from 'react'

const UserLog = ({ data }) => {
  return (
    <div className='player_ranking_box'>
      <header>
        <h3>User Log</h3>
      </header>
      <section className='player_ranking_body'>
        {data?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <h6>{i + 1}.</h6>
              <h6>102= USER222</h6>
              {/* <div className='image_box'>
                <img src={userImg} />
              </div>
              <h3>{v?.player?.Name}</h3>
              <p>{v?.score}</p> */}
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default UserLog
