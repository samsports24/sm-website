import React, { useEffect, useState } from 'react'
import { FaArrowsRotate } from 'react-icons/fa6'

const ClockComponent = () => {
  const [time, setTime] = useState('00:00')

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className='clock_box'>
      <div className='time_box'>
        <p>{time}</p>
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
