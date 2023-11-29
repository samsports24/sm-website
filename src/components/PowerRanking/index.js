import React from 'react'
// import { BiRightArrowAlt } from 'react-icons/bi'

const PowerRanking = ({ data, maxHeight = '500px' }) => {
  const getBoldName = (name) => {
    const splitted = name?.split(' ')
    let newText = ''
    if (splitted?.length > 1) {
      const allButLast = splitted.slice(0, -1).join(' ')
      const last = <b>{splitted[splitted.length - 1]}</b>
      newText = (
        <>
          {allButLast} {last}
        </>
      )
    } else {
      newText = <b>{name}</b>
    }
    return newText
  }

  return (
    <div className='power_ranking_box'>
      <header>
        <h3>Power Ranking</h3>
        {/* <p>
          View All <BiRightArrowAlt size={18} />
        </p> */}
      </header>
      <section className='power_ranking_body' style={{ maxHeight: maxHeight }}>
        {data?.teamRanks
          ?.sort((a, b) => b?.teamScore?.score - a?.teamScore?.score)
          ?.map((v, i) => {
            const team = data?.teams?.find((x) => v?.teamId === x?._id)
            return (
              <div
                key={i}
                className='card_box'
                style={{ backgroundColor: team?.teamColor || 'var(--primaryPurple)' }}
              >
                <h6>{i + 1}</h6>
                <div className='image_box' style={{ backgroundImage: `url(${team?.logo})` }} />
                <h3>{getBoldName(team?.name)}</h3>
                <div className='score_box'>
                  <p>{v?.teamScore?.score}</p>
                </div>
              </div>
            )
          })}
      </section>
    </div>
  )
}

export default PowerRanking
