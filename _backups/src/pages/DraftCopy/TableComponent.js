import React from 'react'
import { Button, Input, Table } from 'antd'
import { CiSearch } from 'react-icons/ci'
const { Column, ColumnGroup } = Table
import { BiSolidPlusCircle } from 'react-icons/bi'

const TableComponent = ({ tableScroll, professionalDraft, publicDraft }) => {
  const proButtons = [
    {
      name: 'ALL',
    },
    {
      name: 'QB',
    },
    {
      name: 'RB',
    },
    {
      name: 'WR',
    },
    {
      name: 'TE',
    },
    {
      name: 'W/R',
    },
    {
      name: 'K',
    },
    {
      name: 'DEF',
    },
  ]
  const publicButtons = [
    {
      name: 'ALL',
    },
    {
      name: 'QB',
    },
    {
      name: 'RB',
    },
    {
      name: 'WR',
    },
    {
      name: 'TE',
    },
    {
      name: 'OL',
    },
    {
      name: 'K',
    },
    {
      name: 'P',
    },
    {
      name: 'DT',
    },
    {
      name: 'DE',
    },
    {
      name: 'LB',
    },
    {
      name: 'CB',
    },
    {
      name: 'S',
    },
  ]
  return (
    <div className='table_com_box'>
      {professionalDraft && (
        <div className='pro_table_header'>
          <div className='pro_button_box'>
            {proButtons?.map((v, i) => {
              return (
                <Button key={i} type='primary'>
                  {v?.name}
                </Button>
              )
            })}
          </div>
          <div className='pro_search_input_box'>
            <Input placeholder='Search Player' suffix={<CiSearch color='var(--primary)' />} />
          </div>
        </div>
      )}
      {publicDraft && (
        <div className='public_table_header'>
          <div className='public_button_box'>
            {publicButtons?.map((v, i) => {
              return (
                <Button key={i} type='primary'>
                  {v?.name}
                </Button>
              )
            })}
          </div>
          <div className='public_search_input_box'>
            <Input placeholder='Search Player' suffix={<CiSearch color='var(--primary)' />} />
          </div>
        </div>
      )}
      <div className='table_container'>
        <Table
          loading={false}
          dataSource={Array(20).fill({
            Name: 'Mike Wallace',
            Position: 'WR',
            Team: 'MIA',
            Opponent: 'MIA',
            Rank: 67,
            Bye: 5,
            FantasyPoints13: 168.8,
            FantasyPoints14: 168.8,
            adp: '',
          })}
          pagination={false}
          scroll={tableScroll}
          bordered={false}
          rowKey='_id'
          rowClassName={(record, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
        >
          <Column
            width={50}
            title=' '
            dataIndex='plus-icon'
            key='plus-icon'
            render={(_, obj) => <BiSolidPlusCircle size={18} style={{ marginBottom: '-3px' }} />}
          />
          <Column width={70} title='Rank' dataIndex='Rank' key='Rank' />

          <Column
            title='Player'
            dataIndex='player'
            key='player'
            render={(_, obj) => (
              <div className='table_player_name_box'>
                <p>{obj?.Name} </p>{' '}
                <p>
                  {obj?.Position} - {obj?.Team}{' '}
                </p>
              </div>
            )}
          />
          <Column width={70} title='Bye' dataIndex='Bye' key='Bye' />
          <ColumnGroup title='Fantasy Points'>
            <Column
              title='`13'
              dataIndex='FantasyPoints13'
              key='FantasyPoints13'
              width={80}
              render={(t) => {
                return <p>{t?.toFixed(2)}</p>
              }}
            />
            <Column
              title='`14 Proj'
              dataIndex='FantasyPoints14'
              key='FantasyPoints14'
              width={80}
              render={(t) => {
                return <p>{t?.toFixed(2)}</p>
              }}
            />
          </ColumnGroup>
          <Column width={100} title='ADP' dataIndex='adp' key='adp' />
        </Table>
      </div>
    </div>
  )
}

export default TableComponent
