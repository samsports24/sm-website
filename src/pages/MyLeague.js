import { Col, Row, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import PopularLeagueCard from '../components/NewPopularLeagueCard'
import { getUserLeagues, selectLeague } from '../redux'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

const MyLeague = () => {
  const navigate = useNavigate()
  const leagues = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)

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
        {leagues
          ? leagues?.userLeagues?.map((value, index) => (
              <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    if(user?.team?.currentLeague?._id === value?._id){
notification.error({
  message : "This League is already active",
  duration : 6
})
                    }else{
                      await selectLeague({ leagueId: value?._id },navigate)
                    }
                  }}
                >
                  <PopularLeagueCard data={value} 
                  active={user?.team?.currentLeague?._id === value?._id ? true : false}
                  
                  yourLeague={true} />
                </div>
              </Col>
            ))
          : 'loading'}
      </Row>
    </div>
  )
}

export default MyLeague
