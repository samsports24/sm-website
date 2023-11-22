import React from 'react'
import WeekPagination from '../WeekPagination'
import { isLocked } from '../../config/constants'

const HeadingAndWeek = ({ heading, week = true, goLive = true }) => {
  return (
    <>
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
