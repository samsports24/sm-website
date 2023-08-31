import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
// import { Col, Row } from 'antd'

import PopularLeagueCard from '../components/cards/popularLeagueCard'
import PopularSportCard from '../components/cards/popularSportCard'
import AmericalFootballBanner from '../components/banners/americanFootballBanner'
import LandingBanner from '../components/banners/LandingBanner'

import FeedbackCard from '../components/cards/feedbackCard'
// import HomeMainBanner from '../components/banners/homeMainBanner'
// Mock Data
import { popularLeaguesData, popularSportsData, clientFeedbacksData } from './mockData'
import DashboardBannerOne from '../components/banners/DashboardBannerOne'
import UpcomingMatchCard from '../components/cards/upcomingMatchCard'
import { Col, Row } from 'antd'
import { useSelector } from 'react-redux'
import ButtonMenu from '../components/ButtonMenu'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const user = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  let upcomingMatches = [
    {
      date: new Date(),
      location: 'Django Stadium',
      opponents: [require('../assets/beast-square-1.png'), require('../assets/blitz-square-1.png')],
    },
    {
      date: new Date(),
      location: 'Django Stadium',
      opponents: [require('../assets/beast-square-2.png'), require('../assets/blitz-square-2.png')],
    },
    {
      date: new Date(),
      location: 'Django Stadium',
      opponents: [require('../assets/beast-square-3.png'), require('../assets/blitz-square-3.png')],
    },
  ]
  const responsive = {
    largeDesktop: {
      breakpoint: { max: 4000, min: 1400 },
      items: 4,
      slidesToSlide: 1, // optional, default to 1.
    },
    desktop: {
      breakpoint: { max: 1400, min: 1150 },
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
  const responsiveNewsFeed = {
    largeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 3,
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
      {/* FANTASY LEAGUE */}
      {window.location.pathname == '/fantasy-league' && (
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
                    navigate: '/public-league',
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
      )}

      {!!user && window.location.pathname == '/' && (
        <>
          <DashboardBannerOne />

          <h2 style={{ marginTop: '50px', marginBottom: '20px', color: 'var(--white)' }}>
            Upcoming Matches
          </h2>

          <Row gutter={[30, 20]} style={{ marginBottom: '70px' }}>
            {upcomingMatches?.map((value, index) => (
              <Col xs={24} sm={24} lg={12} xl={12} xxl={8} key={index}>
                <UpcomingMatchCard data={{ ...value, index }} />
              </Col>
            ))}
          </Row>
        </>
      )}

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

      {/* CLIENT FEEDBACK */}
      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: '#fff' }}>Client Feedback</h2>
      <h4 style={{ marginTop: '20px', marginBottom: '54px', color: '#fff' }}>
        See what millions of users say about us
      </h4>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false}
        responsive={responsiveNewsFeed}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        {clientFeedbacksData?.map((value, index) => (
          <div className='carousel-card' key={index}>
            <FeedbackCard data={{ ...value, index }} />
          </div>
        ))}
      </Carousel>

      <div style={{ height: '80px' }}></div>
    </div>
  )
}

export default Home
