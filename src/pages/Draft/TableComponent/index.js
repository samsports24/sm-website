import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, Tabs } from 'antd'
import { CiSearch } from 'react-icons/ci'
import { useDispatch, useSelector } from 'react-redux'

import useDebounce from '../../../hooks/useDebounce'
import {
  addPlayerToDraft,
  getAllPlayers,
  getDraftCounter,
  getDraftQueue,
  getDraftRound,
  setDraftTab,
  setPage,
  setPosition,
  setRoundLoading,
  setSearch,
  getALLplayerStats,
  getBlackListQueue,
  setRookieplayers,
} from '../../../redux/actions/draftAction'

import DraftPool from './DraftPool'
import DraftQueue from './DraftQueue'
import TeamRosters from './TeamRosters'

import { io } from 'socket.io-client'
import { base_url } from '../../../config/constants'
import { getRemainingSeconds } from '../../../config/helperFunctions'
import { getLeagueDetails } from '../../../redux'
import BlackList from './BlackList'

const TableComponent = ({ tableScroll, autoDraftOn = false }) => {
  const {
    position,
    page,
    limit,
    search,
    onTheClock,
    draftCounter,
    allPlayers,
    activeTab,
    completed,
    Rookieplayers,
  } = useSelector((state) => state.draft)
  const USER = useSelector((state) => state.user)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const [loading, setLoading] = useState(false)


  const socketRef = useRef(null); // Store the socket instance
  // const socket = io(base_url)

  const [isRookieActive, setIsRookieActive] = useState(true)

  const dispatch = useDispatch()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      dispatch(setSearch(e.target.value))
      handleSearch(e.target.value)
      page !== 1 && dispatch(setPage(1))
    }
  }


  useEffect(() => {
    // Only create a single socket connection
    
    if (!socketRef.current) {
      socketRef.current = io(base_url)
    }

    // // Listen for incoming messages
    // socketRef.current.on("receive_message", (data) => {
    //   setChat((prevChat) => [...prevChat, data]);
    // });

    return () => {
      socketRef.current.disconnect(); // Clean up socket connection on unmount
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const getLeagueDetailsTemp = async () => {
      
      await getLeagueDetails().then(() => {
        // alert('getLeagueDetails')
      })
    }
    getLeagueDetailsTemp()
  }, [])

  useEffect(() => {
    if (localStorage.getItem('token')) {
      socketRef?.current?.on('counter', async (data) => {
        // alert('socket working')
        dispatch(setRoundLoading(true))
        await getDraftCounter()
        await getAllPlayers({
          position: position,
          search: search,
          limit: limit,
          page: page,
          // Rookieplayers:Rookieplayers,
        })
        await getALLplayerStats({
          position: position,
          search: search,
          limit: limit,
          page: page,
          // Rookieplayers:Rookieplayers,
        })
        await getDraftRound()
        if (activeTab == 2) await getDraftQueue()
        dispatch(setRoundLoading(false))
      })
    }
  }, [localStorage.getItem('token')])

  const handleRookieButtonClick = () => {
    if (isRookieActive) {
      dispatch(setRookieplayers(''))
      // dispatch(setPage(1));
    } else {
      dispatch(setRookieplayers('Rookie'))
    }
    setIsRookieActive(!isRookieActive) // Toggle the state
    dispatch(setPage(1)) // Reset page to 1 (assuming you need to do this on button click)
  }

  const items = [
    {
      key: '1',
      label: 'Draft Pool',
      children: <DraftPool tableScroll={tableScroll} />,
    },
    {
      key: '2',
      label: 'Draft Queue',
      children: <DraftQueue tableScroll={tableScroll} />,
    },
    {
      key: '3',
      label: 'Team Rosters',
      children: <TeamRosters tableScroll={tableScroll} />,
    },

    {
      key: '4',
      label: 'Black List',
      children: <BlackList tableScroll={tableScroll} />,
    },
  ]

  const _handleSearch = useDebounce((value) => {
    getAllPlayers({
      search: value,
      position,
      limit,
      page,
    })
  }, 1000)

  const handleSearch = (value) => {
    setSearch(value)
    _handleSearch(value)
  }

  // useEffect(() => {

  // }, [allPlayers]);


  // const handleAutoDraft = async () => {
  //   setLoading(true)
  //   const draftQueue = await getDraftQueue()

  //   const playerId =
  //     draftQueue?.length > 0 ? draftQueue[0]?.player?._id : allPlayers?.players?.[0]?.player?._id
  //   await addPlayerToDraft({
  //     playerId: playerId,
  //     position: draftCounter?.position,
  //     round: draftCounter?.round,
  //     remainingTime: getRemainingSeconds(draftCounter?.time),
  //     teamId: onTheClock?.team?._id, // will be removed after testing
  //   })
  //   setLoading(false)
  // }

  const handleAutoDraft = async () => {
    setLoading(true)
    const draftQueue = await getDraftQueue()
    const blacklistQueue = await getBlackListQueue()

    let playerId = null

    // 1. Try draft queue first (first queued player)
    if (draftQueue?.length > 0) {
      playerId = draftQueue[0]?.player?._id
    }

    // 2. If no queue pick, pick best available player that is NOT blacklisted
    if (!playerId) {
      const blacklistIds = new Set(
        (blacklistQueue || []).map((b) => b?.player?._id?.toString())
      )
      const available = allPlayers?.players || []
      const eligible = available.find(
        (p) => p?.player?._id && !blacklistIds.has(p.player._id.toString())
      )
      playerId = eligible?.player?._id || available[0]?.player?._id
    }

    // 3. Execute the pick
    if (playerId) {
      await addPlayerToDraft({
        playerId: playerId,
        position: draftCounter?.position,
        round: draftCounter?.round,
        remainingTime: getRemainingSeconds(draftCounter?.time),
        teamId: onTheClock?.team?._id,
      })
    }

    setLoading(false)
  }

  return (
    <div className='table_com_box'>
      {
        <div className='pro_table_header'>
          <div className='pro_button_box'>
            {(isOffenseOnly
              ? ['ALL', 'QB', 'RB', 'WR', 'TE', 'K']
              : ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'EDGE', 'IDL', 'LB', 'CB', 'S', 'K/P']
            )?.map(
              (v, i) => {
                if (i < 11) {
                  return (
                    <Button
                      key={i}
                      type='primary'
                      className={`${position === v ? 'active' : ''}`}
                      onClick={() => {
                        dispatch(setPosition(v))
                        // dispatch(setRookieplayers(''))
                        dispatch(setPage(1))
                      }}
                    >
                      {v}
                    </Button>
                  )
                } else {
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        rowGap: '5px',
                      }}
                    >
                      <Button
                        key={`${i}-pos`}
                        type='primary'
                        className={`${position === v ? 'active' : ''}`}
                        onClick={() => {
                          dispatch(setPosition(v))
                          // dispatch(setRookieplayers(''))
                          // dispatch(setRookieplayers('Rookie'))
                          dispatch(setPage(1))
                        }}
                      >
                        {v}
                      </Button>

                      <Button
                        key={`${i}-rookie`}
                        type='primary'
                        className={`${Rookieplayers === 'Rookie' ? 'active' : ''}`}
                        // onClick={() => {
                        //   // dispatch(setPosition('ALL'))
                        //   dispatch(setRookieplayers(''))
                        //   dispatch(setPage(1))
                        // }}

                        onClick={handleRookieButtonClick}
                      >
                        Rookie
                      </Button>
                    </div>
                  )
                }
              },
            )}

            {/* {['Rookie']?.map((v, i) => {
              return (
                <Button
                  key={i}
                  type='primary'
                  className={`${Rookieplayers === v ? 'active' : ''}`}
                  onClick={() => {
                    dispatch(setPosition('ALL'))
                    dispatch(setRookieplayers(v))
                    dispatch(setPage(1))
                  }}
                >
                  {v}
                </Button>
              )
            })} */}
          </div>

          <div className='pro_search_input_box'>
            <Button
              loading={loading}
              disabled={
                completed || !(onTheClock?.team?._id === USER?.userDetails?.team?._id)
              }
              type='primary'
              onClick={handleAutoDraft}
              className={autoDraftOn ? 'autodraft-btn-active' : ''}
            >
              {autoDraftOn ? '🤖 AUTODRAFT ON' : 'AUTODRAFT'}
            </Button>
            <Input
              // onChange={(e) => {
              //   dispatch(setSearch(e.target.value))
              //   handleSearch(e.target.value)
              //   page !== 1 && dispatch(setPage(1))
              // }}
              onKeyDown={handleKeyDown}
              allowClear
              placeholder='Search Player'
              suffix={<CiSearch color='var(--primary)' />}
            />
          </div>
        </div>
      }
      <div className='table_container'>
        <Tabs
          defaultActiveKey='1'
          items={items}
          className='tabs'
          onChange={(v) => dispatch(setDraftTab(v))}
        />
      </div>
    </div>
  )
}

export default TableComponent
