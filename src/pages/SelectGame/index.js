import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectGameLeft from './SelectGameLeft'
import SelectGameRight from './SelectGameRight'

const SelectGame = () => {
  const [game, setGame] = useState('')
  const navigate = useNavigate()

  const games = [
    {
      key : "football",
      name: 'Football',
      imagePath: 'football.png',
    },
    {
      key : "college_football",
      name: 'College Football',
      imagePath: 'college-football.png',
    },
    {
      key : "basketball",
      name: 'Basketball',
      imagePath: 'basketball.png',
    },
    {
      key : "eleven_fc",
      name: 'Eleven F.C',
      imagePath: 'eleven-fc.png',
    },
    {
      key : "scouts",
      name: 'Scouts',
      imagePath: 'scouts.png',
    },
    {
      key : "baseball",
      name: 'Baseball',
      imagePath: 'baseball.png',
    },
    {
      key : "hockey",
      name: 'Hockey',
      imagePath: 'hockey.png',
    },
  ]

  return (
    <div className='select_game_container'>
      <SelectGameLeft />
      <SelectGameRight>
        <div className='top_section'>
          <p style={{ marginBottom: '5px' }}>Choose your Fantasy sport, level and leagues!</p>
          <p>(please note that the pro leagues are on invitation only)</p>
        </div>
        <div className='bottom_section'>
          {games.map((v) => {
            return (
              <div key={v?.name} className={`image_box ${game === v.key ? 'activeGame' : ''}`}>
                <img
                  src={require(`../../assets/landing/logos/${v.imagePath}`)}
                  alt={v.name}
                  onClick={() => {
                    setGame(v.key)
                    localStorage.setItem('selectedGame', v.key)
                    localStorage.setItem('imagePath', v.imagePath)
                    navigate('/signup')
                  }}
                />
              </div>
            )
          })}
        </div>
      </SelectGameRight>
    </div>
  )
}

export default SelectGame
