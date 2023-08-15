import React from 'react'
import { Image, Button } from 'antd'

// Image
import bellIcon from '../../assets/bell-icon.svg'
import circaImage from '../../assets/teams/circa_sports_trout.png'
import logo from '../../assets/Logo.svg'

const Header = () => {
  return (
    <header className='gd-header'>
      <div className='left'>
        <div className='image_div'>
          <Image preview={false} src={circaImage} />
        </div>
        <p>
          <span>League Notification</span> <img src={bellIcon} alt='Icon' />
        </p>
      </div>
      <div className='center'>
        <div className='title_box'>
          <h1>Circa Sports Trout</h1>
          <p>
            <span>Live Player Auction</span> <img src={bellIcon} alt='Icon' />
          </p>
        </div>
        <div className='button_and_team_box'>
          <div className='button_box'>
            <Button>Overall Record</Button>
            <Button>Division Record</Button>
          </div>
          <div className='team_financials_box'>
            <p>Team Financials</p>
            <div>
              <p>Live Player Auction</p>
              <span>---</span>
            </div>
            <div>
              <p>Live Player Auction</p>
              <span>---</span>
            </div>
          </div>
        </div>
      </div>
      <div className='right'>
        <div className='content'>
          <div className='top'>
            <span>23&apos;</span>
            <p> Same year Price-Pool</p>
          </div>
          <div className='content2'>
            <div className='image_div'>
              <Image preview={false} src={logo} alt='UFAFL' />
            </div>
            <div className='content3'>
              <div className='top' style={{ marginBottom: '12px' }}>
                <span>23&apos;</span>
                <p>Price-Pool</p>
              </div>
              <div className='top'>
                <span>23&apos;</span>
                <p>Price-Pool</p>
              </div>
            </div>
          </div>
        </div>
        <h1>UFAFL Price_Pools</h1>
      </div>
    </header>
  )
}

export default Header
