import React, { useEffect, useState } from 'react'
import { Spin, Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { TiArrowSortedUp,TiArrowSortedDown } from "react-icons/ti";
import { FaCircleMinus } from 'react-icons/fa6'
import { BsFillArrowUpCircleFill,BsFillArrowDownCircleFill } from "react-icons/bs";


import {
  changeDraftQueueOrder,
  deleteDraftQueue,
  getDraftQueue,
  setSelectedPlayer,
} from '../../../redux/actions/draftAction'
import { positions } from '../../../config/constants';

const DraftQueue = ({ tableScroll }) => {
  const { draftQueues, activeTab } = useSelector((state) => state.draft)
  const [loading, setLoading] = useState('')
  const [orderloading, setOrderLoading] = useState('')


  function mapPosition(position) {
  return positions[position] || position;
}

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeTab == 2) getData()
  }, [activeTab])

  const getData = async () => {
    setLoading('data')
    await getDraftQueue()
    setLoading('')
  }

  const handleDeleteQueue = async (id) => {
    setLoading(id)
    await deleteDraftQueue(id)
    setLoading('')
  }




  const handleQueueorder = async (id,direction) => {

    // console.log('id',id);
    // console.log('direction',direction);
    setOrderLoading(id)
    //  setLoading(id)
     await changeDraftQueueOrder(id,direction)
     setOrderLoading('')
  }
  const columns = [
    {
      width: 50,
      title: ' ',
      dataIndex: 'plus-icon',
      key: 'plus-icon',
      render: (_, obj) => (
       
        <>
        
          {loading === obj?._id ? (
            <Spin />
          ) : (
            <FaCircleMinus
              size={18}
              style={{ marginBottom: '-3px', cursor: 'pointer' }}
              onClick={() => handleDeleteQueue(obj?._id)}
            />
          )}
        </>
      ),
    },


    // {
    //   width: 50,
    //   title: ' ',
    //   dataIndex: 'plus-icon',
    //   key: 'plus-icon',
    //   render: (_, obj) => (
    //     <>
    //       <TiArrowSortedUp
    //         size={18}
    //         style={{ color: '#00A7E5', cursor: 'pointer' }}
    //         onClick={() => handleQueueorder(obj?._id,'up')}
    //       />
    //       <TiArrowSortedDown 
    //         size={18}
    //         style={{ color: '#00A7E5', cursor: 'pointer' }}
    //         onClick={() => handleQueueorder(obj?._id,'down')}
    //       />
    //     </>
    //   ),
    // },


  


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
              // onClick={() => dispatch(setSelectedPlayer(obj?.player))}
              onClick={() => dispatch(setSelectedPlayer(obj))}
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
      title: ' ',
      dataIndex: 'order-icon',
      key: 'order-icon',
      render: (_, obj) => (
        <>
          {orderloading === obj?._id ? (
            <Spin />
          ) : (
            <>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
               {obj?.Queue_order > 1 && (
            <BsFillArrowUpCircleFill
              size={18}
              style={{ color: '#00A7E5', cursor: 'pointer' }}
              onClick={() => handleQueueorder(obj?._id, 'up')}
            />
          )}
              <BsFillArrowDownCircleFill 
                size={18}
                style={{ color: '#00A7E5', cursor: 'pointer' }}
            onClick={() => handleQueueorder(obj?._id,'down')}
              />
              </div>
            </>
          )}
        </>
      ),
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
              {mapPosition(obj?.player?.Position) || '-'}
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
              {/* {obj?.player?.PlayerCap || '-'} */}
              {/* {`$${(obj?.player?.currentYearSalaryCap || '-').toLocaleString()}`} */}
              {`$${obj?.player?.currentYearSalaryCap || '-'}`}
            </p>
          </div>
        )
      },
    },
    
  ]

  return (
    <Table
      loading={loading === 'data'}
      dataSource={draftQueues}
      columns={columns}
      scroll={tableScroll}
      bordered={false}
      rowKey='_id'
      rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
      pagination={false}
    />
  )
}

export default DraftQueue
