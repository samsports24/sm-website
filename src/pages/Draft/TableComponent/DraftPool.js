import React, { useEffect, useState } from 'react'
import { Button, Input, Spin, Table, Tabs } from 'antd'
import { CiSearch } from 'react-icons/ci'
import { BiSolidPlusCircle } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'

import useDebounce from '../../../hooks/useDebounce'

import {
  createDraftQueue,
  deleteDraftQueue,
  getAllPlayers,
  getDraftQueue,
  setPage,
  setPosition,
  setSearch,
  setSelectedPlayer,
} from '../../../redux/actions/draftAction'

const DraftPool = ({ tableScroll }) => {
  const { allPlayers, position, search, page, limit, tableLoading, draftQueues, activeTab } =
    useSelector((state) => state.draft)
  const { userDetails } = useSelector((state) => state.user)
  const [loading, setLoading] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeTab == 1)
      getData({
        position,
        search,
        limit,
        page,
      })
  }, [position, limit, page, activeTab])


  const getData = async (payload) => {
    await getAllPlayers(payload,position)
    // await getDraftQueue()
  }

  const handleAddQueue = async (id) => {
    setLoading(id)
    await createDraftQueue({
      team: userDetails?.team?._id,
      player: id,
    })
    setLoading('')
  }

  const handleDeleteQueue = async (playerId, queueId) => {
    setLoading(playerId)
    await deleteDraftQueue(queueId)
    setLoading('')
  }

  const getColumns = (position) => {
    console.log("🚀 ~ getColumns ~ position:", position)
    const columns = [
      {
        width: 50,
        title: ' ',
        dataIndex: 'plus-icon',
        key: 'plus-icon',
        render: (_, obj) => {
          const isQueue = draftQueues?.find((v) => v?.player?._id === obj?._id)
          return (
            <div>
              {loading === obj?._id ? (
                <Spin />
              ) : isQueue ? (
                <BiSolidPlusCircle
                  size={18}
                  style={{ marginBottom: '-3px', cursor: 'pointer' }}
                  color={'var(--primary)'}
                  onClick={() => handleDeleteQueue(obj?._id, isQueue?._id)}
                />
              ) : (
                <BiSolidPlusCircle
                  size={18}
                  style={{ marginBottom: '-3px', cursor: 'pointer' }}
                  onClick={() => handleAddQueue(obj?._id)}
                />
              )}
            </div>
          )
        },
      },
      {
        width: 90,
        title: 'Rank',
        dataIndex: 'mlbFantasyRank',
        key: 'mlbFantasyRank',
        render: (t) => <p>{t || '-'}</p>,
      },
      {
        width: 150,
        title: 'Player',
        dataIndex: 'player',
        key: 'player',
        render: (_, obj) => {
          const inj = obj?.InjuryStatus
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.Name}{' '}
              </p>{' '}
              {/* <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p> */}
              {inj === 'Out' ? (
                <>
                  <span className='injury_plus'>
                    <b>+</b>
                  </span>
                  <p className='injury_plus_text'>O</p>
                </>
              ) : inj === 'Questionable' ? (
                <p className='injury_status'>Q</p>
              ) : inj === 'Doubtful' ? (
                <p className='injury_status'>D</p>
              ) : inj === 'Suspended' ? (
                <p className='injury_status'>SSPD</p>
              ) : inj === 'Injured Reserve' ? (
                <p className='injury_status'>IR</p>
              ) : (
                ''
              )}
            </div>
          )
        },
      },
      {
        width: 180,
        title: 'POSITION',
        dataIndex: 'pos',
        key: 'pos',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.Team || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 180,
        title: 'TEAM',
        dataIndex: 'team',
        key: 'team',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.Position || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 180,
        title: 'CAP HIT',
        dataIndex: 'caphit',
        key: 'caphit',
        render: (t) => <p>{t || '-'}</p>,
      },
      {
        width: 150,
        title: 'SAM ADP',
        dataIndex: 'adp',
        key: 'adp',
        render: (t) => <p>{t || '-'}</p>,
      },
    ]

    const columns2 = [
      {
        width: 150,
        title: '23 TOTAL POINTS',
        dataIndex: 'mlbFantasyPoints',
        key: 'mlbFantasyPoints',
        render: (_, obj) => {
          return <div className='table_player_name_box nrc_container'>
          <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            {obj?.pf || '-'}
          </p>
        </div>
        },
      },
      {
        width: 150,
        title: '23 AVG.POINTS',
        dataIndex: 'pf',
        key: 'pf',
        render: (_, obj) => {
          return <div className='table_player_name_box nrc_container'>
          <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            {obj?.avgPf || '-'}
          </p>
        </div>
        },
      },

      {
        width: 150,
        title: '24 PROJ.TOTAL POINTS',
        dataIndex: 'pf',
        key: 'pf',
        // render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
        render: (_, obj) => {
          return <div className='table_player_name_box nrc_container'>
          <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            {obj?.FantasyPoints24 || '-'}
          </p>
        </div>
        },
      },
      {
        width: 150,
        title: '24 PROJ.AVG POINTS',
        dataIndex: 'pf',
        key: 'pf',
        // render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
        render: (_, obj) => {
          return <div className='table_player_name_box nrc_container'>
          <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            {obj?.AvgFantasyPoints24 || '-'}
          </p>
        </div>
        },
      },
    ]

    const columns3 = [
  
      {
        width: 150,
        title: 'TPF',
        dataIndex: 'tpf',
        key: 'tpf',
        render: (t) => {
          return <p>{t || '-'}</p>
        },
      },
      {
        width: 150,
        title: 'AVG',
        dataIndex: 'avg',
        key: 'avg',
        render: (t) => {
          return <p>{t?.toFixed(2) || '-'}</p>
        },
      },

      {
        width: 150,
        title: 'RECIVING',
        dataIndex: 'pf',
        key: 'pf',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 150,
        title: 'RUSHING',
        dataIndex: 'pf',
        key: 'pf',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
    ]


    const columns4 = [
  
      {
        width: 150,
        title: '23 TEAMSCOREAVG',
        dataIndex: 'tsg',
        key: 'tsg',
        render: (t) => {
          return <p>{t || '-'}</p>
        },
      },
      {
        width: 150,
        title: '23 TOTAL POINTS',
        dataIndex: 'tp',
        key: 'tp',
        render: (t) => {
          return <p>{t?.toFixed(2) || '-'}</p>
        },
      },

      {
        width: 150,
        title: '23 SNAP %',
        dataIndex: 'snap',
        key: 'snap',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 150,
        title: '23 AVG. POINTS',
        dataIndex: 'avgpoints',
        key: 'avgpoints',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
    ]



    const columns5 = [
  
      {
        width: 90,
        title: 'TPF',
        dataIndex: 'tpf',
        key: 'tpf',
        render: (t) => {
          return <p>{t || '-'}</p>
        },
      },
      {
        width: 90,
        title: 'TAPF',
        dataIndex: 'tapf',
        key: 'tapf',
        render: (t) => {
          return <p>{t?.toFixed(2) || '-'}</p>
        },
      },

      {
        width: 90,
        title: 'IDP TDS',
        dataIndex: 'idp',
        key: 'idp',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 90,
        title: 'SCKS ',
        dataIndex: 'scks',
        key: 'scks',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },


      {
        width: 90,
        title: 'QBH',
        dataIndex: 'qbh',
        key: 'qbh',
        render: (t) => {
          return <p>{t?.toFixed(2) || '-'}</p>
        },
      },

      {
        width: 90,
        title: 'TKLS',
        dataIndex: 'tkls',
        key: 'idp',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 90,
        title: 'TFL ',
        dataIndex: 'tfl',
        key: 'tfl',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },

      {
        width: 90,
        title: 'FF',
        dataIndex: 'ff',
        key: 'ff',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },

      {
        width: 90,
        title: 'INTS',
        dataIndex: 'ints',
        key: 'ints',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },

      {
        width: 90,
        title: 'PD',
        dataIndex: 'pd',
        key: 'pd',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
    ]

    const columns6 = [
  
      {
        width: 90,
        title: 'TPF',
        dataIndex: 'tpf',
        key: 'tpf',
        render: (t) => {
          return <p>{t || '-'}</p>
        },
      },
      {
        width: 90,
        title: 'TAPF',
        dataIndex: 'tapf',
        key: 'tapf',
        render: (t) => {
          return <p>{t?.toFixed(2) || '-'}</p>
        },
      },

      {
        width: 90,
        title: 'FG MADE',
        dataIndex: 'fgmade',
        key: 'fgmade',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 90,
        title: 'FG MISSED',
        dataIndex: 'fgmissed',
        key: 'fgmissed',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 90,
        title: 'PUNTS',
        dataIndex: 'punts',
        key: 'punts',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
      {
        width: 90,
        title: 'PUNTS INSIDE 20',
        dataIndex: 'puntsinside',
        key: 'puntsinside',
        render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
      },
    ]



    if (position === 'ALL') {
      return [...columns, ...columns2]
    } 
    
    if (position === 'QB' || position === "RB" || position === "WR" || position === "TE") {
      return [...columns, ...columns3]
    } 

    if (position === 'OL') {
      return [...columns, ...columns4]
    } 

      if (position === 'DE' || position === "DT" || position === "LB" || position === "CB" || position === "S") {
      return [...columns, ...columns5]
    } 

    if (position === 'K/P') {
      return [...columns, ...columns6]
    } 
    else {
      return columns
    }

  }

  

  return (
    <Table
      loading={tableLoading}
      dataSource={allPlayers?.players}
      columns={getColumns(position)}
      scroll={tableScroll}
      bordered={false}
      rowKey='_id'
      rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
      pagination={{
        pageSize: limit,
        current: page,
        total: allPlayers?.total,
        showSizeChanger: false,
        size: 'default',
        onChange: (page) => {
          dispatch(setPage(page))
        },
      }}
    />
  )
}

export default DraftPool
