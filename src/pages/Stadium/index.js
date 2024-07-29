import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { IoMdArrowDropdown } from 'react-icons/io'
import { Button, Select } from 'antd'
import stadium from '../../assets/newstadium.png'
import sampointslogo from '../../assets/stadiumsampoints.webp'
import mystadium from '../../assets/mystadium.png'
import { ImArrowRight } from 'react-icons/im'
import stadiumb from '../../assets/stadium b.png'
import stadiumc from '../../assets/stadium c.png'
import stadiumd from '../../assets/stadium d.png'
import { getLeagueDetails } from '../../redux'
import { useDispatch, useSelector } from 'react-redux'
import {
  createStadium,
  getallstadiumlevel,
  getstadium,
  setMystadium,
} from '../../redux/actions/stadium'
import Loader from '../../components/Loader'

const Stadium = () => {
  const { currentLeague } = useSelector((state) => state?.league)
  const user = useSelector((state) => state.user.userDetails)
  const allstadiumlevel = useSelector((state) => state?.stadium?.allstadium?.allstadiumlevel)
  const mystadiumlevel = useSelector((state) => state?.stadium?.mystadium)

  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [team, setTeam] = useState(null)

  const myleague = async () => {
    await getLeagueDetails()
  }

  const dayMapping = {
    day1: 'SUN',
    day2: 'MON',
    day3: 'TUE',
    day4: 'WED',
  }

  useEffect(() => {
    setLoading(true)
    myleague()
    getallstadiumlevel()
    setLoading(false)
    // getstadium()
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getstadium({
        season: user?.team?.currentLeague?.season,
        user: user?._id,
        league: user?.team?.currentLeague._id,
        teamId: user?.team?.name,
      })
      if (data) {
        dispatch(setMystadium(data))
      }
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Find the maximum level in the mystadiumlevel array
  const maxMyStadiumLevel = Math.max(
    ...mystadiumlevel
      .filter((item) => item.stadiumlevel) // Ensure stadiumlevel is defined
      .map((item) => parseInt(item.stadiumlevel?.level.replace(/\D/g, ''), 10))
      .filter((level) => !isNaN(level)), // Filter out NaN values
  )

  // Filter stadiums based on the highest level found
  const filteredStadiums = allstadiumlevel?.filter((stadium) => {
    // Check if stadium.level is not 'level0'
    if (stadium.level === 'level0') {
      return false // Filter out stadiums with level 'level0'
    }

    // Convert stadium.level to a number for comparison
    const stadiumLevel = parseInt(stadium.level.replace(/\D/g, ''), 10)

    // Check if stadiumLevel is greater than maxMyStadiumLevel
    return !isNaN(stadiumLevel) && stadiumLevel > maxMyStadiumLevel
  })

  console.log(' user?.team?._id', user?.team?._id)

  const handlecreatestadium = async (stadiumlevelId) => {
    setLoading(true) // Set main loading state

    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        teamId: user?.team?._id,
        season: user?.team?.currentLeague?.season,
        stadiumlevel: stadiumlevelId,
      }

      console.log('payload', payload)
      const data = await createStadium(payload) // Call API

      console.log('stadium upgarde  successfullyy:', data)
    } catch (error) {
      console.error('Error upgarding stadium:', error)
      // Handle error cases as needed
    } finally {
      // setBtnLoading(false) // Reset button loading state
      setLoading(false) // Reset main loading state
    }
  }
  let filteredEntries

  let weeklyticketsale =
    mystadiumlevel?.[0]?.homeAttendance *
    mystadiumlevel?.[0]?.stadiumlevel?.newseatingCapacity *
    mystadiumlevel?.[0]?.stadiumlevel?.newticketCost
  let weeklymatchpotup = weeklyticketsale * 0.7
  let weeklyprizepool = weeklyticketsale * 0.3

  const loginObject = mystadiumlevel?.[0]?.login
  const defaultDays = ['SUN', 'MON', 'TUE', 'WED']

  // const daysToDisplay =
  //   loginObject && typeof loginObject === 'object'
  //     ? Object.entries(loginObject)
  //         ?.filter(([key]) => key !== '_id')
  //         ?.map(([key, value]) => [key.toUpperCase(), value])
  //     : defaultDays.map((day) => [day.toUpperCase(), false])

  const daysToDisplay =
    loginObject && typeof loginObject === 'object'
      ? Object.entries(loginObject)
          .filter(([key]) => key !== '_id')
          .map(([key, value]) => [dayMapping[key] || key.toUpperCase(), value])
      : defaultDays.map((day) => [day, false])

  return (
    <>
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <div className='stadium-main'>
          <div className='firstdiv'>
            <div className='year_selector_container'>
              {currentLeague && currentLeague?.teams && (
                <Select
                  shape='circle'
                  className='year_selector'
                  allowClear
                  placeholder={user?.team?.name}
                  onChange={(value) => setTeam(value)}
                  style={{ width: '56%', marginBottom: '13px' }}
                  suffixIcon={<IoMdArrowDropdown size={20} color='var(--link)' />}
                >
                  {currentLeague.teams.map((team, index) => (
                    <Select.Option key={team._id} value={team.name}>
                      {team.name}
                    </Select.Option>
                  ))}
                </Select>
              )}

              <p>Your Stadium</p>
              <img
                className='stadiumimg'
                src={mystadiumlevel?.[0]?.stadiumlevel?.stadiumimg || stadium}
                alt='stadium'
              />
              <p>Stadium Name</p>
              <p>{team || user?.team?.name}</p>
              <div className='ticketcost'>
                <p>
                  Average Ticket <span>Cost</span>
                </p>

                <div className='per-ticket-price'>
                  <img className='samlogo' src={sampointslogo} alt='samlogo' />
                  <p>{mystadiumlevel?.[0]?.stadiumlevel?.newticketCost || 85}</p>
                  <p>Per.Ticket</p>
                </div>
              </div>
            </div>
            <div className='daily-login-section'>
              <div className='dailylogin'>
                DAILY <span>LOGIN</span>
              </div>
              <div className='daydiv'>
                {daysToDisplay.map(([day, active], index) => (
                  <div
                    className='day'
                    key={index} // Use index as a fallback key
                    style={{
                      color: active ? '#FFDE59' : '#FFF',
                    }}
                  >
                    {day}
                  </div>
                ))}

                {/* <div className='day'>SUN</div>
                <div className='day'>MON</div>
                <div className='day'>TUE</div>
                <div className='day'>WED</div> */}
              </div>
              <p>
                Seating
                <span>Capacity</span>
              </p>
              <p>{mystadiumlevel?.[0]?.stadiumlevel?.newseatingCapacity || '60,000'}</p>
              <p>
                Upcoming
                <span>Home Attendance</span>
              </p>
              <p> {mystadiumlevel?.[0]?.homeAttendance || 100}%</p>
              <div className='weeklyticketslaes'>
                <p>
                  Total Weekly <span>Ticket Sales</span>
                </p>

                <p>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  {/* {new Intl.NumberFormat('en-US')?.format(weeklyticketsale) || '5,100,000'} */}
                  {!isNaN(weeklyticketsale) && typeof weeklyticketsale === 'number'
                    ? new Intl.NumberFormat('en-US').format(weeklyticketsale)
                    : '5,100,000'}
                </p>

                <p>
                  Total Weekly <span>Match-Up Pot</span>
                </p>

                <p>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  {!isNaN(weeklymatchpotup) && typeof weeklymatchpotup === 'number'
                    ? new Intl.NumberFormat('en-US').format(weeklymatchpotup)
                    : '3,570,000'}

                  {/* {new Intl.NumberFormat('en-US')?.format(weeklymatchpotup) || '3,570,000'} */}
                </p>

                <p>
                  Total Weekly <span>To Prize Pool</span>
                </p>

                <p>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />

                  {!isNaN(weeklyprizepool) && typeof weeklyprizepool === 'number'
                    ? new Intl.NumberFormat('en-US').format(weeklyprizepool)
                    : '1,530,000'}

                  {/* {new Intl.NumberFormat('en-US')?.format(weeklyprizepool) || '1,530,000'} */}
                </p>
              </div>
            </div>

            <div className='stadiumupgrade'>
              STADIUM <span>UPGRADES</span>
              {filteredStadiums?.map((stadium, index) => (
                <div
                  key={stadium._id}
                  style={{ marginTop: '10px' }}
                  className='main-stadium-section'
                >
                  {/* Replace 'mystadium' with the actual image for each stadium */}
                  <img className='mystadium' src={stadium?.stadiumimg || mystadium} alt='stadium' />
                  <p>
                    Seating
                    <span>Capacity</span>
                    <div className='pricecost'>
                      <p>{stadium?.previousseatingCapacity}</p>
                      <ImArrowRight />
                      <p>{stadium?.newseatingCapacity}</p>
                    </div>
                    <p>
                      Average Ticket
                      <span>Cost</span>
                      <div className='pricecost'>
                        <p className='updatecolr'>
                          <img width={20} src={sampointslogo} alt='sampointslogo' />
                          {stadium?.previousticketCost}
                        </p>
                        <ImArrowRight />
                        <p className='updatecolr'>
                          <img width={20} src={sampointslogo} alt='sampointslogo' />
                          {stadium?.newticketCost}
                        </p>
                      </div>
                    </p>
                  </p>

                  <p>
                    Upgrade
                    <span>Cost</span>
                    <div className='upgradepart'>
                      <img width={50} src={sampointslogo} alt='sampointslogo' />
                      <p>{stadium?.upgradedCost?.toLocaleString()}</p>
                    </div>
                    <Button
                      loading={loading}
                      className='upgradebtn'
                      onClick={() => handlecreatestadium(stadium._id)}
                      disabled={index !== 0}
                    >
                      UPGRADE
                    </Button>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Stadium
