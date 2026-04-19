import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI } from '../../config/constants'
import store from '../store'
import {
  playTradeSound,
  playAuctionWonSound,
  playChatSound,
  playNotificationSound,
} from '../../utils/notificationSound'

// Track last known notification count to detect new ones
let lastKnownNotiCount = null

export const getAllNotification = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/notification/get-all`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const getNotiCount = () => {
  return async (dispatch) => {
    const id = localStorage.getItem('userId')
    if (id) {
      try {
        attachToken()
        const res = await publicAPI.get(`/notification/get-count/${id}`)
        if (res) {
          const newCount = res?.data?.data || 0

          // Play sound when notification count increases
          if (lastKnownNotiCount !== null && newCount > lastKnownNotiCount) {
            playNotificationSound()
          }
          lastKnownNotiCount = newCount

          dispatch({
            type: 'SET_NOTIFICATION_COUNT',
            payload: newCount,
          })
        }
      } catch (err) {
        notification.error({
          message: err?.response?.data?.message || 'Server Error',
          duration: 3,
        })
      }
    }
  }
}

export const clearNotification = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/notification/clear`)
    if (res) {
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res?.data?.data?.message
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}



export const  getAllChatNotification = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/notification/get-all-chat`, payload)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}


export const clearChatNotification = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/notification/clear-chat-notification`)
    if (res) {
      notification.success({
        message: res?.data?.data?.message,
        duration: 3,
      })
    }
    return res?.data?.data?.message
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const deleteReadNotifications = async () => {
  try {
    attachToken()
    const res = await privateAPI.delete('/notification/delete-read')
    if (res) {
      notification.success({
        message: res?.data?.data?.message || 'Read notifications deleted',
        duration: 3,
      })
    }
    return res?.data?.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

export const deleteNotification = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.delete(`/notification/${id}`)
    if (res) {
      notification.success({
        message: 'Notification deleted',
        duration: 2,
      })
    }
    return res?.data?.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

// ── Commissioner Announcements ──
export const postCommissionerAnnouncement = async (payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/notification/commissioner-announcement`, payload)
    if (res) {
      notification.success({
        message: 'Announcement sent to all league members',
        duration: 3,
      })
    }
    return res?.data?.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to send announcement',
      duration: 3,
    })
  }
}

export const getCommissionerAnnouncements = async () => {
  try {
    attachToken()
    const res = await privateAPI.get(`/notification/commissioner-announcements`)
    return res?.data?.data || []
  } catch (err) {
    // Silently fail — announcements are supplemental
    return []
  }
}

export const deleteCommissionerAnnouncement = async (id) => {
  try {
    attachToken()
    const res = await privateAPI.delete(`/notification/commissioner-announcement/${id}`)
    if (res) {
      notification.success({
        message: 'Announcement deleted',
        duration: 2,
      })
    }
    return res?.data?.data
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Server Error',
      duration: 3,
    })
  }
}

