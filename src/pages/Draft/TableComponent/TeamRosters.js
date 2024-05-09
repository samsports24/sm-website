import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { setSelectedPlayer } from '../../../redux/actions/draftAction'
import { getDraftTeamRoster } from '../../../redux/actions/rosterAction'

const TeamRosters = ({ tableScroll }) => {
  const { activeTab,draftRounds } = useSelector((state) => state?.draft)
  const SETTING = useSelector((state) => state?.user?.setting)
  const { data } = useSelector((state) => state?.roster)
  const [loading, setLoading] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeTab == 3) getData()
  }, [activeTab])

  const getData = async () => {
    setLoading('data')
    console.log('SETTING?.date',SETTING?.week);
    await getDraftTeamRoster(SETTING?.week)
    setLoading('')
  }

  const columns = [
    {
      width: 70,
      title: 'Rank',
      dataIndex: 'Rank',
      key: 'Rank',
      render: (t) => <p>{t || '-'}</p>,
    },

    {
      width: 150,
      title: 'LINE-UP',
      dataIndex: 'lineup',
      key: 'lineup',
      render: (_, obj) => (
      
        <div className='table_player_name_box'>
          <p
            onClick={() => dispatch(setSelectedPlayer(obj?.player_id))}
            style={{ cursor: 'pointer' }}
          >
            {obj?.Position}{' '}
          </p>{' '}
          {/* <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p> */}
        </div>
      ),
    },
    {
      width: 150,
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
      render: (_, obj) => (
      
        <div className='table_player_name_box'>
          <p
            onClick={() => dispatch(setSelectedPlayer(obj?.player_id))}
            style={{ cursor: 'pointer' }}
          >
            {obj?.Name}{' '}
          </p>{' '}
          {/* <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p> */}
        </div>
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
              {obj?.Position || '-'}
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
              {obj?.Team || '-'}
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
              {obj?.PlayerCap || '-'}
            </p>
          </div>
        )
      },
    },

    {
      width: 180,
      title: 'Round',
      dataIndex: 'caphit',
      key: 'caphit',

      render: (_, obj) => {
      {draftRounds?.map((v, i) => {
        console.log('draftRounds',draftRounds);
        return (
          <div key={i}>  
            <div className='rb_card_right'>
              <p>
                 {v?.round || '-'}
              </p>
             
              
            </div>
          
          </div>
        )
      })}
    }
      // render: (_, obj) => {
      //   return (
      //     <div className='table_player_name_box nrc_container'>
      //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
      //         {obj?.PlayerCap || '-'}
      //       </p>
      //     </div>
      //   )
      // },
    },


    {
      width: 180,
      title: 'PICK',
      dataIndex: 'caphit',
      key: 'caphit',
      // render: (_, obj) => {
      //   return (
      //     <div className='table_player_name_box nrc_container'>
      //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
      //         {obj?.PlayerCap || '-'}
      //       </p>
      //     </div>
      //   )
      // },
    },
  ]

  return (
    <Table
      loading={loading === 'data'}
      dataSource={data}
      columns={columns}
      scroll={tableScroll}
      bordered={false}
      rowKey='_id'
      rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
      pagination={false}
    />
  )
}

export default TeamRosters
