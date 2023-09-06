import React, { useEffect, useState } from 'react'

// Icon
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'

const WeekPagination = () => {
  const [weekPagination, setWeekPagination] = useState(-1)
  const [weekSlice, setWeekSlice] = useState(0)

  const WEEK = [
    'Week One',
    'Week Two',
    'Week Three',
    'Week Four',
    'Week Five',
    'Week Six',
    'Week Seven',
    'Week Eight',
    'Week Nine',
    'Week Ten',
    'Week Eleven',
    'Week Twelve',
    'Week Thirteen',
    'Week Fourteen',
    'Week Fifteen',
    'Week Sixteen',
    'Week Seventeen',
    'Week Eighteen',
  ]

  useEffect(() => {
    let weekFromApi = 6

    if (weekFromApi >= 1 && weekFromApi <= 4) {
      setWeekSlice(0)
      setWeekPagination([1, 2, 3, 4].indexOf(weekFromApi) + 1)
    } else if (weekFromApi >= 5 && weekFromApi <= 8) {
      setWeekSlice(4)
      setWeekPagination([5, 6, 7, 8].indexOf(weekFromApi) + 1)
    } else if (weekFromApi >= 9 && weekFromApi <= 12) {
      setWeekSlice(8)
      setWeekPagination([9, 10, 11, 12].indexOf(weekFromApi) + 1)
    } else if (weekFromApi >= 13 && weekFromApi <= 16) {
      setWeekSlice(12)
      setWeekPagination([13, 14, 15, 16].indexOf(weekFromApi) + 1)
    } else if (weekFromApi >= 17 && weekFromApi <= 18) {
      setWeekSlice(16)
      setWeekPagination([17, 18].indexOf(weekFromApi) + 1)
    } else {
      setWeekSlice(0)
      setWeekPagination(-1)
    }
  }, [])

  const handleWeekPagination = (value, week) => {
    const currentWeek = WEEK.findIndex((v) => v === week) + 1
    console.log(currentWeek)
    setWeekPagination(value)

    // if (value === 'previous') {
    //   weekPagination === 1 ? setWeekPagination(4) : setWeekPagination((pre) => pre - 1)
    // } else if (value === 'next') {
    //   weekPagination === 4 ? setWeekPagination(1) : setWeekPagination((pre) => pre + 1)
    // } else {
    //   setWeekPagination(value)
    // }
  }

  const handleNextAndPrev = (value) => {
    if (value === 'next') {
      if (weekSlice < 15) {
        setWeekSlice(weekSlice + 4)
        setWeekPagination(0)
      }
    } else {
      if (weekSlice > 0) {
        setWeekSlice(weekSlice - 4)
        setWeekPagination(0)
      }
    }
  }

  return (
    <ul className='week_pagination_ul'>
      {WEEK.slice(weekSlice, weekSlice + 4).map((v, i) => {
        return (
          <li
            key={i + 1}
            onClick={() => handleWeekPagination(i + 1, v)}
            className={`${weekPagination === i + 1 && 'active_week'}`}
          >
            {v}
          </li>
        )
      })}
      {/* <li
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
      </li> */}
      <div className='pre_next_box'>
        <button className='previous' onClick={() => handleNextAndPrev('previous')}>
          <FiArrowLeft />
        </button>
        <button className='next' onClick={() => handleNextAndPrev('next')}>
          <FiArrowRight />
        </button>
      </div>
    </ul>
  )
}

export default WeekPagination
