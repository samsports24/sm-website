// Layout
import Layout from '../layout/Layout'

// Third
import { Button, Col, Image, Row } from 'antd'

// Image, Icon
import bellIcon from '../assets/bell-icon.svg'
import circaImage from '../assets/teams/circa_sports_trout.png'
import UfaflImage from '../assets/ufafl.png'

// Component
import LeagueScoreCard from '../components/cards/leagueScoreCard'

const LeagueScore = () => {
  let scores = [
    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },
    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },

    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },
    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },
    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },

    {
      image: require('../assets/heat-wave-square-1.png'),
      title: 'Hear Wave Square',
      date: new Date(),
      scores: [1, 2],
    },
  ]
  return (
    <Layout>
      <div className='league_container'>
        {/* HEADER */}
        <header>
          <div className='left'>
            <div className='image_div'>
              <Image preview={false} src={circaImage} />
            </div>
            <p>
              <span>League Notification</span> <img src={bellIcon} alt='Icon' />
            </p>
          </div>
          <div className='center'>
            <div className='title_box'>
              <h1>Circa Sports Trout</h1>
              <p>
                <span>Live Player Auction</span> <img src={bellIcon} alt='Icon' />
              </p>
            </div>
            <div className='button_and_team_box'>
              <div className='button_box'>
                <Button>Overall Record</Button>
                <Button>Division Record</Button>
              </div>
              <div className='team_financials_box'>
                <p>Team Financials</p>
                <div>
                  <p>Live Player Auction</p>
                  <span>---</span>
                </div>
                <div>
                  <p>Live Player Auction</p>
                  <span>---</span>
                </div>
              </div>
            </div>
          </div>
          <div className='right'>
            <div className='content'>
              <div className='top'>
                <span>23&apos;</span>
                <p> Same year Price-Pool</p>
              </div>
              <div className='content2'>
                <div className='image_div'>
                  <Image preview={false} src={UfaflImage} alt='UFAFL' />
                </div>
                <div className='content3'>
                  <div className='top'>
                    <span>23&apos;</span>
                    <p>Price-Pool</p>
                  </div>
                  <div className='top'>
                    <span>23&apos;</span>
                    <p>Price-Pool</p>
                  </div>
                </div>
              </div>
            </div>
            <h1>UFAFL Price_Pools</h1>
          </div>
        </header>
        <section className='score_card_container'>
          <h1 className='league_score_heading'>League Scores </h1>
          <Row gutter={[30, 20]}>
            {scores?.map((value, index) => (
              <Col lg={12} xl={12} xxl={8} key={index}>
                <LeagueScoreCard data={{ ...value, index }} />
              </Col>
            ))}
          </Row>
        </section>
      </div>
    </Layout>
  )
}

export default LeagueScore
