import React, { useState } from 'react'

// Icon
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import { updateSection, updateWeek } from '../../redux'
import { Button } from 'antd'

const WeekPagination = ({ goLive }) => {
  const { setting, weekSection, currentWeek } = useSelector((state) => state?.user)

  const dispatch = useDispatch()

  const handleWeekPagination = (value) => currentWeek >= value && dispatch(updateWeek(value))

  const handleNextAndPrev = (value) => {
    if (value === 'next') {
      weekSection >= 6 ? dispatch(updateSection(1)) : dispatch(updateSection(weekSection + 1))
    } else {
      weekSection <= 1 ? dispatch(updateSection(6)) : dispatch(updateSection(weekSection - 1))
    }
  }

  const goLiveFunction = () => dispatch(updateWeek(currentWeek))

  return (
    <ul className='week_pagination_ul'>
      {weekSection === 1 && (
        <>
          {['Week One', 'Week Two', 'Week Three', 'Week Four'].map((v, i) => {
            const index = i + 1
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {weekSection === 2 && (
        <>
          {['Week Five', 'Week Six', 'Week Seven', 'Week Eight'].map((v, i) => {
            const index = i + 5
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {weekSection === 3 && (
        <>
          {['Week Nine', 'Week Ten', 'Week Eleven', 'Week Twelve'].map((v, i) => {
            const index = i + 9
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {weekSection === 4 && (
        <>
          {['Week Thirteen', 'Week Fourteen', 'Week Fifteen', 'Week Sixteen'].map((v, i) => {
            const index = i + 13
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {weekSection === 5 && (
        <>
          {['Week Seventeen', 'Week Eighteen', 'Week Nineteen', 'Week Twenty'].map((v, i) => {
            const index = i + 17
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {weekSection === 6 && (
        <>
          {['Week TwentyOne', 'Week TwentyTwo', 'Week TwentyThree'].map((v, i) => {
            const index = i + 21
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )}
      {/* {weekSection === 6 && (
        <>
          {[' Week Nineteen', 'Week Twenty', 'Week TwentyOne', 'Week TwentyTwo'].map((v, i) => {
            const index = i + 19
            return (
              <li
                key={index}
                onClick={() => handleWeekPagination(index)}
                style={{ cursor: currentWeek >= index ? 'pointer' : 'no-drop' }}
                className={`${setting?.week === index && 'active_week'}`}
              >
                {v}
              </li>
            )
          })}
        </>
      )} */}
      <div className='pre_next_box'>
        <button className='previous' onClick={() => handleNextAndPrev('previous')}>
          <FiArrowLeft />
        </button>
        <button className='next' onClick={() => handleNextAndPrev('next')}>
          <FiArrowRight />
        </button>
      </div>
      {goLive && (
        <Button className='go_live_button' onClick={goLiveFunction}>
          Go Live
        </Button>
      )}
    </ul>
  )
}

export default WeekPagination
