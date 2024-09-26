import React, { useEffect, useState } from 'react'
import { Input, Pagination as AntPagination, Table, Select, Button, notification } from 'antd'

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

const SearchPlayer = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const userDetails = useSelector((state) => state?.user?.userDetails)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)
  const [loading, setLoading] = useState(true)
  const [playerID, setPlayerID] = useState(false)
  const [data, setData] = useState([])
  console.log("🚀 ~ data:", data)
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [playerType, setPlayerType] = useState('ALL')
  const [year, setYear] = useState(moment().format('2024'))
   const currentweek = SETTING?.week;
  const [week, setWeek] = useState(SETTING?.week)
  const [checkweek, setCheckWeek] = useState(SETTING?.week)
  const [totalCount, setTotalCount] = useState(0)

  // console.log('week',week);
  // console.log('currentweek',currentweek);
  
  console.log('year',year);
  

  const weekOptions = Array.from({ length: 18 }, (_, index) => ({
    value: index + 1,
    label: `Week ${index + 1}`,
  }))

  const getData = async () => {
    console.log('inide position', position)
    const res = await getPlayerForWeeklyScoring({ page, position, playerType, search, year })
    setTotalCount(res?.total)
    // console.log('res',res);

    return res?.players
  }

  // console.log('totalCount',totalCount);

  const getWeeklyScoring = async () => {
    setLoading(true)
    let tempWeeks = []
    // for (let i = 1; i <= SETTING?.week; i++) {
    for (let i = 1; i <= 23; i++) {
      tempWeeks.push(i)
    }
    setWeek(tempWeeks)

    const res = await getData()

    // console.log('here res', res)

    let tempResultArr = []
    let regularpts = 0
    let weeksToConsider = 18
    let postpts = 0
    let postweek = 23
    let regularseasonpts = 0;

    res?.map((item) => {
      // console.log('item', item)

      let tempObj = {}

   

      tempWeeks.forEach((week) => {
        // console.log('week',week);
        
        console.log('item?.player?.weeklyScoring',item?.player?.weeklyScoring);

        
        const filteredObj = item?.player?.weeklyScoring?.find(
          (wScore) => Number(wScore?.week) === Number(week) && Number(wScore.season) === Number(year),
        )

      
        // console.log('filteredObj',filteredObj);
        // const wScore = item?.player?.weeklyScoring?.find(
        //   (wScore) =>   Number(wScore.season) === Number(year)
        // );

        const filteredScores2024 = item?.player?.weeklyScoring?.filter(
          (wScore) => Number(wScore.season) === 2024
        ) || []
        
// console.log('filteredScores2024',filteredScores2024.length);

        // Initialize the variable to hold the score
        
        
        // If wScore is found, use its score
        // if (wScore) {
        //    console.log('wScore',wScore);
          
        //   regularseasonpts = Number(wScore.score) || 0; // Handle possible NaN
        // }

        regularseasonpts = filteredScores2024.reduce((total, wScore) => {
          return total + (Number(wScore.score) || 0); 
        }, 0);
        
        // console.log('regularseasonpts',regularseasonpts);
        
        // console.log('filteredObj',filteredObj);
     
        
        

        const filtersnaps = item?.stats?.stats?.weeklySnapRatios?.find(
          (check) => Number(check?.week) === Number(week),
        )

        const filterWeek = item?.stats?.weeklyStats?.[week]

        // console.log('filterWeek',filterWeek);

        const filterolweek = item?.stats?.olWeeklyStats?.[week]

        // console.log('filterolweek', filterolweek)

        // console.log('filterWeek?.RushingYards',filterWeek?.RushingYards);

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

        // console.log(' ----- filterWeek?.RushingTouchdowns', filterWeek?.RushingTouchdowns)

        tempObj = {
          ...tempObj,
          [`week_${week}_score`]: score,
          [`week_${week}_DefensiveRatio`]: DefensiveRatio,
          [`week_${week}_OffensiveRatio`]: OffensiveRatio,
          [`week_${week}_SpecialTeamsRatio`]: SpecialTeamsRatio,
          [`week_${week}_RushingAttempts`]: filterWeek?.RushingAttempts.toFixed(2),
          [`week_${week}_RushingYards`]: filterWeek?.RushingYards.toFixed(2),
          [`week_${week}_RushingTouchdowns`]: filterWeek?.RushingTouchdowns.toFixed(2),

          // RECEIVING
          [`week_${week}_ReceivingTargets`]: filterWeek?.ReceivingTargets?.toFixed(2),
          [`week_${week}_ReceivingYards`]: filterWeek?.ReceivingYards?.toFixed(2),
          [`week_${week}_ReceivingTouchdowns`]: filterWeek?.ReceivingTouchdowns?.toFixed(2),
          [`week_${week}_Receptions`]: filterWeek?.Receptions?.toFixed(2),

          // PASSING
          [`week_${week}_PassingAttempts`]: filterWeek?.PassingAttempts?.toFixed(2),
          [`week_${week}_PassingYards`]: filterWeek?.PassingYards?.toFixed(2),
          // [`week_${week}_PassingTouchdowns`]: filterWeek?.PassingTouchdowns?.toFixed(2),
          [`week_${week}_PassingSacks`]: filterWeek?.PassingSacks?.toFixed(2),
          [`week_${week}_PassingCompletions`]: filterWeek?.PassingCompletions?.toFixed(2),

          // RETURN
          [`week_${week}_PuntReturnYards`]: filterWeek?.PuntReturnYards?.toFixed(2),
          [`week_${week}_PuntReturns`]: filterWeek?.PuntReturns?.toFixed(2),
          [`week_${week}_KickReturnYards`]: filterWeek?.KickReturnYards?.toFixed(2),
          [`week_${week}_KickReturns`]: filterWeek?.KickReturns?.toFixed(2),

          // OL STATS

          [`week_${week}_PassingTouchdowns`]: filterolweek?.PassingTouchdowns?.toFixed(2),
          [`week_${week}_RushingTouchdowns`]: filterolweek?.RushingTouchdowns?.toFixed(2),
          [`week_${week}_TimesSacked`]: filterolweek?.TimesSacked?.toFixed(2),
          [`week_${week}_RushingYards`]: filterolweek?.RushingYards?.toFixed(2),

          // DEFENDER STATS
          [`week_${week}_DefensiveTouchdowns`]: filterWeek?.DefensiveTouchdowns?.toFixed(2),
          [`week_${week}_Sacks`]: filterWeek?.Sacks?.toFixed(2),
          [`week_${week}_QuarterbackHits`]: filterWeek?.QuarterbackHits?.toFixed(2),
          [`week_${week}_SoloTackles`]: filterWeek?.SoloTackles?.toFixed(2),
          [`week_${week}_TacklesForLoss`]: filterWeek?.TacklesForLoss?.toFixed(2),
          [`week_${week}_FumblesForced`]: filterWeek?.FumblesForced?.toFixed(2),
          [`week_${week}_Interceptions`]: filterWeek?.Interceptions?.toFixed(2),
          [`week_${week}_PassesDefended`]: filterWeek?.PassesDefended?.toFixed(2),
          [`week_${week}_FumblesRecovered`]: filterWeek?.FumblesRecovered?.toFixed(2),
          [`week_${week}_SpecialTeamsTouchdowns`]: filterWeek?.SpecialTeamsTouchdowns?.toFixed(2),
          [`week_${week}_FieldGoalsMade`]: filterWeek?.FieldGoalsMade?.toFixed(2),
          [`week_${week}_Punts`]: filterWeek?.Punts?.toFixed(2),
          [`week_${week}_PuntInside20`]: filterWeek?.PuntInside20?.toFixed(2),
          [`week_${week}_FieldGoalsAttempted`]: filterWeek?.FieldGoalsAttempted?.toFixed(2),
          [`week_${week}_FieldGoalsMade0to19`]: filterWeek?.FieldGoalsMade0to19?.toFixed(2),
          [`week_${week}_FieldGoalsMade20to29`]: filterWeek?.FieldGoalsMade20to29?.toFixed(2),
          [`week_${week}_FieldGoalsMade30to39`]: filterWeek?.FieldGoalsMade30to39?.toFixed(2),
          [`week_${week}_FieldGoalsMade40to49`]: filterWeek?.FieldGoalsMade40to49?.toFixed(2),
          [`week_${week}_FieldGoalsMade50Plus`]: filterWeek?.FieldGoalsMade50Plus?.toFixed(2),
          [`week_${week}_ExtraPointsMade`]: filterWeek?.ExtraPointsMade?.toFixed(2),
          [`week_${week}_ExtraPointsAttempted`]: filterWeek?.ExtraPointsAttempted?.toFixed(2),
          [`week_${week}_PuntYards`]: filterWeek?.PuntYards?.toFixed(2),
          [`week_${week}_PuntsHadBlocked`]: filterWeek?.PuntsHadBlocked?.toFixed(2),

          week,
        }
        if (position !== 'OL') {
          tempObj = {
            ...tempObj,
            [`week_${week}_RushingAttempts`]: filterWeek?.RushingAttempts?.toFixed(2),
            [`week_${week}_RushingYards`]: filterWeek?.RushingYards?.toFixed(2),
            [`week_${week}_RushingTouchdowns`]: filterWeek?.RushingTouchdowns?.toFixed(2),
            [`week_${week}_PassingTouchdowns`]: filterWeek?.PassingTouchdowns?.toFixed(2),
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

      // console.log('regularavgpts',regularavgpts.toFixed(2));

      // console.log('regularpts',regularpts.toFixed(2));

      tempObj = {
        ...tempObj,
        name: item?.player?.Name,
        PlayerID: item?.player?.PlayerID,
        position: item?.player?.Position,
        nflteam: item?.player?.Team,
        pf: item?.player?.pf?.toFixed(2),
        avgPf: item?.player?.avgPf?.toFixed(2),
        nflGamesPlayed: item?.player?.nflGamesPlayed,
        id: item?.player?._id,
        currentYearSalaryCap: item?.player?.currentYearSalaryCap,
        age: item?.player?.Age,
        caphit: item?.player?.currentYearSalaryCap,
        post_season_pts: item?.stats?.post_season_pts,
        regular_season_pts: item?.stats?.regular_season_pts,
        teaminfo:item?.team?.team,
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
      //  console.log('tempResultArr',tempResultArr);
      
       const aPoints = a.regular_season_pts || 0
       const bPoints = b.regular_season_pts || 0
   

  

      // console.log('aPoints',aPoints);
      // console.log('bPoints',bPoints);
      
      
      return bPoints - aPoints // Descending order
    })

    setData(tempResultArr)

    setLoading(false)
  }

  useEffect(() => {
    getWeeklyScoring()
  }, [page, position, playerType, search, year])

  const getColumns = (position) => {
    // console.log('🚀 ~ getColumns ~ position:', position)

    const columns = [
      {
        width: 30,
        title: 'POS',
        dataIndex: 'position',
        key: 'position',
        render: (_, obj) => (
          <div className='_positionColumn'>
            <p>{obj?.position || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'PLAYER NAME',
        dataIndex: 'Name',
        key: 'Name',
        render: (_, obj) => (
          <div>
            {/* <p>{obj?.name || '-'}</p> */}
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
        ),
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
        title: <p style={{ lineHeight: 1 }}>nfl team</p>,
        dataIndex: 'nflteam',
        key: 'nflteam',
        render: (_, obj) => <p>{obj?.nflteam || '-'}</p>,
      },



      ...(position === 'ALL'
        ? [{
            width: 30,
            title: <p style={{ lineHeight: 1 }}>CAPHIT</p>,
            dataIndex: 'caphit',
            key: 'caphit',
            render: (_, obj) => <p>{`$${(obj?.caphit || '-').toLocaleString()}`}</p>,
          }]
        : []),
   


      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>OWNED BY</p>,
        dataIndex: 'HostedHeadshotNoBackgroundUrl',
        key: 'HostedHeadshotNoBackgroundUrl',
        render: (_, obj) => {
          //  console.log('chekcimg obj',obj);

          return (
            <div >
              {obj?.teaminfo ? (
                <p>{obj?.teaminfo?.name}</p>
//                 <p >
//   {obj?.teaminfo?.name ? obj.teaminfo.name.split('team')[1]?.trim() : '-'}
// </p>

                // <img width={20} src={obj?.teaminfo.logo}>
                // </img>
              ) : (
                obj?.teaminfo?._id === userDetails?.team?._id ?
                <Button
                  disabled={false}
                  // loading={loading}
                  loading={playerID == obj?.PlayerID}
                  type='primary'
                  className='_button'
                  onClick={() => {
                    // handleCreateAuction(obj?.PlayerID, obj?._id, obj?.currentYearSalaryCap)
                    handleCreateAuction(obj?.PlayerID, obj?.id, obj?.currentYearSalaryCap)
                  }}
                >
                  Auction
                </Button>
                :
                ""
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
        render: (_, obj) => (
          <p>
            {Number(year) === 2024 
              ? obj?.regularseasonpts?.toFixed(2) 
              : obj?.regular_season_pts?.toFixed(2) || '-'}
          </p>
        ),
      },
      
      {
        width: 30,
        title: 'PPG',
        dataIndex: 'playerScore',
        key: 'playerScore',
        render: (_, obj) => {
          // Extract values
          // const regularSeasonPts =  {Number(year) === 2024 ? obj?.regularseasonpts : obj?.regular_season_pts : || 0
          const regularSeasonPts = Number(year) === 2024 
  ? obj?.regularseasonpts || 0 
  : obj?.regular_season_pts || 0;

          const nflGamesPlayed = obj?.nflGamesPlayed || 0

          // Calculate PPG
          let ppg = 0
          if (nflGamesPlayed > 0 && regularSeasonPts > 0) {
            ppg = (regularSeasonPts / nflGamesPlayed)?.toFixed(2)
          }

          // Return formatted result
          return <p>{ppg || '0'}</p>
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
            render: (_, obj) => <p>{obj?.week_1_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK2',
            dataIndex: 'wk2',
            key: 'wk2',
            render: (_, obj) => <p>{obj?.week_2_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK3',
            dataIndex: 'wk3',
            key: 'wk3',
            render: (_, obj) => <p>{obj?.week_3_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK4',
            dataIndex: 'wk4',
            key: 'wk4',
            render: (_, obj) => <p>{obj?.week_4_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK5',
            dataIndex: 'wk5',
            key: 'wk1',
            render: (_, obj) => <p>{obj?.week_5_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK6',
            dataIndex: 'wk6',
            key: 'wk1',
            render: (_, obj) => <p>{obj?.week_6_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK7',
            dataIndex: 'wk7',
            key: 'wk7',
            render: (_, obj) => <p>{obj?.week_7_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK8',
            dataIndex: 'wk8',
            key: 'wk1',
            render: (_, obj) => <p>{obj?.week_8_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK9',
            dataIndex: 'wk9',
            key: 'wk9',
            render: (_, obj) => <p>{obj?.week_9_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK10',
            dataIndex: 'wk10',
            key: 'wk10',
            render: (_, obj) => <p>{obj?.week_10_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK11',
            dataIndex: 'wk11',
            key: 'wk11',
            render: (_, obj) => <p>{obj?.week_11_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK12',
            dataIndex: 'wk12',
            key: 'wk12',
            render: (_, obj) => <p>{obj?.week_12_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK13',
            dataIndex: 'wk13',
            key: 'wk13',
            render: (_, obj) => <p>{obj?.week_13_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'WK14',
            dataIndex: 'wk14',
            key: 'wk14',
            render: (_, obj) => <p>{obj?.week_14_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK15',
            dataIndex: 'wk15',
            key: 'wk15',
            render: (_, obj) => <p>{obj?.week_15_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK16',
            dataIndex: 'wk16',
            key: 'wk11',
            render: (_, obj) => <p>{obj?.week_16_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'WK17',
            dataIndex: 'wk17',
            key: 'wk11',
            render: (_, obj) => <p>{obj?.week_17_score || '-'}</p>,
          },
          {
            width: 100,
            title: 'WK18',
            dataIndex: 'wk18',
            key: 'wk11',
            render: (_, obj) => <p>{obj?.week_18_score || '-'}</p>,
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
            render: (_, obj) => <p>{obj?.week_19_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD2',
            dataIndex: 'rd2',
            key: 'rd2',
            render: (_, obj) => <p>{obj?.week_20_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD3',
            dataIndex: 'rd3',
            key: 'rd1',
            render: (_, obj) => <p>{obj?.week_21_score || '-'}</p>,
          },

          {
            width: 30,
            title: 'SB',
            dataIndex: 'sb',
            key: 'sb',
            render: (_, obj) => <p>{obj?.week_23_score || '-'}</p>,
          },

          {
            width: 30,
            title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
            dataIndex: 'totalPts',
            key: 'totalPts',
            render: (_, obj) => <p>{obj?.post_season_pts?.toFixed(2) || '-'}</p>,
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
              return <p>{ppg || '0'}</p>
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
          // console.log('weekNumber', weekNumber)

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
        render: (_, obj) => {
          const weekNumber = Number(checkweek)

          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`

          const offensiveRatio = obj?.[offensivescoreKey] ?? 0

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averageSnapPercentage =
            gamesPlayed > 0 ? (offensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              {/* <p>{averageSnapPercentage}%</p> */}
              <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>
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
          // console.log('weekNumber', weekNumber)

          // Construct the key dynamically based on the week
          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[offensivescoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>{obj?.[offensivescoreKey] ? (obj[offensivescoreKey] * 100).toFixed(0) + '%' : '-'}</p>

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
              // console.log('weekNumber', weekNumber)

              // Construct the key dynamically based on the week
              const RushingAttempts = `week_${weekNumber}_RushingAttempts`
              // console.log('RushingAttempts', RushingAttempts)

              return (
                <div>
                  <p>{obj?.[RushingAttempts] ?? '-'}</p>
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
              // console.log('my obj', obj)
              // Ensure week is a number
              const weekNumber = Number(checkweek)
              // console.log('weekNumber', weekNumber)

              // Construct the key dynamically based on the week
              const RushingYards = `week_${weekNumber}_RushingYards`
              //  console.log('insdoe RushingYards',RushingYards);
              //  console.log('obj?.[RushingYards]',obj?.[RushingYards]);
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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
          console.log('weekNumber', weekNumber)

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
        render: (_, obj) => {
          const weekNumber = Number(checkweek)

          const defensivecoreKey = `week_${weekNumber}_DefensiveRatio`

          const defensiveRatio = obj?.[defensivecoreKey] ?? 0

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averageSnapPercentage =
            gamesPlayed > 0 ? (defensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              {/* <p>{averageSnapPercentage}%</p> */}
              <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>

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
          // console.log('weekNumber', weekNumber)

          // Construct the key dynamically based on the week
          const defensivecoreKey = `week_${weekNumber}_DefensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[defensivecoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>{obj?.[defensivecoreKey] ? (obj[defensivecoreKey] * 100).toFixed(0) + '%' : '-'}</p>

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
          // console.log('weekNumber', weekNumber)

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
          // console.log('weekNumber', weekNumber)

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
          // console.log('weekNumber', weekNumber)

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
          // console.log('weekNumber', weekNumber)

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
          console.log('weekNumber', weekNumber)

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
          console.log('weekNumber', weekNumber)

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
          console.log('weekNumber', weekNumber)

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
          console.log('weekNumber', weekNumber)

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
          // console.log('weekNumber', weekNumber)

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
        render: (_, obj) => {
          const weekNumber = Number(checkweek)

          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`

          const offensiveRatio = obj?.[offensivescoreKey] ?? 0

          // Ensure nflGamesPlayed is a number and not zero
          const gamesPlayed = Number(obj.nflGamesPlayed)
          const averageSnapPercentage =
            gamesPlayed > 0 ? (offensiveRatio / gamesPlayed).toFixed(2) : '-'

          return (
            <div>
              {/* <p>{averageSnapPercentage}%</p> */}
              <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>

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
          // console.log('weekNumber', weekNumber)

          // Construct the key dynamically based on the week
          const offensivescoreKey = `week_${weekNumber}_OffensiveRatio`
          return (
            <div>
              {/* <p>{obj?.[offensivescoreKey].toFixed(2) ?? '-'}%</p> */}
              <p>{obj?.[offensivescoreKey] ? (obj[offensivescoreKey] * 100).toFixed(0) + '%' : '-'}</p>

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
        title: 'TEAM RUSHED SACKS',
        dataIndex: 'teamrushedsacks',
        key: 'teamrushedsacks',
        render: (_, obj) => {
          const weekNumber = Number(checkweek)
          const OL_TimesSacked = `week_${weekNumber}_TimesSacked`
          const timesSackedValue = obj?.[OL_TimesSacked]

          // Calculate the value, ensuring that NaN or undefined are handled
          const calculatedValue = 15 - (isNaN(timesSackedValue) ? 0 : Number(timesSackedValue))

          return (
            <div>
              <p>{calculatedValue || '0'}</p>
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
          // console.log('weekNumber', weekNumber)

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
            render: (_, obj) => {
              const weekNumber = Number(checkweek)

              const specialteamscoreKey = `week_${weekNumber}_SpecialTeamsRatio`

              const specialteamRatio = obj?.[specialteamscoreKey] ?? 0

              // Ensure nflGamesPlayed is a number and not zero
              const gamesPlayed = Number(obj.nflGamesPlayed)
              const averageSnapPercentage =
                gamesPlayed > 0 ? (specialteamRatio / gamesPlayed).toFixed(2) : '-'

              return (
                <div>
                  {/* <p>{averageSnapPercentage}%</p> */}
                  <p>{(averageSnapPercentage * 100).toFixed(0)}%</p>

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
              // console.log('weekNumber', weekNumber)

              // Construct the key dynamically based on the week
              const specialteamscoreKey = `week_${weekNumber}_SpecialTeamsRatio`
              return (
                <div>
                  {/* <p>{obj?.[specialteamscoreKey].toFixed(2) ?? '-'}%</p> */}
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
              console.log('weekNumber', weekNumber)

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
              console.log('weekNumber', weekNumber)

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
              console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)
              console.log('my obj', obj)

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
              // console.log('weekNumber', weekNumber)

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
              console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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
              console.log('weekNumber', weekNumber)

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
              // console.log('weekNumber', weekNumber)

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

    if (position === 'DL' || position === 'LB' || position === 'DB') {
      return [...columns, ...columns4]
    }

    if (position === 'OL') {
      return [...columns, ...columns5]
    }

    if (position === 'ST') {
      return [...columns, ...columns6]
    }
  }
  const handlePagination = (val) => setPage(val)

  const onFieldClear = () => {
    setSearch('')
  }

  const handleCreateAuction = async (playerID, player_id, CapHit) => {
    setLoading(true)

    // console.log('playerID',playerID);
    // console.log('player_id',player_id);
    // console.log('CapHit',CapHit);

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
      CapHit : (CapHit === 0) ? 1 : (CapHit === undefined ? 1 : CapHit),
    })
    if (res) {
      setLoading(false)
      navigate('/player-auction')
    }
    setPlayerID('')
  }
  // console.log('total data',data);

  // console.log('allPlayers?.players',allPlayers?.players);

  return (
    <div className='_searchPlayerContainer'>
      <Header />
      <hr className='divider' />
      <header>
        <h2>
          PLAYER<b> SEARCH</b>
        </h2>
        <PositionComponent position={position} setPosition={setPosition} />
        <div className='_searchBox'>
          <p>
            PLAYER<b>NAME</b>
          </p>
          <Input
            value={search}
            className='_searchInput'
            size='small'
            placeholder='Type Name...'
            suffix={<LiaSearchSolid size={20} style={{ color: '#00DDE9' }} />}
            onChange={(e) => {
              setSearch(e.target.value)
              if (e.target.value === '') {
                onFieldClear()
              }
            }}
            allowClear={{
              clearIcon: (
                <IoIosClose
                  size={25}
                  style={{ color: '#00DDE9', marginBottom: '-4px' }}
                  onClick={() => {}}
                />
              ),
            }}
          />
        </div>
      </header>
      <section>
        <div className='new_table_container _tableContainer'>
          <div className='_filterBox'>
            <Select
              value={playerType}
              style={{ width: 180 }}
              onChange={(val) => setPlayerType(val)}
              options={[
                {
                  value: 'All',
                  label: 'All',
                },
                {
                  value: 'FreeAgents',
                  label: 'Free Agents',
                },
                {
                  value: 'Rookie',
                  label: 'Rookie Players',
                },
              ]}
            />
            <Select
              value={year}
              style={{ width: 120 }}
              onChange={(val) => setYear(val)}
              options={[
                {
                  value: 2024,
                  label: 2024,
                },
                {
                  value: 2023,
                  label: 2023,
                },
                {
                  value: 2022,
                  label: 2022,
                },
                {
                  value: 2021,
                  label: 2021,
                },
              ]}
            />
            {/* <Select
              value={checkweek}
              style={{ width: 120 }}
              onChange={(val) => setCheckWeek(val)}
              options={weekOptions}
            /> */}

            {position !== 'ALL' && (
              <Select
                value={checkweek}
                style={{ width: 120 }}
                onChange={(val) => setCheckWeek(val)}
                options={weekOptions}
              />
            )}
          </div>
          <Table
            loading={loading}
            dataSource={data}
            // dataSource={allPlayers?.players}
            total={totalCount}
            // columns={columns}
            columns={getColumns(position)}
            bordered={false}
            pagination={false}
            scroll={{ x: 1700 }}
            rowKey='_id'
          />
        </div>
        <div className='custom_pagination_box pagination_box'>
          <AntPagination
            defaultCurrent={page}
            total={totalCount}
            showSizeChanger={false}
            onChange={handlePagination}
            pageSize={limit}
          />
        </div>
      </section>
    </div>
  )
}

export default SearchPlayer
