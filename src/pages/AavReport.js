import { Button, Select, Table } from 'antd'
import { useState, useEffect } from 'react'

// Components
import StandingHeader from '../components/StandingHeader'
import Pagination from '../components/Pagination'

// API
import { privateAPI } from '../config/constants'

const AavReport = () => {
  const [adpReportData, setAdpReportData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAavReport()
  }, [])

  const fetchAavReport = async () => {
    try {
      setLoading(true)
      const response = await privateAPI.post('/player/get-all', {})
      // Filter and sort for AAV report
      const data = response.data || []
      setAdpReportData(data)
    } catch (error) {
      console.error('Error fetching AAV report:', error)
      setAdpReportData([])
    } finally {
      setLoading(false)
    }
  }
  const columns = [
    {
      title: 'RANK',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: 'PLAYER',
      dataIndex: 'player',
      key: 'player',
    },
    {
      title: 'ROSTER',
      dataIndex: 'roster',
      key: 'roster',
    },
    {
      title: 'AVG PICK',
      dataIndex: 'avgPick',
      key: 'avgPick',
    },
    {
      title: 'MIN PICK ',
      dataIndex: 'minPack',
      key: 'minPack',
    },
    {
      title: 'MAN PICK ',
      dataIndex: 'manPack',
      key: 'manPack',
    },
    {
      title: '% SELECTED ',
      dataIndex: 'selectedPercent',
      key: 'selectedPercent',
    },
  ]

  return (
    <div className='aav_report_container'>
      {/* HEADER */}
      <StandingHeader />

      {/* DROPDOWN -> GENERAL CSS */}
      <section className='dropdown_container' style={{ marginBottom: '25px' }}>
        <div className='select_box'>
          <p>Show:</p>
          <Select
            defaultValue='Any Position'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Any Position',
                label: 'Any Position',
              },
              {
                value: 'Any Position 2',
                label: 'Any Position 2',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          {/* Not Remove P Tag */}
          <p></p>
          <Select
            defaultValue='All Players'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'All Players',
                label: 'All Players',
              },
              {
                value: 'All Players 2',
                label: 'All Players 2',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Select in at least % of</p>
          <Select
            defaultValue='5'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: '5',
                label: '5',
              },
              {
                value: '6',
                label: '6',
              },
            ]}
          />
        </div>
      </section>

      {/* DROPDOWN -> GENERAL CSS */}
      <section className='dropdown_container' style={{ marginTop: '0px' }}>
        <div className='select_box'>
          <p>Leagues with</p>
          <Select
            defaultValue='PPR Scoring'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'PPR Scoring',
                label: 'PPR Scoring',
              },
              {
                value: 'PPR Scoring 2',
                label: 'PPR Scoring 2',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          {/* Not Remove P Tag */}
          <p></p>
          <Select
            defaultValue='Keep League'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Keep League',
                label: 'Keep League',
              },
              {
                value: 'Keep League 2',
                label: 'Keep League 2',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Starting</p>
          <Select
            defaultValue='All'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'All',
                label: 'All',
              },
              {
                value: 'All 2',
                label: 'All 2',
              },
            ]}
          />
        </div>
        <Button className='now_btn'>Now</Button>
      </section>

      <p className='hint_text' style={{ marginBottom: '40px' }}>
        Note: Dollar values shown are based relative to $1000 available funds for all franchiess in
        the league (i.e. the sum of all the franchises initial auction funds).
      </p>

      {/* LOADING STATE */}
      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading AAV report...</div>}

      {/* EMPTY STATE */}
      {!loading && adpReportData.length === 0 && <div style={{ textAlign: 'center', padding: '40px' }}>No AAV data available</div>}

      {/* TABLE */}
      {!loading && adpReportData.length > 0 && (
      <section className='main_table_container adp_report_table'>
        <div className='header'>
          <h3>AAV REPORT</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={adpReportData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1000 }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
          />
        </div>
      </section>
      )}

      <section className='footer_section'>
        <Pagination
          title='Standings as of Week:'
          defaultCurrent={1}
          total={180}
          // onChange={handlePagination}
        />
        <div className='center_content'>
          <h3>A total of 31 drafts were included in this analysis.</h3>
          <div className='select_box_content'>
            <p>See the league draft report for:</p>
            <Select
              // defaultValue='Select League Name'
              placeholder='Select League Name'
              style={{ width: 230 }}
              // onChange={handleChange}
              options={[
                {
                  value: 'League Name 1',
                  label: 'League Name 1',
                },
                {
                  value: 'League Name 2',
                  label: 'League Name 2',
                },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default AavReport
