import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'

import { getScheduleByWeek, getWeeklyNflSchedule, updateWeek } from '../redux'
import { useSelector, useDispatch } from 'react-redux'

import Carousel from 'react-multi-carousel'

import { TiChevronRight } from 'react-icons/ti'

const LeagueScore = () => {
  const SETTING = useSelector((state) => state?.user?.setting)

  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [carouselData, setCarouselData] = useState([])

  const dispatch = useDispatch()

  useEffect(() => {
    getDataByWeek()
  }, [SETTING?.week])

  const getDataByWeek = async () => {
    setLoading(true)
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
    const schedule = await getWeeklyNflSchedule({ week: SETTING?.week })
    setCarouselData(schedule)
    setLoading(false)
  }

  const handlePagination = (page) => {
    dispatch(updateWeek(page))
  }

  return (
    <div className='league_container'>
      <Header />

      <main className='practice_squad_container wrapper'>
        <section className='schedule_box2'>
          <h1>League Scores </h1>
          <Pagination
            title='Go To Week:'
            current={SETTING?.week}
            defaultCurrent={SETTING?.week}
            // total={180}
            total={230}
            onChange={handlePagination}
          />
        </section>

        {/* CARDS */}
        <section className='score_card_container'>
          <Row gutter={[100, 40]}>
            {loading ? (
              <Loader />
            ) : data?.length > 0 ? (
              <>
                {carouselData?.length > 0 && (
                  <Col xs={24}>
                    <CarouselComponent data={carouselData} />
                  </Col>
                )}
                {data?.map((value, index) => (
                  <Col xs={24} xl={12} key={index}>
                    <NewLeagueScoreCard data={{ ...value, index }} />
                  </Col>
                ))}
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '20vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p className='no_schedule_text'>No Schedule..</p>
              </div>
            )}
          </Row>
        </section>
      </main>
    </div>
  )
}

const CarouselComponent = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1500 },
      items: 7,
    },
    desktop1: {
      breakpoint: { max: 1600, min: 1400 },
      items: 5,
    },
    desktop2: {
      breakpoint: { max: 1400, min: 1300 },
      items: 4,
    },
    desktop3: {
      breakpoint: { max: 1300, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  }

  let carousel

  const handleBeforeChange = (currentSlide) => {
    setCurrentSlide(currentSlide)
  }

  const handleNext = () => carousel.next()

  const getSchedule = (status, obj) => {
    let value = null
    if (obj?.AwayTeam === 'BYE') {
      value = `${obj?.HomeTeam} is on BYE`
    } else if (status === 'Final') {
      value = 'F'
    } else if (status === 'Scheduled') {
      value = 'S'
    } else {
      const minutes = obj?.TimeRemainingMinutes > 0 ? obj?.TimeRemainingMinutes : '00'
      const seconds = obj?.TimeRemainingSeconds > 0 ? obj?.TimeRemainingSeconds : '00'
      value = `${minutes} : ${seconds} ${status}`
    }
    return value
  }

  return (
    <div className='gm_carousel_box'>
      <div className='gm_carousel'>
        <Carousel
          responsive={responsive}
          arrows={false}
          ref={(el) => (carousel = el)}
          beforeChange={handleBeforeChange}
          infinite={true}
        >
          {data?.map((v, i) => {
            const activeClass = v?.Status === 'InProgress' ? 'active' : ''
            return (
              <div key={i} className='gm_carousel_card'>
                <div className='row'>
                  <p className={`${activeClass}`}>{v?.HomeTeam}</p>
                  <p className={`${activeClass}`}>{v?.HomeScore > 0 ? v?.HomeScore : '-'}</p>
                </div>
                <div className='row'>
                  <p className={`${activeClass}`}>{v?.AwayTeam}</p>
                  <p className={`${activeClass}`}>{v?.AwayScore > 0 ? v?.AwayScore : '-'}</p>
                </div>
                <div className='row'>
                  <p className={`${activeClass}`}>{getSchedule(v?.Status, v)}</p>
                </div>
              </div>
            )
          })}
        </Carousel>
      </div>

      <div className='gm_carousel_arrow'>
        <div className={`arrow`} onClick={handleNext}>
          <TiChevronRight color={'#fff'} size={50} />
        </div>
      </div>
    </div>
  )
}

const NewLeagueScoreCard = ({ data }) => {
  const USER = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  const getName = (name) => {
    const array = name.split(' ')
    const length = array[0]?.length <= 3 ? true : false
    return length ? `${array[0]} ${array[1]}` : array[0]
  }

  const handleNavigate = (id) => {
    if (USER?.team?._id === id) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${id}`)
    }
  }

  return (
    <div className='nls_card'>
      <div className='nls_card_top'>
        <div className='nls_card_top_left'>
          <p onClick={() => handleNavigate(data?.opponentOne?._id)}>
            {getName(data?.opponentOne?.name)}
          </p>
          <p>
            ({data?.record?.teamOne?.win}-{data?.record?.teamOne?.lose})
          </p>
        </div>
        <div className='nls_card_top_center'>
          <div
            className='game_detail'
            onClick={() => {
              navigate('/game-details', {
                state: {
                  data,
                },
              })
            }}
          >
            <p>GAME DETAILS</p>
          </div>
        </div>
        <div className='nls_card_top_right'>
          <p>
            ({data?.record?.teamTwo?.win}-{data?.record?.teamTwo?.lose})
          </p>
          <p onClick={() => handleNavigate(data?.opponentTwo?._id)}>
            {getName(data?.opponentTwo?.name)}
          </p>
        </div>
      </div>
      <div className='nls_card_bottom'>
        <div className='nls_card_left'>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentOne?.logo})` }}
          ></div>
          <div className='nls_score_box_1'>
            <p>{data?.scoreOne || '0.00'}</p>
          </div>
        </div>
        <div className='nls_card_right'>
          <div className='nls_score_box_2'>
            <p>{data?.scoreTwo || '0.00'}</p>
          </div>
          <div
            className='nls_img_box'
            style={{ backgroundImage: `url(${data?.opponentTwo?.logo})` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default LeagueScore
