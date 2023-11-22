import React from 'react'

import { Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const LeagueStandingCard = ({ data, index, teams }) => {
  const USER = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  // Table Column
  const columns = [
    {
      title: 'W-L-T',
      dataIndex: 'wlt',
      key: 'wlt',
    },
    {
      title: 'PCT',
      dataIndex: 'pct',
      key: 'pct',
    },
    {
      title: 'GB',
      dataIndex: 'gb',
      key: 'gb',
    },
    {
      title: 'STRK',
      dataIndex: 'strk',
      key: 'strk',
    },
    {
      title: 'PF',
      dataIndex: 'pf',
      key: 'pf',
    },
    {
      title: 'AVG PF',
      dataIndex: 'avgpf',
      key: 'avgpf',
    },
    {
      title: 'PA',
      dataIndex: 'pa',
      key: 'pa',
    },
    {
      title: 'AVG PA',
      dataIndex: 'avgpa',
      key: 'avgpa',
    },
    {
      title: 'DIV W-L-T',
      dataIndex: 'divwlt',
      key: 'divwlt',
    },
    {
      title: 'CONF W-L-T',
      dataIndex: 'confwlt',
      key: 'confwlt',
    },
  ]

  const handleNavigate = (id) => {
    if (USER?.team?._id === id) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${id}`)
    }
  }
  const handleStartersNavigate = (id, teamName) => {
    if (USER?.team?._id === id) {
      navigate(`/depth-chart`)
    } else {
      navigate(`/team-starters/${id}`, {
        state: {
          teamName,
        },
      })
    }
  }

  return (
    <div className='league_standing_card' style={{ marginTop: index === 0 && '0px' }}>
      <h3 className='text'>
        {data?.conference} - {data?._id}
      </h3>
      {data?.standing?.map((v, i) => {
        const team = teams.find((x) => v?.teamId === x?._id)
        return (
          <div key={team?.name} className='table_card'>
            <div className='table_header'>
              <h3 onClick={() => handleNavigate(v?.teamId)}>{team?.name}</h3>
              <div>
                <h4 onClick={() => handleStartersNavigate(v?.teamId, team?.name)}>View Starters</h4>
              </div>
            </div>
            <div className='table_body'>
              <div
                className='table_image'
                style={{ cursor: 'pointer' }}
                onClick={() => handleNavigate(v?.teamId)}
              >
                <img src={team?.logo} alt={v?.team?.name} />
              </div>
              <div className='main_ls_table'>
                <Table
                  dataSource={[
                    {
                      key: v?.teamScore?._id,
                      wlt: `${v?.teamScore?.win}-${v?.teamScore?.lose}-${v?.teamScore?.tie}`,
                      pct: v?.teamScore?.pct,
                      gb: v?.teamScore?.gb,
                      strk: v?.teamScore?.strk ? v?.teamScore?.strk : '-',
                      pf: v?.teamScore?.pf?.toFixed(2),
                      avgpf: v?.teamScore?.avgPf?.toFixed(2),
                      pa: v?.teamScore?.pa?.toFixed(2),
                      avgpa: v?.teamScore?.avgPa?.toFixed(2),
                      divwlt: `${v?.teamScore?.divWin}-${v?.teamScore?.divLose}-${v?.teamScore?.divTie}`,
                      confwlt: `${v?.teamScore?.confWin}-${v?.teamScore?.confLose}-${v?.teamScore?.confTie}`,
                    },
                  ]}
                  columns={columns}
                  bordered={false}
                  pagination={false}
                  size='small'
                  scroll={{ x: 800 }}
                  rowKey={'_id'}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LeagueStandingCard
