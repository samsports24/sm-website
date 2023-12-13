import React, { useEffect, useState } from 'react'
import { cancelTrade, getPendingTrade } from '../../redux/actions/teamTradeAction'
import { Button, Table, notification } from 'antd'
import { useNavigate } from 'react-router-dom'

const PendingTrade = ({ tab }) => {
  const [loading, setLoading] = useState('main')
  const [pendingTrade, setPendingTrade] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [tab])

  const getData = async () => {
    setLoading('main')
    const res = await getPendingTrade({})
    if (res) {
      setPendingTrade(res)
    }
    setLoading('')
  }

  const handleCancelTrade = async (id) => {
    setLoading(id)
    const res = await cancelTrade({ tradeId: id })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      getData()
    }
    setLoading('')
  }

  const columns = [
    {
      title: 'Team One',
      dataIndex: 'teamOne',
      key: 'teamOne',
      render: (_, obj) => <p>{obj?.buyer?.team?.name}</p>,
    },
    {
      title: 'Team One Player',
      dataIndex: 'teamOnePlayer',
      key: 'teamOnePlayer',
      render: (_, obj) =>
        obj?.buyer?.players?.length > 0
          ? obj?.buyer?.players?.map((v, i) => <p key={i}>{v?.Name}</p>)
          : '-',
    },
    {
      title: 'Team One Draft',
      dataIndex: 'teamOneDraft',
      key: 'teamOneDraft',
      render: (_, obj) =>
        obj?.buyer?.drafts?.length > 0
          ? obj?.buyer?.drafts?.map((v, i) => (
              <p key={i}>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
            ))
          : '-',
    },
    {
      title: 'Team Two',
      dataIndex: 'teamTwo',
      key: 'teamTwo',
      render: (_, obj) => <p>{obj?.seller?.team?.name}</p>,
    },
    {
      title: 'Team Two Player',
      dataIndex: 'teamTwoPlayer',
      key: 'teamTwoPlayer',
      render: (_, obj) =>
        obj?.seller?.players?.length > 0
          ? obj?.seller?.players?.map((v, i) => <p key={i}>{v?.Name}</p>)
          : '-',
    },
    {
      title: 'Team Two Draft',
      dataIndex: 'teamTwoDraft',
      key: 'teamTwoDraft',
      render: (_, obj) =>
        obj?.seller?.drafts?.length > 0
          ? obj?.seller?.drafts?.map((v, i) => (
              <p key={i}>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
            ))
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (t) => <p>{t}</p>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, obj) => (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          {/* <Button
            type='primary'
            onClick={() => {
              navigate('/counter-trade', {
                state: {
                  tradeId: obj?._id,
                },
              })
            }}
          >
            View
          </Button> */}
          <Button
            type='primary'
            onClick={() => handleCancelTrade(obj?._id)}
            loading={loading === obj?._id}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className='pending_trade_container'>
      <div className='new_table_container auction_table_container'>
        <Table
          loading={loading === 'main'}
          dataSource={pendingTrade}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 1500 }}
          className='my_auction_table'
          rowKey='_id'
        />
      </div>
    </div>
  )
}

export default PendingTrade
