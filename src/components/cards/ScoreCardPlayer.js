import React from 'react'
import { Image } from 'antd'

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
          <Image className='player-img' alt='player' src={data?.image} />
          <p className='name'>{data?.name}</p>
          <p className='position'>{data?.position}</p>
        </div>
        <p className='score'>-</p>
      </div>
      <div
        className='bottom'
        style={{
          padding: alignment == 'right' ? '16px 12px 16px 50px' : '16px 50px 16px 12px',
          alignItems: alignment == 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <div style={{ flexDirection: alignment == 'right' ? 'row-reverse' : 'row' }}>
          <p className='time'>{data?.matchTime}</p>
          <p className='decimal'>3.97</p>
        </div>
        <p className='handle'>{data?.handle}</p>
      </div>
    </div>
  )
}

export default ScoreCardPlayer
