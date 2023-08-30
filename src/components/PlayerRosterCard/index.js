import React from 'react'

import { Checkbox, Table } from 'antd'

import { useNavigate } from 'react-router-dom'

const PlayerRosterCard = ({ checkbox = false, data, index, style, nonActive, handleNonActive }) => {
  const { _id, Name, pts, Age, team, ByeWeek, PlayerRank, PlayerCap, stats: tableData } = data

  const navigate = useNavigate()

  const columns = [
    {
      title: '1',
      dataIndex: 'score1',
      key: 'score1',
    },
    {
      title: '2',
      dataIndex: 'score2',
      key: 'score2',
    },
    {
      title: '3',
      dataIndex: 'score3',
      key: 'score3',
    },
    {
      title: '4',
      dataIndex: 'score4',
      key: 'score4',
    },
    {
      title: '5',
      dataIndex: 'score5',
      key: 'score5',
    },
    {
      title: '6',
      dataIndex: 'score6',
      key: 'score6',
    },
    {
      title: '7',
      dataIndex: 'score7',
      key: 'score7',
    },
    {
      title: '8',
      dataIndex: 'score8',
      key: 'score8',
    },
    {
      title: '9',
      dataIndex: 'score9',
      key: 'score9',
    },
    {
      title: '10',
      dataIndex: 'score10',
      key: 'score10',
    },
    {
      title: '11',
      dataIndex: 'score11',
      key: 'score11',
    },
    {
      title: '12',
      dataIndex: 'score12',
      key: 'score12',
    },
    {
      title: '13',
      dataIndex: 'score13',
      key: 'score13',
    },
    {
      title: '14',
      dataIndex: 'score14',
      key: 'score14',
    },
    {
      title: '15',
      dataIndex: 'score15',
      key: 'score15',
    },
    {
      title: '16',
      dataIndex: 'score16',
      key: 'score16',
    },
    {
      title: '17',
      dataIndex: 'score17',
      key: 'score17',
    },
    {
      title: '18',
      dataIndex: 'score18',
      key: 'score18',
    },
  ]

  return (
    <div className='stats_card_container' style={style || null}>
      <header>
        <h3
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(`/player-interface/${_id}`)
          }}
        >
          {index + 1}. &nbsp;&nbsp; {Name}
        </h3>
        {checkbox && (
          <Checkbox
            onChange={(event) => handleNonActive(event.target.checked, _id)}
            checked={nonActive?.includes(_id)}
          >
            Non-Active
          </Checkbox>
        )}
      </header>

      <section className='center'>
        <div>
          <p className='text1'>PTS Per Game</p>
          <p className='text2'>{pts || '-'}</p>
        </div>
        <div>
          <p className='text1'>Age</p>
          <p className='text2'>{Age || '-'}</p>
        </div>
        <div>
          <p className='text1'>Team</p>
          <p className='text2'>{team?.name || '-'}</p>
        </div>
        <div>
          <p className='text1'>BYE</p>
          <p className='text2'>{ByeWeek || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Cap #</p>
          <p className='text2'>{PlayerCap ? `$${PlayerCap}` : '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Rank</p>
          <p className='text2'>{PlayerRank ? `$${PlayerRank}` : '-'}</p>
        </div>
      </section>

      <section className='stats_table'>
        <Table
          dataSource={[tableData]}
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
