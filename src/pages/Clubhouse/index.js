import React, { useEffect, useState } from 'react'
import { Button, Image, Input, Select } from 'antd'
import Header from '../../components/Header'
import HeadingAndWeek from '../../components/Pagination/HeadingAndWeek'
import sampointslogo from '../../assets/stadiumsampoints.webp'
import { useDispatch, useSelector } from 'react-redux'
import { createClubhouse, getClubhouse } from '../../redux/actions/clubhouse'

const Clubhouse = () => {
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user.userDetails)

  const clubhouse = useSelector((state) => state.clubhouse.clubhouse.Clubhouse)
  console.log('user', user)
  console.log('clubhouse', clubhouse)

  const [referralemail, setReferralemail] = useState('')
  const [loading, setLoading] = useState(false)

  const emails = ['James@gmail.com', 'Maddog@gmail.com', 'Fakeemail@gmail.com', '0900-786-01']

  // useEffect(()=>{
  //   getClubhouse()
  // },[clubhouse])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getClubhouse({
        season: user?.team?.currentLeague?.season,
        userId: user?._id,
        leagueId: user?.team?.currentLeague._id,
      })
      if (data) {
        dispatch(setAllclubhouse(data))
      }
    }

    fetchData()
  }, [dispatch, user])

  const handleInputChange = (e) => {
    setReferralemail(e.target.value)
  }

  const handlecreatereferral = async () => {
    setLoading(true)
    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        emailsent: referralemail,
        season: user?.team?.currentLeague?.season,
      }

      console.log('payload', payload)
      const data = await createClubhouse(payload)

      console.log('refereaal successfull successfully:', data)
      setReferralemail('')
      // const res = await getData()
      // if (res) {
      // }
      setLoading(false)
    } catch (error) {
      console.error('Error making bid:', error)
    }
  }

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
                placeholder='TYPE EMAIL OR MOBILE NUMBER'
                value={referralemail}
                onChange={handleInputChange}
              />

              <Button
                loading={loading}
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
            <p>
              EMAILS SENTS
              <div className='email-box'>
                {Array.isArray(clubhouse) ? (
                  clubhouse
                    ?.filter((item) => !item.isRegistered)
                    .map((item, index) => (
                      <p style={{ marginLeft: '-29px' }} key={index}>
                        {index + 1}. {item.emailsent}
                      </p>
                    ))
                ) : (
                  <p>No emails found</p>
                )}
              </div>
            </p>

            <p>
              SUCCESSFULL REGISTRATION
              <div className='email-box'>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '60px' }}
                >
                  <div>
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
                  </div>
                  <div style={{ display: 'flex' }}>
                    <Image preview={false} width={35} src={sampointslogo} alt='samlogo' />
                    <p>12,500,000</p>
                  </div>
                </div>
              </div>
              <div className='total-earnings'>
                <h3>TOTAL EARNINGS</h3>
                <Image width={35} src={sampointslogo} alt='samlogo' />
                <h4>12,500,000</h4>
              </div>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Clubhouse
