import { Button, Select, Table } from 'antd'
import { useState, useEffect } from 'react'

// Components
import StandingHeader from '../components/StandingHeader'
import Pagination from '../components/Pagination'

// API
import { privateAPI } from '../config/constants'

const AdpReport = () => {
  const [adpReportData, setAdpReportData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdpReport()
  }, [])

  const fetchAdpReport = async () => {
    try {
      setLoading(true)
      const response = await privateAPI.post('/player/get-all', {})
      // Filter and sort for ADP report
      const data = response.data || []
      setAdpReportData(data)
    } catch (error) {
      console.error('Error fetching ADP report:', error)
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
    <div className='adp_report_container'>
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
          {/* Not Remove P Tag */}
          <p></p>
          <Select
            defaultValue='Not Injured'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Not Injured',
                label: 'Not Injured',
              },
              {
                value: 'Not Injured 2',
                label: 'Not Injured 2',
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
            defaultValue='5 Franchise'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: '5 Franchise',
                label: '5 Franchise',
              },
              {
                value: '6 Franchise',
                label: '6 Franchise',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          {/* Not Remove P Tag */}
          <p></p>
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
          {/* Not Remove P Tag */}
          <p></p>
          <Select
            defaultValue='Exclude mock..'
            style={{ width: 160 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Exclude mock',
                label: 'Exclude mock',
              },
              {
                value: 'Exclude mock 2',
                label: 'Exclude mock 2',
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

      <p className='warning_text' style={{ marginBottom: '40px' }}>
        <b>Warning!</b> The data below comes from only 31 drafts, some of which may not even be
        completed. Due to the small sample size it may not be useful. This can happen early in the
        season when there are not enough completed drafts. You can widen your search by changing the
        filters above.
      </p>

      {/* LOADING STATE */}
      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading ADP report...</div>}

      {/* EMPTY STATE */}
      {!loading && adpReportData.length === 0 && <div style={{ textAlign: 'center', padding: '40px' }}>No ADP data available</div>}

      {/* TABLE */}
      {!loading && adpReportData.length > 0 && (
      <section className='main_table_container adp_report_table'>
        <div className='header'>
          <h3>ADP REPORT</h3>
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
        <p className='hint_text' style={{ margin: 0 }}>
          Hint: Are you a developer who would like access to this data in industry-standard XML or
          JSON format? Check out our Developer&apos;s Program.
        </p>
      </section>
    </div>
  )
}

export default AdpReport
