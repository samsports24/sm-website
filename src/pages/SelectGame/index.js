import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectGameLeft from './SelectGameLeft'
import SelectGameRight from './SelectGameRight'

import { IoIosArrowRoundBack } from 'react-icons/io'

const SelectGame = () => {
  const [game, setGame] = useState('')
  const navigate = useNavigate()

  const games = [
    {
      key: 'football',
      name: 'Football',
      imagePath: 'football.png',
      disabled: false,
    },
    {
      key: 'hockey',
      name: 'Hockey',
      imagePath: 'hockey.png',
      disabled: false,
    },
    {
      key: 'baseball',
      name: 'Baseball',
      imagePath: 'baseball.png',
      disabled: true,
    },
    {
      key: 'college_football',
      name: 'College Football',
      imagePath: 'college-football.png',
      disabled: true,
    },
    {
      key: 'basketball',
      name: 'Basketball',
      imagePath: 'basketball.png',
      disabled: true,
    },
    {
      key: 'eleven_fc',
      name: 'Eleven F.C',
      imagePath: 'eleven-fc.png',
      disabled: true,
    },
    {
      key: 'scouts',
      name: 'Scouts',
      imagePath: 'scouts.png',
      disabled: true,
    },
  ]

  return (
    <div className='select_game_container'>
      <SelectGameLeft logo={'ultimate-sports.png'} />
      <SelectGameRight>
        <div className='back_box' onClick={() => navigate(-1)}>
          <IoIosArrowRoundBack color='#fff' size={30} />
          <p>Back</p>
        </div>
        <div className='top_section'>
          <p style={{ marginBottom: '5px' }}>Choose your Fantasy sport, level and leagues!</p>
          <p>(please note that the pro leagues are on invitation only)</p>
        </div>
        <div className='bottom_section'>
          {games.map((v) => {
            return (
              <div
                key={v?.name}
                className={`image_box ${game === v.key ? 'activeGame' : ''} ${
                  v?.disabled ? 'noDrop' : 'cursor'
                }`}
                onClick={() => {
                  if (!v?.disabled) {
                    setGame(v.key)
                    localStorage.setItem('selectedGame', v.key)
                    localStorage.setItem('imagePath', v.imagePath)
                    navigate('/signup')
                  }
                }}
              >
                <img src={require(`../../assets/landing/logos/${v.imagePath}`)} alt={v.name} />
              </div>
            )
          })}
        </div>
      </SelectGameRight>
    </div>
  )
}

export default SelectGame
