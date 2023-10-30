import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button, notification } from 'antd'
import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import PlayerRosterCard from '../components/PlayerRosterCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import { getRoster, setNonActivePlayer, setProtectedPlayer } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import { isLocked } from '../config/constants'
import Empty from '../components/Empty'
import { draftData } from '../config/draftData'

const PlayerRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const USER = useSelector((state) => state?.user)
  const [activePlayerData, setActivePlayerData] = useState([])
  const [practiveSquadData, setPractiveSquadData] = useState([])
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
  const [playerCaps, setPlayerCaps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [draftPickData] = useState(
    draftData?.find((v) => v?.teamId === USER?.userDetails?.team?._id),
  )

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
    // const lineupId = activePlayerData[0]?._id
    if (nonActive?.length === 7) {
      setSubmitLoading(true)
      await setNonActivePlayer(
        {
          // lineupId,
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
    // const lineupId = practiveSquadData[0]?._id

    if (protectedCheck?.length === 4) {
      setSubmitLoading(true)
      await setProtectedPlayer(
        {
          // lineupId,
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
    SETTING?.week !== 0 && getData()
    console.log(draftData?.length)
  }, [SETTING?.week])

  const getData = async () => {
    setLoading(true)
    const res = await getRoster(SETTING?.week)
    if (res) {
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
      setPlayerCaps(res?.playerCaps)
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
              title: <p>Roster</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      {/* FILTER */}
      <ButtonsAndPagination />

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className='practice_squad_header' style={{ marginTop: '30px' }}>
            <p className='heading'>Active Squad</p>
            {!isLocked() && (
              <Button loading={submitLoading} onClick={handleSubmit} type='primary'>
                Submit
              </Button>
            )}
          </div>

          {/* ACTIVE SQUAD */}
          <section className='stats_container'>
            {activePlayerData?.length > 0 ? (
              activePlayerData?.map((v, i) => {
                return (
                  <PlayerRosterCard
                    key={i}
                    data={v}
                    index={i}
                    state={nonActive}
                    handleClick={handleNonActive}
                    playerCaps={playerCaps}
                  />
                )
              })
            ) : (
              <Empty text={'Active Squad IS EMPTY'} />
            )}
          </section>

          <hr style={{ marginBlock: '40px' }} />

          <div className='practice_squad_header'>
            <p className='heading'>Practice Squad</p>
            {!isLocked() && (
              <Button loading={submitLoading} onClick={handleProtectedSubmit} type='primary'>
                Submit
              </Button>
            )}
          </div>

          {/* PRACTICE SQUAD */}
          <section className='stats_container'>
            {practiveSquadData?.length > 0 ? (
              practiveSquadData?.map((v, i) => {
                return (
                  <PlayerRosterCard
                    key={i}
                    data={v}
                    index={i}
                    state={protectedCheck}
                    handleClick={handleProtectedCheckbox}
                    isPractice={true}
                    playerCaps={playerCaps}
                  />
                )
              })
            ) : (
              <Empty text={'practice Squad IS EMPTY'} />
            )}
          </section>

          <hr style={{ marginBlock: '40px' }} />

          <div className='practice_squad_header'>
            <p className='heading'>
              Draft<b>Picks</b>
            </p>
          </div>

          <section className='stats_container'>
            {draftPickData?.draft?.length > 0 ? (
              draftPickData?.draft?.map((v, i) => {
                return (
                  <div key={i} className='draft_pick_row'>
                    <p>{v} Pick</p>
                  </div>
                )
              })
            ) : (
              <Empty text={'DRAFT PICK IS EMPTY'} />
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerRoster
