import React, { useEffect, useState } from 'react'

// Icon
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { useSelector } from 'react-redux'

const WeekPagination = ({ currentWeek = 1, onClick = () => {} }) => {
  const setting = useSelector((state) => state?.user?.setting)

  const [weekPagination, setWeekPagination] = useState(setting?.week || currentWeek)
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
    if (currentWeek >= 1 && currentWeek <= 4) {
      setWeekSlice(0)
      setWeekPagination([1, 2, 3, 4].indexOf(currentWeek) + 1)
    } else if (currentWeek >= 5 && currentWeek <= 8) {
      setWeekSlice(4)
      setWeekPagination([5, 6, 7, 8].indexOf(currentWeek) + 1)
    } else if (currentWeek >= 9 && currentWeek <= 12) {
      setWeekSlice(8)
      setWeekPagination([9, 10, 11, 12].indexOf(currentWeek) + 1)
    } else if (currentWeek >= 13 && currentWeek <= 16) {
      setWeekSlice(12)
      setWeekPagination([13, 14, 15, 16].indexOf(currentWeek) + 1)
    } else if (currentWeek >= 17 && currentWeek <= 18) {
      setWeekSlice(16)
      setWeekPagination([17, 18].indexOf(currentWeek) + 1)
    } else {
      setWeekSlice(0)
      setWeekPagination(-1)
    }
  }, [])

  console.log('weekPagination :>> ', weekPagination)

  const handleWeekPagination = (value, week) => {
    const currentWeek = WEEK.findIndex((v) => v === week) + 1
    setWeekPagination(value)
    onClick(currentWeek)
    // console.log(currentWeek)
  }

  const handleNextAndPrev = (value) => {
    if (value === 'next') {
      if (weekSlice < 15) {
        setWeekSlice(weekSlice + 4)
        setWeekPagination(1)
      }
    } else {
      if (weekSlice > 0) {
        setWeekSlice(weekSlice - 4)
        setWeekPagination(1)
      }
    }
  }

  return (
    <ul className='week_pagination_ul'>
      {WEEK.slice(weekSlice, weekSlice + 4).map((v, i) => {
        const index = i + 1
        return (
          <li
            key={index}
            onClick={() => setting?.week >= index && handleWeekPagination(index, v)}
            className={`${weekPagination === index && 'active_week'}`}
            style={{ cursor: setting?.week >= index ? 'pointer' : 'no-drop' }}
          >
            {v}
          </li>
        )
      })}
      <div className='pre_next_box'>
        <button className='previous' onClick={() => handleNextAndPrev('previous')}>
          <FiArrowLeft />
        </button>
        <button className='next' disabled={false} onClick={() => handleNextAndPrev('next')}>
          <FiArrowRight />
        </button>
      </div>
    </ul>
  )
}

export default WeekPagination
