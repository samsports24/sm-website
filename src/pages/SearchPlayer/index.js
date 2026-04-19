import React, { useEffect, useState } from 'react'
import { Input, Pagination as AntPagination, Table, Select, Button, notification, Tooltip } from 'antd'

import moment from 'moment'
import { useSelector } from 'react-redux'

import PlayerDetailsModal from '../../components/modal/PlayerDetailsModal'

import { LiaSearchSolid } from 'react-icons/lia'
import { IoIosClose } from 'react-icons/io'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import Header from '../../components/Header'
import PositionComponent from './PositionComponent'
import { getAllPlayers } from '../../redux/actions/draftAction'
import { getPlayerForWeeklyScoring } from '../../redux'
import { createAuction } from '../../redux/actions/rosterAction'
import { useNavigate } from 'react-router-dom'
import { positions } from '../../config/constants'
import OnboardingGuide from '../../components/OnboardingGuide'

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

const SearchPlayer = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const userDetails = useSelector((state) => state?.user?.userDetails)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [loading, setLoading] = useState(true)
  const [auctionbtnloading, setAuctionBtnLoading] = useState(false)
  const [playerID, setPlayerID] = useState(false)
  const [data, setData] = useState([])
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [playerType, setPlayerType] = useState('ALL')
  const [year, setYear] = useState(Number(moment().format('YYYY')))
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

  const getColumns = (position) => {

    const columns = [
      {
        width: 30,
        title: 'POS',
        dataIndex: 'position',
        key: 'position',
        render: (_, obj) => {
          const pos = mapPosition(obj?.position) || '-'
          const posColor = POS_COLORS[pos] || POS_COLORS[obj?.position] || '#22C55E'
          return (
            <div style={{
              border: `1px solid ${posColor}33`,
              borderRadius: 4,
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 22,
              paddingInline: 6,
              background: `${posColor}10`,
            }}>
              <p style={{ color: posColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, margin: 0 }}>{pos}</p>
            </div>
          )
        },
      },

      {
        width: 50,
        title: 'PLAYER NAME',
        dataIndex: 'Name',
        key: 'Name',
        render: (_, obj) => {
          const photoUrl = obj?.HostedHeadshotNoBackgroundUrl ||
            (obj?.apiSportsId ? `https://media.api-sports.io/american-football/players/${obj.apiSportsId}.png` : null)
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt=""
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(10, 15, 26, 0.5)',
                    flexShrink: 0,
                  }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }}
                />
              ) : null}
              {photoUrl ? (
                <div style={{ display: 'none', width: 26, height: 26, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1.5px solid rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GiAmericanFootballPlayer size={14} style={{ color: 'rgba(34, 197, 94, 0.5)' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', width: 26, height: 26, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1.5px solid rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GiAmericanFootballPlayer size={14} style={{ color: 'rgba(34, 197, 94, 0.5)' }} />
                </div>
              )}
              <PlayerDetailsModal
                button={<span className='fa_p_name name_text_hover'> {obj?.name}</span>}
                state={{
                  playerID: obj?.PlayerID,
                  teamId: obj?.teaminfo?._id === userDetails?.team?._id ? null : obj?.teaminfo?._id,
                  teamName: obj?.teaminfo?.name,
                  teamLogo: null,
                  isFreeAgent: {
                    status: obj?.teaminfo ? false : true,
                  },
                  isTeamRoster: {
                    status: obj?.teaminfo?._id === userDetails?.team?._id ? false : true,
                  },
                  isOwnRoster: {
                    status: obj?.teaminfo?._id === userDetails?.team?._id ? true : false,
                  },
                }}
              />
            </div>
          )
        },
      },
      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>AGE</p>,
        dataIndex: 'age',
        key: 'age',
        render: (_, obj) => <p>{obj?.age || '-'}</p>,
      },
      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>pro team</p>,
        dataIndex: 'nflteam',
        key: 'nflteam',
        render: (_, obj) => <p>{obj?.nflteam || '-'}</p>,
      },

      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>CAP HIT</p>,
        dataIndex: 'caphit',
        key: 'caphit',
        render: (_, obj) => {
          if (obj?.otcCapHit && obj.otcCapHit > 0) {
            const millions = (obj.otcCapHit / 1_000_000).toFixed(1)
            const capColor = getCapColor(obj.otcCapHit)
            return (
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: capColor }}>${millions}M</p>
                <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{`${(obj?.caphit || 0).toLocaleString()} SP`}</p>
              </div>
            )
          }
          return <p style={{ color: '#94A3B8' }}>{`${(obj?.caphit || '-').toLocaleString()} SP`}</p>
        },
      },
      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>CONTRACT</p>,
        dataIndex: 'contractInfo',
        key: 'contractInfo',
        render: (_, obj) => {
          if (obj?.otcTotalValue && obj.otcTotalValue > 0) {
            const totalM = (obj.otcTotalValue / 1_000_000).toFixed(1)
            const yrsLeft = obj?.yearsLeftSalaryCap || obj?.otcContractYears || '-'
            const yrsColor = getContractYrsColor(yrsLeft)
            return (
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#E2E8F0' }}>${totalM}M</p>
                <p style={{ margin: 0, fontSize: 9 }}>
                  <span style={{ color: yrsColor, fontWeight: 600 }}>{yrsLeft}yr left</span>
                  {obj?.otcFreeAgentYear ? <span style={{ color: 'rgba(255,255,255,0.3)' }}> · FA {obj.otcFreeAgentYear}</span> : ''}
                </p>
              </div>
            )
          }
          // Parse contractInfo text into short format — never show full paragraph in table
          const raw = obj?.contractInfo || ''
          if (raw.length > 0) {
            // Try to extract dollar amount from text like "signed a 4 year, $48,000,000 contract"
            const match = raw.match(/(\d+)\s*year.*?\$(\d[\d,]*)/i)
            if (match) {
              const yrs = match[1]
              const dollars = parseInt(match[2].replace(/,/g, ''))
              const totalM = (dollars / 1_000_000).toFixed(1)
              return (
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#E2E8F0' }}>${totalM}M</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{yrs}yr</p>
                </div>
              )
            }
            // Try alternate format: just find a dollar amount
            const dollarMatch = raw.match(/\$(\d[\d,]*)/i)
            if (dollarMatch) {
              const dollars = parseInt(dollarMatch[1].replace(/,/g, ''))
              const totalM = (dollars / 1_000_000).toFixed(1)
              return (
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#E2E8F0' }}>${totalM}M</p>
                </div>
              )
            }
          }
          // Fallback: show cap hit as SP or dash — full contract text is in player popup
          const capHit = obj?.caphit
          if (capHit && capHit > 0) {
            return <p style={{ fontSize: 11, color: '#94A3B8' }}>{`${Number(capHit).toLocaleString()} SP`}</p>
          }
          return <p style={{ fontSize: 11, color: '#475569' }}>-</p>
        },
      },

      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>OWNED BY</p>,
        dataIndex: 'HostedHeadshotNoBackgroundUrl',
        key: 'HostedHeadshotNoBackgroundUrl',
        render: (_, obj) => {

          return (
            <div>
              {obj?.teaminfo ? (
                <p>{obj?.teaminfo?.name}</p>
              ) : obj?.teaminfo?._id === userDetails?.team?._id ? (
                ''
              ) : (
                Number(year) >= 2024 && (
                  draftNotCompleted ? (
                    <span style={{
                      padding: '2px 10px', borderRadius: 4,
                      background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      color: '#A78BFA', fontSize: 10, fontWeight: 700,
                      letterSpacing: 1, textTransform: 'uppercase',
                      fontFamily: "'Rajdhani', sans-serif",
                    }}>locked</span>
                  ) : (
                    <Button
                      loading={playerID == obj?.PlayerID}
                      type='primary'
                      className='_button'
                      onClick={() => {
                        handleCreateAuction(obj?.PlayerID, obj?.id, obj?.currentYearSalaryCap)
                      }}
                    >
                      Auction
                    </Button>
                  )
                )
              )}
            </div>
          )
        },
      },

      // {
      //   width: 30,
      //   title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
      //   dataIndex: 'totalPts',
      //   key: 'totalPts',
      //   // render: (_, obj) => <p>{obj?.regular_season_pts?.toFixed(2) || '-'}</p>,
      //   render: (_, obj) => <p>{

      //     year == 2024 ?  obj?.regularseasonpts.toFixed(2) :{obj?.regular_season_pts?.toFixed(2)|| '-'}</p>,

      // },

      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
        dataIndex: 'totalPts',
        key: 'totalPts',
        render: (_, obj) => {
          const pts = Number(year) >= 2024
            ? obj?.regularseasonpts
            : obj?.regular_season_pts
          const val = pts ? pts.toFixed(2) : '-'
          const ptsColor = pts >= 200 ? '#22C55E' : pts >= 100 ? '#4ADE80' : pts >= 50 ? '#86EFAC' : '#CBD5E1'
          return <p style={{ fontWeight: 700, color: pts ? ptsColor : '#475569' }}>{val}</p>
        },
      },

      {
        width: 30,
        title: 'PPG',
        dataIndex: 'playerScore',
        key: 'playerScore',
        render: (_, obj) => {
          const regularSeasonPts =
            Number(year) >= 2024 ? obj?.regularseasonpts || 0 : obj?.regular_season_pts || 0

          // Count weeks with a score > 0 for accurate games played
          let gamesPlayed = 0
          for (let w = 1; w <= 18; w++) {
            const sc = obj?.[`week_${w}_score`]
            if (sc && sc > 0) gamesPlayed++
          }

          let ppg = 0
          if (gamesPlayed > 0 && regularSeasonPts > 0) {
            ppg = (regularSeasonPts / gamesPlayed).toFixed(2)
          }

          const ppgStyle = getScoreColor(ppg)
          return <p style={ppgStyle}>{ppg || '0'}</p>
        },
      },
    ]

    const columns2 = [
      {
        //  width: 90,
        title: 'REGULAR SEASON',
        dataIndex: 'regularseason',
        key: 'regularseason',
        children: [
          {
            width: 30,
            title: 'WK1',
            dataIndex: 'wk1',
            key: 'wk1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_1_score)}>{obj?.week_1_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK2',
            dataIndex: 'wk2',
            key: 'wk2',
            render: (_, obj) => <p style={getScoreColor(obj?.week_2_score)}>{obj?.week_2_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK3',
            dataIndex: 'wk3',
            key: 'wk3',
            render: (_, obj) => <p style={getScoreColor(obj?.week_3_score)}>{obj?.week_3_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK4',
            dataIndex: 'wk4',
            key: 'wk4',
            render: (_, obj) => <p style={getScoreColor(obj?.week_4_score)}>{obj?.week_4_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK5',
            dataIndex: 'wk5',
            key: 'wk1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_5_score)}>{obj?.week_5_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK6',
            dataIndex: 'wk6',
            key: 'wk1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_6_score)}>{obj?.week_6_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK7',
            dataIndex: 'wk7',
            key: 'wk7',
            render: (_, obj) => <p style={getScoreColor(obj?.week_7_score)}>{obj?.week_7_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK8',
            dataIndex: 'wk8',
            key: 'wk1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_8_score)}>{obj?.week_8_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK9',
            dataIndex: 'wk9',
            key: 'wk9',
            render: (_, obj) => <p style={getScoreColor(obj?.week_9_score)}>{obj?.week_9_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK10',
            dataIndex: 'wk10',
            key: 'wk10',
            render: (_, obj) => <p style={getScoreColor(obj?.week_10_score)}>{obj?.week_10_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK11',
            dataIndex: 'wk11',
            key: 'wk11',
            render: (_, obj) => <p style={getScoreColor(obj?.week_11_score)}>{obj?.week_11_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK12',
            dataIndex: 'wk12',
            key: 'wk12',
            render: (_, obj) => <p style={getScoreColor(obj?.week_12_score)}>{obj?.week_12_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK13',
            dataIndex: 'wk13',
            key: 'wk13',
            render: (_, obj) => <p style={getScoreColor(obj?.week_13_score)}>{obj?.week_13_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK14',
            dataIndex: 'wk14',
            key: 'wk14',
            render: (_, obj) => <p style={getScoreColor(obj?.week_14_score)}>{obj?.week_14_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK15',
            dataIndex: 'wk15',
            key: 'wk15',
            render: (_, obj) => <p style={getScoreColor(obj?.week_15_score)}>{obj?.week_15_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK16',
            dataIndex: 'wk16',
            key: 'wk11',
            render: (_, obj) => <p style={getScoreColor(obj?.week_16_score)}>{obj?.week_16_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK17',
            dataIndex: 'wk17',
            key: 'wk11',
            render: (_, obj) => <p style={getScoreColor(obj?.week_17_score)}>{obj?.week_17_score || '-'}</p>,
          },
          {
            width: 100,
            title: 'WK18',
            dataIndex: 'wk18',
            key: 'wk11',
            render: (_, obj) => <p style={getScoreColor(obj?.week_18_score)}>{obj?.week_18_score || '-'}</p>,
          },
        ],
      },

      {
        //  width: 150,
        title: 'POST SEASON',
        dataIndex: 'postseason',
        key: 'postseason',
        children: [
          {
            width: 30,
            title: 'RD1',
            dataIndex: 'rd1',
            key: 'rd1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_19_score)}>{obj?.week_19_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD2',
            dataIndex: 'rd2',
            key: 'rd2',
            render: (_, obj) => <p style={getScoreColor(obj?.week_20_score)}>{obj?.week_20_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD3',
            dataIndex: 'rd3',
            key: 'rd1',
            render: (_, obj) => <p style={getScoreColor(obj?.week_21_score)}>{obj?.week_21_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'SB',
            dataIndex: 'sb',
            key: 'sb',
            render: (_, obj) => <p style={getScoreColor(obj?.week_23_score)}>{obj?.week_23_score || '-'}</p>,
          },

          {
            width: 30,
            title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
            dataIndex: 'totalPts',
            key: 'totalPts',
            render: (_, obj) => {
              const pts = obj?.post_season_pts
              const val = pts ? pts.toFixed(2) : '-'
              const ptsColor = pts >= 50 ? '#22C55E' : pts >= 20 ? '#4ADE80' : pts > 0 ? '#86EFAC' : '#475569'
              return <p style={{ fontWeight: 700, color: pts ? ptsColor : '#475569' }}>{val}</p>
            },
          },
          {
            width: 30,
            title: 'Average PPG',
            dataIndex: 'playerScore',
            key: 'playerScore',
            // render: (_, obj) => <p>{obj?.postavgpts.toFixed(2) || '-'}</p>,
            render: (_, obj) => {
              // Extract values
              const postseasonpts = obj?.post_season_pts || 0
              const nflGamesPlayed = obj?.nflGamesPlayed || 0

              // Calculate PPG
              let ppg = 0
              if (nflGamesPlayed > 0 && postseasonpts > 0) {
                ppg = (postseasonpts / nflGamesPlayed)?.toFixed(2)
              }

              // Return formatted result
              const ppgStyle = getScoreColor(ppg)
              return <p style={ppgStyle}>{ppg || '0'}</p>
            },
          },
        ],
      },
    ]

    const columns3 = [
      // {
      //   width: 50,
      //   title: 'SCORE',
      //   dataIndex: 'score',
      //   key: 'score',
      //   render: (_, obj) => (
      //     <div className='_positionColumn'>
      //       <p>{obj?.Position || '-'}</p>
      //     </div>
      //   ),
      // },

      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const scoreKey = `week_${weekNumber}_score`
          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`
          return (
            <div className='_positionColumn'>
              <p>{obj?.[scoreKey] ?? '-'}</p>
              {/* <p>{obj?.[offensivescoreKey] ? obj?.[scoreKey] : 0}</p> */}
            </div>
          )
        },
      },

      // {
      //   width: 30,
      //   title: 'AVERAGE SNAP %',
      //   dataIndex: 'averagesnap%',
      //   key: 'averagesnap',
      //   render: (_, obj) => {
      //     const weekNumber = Number(checkweek)

      //     const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`

      //     const offensiveRatio = obj?.[offensivescoreKey] ?? 0

      //     // Ensure nflGamesPlayed is a number and not zero
      //     const gamesPlayed = Number(obj.nflGamesPlayed)
      //     const averageSnapPercentage =
      //       gamesPlayed > 0 ? (offensiveRatio / gamesPlayed).toFixed(2) : '-'

      //     return (
      //       <div>
      //         {/* <p>{averageSnapPercentage}%</p> */}
      //         <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>
      //       </div>
      //     )
      //   },
      // },

      {
        width: 30,
        title: 'AVERAGE SNAP %',
        dataIndex: 'averagesnap%',
        key: 'averagesnap',
        render: (_, obj) => {
          // Initialize a variable to hold the total OffensiveRatio
          let totalOffensiveRatio = 0

          // Loop through the weeks to accumulate the OffensiveRatio values
          for (let week = 1; week <= 23; week++) {
            // Adjust the range as necessary
            const offensivescoreKey = `week_${week}_OffensiveRatio`
            totalOffensiveRatio += obj?.[offensivescoreKey] || 0 // Safely add the value, defaulting to 0 if undefined
          }

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averageSnapPercentage =
            gamesPlayed > 0 ? (totalOffensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              <p>
                {averageSnapPercentage === '-' ? '-' : (averageSnapPercentage * 100).toFixed(0)}%
              </p>
            </div>
          )
        },
      },

      // week_1_OffensiveRatio
      {
        width: 30,
        title: 'SNAP %',
        dataIndex: 'snap%',
        key: 'snap',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[offensivescoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>
                {obj?.[offensivescoreKey] ? (obj[offensivescoreKey] * 100).toFixed(0) + '%' : '-'}
              </p>
            </div>
          )
        },
      },

      {
        width: 100,
        title: 'RUSHING',
        dataIndex: 'rush',
        key: 'rush',
        children: [
          {
            width: 30,
            title: 'ATT',
            dataIndex: 'att',
            key: 'att',

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const RushingAttempts = `week_${weekNumber}_RushingAttempts`

              return (
                <div>
                  <p>{obj?.[RushingAttempts] ?? '-'}</p>
                  <p></p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'YARD',
            dataIndex: 'yard',
            key: 'yard',

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const RushingYards = `week_${weekNumber}_RushingYards`
              return (
                <div>
                  <p>{obj?.[RushingYards] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.RushingTouchdowns || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const RushingTouchdowns = `week_${weekNumber}_RushingTouchdowns`
              return (
                <div>
                  <p>{obj?.[RushingTouchdowns] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },

      {
        // width: 150,
        title: 'RECEIVING',
        dataIndex: 'rec',
        key: 'rec',
        children: [
          {
            width: 30,
            title: 'TAR',
            dataIndex: 'tar',
            key: 'tar',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.ReceivingTargets || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const ReceivingTargets = `week_${weekNumber}_ReceivingTargets`
              return (
                <div>
                  <p>{obj?.[ReceivingTargets] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'REC',
            dataIndex: 'rec',
            key: 'rec',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.Receptions || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const Receptions = `week_${weekNumber}_Receptions`
              return (
                <div>
                  <p>{obj?.[Receptions] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'YARD',
            dataIndex: 'yard',
            key: 'yard',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.ReceivingYards || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const ReceivingYards = `week_${weekNumber}_ReceivingYards`
              return (
                <div>
                  <p>{obj?.[ReceivingYards] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.ReceivingTouchdowns || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const ReceivingTouchdowns = `week_${weekNumber}_ReceivingTouchdowns`
              return (
                <div>
                  <p>{obj?.[ReceivingTouchdowns] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },

      {
        // width: 150,
        title: 'PASSING',
        dataIndex: 'pass',
        key: 'pass',
        children: [
          {
            width: 30,
            title: 'COMP',
            dataIndex: 'comp',
            key: 'comp',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PassingCompletions || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PassingCompletions = `week_${weekNumber}_PassingCompletions`
              return (
                <div>
                  <p>{obj?.[PassingCompletions] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'ATT',
            dataIndex: 'att',
            key: 'att',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PassingAttempts || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PassingAttempts = `week_${weekNumber}_PassingAttempts`
              return (
                <div>
                  <p>{obj?.[PassingAttempts] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'YRD',
            dataIndex: 'yrd',
            key: 'yrd',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PassingYards || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PassingYards = `week_${weekNumber}_PassingYards`
              return (
                <div>
                  <p>{obj?.[PassingYards] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'taf',
            key: 'taf',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PassingTouchdowns || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const newPassingTouchdowns = `week_${weekNumber}_PassingTouchdowns`
              return (
                <div>
                  <p>{obj?.[newPassingTouchdowns] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'SACKED',
            dataIndex: 'sacked',
            key: 'sacked',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.PassingSacks || '-'}</p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PassingSacks = `week_${weekNumber}_PassingSacks`
              return (
                <div>
                  <p>{obj?.[PassingSacks] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'INT THROWN',
            dataIndex: 'intthrown',
            key: 'intthrown',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.INTS || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const INTS = `week_${weekNumber}_Interceptions`
              return (
                <div>
                  <p>{obj?.[INTS] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },

      {
        title: 'AVERAGES',
        dataIndex: 'averages',
        key: 'averages',
        children: [
          {
            width: 40,
            title: 'COMP %',
            dataIndex: 'compPct',
            key: 'compPct',
            render: (_, obj) => {
              const weekNumber = Number(checkweek)
              const weekVal = obj?.[`week_${weekNumber}_CompPct`]
              const sznVal = obj?.szn_CompPct
              const val = weekVal != null && weekVal !== '-' ? weekVal + '%' : (sznVal != null && sznVal !== '-' ? sznVal + '%' : '-')
              return <div><p style={{ color: '#A855F7' }}>{val}</p></div>
            },
          },
          {
            width: 40,
            title: 'YPC',
            dataIndex: 'ypc',
            key: 'ypc',
            render: (_, obj) => {
              const weekNumber = Number(checkweek)
              const weekVal = obj?.[`week_${weekNumber}_YPC`]
              const sznVal = obj?.szn_YPC
              const val = weekVal != null && weekVal !== '-' ? weekVal : (sznVal != null && sznVal !== '-' ? sznVal : '-')
              return <div><p style={{ color: '#F59E0B' }}>{val}</p></div>
            },
          },
          {
            width: 40,
            title: 'CATCH %',
            dataIndex: 'catchPct',
            key: 'catchPct',
            render: (_, obj) => {
              const weekNumber = Number(checkweek)
              const weekVal = obj?.[`week_${weekNumber}_CatchPct`]
              const sznVal = obj?.szn_CatchPct
              const val = weekVal != null && weekVal !== '-' ? weekVal + '%' : (sznVal != null && sznVal !== '-' ? sznVal + '%' : '-')
              return <div><p style={{ color: '#06B6D4' }}>{val}</p></div>
            },
          },
        ],
      },

      {
        // width: 150,
        title: 'RETURN',
        dataIndex: 'return',
        key: 'return',
        children: [
          {
            width: 30,
            title: 'KR',
            dataIndex: 'kr',
            key: 'kr',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.KickReturns || '-'}</p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const KickReturns = `week_${weekNumber}_KickReturns`
              return (
                <div>
                  <p>{obj?.[KickReturns] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'KR YARDS',
            dataIndex: 'kryrd',
            key: 'kryrd',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.KickReturnYards || '-'}</p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const KickReturnYards = `week_${weekNumber}_KickReturnYards`
              return (
                <div>
                  <p>{obj?.[KickReturnYards] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'PR',
            dataIndex: 'pr',
            key: 'Pr',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.PuntReturns || '-'}</p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PuntReturns = `week_${weekNumber}_PuntReturns`
              return (
                <div>
                  <p>{obj?.[PuntReturns] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PR YARDS',
            dataIndex: 'pryrd',
            key: 'pryrd',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.PuntReturnYards || '-'}</p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PuntReturnYards = `week_${weekNumber}_PuntReturnYards`
              return (
                <div>
                  <p>{obj?.[PuntReturnYards] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'STID',
            dataIndex: 'stid',
            key: 'stid',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.SpecialTeamsTouchdowns || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const SpecialTeamsTouchdowns = `week_${weekNumber}_SpecialTeamsTouchdowns`
              return (
                <div>
                  <p>{obj?.[SpecialTeamsTouchdowns] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },
    ]

    const columns4 = [
      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const scoreKey = `week_${weekNumber}_score`
          return (
            <div className='_positionColumn'>
              <p>{obj?.[scoreKey] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'AVERAGE SNAP %',
        dataIndex: 'averagesnap%',
        key: 'averagesnap',
        // render: (_, obj) => {
        //   const weekNumber = Number(checkweek)

        //   const defensivecoreKey = `week_${weekNumber}_DefensiveRatio`

        //   const defensiveRatio = obj?.[defensivecoreKey] ?? 0

        //   // Ensure nflGamesPlayed is a number and not zero
        //   const gamesPlayed = Number(obj.nflGamesPlayed)
        //   const averageSnapPercentage =
        //     gamesPlayed > 0 ? (defensiveRatio / gamesPlayed).toFixed(2) : '-'

        //   return (
        //     <div>
        //       {/* <p>{averageSnapPercentage}%</p> */}
        //       <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>
        //     </div>
        //   )
        // },
        render: (_, obj) => {
          // Initialize a variable to hold the total OffensiveRatio
          let totaldefensiveRatio = 0

          // Loop through the weeks to accumulate the OffensiveRatio values
          for (let week = 1; week <= 23; week++) {
            // Adjust the range as necessary
            // const offensivescoreKey = `week_${week}_OffensiveRatio`;
            const defensivecoreKey = `week_${week}_DefensiveRatio`
            totaldefensiveRatio += obj?.[defensivecoreKey] || 0 // Safely add the value, defaulting to 0 if undefined
          }

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averagedefensiveSnapPercentage =
            gamesPlayed > 0 ? (totaldefensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              <p>
                {averagedefensiveSnapPercentage === '-'
                  ? '-'
                  : (averagedefensiveSnapPercentage * 100).toFixed(0)}
                %
              </p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'SNAP %',
        dataIndex: 'snap%',
        key: 'snap',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const defensivecoreKey = `week_${weekNumber}_DefensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[defensivecoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>
                {obj?.[defensivecoreKey] ? (obj[defensivecoreKey] * 100).toFixed(0) + '%' : '-'}
              </p>
            </div>
          )
        },
      },

      {
        width: 50,
        title: 'TACKLE',
        dataIndex: 'tackel',
        key: 'tackel',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.TKLS || '-'}</p>
        //   </div>
        // ),
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const SoloTackles = `week_${weekNumber}_SoloTackles`
          return (
            <div>
              <p>{obj?.[SoloTackles] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'TACKLE FOR LOSS',
        dataIndex: 'tackelforloss',
        key: 'tackelforloss',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.TFL || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const TFL = `week_${weekNumber}_TacklesForLoss`
          return (
            <div>
              <p>{obj?.[TFL] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'SACKED',
        dataIndex: 'sacked',
        key: 'sacked',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.SCKS || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const SCKS = `week_${weekNumber}_Sacks`
          return (
            <div>
              <p>{obj?.[SCKS] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'FORCED FUBMBLE',
        dataIndex: 'forcedfumble',
        key: 'forcedfumble',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.FF || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const FF = `week_${weekNumber}_FumblesForced`
          return (
            <div>
              <p>{obj?.[FF] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'FUBMBLE RECOVERY',
        dataIndex: 'forcedrecovery',
        key: 'forcedrecovery',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.FumblesRecovered || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const FumblesRecovered = `week_${weekNumber}_FumblesRecovered`
          return (
            <div>
              <p>{obj?.[FumblesRecovered] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'PASS DEFENDED',
        dataIndex: 'passdefended',
        key: 'passdefended',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.PD || '-'}</p>
        //   </div>
        // ),
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const PD = `week_${weekNumber}_PassesDefended`
          return (
            <div>
              <p>{obj?.[PD] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'INTERCEPTIONS',
        dataIndex: 'interceptions',
        key: 'interceptions',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.INTS || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const INTS = `week_${weekNumber}_Interceptions`
          return (
            <div>
              <p>{obj?.[INTS] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'TOUCHDOWN',
        dataIndex: 'tocuhdown',
        key: 'tocuhdown',
        // render: (_, obj) => (
        //   <div>
        //     <p>{obj?.SpecialTeamsTouchdowns || '-'}</p>
        //   </div>
        // ),

        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const SpecialTeamsTouchdowns = `week_${weekNumber}_SpecialTeamsTouchdowns`
          return (
            <div>
              <p>{obj?.[SpecialTeamsTouchdowns] ?? '-'}</p>
            </div>
          )
        },
      },
    ]

    const columns5 = [
      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const scoreKey = `week_${weekNumber}_score`
          return (
            <div className='_positionColumn'>
              <p>{obj?.[scoreKey] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 30,
        title: 'AVERAGE SNAP %',
        dataIndex: 'averagesnap%',
        key: 'averagesnap',
        // render: (_, obj) => {
        //   const weekNumber = Number(checkweek)

        //   const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`

        //   const offensiveRatio = obj?.[offensivescoreKey] ?? 0

        //   // Ensure nflGamesPlayed is a number and not zero
        //   const gamesPlayed = Number(obj.nflGamesPlayed)
        //   const averageSnapPercentage =
        //     gamesPlayed > 0 ? (offensiveRatio / gamesPlayed).toFixed(2) : '-'

        //   return (
        //     <div>
        //       {/* <p>{averageSnapPercentage}%</p> */}
        //       <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>
        //     </div>
        //   )
        // },
        render: (_, obj) => {
          // Initialize a variable to hold the total OffensiveRatio
          let totalOffensiveRatio = 0

          // Loop through the weeks to accumulate the OffensiveRatio values
          for (let week = 1; week <= 23; week++) {
            // Adjust the range as necessary
            const offensivescoreKey = `week_${week}_OffensiveRatio`
            totalOffensiveRatio += obj?.[offensivescoreKey] || 0 // Safely add the value, defaulting to 0 if undefined
          }

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averageSnapPercentage =
            gamesPlayed > 0 ? (totalOffensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              <p>
                {averageSnapPercentage === '-' ? '-' : (averageSnapPercentage * 100).toFixed(0)}%
              </p>
            </div>
          )
        },
      },

      // week_1_OffensiveRatio
      {
        width: 30,
        title: 'SNAP %',
        dataIndex: 'snap%',
        key: 'snap',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[offensivescoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>
                {obj?.[offensivescoreKey] ? (obj[offensivescoreKey] * 100).toFixed(0) + '%' : '-'}
              </p>
            </div>
          )
        },
      },
      // OL_TimesSacked
      {
        width: 50,
        title: 'SACKS GIVENUP',
        dataIndex: 'sacksgivenup',
        key: 'sacksgivenup',
        render: (_, obj) => {
          const weekNumber = Number(checkweek)
          const OL_TimesSacked = `week_${weekNumber}_TimesSacked`
          return (
            <div>
              <p>{obj?.[OL_TimesSacked] ?? '-'}</p>
            </div>
          )
        },
      },

      // {
      //     width: 50,
      //     title: 'TEAM RUSHED SACKS',
      //     dataIndex: 'teamrushedsacks',
      //     key: 'teamrushedsacks',
      //     render: (_, obj) => {
      //         const weekNumber = Number(checkweek);
      //         const OL_TimesSacked = `week_${weekNumber}_TimesSacked`;
      //         return (
      //             <div>
      //                 <p>{obj?.[OL_TimesSacked] - 1 ? NAN :0 ?? '-'}</p>
      //             </div>
      //         );
      //     },
      // },

      {
        width: 50,
        title: 'TEAM RUSHING YARDS',
        dataIndex: 'teamrushedsacks',
        key: 'teamrushedsacks',
        render: (_, obj) => {
          const weekNumber = Number(checkweek)
          const OL_TimesSacked = `week_${weekNumber}_TimesSacked`
          const timesSackedValue = obj?.[OL_TimesSacked]

          const OL_RushingYards = `week_${weekNumber}_RushingYards`

          // Calculate the value, ensuring that NaN or undefined are handled
          const calculatedValue = 15 - (isNaN(timesSackedValue) ? 0 : Number(timesSackedValue))

          return (
            <div>
              {/* <p>{calculatedValue || '0'}</p> */}
              <p>{obj?.[OL_RushingYards] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 50,
        title: 'TEAM RUSHING TD',
        dataIndex: 'teamrushedtd',
        key: 'teamrushedtd',
        render: (_, obj) => {
          const weekNumber = Number(checkweek)
          const OL_RushingTouchdowns = `week_${weekNumber}_RushingTouchdowns`
          return (
            <div>
              <p>{obj?.[OL_RushingTouchdowns] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        width: 50,
        title: 'TEAM PASSING TD',
        dataIndex: 'teampassingtd',
        key: 'teampassingtd',
        render: (_, obj) => {
          const weekNumber = Number(checkweek)
          const OL_PassingTouchdowns = `week_${weekNumber}_PassingTouchdowns`
          return (
            <div>
              <p>{obj?.[OL_PassingTouchdowns] ?? '-'}</p>
            </div>
          )
        },
      },
    ]

    const columns6 = [
      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => {
          // Ensure week is a number
          const weekNumber = Number(checkweek)

          // Construct the key dynamically based on the week
          const scoreKey = `week_${weekNumber}_score`
          return (
            <div className='_positionColumn'>
              <p>{obj?.[scoreKey] ?? '-'}</p>
            </div>
          )
        },
      },

      {
        // width: 150,
        title: 'KICKING',
        dataIndex: 'kick',
        key: 'kick',
        children: [
          {
            width: 30,
            title: 'AVERAGE SNAP %',
            dataIndex: 'averagesnap%',
            key: 'averagesnap',
            // render: (_, obj) => {
            //   const weekNumber = Number(checkweek)

            //   const specialteamscoreKey = `week_${weekNumber}_SpecialTeamsRatio`

            //   const specialteamRatio = obj?.[specialteamscoreKey] ?? 0

            //   // Ensure nflGamesPlayed is a number and not zero
            //   const gamesPlayed = Number(obj.nflGamesPlayed)
            //   const averageSnapPercentage =
            //     gamesPlayed > 0 ? (specialteamRatio / gamesPlayed).toFixed(2) : '-'

            //   return (
            //     <div>
            //       {/* <p>{averageSnapPercentage}%</p> */}
            //       <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Initialize a variable to hold the total OffensiveRatio
              let totalspecialRatio = 0

              // Loop through the weeks to accumulate the OffensiveRatio values
              for (let week = 1; week <= 23; week++) {
                // Adjust the range as necessary
                // const offensivescoreKey = `week_${week}_OffensiveRatio`;
                const specialscoreKey = `week_${week}_SpecialTeamsRatio`
                totalspecialRatio += obj?.[specialscoreKey] || 0 // Safely add the value, defaulting to 0 if undefined
              }

              // Ensure nflGamesPlayed is a number and not zero
              const gamesPlayed = Number(obj.nflGamesPlayed)
              const averagespecialSnapPercentage =
                gamesPlayed > 0 ? (totalspecialRatio / gamesPlayed).toFixed(2) : '-'

              return (
                <div>
                  <p>
                    {averagespecialSnapPercentage === '-'
                      ? '-'
                      : (averagespecialSnapPercentage * 100).toFixed(0)}
                    %
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'SNAP %',
            dataIndex: 'snap%',
            key: 'snap',
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const specialteamscoreKey = `week_${weekNumber}_SpecialTeamsRatio`

              return (
                <div>
                  {/* <p>{obj?.[specialteamscoreKey].toFixed(2) ?? '-'}%</p> */}
                  <p>
                    {obj?.[specialteamscoreKey]
                      ? (obj[specialteamscoreKey] * 100).toFixed(0) + '%'
                      : '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'FGA',
            dataIndex: 'fga',
            key: 'fga',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.FieldGoalsAttempted || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const FieldGoalsAttempted = `week_${weekNumber}_FieldGoalsAttempted`
              return (
                <div>
                  <p>{obj?.[FieldGoalsAttempted] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'FGM',
            dataIndex: 'fgm',
            key: 'fgm',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.FieldGoalsMade || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const FieldGoalsMade = `week_${weekNumber}_FieldGoalsMade`
              return (
                <div>
                  <p>{obj?.[FieldGoalsMade] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'FGM 30-39',
            dataIndex: 'fgm30',
            key: 'fgm30',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.FGM30TO39 || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const FGM30TO39 = `week_${weekNumber}_FieldGoalsMade30to39`
              return (
                <div>
                  <p>{obj?.[FGM30TO39] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'FGM 40-49',
            dataIndex: 'fgm40',
            key: 'fgm40',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.FGM40TO49 || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const FGM40TO49 = `week_${weekNumber}_FieldGoalsMade40to49`
              return (
                <div>
                  <p>{obj?.[FGM40TO49] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'FGM 50+',
            dataIndex: 'fgm50',
            key: 'fgm50',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.FGM50 || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const FGM50 = `week_${weekNumber}_FieldGoalsMade50Plus`
              return (
                <div>
                  <p>{obj?.[FGM50] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'XPA',
            dataIndex: 'xpa',
            key: 'xpa',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.ExtraPointsAttempted || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const ExtraPointsAttempted = `week_${weekNumber}_ExtraPointsAttempted`
              return (
                <div>
                  <p>{obj?.[ExtraPointsAttempted] ?? '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'XPM',
            dataIndex: 'xpm',
            key: 'xpm',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.ExtraPointsMade || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const ExtraPointsMade = `week_${weekNumber}_ExtraPointsMade`
              return (
                <div>
                  <p>{obj?.[ExtraPointsMade] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },

      {
        // width: 150,
        title: 'PUNTING',
        dataIndex: 'punt',
        key: 'punt',
        children: [
          {
            width: 30,
            title: 'PUNTS',
            dataIndex: 'punts',
            key: 'punts',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p>{obj?.Punts || '-'}</p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const Punts = `week_${weekNumber}_Punts`
              return (
                <div>
                  <p>{obj?.[Punts] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PUNTS YARDS',
            dataIndex: 'puntyards',
            key: 'puntyards',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PuntYards || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PuntYards = `week_${weekNumber}_PuntYards`
              return (
                <div>
                  <p>{obj?.[PuntYards] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PUNTS INSIDE 20',
            dataIndex: 'puntsinside',
            key: 'puntsinside',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PuntInside20 || '-'}
            //       </p>
            //     </div>
            //   )
            // },
            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PuntInside20 = `week_${weekNumber}_PuntInside20`
              return (
                <div>
                  <p>{obj?.[PuntInside20] ?? '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'BLOCKS',
            dataIndex: 'blocks',
            key: 'blocks',
            // render: (_, obj) => {
            //   return (
            //     <div className='table_player_name_box nrc_container'>
            //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
            //         {obj?.PuntsHadBlocked || '-'}
            //       </p>
            //     </div>
            //   )
            // },

            render: (_, obj) => {
              // Ensure week is a number
              const weekNumber = Number(checkweek)

              // Construct the key dynamically based on the week
              const PuntsHadBlocked = `week_${weekNumber}_PuntsHadBlocked`
              return (
                <div>
                  <p>{obj?.[PuntsHadBlocked] ?? '-'}</p>
                </div>
              )
            },
          },
        ],
      },
    ]

    if (position === 'ALL') {
      return [...columns, ...columns2]
    }

    if (position === 'QB' || position === 'RB' || position === 'WR' || position === 'TE') {
      return [...columns, ...columns3]
    }

    if (position === 'DL' || position === 'DE' || position === 'DT' || position === 'LB' || position === 'DB' || position === 'CB' || position === 'S') {
      return [...columns, ...columns4]
    }

    if (position === 'OL') {
      return [...columns, ...columns5]
    }

    if (position === 'ST' || position === 'K/P') {
      return [...columns, ...columns6]
    }
  }
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
    <div className='sp-container'>
      <Header />

      <OnboardingGuide tabKey="search" />

      {/* ── Page Header ── */}
      <div className='sp-page-header'>
        <div className='sp-page-header-bg' />
        <div className='sp-page-header-content'>
          <h1 className='sp-page-title'>
            PLAYER <span>SEARCH</span>
          </h1>
          <p className='sp-page-subtitle'>Browse &amp; discover players across all teams</p>
        </div>
      </div>

      {/* ── Toolbar: search + filters + results count ── */}
      <div className='sp-toolbar'>
        <div className='sp-search-box'>
          <Input
            value={search}
            className='sp-search-input'
            size='small'
            placeholder='Search player name...'
            suffix={<LiaSearchSolid size={18} style={{ color: '#22C55E' }} />}
            onChange={(e) => {
              setSearch(e.target.value)
              if (e.target.value === '') {
                onFieldClear()
              }
            }}
            allowClear={{
              clearIcon: (
                <IoIosClose
                  size={22}
                  style={{ color: '#22C55E', marginBottom: '-3px' }}
                  onClick={() => {}}
                />
              ),
            }}
          />
        </div>

        <div className='sp-toolbar-divider' />

        <Select
          value={playerType}
          style={{ width: 160 }}
          onChange={(val) => setPlayerType(val)}
          options={[
            { value: 'All', label: 'All Players' },
            { value: 'FreeAgents', label: 'Free Agents' },
            { value: 'Rookie', label: 'Rookies' },
          ]}
        />
        <Select
          value={year}
          style={{ width: 110 }}
          onChange={(val) => setYear(val)}
          options={[
            { value: 2026, label: '2026' },
            { value: 2025, label: '2025' },
            { value: 2024, label: '2024' },
            { value: 2023, label: '2023' },
          ]}
        />
        {position !== 'ALL' && (
          <Select
            value={checkweek}
            style={{ width: 110 }}
            onChange={(val) => setCheckWeek(val)}
            options={weekOptions}
          />
        )}

        <div className='sp-results-count'>
          <span>{totalCount}</span> players found
        </div>
      </div>

      {/* ── Position Filter Bar ── */}
      <div className='sp-pos-bar'>
        <PositionComponent position={position} setPosition={setPosition} playerType={playerType} setPlayerType={setPlayerType} />
      </div>

      {/* ── Data Table ── */}
      <div className='sp-table-wrap'>
        <Table
          loading={loading}
          dataSource={data}
          total={totalCount}
          columns={getColumns(position)}
          bordered={false}
          pagination={false}
          scroll={{ x: 1700 }}
          rowKey={(record, index) => record?.id || record?.PlayerID || index}
          locale={emptyMessage ? { emptyText: (
            <div style={{ padding: '40px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              {emptyMessage}
            </div>
          )} : undefined}
        />
      </div>

      {/* ── Pagination ── */}
      <div className='sp-pagination'>
        <AntPagination
          defaultCurrent={page}
          total={totalCount}
          showSizeChanger={false}
          onChange={handlePagination}
          pageSize={limit}
        />
      </div>
    </div>
  )
}

export default SearchPlayer
