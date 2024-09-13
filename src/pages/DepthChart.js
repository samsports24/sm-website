// import React, { useEffect, useState } from 'react'

// import { Button, Select } from 'antd'

// // Component
// import Header from '../components/Header'
// import DepthCard from '../components/DepthCard'
// import Loader from '../components/Loader'
// import ConfirmationModal from '../components/modal/ConfirmationModal'
// import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

// // Mock Data
// import { depthCardData } from './mockData'

// import { clearDepthChart, getActiveRosterCount } from '../redux/actions/depthChartAction'
// import { activeRosterCount, legalPlayers, nonActivePlayers } from '../config/constants'

// import { useSelector } from 'react-redux'
// import { useLocation, useParams } from 'react-router-dom'

// const DepthChart = () => {
//   const USER = useSelector((state) => state?.user)
//   const [activeFilter, setActiveFilter] = useState('offense')
//   const [data, setData] = useState([])
//   const [activeCount, setActiveCount] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [clearBtnLoading, setClearBtnLoading] = useState(false)
//   const [filterKey] = useState({
//     offense: 'offense',
//     defense: 'defense',
//   })

//    const { teamID } = useParams()
//   const { state } = useLocation()
//   console.log('legalPlayers',legalPlayers);

//   const handleFilter = (value) => {
//     setActiveFilter(value)
//   }

//   useEffect(() => {
//     getDepthChartData()
//   }, [activeFilter, USER?.setting?.week])

//   const getDepthChartData = async () => {
//     const filtered = depthCardData.filter((obj) => obj.type === activeFilter)
//     setLoading(true)

//     const res = await getActiveRosterCount({
//       type: activeFilter,
//       week: USER?.setting?.week,
//        teamId: teamID ? teamID : null,
//       // teamId: state?.teamId !== undefined ? state.teamId : null,

//     })

//     if (res) {
//       console.log('res?.data',res?.data);
//       console.log('res',res?.count);
//       setActiveCount(res?.count)
//       if (res?.data?.length > 0) {
//         res?.data.map((item) => {
//           let index = filtered.findIndex((item2) => {
//             return item2.classKey === item.classKey
//           })
//           if (index !== -1) {
//             filtered.splice(index, 1, {
//               imageUrl: item?.player?.HostedHeadshotNoBackgroundUrl || filtered[index].imageUrl,
//               Name: item?.player?.Name,
//               Opponent: item?.player?.UpcomingGameOpponent,
//               Team: item?.player?.Team,
//               InjuryStatus: item?.player?.InjuryStatus,
//               Position: filtered[index].Position,
//               classKey: filtered[index].classKey,
//               type: filtered[index].type,
//               isPlayerLocked: item?.player?.isPlayerLocked ? item?.player?.isPlayerLocked : false,
//               _id: item?.player?._id ? item?.player?._id : false,
//             })
//           }
//         })
//         setData([...filtered])
//       } else {
//         setData([...filtered])
//       }
//     }
//     setLoading(false)
//   }

//   const clearDepthChartRoster = async () => {
//     setClearBtnLoading(true)
//     let playerIds = []
//     data?.forEach((v) => {
//       if (!v?.isPlayerLocked && v?._id) {
//         playerIds.push(v?._id)
//       }
//     })
//     const res = await clearDepthChart({
//       type: activeFilter,
//       ids: playerIds,
//     })
//     setClearBtnLoading(false)
//     if (res) {
//       await getDepthChartData()
//     }
//   }

//    console.log('activeCount',activeCount);

//    const offenseOptions = [
//     { value: 'pistol', label: 'Pistol Formation' },
//     { value: 'singleback', label: 'Single Back Formation' },
//     { value: 'shotgunbunch', label: 'Shotgun Bunch Formation' },
//     { value: 'shortgunnormal', label: 'Shotgun Normal Formation' },
//   ];

//   const defenseOptions = [
//     { value: '34_formation', label: '3-4 Formation' },
//     { value: '425_formation', label: '4-2-5 Formation' },
//     { value: '43_formation', label: '4-3 Formation' },
//     { value: 'dime', label: 'Dime Formation' },
//   ];

//   const options = activeFilter === 'offense' ? offenseOptions : defenseOptions

// // console.log('filterKey',filterKey);
// // console.log('activeFilter',activeFilter);

//   return (
//     <div className='depth_chart_container'>
//       <Header />
//       <HeadingAndWeek />

//       {teamID && (
//         <div className='viewing_roster_heading'>
//           <h2>Your are viewing {state?.teamName || 'other Team'} rosters.</h2>
//         </div>
//       )}

