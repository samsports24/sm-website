import { Image } from 'antd'

// Component
import StandingHeader from '../components/StandingHeader'
import FilterBox from '../components/FilterComponent'

// Chart
import StandingDetailChart from '../components/Charts/StandingDetailChart'

const StandingDetail = () => {
  const handleFilter = (value) => {
  }

  return (
    <div className='standing_detail_container'>
      {/* HEADER */}
      <StandingHeader />

      <p className='hint_text'>
        Hint: For privacy reasons, owner email addresses, phone/fax numbers, and other owner contact
        information is only displayed to people who have logged into this league.
      </p>

      <h2 className='heading'>RED ZONE DRAGONS:</h2>

      {/* FILTER */}
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

      <section className='detail_container'>
        <div className='image_box'>
          <Image preview={false} src={require('../assets/dragons_big.png')} alt={'Image'} />
        </div>
        <div className='detail_content_box'>
          <h3>RED ZONE DRAGONS</h3>
          <div className='detail'>
            <div className='detail_row'>
              <p className='text1'>Last Visit:</p>
              <p className='text2'>130 days, 19 hours, 42 minutes ago</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Division:</p>
              <p className='text2'>North</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Conference:</p>
              <p className='text2'>The Manning Conference</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Accounting Balance:</p>
              <p className='text2'>0.00 SP</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Record (W-L-T):</p>
              <p className='text2'>
                11-6-0 (Franchise Schedule | Career Record | All-Time Series Records )
              </p>
            </div>
            <div className='detail_row'>
              <p className='text1'>YTD Points:</p>
              <p className='text2'>5555.525</p>
            </div>
          </div>
        </div>
      </section>

      <section className='chart_container'>
        <StandingDetailChart />
      </section>
    </div>
  )
}

export default StandingDetail
