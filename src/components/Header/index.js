import React, { useState } from 'react'
import { Image, Badge } from 'antd'

// Image
import bellIcon from '../../assets/bell-icon.svg'
// import circaImage from '../../assets/teams/circa_sports_trout.png'
import logo from '../../assets/sam-football.png'
import { useSelector } from 'react-redux'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import RoutesButton from '../RoutesButton'
import { leagueSalaryCap } from '../../config/constants'

const Header = () => {
  const record = useSelector((state) => state.user.record)
  const user = useSelector((state) => state.user.userDetails)
  const teamSalary = useSelector((state) => state.user.teamSalaryCap)
  const { notificationCount } = useSelector((state) => state.user)
  const [auctionCount] = useState(null)
  const navigate = useNavigate()

  const teamFinancials = () => {
    navigate('/team-financials')
  }

  return user?.team ? (
    <header className='gd-header'>
      <div className='left'>
        <div className='image_div'>
          <Image preview={false} src={user?.team?.logo} />
        </div>
        <p style={{ cursor: 'pointer' }} onClick={() => navigate('/league-notification')}>
          <span style={{ color: !!notificationCount ? 'red' : ' var(--lightGrayText)' }}>
            League Notification
          </span>{' '}
          {notificationCount ? (
            <Badge count={notificationCount}>
              <img src={bellIcon} alt='Icon' />
            </Badge>
          ) : (
            <img src={bellIcon} alt='Icon' />
          )}
        </p>
      </div>
      <div className='center'>
        <div className='title_box'>
          <h1>{user?.team?.name}</h1>
          <p onClick={() => navigate('/player-auction')}>
            <span>Live Player Auction</span>{' '}
            {auctionCount ? (
              <Badge count={auctionCount}>
                <img src={bellIcon} alt='Icon' />
              </Badge>
            ) : (
              <img src={bellIcon} alt='Icon' />
            )}
          </p>
        </div>
        <div className='button_and_team_box'>
          <div className='button_box'>
            <div>
              <span>Overall Record</span>
              <span>
                {record?.overall?.win}-{record?.overall?.lose}-{record?.overall?.tie}
              </span>
            </div>
            <div>
              <span>Division Record</span>
              <span>
                {record?.division?.win}-{record?.division?.lose}-{record?.division?.tie}
              </span>
            </div>
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
              {/* <span>$199,759,446</span> */}
              <span>{`$${leagueSalaryCap?.toLocaleString()}`}</span>
            </div>
            <div>
              <p>Team Salary Cap</p>
              <span>{`$${teamSalary?.toLocaleString()}`}</span>
            </div>
            <div>
              <p>Team Cap Left</p>
              <span>{`$${(leagueSalaryCap - teamSalary)?.toLocaleString()}`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='right'>
        <div className='content'>
          <div className='top'>
            <span style={{ width: '100%', textAlign: 'right' }}>
              <span>23&apos;</span> &nbsp;
              <span>SAMS 1,491,526</span>
            </span>
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
    <>
      <header className='gd-header'>
        <div className='center' style={!user ? { columnGap: '20px', rowGap: '0' } : null}>
          <div className='title_box' style={!user ? { minHeight: '110px' } : null}>
            <div>
              <p style={{ marginBottom: '20px !important' }}>SFL Prize-Pool</p>
              <h1>{`23' SAMS 1,491,526`}</h1>
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

      <RoutesButton />
    </>
  )
}

export default Header
