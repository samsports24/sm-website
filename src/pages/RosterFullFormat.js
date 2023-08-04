import { Col, Row, Table } from 'antd'

// Components
import FilterBox from '../components/FilterComponent'
import StandingHeader from '../components/StandingHeader'

// Mock Data
import { rosterData } from './mockData'

const RosterFullFormat = () => {
  const handleFilter = () => {}

  const columns = [
    {
      title: 'PLAYER:',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '2022 PTS',
      dataIndex: 'pts',
      key: 'pts',
    },
    {
      title: 'BYE',
      dataIndex: 'bye',
      key: 'bye',
    },
    {
      title: 'SALARY',
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
      <FilterBox
        data={['full format', 'grid format', 'with stats format']}
        handleFilter={handleFilter}
      />

      <div style={{ height: '55px' }}></div>

      {/* TABLE */}
      <Row gutter={[30, 30]}>
        <Col xs={24} xxl={12}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{rosterData?.title}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.player}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={4}>46 TOTAL PLAYERS</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>TOTAL:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$185,094,395</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>SALARY CAP:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$208,200,000</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>CAP ROOM AVAILABLE:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$23,105,605</Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </section>
        </Col>
        <Col xs={24} xxl={12}>
          <section className='main_table_container'>
            <div className='header'>
              <h3>{rosterData?.title}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.player}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={4}>46 TOTAL PLAYERS</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>TOTAL:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$185,094,395</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>SALARY CAP:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$208,200,000</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>CAP ROOM AVAILABLE:</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={1}>$23,105,605</Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </section>
        </Col>
      </Row>

      <Row gutter={[30, 30]}>
        <Col xs={24} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{rosterData?.title}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.injuredReserve}
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
        <Col xs={24} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{rosterData?.title}</h3>
            </div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.injuredReserve}
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
        <Col xs={24} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{rosterData?.totalPlayersOnIr?.totalPlayerIr} TOTAL PLAYERS ON IR</h3>
            </div>
            <div className='text_row'>{rosterData?.totalPlayersOnIr?.title}</div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.totalPlayersOnIr?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
            <div className='text_row'>
              {rosterData?.totalPlayersOnIr?.totalPlayer} total players on{' '}
              {rosterData?.totalPlayersOnIr?.title}
            </div>
          </section>
        </Col>
        <Col xs={24} xxl={12}>
          <section className='main_table_container' style={{ marginTop: '24px' }}>
            <div className='header'>
              <h3>{rosterData?.totalPlayersOnIr?.totalPlayerIr} TOTAL PLAYERS ON IR</h3>
            </div>
            <div className='text_row'>{rosterData?.totalPlayersOnIr?.title}</div>
            <div className='main_table'>
              <Table
                dataSource={rosterData?.totalPlayersOnIr?.data}
                columns={columns}
                bordered={false}
                pagination={false}
                scroll={{ x: 600 }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
                showHeader={false}
              />
            </div>
            <div className='text_row'>
              {rosterData?.totalPlayersOnIr?.totalPlayer} total players on{' '}
              {rosterData?.totalPlayersOnIr?.title}
            </div>
          </section>
        </Col>
      </Row>
    </div>
  )
}

export default RosterFullFormat
