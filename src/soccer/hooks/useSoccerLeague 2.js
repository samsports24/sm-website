import { useSelector } from 'react-redux'
import { REAL_LEAGUES } from '../config/constants'

/**
 * Hook that provides the current soccer league context.
 * Every soccer page should use this to get league info, branding, and rules.
 *
 * Returns:
 *   league       , the full league document from Redux (or null)
 *   realLeague   , the real league key (e.g., "premier_league")
 *   leagueInfo   , display info from REAL_LEAGUES config (name, flag, color)
 *   team         , the user's team in this league
 *   isCommissioner, whether the current user is the commissioner
 *   season       , current season string
 *   matchweek    , current matchweek number
 */
const useSoccerLeague = () => {
  const user = useSelector((state) => state.user?.userDetails)
  const league = useSelector((state) => state.soccerLeague?.currentLeague) || null
  const team = useSelector((state) => state.soccerTeam?.currentTeam) || null

  const realLeague = league?.realLeague || null
  const leagueInfo = realLeague ? REAL_LEAGUES[realLeague] : null

  const userId = user?._id ? String(user._id) : null
  const isCommissioner =
    (league?.commissioner && userId && String(league.commissioner) === userId) ||
    (league?.commissioner?._id && userId && String(league.commissioner._id) === userId) ||
    league?.coCommissioners?.some(c => String(c) === userId || String(c?._id) === userId) ||
    false

  return {
    league,
    realLeague,
    leagueInfo,
    leagueName: league?.name || leagueInfo?.name || 'Soccer League',
    leagueFlag: leagueInfo?.flag || '',
    leagueColor: leagueInfo?.color || '#4CAF50',
    team,
    teamName: team?.name || 'My Team',
    isCommissioner,
    season: league?.season || '2025-26',
    matchweek: league?.currentMatchweek || 1,
    salaryCap: league?.salaryCap || 200000000,
    user,
  }
}

export default useSoccerLeague
