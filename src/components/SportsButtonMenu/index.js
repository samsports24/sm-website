import React from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonMenu from '../ButtonMenu'

const SportsButtonMenu = () => {
  const navigate = useNavigate()

  return (
    <section className='sports_button_menu'>
      <h2>Sports:</h2>
      <div className='button_menu_box'>
        <ButtonMenu
          data={{
            buttonName: 'Football',
            item: [
              {
                name: 'Professional Leagues',
                navigate: '/professional-league',
                link: '',
              },
              {
                name: 'Public Leagues',
                navigate: '/public-league',
                link: '',
              },
            ],
          }}
        />
        <ButtonMenu
          data={{
            buttonName: 'Baseball',
            item: [],
          }}
        />
        <ButtonMenu
          data={{
            buttonName: 'Basketball',
            item: [],
          }}
        />
        <ButtonMenu
          data={{
            buttonName: 'Hockey',
            item: [
              {
                name: 'Professional Leagues',
                navigate: '',
                link: 'http://13.39.108.1:3003/professional-league',
              },
              {
                name: 'Public Leagues',
                navigate: '',
                link: 'http://13.39.108.1:3003/public-league',
              },
            ],
          }}
        />
        <ButtonMenu
          data={{
            buttonName: (
              <span onClick={() => navigate('/coming-soon')}>
                <span style={{ fontWeight: 400 }}>Coming</span>&nbsp;Soon
              </span>
            ),
            item: [],
          }}
        />
      </div>
    </section>
  )
}

export default SportsButtonMenu
