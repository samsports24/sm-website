import { Button, Select, Table } from 'antd'

import StandingHeader from '../components/StandingHeader'

import moment from 'moment'

import { transactionData } from './mockData'

const AdpReport = () => {
  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'FRANCHISE',
      dataIndex: 'franchise',
      key: 'franchise',
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'TRANSACTION',
      dataIndex: 'transaction',
      key: 'transaction',
      render: (text, record) => {
        return (
          <ul>
            {record?.transaction?.map((v, i) => {
              return <li key={i}>{v}</li>
            })}
          </ul>
        )
      },
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      render: (date) => {
        return <span>{`${moment(date).format('ddd MMM D h:mm:ss a [ET] YYYY')}`}</span>
      },
    },
  ]

  return (
    <div className='transactions_container'>
      {/* HEADER */}
      <StandingHeader />

      {/* <p className='hint_text'>
        Hint: For privacy reasons, owner email addresses, phone/fax numbers, and other owner contact
        information is only displayed to people who have logged into this league.
      </p> */}

      {/* DROPDOWN */}
      {/* GENERAL CSS */}
      <section className='dropdown_container'>
        <div className='select_box'>
          <p>Show me</p>
          <Select
            defaultValue='Transactions'
            style={{ minWidth: 140 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Transactions',
                label: 'Transactions',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Involving</p>
          <Select
            defaultValue='Any Franchise'
            style={{ minWidth: 140 }}
            // onChange={handleChange}
            options={[
              {
                value: 'Any Franchise',
                label: 'Any Franchise',
              },
            ]}
          />
        </div>
        <div className='select_box'>
          <p>Within the last</p>
          <Select
            defaultValue='30 days'
            style={{ minWidth: 110 }}
            // onChange={handleChange}
            options={[
              {
                value: '30 days',
                label: '30 days',
              },
            ]}
          />
        </div>
        <Button className='now_btn'>Now</Button>
      </section>

      {/* TABLE */}
      {/* GENERAL CSS */}
      <section className='main_table_container'>
        <div className='header'>
          <h3>ADP REPORT</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={transactionData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1000 }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
          />
        </div>
      </section>
    </div>
  )
}

export default AdpReport
