// import Layout from '../layout/Layout'

import { Col, Row } from 'antd'
import PopularLeagueCard from '../components/cards/popularLeagueCard'
import HomeMainBanner from '../components/banners/homeMainBanner'

const Dashboard = () => {
  let popularLeagues = [
    { players: [4, 32], open: true, image: require('../assets/rectangle-5.png') },
    { players: [4, 32], open: true, image: require('../assets/rectangle-6.png') },
    { players: [4, 32], open: true, image: require('../assets/rectangle-7.png') },
    { players: [4, 32], open: true, image: require('../assets/rectangle-8.png') },
  ]
  return (
    <div>
      {/* main banner */}
      <HomeMainBanner />
      <div style={{ height: '81px' }}></div>
      {/* popular leagues */}
      <h2 style={{ marginBottom: '24px', color: '#fff' }}>Popular Leagues</h2>
      <Row gutter={[20, 20]}>
        {popularLeagues?.map((value, index) => (
          <Col lg={6} key={index}>
            <PopularLeagueCard data={value} />
          </Col>
        ))}
      </Row>
    </div>
  )
  // return <Layout active={'dashboard'}></Layout>
}

export default Dashboard
