import React, { useEffect, useState } from 'react'

import Header from '../../components/Header'
import Loader from '../../components/Loader'
import ClockComponent from './ClockComponent'
import RoundComponent from './RoundComponent'
import RosterDetail from './RosterDetail'
import TableComponent from './TableComponent'

import { getDraftRound } from '../../redux/actions/draftAction'
import { getLeagueDetails } from '../../redux'
import { useSelector } from 'react-redux'

const Draft = () => {
  const { socket } = useSelector((state) => state.socket)
  const { currentLeague } = useSelector((state) => state.league)
  const { roundLoading, completed } = useSelector((state) => state.draft)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    !loading && setLoading(true)
    await getLeagueDetails()
    await getDraftRound(true)
    setLoading(false)
  }

  // useEffect(() => {
  //   if (socket) {
  //     socket.on('draftLive', getData)
  //     return () => {
  //       socket.off('draftLive', getData)
  //     }
  //   }
  // }, [socket])

  return (
    <>
      <Header />
      <div className='main_draft_container'>
        {loading || roundLoading ? (
          <Loader />
        ) : (
          <>
            {!currentLeague?.draftCompleted ? (
              <>
                {/* {completed && <p>Time is up running auto player pick</p>} */}
                <div className='main_d_left'>
                  <ClockComponent />
                  <RoundComponent height={'485px'} />
                </div>
                <div className='main_d_center'>
                  <RosterDetail />
                  <TableComponent professionalDraft tableScroll={{ x: 1000, y: 329 }} />
                </div>
              </>
            ) : (
              <LeagueEnd />
            )}
          </>
        )}
      </div>
    </>
  )
}

const LeagueEnd = () => {
  return (
    <section className='coming_soon'>
      <h1>Live Draft is Completed!</h1>
      <div className='time_container'></div>
    </section>
  )
}

export default Draft
