import React from 'react'

import { Image, Table } from 'antd'

const LeagueStandingCard = ({ data, index }) => {
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
    <div className='league_standing_card' style={{ marginTop: index === 0 && '0px' }}>
      <h3 className='text'>{data?.mainTitle}</h3>
      {data?.data?.map((v, i) => {
        return (
          <div key={i} className='table_card'>
            <div className='table_header'>
              <h3>{v?.title}</h3>
            </div>
            <div className='table_body'>
              <div className='table_image'>
                <Image preview={false} src={v?.imageUrl} alt={v?.title} />
              </div>
              <div className='main_ls_table'>
                <Table
                  dataSource={v?.tableData}
                  columns={columns}
                  bordered={false}
                  pagination={false}
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
