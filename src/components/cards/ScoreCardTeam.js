import React from 'react'
import { Image } from 'antd'

const ScoreCardTeam = ({ alignment, data }) => {
  return (
    <div className='sc-team'>
      <div
        className='team-card'
        style={{
          flexDirection: alignment == 'right' ? 'row-reverse' : 'row',
          padding: alignment == 'right' ? '16px 12px 16px 50px' : '16px 50px 16px 12px',
        }}
      >
        <div className='image-container'>
          <Image alt='team-logo' src={data?.logo} />
        </div>
        <div className='content'>
          <div className='top'>
            <p className='handle' style={{ textAlign: alignment == 'right' ? 'right' : 'left' }}>
              {/* {data?.handle} */}
            </p>
            <div style={{ flexDirection: alignment == 'right' ? 'row-reverse' : 'row' }}>
              <p className='name'>{data?.name}</p>
              <p className='score'>-</p>
            </div>
          </div>
          <div
            className='bottom'
            style={{ flexDirection: alignment == 'right' ? 'row-reverse' : 'row' }}
          >
            <div>
              <p className='percent'>0%</p>
              <p className='head-to-head'>0-0</p>
            </div>
            <div className='decimal'>{data?.decimal}</div>
          </div>
        </div>
      </div>

      {/* <div className='details'>
        <p className='label' style={{ textAlign: alignment == 'right' ? 'right' : 'left' }}>
          Yet to play (18)
        </p>
        <p className='positions' style={{ textAlign: alignment == 'right' ? 'right' : 'left' }}>
          QB. 2 RB,2 WR, TE, L 2 DE, D, 4 LB, 3DB, CB
        </p>
      </div> */}
    </div>
  )
}

export default ScoreCardTeam
