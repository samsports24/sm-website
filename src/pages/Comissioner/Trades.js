import { Button, Dropdown } from 'antd'
import React, { useState } from 'react'

const Trades = () => {
  const data = [
    {
      _id: '1',
      description:
        'Voodoo has agreed to trade john smith and michael Owen Defiance hasgreed to trade 1 round pick 2024 and Lebron James',
    },
    {
      _id: '2',
      description:
        'Voodoo has agreed to trade john smith and michael Owen Defiance hasgreed to trade 1 round pick 2024 and Lebron James',
    },
    {
      _id: '3',
      description:
        'Voodoo has agreed to trade john smith and michael Owen Defiance hasgreed to trade 1 round pick 2024 and Lebron James',
    },
  ]
  return (
    <div className='league_trade_container'>
      <div className='ltc_wrapper'>
        <h2> COMMISSIONER, YOU HAVE 3 NEW TRADES TO APPROVE:</h2>
        <div className='ltc_card_container'>
          {data?.map((v, i) => {
            return <TradeCard key={i} data={v} />
          })}
        </div>
      </div>
    </div>
  )
}

const TradeCard = ({ data }) => {
  const empty = { type: '', id: '' }
  const [loading, setLoading] = useState(empty)

  const handleReject = (id, status) => {
    setLoading({ type: 'reject', id: id })
    console.log(id, status)
    setLoading(empty)
  }
  const handleApprove = (id) => {
    setLoading({ type: 'approve', id: id })
    console.log(id)
    setLoading(empty)
  }
  const items = [
    {
      key: '1',
      label: <p onClick={() => handleReject(data?._id, 'unfair')}>Unfair</p>,
    },
    {
      key: '2',
      label: <p onClick={() => handleReject(data?._id, 'financialCap')}>Financial Cap</p>,
    },
    {
      key: '3',
      label: <p onClick={() => handleReject(data?._id, 'paymentUnpaid')}>Payment Unpaid</p>,
    },
    {
      key: '4',
      label: <p onClick={() => handleReject(data?._id, 'illegalRoster')}>Illegal Roster</p>,
    },
  ]

  return (
    <div className='trade_card'>
      <p>{data?.description}</p>
      <div className='buttons_box'>
        <Button
          loading={loading.type === 'approve' && loading.id === data?._id}
          type='primary'
          onClick={() => handleApprove(data?._id)}
          className='approve_button'
        >
          Approve
        </Button>

        <Dropdown
          menu={{
            items,
          }}
          trigger={['click']}
        >
          <Button
            loading={loading.type === 'reject' && loading.id === data?._id}
            type='primary'
            onClick={(e) => e.preventDefault()}
            className='reject_button'
          >
            Reject
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}

export default Trades
