import { Col, Row, Table } from 'antd'

// Components
import FilterBox from '../components/FilterComponent'
import StandingHeader from '../components/StandingHeader'

// Mock Data
import { rosterData } from './mockData'

const LeagueRules = () => {
  const handleFilter = () => {}

  const columns = [
    {
      title: 'Event',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'RANGE (LOW-HIGH)',
      dataIndex: 'pts',
      key: 'pts',
    },
    {
      title: 'POINTS',
      dataIndex: 'bye',
      key: 'bye',
    },
    {
      title: 'TEST?',
      dataIndex: 'salary',
      key: 'salary',
    },
  ]

  return (
    <div className='roster_container'>
      {/* HEADER */}
      <StandingHeader />

      {/* FILTERS */}
      <h2 className='heading'>DISPLAY:</h2>
      <FilterBox data={['scoring rules', 'league setting']} handleFilter={handleFilter} />

      <div style={{ height: '55px' }}></div>

      {/* TABLE */}
      <Row gutter={[30, 30]}>
        <Col xs={24}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>RULES FOR QB, RB, WR, TE, PK, PN, DT, DE, LB, CB, S</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.player}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 'auto' }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
              />
            </div>
          </section>
        </Col>
        <Col xs={24}>
          <h2 className='heading' style={{ textTransform: 'capitalize', textAlign: 'center' }}>
            League Scoring Rules Last Modified: Tue Sep 6 7:54:11 p.m. ET 2022
          </h2>
        </Col>
      </Row>
    </div>
  )
}

export default LeagueRules
