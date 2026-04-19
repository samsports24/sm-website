import { soccerAPI, attachSoccerToken } from '../config/constants'

// Helper: ensure token is attached before every call
const api = () => {
  attachSoccerToken()
  return soccerAPI
}

// ── Squad ──
export const getSquad = (teamId) =>
  teamId ? api().get(`/api/v1/teams/squad/${teamId}`) : api().get('/api/v1/teams/squad')

export const releasePlayer = (playerId) =>
  api().delete(`/api/v1/teams/squad/${playerId}`)

export const setCaptain = (teamId, playerId) =>
  teamId
    ? api().put(`/api/v1/teams/captain/${teamId}`, { playerId })
    : api().put('/api/v1/teams/captain', { playerId })

export const getMyTeam = () =>
  api().get('/api/v1/teams/my-team')

export const getMyTeams = () =>
  api().get('/api/v1/teams/my-teams')

// ── Lineup ──
export const getLineup = (teamId) =>
  api().get(`/api/v1/lineups/${teamId}`)

export const setLineup = (teamId, data) =>
  api().post(`/api/v1/lineups/${teamId}/set`, data)

export const autoFillLineup = (teamId) =>
  api().post(`/api/v1/lineups/${teamId}/auto-fill`)

// ── Transfers / Free Agents ──
export const getFreeAgents = (leagueId) =>
  api().get(`/api/v1/leagues/${leagueId}/free-agents`)

export const searchPlayers = (params) =>
  api().get('/api/v1/players/search', { params })

// ── Auctions ──
export const getLeagueAuctions = (leagueId) =>
  api().get(`/api/v1/auctions/league/${leagueId}`)

export const getAuction = (auctionId) =>
  api().get(`/api/v1/auctions/${auctionId}`)

export const createAuction = (data) =>
  api().post('/api/v1/auctions', data)

export const placeBid = (auctionId, data) =>
  api().post(`/api/v1/auctions/${auctionId}/bid`, data)

export const getWonAuctions = () =>
  api().get('/api/v1/auctions/won-auctions')

export const payAuction = (data) =>
  api().post('/api/v1/auctions/pay-auction', data)

// ── Trades ──
export const getTradesForTeam = (teamId) =>
  api().get(`/api/v1/trades/team/${teamId}`)

export const getTradeById = (tradeId) =>
  api().get(`/api/v1/trades/${tradeId}`)

export const proposeTrade = (data) =>
  api().post('/api/v1/trades/propose', data)

export const acceptTrade = (tradeId) =>
  api().post(`/api/v1/trades/accept/${tradeId}`)

export const rejectTrade = (tradeId) =>
  api().post(`/api/v1/trades/reject/${tradeId}`)

export const cancelTrade = (tradeId) =>
  api().post(`/api/v1/trades/cancel/${tradeId}`)

export const counterTrade = (tradeId, data) =>
  api().post(`/api/v1/trades/counter/${tradeId}`, data)

// ── Chat ──
export const getChatMessages = (leagueId) =>
  api().get(`/api/v1/chat/${leagueId}`)

export const sendChatMessage = (data) =>
  api().post('/api/v1/chat/send', data)

export const deleteChatMessage = (messageId) =>
  api().delete(`/api/v1/chat/${messageId}`)

// ── League ──
export const getLeague = (leagueId) =>
  api().get(`/api/v1/leagues/${leagueId}`)

export const getMyLeagues = () =>
  api().get('/api/v1/leagues/my-leagues')

export const getLeagueStandings = (leagueId) =>
  api().get(`/api/v1/leagues/standings/${leagueId}`)

export const getLeagueSchedule = (leagueId) =>
  api().get(`/api/v1/leagues/schedule/${leagueId}`)

// ── Profile / User ──
export const updateProfile = (data) =>
  api().put('/api/v1/users/update-profile', data)

export const updatePassword = (data) =>
  api().put('/api/v1/users/update-password', data)

// ── Loans ──
export const getTeamLoans = (teamId) =>
  api().get(`/api/v1/loans/team/${teamId}`)

export const offerLoan = (data) =>
  api().post('/api/v1/loans/offer', data)

export const acceptLoan = (loanId) =>
  api().post(`/api/v1/loans/${loanId}/accept`)

export const rejectLoan = (loanId) =>
  api().post(`/api/v1/loans/${loanId}/reject`)

// ── Notifications ──
export const getNotifications = () =>
  api().get('/api/v1/notifications')

export const markNotificationRead = (id) =>
  api().put(`/api/v1/notifications/read/${id}`)

export const markAllNotificationsRead = () =>
  api().put('/api/v1/notifications/read-all')

// ── CL Fantasy — Elimination & Auction (Manager-facing) ──
export const getCLEliminationStatus = (teamId) =>
  api().get(`/api/v1/cl-fantasy/team/${teamId}/elimination-status`)

export const dropEliminatedPlayer = (teamId, playerId) =>
  api().post(`/api/v1/cl-fantasy/team/${teamId}/drop-eliminated`, { playerId })

export const dropAllEliminatedPlayers = (teamId) =>
  api().post(`/api/v1/cl-fantasy/team/${teamId}/drop-all-eliminated`)

export const getCLAuctionWindow = (leagueId) =>
  api().get(`/api/v1/cl-fantasy/league/${leagueId}/auction-window`)

export const getCLFreeAgents = (leagueId, params) =>
  api().get(`/api/v1/cl-fantasy/league/${leagueId}/free-agents`, { params })

export const bidOnCLFreeAgent = (leagueId, data) =>
  api().post(`/api/v1/cl-fantasy/league/${leagueId}/bid`, data)
