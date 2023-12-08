import React from 'react'
import { FaArrowsRotate } from 'react-icons/fa6'

const RoundComponent = ({ height }) => {
  return (
    <div className='round_box' style={{ maxHeight: height ? height : '500px' }}>
      <div className='rb_header'>
        <p>Round 7</p>
      </div>
      <div className='rb_body'>
        {Array(10)
          .fill({})
          .map((v, i) => {
            return (
              <div key={i} className='rb_card'>
                <div className='rb_card_left'>
                  <p>74.</p>
                </div>
                <div className='rb_card_center'>
                  <FaArrowsRotate color='var(--primary)' size={25} />
                </div>
                <div className='rb_card_right'>
                  <p>Team 2</p>
                  <p>Needs: QB K DEF</p>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default RoundComponent
