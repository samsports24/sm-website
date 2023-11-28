import React, { useEffect, useState } from 'react'

import { Table } from 'antd'

// Component
import Header from '../components/Header'
import MoveToRoster from '../components/modal/PlayerInterfaceModals/MoveToRoster'

import { getAllIr } from '../redux/actions/rosterAction'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { getPf, getRankAndPosition } from '../config/helperFunctions'

const InjuredReserve = () => {
  const [injuredReserve, setInjuredReserve] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const res = await getAllIr()
    if (res) {
      setInjuredReserve(res)
    }
    setLoading(false)
  }
  const columns = [
    {
      title: ' ',
      dataIndex: 'HostedHeadshotNoBackgroundUrl',
      key: 'HostedHeadshotNoBackgroundUrl',
      render: (_, obj) => {
        return (
          <div className='squad_image_box'>
            {obj?.player?.HostedHeadshotNoBackgroundUrl ? (
              <img src={obj?.player?.HostedHeadshotNoBackgroundUrl} alt={'Player'} />
            ) : (
              <GiAmericanFootballPlayer size={45} color={'#c4c4c4'} />
            )}
          </div>
        )
      },
    },
    {
      title: 'POSITION',
      dataIndex: 'Position',
      key: 'Position',
      render: (_, obj) => <p>{obj?.player?.Position || '-'}</p>,
    },
    {
      title: 'PLAYER NAME',
      dataIndex: 'Name',
      key: 'Name',
      render: (_, obj) => <p>{obj?.player?.Name || '-'}</p>,
    },
    {
      title: 'AGE',
      dataIndex: 'Age',
      key: 'Age',
      render: (_, obj) => <p>{obj?.player?.Age || '-'}</p>,
    },
    {
      title: 'TEAM',
      dataIndex: 'Team',
      key: 'Team',
      render: (_, obj) => <p>{obj?.player?.Team || '-'}</p>,
    },
    {
      title: 'OPP',
      dataIndex: 'UpcomingGameOpponent',
      key: 'UpcomingGameOpponent',
      render: (_, obj) => <p>{obj?.player?.UpcomingGameOpponent || '-'}</p>,
    },
    {
      title: 'BYE',
      dataIndex: 'ByeWeek',
      key: 'ByeWeek',
      render: (_, obj) => <p>{obj?.player?.ByeWeek || '-'}</p>,
    },
    {
      title: 'PLAYER CAP #',
      dataIndex: 'PlayerCap',
      key: 'PlayerCap',
      render: (_, obj) => {
        return (
          <p>
            {injuredReserve?.playerCaps?.[obj?.player?.PlayerID]
              ? `$${injuredReserve?.playerCaps?.[obj?.player?.PlayerID]?.toLocaleString()}`
              : '-'}
          </p>
        )
      },
    },
    {
      title: 'PF',
      dataIndex: 'pointsPerGame',
      key: 'pointsPerGame',
      render: (_, obj) => <p>{getPf(injuredReserve?.averagePf?.[obj?.player?.PlayerID])?.tpf}</p>,
    },
    {
      title: 'PLAYER RANK',
      dataIndex: 'playerRank',
      key: 'playerRank',
      render: (_, obj) => (
        <p>
          {
            getRankAndPosition(injuredReserve?.averagePf?.[obj?.player?.PlayerID])
              ?.playerOverallRank
          }
        </p>
      ),
    },
    {
      title: ' ',
      dataIndex: 'auction',
      key: 'auction',
      render: (_, obj) => {
        return (
          <MoveToRoster
            activeDate={obj?.activeDate}
            injuredDate={obj?.injuredDate}
            playerId={obj?.PlayerID}
            injuredId={obj?._id}
            getData={getData}
          />
        )
      },
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <hr className='divider' />

      <div className='header' style={{ marginBottom: '20px' }}>
        <h2>INJURED RESERVE</h2>
      </div>

      <div className='new_table_container'>
        <Table
          loading={loading}
          dataSource={injuredReserve?.data}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 1100 }}
          rowKey='_id'
        />
      </div>
    </div>
  )
}

export default InjuredReserve
