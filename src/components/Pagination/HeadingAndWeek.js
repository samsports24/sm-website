import React, { useEffect, useState } from 'react'
import WeekPagination from '../WeekPagination'
import { isLocked } from '../../config/constants'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const HeadingAndWeek = ({ heading, week = true, goLive = true }) => {
  const user = useSelector((state) => state.user.userDetails)
  const location = useLocation();
  const isProfessionalLeague = location.pathname === '/professional-league'
  const leagueType = user?.team?.currentLeague?.leagueType
  const draftstarttime = user?.team?.currentLeague?.draftStart
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })
  const [isTimeComplete, setIsTimeComplete] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!draftstarttime) return

      const now = new Date().getTime()
      const draftStart = new Date(draftstarttime).getTime() - 3600000 // Subtract 1 hour (3600000 ms)
      const distance = draftStart - now

      if (distance < 0) {
        setTimeRemaining({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        })
        setIsTimeComplete(true)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`)

      setTimeRemaining({
        days: formatTime(days),
        hours: formatTime(hours),
        minutes: formatTime(minutes),
        seconds: formatTime(seconds),
      })
    }

    const timer = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(timer)
  }, [draftstarttime])

  return (
    <>
      {leagueType === 'public' && !isTimeComplete && isProfessionalLeague && (
        <div style={{ position: 'relative', top: '40px' }}>
          <Button
            className='auctionforpicklefttime'
            type='primary'
            onClick={() => navigate('/draft-spot-auction')}
          >
            DRAFT PICK AUCTION!! <span className='timeleft'>Time Left:</span>{' '}
            <span className='timelefttext'>
              {timeRemaining?.days} {timeRemaining?.hours}:{timeRemaining?.minutes}:
              {timeRemaining?.seconds}
            </span>
          </Button>
        </div>
      )}

      <div className='heading_and_week'>
        {heading ? <h2>{heading}</h2> : <div />}

        {week ? <WeekPagination goLive={goLive} /> : <div />}
      </div>
      {isLocked() && !window.location.href?.includes('/leagueScore') && (
        <div className='locked_box'>
          <p>You are viewing previous week data in view only mode.</p>
        </div>
      )}
    </>
  )
}

export default HeadingAndWeek
