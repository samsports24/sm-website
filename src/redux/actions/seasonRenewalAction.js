import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

/**
 * GET /season-renewal/status
 * Fetch the renewal status for the current league.
 */
export const getRenewalStatus = async () => {
  try {
    attachToken()
    const res = await privateAPI.get('/season-renewal/status')
    if (res) {
      return res.data.data
    }
  } catch (err) {
    return null
  }
}

/**
 * POST /season-renewal/respond
 * Accept or decline the season renewal.
 * @param {string} decision - "accept" or "decline"
 */
export const respondToRenewal = async (decision) => {
  try {
    attachToken()
    const res = await privateAPI.post('/season-renewal/respond', { decision })
    if (res) {
      notification.success({
        message: decision === 'accept' ? 'Season Renewed!' : 'League Cancellation Scheduled',
        description: res.data.data.message,
        duration: 4,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to process renewal',
      duration: 3,
    })
    return null
  }
}

/**
 * POST /season-renewal/revoke-cancellation
 * Revoke a cancellation and return to pending renewal.
 */
export const revokeCancellation = async () => {
  try {
    attachToken()
    const res = await privateAPI.post('/season-renewal/revoke-cancellation')
    if (res) {
      notification.success({
        message: 'Cancellation Revoked',
        description: res.data.data.message,
        duration: 4,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to revoke cancellation',
      duration: 3,
    })
    return null
  }
}

/**
 * POST /season-renewal/transfer-commissioner
 * Transfer commissioner rights to another user.
 * @param {string} newCommissionerId - The user ID of the new commissioner
 * @param {string} [leagueId] - Explicit league id. The backend middleware
 *   normally derives the league from the caller's team, but head
 *   commissioners may not have a team in their own league, so we pass
 *   the id directly to be safe.
 */
export const transferCommissioner = async (newCommissionerId, leagueId) => {
  try {
    attachToken()
    const res = await privateAPI.post('/season-renewal/transfer-commissioner', {
      newCommissionerId,
      ...(leagueId ? { leagueId } : {}),
    })
    if (res) {
      notification.success({
        message: 'Commissioner Transferred',
        description: res.data.data.message,
        duration: 4,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to transfer commissioner',
      duration: 3,
    })
    return null
  }
}

/**
 * POST /season-renewal/trigger-prompt
 * Manually trigger the renewal prompt (admin/testing).
 */
export const triggerRenewalPrompt = async () => {
  try {
    attachToken()
    const res = await privateAPI.post('/season-renewal/trigger-prompt')
    if (res) {
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to trigger renewal prompt',
      duration: 3,
    })
    return null
  }
}
