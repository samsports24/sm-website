import { useState, useEffect } from 'react'
import { Col, Row, Spin, Empty } from 'antd'

// Component
import StandingHeader from '../components/StandingHeader'
import ScheduleCard from '../components/cards/ScheduleCard'
import FilterBox from '../components/FilterComponent'

// API
import { privateAPI, attachToken } from '../config/constants'

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const headers = attachToken()
        const response = await privateAPI.get('/schedule/get-schedule/1', { headers })
        setScheduleData(response.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching schedule:', err)
        setError(err.message)
        setScheduleData([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const handleFilter = () => {}

  return (
    <div className='schedule_container'>
      {/* HEADER */}
      <StandingHeader />

      <h2 className='heading'>DISPLAY:</h2>

      {/* FILTERS */}
      <FilterBox data={['by week', 'by franchise', 'compact']} handleFilter={handleFilter} />

      {/* SCHEDULE CARD */}
      <section className='schedule_card_container'>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Empty description={`Error: ${error}`} />
        ) : scheduleData.length === 0 ? (
          <Empty description="No schedule data available" />
        ) : (
          <Row gutter={[30, 30]}>
            {scheduleData?.map((v, i) => {
              return (
                <Col key={i} xs={24} xl={12}>
                  <ScheduleCard data={v} />
                </Col>
              )
            })}
          </Row>
        )}
      </section>
    </div>
  )
}

export default Schedule
