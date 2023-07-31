import { Button, Select, Table } from 'antd'
import StandingHeader from '../components/StandingHeader'

const Transactions = () => {
  const tableData = [
    {
      key: 1,
      title: '',
    },
  ]
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
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
    },
  ]
  return (
    <div className='transactions_container'>
      {/* HEADER */}
      <StandingHeader />

      <p className='hint_text'>
        Hint: For privacy reasons, owner email addresses, phone/fax numbers, and other owner contact
        information is only displayed to people who have logged into this league.
      </p>

      {/* DROPDOWN */}
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

      {/* STATS */}
      <section className='transactions_table_container'>
        <div className='header'>
          <h3>RECENT TRANSACTIONS</h3>
        </div>
        <div className='main_table'>
          <Table
            dataSource={tableData}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </div>
      </section>
    </div>
  )
}

export default Transactions
