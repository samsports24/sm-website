import { soccerAPI, soccerPublicAPI, attachSoccerToken } from '../config/constants'

const api = () => {
  attachSoccerToken()
  return soccerAPI
}

// ── Public (no auth) ──
export const getActiveQuiz = (league, lang) =>
  soccerPublicAPI.get(`/api/v1/quiz/active/${league}`, { params: { lang } })

export const getLeaderboard = (league, userId) =>
  soccerPublicAPI.get(`/api/v1/quiz/leaderboard/${league}`, { params: { userId } })

// ── Authenticated ──
export const startQuiz = (quizId, lang) =>
  api().post(`/api/v1/quiz/start/${quizId}`, {}, { params: { lang } })

export const submitAnswer = (quizId, questionNumber, selectedAnswer, timeSpentMs, lang) =>
  api().post(`/api/v1/quiz/answer/${quizId}`, { questionNumber, selectedAnswer, timeSpentMs }, { params: { lang } })

export const getQuizResult = (quizId) =>
  api().get(`/api/v1/quiz/result/${quizId}`)

export const getMyHistory = (league, limit = 20) =>
  api().get('/api/v1/quiz/my-history', { params: { league, limit } })
