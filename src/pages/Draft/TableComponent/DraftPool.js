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
  getALLplayerStats,
  createBlackListQueue,
  deleteBlacklistQueue,
} from '../../../redux/actions/draftAction'

const DraftPool = ({ tableScroll }) => {
  const { allPlayers, position, search, page, limit, tableLoading, draftQueues, activeTab,blacklistQueues } =
    useSelector((state) => state.draft)
  const { userDetails } = useSelector((state) => state.user)
  const [loading, setLoading] = useState('')


  const [color, setColor] = useState('');
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
    await getAllPlayers(payload, position)
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
  const handleDeleteBlackListQueue = async (playerId,blacklistid) => {
    setLoading(playerId)
    await deleteBlacklistQueue(blacklistid)
    setLoading('')
  }


// add black list
const handleAddBlackList = async (id) => {
  setLoading(id)
  await createBlackListQueue({
    team: userDetails?.team?._id,
    player: id,
  })
  setLoading('')
}



  const getColumns = (position) => {
    console.log('🚀 ~ getColumns ~ position:', position)
    const columns = [
      {
        width: 50,
        title: ' ',
        dataIndex: 'plus-icon',
        key: 'plus-icon',
        render: (_, obj) => {
          const isQueue = draftQueues?.find((v) => v?.player?._id === obj?.player?._id)
          const isblacklist = blacklistQueues?.find((v) => v?.player?._id === obj?.player?._id)
          return (
            // <div>
            //   {loading === obj?.player?._id ? (
            //     <Spin />
            //   ) : isQueue ? (
            //     <BiSolidPlusCircle
            //       size={18}
            //       style={{ marginBottom: '-3px', cursor: 'pointer' }}
            //       color={'var(--primary)'}
            //       onClick={() => handleDeleteQueue(obj?._id, isQueue?._id)}
            //     />
            //   ) : (
            //     <BiSolidPlusCircle
            //       size={18}isQueue
            //       style={{ marginBottom: '-3px', cursor: 'pointer' }}
            //       onClick={() => handleAddQueue(obj?.player?._id)}
            //     />
            //   )}
            // </div>
<div>
  {loading === obj?.player?._id ? (
    <Spin />
  ) : isQueue || isblacklist ? (
    <BiSolidPlusCircle
      size={18}
      style={{ marginBottom: '-3px', cursor: 'pointer' }}
      color={color}
      onClick={() => {
        if (color === 'var(--primary)') {
          handleAddBlackList(obj?.player?._id);
          handleDeleteQueue(obj?._id, isQueue?._id);
          setColor('black'); 
        } else if (color === 'black') {
          handleDeleteBlackListQueue(obj?.player?._id,isblacklist?._id);
          setColor('none'); 
        }
        console.log('Additional functionality executed');
      }}
    />
  ) : (
    <BiSolidPlusCircle
      size={18}
      style={{ marginBottom: '-3px', cursor: 'pointer' }}
      onClick={() => {
        handleAddQueue(obj?.player?._id);
        setColor('var(--primary)'); // Update color to 'var(--primary)'
        // Additional functionality here
        console.log('Additional functionality executed');
      }}
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
          //  console.log('obj', obj)
          // console.log('FieldGoalsMade', obj?.stats?.stats?.FieldGoalsMade)
         
          const inj = obj?.player?.InjuryStatus
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.player?.Name}{' '}
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
                {obj?.player?.Position || '-'}
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
                {obj?.player?.Team || '-'}
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
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {/* {obj?.player?.PlayerCap || '-'} */}
                {/* {`$${obj?.player?.PlayerCap || '-'}`} */}
                {`$${(obj?.player?.PlayerCap || '-').toLocaleString()}`}

              </p>
            </div>
          )
        },
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
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.player?.pf || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 150,
        title: '23 AVG.POINTS',
        dataIndex: 'pf',
        key: 'pf',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.player?.avgPf.toFixed(2) || '-'}
              </p>
            </div>
          )
        },
      },

      {
        width: 150,
        title: '24 PROJ.TOTAL POINTS',
        dataIndex: 'pf',
        key: 'pf',
        // render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.stats?.stats?.FantasyPoints24.toFixed(2) || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 150,
        title: '24 PROJ.AVG POINTS',
        dataIndex: 'pf',
        key: 'pf',
        // render: (t) => <p>{t?.toFixed(2) || '-'}</p>,
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.stats?.stats?.AvgFantasyPoints24.toFixed(2) || '-'}
              </p>
            </div>
          )
        },
      },
    ]

    const columns3 = [
      {
      //  width: 90,
        title: 'Projected',
        dataIndex: 'proj',
        key: 'proj',
        children: [
          {
            width: 90,
            title: 'TAF',
            dataIndex: 'taf',
            key: 'taf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.player?.pf || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 90,
            title: 'AVG',
            dataIndex: 'avg',
            key: 'avg',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.AvgFantasyPoints24.toFixed(2) || '-'}
                  </p>
                </div>
              )
            },
          },
         
        ],
      },
     

      {
       // width: 150,
        title: 'PASSING',
        dataIndex: 'pass',
        key: 'pass',
        children: [
          {
            width: 70,
            title: 'ATD',
            dataIndex: 'taf',
            key: 'taf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.PassingAttempts || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'YRD',
            dataIndex: 'yrd',
            key: 'yrd',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.PassingYards.toFixed(2) || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'TD',
            dataIndex: 'taf',
            key: 'taf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.PassingTouchdowns || '-'}
                  </p>
                </div>
              )
            },
          },
         
        ],
      },
      {
        // width: 150,
         title: 'RECIVING',
         dataIndex: 'rec',
         key: 'rec',
         children: [
          {
            width: 70,
            title: 'TAR',
            dataIndex: 'att',
            key: 'att',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.ReceivingTargets || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'YARD',
            dataIndex: 'yard',
            key: 'yard',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.ReceivingYards || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.ReceivingTouchdowns || '-'}
                  </p>
                </div>
              )
            },
          },
         
        ],
       },
      {
        width: 150,
        title: 'RUSHING',
        dataIndex: 'rush',
        key: 'rush',
        children: [
          {
            width: 70,
            title: 'ATT',
            dataIndex: 'att',
            key: 'att',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.RushingAttempts || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'YARD',
            dataIndex: 'yard',
            key: 'yard',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.RushingYards || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 70,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.RushingTouchdowns || '-'}
                  </p>
                </div>
              )
            },
          },
         
        ],
      },
    ]

    const columns4 = [
      {
        width: 150,
        title: '23 TEAMSCOREAVG',
        dataIndex: 'tsg',
        key: 'tsg',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.stats?.OL?.TotalTeamScore || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 150,
        title: '23 TOTAL POINTS',
        dataIndex: 'tp',
        key: 'tp',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.player?.pf || '-'}
              </p>
            </div>
          )
        },
      },

      {
        width: 150,
        title: '23 SNAP %',
        dataIndex: 'snap',
        key: 'snap',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.stats?.OL?.totalSnap || '-'}
              </p>
            </div>
          )
        },
      },
      {
        width: 150,
        title: '23 AVG. POINTS',
        dataIndex: 'avgpoints',
        key: 'avgpoints',
        render: (_, obj) => {
          return (
            <div className='table_player_name_box nrc_container'>
              <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                {obj?.player?.avgPf || '-'}
              </p>
            </div>
          )
        },
      },
    ]

    const columns5 = [


      {
        //  width: 90,
          title: 'PAST YEARS STATS',
          dataIndex: 'past',
          key: 'past',
          children: [
            
            {
              width: 90,
              title: 'TPF',
              dataIndex: 'tpf',
              key: 'tpf',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.player?.pf || '-'}
                    </p>
                  </div>
                )
              },
            },
            {
              width: 90,
              title: 'TAPF',
              dataIndex: 'tapf',
              key: 'tapf',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.player?.avgPf || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'IDP TDS',
              dataIndex: 'idp',
              key: 'idp',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.IDP || '-'}
                    </p>
                  </div>
                )
              },
            },
            {
              width: 90,
              title: 'SCKS ',
              dataIndex: 'scks',
              key: 'scks',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.SCKS || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'QBH',
              dataIndex: 'qbh',
              key: 'qbh',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.QBH || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'TKLS',
              dataIndex: 'tkls',
              key: 'idp',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.TKLS || '-'}
                    </p>
                  </div>
                )
              },
            },
            {
              width: 90,
              title: 'TFL ',
              dataIndex: 'tfl',
              key: 'tfl',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.TFL || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'FF',
              dataIndex: 'ff',
              key: 'ff',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.FF || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'INTS',
              dataIndex: 'ints',
              key: 'ints',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.INTS || '-'}
                    </p>
                  </div>
                )
              },
            },
      
            {
              width: 90,
              title: 'PD',
              dataIndex: 'pd',
              key: 'pd',
              render: (_, obj) => {
                return (
                  <div className='table_player_name_box nrc_container'>
                    <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                      {obj?.stats?.stats?.PD || '-'}
                    </p>
                  </div>
                )
              },
            },
          ],
        },

     
    ]

    const columns6 = [


      {
        //  width: 90,
          title: 'PAST YEARS STATS',
          dataIndex: 'past',
          key: 'past',
         children:[
          {
            width: 90,
            title: 'TPF',
            dataIndex: 'tpf',
            key: 'tpf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.TPF || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 90,
            title: 'TAPF',
            dataIndex: 'tapf',
            key: 'tapf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.TAPF || '-'}
                  </p>
                </div>
              )
            },
          },
    
          {
            width: 90,
            title: 'FG MADE',
            dataIndex: 'fgmade',
            key: 'fgmade',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.FieldGoalsMade || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 90,
            title: 'FG MISSED',
            dataIndex: 'fgmissed',
            key: 'fgmissed',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.FGMissed.toFixed(2) || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 90,
            title: 'PUNTS',
            dataIndex: 'punts',
            key: 'punts',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.Punts || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 90,
            title: 'PUNTS INSIDE 20',
            dataIndex: 'puntsinside',
            key: 'puntsinside',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.stats?.stats?.PuntInside20 || '-'}
                  </p>
                </div>
              )
            },
          },

         ]
        },

  
    ]

    if (position === 'ALL') {
      return [...columns, ...columns2]
    }

    if (position === 'QB' || position === 'RB' || position === 'WR' || position === 'TE') {
      return [...columns, ...columns3]
    }

    if (position === 'OL') {
      return [...columns, ...columns4]
    }

    if (
      position === 'DE' ||
      position === 'DT' ||
      position === 'LB' ||
      position === 'CB' ||
      position === 'S'
    ) {
      return [...columns, ...columns5]
    }

    if (position === 'K/P') {
      return [...columns, ...columns6]
    } else {
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
