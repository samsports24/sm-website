import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button, notification } from 'antd'
import Arrow from '../assets/arrow-right.svg'
// Component
import DepthCard from '../components/DepthCard'
import Header from '../components/Header'

// Mock Data
import { depthCardData } from './mockData'
import PlayerRosterCard from '../components/PlayerRosterCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import { getRoster, setNonActivePlayer, setProtectedPlayer } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'

const PlayerRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  console.log(SETTING.week)
  const [activeFilter] = useState('Roster')
  const [data, setData] = useState([])
  const [activePlayerData, setActivePlayerData] = useState([])
  const [practiveSquadData, setPractiveSquadData] = useState([])
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleNonActive = (event, id) => {
    if (event) {
      setNonActive([...nonActive, id])
    } else {
      const temp = [...nonActive]
      let keyInd = temp?.indexOf(id)
      if (keyInd !== -1) {
        temp.splice(keyInd, 1)
        setNonActive(temp)
      }
    }
  }
  const handleSubmit = async () => {
    const lineupId = activePlayerData[0]?._id
    if (nonActive?.length === 7) {
      setSubmitLoading(true)
      await setNonActivePlayer(
        {
          lineupId,
          ids: nonActive,
        },
        SETTING.week,
      )
      setSubmitLoading(false)
    } else {
      notification.error({
        message: `Select at least 7 Players (${nonActive?.length}/7)`,
        duration: 3,
      })
    }
  }

  const handleProtectedCheckbox = (event, id) => {
    if (event) {
      setProtectedCheck([...protectedCheck, id])
    } else {
      const temp = [...protectedCheck]
      let keyInd = temp?.indexOf(id)
      if (keyInd !== -1) {
        temp.splice(keyInd, 1)
        setProtectedCheck(temp)
      }
    }
  }
  const handleProtectedSubmit = async () => {
    const lineupId = practiveSquadData[0]?._id

    if (protectedCheck?.length === 4) {
      setSubmitLoading(true)
      await setProtectedPlayer(
        {
          lineupId,
          ids: protectedCheck,
        },
        SETTING.week,
      )
      setSubmitLoading(false)
    } else {
      notification.error({
        message: `Select at least 4 Players (${protectedCheck?.length}/4)`,
        duration: 3,
      })
    }
  }

  useEffect(() => {
    const filterdData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterdData)
    getData()
  }, [activeFilter])

  const getData = async () => {
    setLoading(true)
    const res = await getRoster(SETTING?.week)
    if (res) {
      // const activePlayer = res?.players?.filter(
      //   (v) => v?.inPracticeSquad == false && v?.isPlayerInjured == false,
      // )
      // const practiceSquad = res?.players?.filter(
      //   (v) => v?.inPracticeSquad === true && v?.isPlayerInjured == false,
      // )
      const nonAcitvePlayer = []
      res?.active?.forEach((v) => {
        if (v?.players?.isActive !== true) {
          nonAcitvePlayer.push(v?.players?.PlayerID)
        }
      })
      const protectedPlayer = []
      res?.practice?.forEach((v) => {
        if (v?.players?.isPlayerProtected == true) {
          protectedPlayer.push(v?.players?.PlayerID)
        }
      })
      console.log(nonAcitvePlayer)
      console.log(protectedPlayer)
      setActivePlayerData(res?.active)
      setPractiveSquadData(res?.practice)
      setNonActive(nonAcitvePlayer)
      setProtectedCheck(protectedPlayer)
    }
    setLoading(false)
  }

  return (
    <div className='player_roster_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Depth-Chart</p>,
            },
            {
              title: <p>{activeFilter}</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      {/* FILTER */}
      <ButtonsAndPagination />

      <section className='depth_chart_wrapper'>
        <div
          className={`depth_chart_cards ${
            activeFilter === 'special team' ? 'special_team_container' : activeFilter + '_container'
          }`}
        >
          {data?.map((v, i) => {
            return <DepthCard key={i} data={v} index={i} />
          })}
        </div>
      </section>

      <div className='submit_button_box'>
        <Button loading={submitLoading} onClick={handleSubmit} type='primary'>
          Submit
        </Button>
      </div>

      {/* STATS */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <section className='stats_container'>
            {activePlayerData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  // style={{ margin: '20px 0px' }}
                  key={i}
                  data={v}
                  index={i}
                  state={nonActive}
                  handleClick={handleNonActive}
                />
              )
            })}
          </section>

          <hr style={{ marginBlock: '40px' }} />

          <div className='practice_squad_header'>
            <p className='heading'>Practice Squad</p>
            <Button loading={submitLoading} onClick={handleProtectedSubmit} type='primary'>
              Submit
            </Button>
          </div>

          {/* STATS */}
          <section className='stats_container'>
            {practiveSquadData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  // style={{ margin: '20px 0px' }}
                  key={i}
                  data={v}
                  index={i}
                  state={protectedCheck}
                  handleClick={handleProtectedCheckbox}
                  isPractice={true}
                />
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerRoster
