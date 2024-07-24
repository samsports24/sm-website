import { Col, Row, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import PopularLeagueCard from '../components/NewPopularLeagueCard'
import { getALLeagues, getUserLeagues, selectLeague } from '../redux'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import CreateLeague from '../components/modal/CreateLeague'
import LeagueEmptyCard from '../components/NewPopularLeagueCard/EmptyCard'

const PopularLeague = () => {
  const navigate = useNavigate()
  const leagues = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)

  const isAuthenticated = localStorage.getItem('token')

  const getData = async () => {
    if (isAuthenticated) {
      await getUserLeagues({allleagues:true})
    }
    else {
      await getALLeagues()
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <div className='total_payment_container'>
      <h1 className='heading'>Popular Leagues</h1>
      {/* <h2>Click on a league to join</h2> */}

      <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
        {/* <Col xs={24} sm={12} xl={8} xxl={6}>
          <CreateLeague button={<LeagueEmptyCard />} />
        </Col> */}
        {leagues ? (
          leagues?.nonUserLeagues
             ?.filter((v) => v?.leagueType !== 'public' && v?.leagueType !== 'private' && v?.id!=='64fc5edaf8f2513bd263845a' 
             && v?.name !=='UFAFL'
            )
            ?.map((value, index) => (
              <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
                <PopularLeagueCard data={value} active={false} yourLeague={false} />
              </Col>
            ))
        ) : (
          <div></div>
        )}
      </Row>
    </div>
  )
}

export default PopularLeague
