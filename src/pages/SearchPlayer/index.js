import React, { useEffect, useState, useMemo } from 'react'
import { Input, Pagination as AntPagination, Table, Select, Button, notification, Tooltip } from 'antd'

import moment from 'moment'
import { useSelector } from 'react-redux'

import PlayerDetailsModal from '../../components/modal/PlayerDetailsModal'

import { LiaSearchSolid } from 'react-icons/lia'
import { IoIosClose } from 'react-icons/io'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import Header from '../../components/Header'
import InjuryBadge from '../../components/InjuryBadge'
import useInjuryReport from '../../components/InjuryBadge/useInjuryReport'
import PositionComponent from './PositionComponent'
import { getAllPlayers } from '../../redux/actions/draftAction'
import { getPlayerForWeeklyScoring } from '../../redux'
import { createAuction } from '../../redux/actions/rosterAction'
import { useNavigate } from 'react-router-dom'
import { positions } from '../../config/constants'
import OnboardingGuide from '../../components/OnboardingGuide'
import '../../styles/pages/playerSearch2.css'

// ── Position color map (matches Draft page) ──
const POS_COLORS = {
  QB: '#EF4444', RB: '#3B82F6', WR: '#F59E0B', TE: '#22C55E',
  OL: '#8B5CF6', OT: '#8B5CF6', OG: '#8B5CF6', C: '#8B5CF6',
  DE: '#EC4899', DT: '#EC4899', DL: '#EC4899',
  LB: '#06B6D4', ILB: '#06B6D4', OLB: '#06B6D4',
  CB: '#F97316', S: '#14B8A6', FS: '#14B8A6', SS: '#14B8A6', DB: '#F97316',
  K: '#A78BFA', P: '#A78BFA', 'K/P': '#A78BFA', ST: '#A78BFA',
}

const getScoreColor = (score) => {
  if (!score || score === '-') return {}
  const val = Number(score)
  if (val >= 20) return { color: '#22C55E', fontWeight: 700 }
  if (val >= 15) return { color: '#4ADE80', fontWeight: 600 }
  if (val >= 10) return { color: '#86EFAC' }
  if (val >= 5) return { color: '#CBD5E1' }
  if (val > 0) return { color: '#94A3B8' }
  return { color: '#475569' }
}

const getCapColor = (capHit) => {
  if (!capHit || capHit <= 0) return '#22C55E'
  if (capHit >= 20_000_000) return '#EF4444'
  if (capHit >= 10_000_000) return '#F59E0B'
  return '#22C55E'
}

const getContractYrsColor = (yrs) => {
  if (!yrs || yrs === '-') return '#94A3B8'
  const n = Number(yrs)
  if (n >= 4) return '#22C55E'
  if (n >= 2) return '#F59E0B'
  return '#EF4444'
}

// The NFL season is named for the year it STARTS, and it starts in September.
// So until kickoff, the newest season with results in it is last year's.
const getCurrentNFLSeason = () => {
  const now = new Date()
  return now.getMonth() < 8 ? now.getFullYear() - 1 : now.getFullYear()
}

// The season about to be played. You want this for rookies, roster planning and
// depth charts — anything that legitimately looks forward. Never for scores.
const getUpcomingNFLSeason = () => {
  const now = new Date()
  return now.getMonth() < 8 ? now.getFullYear() : now.getFullYear() + 1
}

// A season with no games in it yet. You can browse it — you just can't have a
// score for it, because nobody has played.
export const seasonNotStarted = (yr) => Number(yr) > getCurrentNFLSeason()

// The dropdown goes up to the UPCOMING season, so 2026 is there for rookies and
// roster work. What it does NOT do is put a number in the points column for it.
//
// That was the actual bug: the page was summing weeklyScoring entries stamped
// 2026 and printing a TOTAL PTS for games nobody has played. Removing the year
// would have fixed the symptom and broken something you need. So the year stays
// and the fiction goes — an unplayed season shows "—", not a score.
const buildSeasonOptions = () => {
  const upcoming = getUpcomingNFLSeason()
  const options = []
  for (let yr = upcoming; yr >= 2023; yr--) {
    options.push({
      value: yr,
      label: seasonNotStarted(yr) ? `${yr} (upcoming)` : String(yr),
    })
  }
  return options
}
const SEASON_OPTIONS = buildSeasonOptions()

