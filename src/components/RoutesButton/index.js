import React, { useState } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const RoutesButton = () => {
  const [data] = useState([
    {
      name: 'NEWS',
      link: '/',
    },
    {
      name: 'SCORES',
      link: '/',
    },
    {
      name: 'SCHEDULE',
      link: '/',
    },
    {
      name: 'TEAMS',
      link: '/',
    },
    {
      name: 'PLAYERS',
      link: '/',
    },
    {
      name: 'STATS',
      link: '/',
    },
    {
      name: 'STANDINGS',
      link: '/',
    },
    {
      name: 'EVENTS',
      link: '/',
    },
    {
      name: 'SFL',
      link: '/',
    },
  ])
  const navigate = useNavigate()

  return (
    <div className='routes_button_group_container'>
      <div className='routes_button_group'>
        {data?.map((v, i) => {
          return (
            <Button key={i} type='primary' onClick={() => navigate(v?.link)}>
              {v?.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default RoutesButton
