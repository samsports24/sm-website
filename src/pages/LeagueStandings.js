// Component
import LeagueStandingCard from '../components/LeagueStandingCard'
import StandingHeader from '../components/StandingHeader'

// Mock Data
import { leagueStandingData } from './mockData'

const LeagueStandings = () => {
  const handlePagination = (page) => {
    console.log(page)
  }

  return (
    <div className='standing_container'>
      {/* HEADER */}
      <StandingHeader pagination={true} handlePagination={handlePagination} />

      <div className='heading_box'>
        <h2>League Standings</h2>
      </div>

      <div className='league_standing_card_container' style={{ width: '100%' }}>
        {leagueStandingData?.map((v, i) => (
          <LeagueStandingCard key={i} data={v} index={i} />
        ))}
      </div>
    </div>
  )
}

export default LeagueStandings
