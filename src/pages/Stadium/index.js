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
  const teamNames = [
    'Atlanta Legion',
    'Boston Blazers',
    'Chicago Warriors',
    'Dallas Titans',
    'Houston Stars',
    'Los Angeles Vipers',
    'Miami Storm',
    'New York Guardians',
    'San Francisco Miners',
    'Seattle Thunder',
  ]

  const myleague = async () => {
    await getLeagueDetails()
  }

  // console.log('mystadiumlevel',mystadiumlevel);

  useEffect(() => {
    setLoading(true)
    myleague()
    getallstadiumlevel()
    setLoading(false)
    // getstadium()
  }, [])

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

  // console.log('mystadiumlevel?.stadiumlevel',mystadiumlevel?.[0]?.stadiumlevel?.newticketCost);

  const filteredStadiums = allstadiumlevel?.filter((stadium) => stadium.level !== 'level0')

  //  console.log('sampoints', sampoints)

  const [team, setTeam] = useState(null)

  const handlecreatestadium = async (stadiumlevelId) => {
    setLoading(true) // Set main loading state

    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        teamId: user?.team?.name,
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

  return (
    <>
      <Header />

      {loading ? (
        <Loader />
      ) : (
      <div className='stadium-main'>
        <div className='firstdiv'>
          <div className='year_selector_container'>
            {/* <Select
              shape='circle'
              className='year_selector'
              allowClear
              // placeholder={currentLeague?.teams[0]}
              onChange={(value) => setTeam(value)}
              style={{ width: '56%', marginBottom: '13px' }}
              suffixIcon={<IoMdArrowDropdown size={20} color='var(--link)' />}
            >
              {currentLeague?.teams?.map((name, index) => (
                <Select.Option shape='circle' key={index} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select> */}
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
              <div className='day'>DAY 1</div>
              <div className='day'>DAY 2</div>
              <div className='day'>DAY 3</div>
              <div className='day'>DAY 4</div>
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
            <p>100%</p>
            <div className='weeklyticketslaes'>
              <p>
                Total Weekly <span>Ticket Sales</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                5,100,000
              </p>

              <p>
                Total Weekly <span>Match-Up Pot</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                3,570,000
              </p>

              <p>
                Total Weekly <span>To Prize Pool</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                1,530,000
              </p>
            </div>
          </div>

          <div className='stadiumupgrade'>
            STADIUM <span>UPGRADES</span>
            {filteredStadiums?.map((stadium) => (
              <div key={stadium._id} style={{ marginTop: '10px' }} className='main-stadium-section'>
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
