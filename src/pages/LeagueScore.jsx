import { useState } from 'react'

// Layout
import Layout from '../layout/Layout'

// Third
import { Button, Col, Image, Row, Pagination } from 'antd'

// Image, Icon
import bellIcon from '../assets/bell-icon.svg'
import circaImage from '../assets/teams/circa_sports_trout.png'
import UfaflImage from '../assets/ufafl.png'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'

// Component
import LeagueScoreCard from '../components/cards/leagueScoreCard'

const LeagueScore = () => {
  const [weekPagination, setWeekPagination] = useState(1)

  const handleWeekPagination = (value) => {
    if (value === 'previous') {
      weekPagination === 1 ? setWeekPagination(4) : setWeekPagination((pre) => pre - 1)
    } else if (value === 'next') {
      weekPagination === 4 ? setWeekPagination(1) : setWeekPagination((pre) => pre + 1)
    } else {
      setWeekPagination(value)
    }
  }

  const handlePagination = (page) => {
    console.log(page)
  }

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

        {/* SCHEDULE ONE */}
        <section className='schedule_box1'>
          <h2>2023 Team Schedule:</h2>
          <ul className='week_pagination_ul'>
            <li
              onClick={() => handleWeekPagination(1)}
              className={`${weekPagination === 1 && 'active_week'}`}
            >
              Week One
            </li>
            <li
              onClick={() => handleWeekPagination(2)}
              className={`${weekPagination === 2 && 'active_week'}`}
            >
              Week Two
            </li>
            <li
              onClick={() => handleWeekPagination(3)}
              className={`${weekPagination === 3 && 'active_week'}`}
            >
              Week Three
            </li>
            <li
              onClick={() => handleWeekPagination(4)}
              className={`${weekPagination === 4 && 'active_week'}`}
            >
              Week Four
            </li>
            <div className='pre_next_box'>
              <button className='previous' onClick={() => handleWeekPagination('previous')}>
                <FiArrowLeft />
              </button>
              <button className='next' onClick={() => handleWeekPagination('next')}>
                <FiArrowRight />
              </button>
            </div>
          </ul>
        </section>

        {/* SCHEDULE TWO */}
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <div className='pagination_box'>
            <h2>Go To Week:</h2>
            <Pagination
              defaultCurrent={1}
              total={180}
              showSizeChanger={false}
              onChange={handlePagination}
            />
          </div>
        </section>

        {/* CARDS */}
        <section className='score_card_container'>
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
