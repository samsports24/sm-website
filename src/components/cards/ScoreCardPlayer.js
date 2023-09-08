import React from 'react'
import { Image } from 'antd'

import Player1 from '../../assets/player-img-60x60.png'
// import Player2 from '../../assets/player-img-2-60x60.png'

const ScoreCardPlayer = ({ alignment, data }) => {
  return (
    <div className='sc-player'>
      <div
        className='top'
        style={{
          padding: alignment == 'right' ? '16px 12px 16px 70px' : '16px 70px 16px 12px',
          flexDirection: alignment == 'right' ? 'row-reverse' : 'row',
        }}
      >
        <div
          className='left'
          style={{ flexDirection: alignment == 'right' ? 'row-reverse' : 'row' }}
        >
          <Image
            className='player-img'
            alt='player'
            src={data?.player?.HostedHeadshotNoBackgroundUrl || Player1}
          />
          <p className='name'>{data?.player?.Name}</p>
          <p className='position'>
            {data?.player?.Position} - {data?.player?.Team}
          </p>
        </div>
        <p className='score'>{data?.player?.playerScore || '-'}</p>
      </div>
      <div
        className='bottom'
        style={{
          padding: alignment == 'right' ? '16px 12px 16px 50px' : '16px 50px 16px 12px',
          alignItems: alignment == 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <div style={{ flexDirection: alignment == 'right' ? 'row-reverse' : 'row' }}>
          <p className='time'>Next Oppenent: {data?.player?.UpcomingGameOpponent}</p>
          <p className='decimal'>0</p>
        </div>
        <p className='handle'>{data?.handle}</p>
      </div>
    </div>
  )
}

export default ScoreCardPlayer
