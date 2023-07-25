import React, { useState } from 'react'

import { Button } from 'antd'

// Component
import Pagination from '../Pagination'

const StandingHeader = () => {
  const [activeBtn, setActiveBtn] = useState('Standings')

  const handlePagination = (page) => {
    console.log(page)
  }

  const buttons = [
    'Main',
    'Rosters',
    'Submit Lineup',
    'Add/Drops',
    'Player Stats',
    'Standings',
    'Transactions',
    'Live Scoring',
    'Schedule',
  ]

  return (
    <header className='standing_header_container'>
      <h1>Ultimate fantasy american football league</h1>
      <div className='button_container'>
        {buttons.map((v, i) => (
          <Button
            className={`${activeBtn === v && 'active_button'}`}
            onClick={() => setActiveBtn(v)}
            key={i}
          >
            {v}
          </Button>
        ))}
      </div>
      <div className='pagination_box'>
        <Pagination
          title='Standings as of Week:'
          defaultCurrent={1}
          total={180}
          onChange={handlePagination}
        />
      </div>
    </header>
  )
}

export default StandingHeader
