import React from 'react'
import { Image, Button } from 'antd'

// Image
import bellIcon from '../../assets/bell-icon.svg'
// import circaImage from '../../assets/teams/circa_sports_trout.png'
import logo from '../../assets/Logo.svg'
import { useSelector } from 'react-redux'

const Header = () => {
  const user = useSelector((state) => state.user.userDetails)

  return user?.team ? (
    <header className='gd-header'>
      <div className='left'>
        <div className='image_div'>
          <Image preview={false} src={user?.team.logo} />
        </div>
        <p>
          <span>League Notification</span> <img src={bellIcon} alt='Icon' />
        </p>
      </div>
      <div className='center'>
        <div className='title_box'>
          <h1>{user?.team?.name}</h1>
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
            <p> Same year Prize-Pool</p>
          </div>
          <div className='content2'>
            <div className='image_div'>
              <Image preview={false} src={logo} alt='UFAFL' />
            </div>
            <div className='content3'>
              <div className='top' style={{ marginBottom: '12px' }}>
                <span>23&apos;</span>
                <p>Prize-Pool</p>
              </div>
              <div className='top'>
                <span>23&apos;</span>
                <p>Prize-Pool</p>
              </div>
            </div>
          </div>
        </div>
        <h1>UFAFL Price_Pools</h1>
      </div>
    </header>
  ) : (
    <header className='gd-header'>
      <div className='center' style={!user && { columnGap: '20px', rowGap: '0' }}>
        <div className='title_box' style={!user && { minHeight: '110px' }}>
          <div>
            <p style={{ marginBottom: '20px !important' }}>SFL Price-Pool</p>
            <h1>{`23' Same Year Prize-Pool`}</h1>
          </div>
          <p>
            <img src={bellIcon} alt='Icon' />
          </p>
        </div>
        <div className='button_and_team_box'></div>
      </div>
      <div className='right'>
        <div className='content'>
          <div className='content2'>
            <div className='image_div'>
              <Image preview={false} src={logo} alt='UFAFL' />
            </div>
            <div className='content3'>
              <div className='top' style={{ marginBottom: '12px' }}>
                <span>24&apos;</span>
                <p>Prize-Pool</p>
              </div>
              <div className='top'>
                <span>25&apos;</span>
                <p>Prize-Pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
