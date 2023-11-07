import { useEffect, useState } from 'react'

import Header from '../components/Header'
import LeagueStandingCard from '../components/LeagueStandingCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import { getLeagueStandings } from '../redux'
import { useSelector } from 'react-redux'

const LeagueStandings = () => {
  const setting = useSelector((state) => state?.user?.setting)
  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [setting?.week])
  const getData = async () => {
    setLoading(true)
    let data = await getLeagueStandings(setting?.week)
    setStandings(data)
    setLoading(false)
  }

  return (
    <div className='standing_container pro_league_container standing_header_container'>
      <h1>SAM FOOTBALL LEAGUE</h1>
      <Header />
      <ButtonsAndPagination />
      <hr className='divider' />
      <div className='heading_box'>
        <h2>League Standings</h2>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className='league_standing_card_container' style={{ width: '100%' }}>
          {standings?.teamRanks?.map((v, i) => (
            <LeagueStandingCard key={i} data={v} index={i} teams={standings?.teams} />
          ))}
        </div>
      )}
    </div>
  )
}

export default LeagueStandings
