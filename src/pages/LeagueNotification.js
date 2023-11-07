import React, { useEffect, useState } from 'react'

import { Button, notification } from 'antd'

// import Arrow from '../assets/arrow-right.svg'

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
import { approveTrade, cancelTrade, payTrade } from '../redux/actions/teamTradeAction'

const LeagueNotification = () => {
  const SETTING = useSelector((state) => state?.user)
  // const [date, setDate] = useState(SETTING?.currentWeek)
  const [notificationData, setNotificationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [approveId, setApproveId] = useState('')
  const [rejectId, setRejectId] = useState('')
  const [payId, setPayId] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    const res = await getAllNotification({
      week: SETTING?.currentWeek,
    })
    setNotificationData(res)
    setIsLoading(false)
  }

  const handleCancelTrade = async (tradeId) => {
    setRejectId(tradeId)
    const res = await cancelTrade({ tradeId })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      await getData()
    }
    setRejectId('')
  }

  const handleApproveTrade = async (tradeId) => {
    setApproveId(tradeId)
    const res = await approveTrade({ tradeId })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      getData()
    }
    setApproveId('')
  }

  const handlePay = async (tradeId) => {
    setPayId(tradeId)
    const res = await payTrade({ tradeId })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      getData()
    }
    setPayId('')
  }

  const isPayButtonDis = (metadata) => {
    const buyerPaid = metadata?.hasBuyerPaid
    const sellerPaid = metadata?.hasSellerPaid

    const currentTeamId = SETTING?.userDetails?.team?._id

    const buyerTeamId = metadata?.buyer?.team
    const sellerTeamId = metadata?.seller?.team

    if (buyerPaid && currentTeamId === buyerTeamId) {
      return true
    } else if (sellerPaid && currentTeamId === sellerTeamId) {
      return true
    } else {
      return false
    }
  }

  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      {/* BREADCRUMB */}
      {/* <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
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
      </section> */}

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
          ) : notificationData?.data?.length > 0 ? (
            notificationData?.data?.map((v, i) => {
              return (
                <div key={i} className='card_box'>
                  <div className='header'>
                    <p>{v?.title || 'Untitled'}</p>
                    <span>{v?.alert && <IoAlertCircleSharp size={20} color='red' />}</span>
                  </div>
                  <div className='content'>
                    <p>{v?.message}</p>
                    <h5>Created At: {moment(v?.createdAt).format('ddd DD-MM-YYYY hh:mm a')}</h5>
                    <div className='button_box_approve_reject'>
                      <>
                        {v?.module === 'trade' &&
                          !v?.metadata?.isCancelled &&
                          !v?.metadata?.isApproved && (
                            <>
                              <Button
                                loading={approveId === v?.metadata?.tradeId?._id}
                                type='primary'
                                className='approve_button'
                                onClick={() => handleApproveTrade(v?.metadata?.tradeId?._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                loading={rejectId === v?.metadata?.tradeId?._id}
                                type='primary'
                                className='approve_button'
                                onClick={() => handleCancelTrade(v?.metadata?.tradeId?._id)}
                              >
                                Deny
                              </Button>
                              <Button
                                type='primary'
                                className='approve_button'
                                onClick={() => {
                                  navigate('/counter-trade', {
                                    state: {
                                      tradeId: v?.metadata?.tradeId?._id,
                                    },
                                  })
                                }}
                              >
                                Counter
                              </Button>
                            </>
                          )}

                        {v?.metadata?.isApproved && (
                          <Button
                            disabled={isPayButtonDis(v?.metadata?.tradeId)}
                            loading={payId === v?.metadata?.tradeId?._id}
                            type='primary'
                            className='approve_button'
                            onClick={() => handlePay(v?.metadata?.tradeId?._id)}
                          >
                            {isPayButtonDis(v?.metadata?.tradeId) ? 'Paid' : 'Pay'}
                          </Button>
                        )}
                      </>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='no_notification_box' style={{ height: '200px' }}>
              <p>No Notification...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default LeagueNotification
