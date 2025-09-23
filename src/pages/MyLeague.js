import { Col, Row, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import PopularLeagueCard from '../components/NewPopularLeagueCard'
import { getUserLeagues, selectLeague } from '../redux'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import UpdatedLeagueCard from '../components/NewPopularLeagueCard/UpdatedLeagueCard'

const MyLeague = () => {
  const navigate = useNavigate()
  const leagues = useSelector((state) => state.league)
  console.log('leagues', leagues)
  const user = useSelector((state) => state.user.userDetails)
  console.log('user',user);

  const isAuthenticated = localStorage.getItem('token')

  const getData = async () => {
    if (isAuthenticated) {
      await getUserLeagues()
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <div className='total_payment_container'>
      <h1 className='heading'>My Leagues</h1>
      <h2>Click on a league to join</h2>

      <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
        {leagues && leagues?.userLeagues?.length > 0
          ? <>
          {
            leagues?.userLeagues?.map((value, index) => (
              <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
                <div
                  // style={{ cursor: 'pointer' }}
                  // onClick={async () => {
                  //   if (user?.team?.currentLeague?._id === value?._id) {
                  //     notification.error({
                  //       message: 'This League is already active',
                  //       duration: 6,
                  //     })
                  //   } else {
                  //     await selectLeague({ leagueId: value?._id }, navigate)
                  //   }
                  // }}
                >
                  {/* <PopularLeagueCard
            data={value}
            active={user?.team?.currentLeague?._id === value?._id ? true : false}
            yourLeague={true}
          /> */}

                  <UpdatedLeagueCard
                    data={value}
                    active={user?.team?.currentLeague?._id === value?._id ? true : false}
                    // yourLeague={false}
                    //  fromHome={true}
                    yourLeague={true}
                  />
                </div>
              </Col>
            ))
          }
          {
            leagues?.futureLeagues?.map((value, index) => (
              <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
                <div
                  style={{ cursor: 'not-allowed' }}
                  // onClick={async () => {
                  //   if (user?.team?.currentLeague?._id === value?._id) {
                  //     notification.error({
                  //       message: 'This League is already active',
                  //       duration: 6,
                  //     })
                  //   } else {
                  //     await selectLeague({ leagueId: value?._id }, navigate)
                  //   }
                  // }}
                >
                  <UpdatedLeagueCard
                    data={value}
                    active={false}
                    // yourLeague={false}
                    //  fromHome={true}
                    yourLeague={false}
                    totalTeams={value?.numberOfTeams}
                    isFutureLeague={true}
                  />
                </div>
              </Col>
            ))
          }
          </> 
          : leagues?.nonUserLeagues
              // ?.filter((value) => value.leagueType === 'Ultimate')
              // ?.filter(value => value.leagueType === 'professional' && value.leagueType === 'freemium' && value._id !== '64fc5edaf8f2513bd263845a')
              ?.filter(value =>   value._id !== '64fc5edaf8f2513bd263845a')
              ?.map((value, index) => (
                <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                      if (user?.team?.currentLeague?._id === value?._id) {
                        notification.error({
                          message: 'This League is already active',
                          duration: 6,
                        })
                      } else {
                        // await selectLeague({ leagueId: value?._id }, navigate)
                      }
                    }}
                  >
                    {/* <PopularLeagueCard
          data={value}
          active={user?.team?.currentLeague?._id === value?._id ? true : false}
          yourLeague={true}
        /> */}

                    <UpdatedLeagueCard
                      data={value}
                      active={user?.team?.currentLeague?._id === value?._id ? true : false}
                      // yourLeague={false}
                      // fromHome={true}
                      yourLeague={false}
                      fromHome={true}
                    />
                  </div>
                </Col>
              ))}
      </Row>
    </div>
  )
}

export default MyLeague
