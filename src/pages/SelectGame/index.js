import React, { useState } from 'react'

const SelectGame = () => {
  const [game, setGame] = useState('')
  const games = [
    {
      name: 'Football',
      image: require('../../assets/landing/logos/football.png'),
    },
    {
      name: 'College Football',
      image: require('../../assets/landing/logos/college-football.png'),
    },
    {
      name: 'Basketball',
      image: require('../../assets/landing/logos/basketball.png'),
    },
    {
      name: 'Eleven F.C',
      image: require('../../assets/landing/logos/eleven-fc.png'),
    },
    {
      name: 'Scouts',
      image: require('../../assets/landing/logos/scouts.png'),
    },
    {
      name: 'Baseball',
      image: require('../../assets/landing/logos/baseball.png'),
    },
    {
      name: 'Hockey',
      image: require('../../assets/landing/logos/hockey.png'),
    },
  ]

  return (
    <div className='select_game_container'>
      <div className='select_game_left'>
        <img src={require('../../assets/landing/title.png')} />
      </div>
      <div className='select_game_right'>
        <div className='top_section'>
          <p>No Leagues yet!</p>
          <p>Choose your Fantasy sport, level and leagues!</p>
          <p>(please note that the pro leagues are on invitation only)</p>
        </div>
        <div className='bottom_section'>
          {games.map((v) => {
            return (
              <div key={v} className={`image_box ${game === v.name ? 'activeGame' : ''}`}>
                <img src={v.image} alt={v.name} onClick={() => setGame(v.name)} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SelectGame
