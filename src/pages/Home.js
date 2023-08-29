import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
// import { Col, Row } from 'antd'

import PopularLeagueCard from '../components/cards/popularLeagueCard'
import PopularSportCard from '../components/cards/popularSportCard'
import AmericalFootballBanner from '../components/banners/americanFootballBanner'
import LandingBanner from '../components/banners/LandingBanner'

// import FeedbackCard from '../components/cards/feedbackCard'
// import HomeMainBanner from '../components/banners/homeMainBanner'
// Mock Data
import {
  popularLeaguesData,
  popularSportsData,
  //  clientFeedbacksData
} from './mockData'

const Home = () => {
  const responsive = {
    largeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 4,
      slidesToSlide: 1, // optional, default to 1.
    },
    desktop: {
      breakpoint: { max: 1200, min: 1150 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1150, min: 750 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 750, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  }
  return (
    <div className='home-page'>
      {/* main banner */}
      <LandingBanner />
      {/* <HomeMainBanner /> */}

      <div style={{ height: '81px' }}></div>

      {/* popular leagues */}
      <h2 style={{ marginBottom: '24px', color: '#fff' }}>Popular Leagues</h2>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false}
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        {popularLeaguesData?.map((value, index) => (
          <div className='carousel-card' key={index}>
            <PopularLeagueCard data={value} />
          </div>
        ))}
      </Carousel>

      <AmericalFootballBanner />

      {/* popular sport */}
      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: '#fff' }}>Popular Sports</h2>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false}
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        {popularSportsData?.map((value, index) => (
          <div className='carousel-card' key={index}>
            <PopularSportCard data={{ ...value, index }} />
          </div>
        ))}
      </Carousel>

      {/* <h2 style={{ marginTop: '80px', marginBottom: '24px', color: '#fff' }}>Client Feedback</h2>

      <h4 style={{ marginTop: '20px', marginBottom: '54px', color: '#fff' }}>
        See what millions of users say about us
      </h4>

      <Row gutter={[20, 20]}>
        {clientFeedbacksData?.map((value, index) => (
          <Col xs={24} sm={24} lg={12} xl={12} xxl={8} key={index}>
            <FeedbackCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row> */}

      <div style={{ height: '80px' }}></div>
    </div>
  )
}

export default Home
