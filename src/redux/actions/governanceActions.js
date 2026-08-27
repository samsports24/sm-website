import { notification } from 'antd'
import { attachToken, privateAPI } from '../../config/constants'

// ═══════════════════════════════════════════════════════════════
//  GOVERNANCE ACTIONS, Commissioner & League Voting System
// ═══════════════════════════════════════════════════════════════

export const GOVERNANCE_TYPES = {
  SET_ACTIVE_VOTES: 'GOVERNANCE_SET_ACTIVE_VOTES',
  SET_ACTIVE_VOTES_LOADING: 'GOVERNANCE_SET_ACTIVE_VOTES_LOADING',
  SET_GOVERNANCE_HISTORY: 'GOVERNANCE_SET_HISTORY',
  SET_COMMISSIONER_INFO: 'GOVERNANCE_SET_COMMISSIONER_INFO',
  CLEAR_GOVERNANCE: 'GOVERNANCE_CLEAR',
}

// ═══════════════════════════════════════════════════════════════
//  VOTE OF NO CONFIDENCE
// ═══════════════════════════════════════════════════════════════

/**
 * Initiate a vote of no confidence against the commissioner
 */
export const initiateNoConfidence = async (leagueId) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/${leagueId}/no-confidence`)
    if (res?.data?.success) {
      notification.success({
        message: 'Vote of No Confidence Initiated',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to initiate vote',
      duration: 3,
    })
    return null
  }
}

/**
 * Cast a vote (yes/no/abstain) on any active vote
 */
export const castGovernanceVote = async (voteId, vote) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/vote/${voteId}/cast`, { vote })
    if (res?.data?.success) {
      notification.success({
        message: 'Vote Cast',
        description: `You voted "${vote}".`,
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to cast vote',
      duration: 3,
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMISSIONER ELECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Nominate yourself as a commissioner candidate
 */
export const nominateForCommissioner = async (electionId, statement = '') => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/election/${electionId}/nominate`, { statement })
    if (res?.data?.success) {
      notification.success({
        message: 'Nomination Submitted!',
        description: "You're now a commissioner candidate.",
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to nominate',
      duration: 3,
    })
    return null
  }
}

/**
 * Vote for a candidate in an election
 */
export const voteInElection = async (electionId, candidateId) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/election/${electionId}/vote`, { candidateId })
    if (res?.data?.success) {
      notification.success({
        message: 'Election Vote Cast',
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to vote in election',
      duration: 3,
    })
    return null
  }
}

/**
 * Start election voting phase (after nominations close)
 */
export const startElectionVoting = async (electionId) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/election/${electionId}/start-voting`)
    if (res?.data?.success) {
      notification.success({
        message: 'Election Voting Started!',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to start election',
      duration: 3,
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  COMMISSIONER TRANSFER
// ═══════════════════════════════════════════════════════════════

/**
 * Commissioner voluntarily transfers rights to another member
 */
export const transferCommissioner = async (leagueId, transferToUserId) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/${leagueId}/transfer-commissioner`, { transferToUserId })
    if (res?.data?.success) {
      notification.success({
        message: 'Commissioner Rights Transferred',
        duration: 3,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to transfer commissioner rights',
      duration: 3,
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  LEAGUE PAUSE
// ═══════════════════════════════════════════════════════════════

/**
 * Commissioner proposes to pause the league (needs 66% vote)
 */
export const proposeLeaguePause = async (leagueId) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/${leagueId}/propose-pause`)
    if (res?.data?.success) {
      notification.success({
        message: 'League Pause Proposed',
        description: res.data.data.message,
        duration: 5,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to propose pause',
      duration: 3,
    })
    return null
  }
}

/**
 * Commissioner creates a custom proposal the league votes yes/no on.
 * @param {string} leagueId
 * @param {{title:string, description?:string, durationHours?:number, threshold?:number}} payload
 */
export const createProposal = async (leagueId, payload) => {
  try {
    attachToken()
    const res = await privateAPI.post(`/governance/${leagueId}/proposal`, payload)
    if (res?.data?.success) {
      notification.success({
        message: 'Proposal created',
        description: res.data.data.message,
        duration: 4,
      })
      return res.data.data
    }
  } catch (err) {
    notification.error({
      message: err?.response?.data?.message || 'Failed to create proposal',
      duration: 3,
    })
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  INFO & HISTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Get all active governance votes for a league
 */
export const getActiveVotes = (leagueId) => async (dispatch) => {
  // No league selected → no request. Firing with an empty id produced
  // "/governance//active-votes" and a 404 on the hub dashboard.
  if (!leagueId) return
  try {
    dispatch({ type: GOVERNANCE_TYPES.SET_ACTIVE_VOTES_LOADING, payload: true })
    attachToken()
    const res = await privateAPI.get(`/governance/${leagueId}/active-votes`)
    if (res?.data?.success) {
      dispatch({ type: GOVERNANCE_TYPES.SET_ACTIVE_VOTES, payload: res.data.data })
    }
    return res?.data?.data
  } catch (err) {
    console.error('Active votes error:', err)
  } finally {
    dispatch({ type: GOVERNANCE_TYPES.SET_ACTIVE_VOTES_LOADING, payload: false })
  }
}

/**
 * Get governance vote history
 */
export const getGovernanceHistory = (leagueId) => async (dispatch) => {
  if (!leagueId) return
  try {
    attachToken()
    const res = await privateAPI.get(`/governance/${leagueId}/history`)
    if (res?.data?.success) {
      dispatch({ type: GOVERNANCE_TYPES.SET_GOVERNANCE_HISTORY, payload: res.data.data })
    }
  } catch (err) {
    console.error('Governance history error:', err)
  }
}

/**
 * Get commissioner info including AI commissioner status
 */
export const getCommissionerInfo = (leagueId) => async (dispatch) => {
  if (!leagueId) return null
  try {
    attachToken()
    const res = await privateAPI.get(`/governance/${leagueId}/commissioner-info`)
    if (res?.data?.success) {
      dispatch({ type: GOVERNANCE_TYPES.SET_COMMISSIONER_INFO, payload: res.data.data })
    }
    return res?.data?.data
  } catch (err) {
    console.error('Commissioner info error:', err)
    return null
  }
}
