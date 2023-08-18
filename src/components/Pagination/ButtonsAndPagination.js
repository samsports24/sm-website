import { Button, Typography, Dropdown } from 'antd'
import WeekPagination from '../WeekPagination'

const ButtonsAndPagination = ({ noWeek }) => {
  const items = [
    {
      key: '1',
      label: <Typography.Title level={4}>FREE AGENTS</Typography.Title>,
    },
    {
      key: '2',
      label: (
        <Typography.Title level={4} style={{ color: 'white' }}>
          PLAYER AUCTIONS
        </Typography.Title>
      ),
    },
    {
      key: '3',
      label: (
        <Typography.Title level={4} style={{ color: 'white' }}>
          PLAYER STANDINGS
        </Typography.Title>
      ),
    },
  ]

  return (
    <section className='buttons_and_pagination'>
      <div className='buttons_group'>
        <Button type='primary'>Home</Button>
        <Button type='primary'>Team</Button>
        <Dropdown menu={{ items }}>
          <Button type='primary'>Players</Button>
        </Dropdown>
        <Button type='primary'>League</Button>
      </div>
      {!noWeek && <WeekPagination />}
    </section>
  )
}

export default ButtonsAndPagination
