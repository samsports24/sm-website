import { useEffect, useState } from 'react'

import Header from '../components/Header'
import LeagueStandingCard from '../components/LeagueStandingCard'
import Loader from '../components/Loader'

import { getLeagueStandings } from '../redux'
import { useSelector } from 'react-redux'
import { Col, Row } from 'antd'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

const LeagueStandings = () => {
  const setting = useSelector((state) => state?.user?.setting)
  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [setting?.week])
  const getData = async () => {
    setLoading(true)
    let data = await getLeagueStandings(setting?.week)
    setStandings(data)
    setLoading(false)
  }

  return (
    <div className='standing_container pro_league_container standing_header_container'>
      <h1>SAM FOOTBALL LEAGUE</h1>
      <Header />
      <HeadingAndWeek />
      <hr className='divider' />
      <div className='heading_box'>
        <h2>League Standings</h2>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className='league_standing_card_container' style={{ width: '100%' }}>
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Row gutter={[20, 20]}>
                {standings?.teamRanks
                  ?.filter((v) => v?.conference?.includes('Elite'))
                  ?.map((v, i) => (
                    <Col key={i} xs={24}>
                      <LeagueStandingCard data={v} index={i} teams={standings?.teams} />
                    </Col>
                  ))}
              </Row>
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={[20, 20]}>
                {standings?.teamRanks
                  ?.filter((v) => v?.conference?.includes('Premier'))
                  ?.map((v, i) => (
                    <Col key={i} xs={24}>
                      <LeagueStandingCard data={v} index={i} teams={standings?.teams} />
                    </Col>
                  ))}
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}

export default LeagueStandings
