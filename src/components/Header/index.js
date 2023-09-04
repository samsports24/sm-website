import React from 'react'
import { Image, Button } from 'antd'

// Image
import bellIcon from '../../assets/bell-icon.svg'
// import circaImage from '../../assets/teams/circa_sports_trout.png'
import logo from '../../assets/sam-football.png'
import { useSelector } from 'react-redux'
import { BiRightArrowAlt } from 'react-icons/bi'

const Header = () => {
  const user = useSelector((state) => state.user.userDetails)

  const teamFinancials = () => {}

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
            <div style={{ cursor: 'pointer' }} onClick={teamFinancials}>
              <h4>Team Financials</h4>
              <h4>
                <BiRightArrowAlt size={18} />
              </h4>
            </div>
            <div>
              <p>League Salary Cap</p>
              <span>$199,759,446</span>
            </div>
            <div>
              <p>Team Salary Cap</p>
              <span>$189,890,858</span>
            </div>
            <div>
              <p>Team Cap Left</p>
              <span>$9,868,588</span>
            </div>
          </div>
        </div>
      </div>
      <div className='right'>
        <div className='content'>
          <div className='top'>
            <span>23&apos;</span>
            <p> Same year SFL Prize-Pool</p>
          </div>
          <div className='content2'>
            <div className='image_div'>
              <Image preview={false} src={logo} alt='UFAFL' />
            </div>
            <div className='content3'>
              <div className='top' style={{ marginBottom: '12px' }}>
                <span>24&apos;</span>
                <p>SFL Prize-Pool</p>
              </div>
              <div className='top'>
                <span>25&apos;</span>
                <p>SFL Prize-Pool</p>
              </div>
            </div>
          </div>
        </div>
        <h1>SFL Prize_Pools</h1>
      </div>
    </header>
  ) : (
    <header className='gd-header'>
      <div className='center' style={!user && { columnGap: '20px', rowGap: '0' }}>
        <div className='title_box' style={!user && { minHeight: '110px' }}>
          <div>
            <p style={{ marginBottom: '20px !important' }}>SFL Prize-Pool</p>
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
                <p>SFL Prize-Pool</p>
              </div>
              <div className='top'>
                <span>25&apos;</span>
                <p>SFL Prize-Pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
