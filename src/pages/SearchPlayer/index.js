import React, { useEffect, useState } from 'react'
import { Input, Pagination as AntPagination, Table, Select } from 'antd'

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

const SearchPlayer = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [year, setYear] = useState(moment().format('2023'))
  const currentweek = SETTING?.week ?? 1;
  const [week, setWeek] = useState(currentweek);
  const [totalCount, setTotalCount] = useState(0)

  // console.log('SETTING',SETTING?.week);
  

  console.log('data', data)
  console.log('page', page)

  console.log('week', week)

  const getData = async () => {
    console.log('inide position', position)
    const res = await getPlayerForWeeklyScoring({ page, position })
    setTotalCount(res?.total)
    // console.log('res',res);

    return res?.players
  }

  const getWeeklyScoring = async () => {
    setLoading(true)
    let tempWeeks = []
    // for (let i = 1; i <= SETTING?.week; i++) {
    for (let i = 1; i <= 18; i++) {
      tempWeeks.push(i)
    }
    setWeek(tempWeeks)

    const res = await getData()

    console.log('here res', res)

    let tempResultArr = []
    res?.map((item) => {
      console.log('item', item)

      let tempObj = {}

      tempWeeks?.map((week) => {
        const filteredObj = item?.player?.weeklyScoring?.filter(
          (wScore) => Number(wScore?.week) == Number(week),
        )?.[0]
        tempObj = {
          ...tempObj,
          [`week_${week}_score`]: filteredObj?.score,
          week,
        }
      })

      console.log('tempObj', tempObj)

      tempObj = {
        ...tempObj,
        name: item?.player?.Name,
        PlayerID: item?.player?.PlayerID,
        position: item?.player?.Position,
        pf: item?.player?.pf?.toFixed(2),
        avgPf: item?.player?.avgPf?.toFixed(2),
        nflGamesPlayed: item?.player?.nflGamesPlayed,

        // RUSHING

        RushingAttempts: item?.stats?.stats?.RushingAttempts.toFixed(2),
        RushingYards: item?.stats?.stats?.RushingYards.toFixed(2),
        RushingTouchdowns: item?.stats?.stats?.RushingTouchdowns.toFixed(2),

        // RECEIVING

        ReceivingTargets: item?.stats?.stats?.ReceivingTargets.toFixed(2),
        ReceivingYards: item?.stats?.stats?.ReceivingYards.toFixed(2),
        ReceivingTouchdowns: item?.stats?.stats?.ReceivingTouchdowns.toFixed(2),
        Receptions: item?.stats?.stats?.Receptions.toFixed(2),

        // PASSING

        PassingAttempts: item?.stats?.stats?.PassingAttempts.toFixed(2),
        PassingYards: item?.stats?.stats?.PassingYards.toFixed(2),
        PassingTouchdowns: item?.stats?.stats?.PassingTouchdowns.toFixed(2),
        PassingSacks: item?.stats?.stats?.PassingSacks.toFixed(2),
        PassingCompletions: item?.stats?.stats?.PassingCompletions.toFixed(2),

        // RETURN

        PuntReturnYards: item?.stats?.stats?.PuntReturnYards.toFixed(2),
        PuntReturns: item?.stats?.stats?.PuntReturns.toFixed(2),
        KickReturnYards: item?.stats?.stats?.KickReturnYards.toFixed(2),
        KickReturns: item?.stats?.stats?.KickReturns.toFixed(2),

        // DEFENDER STATS

        IDP: item?.stats?.stats?.IDP.toFixed(2),
        SCKS: item?.stats?.stats?.SCKS.toFixed(2),
        QBH: item?.stats?.stats?.QBH.toFixed(2),
        TKLS: item?.stats?.stats?.TKLS.toFixed(2),
        TFL: item?.stats?.stats?.TFL.toFixed(2),
        FF: item?.stats?.stats?.FF.toFixed(2),
        INTS: item?.stats?.stats?.INTS.toFixed(2),
        PD: item?.stats?.stats?.PD.toFixed(2),
        FumblesRecovered: item?.stats?.stats?.FumblesRecovered.toFixed(2),
        SpecialTeamsTouchdowns: item?.stats?.stats?.SpecialTeamsTouchdowns.toFixed(2),

        // OL STATS

        SNAPS: item?.stats?.OL?.totalSnap
          ? (Number.isInteger(item?.stats?.OL?.totalSnap)
              ? item.stats.OL.totalSnap.toFixed(0)
              : item.stats.OL.totalSnap.toFixed(2)) + '%'
          : '-',

        OL_PassingTouchdowns: item?.stats?.OL?.PassingTouchdowns?.toFixed(2),
        OL_RushingTouchdowns: item?.stats?.OL?.RushingTouchdowns?.toFixed(2),
        OL_RushingYards: item?.stats?.OL?.RushingYards?.toFixed(2),
        OL_TimesSacked: item?.stats?.OL?.TimesSacked?.toFixed(2),
        OL_SACKSGIVENUP: 15 - item?.stats?.OL.TimesSacked,

        OL_AVG_SNAP:
          item?.stats?.OL?.totalSnap && item?.stats?.OL?.NoOfWeeks
            ? (() => {
                const avgSnap = item.stats.OL.totalSnap / item.stats.OL.NoOfWeeks
                return avgSnap % 1 === 0 ? avgSnap.toFixed(0) + '%' : avgSnap.toFixed(2) + '%'
              })()
            : '-',

        OL_TotalTeamScore: item?.stats?.OL?.TotalTeamScore.toFixed(2),

        // KICKER AND PUNTERS

        FGMissed: item?.stats?.stats?.FGMissed.toFixed(2),
        Punts: item?.stats?.stats?.Punts.toFixed(2),
        PuntInside20: item?.stats?.stats?.PuntInside20.toFixed(2),
        FieldGoalsAttempted: item?.stats?.stats?.FieldGoalsAttempted.toFixed(2),
        FGM0TO19: item?.stats?.stats?.FGM0TO19.toFixed(2),
        FGM20TO29: item?.stats?.stats?.FGM20TO29.toFixed(2),
        FGM30TO39: item?.stats?.stats?.FGM30TO39.toFixed(2),
        FGM40TO49: item?.stats?.stats?.FGM40TO49.toFixed(2),
        FGM50: item?.stats?.stats?.FGM50.toFixed(2),
        ExtraPointsMade: item?.stats?.stats?.ExtraPointsMade.toFixed(2),

        ExtraPointsAttempted: item?.stats?.stats?.ExtraPointsAttempted.toFixed(2),

        PuntYards: item?.stats?.stats?.PuntYards.toFixed(2),
        PuntsHadBlocked: item?.stats?.stats?.PuntsHadBlocked.toFixed(2),
      }

      tempResultArr.push(tempObj)
    })

    setData(tempResultArr)

    setLoading(false)
  }

  useEffect(() => {
    getWeeklyScoring()
  }, [page, position])

  const getColumns = (position) => {
    console.log('🚀 ~ getColumns ~ position:', position)

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

      // render: (_, obj) => {
      //   //  console.log('obj', obj)
      //   // console.log('FieldGoalsMade', obj?.stats?.stats?.FieldGoalsMade)

      //   const inj = obj?.player?.InjuryStatus
      //   const rookie = obj?.player?.ExperienceString
      //   // console.log('rookie', rookie)
      //   return (
      //     <div className='table_player_name_box nrc_container'>
      //       <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
      //         {obj?.player?.Name}{' '}
      //       </p>{' '}
      //       {/* <p>
      //     {obj?.Position} - {obj?.Team}{' '}
      //   </p> */}
      //       {rookie === 'Rookie' ? (
      //         <Image width={20} className='rookie_image2' src={rookieimg} alt='rookie Image' />
      //       ) : (
      //         ''
      //       )}
      //       {/* <Image width={20} className='rookie_image2'  src={rookieimg} alt='rookie Image' /> */}
      //       {inj === 'Out' ? (
      //         <>
      //           <span className='injury_plus'>
      //             <b>+</b>
      //           </span>
      //           <p className='injury_plus_text'>O</p>
      //         </>
      //       ) : inj === 'Questionable' ? (
      //         <p className='injury_status'>Q</p>
      //       ) : inj === 'Doubtful' ? (
      //         <p className='injury_status'>D</p>
      //       ) : inj === 'Suspended' ? (
      //         <p className='injury_status'>SSPD</p>
      //       ) : inj === 'Injured Reserve' ? (
      //         <p className='injury_status'>IR</p>
      //       ) : (
      //         ''
      //       )}
      //     </div>
      //   )
      // },

      // {
      //   width: 30,
      //   title: 'PLAYER NAME',
      //   dataIndex: 'Name',
      //   key: 'Name',
      //   render: (t, obj) => {

      //     return (

      //        <p> {obj?.player?.Position}{' '}</p>
      //       <PlayerDetailsModal
      //         button={<span className='fa_p_name name_text_hover'>{t || '-'}</span>}
      //         state={{
      //           playerID: obj?.PlayerID,
      //           teamId: null,
      //           teamName: '',
      //           teamLogo: null,
      //           isFreeAgent: {
      //             status: true,
      //           },
      //         }}
      //       />

      //     )

      //   },
      // },

      {
        width: 30,
        title: 'PLAYER NAME',
        dataIndex: 'Name',
        key: 'Name',
        render: (t, obj) => (
          <div>
            <p>{obj?.name || '-'}</p>
            <PlayerDetailsModal
              button={<span className='fa_p_name name_text_hover'></span>}
              state={{
                playerID: obj?.PlayerID,
                teamId: null,
                teamName: '',
                teamLogo: null,
                isFreeAgent: {
                  status: true,
                },
              }}
            />
          </div>
        ),
      },

      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>OWNED BY</p>,
        dataIndex: 'HostedHeadshotNoBackgroundUrl',
        key: 'HostedHeadshotNoBackgroundUrl',
        render: (t) => {
          return (
            <div className='squad_image_box'>
              {t ? (
                <img src={t} alt={'Player'} style={{ height: '20px', width: 'auto' }} />
              ) : (
                <GiAmericanFootballPlayer size={25} color={'#c4c4c4'} />
              )}
            </div>
          )
        },
        width: 60,
      },
      {
        width: 30,
        title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
        dataIndex: 'totalPts',
        key: 'totalPts',
        render: (_, obj) => <p>{obj?.pf || '-'}</p>,
      },
      {
        width: 30,
        title: 'PPG',
        dataIndex: 'playerScore',
        key: 'playerScore',
        render: (_, obj) => <p>{obj?.avgPf || '-'}</p>,
      },
      //   {
      //     title: 'SCORE',
      //     dataIndex: 'score',
      //     key: 'score',
      //     render: (_, obj) => <p>{obj?.score || '-'}</p>,
      //   },
      //   {
      //     title: <p style={{ lineHeight: 1 }}>AVERAGE SNAP %</p>,
      //     dataIndex: 'avgSnap',
      //     key: 'avgSnap',
      //     render: (t) => <p>{t || '-'}</p>,
      //     width: 100,
      //   },
      //   {
      //     title: 'SNAP %',
      //     dataIndex: 'snap',
      //     key: 'snap',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'TACKLE',
      //     dataIndex: 'tackle',
      //     key: 'tackle',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: <p style={{ lineHeight: 1 }}>TACKLE FOR LOSS</p>,
      //     dataIndex: 'tackleForLoss',
      //     key: 'tackleForLoss',
      //     render: (t) => <p>{t || '-'}</p>,
      //     width: 100,
      //   },
      //   {
      //     title: 'SACK',
      //     dataIndex: 'sack',
      //     key: 'sack',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: <p style={{ lineHeight: 1 }}>FORCED FUMBLE</p>,
      //     dataIndex: 'forcedFumble',
      //     key: 'forcedFumble',
      //     render: (t) => <p>{t || '-'}</p>,
      //     width: 80,
      //   },
      //   {
      //     title: <p style={{ lineHeight: 1 }}>FUMBLE RECOVERY</p>,
      //     dataIndex: 'sumbleRecovery',
      //     key: 'sumbleRecovery',
      //     render: (t) => <p>{t || '-'}</p>,
      //     width: 80,
      //   },
      //   {
      //     title: <p style={{ lineHeight: 1 }}>PASS DEFENDED</p>,
      //     dataIndex: 'passDefended',
      //     key: 'passDefended',
      //     render: (t) => <p>{t || '-'}</p>,
      //     width: 80,
      //   },
      //   {
      //     title: 'INTERCEPTION',
      //     dataIndex: 'interception',
      //     key: 'interception',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'TOUCHDOWN',
      //     dataIndex: 'touchdown',
      //     key: 'touchdown',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'KR',
      //     dataIndex: 'kr',
      //     key: 'kr',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'KR YARDS',
      //     dataIndex: 'krYards',
      //     key: 'krYards',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'PR',
      //     dataIndex: 'pr',
      //     key: 'pr',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'PR YARDS',
      //     dataIndex: 'prYards',
      //     key: 'prYards',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
      //   {
      //     title: 'ST TD',
      //     dataIndex: 'stTd',
      //     key: 'stTd',
      //     render: (t) => <p>{t || '-'}</p>,
      //   },
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
            width: 30,
            title: 'WK18',
            dataIndex: 'wk18',
            key: 'wk11',
            render: (_, obj) => <p>{obj?.week_18_score || '-'}</p>,
          },

          {
            width: 30,
            title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
            dataIndex: 'totalPts',
            key: 'totalPts',
            render: (_, obj) => <p>{obj?.week_19_score || '-'}</p>,
          },
          {
            width: 30,
            title: 'Average PPG',
            dataIndex: 'playerScore',
            key: 'playerScore',
            render: (_, obj) => <p>{obj?.avgPf || '-'}</p>,
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
            render: (_, obj) => <p>{obj?.pts || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD2',
            dataIndex: 'rd2',
            key: 'rd2',
            render: (_, obj) => <p>{obj?.pts || '-'}</p>,
          },

          {
            width: 30,
            title: 'RD3',
            dataIndex: 'rd3',
            key: 'rd1',
            render: (_, obj) => <p>{obj?.pts || '-'}</p>,
          },

          {
            width: 30,
            title: 'SB',
            dataIndex: 'sb',
            key: 'sb',
            render: (_, obj) => <p>{obj?.pts || '-'}</p>,
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
          const weekNumber = Number(week);
          // Construct the key dynamically based on the week
          const scoreKey = `week_${weekNumber}_score`;
          return (
            <div className='_positionColumn'>
              <p>{obj?.[scoreKey] ?? '-'}</p>
            </div>
          );
        },
      },

      {
        width: 30,
        title: 'AVERAGE SNAP %',
        dataIndex: 'averagesnap%',
        key: 'averagesnap',
        render: (_, obj) => (
          <div className='_positionColumn'>
            <p>{obj?.Position || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'SNAP %',
        dataIndex: 'snap%',
        key: 'snap',
        render: (_, obj) => (
          <div>
            <p>{obj?.SNAPS || '-'}</p>
          </div>
        ),
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
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.RushingAttempts || '-'}</p>
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
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.RushingYards || '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.RushingTouchdowns || '-'}
                  </p>
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
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.ReceivingTargets || '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'REC',
            dataIndex: 'rec',
            key: 'rec',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.Receptions || '-'}
                  </p>
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
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.ReceivingYards || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'td',
            key: 'td',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.ReceivingTouchdowns || '-'}
                  </p>
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
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PassingCompletions || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'ATT',
            dataIndex: 'att',
            key: 'att',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PassingAttempts || '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'YRD',
            dataIndex: 'yrd',
            key: 'yrd',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PassingYards || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'TD',
            dataIndex: 'taf',
            key: 'taf',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PassingTouchdowns || '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'SACKED',
            dataIndex: 'sacked',
            key: 'sacked',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.PassingSacks || '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'INT THROWN',
            dataIndex: 'intthrown',
            key: 'intthrown',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.INTS || '-'}
                  </p>
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
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.KickReturns || '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'KR YARDS',
            dataIndex: 'kryrd',
            key: 'kryrd',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.KickReturnYards || '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'PR',
            dataIndex: 'pr',
            key: 'Pr',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.PuntReturns || '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PR YARDS',
            dataIndex: 'pryrd',
            key: 'pryrd',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.PuntReturnYards || '-'}</p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'STID',
            dataIndex: 'stid',
            key: 'stid',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.SpecialTeamsTouchdowns || '-'}
                  </p>
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
        render: (_, obj) => (
          <div className='_positionColumn'>
            <p>{obj?.Position || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'TACKLE',
        dataIndex: 'tackel',
        key: 'tackel',
        render: (_, obj) => (
          <div>
            <p>{obj?.TKLS || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'TACKLE FOR LOSS',
        dataIndex: 'tackelforloss',
        key: 'tackelforloss',
        render: (_, obj) => (
          <div>
            <p>{obj?.TFL || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'SACKED',
        dataIndex: 'sacked',
        key: 'sacked',
        render: (_, obj) => (
          <div>
            <p>{obj?.SCKS || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'FORCED FUBMBLE',
        dataIndex: 'forcedfumble',
        key: 'forcedfumble',
        render: (_, obj) => (
          <div>
            <p>{obj?.FF || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'FUBMBLE RECOVERY',
        dataIndex: 'forcedrecovery',
        key: 'forcedrecovery',
        render: (_, obj) => (
          <div>
            <p>{obj?.FumblesRecovered || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'PASS DEFENDED',
        dataIndex: 'passdefended',
        key: 'passdefended',
        render: (_, obj) => (
          <div>
            <p>{obj?.PD || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'INTERCEPTIONS',
        dataIndex: 'interceptions',
        key: 'interceptions',
        render: (_, obj) => (
          <div>
            <p>{obj?.INTS || '-'}</p>
          </div>
        ),
      },

      {
        width: 30,
        title: 'TOUCHDOWN',
        dataIndex: 'tocuhdown',
        key: 'tocuhdown',
        render: (_, obj) => (
          <div>
            <p>{obj?.SpecialTeamsTouchdowns || '-'}</p>
          </div>
        ),
      },
    ]

    const columns5 = [
      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => (
          <div className='_positionColumn'>
            <p>{obj?.OL_TotalTeamScore || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'AVERAGE SNAP %',
        dataIndex: 'averagesnap%',
        key: 'averagesnap',
        render: (_, obj) => (
          <div>
            <p>{obj?.OL_AVG_SNAP || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'SNAP %',
        dataIndex: 'snap%',
        key: 'snap',
        render: (_, obj) => (
          <div>
            <p>{obj?.SNAPS || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'SACKS GIVENUP',
        dataIndex: 'sacksgivenup',
        key: 'sacksgivenup',
        render: (_, obj) => (
          <div className=''>
            <p>{obj?.OL_SACKSGIVENUP || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'TEAM RUSHED SACKS',
        dataIndex: 'teamrushedsacks',
        key: 'teamrushedsacks',
        render: (_, obj) => (
          <div>
            <p>{obj?.OL_TimesSacked || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'TEAM RUSHING TD',
        dataIndex: 'teamrushedtd',
        key: 'teamrushedtd',
        render: (_, obj) => (
          <div>
            <p>{obj?.OL_RushingTouchdowns || '-'}</p>
          </div>
        ),
      },

      {
        width: 50,
        title: 'TEAM PASSING TD',
        dataIndex: 'teampassingtd',
        key: 'teampassingtd',
        render: (_, obj) => (
          <div>
            <p>{obj?.OL_PassingTouchdowns || '-'}</p>
          </div>
        ),
      },
    ]

    const columns6 = [
      {
        width: 50,
        title: 'SCORE',
        dataIndex: 'score',
        key: 'score',
        render: (_, obj) => (
          <div className='_positionColumn'>
            <p>{obj?.Position || '-'}</p>
          </div>
        ),
      },

      {
        // width: 150,
        title: 'KICKING',
        dataIndex: 'kick',
        key: 'kick',
        children: [
          {
            width: 30,
            title: 'FGA',
            dataIndex: 'fga',
            key: 'fga',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.FieldGoalsAttempted || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'FGM',
            dataIndex: 'fgm',
            key: 'fgm',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.FGMissed || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'FGM 30-39',
            dataIndex: 'fgm30',
            key: 'fgm30',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.FGM30TO39 || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'FGM 40-49',
            dataIndex: 'fgm40',
            key: 'fgm40',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.FGM40TO49 || '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'FGM 50+',
            dataIndex: 'fgm50',
            key: 'fgm50',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.FGM50 || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'XPA',
            dataIndex: 'xpa',
            key: 'xpa',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.ExtraPointsAttempted || '-'}
                  </p>
                </div>
              )
            },
          },

          {
            width: 30,
            title: 'XPM',
            dataIndex: 'xpm',
            key: 'xpm',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.ExtraPointsMade || '-'}
                  </p>
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
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p>{obj?.Punts || '-'}</p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PUNTS YARDS',
            dataIndex: 'puntyards',
            key: 'puntyards',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PuntYards || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'PUNTS INSIDE 20',
            dataIndex: 'puntsinside',
            key: 'puntsinside',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PuntInside20 || '-'}
                  </p>
                </div>
              )
            },
          },
          {
            width: 30,
            title: 'BLOCKS',
            dataIndex: 'blocks',
            key: 'blocks',
            render: (_, obj) => {
              return (
                <div className='table_player_name_box nrc_container'>
                  <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
                    {obj?.PuntsHadBlocked || '-'}
                  </p>
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

  // console.log('allPlayers?.players',allPlayers?.players);

  return (
    <div className='_searchPlayerContainer'>
      <Header />
      <hr className='divider' />
      <header>
        <h2>
          PLAYER<b>SEARCH</b>
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
              value={position}
              style={{ width: 320 }}
              onChange={(val) => setPosition(val)}
              options={[
                {
                  value: 'ALL',
                  label: 'ALL',
                },
                {
                  value: 'QB',
                  label: 'QB',
                },
                {
                  value: 'RB',
                  label: 'RB',
                },
                {
                  value: 'WR',
                  label: 'WR',
                },
                {
                  value: 'TE',
                  label: 'TE',
                },
                {
                  value: 'OL',
                  label: 'OL',
                },
                {
                  value: 'DL',
                  label: 'DL',
                },
                {
                  value: 'LB',
                  label: 'LB',
                },
                {
                  value: 'DB',
                  label: 'DB',
                },

                {
                  value: 'ST',
                  label: 'ST',
                },
              ]}
            />
            <Select
              value={year}
              style={{ width: 320 }}
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
              ]}
            />
            <Select
              value={week}
              style={{ width: 320 }}
              onChange={(val) => setWeek(val)}
              options={[
                {
                  value: 1,
                  label: 'Week 1',
                },
                {
                  value: 2,
                  label: 'Week 2',
                },
                {
                  value: 3,
                  label: 'Week 3',
                },
                {
                  value: 4,
                  label: 'Week 4',
                },
                {
                  value: 5,
                  label: 'Week 5',
                },
                {
                  value: 6,
                  label: 'Week 6',
                },
                {
                  value: 7,
                  label: 'Week 7',
                },
                {
                  value: 8,
                  label: 'Week 8',
                },
                {
                  value: 9,
                  label: 'Week 9',
                },
                {
                  value: 10,
                  label: 'Week 10',
                },
              ]}
            />
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
            total={data?.length}
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
