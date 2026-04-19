import React, { useState, useEffect } from 'react'
import { Col, Row, Table } from 'antd'

// Components
import StandingHeader from '../components/StandingHeader'

// API
import { privateAPI } from '../config/constants'

const AllReports = () => {
  const [leagueHistory, setLeagueHistory] = useState({ name: 'League History', data: [] })
  const [stats, setStats] = useState({ name: 'Stats', data: [] })
  const [scoreAndResults, setScoreAndResults] = useState({ name: 'Score and Results', data: [] })
  const [auction, setAuction] = useState({ name: 'Auction', data: [] })
  const [draft, setDraft] = useState({ name: 'Draft', data: [] })
  const [playerNews, setPlayerNews] = useState({ name: 'Player News', data: [] })
  const [players, setPlayers] = useState({ name: 'Players', data: [] })
  const [standings, setStandings] = useState({ name: 'Standings', data: [] })

  useEffect(() => {
    // API calls can be added here when endpoints are available
    // For now, using empty state defaults
  }, [])
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
