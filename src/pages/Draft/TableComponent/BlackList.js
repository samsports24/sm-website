import React, { useEffect, useState } from 'react'
import { Spin, Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { FaCircleMinus } from 'react-icons/fa6'

import {
  deleteBlacklistQueue,
  deleteDraftQueue,
  getBlackListQueue,
  getDraftQueue,
  setSelectedPlayer,
} from '../../../redux/actions/draftAction'

const BlackList = ({ tableScroll }) => {
  const { blacklistQueues, activeTab } = useSelector((state) => state.draft)
  const [loading, setLoading] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeTab == 4) getData()
  }, [activeTab])

  const getData = async () => {
    setLoading('data')
    await getBlackListQueue()
    setLoading('')
  }



  const handleDeleteBlackListQueue = async (id) => {
    setLoading(id)
    await deleteBlacklistQueue(id)
    setLoading('')
  }

  const columns = [
    {
      width: 50,
      title: ' ',
      dataIndex: 'plus-icon',
      key: 'plus-icon',
      render: (_, obj) => (
   
       
        <>
        
          {loading ===obj?.player?._id ? (
            
            <Spin />
          ) : (
            <FaCircleMinus
              size={18}
              style={{ marginBottom: '-3px', cursor: 'pointer' }}
              onClick={() => handleDeleteBlackListQueue(obj?._id)}
            />
          )}
        </>
      ),
    },
    // {
    //   width: 70,
    //   title: 'Rank',
    //   dataIndex: 'Rank',
    //   key: 'Rank',
    //   render: (t) => <p>{t || '-'}</p>,
    // },
    {
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
      render: (_, obj) => {
    
        const inj = obj?.player?.InjuryStatus
        return (
          <div className='table_player_name_box nrc_container'>
            <p
              onClick={() => dispatch(setSelectedPlayer(obj?.player))}
              style={{ cursor: 'pointer' }}
            >
              {obj?.player?.Name}{' '}
            </p>{' '}
            {/* <p>
              {obj?.player?.Position} - {obj?.player?.Team}{' '}
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
      width: 150,
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
      width: 150,
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
              {/* {obj?.player?.currentYearSalaryCap || '-'} */}
              {/* {`$${obj?.player?.PlayerCap || '-'}`} */}
              {`$${(obj?.player?.currentYearSalaryCap || '-').toLocaleString()}`}
            </p>
          </div>
        )
      },
    },
    
  ]

  return (
    <Table
      loading={loading === 'data'}
      dataSource={blacklistQueues}
      columns={columns}
      scroll={tableScroll}
      bordered={false}
      rowKey='_id'
      rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
      pagination={false}
    />
  )
}

export default BlackList
