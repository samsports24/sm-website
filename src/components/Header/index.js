import React, { useEffect, useState } from 'react'
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
// import { LuAlertTriangle } from "react-icons/lu";
import alertimage from '../../assets/new alert.png'
import { getAllNotification } from '../../redux/actions/notificationAction'

const Header = () => {
  const record = useSelector((state) => state.user.record)
  const user = useSelector((state) => state.user.userDetails)
  const leagueType = user?.team?.currentLeague?.leagueType
  const safepaylink = user?.team?.currentLeague?.safePayLink
  const teamSalary = useSelector((state) => state.user.teamSalaryCap)
  const { notificationCount } = useSelector((state) => state.user)
  const { auctionCount } = useSelector((state) => state.user)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const [modalVisible, setModalVisible] = useState(false)
  const [leaguepoints, setLeaguepoints] = useState('')
  const [notificationData, setNotificationData] = useState(null)
  const navigate = useNavigate()
  const SETTING = useSelector((state) => state?.user)

  // console.log('safepaylink', safepaylink)

  // console.log('user?.team?.currentLeague?.season',user?.team?.currentLeague?.prizePool);

  // console.log('myleagueSalaryCap',myleagueSalaryCap);
  const teamFinancials = () => {
    navigate('/team-financials')
  }
  const paysafe = () => {
    if (safepaylink) {
      window.location.href = safepaylink
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    // setIsLoading(true)
    const res = await getAllNotification({
      week: SETTING?.currentWeek,
    })
    setNotificationData(res)
    // setIsLoading(false)
  }

  // console.log('notificationData',notificationData);
  

  //  season:user?.team?.currentLeague?.season

  const confirm = () => {
    setModalVisible(true)
  }

  const isPoaching = notificationData?.data?.some(notification => 
    notification.module === "poaching"
      && notification?.metadata?.team === user?.team?._id  &&
      new Date(notification.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const handletransferleaguepoints = async () => {
    try {
      const payload = {
        userid: user?._id,
        leagueid: user?.team?.currentLeague._id,
        teamid: user?.team?._id,
        leaguepoints: parseFloat(leaguepoints),
      }

      console.log('payload', payload)
      const data = await TransferPointsToLeague(payload)
      console.log('poinst transfer to league wallet successfully:', data)
      setLeaguepoints('')
      // cancel()
    } catch (error) {
      console.error('Error in transfering the league wallet :', error)
      setLeaguepoints('')
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

<>
{isPoaching && (
      <p style={{ marginTop: '5px' }}>
        <span style={{ color: 'yellow' }}>
          POACHING ALERT
          <img style={{ position: 'relative', left: '8%' }} width={20} src={alertimage} alt='Icon' />
        </span>
      </p>
    )}
</>

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
                {/* <span>{`$${leagueSalaryCap?.toLocaleString()}`}</span> */}
                <span>{`$${myleagueSalaryCap?.toLocaleString() || 0}`}</span>
              </div>
              <div>
                <p>Team Salary Cap</p>
                <span>{`$${teamSalary?.toLocaleString()}`}</span>
              </div>
              <div>
                <p>Team Cap Left</p>
                <span>{`$${(myleagueSalaryCap - teamSalary)?.toLocaleString()}`}</span>
              </div>
            </div>

            <div className='leaguepointswallet'>
              <div>
                <h4>
                  YOUR LEAGUE SAM
                  <span> POINTS</span>
                </h4>
                <div className='leaguedifflex'>
                  <img className='imgdiv' src={sampointslogo} alt='SAMPOINTS' />
                  <div className='leaguemoney'>{sampoints?.toLocaleString() || '0'}</div>
                </div>

                <h4>
                  LEAGUE SAM
                  <span> POINTS PRIZE POOL</span>
                </h4>

                <div className='leaguedifflex'>
                  <img className='imgdiv' src={sampointslogo} alt='SAMPOINTS' />
                  <div className='leaguemoney'>{user?.team?.currentLeague?.prizePool?.toLocaleString() || '0' }</div>
                </div>
              </div>
              <div className='leaguediff'>
                <Button
                  className='addmore'
                  // loading={loading}
                  type='primary'
                  onClick={confirm}
                >
                  ADD MORE
                </Button>
                {safepaylink && (
                  <Button  className='paysafe' type='primary' onClick={paysafe}>
                    LEAGUE SAFE
                  </Button>
                )}
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
                    <div className='top' style={{ marginBottom: '5px' }}>
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
              {/* <h1>SFL Prize_Pools</h1> */}
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
