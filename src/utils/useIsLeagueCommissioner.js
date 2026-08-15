import { useSelector } from 'react-redux'

/**
 * Commissioner detection helpers (NFL).
 *
 * Mirrors the canonical league-document check used by the Commissioner page
 * (src/pages/Comissioner/index.js): the current user is a commissioner of a
 * league when their id matches league.createdBy (head commissioner),
 * league.mainCommissioner, league.coComissioner, OR they appear in
 * league.leagueCommissioners[].
 *
 * `isCommissionerOfLeague(league, userId)` is a pure function so per-row
 * surfaces (e.g. Front Office "My Leagues") can reuse the exact same logic.
 */
export function isCommissionerOfLeague(league, userId) {
  const requesterId = String(userId || '')
  if (!requesterId || !league || typeof league !== 'object' || Array.isArray(league)) {
    return false
  }
  const ownerId = String(league.createdBy?._id || league.createdBy || '')
  const mainId = String(league.mainCommissioner?._id || league.mainCommissioner || '')
  const coId = String(league.coComissioner?._id || league.coComissioner || '')
  const leagueCommIds = (league.leagueCommissioners || []).map((c) => String(c?._id || c))
  return (
    (!!ownerId && requesterId === ownerId) ||
    (!!mainId && requesterId === mainId) ||
    (!!coId && requesterId === coId) ||
    leagueCommIds.includes(requesterId)
  )
}

/**
 * useIsLeagueCommissioner — returns true when the logged-in user is a
 * commissioner (or co-commissioner) of the CURRENTLY ACTIVE league AND has not
 * hidden their badge (team.hideCommissionerBadge). If the hide flag isn't in
 * the store on this surface it defaults to showing (undefined -> !undefined ->
 * true) — the standings + team-settings toggle handle the authoritative hide.
 */
export default function useIsLeagueCommissioner() {
  const userId = useSelector((s) => s.user?.userDetails?._id)
  const leagueFromState = useSelector((s) => s.league?.currentLeague)
  const leagueFromUser = useSelector((s) => s.user?.userDetails?.team?.currentLeague)
  const hideBadge = useSelector((s) => s.user?.userDetails?.team?.hideCommissionerBadge)

  // s.league.currentLeague starts life as [] — only trust it once it's a real
  // (non-array) league object, otherwise fall back to the user's team league.
  const league =
    leagueFromState && !Array.isArray(leagueFromState) ? leagueFromState : leagueFromUser

  return isCommissionerOfLeague(league, userId) && !hideBadge
}
