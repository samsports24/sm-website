import React, { useEffect, useState } from 'react'

import { Button, notification } from 'antd'

import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import moment from 'moment'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import { clearNotification, getAllNotification } from '../redux/actions/notificationAction'
import { approveTrade, cancelTrade, payTrade } from '../redux/actions/teamTradeAction'
import { IoAlertCircleSharp } from 'react-icons/io5'

const LeagueNotification = () => {
  const SETTING = useSelector((state) => state?.user)
  const [notificationData, setNotificationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [approveId, setApproveId] = useState('')
  const [rejectId, setRejectId] = useState('')
  const [payId, setPayId] = useState('')
  const [clearBtnLoading, setClearBtnLoading] = useState(false)

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

  const clearAllNotification = async () => {
    setClearBtnLoading(true)
    const res = await clearNotification()
    if (res) {
      await getData()
    }
    setClearBtnLoading(false)
  }
  console.log('!!SETTING?.notificationCount', !SETTING?.notificationCount)
  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      <Header />
      <ButtonsAndPagination />
      {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button
          loading={clearBtnLoading}
          className='clear_noti_btn'
          type='primary'
          onClick={clearAllNotification}
          disabled={notificationData?.data?.length > 0 ? false : true}
        >
          Clear Notification
        </Button>
      </div> */}

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
