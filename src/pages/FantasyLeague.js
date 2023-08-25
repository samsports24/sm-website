import { Col, Row } from 'antd'
import PopularLeagueCard from '../components/cards/popularLeagueCard'
import PopularSportCard from '../components/cards/popularSportCard'
import HomeMainBanner from '../components/banners/homeMainBanner'
import AmericalFootballBanner from '../components/banners/americanFootballBanner'
import FeedbackCard from '../components/cards/feedbackCard'

// Mock Data
import { popularLeaguesData, popularSportsData, clientFeedbacksData } from './mockData'
import ButtonMenu from '../components/ButtonMenu'
import { useNavigate } from 'react-router-dom'

const FantasyLeague = () => {
  const navigate = useNavigate()

  return (
    <div className='fantasy_league_container'>
      <section className='header_top_section'>
        <h2>Sports:</h2>
        <div className='button_menu_box'>
          <ButtonMenu
            data={{
              buttonName: 'Football',
              item: [
                {
                  name: 'Professional Leagues',
                  navigate: '/professional-league',
                },
                {
                  name: 'Public Leagues',
                  navigate: '',
                },
              ],
            }}
          />
          <ButtonMenu
            data={{
              buttonName: 'Baseball',
              item: [],
            }}
          />
          <ButtonMenu
            data={{
              buttonName: 'Basketball',
              item: [],
            }}
          />
          <ButtonMenu
            data={{
              buttonName: 'Hockey',
              item: [],
            }}
          />
          <ButtonMenu
            data={{
              buttonName: (
                <span onClick={() => navigate('/coming-soon')}>
                  <span style={{ fontWeight: 400 }}>Coming</span>&nbsp;Soon
                </span>
              ),
              item: [],
            }}
          />
        </div>
      </section>

      {/* main banner */}
      <HomeMainBanner />

      <div style={{ height: '81px' }}></div>

      {/* popular leagues */}
      <h2 style={{ marginBottom: '24px', color: '#fff' }}>Popular Leagues</h2>
      <Row gutter={[20, 20]}>
        {popularLeaguesData?.map((value, index) => (
          <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
            <PopularLeagueCard data={value} />
          </Col>
        ))}
      </Row>

      <AmericalFootballBanner />

      {/* popular sport */}
      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: '#fff' }}>Popular Sports</h2>

      <Row gutter={[20, 20]}>
        {popularSportsData?.map((value, index) => (
          <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
            <PopularSportCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row>

      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: '#fff' }}>Client Feedback</h2>

      <h4 style={{ marginTop: '20px', marginBottom: '54px', color: '#fff' }}>
        See what millions of users say about us
      </h4>

      <Row gutter={[20, 20]}>
        {clientFeedbacksData?.map((value, index) => (
          <Col xs={24} sm={24} lg={12} xl={12} xxl={8} key={index}>
            <FeedbackCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row>

      <div style={{ height: '80px' }}></div>
    </div>
  )
}

export default FantasyLeague
