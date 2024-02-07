import React from 'react'

const SelectGameLeft = ({ logo }) => {
  return (
    <div className='select_game_left'>
      {logo && (
        <div className='box_left'>
          <img className='logo' src={require(`../../assets/landing/logos/${logo}`)} alt='LOGO' />
        </div>
      )}
      <div className='box_right'>
        <img
          className='text_logo'
          src={require('../../assets/landing/titleRotate.png')}
          alt='SAMSPORTS'
        />
        <img
          className='text_logo2'
          src={require('../../assets/landing/title.png')}
          alt='SAMSPORTS'
        />
      </div>
    </div>
  )
}

export default SelectGameLeft