//       <div className='filter_chart_box'>
//         <Button
//           type='primary'
//           onClick={() => handleFilter(filterKey.offense)}
//           className={`${activeFilter === filterKey.offense ? 'active_filter' : ''}`}
//         >
//           OFFENSE
//         </Button>
//         <Button
//           type='primary'
//           onClick={() => handleFilter(filterKey.defense)}
//           className={`${activeFilter === filterKey.defense ? 'active_filter' : ''}`}
//         >
//           DEFENSE
//         </Button>
//       </div>

//       <Select
//               placeholder='Formation'
//              // onChange={(v) => setFilterBy(v)}
//              // allowClear={{ clearIcon: <GrFormClose size={25} onClick={() => {}} /> }}
//              options={options}
//               className='filter_select_box'
//             />

//       {loading ? (
//         <Loader />
//       ) : (
//         <section
//           className='depth_chart_content_container'
//           style={{ position: 'relative', marginTop: '20px' }}
//         >
//           {/* ILLEGAL ROSTER */}

//           {/* {!teamID && (

//             <div
//               className='overlay'
//               style={{
//                  display: activeCount != legalPlayers ? 'flex' : 'none',

//               }}
//             >
//               <h2>{`You have an illegal Roster`}</h2>
//               <h4>{`kindly have ${activeRosterCount} players and ${nonActivePlayers} non active players on the roster`}</h4>
//             </div>
//           )} */}

//           {!teamID && USER?.setting?.week == USER?.currentWeek && (
//             <div className='clear_button_box'>
//               <ConfirmationModal
//                 onClick={clearDepthChartRoster}
//                 content={{
//                   title: 'ARE YOU SURE?',
//                   mainButton: {
//                     disbaled: false,
//                     text: `Clear ${activeFilter}`,
//                   },
//                   submitButton: {
//                     disbaled: false,
//                     text: 'Confirm',
//                     loading: clearBtnLoading,
//                   },
//                 }}
//               />
//             </div>
//           )}

//           <section className='depth_chart_wrapper'>
//             <div
//               className={`depth_chart_cards ${
//                 activeFilter === filterKey.special
//                   ? 'special_team_container'
//                   : activeFilter + '_container'
//               } ${"ylo1"}`}
//             >
//               <img src={require('../assets/depth-chart-bg.png')} />
//               {data?.map((v, i) => {
//                 return (
//                   <DepthCard key={i} data={v} index={i} getDepthChartData={getDepthChartData} />
//                 )
//               })}
//             </div>
//           </section>
//         </section>
//       )}
//     </div>
//   )
// }

// export default DepthChart

import React, { useEffect, useState } from 'react'

import { Button, notification, Select } from 'antd'

// Component
import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import Loader from '../components/Loader'
import ConfirmationModal from '../components/modal/ConfirmationModal'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

// Mock Data
import { depthCardData } from './mockData'

import {
  assignLineupFormation,
  clearDepthChart,
  getActiveRosterCount,
  getteamFormation,
} from '../redux/actions/depthChartAction'
import { activeRosterCount, isLocked, legalPlayers, nonActivePlayers } from '../config/constants'

import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import shotgunbunch from "../assets/Shotgun Bunch.png"
import shotgunnormal from "../assets/Shotgun Normal.png"
import singleback from "../assets/SingleBack.png"
import pistol from "../assets/Pistol.png"

import threefour from "../assets/3-4.png"
import dime from "../assets/DIME.png"
import fourthree from "../assets/4-3_.png"
import fourtofive from "../assets/4-2-5.png"




