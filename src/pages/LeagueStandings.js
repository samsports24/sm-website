// Component
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import LeagueStandingCard from '../components/LeagueStandingCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
// import StandingHeader from '../components/StandingHeader'

// Mock Data
// import { leagueStandingData } from './mockData'
import { getLeagueStandings } from '../redux'
import Loader from '../components/Loader'
import { useSelector } from 'react-redux'

const LeagueStandings = () => {
  // const handlePagination = (page) => {
  //   console.log(page)
  // }
  const setting = useSelector((state) => state?.user?.setting)

  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let data = await getLeagueStandings(setting?.week)
      setStandings(data)
      setLoading(false)
    })()
  }, [])

  return (
    <div className='standing_container pro_league_container standing_header_container'>
      {/* HEADER */}
      {/* <StandingHeader pagination={true} handlePagination={handlePagination} /> */}
      <h1>SAM FOOTBALL LEAGUE</h1>

      <Header />

      <ButtonsAndPagination />

      <div className='heading_box'>
        <h2>League Standings</h2>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className='league_standing_card_container' style={{ width: '100%' }}>
          {standings?.map((v, i) => (
            <LeagueStandingCard key={i} data={v} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default LeagueStandings
