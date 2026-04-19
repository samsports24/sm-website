import React, { useEffect, useState } from 'react'
import { FaArrowsRotate } from 'react-icons/fa6'
import Countdown from 'react-countdown'

const ClockComponent = () => {
  // const [time, setTime] = useState('00:00')

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const now = new Date()
  //     const hours = now.getHours().toString().padStart(2, '0')
  //     const minutes = now.getMinutes().toString().padStart(2, '0')
  //     setTime(`${hours}:${minutes}`)
  //   }, 1000)
  //   return () => clearInterval(intervalId)
  // }, [])

  const renderer = ({ hours, minutes, seconds, completed }) => {
    const m = String(minutes)?.padStart(2, '0')
    const s = String(seconds)?.padStart(2, '0')
    return completed ? <p>00:00</p> : <p>{`${m}:${s}`}</p>
  }

  return (
    <div className='clock_box'>
      <div className='time_box'>
        {/* <p>{time}</p> */}
        <Countdown date={Date.now() + 70000} renderer={renderer} />
      </div>
      <div className='clock_box_bottom'>
        <div className='cbb_right'>
          <FaArrowsRotate color='var(--primary)' size={30} />
        </div>
        <div className='cbb_center'>
          <p>On The Clock</p>
          <p>Team 1</p>
        </div>
        <div className='cbb_left'>
          <p>#73</p>
        </div>
      </div>
    </div>
  )
}

export default ClockComponent