const DepthChart = () => {
  const USER = useSelector((state) => state?.user)
  const teamId = useSelector((state) => state?.user.userDetails)
  const SETTING = useSelector((state) => state?.user?.setting)
  const [activeFilter, setActiveFilter] = useState('offense')
  const [data, setData] = useState([])
  const [activeCount, setActiveCount] = useState(null)
  console.log("🚀 ~ DepthChart ~ activeCount:", activeCount)
  const [loading, setLoading] = useState(true)
  const [clearBtnLoading, setClearBtnLoading] = useState(false)
  const [selectedValue, setSelectedValue] = useState(null)
  const [filterKey] = useState({
    offense: 'offense',
    defense: 'defense',
  })

  const { teamID } = useParams()
  const { state } = useLocation()
  const handleFilter = (value) => {
    setActiveFilter(value)
  }

  useEffect(() => {
    getDepthChartData()
  }, [activeFilter, USER?.setting?.week])

  const getFn = async () => {
    const payload = {
      week: USER?.setting?.week,
      teamId: teamId?.team?._id,
      season: USER?.setting?.season,
    }
  
    const result = await getteamFormation(payload)

    console.log('result?.offense_Formation',result?.offense_Formation);
    

    if (activeFilter === 'offense') {
      setSelectedValue(result?.offense_Formation || 'shortgunnormal')
    } else if (activeFilter === 'defense') {
      setSelectedValue(result?.defense_Formation || 'formation_43')
    }
    // console.log('result', result)
  }

  useEffect(() => {
    if (teamId?.team?._id) {
      getFn()
    }
  }, [USER?.setting?.week, teamId?.team?._id, USER?.setting?.season, activeFilter])

  const getDepthChartData = async () => {
    const filtered = depthCardData.filter((obj) => obj.type === activeFilter)
    setLoading(true)

    console.log('filtered', filtered)

    const res = await getActiveRosterCount({
      type: activeFilter,
      week: USER?.setting?.week,
      teamId: teamID ? teamID : null,
      // teamId: state?.teamId !== undefined ? state.teamId : null,
    })

    if (res) {
      console.log('res?.data', res?.data)
      console.log('res', res?.count)
      setActiveCount(res?.count)
      if (res?.data?.length > 0) {
        res?.data.map((item) => {
          if (item?.classKey === 'offense_wr-1') {
            console.log('item wr 1 name', item?.player?.Name)
          }
          if (item?.classKey === 'offense_wr-2') {
            console.log('item wr 2 name', item?.player?.Name)
          }
          let index = filtered.findIndex((item2) => {
            return item2.classKey === item.classKey
          })
          if (index !== -1) {
            filtered.splice(index, 1, {
              imageUrl: item?.player?.HostedHeadshotNoBackgroundUrl || filtered[index].imageUrl,
              Name: item?.player?.Name,
              Opponent: item?.player?.UpcomingGameOpponent,
              Team: item?.player?.Team,
              InjuryStatus: item?.player?.InjuryStatus,
              Position: filtered[index].Position,
              classKey: filtered[index].classKey,
              type: filtered[index].type,
              isPlayerLocked: item?.player?.isPlayerLocked ? item?.player?.isPlayerLocked : false,
              _id: item?.player?._id ? item?.player?._id : false,
            })
          }
        })
        setData([...filtered])
      } else {
        setData([...filtered])
      }
    }
    setLoading(false)
  }

  const clearDepthChartRoster = async () => {
    setClearBtnLoading(true)
    let playerIds = []
    data?.forEach((v) => {
      if (!v?.isPlayerLocked && v?._id) {
        playerIds.push(v?._id)
      }
    })
    const res = await clearDepthChart({
      type: activeFilter,
      ids: playerIds,
    })
    setClearBtnLoading(false)
    if (res) {
      await getDepthChartData()
    }
  }

  console.log('activeCount', activeCount)

  // const offenseOptions = [
  //   { value: 'pistol', label: 'Pistol Formation' },
  //   { value: 'singleback', label: 'Single Back Formation' },
  //   { value: 'shotgunbunch', label: 'Shotgun Bunch Formation' },
  //   { value: 'shortgunnormal', label: 'Shotgun Normal Formation' },
  // ]

  const offenseOptions = [
    { value: 'pistol', imageSrc: pistol },
    { value: 'singleback', imageSrc: singleback },
    { value: 'shotgunbunch', imageSrc: shotgunbunch },
    { value: 'shortgunnormal', imageSrc: shotgunnormal },
  ];

  // const defenseOptions = [
  //   { value: 'formation_34', label: '3-4 Formation' },
  //   { value: 'formation_425', label: '4-2-5 Formation' },
  //   { value: 'formation_43', label: '4-3 Formation' },
  //   { value: 'dime', label: 'Dime Formation' },
  // ]

  const defenseOptions = [
    { value: 'formation_34', imageSrc: threefour },
    { value: 'formation_425', imageSrc: fourtofive },
    { value: 'formation_43', imageSrc: fourthree },
    { value: 'dime', imageSrc: dime },
  ]

  const options = activeFilter === 'offense' ? offenseOptions : defenseOptions

  const handleChange = async (selectedOption) => {
    // clearDepthChartRoster()



    // setClearBtnLoading(true)
    // let playerIds = []
    // data?.forEach((v) => {
    //   if (!v?.isPlayerLocked && v?._id) {
    //     playerIds.push(v?._id)
    //   }
    // })
    // const res = await clearDepthChart({
    //   type: activeFilter,
    //   ids: playerIds,
    // })
    // setClearBtnLoading(false)
    // if (res) {
    //   await getDepthChartData()
    // }





    // setSelectedValue(selectedOption)
    // const checkpayload = {
    //   week: SETTING?.week,
    //   teamId: teamId?.team?._id,
    //   season: SETTING?.season,
    //   formation: selectedOption,
    //   activeFilter: activeFilter,
    // }

    try {
      // const response = await assignLineupFormation({ payload: checkpayload })
      // console.log('Function Response:', response.data)
    } catch (error) {
      console.error('Function Error:', error)
    }
  }



  // useEffect(() => {
  //   if (activeFilter === 'offense') {
  //     setSelectedValue('shortgunnormal');
  //   } else if (activeFilter === 'defense') {
  //     setSelectedValue('formation_43');
  //   }
  // }, [activeFilter])

  // console.log('filterKey',filterKey);
  // console.log('activeFilter',activeFilter);

  console.log('activeRosterCount',activeRosterCount);
  console.log('nonActivePlayers',nonActivePlayers);
  console.log('legalPlayers',legalPlayers);
console.log('activeCount',activeCount);

  
  
  

  return (
    <div className='depth_chart_container'>
      <Header />
      <HeadingAndWeek />

      {teamID && (
        <div className='viewing_roster_heading'>
          <h2>Your are viewing {state?.teamName || 'other Team'} rosters.</h2>
        </div>
      )}

      <div className='filter_chart_box'>
        <Button
          type='primary'
          onClick={() => handleFilter(filterKey.offense)}
          className={`${activeFilter === filterKey.offense ? 'active_filter' : ''}`}
        >
          OFFENSE
        </Button>
        <Button
          type='primary'
          onClick={() => handleFilter(filterKey.defense)}
          className={`${activeFilter === filterKey.defense ? 'active_filter' : ''}`}
        >
          DEFENSE
        </Button>
      </div>

      <div className="image-row" style={{ marginTop: '40px' }}>
        {/* <Select
          placeholder='Formation'
          // onChange={(v) => setFilterBy(v)}
          // allowClear={{ clearIcon: <GrFormClose size={25} onClick={() => {}} /> }}
          options={options}
          className='depart-chart-filter_select_box'
          value={selectedValue}
          onChange={handleChange}
          //  onChange={(selectedOption) => setSelectedValue(selectedOption)}
        /> */}


        {options.map((option) => (
          <div
            key={option.value}
            className={`image-item ${selectedValue === option.value ? 'selected' : ''}`}
            onClick={() => {
              if(teamID || isLocked()){
notification.error({
  message : "You cannot change the formation",
  duration : 3
})
              }else{
                handleChange(option.value)

              }
            }}
          >
            <img src={option.imageSrc} alt={option.value} />
          </div>
        ))}
   

      </div>

      {loading ? (
        <Loader />
      ) : (
        <section
          className='depth_chart_content_container'
          style={{ position: 'relative', marginTop: '20px' }}
        >
          {/* ILLEGAL ROSTER */}

          {!teamID && (
            
            <div
              className='overlay'
              style={{
                 display: activeCount != legalPlayers ? 'flex' : 'none',
               
              }}
            >
              <h2>{`You have an illegal Roster`}</h2>
              <h4>{`kindly have ${legalPlayers} players and ${nonActivePlayers} non active players on the roster`}</h4>
            </div>
          )}

          {!teamID && USER?.setting?.week == USER?.currentWeek && (
            <div className='clear_button_box'>
              <ConfirmationModal
                onClick={clearDepthChartRoster}
                content={{
                  title: 'ARE YOU SURE?',
                  mainButton: {
                    disbaled: false,
                    text: `Clear ${activeFilter}`,
                  },
                  submitButton: {
                    disbaled: false,
                    text: 'Confirm',
                    loading: clearBtnLoading,
                  },
                }}
              />
            </div>
          )}

          <section className='depth_chart_wrapper'>
            <div
              //   className={`depth_chart_cards ${
              //     activeFilter === filterKey.special
              //       ? 'special_team_container'
              //       : activeFilter + '_container'
              // //   } ${"pistol"}`}
              // } "${selectedValue?.value || ''}"`}

              // className={`depth_chart_cards ${
              //   selectedValue
              //     ? selectedValue
              //     : activeFilter === filterKey.special
              //     ? 'special_team_container'
              //     : `${activeFilter}_container`
              // }`}

              className={`depth_chart_cards ${
                selectedValue
                  ? selectedValue
                  : activeFilter === 'special'
                  ? 'special_team_container'
                  : ''
              }`}
            >
              <img src={require('../assets/depth-chart-bg.png')} />
              {data?.map((v, i) => {
                return (
                  <DepthCard
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    key={i}
                    data={v}
                    index={i}
                    getDepthChartData={getDepthChartData}
                  />
                )
              })}
            </div>
          </section>
        </section>
      )}
    </div>
  )
}

export default DepthChart
