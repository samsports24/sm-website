import { Col, Row } from 'antd'
import PopularLeagueCard from '../components/cards/popularLeagueCard'
import PopularSportCard from '../components/cards/popularSportCard'
import HomeMainBanner from '../components/banners/homeMainBanner'
import AmericalFootballBanner from '../components/banners/americanFootballBanner'
import FeedbackCard from '../components/cards/feedbackCard'
import DashboardBannerOne from '../components/banners/DashboardBannerOne'
import UpcomingMatchCard from '../components/cards/upcomingMatchCard'

const Dashboard = () => {
  let popularLeagues = [
    {
      title: 'American Football 1',
      description: 'Season Starts in Sept',
      players: [4, 32],
      open: true,
      image: require('../assets/rectangle-5.png'),
    },
    {
      title: 'American Football 2',
      description: 'Season Starts in Sept',
      players: [4, 32],
      open: true,
      image: require('../assets/rectangle-6.png'),
    },
    {
      title: 'American Football 3',
      description: 'Season Starts in Sept',
      players: [4, 32],
      open: true,
      image: require('../assets/rectangle-7.png'),
    },
    {
      title: 'American Football 4',
      description: 'Season Starts in Sept',
      players: [4, 32],
      open: true,
      image: require('../assets/rectangle-8.png'),
    },
  ]
  let popularSports = [
    {
      title: 'American Football',
      icon: require('../assets/ufafl-02-png-369-trans-1.png'),
      image: require('../assets/keith-johnston-vd-1-cz-99-sr-4-unsplash-1.png'),
    },
    {
      title: 'American Football',
      different: true,
      icon: require('../assets/ufafl-02-png-369-trans-2.png'),
      image: require('../assets/keith-johnston-vd-1-cz-99-sr-4-unsplash-2.png'),
    },
    {
      title: 'American Football',
      icon: require('../assets/ufafl-02-png-369-trans-0.png'),
      image: require('../assets/keith-johnston-vd-1-cz-99-sr-4-unsplash-4.png'),
    },
    {
      title: 'American Football',
      icon: require('../assets/ufafl-02-png-369-trans-3.png'),
      image: require('../assets/keith-johnston-vd-1-cz-99-sr-4-unsplash-3.png'),
    },
  ]
  let clientFeedbacks = [
    {
      image: require('../assets/frame-250.png'),
      comment:
        '“Ut enim ad minim veniam, quis nostrud exercit ation ullamco laboris nisi ut aliquip ex ea commodo consequat aute irure dolor in in velit esse  fugiat nulla pariatur.”',
      clientName: 'Brandi Redd',
    },
    {
      image: require('../assets/frame-251.png'),
      comment:
        '“ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.”',
      clientName: 'John Torcasio',
    },
    {
      image: require('../assets/frame-252.png'),
      comment:
        '“Ut enim ad minim veniam, quis nostrud exercit ation ullamco laboris nisi ut aliquip ex ea commodo consequat aute irure dolor in in velit esse  fugiat nulla pariatur.”',
      clientName: 'Brandi Redd',
    },
  ]
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

  return (
    <div className='home-page'>
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

      {/* main banner */}
      <HomeMainBanner />

      <div style={{ height: '81px' }}></div>

      {/* popular leagues */}
      <h2 style={{ marginBottom: '24px', color: 'var(--white)' }}>Popular Leagues</h2>

      <Row gutter={[20, 20]}>
        {popularLeagues?.map((value, index) => (
          <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
            <PopularLeagueCard data={value} />
          </Col>
        ))}
      </Row>

      <AmericalFootballBanner />

      {/* popular sport */}
      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: 'var(--white)' }}>
        Popular Sports
      </h2>

      <Row gutter={[20, 20]}>
        {popularSports?.map((value, index) => (
          <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
            <PopularSportCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row>

      <h2 style={{ marginTop: '80px', marginBottom: '24px', color: 'var(--white)' }}>
        Client Feedback
      </h2>

      <h4 style={{ marginTop: '20px', marginBottom: '54px', color: 'var(--white)' }}>
        See what millions of users say about us
      </h4>

      <Row gutter={[20, 20]}>
        {clientFeedbacks?.map((value, index) => (
          <Col lg={12} xl={12} xxl={8} key={index}>
            <FeedbackCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row>

      <div style={{ height: '80px' }}></div>
    </div>
  )
}

export default Dashboard
