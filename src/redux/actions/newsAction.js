import { notification } from 'antd'
import { attachToken, privateAPI, publicAPI } from '../../config/constants'

export const getNewsFeed = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/news/get-news')
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


export const getAllNewsFeed = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/news/get-all-news')
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


export const summarizeArticleUrl = async (url, headline) => {
  try {
    // Use publicAPI — landing page doesn't require auth
    const res = await publicAPI.post('/news/summarize-url', { url, headline })
    if (res) {
      return res.data.data
    }
  } catch (err) {
    console.error('Failed to summarize article URL:', err?.response?.data?.message || err.message)
    // Client-side fallback: return headline as summary so modal never shows "unavailable"
    return { summary: `${headline}. Stay tuned for more details on this developing story.`, note: 'fallback' }
  }
}

export const getArticleSummary = async (articleId) => {
  try {
    attachToken()
    const res = await privateAPI.get(`/news/article-summary/${articleId}`)
    if (res) {
      return res.data.data
    }
  } catch (err) {
    // Don't show error notification — we handle gracefully in the modal
    console.error('Failed to get article summary:', err?.response?.data?.message || err.message)
    return null
  }
}
