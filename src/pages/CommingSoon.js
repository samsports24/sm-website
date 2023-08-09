import React, { useState } from 'react'

import { Breadcrumb, Button } from 'antd'
import Arrow from '../assets/arrow-right.svg'
// Component
import Header from '../components/Header'

// Mock Data

const ComingSoon = () => {
  const [activeFilter] = useState('Coming Soon')
  // const [ setData] = useState([])

  const RemainingTime = () => {
    return (
      <div className='remaining_time_container'>
        <div className='box'>
          <h1>02</h1>
          <p>DAYS</p>
        </div>
      </div>
    )
  }

  return (
    <div className='coming_soon_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Team</p>,
            },

            {
              title: <p>{activeFilter}</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
      </section>

      <section className='coming_soon'>
        <img src={require('../assets/coming-soon.png')} />
        <div className='time_container'>
          <RemainingTime />
        </div>
      </section>
    </div>
  )
}

export default ComingSoon
