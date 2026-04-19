import React from 'react'

// Icon
import WeekPagination from '../WeekPagination'

const ScheduleBox = ({title}) => {
  return (
    <section className='schedule_box1'>
      <h2>{title ? title : '2023 Team Schedule'}:</h2>
      <WeekPagination />
    </section>
  )
}

export default ScheduleBox
