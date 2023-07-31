import React, { useState } from 'react'

// Icon
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'

const ScheduleBox = () => {
  const [weekPagination, setWeekPagination] = useState(1)

  const handleWeekPagination = (value) => {
    if (value === 'previous') {
      weekPagination === 1 ? setWeekPagination(4) : setWeekPagination((pre) => pre - 1)
    } else if (value === 'next') {
      weekPagination === 4 ? setWeekPagination(1) : setWeekPagination((pre) => pre + 1)
    } else {
      setWeekPagination(value)
    }
  }
  return (
    <section className='schedule_box1'>
      <h2>2023 Team Schedule:</h2>
      <ul className='week_pagination_ul'>
        <li
          onClick={() => handleWeekPagination(1)}
          className={`${weekPagination === 1 && 'active_week'}`}
        >
          Week One
        </li>
        <li
          onClick={() => handleWeekPagination(2)}
          className={`${weekPagination === 2 && 'active_week'}`}
        >
          Week Two
        </li>
        <li
          onClick={() => handleWeekPagination(3)}
          className={`${weekPagination === 3 && 'active_week'}`}
        >
          Week Three
        </li>
        <li
          onClick={() => handleWeekPagination(4)}
          className={`${weekPagination === 4 && 'active_week'}`}
        >
          Week Four
        </li>
        <div className='pre_next_box'>
          <button className='previous' onClick={() => handleWeekPagination('previous')}>
            <FiArrowLeft />
          </button>
          <button className='next' onClick={() => handleWeekPagination('next')}>
            <FiArrowRight />
          </button>
        </div>
      </ul>
    </section>
  )
}

export default ScheduleBox
