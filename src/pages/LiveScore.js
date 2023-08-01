// Component
import { Col, Row } from 'antd'
import StandingHeader from '../components/StandingHeader'
import LiveScoreCard from '../components/cards/LiveScoreCard'

// Mock Data
import { liveScoreData } from './mockData'

const LiveScore = () => {
  const handlePagination = (page) => {
    console.log(page)
  }

  return (
    <div className='standing_container'>
      {/* HEADER */}
      <StandingHeader pagination={true} handlePagination={handlePagination} />

      <div className='heading_box'>
        <h2>Aggregated Weekly Results: Last 3 Weeks</h2>
      </div>

      <section className='live_score_card_container'>
        <header>
          <h3>WEEK 22 RESULTS</h3>
        </header>
        <div className='card_container'>
          <Row gutter={[30, 30]}>
            {liveScoreData?.map((v, i) => {
              return (
                <Col key={i} xs={24} md={24} lg={12}>
                  <LiveScoreCard data={v} />
                </Col>
              )
            })}
          </Row>
        </div>
      </section>
    </div>
  )
}

export default LiveScore
