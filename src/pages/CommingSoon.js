import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import { FiArrowLeft } from 'react-icons/fi'

import moment from 'moment'

// Mock Data

const ComingSoon = () => {
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime())

  function calculateRemainingTime() {
    const targetDate = moment('2023-08-31' || new Date())
    const currentDate = moment()
    const duration = moment.duration(targetDate.diff(currentDate))
    return {
      days: Math.floor(duration.asDays()),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
    }
  }

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingTime(calculateRemainingTime())
    }, 1000)
    return () => clearInterval(timerInterval)
  }, [])

  const RemainingTime = ({ value, type }) => {
    const formatNumber = (number) => {
      return number.toString().padStart(2, '0')
    }
    return (
      <div className='remaining_time_container'>
        <div className='box'>
          <h1>{formatNumber(value)}</h1>
          <p>{type}</p>
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
              title: <p>Coming Soon</p>,
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
          <RemainingTime value={remainingTime?.days} type={'DAYS'} />
          <RemainingTime value={remainingTime?.hours} type={'HOURS'} />
          <RemainingTime value={remainingTime?.minutes} type={'MINUTES'} />
          <RemainingTime value={remainingTime?.seconds} type={'SECOND'} />
        </div>
        <p className='_back_button'>
          <FiArrowLeft /> BACK
        </p>
      </section>
    </div>
  )
}

export default ComingSoon
