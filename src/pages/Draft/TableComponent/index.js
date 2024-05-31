import React, { useEffect, useState } from 'react'
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
} from '../../../redux/actions/draftAction'

import DraftPool from './DraftPool'
import DraftQueue from './DraftQueue'
import TeamRosters from './TeamRosters'

import { io } from 'socket.io-client'
import { base_url } from '../../../config/constants'
import { getRemainingSeconds } from '../../../config/helperFunctions'
import { getLeagueDetails } from '../../../redux'
import BlackList from './BlackList'

const TableComponent = ({ tableScroll }) => {
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
  } = useSelector((state) => state.draft)
  const USER = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const socket = io(base_url)

  const dispatch = useDispatch()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      socket.on('counter', async (data) => {
        dispatch(setRoundLoading(true))
        await getDraftCounter()
        await getLeagueDetails()
        await getAllPlayers({
          position: position,
          search: search,
          limit: limit,
          page: page,
        })
        await getALLplayerStats({
          position: position,
          search: search,
          limit: limit,
          page: page,
        })
        await getDraftRound()
        if (activeTab == 2) await getDraftQueue()
        dispatch(setRoundLoading(false))
      })
    }
  }, [localStorage.getItem('token')])

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

  useEffect(() => {
    console.log('allPlayers', allPlayers?.players?.[0]?.player?._id);

  }, [allPlayers]);
  

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
    console.log('inside this');
    setLoading(true);
    const draftQueue = await getDraftQueue();
    const blacklistQueue = await getBlackListQueue();
  


    let playerId = null;
  

    // if (!playerId && draftQueue?.length > 0) {
    //   console.log('inside this draft queue if');
    //   playerId = draftQueue[0]?.player?._id ;;
    // }

    // console.log('first',playerId);

    // if (!playerId && blacklistQueue.length > 0) {
    //   console.log('inside this blaclist if');

    //   // If the first player ID in blacklistQueue matches the first player ID in allPlayers, use the second player ID
    //   if (blacklistQueue[0]?.player?._id === allPlayers?.players?.[0]?.player?._id) {
    //     playerId = allPlayers?.players?.[1]?.player?._id;
    //   }
    // }
  
  

    // else{
    //   playerId = allPlayers?.players?.[0]?.player?._id
    // }
    

    if (!playerId && draftQueue?.length > 0) {
      console.log('inside this draft queue if');
      playerId = draftQueue[0]?.player?._id;
      console.log('first', playerId);
    } else if (!playerId && blacklistQueue.length > 0) {
      console.log('inside this blacklist if');
    
      // If the first player ID in blacklistQueue matches the first player ID in allPlayers, use the second player ID
      if (blacklistQueue[0]?.player?._id === allPlayers?.players?.[0]?.player?._id) {
        playerId = allPlayers?.players?.[1]?.player?._id;
      } else {
        playerId = blacklistQueue[0]?.player?._id;
      }
    } else {
      playerId = allPlayers?.players?.[0]?.player?._id;
    }
    

    // Add player to draft with the selected playerId
    if (playerId) {
   
      console.log('inside this if');
      await addPlayerToDraft({
        playerId: playerId,
     //  playerId:allPlayers?.players?.[0]?.player?._id,
        position: draftCounter?.position,
        round: draftCounter?.round,
        remainingTime: getRemainingSeconds(draftCounter?.time),
        teamId: onTheClock?.team?._id, // will be removed after testing
      });
    }
  
    setLoading(false);
  };

  return (
    <div className='table_com_box'>
      {
        <div className='pro_table_header'>
          <div className='pro_button_box'>
            {[
              'ALL',
              'QB',
              'RB',
              'WR',
              'TE',
              'OL',
              'DE',
              'DT',
              'LB',
              'CB',
              'S',
              'K/P',
            ]?.map((v, i) => {
              return (
                <Button
                  key={i}
                  type='primary'
                  className={`${position === v ? 'active' : ''}`}
                  onClick={() => {
                    dispatch(setPosition(v))
                    dispatch(setPage(1))
                  }}
                >
                  {v}
                </Button>
              )
            })}
          </div>
          <div className='pro_search_input_box'>
            <Button
              loading={loading}
              disabled={
                // false
                completed || !(onTheClock?.team?._id === USER?.userDetails?.team?._id)
              }
              type='primary'
              onClick={handleAutoDraft}
            >
              AUTODRAFT
            </Button>
            <Input
              onChange={(e) => {
                dispatch(setSearch(e.target.value))
                handleSearch(e.target.value)
                page !== 1 && dispatch(setPage(1))
              }}
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
