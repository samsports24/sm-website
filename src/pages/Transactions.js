import { Button, Select, Table, Spin, Empty } from 'antd'
import { useState, useEffect } from 'react'
import StandingHeader from '../components/StandingHeader'
import moment from 'moment'

// API
import { privateAPI, attachToken } from '../config/constants'

const Transactions = () => {
  const [transactionData, setTransactionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const token = attachToken()
        const response = await privateAPI.post('/transaction/get-all-transactions')
        setTransactionData(response.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError(err.message)
        setTransactionData([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

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

      {/* TRANSACTIONS TABLE */}
      <section className='main_table_container'>
        <div className='header'>
          <h3>RECENT TRANSACTIONS</h3>
        </div>
        <div className='main_table'>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size='large' />
            </div>
          ) : error ? (
            <Empty
              description={`Error: ${error}`}
              style={{ padding: '50px' }}
            />
          ) : transactionData.length === 0 ? (
            <Empty
              description='No transactions found'
              style={{ padding: '50px' }}
            />
          ) : (
            <Table
              dataSource={transactionData}
              columns={columns}
              bordered={false}
              pagination={false}
              scroll={{ x: 1000 }}
              rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default Transactions
