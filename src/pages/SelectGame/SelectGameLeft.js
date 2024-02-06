import React from 'react'

const SelectGameLeft = ({ logo }) => {
  return (
    <div className='select_game_left'>
      {logo && (
        <img className='logo' src={require(`../../assets/landing/logos/${logo}`)} alt='LOGO' />
      )}
      <img
        className='text_logo'
        src={require('../../assets/landing/titleRotate.png')}
        alt='SAMSPORTS'
      />
      <img className='text_logo2' src={require('../../assets/landing/title.png')} alt='SAMSPORTS' />
    </div>
  )
}

export default SelectGameLeft
