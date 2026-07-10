import React, { useEffect, useState } from 'react'
import './spotauction.css'
import { useSelector } from 'react-redux'

const SpotAuctionTimer = ({ spotAuctionEnd, onTimerFinish }) => {
  const { socket } = useSelector((state) => state.socket)
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!spotAuctionEnd) return

      const now = new Date().getTime()
      const draftStartTime = new Date(spotAuctionEnd).getTime()
      const distance = draftStartTime - now

      if (distance < 0) {
        setTimeRemaining({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        onTimerFinish(true)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const fmt = (t) => (t < 10 ? `0${t}` : `${t}`)
      setTimeRemaining({ days: fmt(days), hours: fmt(hours), minutes: fmt(minutes), seconds: fmt(seconds) })
      onTimerFinish(false)
    }

    const timer = setInterval(calculateTimeRemaining, 1000)
    calculateTimeRemaining()
    return () => clearInterval(timer)
  }, [spotAuctionEnd, onTimerFinish])

  return (
    <div className='sat-timer'>
      <div className='sat-unit'>
        <span className='sat-value'>{timeRemaining.days}</span>
        <span className='sat-label'>Days</span>
      </div>
      <span className='sat-colon'>:</span>
      <div className='sat-unit'>
        <span className='sat-value'>{timeRemaining.hours}</span>
        <span className='sat-label'>Hrs</span>
      </div>
      <span className='sat-colon'>:</span>
      <div className='sat-unit'>
        <span className='sat-value'>{timeRemaining.minutes}</span>
        <span className='sat-label'>Min</span>
      </div>
      <span className='sat-colon'>:</span>
      <div className='sat-unit'>
        <span className='sat-value'>{timeRemaining.seconds}</span>
        <span className='sat-label'>Sec</span>
      </div>
    </div>
  )
}

export default SpotAuctionTimer
