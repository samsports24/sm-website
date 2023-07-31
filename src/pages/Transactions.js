import { Button, Select, Table } from 'antd'
import StandingHeader from '../components/StandingHeader'
import moment from 'moment'

const Transactions = () => {
  const tableData = [
    {
      key: 1,
      franchise: 'The Beast',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 2,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Injured Reserve',
      transaction: ['Deactivated Boone, Mike DEN RB; Jackson, Donte CAR CB'],
      date: new Date(),
    },
    {
      key: 3,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Taxi Squad',
      transaction: ['Promoted Kirkwood, Keith NOS WR; Robinson, Kenny PIT S,'],
      date: new Date(),
    },
    {
      key: 4,
      franchise: 'The Resistance (C)',
      type: 'Add/Drop',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 5,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 6,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 7,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Promoted Lewis, Terrell CHI LB', 'Demoted Tuszka, Derrek LAC LB'],
      date: new Date(),
    },
    {
      key: 8,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 9,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 10,
      franchise: 'Empire',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 11,
      franchise: 'The Beast',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 12,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Injured Reserve',
      transaction: ['Deactivated Boone, Mike DEN RB; Jackson, Donte CAR CB'],
      date: new Date(),
    },
    {
      key: 13,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Taxi Squad',
      transaction: ['Promoted Kirkwood, Keith NOS WR; Robinson, Kenny PIT S,'],
      date: new Date(),
    },
    {
      key: 14,
      franchise: 'The Resistance (C)',
      type: 'Add/Drop',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 15,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 16,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 17,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Promoted Lewis, Terrell CHI LB', 'Demoted Tuszka, Derrek LAC LB'],
      date: new Date(),
    },
    {
      key: 18,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 19,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 20,
      franchise: 'Empire',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 21,
      franchise: 'The Beast',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 22,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Injured Reserve',
      transaction: ['Deactivated Boone, Mike DEN RB; Jackson, Donte CAR CB'],
      date: new Date(),
    },
    {
      key: 23,
      franchise: 'Blockchain Bounty Hunters',
      type: 'Taxi Squad',
      transaction: ['Promoted Kirkwood, Keith NOS WR; Robinson, Kenny PIT S,'],
      date: new Date(),
    },
    {
      key: 24,
      franchise: 'The Resistance (C)',
      type: 'Add/Drop',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 25,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 26,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 27,
      franchise: 'Red Zone Dragons',
      type: 'Taxi Squad',
      transaction: ['Promoted Lewis, Terrell CHI LB', 'Demoted Tuszka, Derrek LAC LB'],
      date: new Date(),
    },
    {
      key: 28,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 29,
      franchise: 'Kingsmen',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
    },
    {
      key: 30,
      franchise: 'Empire',
      type: 'Taxi Squad',
      transaction: ['Demoted Bolton, Nick KCC LB; White, Kyzir PHI LB'],
      date: new Date(),
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
            scroll={{ x: 1000 }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'odd-row' : 'even-row')}
          />
        </div>
      </section>
    </div>
  )
}

export default Transactions
