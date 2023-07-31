import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { Button } from 'antd'

// Component
import Pagination from '../Pagination'

const StandingHeader = ({ pagination = false }) => {
  const navigate = useNavigate()
  let location = useLocation()

  const [activeBtn, setActiveBtn] = useState('Main')

  const getActivePage = (key) => {
    switch (key) {
      case '/main':
        return 'Main'
      case '/rosters':
        return 'Rosters'
      case '/submit-lineup':
        return 'Submit Lineup'
      case '/add-drops':
        return 'Add/Drops'
      case '/player-stats':
        return 'Player Stats'
      case '/league-standings':
        return 'Standings'
      case '/transactions':
        return 'Transactions'
      case '/live-score':
        return 'Live Scoring'
      case '/schedule':
        return 'Schedule'
      default:
        return 'Main'
    }
  }

  useEffect(() => {
    setActiveBtn(getActivePage(location.pathname))
  }, [location])

  const handlePagination = (page) => {
    console.log(page)
  }

  const buttons = [
    {
      btnName: 'Main',
      navigateTo: '/',
    },
    {
      btnName: 'Rosters',
      navigateTo: '/',
    },
    {
      btnName: 'Submit Lineup',
      navigateTo: '/',
    },
    {
      btnName: 'Add/Drops',
      navigateTo: '/',
    },
    {
      btnName: 'Player Stats',
      navigateTo: '/player-stats',
    },
    {
      btnName: 'Standings',
      navigateTo: '/league-standings',
    },
    {
      btnName: 'Transactions',
      navigateTo: '/transactions',
    },
    {
      btnName: 'Live Scoring',
      navigateTo: '/live-score',
    },
    {
      btnName: 'Schedule',
      navigateTo: '/',
    },
  ]

  return (
    <header className='standing_header_container'>
      <h1>Ultimate fantasy american football league</h1>
      <div className='button_container'>
        {buttons?.map((v, i) => {
          return (
            <Button
              className={`${activeBtn === v?.btnName && 'active_button'}`}
              onClick={() => {
                setActiveBtn(v?.btnName)
                navigate(`${v?.navigateTo}`)
              }}
              key={i}
            >
              {v?.btnName}
            </Button>
          )
        })}
      </div>
      {pagination && (
        <div className='pagination_box'>
          <Pagination
            title='Standings as of Week:'
            defaultCurrent={1}
            total={180}
            onChange={handlePagination}
          />
        </div>
      )}
    </header>
  )
}

export default StandingHeader
