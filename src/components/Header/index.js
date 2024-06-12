import React, { useState } from 'react'
import { Image, Badge, Spin, Button } from 'antd'

// Image
import bellIcon from '../../assets/bell-icon.svg'
import logo from '../../assets/sam-football.png'
import sampointslogo from '../../assets/samcoinlogo.png'
import { useSelector } from 'react-redux'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { leagueSalaryCap } from '../../config/constants'
import ConnectWallet from '../ConnectWallet'
import LeaguePointsTransfer from '../modal/LeaguePointsTransfer'
import { TransferPointsToLeague } from '../../redux/actions/leagueActions'

const Header = () => {
  const record = useSelector((state) => state.user.record)
  const user = useSelector((state) => state.user.userDetails)
  const leagueType = user?.team?.currentLeague?.leagueType
  const teamSalary = useSelector((state) => state.user.teamSalaryCap)
  const { notificationCount } = useSelector((state) => state.user)
  const { auctionCount } = useSelector((state) => state.user)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [modalVisible, setModalVisible] = useState(false)
  const [leaguepoints, setLeaguepoints] = useState('')
  const navigate = useNavigate()

  const teamFinancials = () => {
    navigate('/team-financials')
  }

   
//  season:user?.team?.currentLeague?.season
  
  const confirm = () => {
    
    setModalVisible(true)
  }

  const handletransferleaguepoints = async () => {
    try {
      const payload = {
        userid:user?._id,
        leagueid: user?.team?.currentLeague._id,
        teamid: user?.team?._id,
        leaguepoints: parseFloat(leaguepoints),
        season:user?.team?.currentLeague?.season
      }  

      console.log('payload',payload);
    const data = await TransferPointsToLeague(payload)
     console.log('poinst transfer to league wallet successfully:', data)
      // cancel()
    } catch (error) {
      console.error('Error in transfering the league wallet :', error)
    }
  }

  return user && user?.team ? (
    <>
      <header className='gd-header no-scrollbar'>
        <div className='left'>
          <div className='image_div'>
            <Image preview={false} src={user?.team?.logo || logo} />
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
              {/* {auctionCount ? (
              <Badge count={auctionCount}>
                <img src={bellIcon} alt='Icon' />
              </Badge>
            ) : (
              <img src={bellIcon} alt='Icon' />
            )} */}
              {
                <Badge count={auctionCount} color='#cdb51b'>
                  <img src={bellIcon} alt='Icon' />
                </Badge>
              }
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

            <div className='leaguepointswallet'>
              <h4>
                LEAGUE SAM
                <span> POINTS</span>
              </h4>

              <div className='leaguediff'>
                <div className='leaguedifflex'>
                  <img className='imgdiv' src={sampointslogo} alt='SAMPOINTS' />
                  <div className='leaguemoney'>{sampoints?.toLocaleString() || '0'}</div>
                </div>
                <Button
                  className='addmore'
                  // loading={loading}
                  type='primary'
                   onClick={confirm}
                >
                  ADD MORE
                </Button>
              </div>
            </div>
          </div>
        </div>
        {leagueType === 'Professional' ||
          ('public' && (
            // <div className='right'>
            //   <div className='content'>
            //     <div className='top'>
            //       <span style={{ width: '100%', textAlign: 'right' }}>
            //         <span>23&apos;</span> &nbsp;
            //         <span>SAMS 1,491,526</span>
            //       </span>
            //     </div>
            //     <div className='content2'>
            //       <div className='image_div'>
            //         <Image preview={false} src={logo} alt='UFAFL' />
            //       </div>
            //       <div className='content3'>
            //         <div className='top' style={{ marginBottom: '12px' }}>
            //           <span>24&apos;</span>
            //           <p>SFL Prize-Pool</p>
            //         </div>
            //         <div className='top'>
            //           <span>25&apos;</span>
            //           <p>SFL Prize-Pool</p>
            //         </div>
            //       </div>
            //     </div>
            //   </div>
            //   <h1>SFL Prize_Pools</h1>
            // </div>

            <div className='right'>
              <div className='content'>
                <div className='content2'>
                  <div className='image_div'>
                    <Image preview={false} src={logo} alt='UFAFL' />

                    <Image
                      style={{ marginTop: '50px' }}
                      preview={false}
                      src={sampointslogo}
                      alt='SAMPOINTS'
                    />
                  </div>

                  <div className='content3'>
                    <div className='top' style={{ marginBottom: '12px' }}>
                      <span>SAM&apos;</span>
                      <p>TOKENS</p>
                    </div>
                    <div>
                      <ConnectWallet />
                    </div>
                    <div className='top'>
                      <span>SAM&apos;</span>
                      <p>POINTS</p>
                    </div>
                    <div className='money'>{user?.mainWallet?.toLocaleString() || '0'}</div>
                    <Button
                      className='buymore'
                      onClick={() => navigate('/buy-sam-points')}
                      type='primary'
                    >
                      BUY MORE
                    </Button>
                  </div>
                </div>
              </div>
              <h1>SFL Prize_Pools</h1>
            </div>
          ))}
      </header>

      <LeaguePointsTransfer
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handletransferleaguepoints}
        leaguepoints={leaguepoints}
        setLeaguepoints={setLeaguepoints}
        onSave={() => {
              setModalVisible(false)
        }}
        
        // onConfirm={newconfirm}
     
        // Confirmcheck={Confirmcheck}
        // setConfirmcheck={setConfirmcheck}
        // playerInfo={playerInfo}
        // setPlayerInfo={setPlayerInfo}
      />
    </>
  ) : (
    <div className='empty_header'>
      <Spin />
    </div>
  )
}

export default Header
