import { Col, Row, Table } from 'antd'

// Components
import StandingHeader from '../components/StandingHeader'

// Mock Data
import {
  leagueHistory,
  stats,
  scoreAndResults,
  auction,
  draft,
  playerNews,
  players,
  standings,
} from './mockData'

const AllReports = () => {
  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      render: (name) => {
        return `• ${name}`
      },
    },
  ]

  return (
    <div className='roster_container'>
      {/* HEADER */}
      <StandingHeader />

      <div style={{ height: '55px' }}></div>

      {/* TABLE */}
      <Row gutter={[30, 30]}>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{scoreAndResults?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={scoreAndResults?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
              />
            </div>
          </section>
        </Col>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{stats?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={stats?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
              />
            </div>
          </section>
        </Col>
      </Row>

      <Row gutter={[30, 30]}>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{standings?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={standings?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{players?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={players?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
      </Row>
      <Row gutter={[30, 30]}>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{playerNews?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={playerNews?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{draft?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={draft?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
      </Row>
      <Row gutter={[30, 30]}>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{auction?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={auction?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
        <Col xs={24} md={12} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{leagueHistory?.name}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={leagueHistory?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
          </section>
        </Col>
      </Row>
    </div>
  )
}

export default AllReports
