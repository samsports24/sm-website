import { Button, Select, Table } from 'antd'

// Components
import FilterBox from '../components/FilterComponent'
import StandingHeader from '../components/StandingHeader'

// Mock Data
import { rosterWStatsData } from './mockData'

const RosterWStats = () => {
  const handleFilter = () => {}
  const handleFormat = () => {}

  const columns = [
    {
      title: 'WEEK:',
      dataIndex: 'week',
      key: 'week',
      render: (text) => {
        return <p style={{ minWidth: '200px' }}>{text}</p>
      },
    },
    {
      title: '1',
      dataIndex: 'week1',
      key: 'week1',
    },
    {
      title: '2',
      dataIndex: 'week2',
      key: 'week2',
    },
    {
      title: '3',
      dataIndex: 'week3',
      key: 'week3',
    },
    {
      title: '4',
      dataIndex: 'week4',
      key: 'week4',
    },
    {
      title: '5',
      dataIndex: 'week5',
      key: 'week5',
    },
    {
      title: '6',
      dataIndex: 'week6',
      key: 'week6',
    },
    {
      title: '7',
      dataIndex: 'week7',
      key: 'week7',
    },
    {
      title: '8',
      dataIndex: 'week8',
      key: 'week8',
    },
    {
      title: '9',
      dataIndex: 'week9',
      key: 'week9',
    },
    {
      title: '10',
      dataIndex: 'week10',
      key: 'week10',
    },
    {
      title: '11',
      dataIndex: 'week11',
      key: 'week11',
    },
    {
      title: '12',
      dataIndex: 'week12',
      key: 'week12',
    },
    {
      title: '13',
      dataIndex: 'week13',
      key: 'week13',
    },
    {
      title: '14',
      dataIndex: 'week14',
      key: 'week14',
    },
    {
      title: '15',
      dataIndex: 'week15',
      key: 'week15',
    },
    {
      title: '16',
      dataIndex: 'week16',
      key: 'week16',
    },
    {
      title: '17',
      dataIndex: 'week17',
      key: 'week17',
    },
    {
      title: '18',
      dataIndex: 'week18',
      key: 'week18',
    },
    {
      title: 'TOTAL',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'AVG',
      dataIndex: 'avg',
      key: 'avg',
    },
  ]

  return (
    <div className='roster_stats_container'>
      {/* HEADER */}
      <StandingHeader />

      <h2 className='heading'>PARADISE BLACK HAWKS:</h2>

      {/* FILTERS */}
      <FilterBox
        data={[
          'main',
          'roster',
          'roster w/stats',
          'scoring history',
          'transactions',
          'schedule',
          'accounting',
          'series records',
          'box score',
        ]}
        handleFilter={handleFilter}
      />
      <div className='format_filter_box'>
        <h2 className='display_text'>DISPLAY:</h2>
        <FilterBox
          data={['full format', 'grid format', 'with stats format']}
          handleFilter={handleFormat}
        />
      </div>

      {/* DROPDOWN */}
      <section className='dropdown_container'>
        <p className='text'>Show Franchise Stats For:</p>
        <div className='select_box'>
          <Select
            defaultValue='32'
            style={{ minWidth: 140 }}
            // onChange={handleChange}
            options={[
              {
                value: '32',
                label: '32',
              },
              {
                value: '33',
                label: '33',
              },
            ]}
          />
        </div>
        <Button className='now_btn'>Now</Button>
      </section>

      {/* TABLE */}
      <section className='main_table_container'>
        <div className='header'>
          <h3>QB</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={rosterWStatsData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </div>
      </section>
      <br />
      <br />
      <section className='main_table_container'>
        <div className='header'>
          <h3>QB</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={rosterWStatsData}
            columns={columns}
            bordered={false}
            pagination={false}
            // scroll={{ x: 1000 }}
          />

          <p className='table_center_heading'>ELLIOTT, EZEKIEL DAL </p>

          <Table
            dataSource={rosterWStatsData}
            columns={columns}
            bordered={false}
            pagination={false}
            // scroll={{ x: 1000 }}
            showHeader={false}
            className='second_table'
          />
        </div>
      </section>
    </div>
  )
}

export default RosterWStats
