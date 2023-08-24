import React from 'react'

import { Table } from 'antd'
import { useNavigate } from 'react-router-dom'

const PlayerRosterCard = ({ data, index, style }) => {
  const { name, pts, age, team, bye, playerRank, playerCap, data: tableData } = data

  const navigate = useNavigate()

  const columns = [
    {
      title: '1',
      dataIndex: '1',
      key: '1',
    },
    {
      title: '2',
      dataIndex: '2',
      key: '2',
    },
    {
      title: '3',
      dataIndex: '3',
      key: '3',
    },
    {
      title: '4',
      dataIndex: '4',
      key: '4',
    },
    {
      title: '5',
      dataIndex: '5',
      key: '5',
    },
    {
      title: '6',
      dataIndex: '6',
      key: '6',
    },
    {
      title: '7',
      dataIndex: '7',
      key: '7',
    },
    {
      title: '8',
      dataIndex: '8',
      key: '8',
    },
    {
      title: '9',
      dataIndex: '9',
      key: '9',
    },
    {
      title: '10',
      dataIndex: '10',
      key: '10',
    },
    {
      title: '11',
      dataIndex: '11',
      key: '11',
    },
    {
      title: '12',
      dataIndex: '12',
      key: '12',
    },
    {
      title: '13',
      dataIndex: '13',
      key: '13',
    },
    {
      title: '14',
      dataIndex: '14',
      key: '14',
    },
    {
      title: '15',
      dataIndex: '15',
      key: '15',
    },
    {
      title: '16',
      dataIndex: '16',
      key: '16',
    },
    {
      title: '17',
      dataIndex: '17',
      key: '17',
    },
    {
      title: '18',
      dataIndex: '18',
      key: '18',
    },
  ]

  return (
    <div className='stats_card_container' style={style || null}>
      <header>
        <h3
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate('/player-interface')
          }}
        >
          {index + 1}. &nbsp;&nbsp; {name}
        </h3>
      </header>

      <section className='center'>
        <div>
          <p className='text1'>PTS Per Game</p>
          <p className='text2'>{pts || '-'}</p>
        </div>
        <div>
          <p className='text1'>Age</p>
          <p className='text2'>{age || '-'}</p>
        </div>
        <div>
          <p className='text1'>Team</p>
          <p className='text2'>{team || '-'}</p>
        </div>
        <div>
          <p className='text1'>BYE</p>
          <p className='text2'>{bye || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Cap #</p>
          <p className='text2'>{playerCap ? `$${playerCap}` : '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Rank</p>
          <p className='text2'>{playerRank ? `$${playerRank}` : '-'}</p>
        </div>
      </section>

      <section className='stats_table'>
        <Table
          dataSource={tableData}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 800 }}
          style={{
            borderBottomLeftRadius: '10px',
          }}
        />
      </section>
    </div>
  )
}

export default PlayerRosterCard
