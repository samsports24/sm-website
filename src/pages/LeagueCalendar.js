import { Calendar, Col, Row } from 'antd'

// Components
import FilterBox from '../components/FilterComponent'
import StandingHeader from '../components/StandingHeader'
import moment from 'moment'

const LeagueCalendar = () => {
  const handleFilter = () => {}

  const dateCellRender = (value) => {
    let validDates = ['02', '04', '05', '06', '15', '19', '21', '23', '25', '27', '30']
    let date = moment(new Date(value)).format('DD')
    const listData = [
      { description: 'Wk 1 (14 NFL games)' },
      { description: 'Put All Free Agents On Waivers starts at 1:00 p.m.' },
    ]
    // const listData = getListData(moment(new Date(value)).format('MM-DD'))
    return (
      validDates.indexOf(date) !== -1 && (
        <ul className='calendar-date-box'>
          {listData.map((item, ind) => (
            <li key={ind} className={'date-box'}>
              {item?.description}
            </li>
          ))}
        </ul>
      )
    )
  }

  //   Calendar Function
  //   const getListData = (value) => {
  //     let listData = []
  //     birthDayData?.map((leave) => {
  //       if (leave?.dateOfBirth && value === moment(leave?.dateOfBirth).format('MM-DD')) {
  //         listData.push({ name: leave?.name })
  //       }
  //     })
  //     return listData || []
  //   }

  return (
    <div className='roster_container'>
      {/* HEADER */}
      <StandingHeader />

      {/* FILTERS */}
      <h2 className='heading'>DISPLAY:</h2>
      <FilterBox
        data={['this month', 'full season', 'ICS file export']}
        handleFilter={handleFilter}
      />

      <div style={{ height: '55px' }}></div>

      {/* TABLE */}
      <Row gutter={[30, 30]}>
        <Col xs={24}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{`< Sep 2022 >`}</h3>
            </div>
            <div className='main_table'>
              <Calendar dateCellRender={dateCellRender} />
            </div>
          </section>
        </Col>
        <Col xs={24}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{`< Sep 2022 >`}</h3>
            </div>
            <div className='main_table'>
              <Calendar
                //   value={moment('2022-01-11')}
                dateCellRender={dateCellRender}
              />
            </div>
          </section>
        </Col>
      </Row>
    </div>
  )
}

export default LeagueCalendar
