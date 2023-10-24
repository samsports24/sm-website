import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, notification as antNotification } from 'antd'

import Arrow from '../assets/arrow-right.svg'

import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
// import Loader from '../components/Loader'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { IoAlertCircleSharp } from 'react-icons/io5'
import Loader from '../components/Loader'
import { useSelector } from 'react-redux'
import { getAllNotification } from '../redux/actions/notificationAction'
import moment from 'moment'
import { approveTrade, cancelTrade } from '../redux/actions/teamTradeAction'

const LeagueNotification = () => {
  const SETTING = useSelector((state) => state?.user)
  // const [date, setDate] = useState(SETTING?.currentWeek)
  const [isLoading, setIsLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    const res = await getAllNotification({
      week: SETTING?.currentWeek,
    })
    setNotification(res)
    setIsLoading(false)
  }

  const handleCancelTrade = async (tradeId) => {
    setCancelLoading(true)
    const res = await cancelTrade({ tradeId })
    console.log('🚀 ~ file: LeagueNotification.js:44 ~ handleCancelTrade ~ res:', res)
    if (res) {
      antNotification.success({
        message: res,
        duration: 3,
      })
      await getData()
    }
    setCancelLoading(false)
  }

  const handleApproveTrade = async (tradeId) => {
    setApproveLoading(true)
    const res = await approveTrade({ tradeId })
    if (res) {
      antNotification.success({
        message: res,
        duration: 3,
      })
      getData()
    }
    console.log('🚀 ~ file: LeagueNotification.js:44 ~ handleCancelTrade ~ res:', res)
    setApproveLoading(false)
  }

  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate(-1)}>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Leagues</p>,
            },
            {
              title: <p>League Notification</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <div className='league_notification'>
        <header>
          <h3></h3>
        </header>
        <section className='league_standings_body'>
          {isLoading ? (
            <Loader />
          ) : notification?.data?.length > 0 ? (
            notification?.data?.map((v, i) => {
              return (
                <div key={i} className='card_box'>
                  <div className='header'>
                    <p>{v?.title || 'Untitled'}</p>
                    <span>{v?.alert && <IoAlertCircleSharp size={20} color='red' />}</span>
                  </div>
                  <div className='content'>
                    <p>{v?.message}</p>
                    <h5>Created At: {moment(v?.createdAt).format('ddd DD-MM-YYYY hh:mm a')}</h5>
                    {v?.module === 'trade' && !v?.metadata?.isCancelled && (
                      <div className='button_box_approve_reject'>
                        <Button
                          loading={approveLoading}
                          type='primary'
                          className='approve_button'
                          onClick={() => handleApproveTrade(v?.metadata?.tradeId)}
                        >
                          Approve
                        </Button>
                        <Button
                          loading={cancelLoading}
                          type='primary'
                          className='approve_button'
                          onClick={() => handleCancelTrade(v?.metadata?.tradeId)}
                        >
                          Deny
                        </Button>
                        <Button
                          type='primary'
                          className='approve_button'
                          onClick={() => {
                            navigate('/counter-trade', {
                              state: {
                                tradeId: v?.metadata?.tradeId,
                              },
                            })
                          }}
                        >
                          Counter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='no_notification_box'>
              <p>No Notification...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default LeagueNotification
