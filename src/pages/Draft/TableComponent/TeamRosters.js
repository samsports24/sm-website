import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { setSelectedPlayer } from '../../../redux/actions/draftAction'
import { getDraftTeamRoster } from '../../../redux/actions/rosterAction'

const TeamRosters = ({ tableScroll }) => {
  const { activeTab } = useSelector((state) => state?.draft)
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
          <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p>
        </div>
      ),
    },
    {
      width: 150,
      title: 'SAM ADP',
      dataIndex: 'adp',
      key: 'adp',
      render: (t) => <p>{t || '-'}</p>,
    },

    {
      width: 150,
      title: '2024 Projected',
      dataIndex: 'projected',
      key: 'projected',
      render: (t) => {
        return <p>{t || '-'}</p>
      },
    },
    {
      width: 150,
      title: '2023 Score',
      dataIndex: 'pf',
      key: 'pf',
      render: (t) => {
        return <p>{t?.toFixed(2) || '-'}</p>
      },
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
