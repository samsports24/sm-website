import { Button, Select } from 'antd'

// Component
import StandingHeader from '../components/StandingHeader'
import StatsCard from '../components/StatsCard'
import FilterBox from '../components/FilterComponent'

// Mock Data
import { playerStatsData } from './mockData'

const PlayerStats = () => {
  const handleFilter = (value) => {
    console.log('value :>> ', value)
  }

  return (
    <div className='player_stats_container'>
      {/* HEADER */}
      <StandingHeader />

      <h2 className='heading'>STANDARD REPORTS:</h2>

      {/* FILTERS */}
      <FilterBox
        data={[
          'top performers',
          'top free agents',
          'top passers',
          'top rushers',
          'top receivers',
          'top kickers',
          'top defenses',
        ]}
        handleFilter={handleFilter}
      />

      {/* DROPDOWN */}
      <section className='dropdown_container'>
        <div className='select_box'>
          <p>Show me the top</p>
          <Select
            defaultValue='32'
            style={{ minWidth: 130 }}
            // onChange={handleChange}
            options={[
              {
                value: '32',
                label: '32',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Year</p>
          <Select
            defaultValue='2022'
            style={{ minWidth: 110 }}
            // onChange={handleChange}
            options={[
              {
                value: '2022',
                label: '2022',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Week</p>
          <Select
            defaultValue='1'
            style={{ minWidth: 110 }}
            // onChange={handleChange}
            options={[
              {
                value: '1',
                label: '1',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Through Week</p>
          <Select
            defaultValue='28'
            style={{ minWidth: 130 }}
            // onChange={handleChange}
            options={[
              {
                value: '28',
                label: '28',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Search By</p>
          <Select
            defaultValue='Overall'
            style={{ minWidth: 130 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Overall',
                label: 'Overall',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Search By</p>
          <Select
            defaultValue='Player'
            style={{ minWidth: 130 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Player',
                label: 'Player',
              },
            ]}
          />
        </div>
        <Button className='now_btn'>Now</Button>
        <Button className='advance_btn'>Advance Search</Button>
      </section>

      {/* STATS */}
      <section className='stats_container'>
        {playerStatsData?.map((v, i) => {
          return <StatsCard key={i} data={v} index={i} />
        })}
      </section>
    </div>
  )
}

export default PlayerStats
