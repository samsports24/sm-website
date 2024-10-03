import React, { useEffect, useRef, useState } from 'react'

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
  const isMounted = useRef(false)
  console.log("Check count of component")
  const { socket } = useSelector((state) => state.socket)
  const { currentLeague } = useSelector((state) => state.league)
  const { roundLoading, completed } = useSelector((state) => state.draft)
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   isMounted.current = true;
  //   return () => { isMounted.current = false }
  // }, []);

  // useEffect(() => {
  //   if(isMounted.current){
  //     console.log("isMounted", isMounted.current)
  //   }
  // },[isMounted])


  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
     console.log('in the data');
    
    !loading && setLoading(true) 
     await getLeagueDetails()
    await getDraftRound(true)
    setLoading(false)
  }

  useEffect(() => {
    if (socket) {
      console.log('in the socket');
      
      socket.on('draftLive', getData)
      return () => {
        socket.off('draftLive', getData)
      }
    }
  }, [socket])

  // console.log('loading',loading);
  // console.log('roundLoading',roundLoading);
  

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


const LeaguePaused = () => {
  return (
    <section className='coming_soon'>
      <h1>Live Draft is Paused!</h1>
      <div className='time_container'></div>
    </section>
  )
}

export default Draft


{/* <div className='main_draft_container'>
      {loading || roundLoading ? (
        <Loader />
      ) : (
        <>
          {currentLeague?.draftPaused  ? (
            <LeaguePaused />
          ) : !currentLeague?.draftCompleted ? (
            <>

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
     
<>
            <div className='main_d_left'>
   
            <RoundComponent height={'485px'} />
          </div>
          <div className='main_d_center'>
            <RosterDetail />
            <TableComponent professionalDraft tableScroll={{ x: 1000, y: 329 }} />
          </div>
          </>
          )}
        </>
      )}
    </div> */}