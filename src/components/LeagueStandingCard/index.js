import React from 'react'

import { Image, Table } from 'antd'
import { useNavigate } from 'react-router-dom'

const LeagueStandingCard = ({ data, index }) => {
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

  return (
    <div
      onClick={() => navigate('/standing-detail')}
      className='league_standing_card'
      style={{ marginTop: index === 0 && '0px' }}
    >
      <h3 className='text'>
        {data?.conference} - {data?._id}
      </h3>
      {data?.standing?.map((v, i) => {
        return (
          <div key={i} className='table_card'>
            <div className='table_header'>
              <h3>{v?.team?.name}</h3>
            </div>
            <div className='table_body'>
              <div className='table_image'>
                <Image preview={false} src={v?.team?.logo} alt={v?.team?.name} />
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
                      pf: v?.teamScore?.pf,
                      avgpf: v?.teamScore?.avgPf,
                      pa: v?.teamScore?.pa,
                      avgpa: v?.teamScore?.avgPa,
                      divwlt: `${v?.teamScore?.divWin}-${v?.teamScore?.divLose}-${v?.teamScore?.divTie}`,
                      confwlt: `${v?.teamScore?.confWin}-${v?.teamScore?.confLose}-${v?.teamScore?.confTie}`,
                    },
                  ]}
                  columns={columns}
                  bordered={false}
                  pagination={false}
                  size='small'
                  scroll={{ x: 800 }}
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
