import { Table } from 'antd'
import { useState, useEffect } from 'react'

// Components
import StandingHeader from '../components/StandingHeader'
import FilterBox from '../components/FilterComponent'

// API
import { privateAPI } from '../config/constants'

const DraftPicks = () => {
  const [draftPicksData, setDraftPicksData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDraftPicks()
  }, [])

  const fetchDraftPicks = async () => {
    try {
      setLoading(true)
      const response = await privateAPI.get('/draft/get-draft-round')
      setDraftPicksData(response.data || [])
    } catch (error) {
      console.error('Error fetching draft picks:', error)
      setDraftPicksData([])
    } finally {
      setLoading(false)
    }
  }
  const columns = [
    {
      title: 'ROUND',
      dataIndex: 'round',
      key: 'round',
    },
    {
      title: 'ROUNDCURRENT PICK OWNER',
      dataIndex: 'currentPickOwner',
      key: 'currentPickOwner',
    },
    {
      title: 'ORIGINAL PICK OWNER',
      dataIndex: 'orignalPickOwner',
      key: 'orignalPickOwner',
    },
  ]

  const handleFilter = () => {}

  return (
    <div className='draft_picks_container'>
      {/* HEADER */}
      <StandingHeader />

      <section className='filter_container'>
        <div className='filter_container_left'>
          <h2 className='heading'>SORT/DISPLAY:</h2>
          <FilterBox
            data={['year,round,franchise', 'franchise,round,year', 'grid']}
            handleFilter={handleFilter}
          />
        </div>
        <div className='filter_container_right'>
          <h2 className='heading'>Go To Year:</h2>
          <FilterBox data={['2023', '2024']} handleFilter={handleFilter} />
        </div>
      </section>

      {/* LOADING STATE */}
      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading draft picks...</div>}

      {/* EMPTY STATE */}
      {!loading && draftPicksData.length === 0 && <div style={{ textAlign: 'center', padding: '40px' }}>No draft picks available</div>}

      {/* TABLE */}
      {!loading && draftPicksData.length > 0 && (
      <>
      {/* GENERAL CSS */}
      <section className='main_table_container adp_report_table'>
        <div className='header'>
          <h3>YEAR 2023 DRAFT PICKS</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={draftPicksData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1000 }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
          />
        </div>
      </section>

      <h2 className='note_heading'>
        Note: This is not a draft order! Franchises are listed in their default order.
      </h2>

      {/* TABLE */}
      {/* GENERAL CSS */}
      <section className='main_table_container adp_report_table'>
        <div className='header'>
          <h3>YEAR 2024 DRAFT PICKS</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={draftPicksData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1000 }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
          />
        </div>
      </section>
      </>
      )}
    </div>
  )
}

export default DraftPicks
