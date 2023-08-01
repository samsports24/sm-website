import { Col, Row } from 'antd'

// Component
import StandingHeader from '../components/StandingHeader'
import ScheduleCard from '../components/cards/ScheduleCard'
import FilterBox from '../components/FilterComponent'

// Mock Data
import { scheduleData } from './mockData'

const Schedule = () => {
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
        <Row gutter={[30, 30]}>
          {scheduleData?.map((v, i) => {
            return (
              <Col key={i} xs={24} xl={12}>
                <ScheduleCard data={v} />
              </Col>
            )
          })}
        </Row>
      </section>
    </div>
  )
}

export default Schedule
