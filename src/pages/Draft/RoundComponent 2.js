import React from 'react'
// import { FaArrowsRotate } from 'react-icons/fa6'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useSelector } from 'react-redux'
import { positions } from '../../config/constants'

const RoundComponent = ({ height }) => {
  const { currentLeague } = useSelector((state) => state.league)
  const { draftRounds, draftCounter, onTheClock } = useSelector((state) => state.draft)

  //   sort((a, b) => {
  //     if (a.round !== b.round) {
  //         return a.round - b.round; // Sort by round
  //     } else {
  //         return a.position - b.position; // Sort by position within the same round
  //     }
  // });

function mapPosition(position) {
  return positions[position] || position;
}

  return (
    <div className='round_box' style={{ maxHeight: height ? height : '500px' }}>
      <div className='rb_header'>
        <p>
          {onTheClock && currentLeague?.isDraftLive ? `Round ${onTheClock?.round}` : 'Draft Order'}
        </p>
      </div>
      <div className='rb_body'>
        {draftRounds
          ?.sort((a, b) => {
            if (a.round !== b.round) {
              return a.round - b.round // Sort by round
            } else {
              return a.position - b.position // Sort by position within the same round
            }
          })
          ?.map((v, i) => {
            return (
              <div
                key={i}
                className={`rb_card ${
                  v?._id === onTheClock?._id && currentLeague?.isDraftLive
                    ? 'bgPurple'
                    : !!v?.playerPick
                    ? 'bgGray'
                    : 'bgNormal'
                }`}
              >
                <div className='rb_card_left'>
                  {v?.playerPick && (
                    v?.playerPick?.HostedHeadshotNoBackgroundUrl
                      ? <img src={v.playerPick.HostedHeadshotNoBackgroundUrl} loading="lazy" />
                      : <GiAmericanFootballPlayer size={32} color='rgba(255,255,255,0.25)' />
                  )}
                </div>
               
                <div
                  className='rb_card_center'
                  style={{ backgroundImage: `url(${v?.team?.logo})` }}
                >
                  {/* <FaArrowsRotate color='var(--primary)' size={25} /> */}
                </div>
                <div className='rb_card_right'>
                  <p>
                    Pick # {v?.round}.{v?.position}
                  </p>
                  <p>{v?.team?.name}</p>
                  {v?.playerPick && (
                    <p style={{ color: 'var(--primary) !important' }}>
                      {mapPosition(v?.playerPick?.Position)} - {v?.playerPick?.FirstName}{' '}
                      {v?.playerPick?.LastName}
                    </p>
                  )}
                </div>

                     <div style={{ color: 'var(--primary) !important' }} className='rb_card_left'>
                  {v?.team?.autoDraft ? 'Auto Draft':null}
                </div>
                {v?._id === onTheClock?._id && currentLeague?.isDraftLive && (
                  <div className='rb_card_end'>
                    <p>On The Clock</p>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default RoundComponent
