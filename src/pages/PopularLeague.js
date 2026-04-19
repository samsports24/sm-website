import { Col, Row } from 'antd'
import PopularLeagueCard from '../components/NewPopularLeagueCard'
import { getALLeagues, getUserLeagues } from '../redux'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

const PopularLeague = () => {
  const leagues = useSelector((state) => state.league)
  const isAuthenticated = localStorage.getItem('token')

  const getData = async () => {
    if (isAuthenticated) {
      await getUserLeagues({ allleagues: true })
    } else {
      await getALLeagues()
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="total_payment_container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="heading" style={{ marginBottom: 4 }}>Popular Leagues</h1>
        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: 14, margin: 0 }}>
          Browse and join active leagues
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {leagues?.nonUserLeagues
          ?.filter((v) =>
            v?.leagueType !== 'public' &&
            v?.leagueType !== 'private' &&
            v?.id !== '64fc5edaf8f2513bd263845a' &&
            v?.name !== 'UFAFL'
          )
          ?.map((value, index) => (
            <Col xs={24} sm={12} lg={8} xxl={6} key={index}>
              <PopularLeagueCard data={value} active={false} yourLeague={false} />
            </Col>
          ))}
      </Row>
    </div>
  )
}

export default PopularLeague
