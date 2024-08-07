import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Image, Input, Select, notification } from 'antd'
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import sampointslogo from '../../assets/stadiumsampoints.webp'
import { useDispatch, useSelector } from 'react-redux'
import {
  createClubhouse,
  getClubhouse,
  resendInvitation,
  setAllclubhouse,
} from '../../redux/actions/clubhouse'
import refresh from '../../assets/refresh-icon.jpg'
import { IoMdRefresh } from 'react-icons/io'
import Loader from '../../components/Loader'

const Clubhouse = () => {
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user.userDetails)

  const clubhouse = useSelector((state) => state.clubhouse.clubhouse.Clubhouse)
  console.log('user', user)
  console.log('clubhouse', clubhouse)

  const [referralemail, setReferralemail] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnloading, setBtnLoading] = useState(false)
  const [invitationType, setInvitationType] = useState('')

  const emails = ['James@gmail.com', 'Maddog@gmail.com', 'Fakeemail@gmail.com', '0900-786-01']

  // useEffect(()=>{
  //   getClubhouse()
  // },[clubhouse])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getClubhouse({
        season: user?.team?.currentLeague?.season,
        userId: user?._id,
        leagueId: user?.team?.currentLeague._id,
      })
      if (data) {
        dispatch(setAllclubhouse(data))
      }
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleInputChange = (e) => {
    setReferralemail(e.target.value)
  }

  const handleCheckboxChange = (type) => {
    // Toggle the checkbox
    if (invitationType === type) {
      setInvitationType(null) // Uncheck the checkbox if it's already checked
    } else {
      setInvitationType(type) // Check the checkbox if it's unchecked
    }
  }
  // const handlecreatereferral = async () => {
  //   setBtnLoading(true)
  //   setLoading(true)
  //   try {
  //     const payload = {
  //       league: user?.team?.currentLeague._id,
  //       user: user?._id,
  //       emailsent: referralemail,
  //       season: user?.team?.currentLeague?.season,
  //     }

  //     console.log('payload', payload)
  //     const data = await createClubhouse(payload)

  //     console.log('refereaal successfully sent:', data)
  //     setReferralemail('')
  //     // const res = await getData()
  //     // if (res) {
  //     // }
  //     setBtnLoading(false)
  //     setLoading(false)
  //   } catch (error) {
  //     console.error('Error making bid:', error)
  //   }
  // }

  const handlecreatereferral = async () => {
    if (!invitationType) {
      notification.warning({
        message: `Please select a league type.`,
        duration: 4,
      })
      return
    }

    setBtnLoading(true) // Set button loading state
    // setLoading(true) // Set main loading state

    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        emailsent: referralemail,
        season: user?.team?.currentLeague?.season,
        invitation_Type: invitationType,
      }

      console.log('payload', payload)
      const data = await createClubhouse(payload) // Call API

      // console.log('Referral successfully sent:', data)
      setReferralemail('') // Clear input after successful API call
      setInvitationType('')
      // Additional logic can be added here if needed
    } catch (error) {
      console.error('Error making referral:', error)
      // Handle error cases as needed
    } finally {
      setBtnLoading(false) // Reset button loading state
      // setLoading(false) // Reset main loading state
    }
  }

  const getEarningValue = (referralLevel) => {
    switch (referralLevel) {
      case 'Ultimate':
        return 12500000
      case 'Referral Level 1':
        return 7500000
      case 'Referral Level 2':
        return 7500000
      case 'Referral Level 3':
        return 7500000
      default:
        return 0
    }
  }

  const handleRefreshClick = (email) => async () => {
    setLoading(true)
    try {
      if (!user?._id || !email) {
        console.warn('User or email is undefined')
        return
      }

      console.log('email', email)

      // Call resendInvitation with email directly
      await resendInvitation(email)

      const payload = {
        user: user?._id,
        emailsent: email,
      }

      console.log('payload', payload)

      // Assuming resendInvitation also returns data upon success
      const data = await resendInvitation(payload)
      console.log('Invitation sent successfully:', data)

      setLoading(false)
    } catch (error) {
      console.error('Error resending invitation:', error)
      // Handle error
    }
  }

  // const totalEarnings = Array.isArray(clubhouse)
  //   ? clubhouse.length * getEarningValue(user?.referralLevel)
  //   : 0

  // const totalEarnings =
  //   clubhouse?.filter((obj) => obj.isRegistered)?.length * getEarningValue(user?.referralLevel) // Filter objects where isRegistered is true

  // console.log('totalEarnings:', totalEarnings)

  const totalEarnings = clubhouse
    ?.filter((obj) => obj.isRegistered)
    .reduce((accumulator, obj) => accumulator + obj.sampoints, 0)

  console.log('totalEarnings:', totalEarnings)

  // const totalEarnings = Array.isArray(clubhouse) && clubhouse?.isRegistered
  // ? clubhouse.length * getEarningValue(user?.referralLevel)
  // : 0;

  // console.log('totalEarnings', totalEarnings);

  // console.log('totalEarnings',totalEarnings);

  return (
    <>
      <div className='clubhouse-main'>
        <Header />
        <HeadingAndWeek />

        <div className='clubhouse'>
          <h1>CLUBHOUSE</h1>
          <div className='clubhouse_first_div'>
            <div className='clubhouseinput'>
              <Input
                disabled={false}
                placeholder='TYPE EMAIL ADDRESS'
                value={referralemail}
                onChange={handleInputChange}
              />

              <div>
                <Checkbox
                  style={{ color: 'white', fontSize: '18px' }}
                  checked={invitationType === 'Professional'}
                  onChange={() => handleCheckboxChange('Professional')}
                >
                  Professional
                </Checkbox>
                <Checkbox
                  style={{ color: 'white', fontSize: '18px' }}
                  checked={invitationType === 'Freemium'}
                  onChange={() => handleCheckboxChange('Freemium')}
                >
                  Freemium
                </Checkbox>
              </div>

              <Button
                loading={btnloading}
                onClick={handlecreatereferral}
                className='submitbtn'
                key='save'
                type='primary'

                // disabled={isTimerFinished}
              >
                Submit
              </Button>
            </div>
            <h2>
              My Referral Level
              <p>{user?.referralLevel}</p>
            </h2>
          </div>

          <div className='email-registration'>
            {loading || btnloading ? (
              <Loader />
            ) : (
              <>
                <p>
                  EMAILS SENTS
                  <div className='email-box'>
                    {Array.isArray(clubhouse) ? (
                      clubhouse.map((item, index) => (
                        <div style={{ display: 'flex', gap: '20px' }} key={index}>
                          <p style={{ marginLeft: '-29px' }}>
                            {/* {index + 1}. {item.emailsent} - {item?.invitation_Type} */}
                            {index + 1}. {item.emailsent} - (
                            {item?.invitation_Type?.charAt(0)?.toUpperCase()})
                          </p>
                          {!item.isRegistered && (
                            <IoMdRefresh
                              onClick={handleRefreshClick(item.emailsent)}
                              className='icon'
                              size={35}
                              color='#ffffff'
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No emails found</p>
                    )}
                  </div>
                </p>

                <p>
                  SUCCESSFUL REGISTRATION
                  <div className='email-box'>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingRight: '60px',
                      }}
                    >
                      {/* <div>
                    {Array.isArray(clubhouse) ? (
                      clubhouse
                        ?.filter((item) => item.isRegistered)
                        .map((item, index) => (
                          <p style={{ marginLeft: '-29px' }} key={index}>
                            {index + 1}. {item.emailsent}
                          </p>
                        ))
                    ) : (
                      <p>No emails found</p>
                    )}
                  </div> */}
                      {/* <div style={{ display: 'flex' }}>
                    <Image preview={false} width={35} src={sampointslogo} alt='samlogo' />
                    <p>12,500,000</p>
                  </div> */}

                      <div>
                        {Array.isArray(clubhouse) ? (
                          clubhouse
                            ?.filter((item) => item?.isRegistered)
                            .map((item, index) => (
                              <div
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                                key={index}
                              >
                                <p style={{ marginLeft: '-29px' }}>
                                  {index + 1}. {item.emailsent}
                                </p>
                                <div style={{ display: 'flex' }}>
                                  <Image
                                    preview={false}
                                    width={35}
                                    src={sampointslogo}
                                    alt='samlogo'
                                  />
                                  <p>
                                    {item?.sampoints ||
                                      (user?.referralLevel === 'Ultimate'
                                        ? '12,500,000'
                                        : user?.referralLevel === 'Referral Level 1'
                                        ? '7,500,000'
                                        : user?.referralLevel === 'Referral Level 2'
                                        ? '7,500,000'
                                        : user?.referralLevel === 'Referral Level 3'
                                        ? '7,500,000'
                                        : '')}
                                  </p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p>No emails found</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='total-earnings'>
                    <h3>TOTAL EARNINGS</h3>
                    <Image width={35} src={sampointslogo} alt='samlogo' />
                    {/* <h4>12,500,000</h4> */}
                    <h4>{totalEarnings?.toLocaleString() || 0}</h4>
                  </div>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Clubhouse