const SearchPlayer = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const userDetails = useSelector((state) => state?.user?.userDetails)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [loading, setLoading] = useState(true)
  const { getInjury } = useInjuryReport()
  const [auctionbtnloading, setAuctionBtnLoading] = useState(false)
  const [playerID, setPlayerID] = useState(false)
  const [data, setData] = useState([])
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [playerType, setPlayerType] = useState('ALL')
  // NFL season: Sep–Feb = that year, Mar–Aug = previous year
  const [year, setYear] = useState(getCurrentNFLSeason)
  const [week, setWeek] = useState(SETTING?.week)
  const [checkweek, setCheckWeek] = useState(SETTING?.week)
  const [totalCount, setTotalCount] = useState(0)
  const [emptyMessage, setEmptyMessage] = useState('')
  const navigate = useNavigate()



  function mapPosition(position) {
  return positions[position] || position;
}

  const weekOptions = Array.from({ length: 18 }, (_, index) => ({
    value: index + 1,
    label: `Week ${index + 1}`,
  }))

  const getData = async () => {
    const res = await getPlayerForWeeklyScoring({ page, position, playerType, search, year })
    setTotalCount(res?.total)
    setEmptyMessage(res?.message || '')

    return res?.players
  }


  const getWeeklyScoring = async () => {
    setLoading(true)
    let tempWeeks = []
    // for (let i = 1; i <= SETTING?.week; i++) {
    for (let i = 1; i <= 23; i++) {
      tempWeeks.push(i)
    }
    setWeek(tempWeeks)

    const res = await getData()


    let tempResultArr = []
    let regularpts = 0
    let weeksToConsider = 18
    let postpts = 0
    let postweek = 23
    let regularseasonpts = 0

    res?.map((item) => {

      let tempObj = {}

      tempWeeks.forEach((week) => {


        const filteredObj = item?.player?.weeklyScoring?.find(
          (wScore) =>
            Number(wScore?.week) === Number(week) && Number(wScore.season) === Number(year),
        )

        const formatValue = (value) => {
          return value !== undefined && value % 1 > 0 ? value.toFixed(2) : value
        }

        // const wScore = item?.player?.weeklyScoring?.find(
        //   (wScore) =>   Number(wScore.season) === Number(year)
        // );

        const filteredScoresForYear =
          item?.player?.weeklyScoring?.filter((wScore) => Number(wScore.season) === Number(year)) || []

        regularseasonpts = filteredScoresForYear.reduce((total, wScore) => {
          return total + (Number(wScore.score) || 0)
        }, 0)



        let filtersnaps;

         filtersnaps = item?.stats?.stats?.weeklySnapRatios?.find(
          (check) => Number(check?.week) === Number(week),
        )
        const filterWeek = item?.stats?.weeklyStats?.[week]


        const filterolweek = item?.stats?.olWeeklyStats?.[week]


        

        const DefensiveRatio = filtersnaps?.DefensiveRatio || 0
        const OffensiveRatio = filtersnaps?.OffensiveRatio || 0
        const SpecialTeamsRatio = filtersnaps?.SpecialTeamsRatio || 0

        // const RushingAttempts = filterweek?.RushingAttempts.toFixed(2) || 0

        // const RushingAttempts = filterWeek?.RushingAttempts?.toFixed(2) || '0';
        // const RushingAttempts = filterWeek?.RushingAttempts?.toFixed(2) || '0'
        // const RushingYards = filterWeek?.RushingYards?.toFixed(2) || '0'
        // const RushingTouchdowns = filterWeek?.RushingTouchdowns?.toFixed(2) || '0'

        // RECEIVING
        const ReceivingTargets = filterWeek?.ReceivingTargets?.toFixed(2) || '0'
        const ReceivingYards = filterWeek?.ReceivingYards?.toFixed(2) || '0'
        const ReceivingTouchdowns = filterWeek?.ReceivingTouchdowns?.toFixed(2) || '0'
        const Receptions = filterWeek?.Receptions?.toFixed(2) || '0'

        // PASSING
        const PassingAttempts = filterWeek?.PassingAttempts?.toFixed(2) || '0'
        const PassingYards = filterWeek?.PassingYards?.toFixed(2) || '0'
        const PassingTouchdowns = filterWeek?.PassingTouchdowns?.toFixed(2) || '0'
        const PassingSacks = filterWeek?.PassingSacks?.toFixed(2) || '0'
        const PassingCompletions = filterWeek?.PassingCompletions?.toFixed(2) || '0'

        // RETURN
        const PuntReturnYards = filterWeek?.PuntReturnYards?.toFixed(2) || '0'
        const PuntReturns = filterWeek?.PuntReturns?.toFixed(2) || '0'
        const KickReturnYards = filterWeek?.KickReturnYards?.toFixed(2) || '0'
        const KickReturns = filterWeek?.KickReturns?.toFixed(2) || '0'

        // DEFENDER STATS
        const DefensiveTouchdowns = filterWeek?.DefensiveTouchdowns?.toFixed(2) || '0'
        const Sacks = filterWeek?.Sacks?.toFixed(2) || '0'
        const QuarterbackHits = filterWeek?.QuarterbackHits?.toFixed(2) || '0'
        const SoloTackles = filterWeek?.SoloTackles?.toFixed(2) || '0'
        const TacklesForLoss = filterWeek?.TacklesForLoss?.toFixed(2) || '0'
        const FumblesForced = filterWeek?.FumblesForced?.toFixed(2) || '0'
        const Interceptions = filterWeek?.Interceptions?.toFixed(2) || '0'
        const PassesDefended = filterWeek?.PassesDefended?.toFixed(2) || '0'
        const FumblesRecovered = filterWeek?.FumblesRecovered?.toFixed(2) || '0'
        const SpecialTeamsTouchdowns = filterWeek?.SpecialTeamsTouchdowns?.toFixed(2) || '0'
        const FieldGoalsMade = filterWeek?.FieldGoalsMade?.toFixed(2) || '0'
        const Punts = filterWeek?.Punts?.toFixed(2) || '0'
        const PuntInside20 = filterWeek?.PuntInside20?.toFixed(2) || '0'
        const FieldGoalsAttempted = filterWeek?.FieldGoalsAttempted?.toFixed(2) || '0'
        const FieldGoalsMade0to19 = filterWeek?.FieldGoalsMade0to19?.toFixed(2) || '0'
        const FieldGoalsMade20to29 = filterWeek?.FieldGoalsMade20to29?.toFixed(2) || '0'
        const FieldGoalsMade30to39 = filterWeek?.FieldGoalsMade30to39?.toFixed(2) || '0'
        const FieldGoalsMade40to49 = filterWeek?.FieldGoalsMade40to49?.toFixed(2) || '0'
        const FieldGoalsMade50Plus = filterWeek?.FieldGoalsMade50Plus?.toFixed(2) || '0'
        const ExtraPointsMade = filterWeek?.ExtraPointsMade?.toFixed(2) || '0'
        const ExtraPointsAttempted = filterWeek?.ExtraPointsAttempted?.toFixed(2) || '0'
        const PuntYards = filterWeek?.PuntYards?.toFixed(2) || '0'
        const PuntsHadBlocked = filterWeek?.PuntsHadBlocked?.toFixed(2) || '0'

        // ol stats

        // const SNAPS= filterolweek?.totalSnap
        // ? (Number.isInteger(filterolweek?.totalSnap)
        //     ? filterolweek.totalSnap.toFixed(0)
        //     : filterolweek.totalSnap.toFixed(2)) + '%'
        // : '-'

        const OL_PassingTouchdowns = filterolweek?.PassingTouchdowns?.toFixed(2) || '0'
        const OL_RushingTouchdowns = filterolweek?.RushingTouchdowns?.toFixed(2) || '0'
        const OL_RushingYards = filterolweek?.RushingYards?.toFixed(2) || '0'
        const OL_TimesSacked = filterolweek?.TimesSacked?.toFixed(2) || '0'
        const OL_SACKSGIVENUP = 15 - (filterolweek?.TimesSacked || 0)

        const score = filteredObj?.score || 0

        if (week >= 1 && week <= weeksToConsider) {
          regularpts += score
        }

        if (week >= 1 && week <= postweek) {
          postpts += score
        }



if (week <=8){

        tempObj = {
          ...tempObj,
          [`week_${week}_score`]: score,
          [`week_${week}_DefensiveRatio`]: DefensiveRatio,
          [`week_${week}_OffensiveRatio`]: OffensiveRatio,
          [`week_${week}_SpecialTeamsRatio`]: SpecialTeamsRatio,
          // [`week_${week}_RushingAttempts`]: filterWeek?.RushingAttempts,
          // [`week_${week}_RushingYards`]: filterWeek?.RushingYards,
          // [`week_${week}_RushingTouchdowns`]: filterWeek?.RushingTouchdowns,

          [`week_${week}_RushingAttempts`]: formatValue(filterWeek?.RushingAttempts),
          [`week_${week}_RushingYards`]: formatValue(filterWeek?.RushingYards),
          [`week_${week}_RushingTouchdowns`]: formatValue(filterWeek?.RushingTouchdowns),

          // RECEIVING
          [`week_${week}_ReceivingTargets`]: formatValue(filterWeek?.ReceivingTargets),
          [`week_${week}_ReceivingYards`]: formatValue(filterWeek?.ReceivingYards),
          [`week_${week}_ReceivingTouchdowns`]: formatValue(filterWeek?.ReceivingTouchdowns),
          [`week_${week}_Receptions`]: formatValue(filterWeek?.Receptions),

          // PASSING
          [`week_${week}_PassingAttempts`]: formatValue(filterWeek?.PassingAttempts),
          [`week_${week}_PassingYards`]: formatValue(filterWeek?.PassingYards),
          // [`week_${week}_PassingTouchdowns`]: formatValue(filterWeek?.PassingTouchdowns?.toFixed(2),
          [`week_${week}_PassingSacks`]: formatValue(filterWeek?.PassingSacks),
          [`week_${week}_PassingCompletions`]: formatValue(filterWeek?.PassingCompletions),

          // RETURN
          [`week_${week}_PuntReturnYards`]: formatValue(filterWeek?.PuntReturnYards),
          [`week_${week}_PuntReturns`]: formatValue(filterWeek?.PuntReturns),
          [`week_${week}_KickReturnYards`]: formatValue(filterWeek?.KickReturnYards),
          [`week_${week}_KickReturns`]: formatValue(filterWeek?.KickReturns),

          // OL STATS



          [`week_${week}_PassingTouchdowns`]: formatValue(filterolweek?.PassingTouchdowns),
          [`week_${week}_RushingTouchdowns`]: formatValue(filterolweek?.RushingTouchdowns),
          [`week_${week}_TimesSacked`]: formatValue(filterolweek?.TimesSacked),
          [`week_${week}_RushingYards`]: formatValue(filterolweek?.RushingYards),

          // DEFENDER STATS
          [`week_${week}_DefensiveTouchdowns`]: formatValue(filterWeek?.DefensiveTouchdowns),
          [`week_${week}_Sacks`]: formatValue(filterWeek?.Sacks),
          [`week_${week}_QuarterbackHits`]: formatValue(filterWeek?.QuarterbackHits),
          [`week_${week}_SoloTackles`]: formatValue(filterWeek?.SoloTackles),
          [`week_${week}_TacklesForLoss`]: formatValue(filterWeek?.TacklesForLoss),
          [`week_${week}_FumblesForced`]: formatValue(filterWeek?.FumblesForced),
          [`week_${week}_Interceptions`]: formatValue(filterWeek?.Interceptions),
          [`week_${week}_PassesDefended`]: formatValue(filterWeek?.PassesDefended),
          [`week_${week}_FumblesRecovered`]: formatValue(filterWeek?.FumblesRecovered),
          [`week_${week}_SpecialTeamsTouchdowns`]: formatValue(filterWeek?.SpecialTeamsTouchdowns),
          [`week_${week}_FieldGoalsMade`]: formatValue(filterWeek?.FieldGoalsMade),
          [`week_${week}_Punts`]: formatValue(filterWeek?.Punts),
          [`week_${week}_PuntInside20`]: formatValue(filterWeek?.PuntInside20),
          [`week_${week}_FieldGoalsAttempted`]: formatValue(filterWeek?.FieldGoalsAttempted),
          [`week_${week}_FieldGoalsMade0to19`]: formatValue(filterWeek?.FieldGoalsMade0to19),
          [`week_${week}_FieldGoalsMade20to29`]: formatValue(filterWeek?.FieldGoalsMade20to29),
          [`week_${week}_FieldGoalsMade30to39`]: formatValue(filterWeek?.FieldGoalsMade30to39),
          [`week_${week}_FieldGoalsMade40to49`]: formatValue(filterWeek?.FieldGoalsMade40to49),
          [`week_${week}_FieldGoalsMade50Plus`]: formatValue(filterWeek?.FieldGoalsMade50Plus),
          [`week_${week}_ExtraPointsMade`]: formatValue(filterWeek?.ExtraPointsMade),
          [`week_${week}_ExtraPointsAttempted`]: formatValue(filterWeek?.ExtraPointsAttempted),
          [`week_${week}_PuntYards`]: formatValue(filterWeek?.PuntYards),
          [`week_${week}_PuntsHadBlocked`]: formatValue(filterWeek?.PuntsHadBlocked),

          week,
        }
      }

      else {
        tempObj = {
          ...tempObj,
          [`week_${week}_score`]: score,
          [`week_${week}_DefensiveRatio`]: DefensiveRatio,
          [`week_${week}_OffensiveRatio`]: OffensiveRatio,
          [`week_${week}_SpecialTeamsRatio`]: SpecialTeamsRatio,
          // [`week_${week}_RushingAttempts`]: filterWeek?.RushingAttempts,
          // [`week_${week}_RushingYards`]: filterWeek?.RushingYards,
          // [`week_${week}_RushingTouchdowns`]: filterWeek?.RushingTouchdowns,

          [`week_${week}_RushingAttempts`]: formatValue(filterWeek?.RushingAttempts),
          [`week_${week}_RushingYards`]: formatValue(filterWeek?.RushingYards),
          [`week_${week}_RushingTouchdowns`]: formatValue(filterWeek?.RushingTouchdowns),

          // RECEIVING
          [`week_${week}_ReceivingTargets`]: formatValue(filterWeek?.ReceivingTargets),
          [`week_${week}_ReceivingYards`]: formatValue(filterWeek?.ReceivingYards),
          [`week_${week}_ReceivingTouchdowns`]: formatValue(filterWeek?.ReceivingTouchdowns),
          [`week_${week}_Receptions`]: formatValue(filterWeek?.Receptions),

          // PASSING
          [`week_${week}_PassingAttempts`]: formatValue(filterWeek?.PassingAttempts),
          [`week_${week}_PassingYards`]: formatValue(filterWeek?.PassingYards),
          // [`week_${week}_PassingTouchdowns`]: formatValue(filterWeek?.PassingTouchdowns?.toFixed(2),
          [`week_${week}_PassingSacks`]: formatValue(filterWeek?.PassingSacks),
          [`week_${week}_PassingCompletions`]: formatValue(filterWeek?.PassingCompletions),

          // RETURN
          [`week_${week}_PuntReturnYards`]: formatValue(filterWeek?.PuntReturnYards),
          [`week_${week}_PuntReturns`]: formatValue(filterWeek?.PuntReturns),
          [`week_${week}_KickReturnYards`]: formatValue(filterWeek?.KickReturnYards),
          [`week_${week}_KickReturns`]: formatValue(filterWeek?.KickReturns),

          // OL STATS



          [`week_${week}_PassingTouchdowns`]: formatValue(filterWeek?.OL?.PassingTouchdowns),
          [`week_${week}_RushingTouchdowns`]: formatValue(filterWeek?.OL?.RushingTouchdowns),
          [`week_${week}_TimesSacked`]: formatValue(filterWeek?.OL?.TimesSacked),
          [`week_${week}_RushingYards`]: formatValue(filterWeek?.OL?.RushingYards),

          // DEFENDER STATS
          [`week_${week}_DefensiveTouchdowns`]: formatValue(filterWeek?.DefensiveTouchdowns),
          [`week_${week}_Sacks`]: formatValue(filterWeek?.Sacks),
          [`week_${week}_QuarterbackHits`]: formatValue(filterWeek?.QuarterbackHits),
          [`week_${week}_SoloTackles`]: formatValue(filterWeek?.SoloTackles),
          [`week_${week}_TacklesForLoss`]: formatValue(filterWeek?.TacklesForLoss),
          [`week_${week}_FumblesForced`]: formatValue(filterWeek?.FumblesForced),
          [`week_${week}_Interceptions`]: formatValue(filterWeek?.Interceptions),
          [`week_${week}_PassesDefended`]: formatValue(filterWeek?.PassesDefended),
          [`week_${week}_FumblesRecovered`]: formatValue(filterWeek?.FumblesRecovered),
          [`week_${week}_SpecialTeamsTouchdowns`]: formatValue(filterWeek?.SpecialTeamsTouchdowns),
          [`week_${week}_FieldGoalsMade`]: formatValue(filterWeek?.FieldGoalsMade),
          [`week_${week}_Punts`]: formatValue(filterWeek?.Punts),
          [`week_${week}_PuntInside20`]: formatValue(filterWeek?.PuntInside20),
          [`week_${week}_FieldGoalsAttempted`]: formatValue(filterWeek?.FieldGoalsAttempted),
          [`week_${week}_FieldGoalsMade0to19`]: formatValue(filterWeek?.FieldGoalsMade0to19),
          [`week_${week}_FieldGoalsMade20to29`]: formatValue(filterWeek?.FieldGoalsMade20to29),
          [`week_${week}_FieldGoalsMade30to39`]: formatValue(filterWeek?.FieldGoalsMade30to39),
          [`week_${week}_FieldGoalsMade40to49`]: formatValue(filterWeek?.FieldGoalsMade40to49),
          [`week_${week}_FieldGoalsMade50Plus`]: formatValue(filterWeek?.FieldGoalsMade50Plus),
          [`week_${week}_ExtraPointsMade`]: formatValue(filterWeek?.ExtraPointsMade),
          [`week_${week}_ExtraPointsAttempted`]: formatValue(filterWeek?.ExtraPointsAttempted),
          [`week_${week}_PuntYards`]: formatValue(filterWeek?.PuntYards),
          [`week_${week}_PuntsHadBlocked`]: formatValue(filterWeek?.PuntsHadBlocked),

          week,
        }

      }



      if (position !== 'OL') {
        tempObj = {
          ...tempObj,
          // [`week_${week}_RushingAttempts`]: filterWeek?.RushingAttempts?.toFixed(2),
          [`week_${week}_RushingAttempts`]:
            filterWeek?.RushingAttempts !== undefined && filterWeek.RushingAttempts % 1 > 0
              ? filterWeek.RushingAttempts.toFixed(2)
              : filterWeek?.RushingAttempts,

          // [`week_${week}_RushingYards`]: filterWeek?.RushingYards?.toFixed(2),
          // [`week_${week}_RushingTouchdowns`]: filterWeek?.RushingTouchdowns?.toFixed(2),
          // [`week_${week}_PassingTouchdowns`]: filterWeek?.PassingTouchdowns?.toFixed(2),

          [`week_${week}_RushingYards`]: formatValue(filterWeek?.RushingYards),
          [`week_${week}_RushingTouchdowns`]: formatValue(filterWeek?.RushingTouchdowns),
          [`week_${week}_PassingTouchdowns`]: formatValue(filterWeek?.PassingTouchdowns),
        }
      }
        
      })

      // Calculate average points if we have valid weeks
      let regularavgpts = weeksToConsider > 0 ? regularpts / weeksToConsider : 0
      let postavgpts = postweek > 0 ? postpts / postweek : 0

      // Add regularpts and regularavgpts to the tempObj
      tempObj = {
        ...tempObj,
        regularpts,
        regularavgpts,
        postpts,
        postavgpts,
        regularseasonpts,
      }



      // ── Accumulate season totals from all weeks ──
      let szn_RushAtt = 0, szn_RushYds = 0, szn_RushTD = 0
      let szn_RecTar = 0, szn_Rec = 0, szn_RecYds = 0, szn_RecTD = 0
      let szn_PassComp = 0, szn_PassAtt = 0, szn_PassYds = 0, szn_PassTD = 0, szn_PassINT = 0
      for (let w = 1; w <= 18; w++) {
        const ws = item?.stats?.weeklyStats?.[w]
        if (ws) {
          szn_RushAtt += ws.RushingAttempts || 0
          szn_RushYds += ws.RushingYards || 0
          szn_RushTD += ws.RushingTouchdowns || 0
          szn_RecTar += ws.ReceivingTargets || 0
          szn_Rec += ws.Receptions || 0
          szn_RecYds += ws.ReceivingYards || 0
          szn_RecTD += ws.ReceivingTouchdowns || 0
          szn_PassComp += ws.PassingCompletions || 0
          szn_PassAtt += ws.PassingAttempts || 0
          szn_PassYds += ws.PassingYards || 0
          szn_PassTD += ws.PassingTouchdowns || 0
          szn_PassINT += ws.PassingInterceptions || 0
        }
      }

      // ── Compute per-week % stats for each week ──
      tempWeeks.forEach((week) => {
        const ws = item?.stats?.weeklyStats?.[week]
        if (ws) {
          const compPct = ws.PassingAttempts > 0 ? ((ws.PassingCompletions / ws.PassingAttempts) * 100).toFixed(1) : '-'
          const ypc = ws.RushingAttempts > 0 ? (ws.RushingYards / ws.RushingAttempts).toFixed(1) : '-'
          const catchPct = ws.ReceivingTargets > 0 ? ((ws.Receptions / ws.ReceivingTargets) * 100).toFixed(1) : '-'
          tempObj = {
            ...tempObj,
            [`week_${week}_CompPct`]: compPct,
            [`week_${week}_YPC`]: ypc,
            [`week_${week}_CatchPct`]: catchPct,
          }
        }
      })

      // ── Season total % stats ──
      const szn_CompPct = szn_PassAtt > 0 ? ((szn_PassComp / szn_PassAtt) * 100).toFixed(1) : '-'
      const szn_YPC = szn_RushAtt > 0 ? (szn_RushYds / szn_RushAtt).toFixed(1) : '-'
      const szn_CatchPct = szn_RecTar > 0 ? ((szn_Rec / szn_RecTar) * 100).toFixed(1) : '-'

      tempObj = {
        ...tempObj,
        // Season totals
        szn_RushAtt, szn_RushYds, szn_RushTD,
        szn_RecTar, szn_Rec, szn_RecYds, szn_RecTD,
        szn_PassComp, szn_PassAtt, szn_PassYds, szn_PassTD, szn_PassINT,
        szn_CompPct, szn_YPC, szn_CatchPct,
        name: item?.player?.Name,
        PlayerID: item?.player?.PlayerID,
        apiSportsId: item?.player?.apiSportsId,
        HostedHeadshotNoBackgroundUrl: item?.player?.HostedHeadshotNoBackgroundUrl,
        // OTC position takes priority over API-Sports position
        position: item?.player?.otcPosition || item?.player?.Position,
        nflteam: item?.player?.Team,
        pf: item?.player?.pf?.toFixed(2),
        avgPf: item?.player?.avgPf?.toFixed(2),
        nflGamesPlayed: item?.player?.nflGamesPlayed,
        id: item?.player?._id,
        currentYearSalaryCap: item?.player?.currentYearSalaryCap,
        age: item?.player?.Age,
        caphit: item?.player?.currentYearSalaryCap,
        // OTC contract data
        otcCapHit: item?.player?.otcCapHit,
        otcBaseSalary: item?.player?.otcBaseSalary,
        otcTotalValue: item?.player?.otcTotalValue,
        otcTotalGuaranteed: item?.player?.otcTotalGuaranteed,
        otcAvgAnnualValue: item?.player?.otcAvgAnnualValue,
        otcContractYears: item?.player?.otcContractYears,
        otcFreeAgentYear: item?.player?.otcFreeAgentYear,
        yearsLeftSalaryCap: item?.player?.yearsLeftSalaryCap,
        nextYearSalaryCap: item?.player?.nextYearSalaryCap,
        contractInfo: item?.player?.contractInfo,
        post_season_pts: item?.stats?.post_season_pts,
        regular_season_pts: item?.stats?.regular_season_pts,
        teaminfo: item?.team?.team,
        // ── additive real-field extraction (undefined → rendered as "—") ──
        otcValuation: item?.player?.otcValuation,
        ByeWeek: item?.player?.ByeWeek,
        Height: item?.player?.Height,
        Weight: item?.player?.Weight,
        College: item?.player?.College,
        InjuryStatus: item?.player?.InjuryStatus,
        // regularseasonpts:

        // OL STATS

        SNAPS: item?.stats?.OL?.totalSnap
          ? (Number.isInteger(item?.stats?.OL?.totalSnap)
              ? item.stats.OL.totalSnap.toFixed(0)
              : item.stats.OL.totalSnap.toFixed(2)) + '%'
          : '-',

        OL_AVG_SNAP:
          item?.stats?.OL?.totalSnap && item?.stats?.OL?.NoOfWeeks
            ? (() => {
                const avgSnap = item.stats.OL.totalSnap / item.stats.OL.NoOfWeeks
                return avgSnap % 1 === 0 ? avgSnap.toFixed(0) + '%' : avgSnap.toFixed(2) + '%'
              })()
            : '-',

        OL_TotalTeamScore: item?.stats?.OL?.TotalTeamScore.toFixed(2),
      }

      tempResultArr.push(tempObj)
    })

    tempResultArr.sort((a, b) => {

      const aPoints = a.regular_season_pts || 0
      const bPoints = b.regular_season_pts || 0


      return bPoints - aPoints // Descending order
    })

    setData(tempResultArr)

    setLoading(false)
  }

  useEffect(() => {
    getWeeklyScoring()
  }, [page, position, playerType, search, year])

  // ══════════════════════════════════════════════════════════════
  //  SCOUTING REDESIGN — presentation layer only.
  //  All data logic above (getData / getWeeklyScoring / effects) is
  //  unchanged. Everything below is derived from the SAME real rows.
  // ══════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState('table')
  const [selectedId, setSelectedId] = useState(null)
  const [panelTab, setPanelTab] = useState('overview')
  const [compareId, setCompareId] = useState(null)
  const [teamFilter, setTeamFilter] = useState('ALL')
  const [clientFilter, setClientFilter] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [onlySaved, setOnlySaved] = useState(false)
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pls_saved') || '[]') } catch (e) { return [] }
  })

  const persistSaved = (next) => {
    setSaved(next)
    try { localStorage.setItem('pls_saved', JSON.stringify(next)) } catch (e) {}
  }
  const isSaved = (obj) => saved.includes(obj?.PlayerID)
  const toggleSaved = (obj) => {
    const id = obj?.PlayerID
    if (id === undefined || id === null) return
    persistSaved(isSaved(obj) ? saved.filter((x) => x !== id) : [...saved, id])
  }

  const HEAT = { none: '#1e2a3d', poor: '#ef4444', avg: '#f6c453', good: '#24d26c' }
  // Color each week RELATIVE to the player's own average (works across every
  // position incl. IDP/K). Weeks not played are neutral, not "poor".
  const heatColor = (score, played, avg) => {
    if (!played) return HEAT.none
    const v = Number(score) || 0
    if (v <= 0) return HEAT.none
    if (!avg || avg <= 0) return HEAT.avg
    const r = v / avg
    if (r >= 1.15) return HEAT.good
    if (r >= 0.75) return HEAT.avg
    return HEAT.poor
  }
  const playedAvg = (obj) => {
    const played = weeklyForm(obj).filter((x) => x.played)
    return played.length ? played.reduce((s, x) => s + x.score, 0) / played.length : 0
  }
  const REG_WEEKS = 18
  const weeklyForm = (obj) => {
    const arr = []
    for (let w = 1; w <= REG_WEEKS; w++) {
      const num = Number(obj?.[`week_${w}_score`]) || 0
      arr.push({ week: w, score: num, played: num > 0 })
    }
    return arr
  }
  const gamesPlayedOf = (obj) => weeklyForm(obj).filter((x) => x.played).length
  const totalPtsOf = (obj) => {
    if (seasonNotStarted(year)) return null
    const pts = Number(year) >= 2024 ? obj?.regularseasonpts : obj?.regular_season_pts
    return pts ? Number(pts) : 0
  }
  const ppgOf = (obj) => {
    if (seasonNotStarted(year)) return null
    const total = Number(year) >= 2024 ? (obj?.regularseasonpts || 0) : (obj?.regular_season_pts || 0)
    const gp = gamesPlayedOf(obj)
    return gp > 0 && total > 0 ? Number((total / gp).toFixed(2)) : 0
  }
  const lastNAvg = (obj, n) => {
    const played = weeklyForm(obj).filter((x) => x.played)
    if (!played.length) return null
    const last = played.slice(-n)
    return Number((last.reduce((s, x) => s + x.score, 0) / last.length).toFixed(1))
  }
  const trendOf = (obj) => {
    const played = weeklyForm(obj).filter((x) => x.played)
    if (played.length < 4) return 'flat'
    const recent = played.slice(-3)
    const prior = played.slice(-6, -3)
    if (!prior.length) return 'flat'
    const r = recent.reduce((s, x) => s + x.score, 0) / recent.length
    const p = prior.reduce((s, x) => s + x.score, 0) / prior.length
    if (r > p * 1.1) return 'up'
    if (r < p * 0.9) return 'down'
    return 'flat'
  }
  const money = (v) => {
    const n = Number(v)
    if (!n || n <= 0) return null
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
    return '$' + n
  }
  const marketValueOf = (obj) => obj?.otcValuation || obj?.otcTotalValue || obj?.otcAvgAnnualValue || null
  // Cap hit — prefer the OTC dollar cap hit (money-formatted); fall back to the
  // in-app SP salary cap. Null when neither is present (renders as a dash).
  const capHitOf = (obj) => {
    if (obj?.otcCapHit && Number(obj.otcCapHit) > 0) return money(obj.otcCapHit)
    if (obj?.caphit && Number(obj.caphit) > 0) return Number(obj.caphit).toLocaleString() + ' SP'
    return null
  }
  const ownerNameOf = (obj) => obj?.teaminfo?.name || null
  const isUnowned = (obj) => !obj?.teaminfo
  const canAuction = (obj) => isUnowned(obj) && Number(year) >= 2024 && !draftNotCompleted
  // Why a player can't be auctioned (null = can). Lets the button stay visible + disabled.
  const auctionReason = (obj) => {
    if (!isUnowned(obj)) return 'Owned player — only free agents can be auctioned'
    if (Number(year) < 2024) return 'Switch to the current season to auction'
    if (draftNotCompleted) return 'Auctions open once the league draft is completed'
    return null
  }
  const photoOf = (obj) => obj?.HostedHeadshotNoBackgroundUrl ||
    (obj?.apiSportsId ? 'https://media.api-sports.io/american-football/players/' + obj.apiSportsId + '.png' : null)
  const sumWeeks = (obj, key) => {
    let t = 0
    for (let w = 1; w <= REG_WEEKS; w++) t += Number(obj?.[`week_${w}_${key}`]) || 0
    return t
  }
  const GROUP_OF = (pos) => {
    const p = String(mapPosition(pos) || pos || '').toUpperCase()
    if (p === 'QB') return 'QB'
    if (['RB', 'FB', 'HB'].includes(p)) return 'RB'
    if (p === 'WR') return 'WR'
    if (p === 'TE') return 'TE'
    if (['OL', 'C', 'G', 'T', 'LT', 'RT', 'LG', 'RG', 'OT', 'OG', 'IOL'].includes(p)) return 'OL'
    if (['EDGE', 'DE', 'OLB'].includes(p)) return 'EDGE'
    if (['IDL', 'DT', 'NT', 'DL'].includes(p)) return 'IDL'
    if (['LB', 'ILB', 'MLB'].includes(p)) return 'LB'
    if (['CB', 'DB'].includes(p)) return 'CB'
    if (['S', 'FS', 'SS', 'SAF'].includes(p)) return 'S'
    if (['K', 'P', 'K/P', 'ST', 'LS'].includes(p)) return 'K'
    return 'OFF'
  }

  const teamOptions = useMemo(() => {
    // Full 32-team NFL list so every team is selectable, unioned with whatever
    // codes actually appear in the data (covers JAX/JAC, LV/LVR, WAS/WSH, etc.).
    const NFL_TEAMS = ['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS']
    const set = new Set(NFL_TEAMS)
    data.forEach((d) => { if (d?.nflteam) set.add(d.nflteam) })
    return [{ value: 'ALL', label: 'All NFL Teams' }].concat(
      Array.from(set).sort().map((t) => ({ value: t, label: t })))
  }, [data])

  // Hide the global "Report a Bug" button while the player panel is open (it
  // overlaps the panel's bottom actions).
  useEffect(() => {
    document.body.classList.toggle('pls-panel-open', !!selectedId)
    return () => document.body.classList.remove('pls-panel-open')
  }, [selectedId])

  const visibleData = useMemo(() => {
    let rows = data
    if (onlySaved) rows = rows.filter((d) => saved.includes(d?.PlayerID))
    if (teamFilter !== 'ALL') rows = rows.filter((d) => d?.nflteam === teamFilter)
    const q = (clientFilter || '').trim().toLowerCase()
    if (q) {
      rows = rows.filter((d) =>
        String(d?.name || '').toLowerCase().includes(q) ||
        String(d?.nflteam || '').toLowerCase().includes(q) ||
        String(mapPosition(d?.position) || '').toLowerCase().includes(q) ||
        String(d?.teaminfo?.name || '').toLowerCase().includes(q))
    }
    return rows
  }, [data, teamFilter, clientFilter, onlySaved, saved])

  const selectedPlayer = useMemo(
    () => data.find((d) => (d?.id || d?.PlayerID) === selectedId) || null,
    [data, selectedId])
  const comparePlayer = useMemo(
    () => data.find((d) => (d?.id || d?.PlayerID) === compareId) || null,
    [data, compareId])

  const rankOf = (obj) => {
    const idx = data.findIndex((d) => (d?.id || d?.PlayerID) === (obj?.id || obj?.PlayerID))
    return idx >= 0 ? idx + 1 + (page - 1) * limit : null
  }
  const posRankOf = (obj) => {
    const g = GROUP_OF(obj?.position)
    const peers = data.filter((d) => GROUP_OF(d?.position) === g)
    const idx = peers.findIndex((d) => (d?.id || d?.PlayerID) === (obj?.id || obj?.PlayerID))
    return idx >= 0 ? idx + 1 : null
  }
  const openPanel = (obj) => { setSelectedId(obj?.id || obj?.PlayerID); setPanelTab('overview'); setCompareId(null) }

  const PosBadge = (pos) => {
    const label = mapPosition(pos) || pos || '-'
    const c = POS_COLORS[label] || POS_COLORS[pos] || '#24d26c'
    return <span className='pls-pos-badge' style={{ color: c, borderColor: c + '55', background: c + '18' }}>{label}</span>
  }
  const HeatStrip = (obj, big) => {
    const avg = playedAvg(obj)
    return (
      <div className={big ? 'pls-heat pls-heat-lg' : 'pls-heat'}>
        {weeklyForm(obj).map((w) => (
          <span key={w.week}
            className={'pls-heat-cell' + (big && Number(checkweek) === w.week ? ' pls-heat-cell-focus' : '')}
            title={'Wk ' + w.week + ': ' + (w.played ? w.score.toFixed(1) : 'DNP')}
            style={{ background: heatColor(w.score, w.played, avg) }} />
        ))}
      </div>
    )
  }
  const TrendBadge = (obj) => {
    const t = trendOf(obj)
    const m = { up: ['▲', '#24d26c'], down: ['▼', '#ef4444'], flat: ['–', '#64748b'] }[t]
    return <span className='pls-trend' style={{ color: m[1] }}>{m[0]}</span>
  }
  const ContractCell = (obj) => {
    if (obj?.otcTotalValue && obj.otcTotalValue > 0) {
      const totalM = (obj.otcTotalValue / 1000000).toFixed(1)
      const yrsLeft = obj?.yearsLeftSalaryCap || obj?.otcContractYears || '-'
      const yrsColor = getContractYrsColor(yrsLeft)
      return (
        <div className='pls-contract'>
          <span className='pls-contract-v'>${totalM}M</span>
          <span className='pls-contract-y' style={{ color: yrsColor }}>{yrsLeft}yr left</span>
        </div>)
    }
    const capHit = obj?.caphit
    if (capHit && capHit > 0) return <span className='pls-cell-dim'>{Number(capHit).toLocaleString()} SP</span>
    return <span className='pls-cell-muted'>—</span>
  }
  const PlayerCell = (obj) => {
    const url = photoOf(obj)
    return (
      <div className='pls-playercell'>
        <button className='pls-avatar-btn' onClick={() => openPanel(obj)} title='Open scouting panel'>
          {url
            ? <img src={url} alt='' className='pls-avatar' onError={(e) => { e.target.style.visibility = 'hidden' }} />
            : <span className='pls-avatar pls-avatar-ph'><GiAmericanFootballPlayer size={15} /></span>}
        </button>
        <div className='pls-playercell-txt'>
          <PlayerDetailsModal
            button={<span className='fa_p_name name_text_hover pls-pname'> {obj?.name}</span>}
            state={{
              playerID: obj?.PlayerID,
              teamId: obj?.teaminfo?._id === userDetails?.team?._id ? null : obj?.teaminfo?._id,
              teamName: obj?.teaminfo?.name,
              teamLogo: null,
              isFreeAgent: { status: obj?.teaminfo ? false : true },
              isTeamRoster: { status: obj?.teaminfo?._id === userDetails?.team?._id ? false : true },
              isOwnRoster: { status: obj?.teaminfo?._id === userDetails?.team?._id ? true : false },
            }} />
          <span className='pls-pmeta'>
            {obj?.nflteam || '—'}{ownerNameOf(obj) ? ' · ' + ownerNameOf(obj) : ' · FA'}
            <InjuryBadge injury={getInjury(obj)} status={obj?.InjuryStatus} className='pls-inj' />
          </span>
        </div>
      </div>)
  }
  const cellText = (v) => (v === null || v === undefined || v === '' ? '—' : v)
  const StatCell = (v, cls) => <span className={cls || 'pls-cell-num'}>{cellText(v)}</span>
  const ActionsCell = (obj) => (
    <div className='pls-actions'>
      <button className='pls-icon-btn' title='View' onClick={() => openPanel(obj)}>{'\u{1F441}'}</button>
      <button className={'pls-icon-btn' + (isSaved(obj) ? ' pls-icon-btn-on' : '')} title='Save to shortlist'
        onClick={() => toggleSaved(obj)}>{isSaved(obj) ? '★' : '☆'}</button>
      {canAuction(obj) && (
        <Button loading={playerID === obj?.PlayerID} className='_button pls-auction-btn'
          onClick={() => handleCreateAuction(obj?.PlayerID, obj?.id, obj?.currentYearSalaryCap)}>Auction</Button>)}
    </div>)

  // Sort helpers: numbers (nulls last), strings (case-insensitive, nulls last).
  const numSort = (fn) => (a, b) => (Number(fn(a)) || -Infinity) - (Number(fn(b)) || -Infinity)
  const strSort = (fn) => (a, b) => String(fn(a) || '').localeCompare(String(fn(b) || ''))
  const TREND_RANK = { up: 2, flat: 1, down: 0 }

  const colPlayer = { title: 'PLAYER', key: 'name', fixed: 'left', width: 210, sorter: strSort((o) => o?.name), render: (_, o) => PlayerCell(o) }
  const colPos = { title: 'POS', key: 'position', width: 62, sorter: strSort((o) => o?.position), render: (_, o) => PosBadge(o?.position) }
  const colTeam = { title: 'NFL', key: 'nflteam', width: 58, sorter: strSort((o) => o?.nflteam), render: (_, o) => StatCell(o?.nflteam, 'pls-cell-dim') }
  const colAge = { title: 'AGE', key: 'age', width: 52, sorter: numSort((o) => o?.age), render: (_, o) => StatCell(o?.age, 'pls-cell-dim') }

  const tableColumns = [
    colPlayer, colPos, colTeam, colAge,
    { title: 'PPG', key: 'ppg', width: 64, sorter: numSort((o) => ppgOf(o)), render: (_, o) => { const v = ppgOf(o); return v === null ? StatCell(null) : <span style={getScoreColor(v)}>{v}</span> } },
    { title: 'TOTAL', key: 'total', width: 74, sorter: numSort((o) => totalPtsOf(o)), render: (_, o) => { const v = totalPtsOf(o); return v === null ? StatCell(null) : <span className='pls-cell-num pls-strong'>{v.toFixed(1)}</span> } },
    { title: 'TREND', key: 'trend', width: 58, sorter: (a, b) => (TREND_RANK[trendOf(a)] ?? -1) - (TREND_RANK[trendOf(b)] ?? -1), render: (_, o) => TrendBadge(o) },
    { title: 'WEEKLY FORM', key: 'form', width: 200, render: (_, o) => HeatStrip(o, false) },
    { title: 'CONTRACT', key: 'contract', width: 108, sorter: numSort((o) => o?.otcTotalValue), render: (_, o) => ContractCell(o) },
    { title: 'CAP HIT', key: 'capHit', width: 96, sorter: numSort((o) => Number(o?.otcCapHit) || Number(o?.caphit)), render: (_, o) => {
      const ch = capHitOf(o)
      if (!ch) return StatCell(null)
      const raw = Number(o?.otcCapHit) || Number(o?.caphit) || 0
      return <span className='pls-cell-num' style={{ color: getCapColor(raw), fontWeight: 700 }}>{ch}</span>
    } },
    { title: 'OWNER', key: 'owner', width: 110, sorter: strSort((o) => ownerNameOf(o)), render: (_, o) => StatCell(ownerNameOf(o), 'pls-cell-dim') },
    { title: 'ACTIONS', key: 'actions', width: 150, fixed: 'right', render: (_, o) => ActionsCell(o) },
  ]
  const weeklyColumns = [
    colPlayer, colPos, colTeam,
    { title: 'WEEKLY FANTASY POINTS (WK 1–18)', key: 'form', width: 400, render: (_, o) => HeatStrip(o, true) },
    { title: 'AVG', key: 'avg', width: 64, sorter: numSort((o) => ppgOf(o)), render: (_, o) => { const v = ppgOf(o); return v === null ? StatCell(null) : <span style={getScoreColor(v)}>{v}</span> } },
    { title: 'L3', key: 'l3', width: 56, sorter: numSort((o) => lastNAvg(o, 3)), render: (_, o) => StatCell(lastNAvg(o, 3)) },
    { title: 'BEST', key: 'best', width: 60, sorter: numSort((o) => { const p = weeklyForm(o).filter((x) => x.played); return p.length ? Math.max.apply(null, p.map((x) => x.score)) : null }), render: (_, o) => { const p = weeklyForm(o).filter((x) => x.played); const b = p.length ? Math.max.apply(null, p.map((x) => x.score)) : null; return StatCell(b === null ? null : b.toFixed(1)) } },
    { title: 'ACTIONS', key: 'actions', width: 140, fixed: 'right', render: (_, o) => ActionsCell(o) },
  ]
  const analyticsColumns = [
    colPlayer, colPos, colTeam,
    { title: 'FAN RANK', key: 'rank', width: 82, sorter: numSort((o) => rankOf(o)), render: (_, o) => { const r = rankOf(o); return StatCell(r ? '#' + r : null, 'pls-cell-num pls-strong') } },
    { title: 'POS RANK', key: 'prank', width: 84, sorter: numSort((o) => posRankOf(o)), render: (_, o) => { const pr = posRankOf(o); return StatCell(pr ? GROUP_OF(o?.position) + pr : null) } },
    { title: 'L3', key: 'l3', width: 56, sorter: numSort((o) => lastNAvg(o, 3)), render: (_, o) => StatCell(lastNAvg(o, 3)) },
    { title: 'L5', key: 'l5', width: 56, sorter: numSort((o) => lastNAvg(o, 5)), render: (_, o) => StatCell(lastNAvg(o, 5)) },
    { title: 'SEASON AVG', key: 'savg', width: 96, sorter: numSort((o) => ppgOf(o)), render: (_, o) => { const v = ppgOf(o); return v === null ? StatCell(null) : <span style={getScoreColor(v)}>{v}</span> } },
    { title: 'TOTAL', key: 'total', width: 74, sorter: numSort((o) => totalPtsOf(o)), render: (_, o) => { const v = totalPtsOf(o); return v === null ? StatCell(null) : <span className='pls-cell-num pls-strong'>{v.toFixed(1)}</span> } },
    { title: 'ACTIONS', key: 'actions', width: 140, fixed: 'right', render: (_, o) => ActionsCell(o) },
  ]
  const activeColumns = viewMode === 'weekly' ? weeklyColumns : viewMode === 'analytics' ? analyticsColumns : tableColumns

  const WeeklyBars = (obj) => {
    const wk = weeklyForm(obj)
    const avg = playedAvg(obj)
    const max = Math.max(1, Math.max.apply(null, wk.map((x) => x.score)))
    const W = 300, H = 92, pad = 4
    const bw = (W - pad * 2) / wk.length
    return (
      <svg viewBox={'0 0 ' + W + ' ' + H} className='pls-svg' preserveAspectRatio='none'>
        {wk.map((x, i) => {
          const h = x.played ? Math.max(2, (x.score / max) * (H - 22)) : 2
          return (
            <g key={x.week}>
              <rect x={pad + i * bw + 1} y={H - h - 14} width={bw - 2} height={h} rx='1.5' fill={heatColor(x.score, x.played, avg)}>
                <title>{'Week ' + x.week + ': ' + (x.played ? x.score.toFixed(1) + ' pts' : 'DNP')}</title>
              </rect>
              <text x={pad + i * bw + bw / 2} y={H - 3} className='pls-svg-lbl'>{x.week}</text>
            </g>)
        })}
      </svg>)
  }
  const ProductionDonut = (obj) => {
    const parts = [
      { k: 'Passing', v: Number(obj?.szn_PassYds) || 0, c: '#8b5cf6' },
      { k: 'Rushing', v: Number(obj?.szn_RushYds) || 0, c: '#24d26c' },
      { k: 'Receiving', v: Number(obj?.szn_RecYds) || 0, c: '#f6c453' },
    ].filter((p) => p.v > 0)
    const total = parts.reduce((s, p) => s + p.v, 0)
    if (!total) return null
    let acc = 0
    const R = 34, C = 2 * Math.PI * R
    return (
      <div className='pls-donut-wrap'>
        <svg viewBox='0 0 90 90' className='pls-donut'>
          <circle cx='45' cy='45' r={R} fill='none' stroke='#1e2a3d' strokeWidth='11' />
          {parts.map((p) => {
            const frac = p.v / total
            const dash = frac * C
            const el = (
              <circle key={p.k} cx='45' cy='45' r={R} fill='none' stroke={p.c} strokeWidth='11'
                strokeDasharray={dash + ' ' + (C - dash)} strokeDashoffset={-acc * C} transform='rotate(-90 45 45)'>
                <title>{p.k + ': ' + Math.round(p.v) + ' yds (' + Math.round(frac * 100) + '%)'}</title>
              </circle>)
            acc += frac
            return el
          })}
        </svg>
        <div className='pls-donut-legend'>
          {parts.map((p) => (
            <div key={p.k} className='pls-legend-row'>
              <span className='pls-legend-dot' style={{ background: p.c }} /><span>{p.k}</span><b>{Math.round(p.v)}</b>
            </div>))}
        </div>
      </div>)
  }
  const StatRow = (label, val) => (
    <div className='pls-stat-row' key={label}><span>{label}</span><b>{cellText(val)}</b></div>)
  const renderStats = (obj) => {
    const g = GROUP_OF(obj?.position)
    if (g === 'QB') {
      return (<div className='pls-stat-grid'>
        {StatRow('Completions', obj?.szn_PassComp || 0)}
        {StatRow('Attempts', obj?.szn_PassAtt || 0)}
        {StatRow('Comp %', obj?.szn_CompPct && obj.szn_CompPct !== '-' ? obj.szn_CompPct + '%' : '—')}
        {StatRow('Pass Yards', obj?.szn_PassYds || 0)}
        {StatRow('Pass TD', obj?.szn_PassTD || 0)}
        {StatRow('Interceptions', obj?.szn_PassINT || 0)}
        {StatRow('Rush Yards', obj?.szn_RushYds || 0)}
        {StatRow('Rush TD', obj?.szn_RushTD || 0)}
      </div>)
    }
    if (g === 'RB') {
      return (<div className='pls-stat-grid'>
        {StatRow('Rush Attempts', obj?.szn_RushAtt || 0)}
        {StatRow('Rush Yards', obj?.szn_RushYds || 0)}
        {StatRow('Yards / Carry', obj?.szn_YPC && obj.szn_YPC !== '-' ? obj.szn_YPC : '—')}
        {StatRow('Rush TD', obj?.szn_RushTD || 0)}
        {StatRow('Receptions', obj?.szn_Rec || 0)}
        {StatRow('Rec Yards', obj?.szn_RecYds || 0)}
        {StatRow('Rec TD', obj?.szn_RecTD || 0)}
      </div>)
    }
    if (g === 'WR' || g === 'TE') {
      return (<div className='pls-stat-grid'>
        {StatRow('Targets', obj?.szn_RecTar || 0)}
        {StatRow('Receptions', obj?.szn_Rec || 0)}
        {StatRow('Catch %', obj?.szn_CatchPct && obj.szn_CatchPct !== '-' ? obj.szn_CatchPct + '%' : '—')}
        {StatRow('Rec Yards', obj?.szn_RecYds || 0)}
        {StatRow('Rec TD', obj?.szn_RecTD || 0)}
        {StatRow('Rush Yards', obj?.szn_RushYds || 0)}
      </div>)
    }
    if (g === 'OL') {
      return (<div className='pls-stat-grid'>
        {StatRow('Total Snaps', obj?.SNAPS || '—')}
        {StatRow('Avg Snap %', obj?.OL_AVG_SNAP || '—')}
        {StatRow('Team Score', obj?.OL_TotalTeamScore || '—')}
        <div className='pls-idp-note'>Individual blocking grades (pressures allowed, run-block win rate) are not in the feed and are omitted.</div>
      </div>)
    }
    if (['EDGE', 'IDL', 'LB', 'CB', 'S'].includes(g)) {
      const tk = sumWeeks(obj, 'SoloTackles'), sk = sumWeeks(obj, 'Sacks'), tfl = sumWeeks(obj, 'TacklesForLoss'),
        ff = sumWeeks(obj, 'FumblesForced'), intc = sumWeeks(obj, 'Interceptions'), pbu = sumWeeks(obj, 'PassesDefended'),
        qbh = sumWeeks(obj, 'QuarterbackHits')
      const anyBox = tk + sk + tfl + ff + intc + pbu + qbh > 0
      if (!anyBox) {
        const tp = totalPtsOf(obj)
        return <div className='pls-empty-note'>Detailed IDP box-score stats are unavailable for this player. Fantasy points: <b>{tp === null ? '—' : tp.toFixed(1)}</b></div>
      }
      let rows = []
      if (g === 'LB') rows = [['Solo Tackles', tk], ['Sacks', sk], ['Tackles For Loss', tfl], ['Forced Fumbles', ff], ['Interceptions', intc], ['Pass Breakups', pbu]]
      else if (g === 'EDGE') rows = [['Sacks', sk], ['QB Hits', qbh], ['Tackles For Loss', tfl], ['Forced Fumbles', ff], ['Solo Tackles', tk]]
      else if (g === 'IDL') rows = [['Sacks', sk], ['QB Hits', qbh], ['Tackles For Loss', tfl], ['Solo Tackles', tk], ['Forced Fumbles', ff]]
      else if (g === 'CB') rows = [['Interceptions', intc], ['Pass Breakups', pbu], ['Solo Tackles', tk], ['Forced Fumbles', ff]]
      else rows = [['Solo Tackles', tk], ['Interceptions', intc], ['Pass Breakups', pbu], ['Tackles For Loss', tfl], ['Forced Fumbles', ff]]
      return (<div className='pls-stat-grid'>
        {rows.map((r) => StatRow(r[0], r[1]))}
        <div className='pls-idp-note'>IDP pressures, snap counts and coverage grades are not provided by the feed and are omitted.</div>
      </div>)
    }
    if (g === 'K') {
      return (<div className='pls-stat-grid'>
        {StatRow('FG Made', sumWeeks(obj, 'FieldGoalsMade'))}
        {StatRow('FG Attempted', sumWeeks(obj, 'FieldGoalsAttempted'))}
        {StatRow('XP Made', sumWeeks(obj, 'ExtraPointsMade'))}
        {StatRow('Punts', sumWeeks(obj, 'Punts'))}
        {StatRow('Punt Yards', sumWeeks(obj, 'PuntYards'))}
        {StatRow('Inside 20', sumWeeks(obj, 'PuntInside20'))}
      </div>)
    }
    const tp = totalPtsOf(obj)
    return <div className='pls-empty-note'>Detailed box-score stats unavailable. Fantasy points: <b>{tp === null ? '—' : tp.toFixed(1)}</b></div>
  }
  const renderContract = (obj) => (
    <div className='pls-stat-grid'>
      {StatRow('Years Remaining', obj?.yearsLeftSalaryCap || obj?.otcContractYears || '—')}
      {StatRow('This-Year Salary', money(obj?.otcBaseSalary) || money(obj?.currentYearSalaryCap) || '—')}
      {StatRow('Cap Hit', money(obj?.otcCapHit) || (obj?.caphit ? Number(obj.caphit).toLocaleString() + ' SP' : '—'))}
      {StatRow('Next-Year Cap', money(obj?.nextYearSalaryCap) || '—')}
      {StatRow('Total Value', money(obj?.otcTotalValue) || '—')}
      {StatRow('Avg / Year', money(obj?.otcAvgAnnualValue) || '—')}
      {StatRow('Guaranteed', money(obj?.otcTotalGuaranteed) || '—')}
      {StatRow('Market Value', money(marketValueOf(obj)) || '—')}
      {StatRow('Free-Agent Year', obj?.otcFreeAgentYear || '—')}
      {StatRow('Owner', ownerNameOf(obj) || 'Free Agent')}
      {StatRow('Dead Cap', '—')}
    </div>)
  const renderOverview = (obj) => {
    const rank = rankOf(obj)
    const total = totalPtsOf(obj)
    const ppg = ppgOf(obj)
    const recent = weeklyForm(obj).filter((x) => x.played).slice(-5).reverse()
    const donut = ProductionDonut(obj)
    return (
      <div>
        <div className='pls-ov-stats'>
          <div className='pls-ov-stat'><span>FANTASY RANK</span><b>{rank ? '#' + rank : '—'}</b></div>
          <div className='pls-ov-stat'><span>TOTAL PTS</span><b>{total === null ? '—' : total.toFixed(1)}</b></div>
          <div className='pls-ov-stat'><span>PPG</span><b>{ppg === null ? '—' : ppg}</b></div>
          <div className='pls-ov-stat'><span>GAMES</span><b>{gamesPlayedOf(obj) || '—'}</b></div>
        </div>
        <div className='pls-panel-sec'>
          <div className='pls-sec-head'>WEEKLY FANTASY POINTS {TrendBadge(obj)}</div>
          {WeeklyBars(obj)}
        </div>
        {donut && (<div className='pls-panel-sec'><div className='pls-sec-head'>PRODUCTION MIX (YARDS)</div>{donut}</div>)}
        <div className='pls-panel-sec'>
          <div className='pls-sec-head'>RECENT 5 GAMES</div>
          {recent.length ? (
            <div className='pls-recent'>
              {recent.map((x) => (<div key={x.week} className='pls-recent-row'><span>Week {x.week}</span><b style={getScoreColor(x.score)}>{x.score.toFixed(1)}</b></div>))}
            </div>) : <div className='pls-empty-note'>No games played in {String(year)} yet.</div>}
        </div>
      </div>)
  }
  const cmpFmt = (v) => (v === null || v === undefined || v === '' ? '—' : (typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(1)) : v))
  const renderCompare = (a, b) => {
    const rows = [
      ['PPG', ppgOf(a), ppgOf(b)],
      ['Total Pts', totalPtsOf(a), totalPtsOf(b)],
      ['Last 3 Avg', lastNAvg(a, 3), lastNAvg(b, 3)],
      ['Last 5 Avg', lastNAvg(a, 5), lastNAvg(b, 5)],
      ['Games', gamesPlayedOf(a), gamesPlayedOf(b)],
      ['Market', money(marketValueOf(a)), money(marketValueOf(b))],
      ['Age', a?.age, b?.age],
    ]
    return (
      <div className='pls-compare'>
        <div className='pls-compare-head'><div>{a?.name}</div><div className='pls-vs'>VS</div><div>{b?.name}</div></div>
        {rows.map((row) => {
          const x = row[1], y = row[2]
          const nx = typeof x === 'number' ? x : -Infinity, ny = typeof y === 'number' ? y : -Infinity
          return (<div key={row[0]} className='pls-compare-row'>
            <b className={nx > ny ? 'pls-win' : ''}>{cmpFmt(x)}</b><span>{row[0]}</span><b className={ny > nx ? 'pls-win' : ''}>{cmpFmt(y)}</b>
          </div>)
        })}
      </div>)
  }

  const actionCards = [
    { key: 'auction', label: 'Auction Players', sub: 'Open auction room', color: '#f6c453', onClick: () => navigate('/player-auction') },
    { key: 'trade', label: 'Trade Center', sub: 'Build a trade', color: '#8b5cf6', onClick: () => navigate('/team-trade') },
    { key: 'shortlist', label: 'My Shortlist', sub: saved.length ? saved.length + ' saved' : 'Saved players', color: '#24d26c', onClick: () => setOnlySaved((v) => !v), active: onlySaved },
    { key: 'draft', label: 'Draft Board', sub: 'Rookie draft', color: '#3b82f6', onClick: () => navigate('/rookie-draft') },
    { key: 'fa', label: 'Free Agents', sub: 'Available players', color: '#22d3ee', onClick: () => { setPlayerType('FreeAgents'); setPage(1) }, active: playerType === 'FreeAgents' },
  ]

  const handlePagination = (val) => setPage(val)

  const onFieldClear = () => {
    setSearch('')
  }

  const handleCreateAuction = async (playerID, player_id, CapHit) => {
    setAuctionBtnLoading(true)


    if (sampoints < CapHit) {
      notification.error({
        message: `Bid amount ${CapHit} exceeds your available points of ${sampoints}.`,
        duration: 4,
      })
      return
    }

    setPlayerID(playerID)
    const res = await createAuction({
      PlayerID: playerID,
      player_id: player_id,
      auctionFrom: 'nonowner',
      // CapHit: CapHit === 0 ? 50000 : CapHit,
      CapHit: CapHit === 0 ? 1 : CapHit === undefined ? 1 : CapHit,
    })

    if (res) {
      setAuctionBtnLoading(false)
      navigate('/player-auction')
    }

    setPlayerID('')
  }

  return (
    <div className='sp-container pls-root'>
      <Header />

      <OnboardingGuide tabKey="search" />

      <div className={'pls-shell' + (selectedPlayer ? ' pls-shell-open' : '')}>
        <div className='pls-main'>
          {/* ── Page header ── */}
          <div className='pls-pagehead'>
            <h1 className='pls-title'>PLAYER <span>SCOUTING</span></h1>
            <p className='pls-subtitle'>Premium scouting database · {totalCount} players</p>
          </div>

          {/* ── Top action cards ── */}
          <div className='pls-cards'>
            {actionCards.map((c) => (
              <button key={c.key} className={'pls-card' + (c.active ? ' pls-card-active' : '')} style={{ '--c': c.color }} onClick={c.onClick}>
                <span className='pls-card-bar' />
                <span className='pls-card-label'>{c.label}</span>
                <span className='pls-card-sub'>{c.sub}</span>
              </button>))}
          </div>

          {/* ── Sticky search + filters ── */}
          <div className='pls-toolbar'>
            <div className='pls-search'>
              <LiaSearchSolid size={17} className='pls-search-ico' />
              <Input
                value={search}
                className='pls-search-input'
                placeholder='Search players by name…'
                onChange={(e) => { setSearch(e.target.value); if (e.target.value === '') onFieldClear() }}
                allowClear={{ clearIcon: <IoIosClose size={20} style={{ color: '#24d26c' }} /> }} />
            </div>
            <Select value={teamFilter} style={{ width: 150 }} onChange={setTeamFilter} options={teamOptions} />
            <Select
              value={playerType}
              style={{ width: 150 }}
              onChange={(val) => { setPlayerType(val); setPage(1) }}
              options={[
                { value: 'All', label: 'All Players' },
                { value: 'FreeAgents', label: 'Free Agents' },
                { value: 'Rookie', label: 'Rookies' },
              ]} />
            <Select value={year} style={{ width: 120 }} onChange={(val) => setYear(val)} options={SEASON_OPTIONS} />
            {viewMode === 'weekly' && (
              <Select value={checkweek} style={{ width: 110 }} onChange={(val) => setCheckWeek(val)} options={weekOptions} />)}
            <button className={'pls-filter-btn' + (showAdvanced ? ' pls-filter-btn-on' : '')} onClick={() => setShowAdvanced((v) => !v)}>Filters</button>
            <button
              className='pls-reset-btn'
              onClick={() => {
                setSearch(''); setPosition('ALL'); setPlayerType('All'); setTeamFilter('ALL')
                setClientFilter(''); setYear(getCurrentNFLSeason()); setOnlySaved(false); setPage(1)
              }}>Reset</button>
            <div className='pls-results'><span>{totalCount}</span> found</div>
          </div>

          {showAdvanced && (
            <div className='pls-advanced'>
              <Input
                value={clientFilter}
                className='pls-adv-input'
                placeholder='Quick client filter — name / team / position / owner (this page)…'
                onChange={(e) => setClientFilter(e.target.value)}
                allowClear />
              <span className='pls-adv-note'>Client refine over the loaded page. Only fields present in the feed are filterable — projected points, boom/bust, snap % and news are not provided and are omitted.</span>
            </div>)}

          {/* ── Position pills (reuses existing PositionComponent → search param) ── */}
          <div className='pls-pos-wrap'>
            <PositionComponent position={position} setPosition={setPosition} playerType={playerType} setPlayerType={setPlayerType} />
          </div>

          {/* ── View mode tabs ── */}
          <div className='pls-tabs'>
            {[['table', 'Table View'], ['weekly', 'Weekly View'], ['analytics', 'Analytics View']].map((v) => (
              <button key={v[0]} className={'pls-tab' + (viewMode === v[0] ? ' pls-tab-active' : '')} onClick={() => setViewMode(v[0])}>{v[1]}</button>))}

            {viewMode !== 'analytics' && (
              <div className='pls-heat-legend' title='Each week is colored vs the player’s own average'>
                <span className='pls-legend-label'>Weekly form:</span>
                <span className='pls-legend-item'><i className='pls-legend-sw' style={{ background: HEAT.good }} />Above avg</span>
                <span className='pls-legend-item'><i className='pls-legend-sw' style={{ background: HEAT.avg }} />Around avg</span>
                <span className='pls-legend-item'><i className='pls-legend-sw' style={{ background: HEAT.poor }} />Below avg</span>
                <span className='pls-legend-item'><i className='pls-legend-sw' style={{ background: HEAT.none }} />Didn’t play</span>
              </div>
            )}

            <span className='pls-tab-count'>{visibleData.length} shown</span>
          </div>

          {/* ── Table / skeleton ── */}
          <div className='pls-table-wrap'>
            {loading ? (
              <div className='pls-skeleton'>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className='pls-skel-row'>
                    <span className='pls-skel pls-skel-av' />
                    <span className='pls-skel pls-skel-line' />
                    <span className='pls-skel pls-skel-line short' />
                    <span className='pls-skel pls-skel-line' />
                    <span className='pls-skel pls-skel-line short' />
                  </div>))}
              </div>
            ) : (
              <Table
                dataSource={visibleData}
                columns={activeColumns}
                bordered={false}
                pagination={false}
                scroll={{ x: 1100 }}
                rowKey={(record, index) => record?.id || record?.PlayerID || index}
                rowClassName={(record) => (selectedId && (record?.id || record?.PlayerID) === selectedId ? 'pls-row-active' : '')}
                locale={{ emptyText: (<div className='pls-empty'>{emptyMessage || 'No players match your filters.'}</div>) }} />)}
          </div>

          {/* ── Pagination (preserved) ── */}
          <div className='sp-pagination pls-pagination'>
            <AntPagination
              current={page}
              total={totalCount}
              showSizeChanger={false}
              onChange={handlePagination}
              pageSize={limit} />
          </div>
        </div>

        {/* ── Right scouting panel ── */}
        {selectedPlayer && (
          <aside className='pls-panel'>
            <button className='pls-panel-close' onClick={() => setSelectedId(null)} title='Close'>✕</button>
            <div className='pls-panel-hero'>
              {photoOf(selectedPlayer)
                ? <img src={photoOf(selectedPlayer)} alt='' className='pls-panel-photo' onError={(e) => { e.target.style.visibility = 'hidden' }} />
                : <span className='pls-panel-photo pls-avatar-ph'><GiAmericanFootballPlayer size={30} /></span>}
              <div className='pls-panel-id'>
                <div className='pls-panel-name'>{selectedPlayer?.name}</div>
                <div className='pls-panel-tags'>{PosBadge(selectedPlayer?.position)}<span className='pls-cell-dim'>{selectedPlayer?.nflteam || '—'}</span></div>
                <div className='pls-panel-vitals'>
                  <span>AGE {selectedPlayer?.age || '—'}</span>
                  <span>HT {selectedPlayer?.Height || '—'}</span>
                  <span>WT {selectedPlayer?.Weight || '—'}</span>
                  <span>BYE {selectedPlayer?.ByeWeek || '—'}</span>
                </div>
              </div>
            </div>

            <div className='pls-panel-kpis'>
              <div><span>PPG</span><b>{ppgOf(selectedPlayer) === null ? '—' : ppgOf(selectedPlayer)}</b></div>
              <div><span>TOTAL</span><b>{totalPtsOf(selectedPlayer) === null ? '—' : totalPtsOf(selectedPlayer).toFixed(1)}</b></div>
              <div><span>RANK</span><b>{rankOf(selectedPlayer) ? '#' + rankOf(selectedPlayer) : '—'}</b></div>
              <div><span>STATUS</span><b>{selectedPlayer?.InjuryStatus || 'Active'}</b></div>
            </div>

            <div className='pls-panel-tabs'>
              {[['overview', 'Overview'], ['stats', 'Stats'], ['contract', 'Contract'], ['news', 'News']].map((t) => (
                <button key={t[0]} className={'pls-ptab' + (panelTab === t[0] ? ' pls-ptab-active' : '')} onClick={() => setPanelTab(t[0])}>{t[1]}</button>))}
            </div>

            <div className='pls-panel-body'>
              {compareId && comparePlayer ? renderCompare(selectedPlayer, comparePlayer) : (
                <>
                  {panelTab === 'overview' && renderOverview(selectedPlayer)}
                  {panelTab === 'stats' && renderStats(selectedPlayer)}
                  {panelTab === 'contract' && renderContract(selectedPlayer)}
                  {panelTab === 'news' && (
                    <div className='pls-empty-note pls-news-empty'>No recent news is available for {selectedPlayer?.name}. Player news is not part of the search feed.</div>)}
                </>)}
            </div>

            <div className='pls-panel-compare'>
              <span>Compare</span>
              <Select
                size='small'
                value={compareId}
                placeholder='Select a player…'
                style={{ flex: 1 }}
                allowClear
                showSearch
                optionFilterProp='label'
                onChange={(v) => setCompareId(v)}
                options={visibleData.filter((d) => (d?.id || d?.PlayerID) !== selectedId).map((d) => ({ value: d?.id || d?.PlayerID, label: d?.name }))} />
            </div>

            <div className='pls-panel-actions'>
              <button className={'pls-pbtn' + (isSaved(selectedPlayer) ? ' pls-pbtn-on' : '')} onClick={() => toggleSaved(selectedPlayer)}>{isSaved(selectedPlayer) ? '★ Watchlisted' : '☆ Watchlist'}</button>
              <button className='pls-pbtn' onClick={() => navigate('/team-trade', { state: { playerID: selectedPlayer?.PlayerID, player_id: selectedPlayer?.id } })}>Trade For</button>
              {(() => {
                const reason = auctionReason(selectedPlayer)
                const busy = playerID === selectedPlayer?.PlayerID
                return (
                  <button
                    className='pls-pbtn pls-pbtn-primary'
                    disabled={!!reason || busy}
                    title={reason || 'List this player in the auction room'}
                    onClick={() => { if (!reason) handleCreateAuction(selectedPlayer?.PlayerID, selectedPlayer?.id, selectedPlayer?.currentYearSalaryCap) }}
                  >
                    {busy ? 'Adding…' : 'Add to Auction'}
                  </button>
                )
              })()}
            </div>
          </aside>)}
      </div>
    </div>
  )
}

export default SearchPlayer
