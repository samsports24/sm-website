import React, { useEffect, useState } from 'react'

import { Button, Col, Row, notification } from 'antd'

// Component
import Header from '../components/Header'
import Loader from '../components/Loader'
import Empty from '../components/Empty'
import NewRosterCard from '../components/NewRosterCard'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

import { useSelector } from 'react-redux'
import { isLocked } from '../config/constants'
import { getRoster, setNonActivePlayer, setProtectedPlayer } from '../redux/actions/rosterAction'
import { sortedArray } from '../config/helperFunctions'

const PlayerRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const { isLoading, data } = useSelector((state) => state?.roster)
  console.log('🚀 ~ PlayerRoster ~ data:', data)
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
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
    if (protectedCheck?.length === 4) {
      setSubmitLoading(true)
      await setProtectedPlayer(
        {
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
  }, [SETTING?.week])

  useEffect(() => {
    setNonActive(data?.nonActivePlayer)
    setProtectedCheck(data?.protectedPlayer)
  }, [data])

  const getData = async () => {
    await getRoster(SETTING?.week)
  }

  // console.log('data?.filterActiveRoster',data?.filterActiveRoster);
  // console.log('sortedArray',sortedArray);

  return (
    <div className='player_roster_container'>
      <Header />
      <HeadingAndWeek />
      <hr className='divider' />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Row>
            <Col xs={24} lg={16}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '800px' }}>
                  {/* ---------------------------------------------------- */}
                  <div className='practice_squad_header'>
                    <p className='heading'>
                      Active<b>Squad</b>
                    </p>
                    {!isLocked() && (
                      <Button loading={submitLoading} onClick={handleSubmit} type='primary'>
                        Submit
                      </Button>
                    )}
                  </div>
                  <section className='stats_container'>
                    {data?.filterActiveRoster?.length > 0 ? (
                      sortedArray(data?.filterActiveRoster)?.map((v, i) => {
                        console.log('data?.filterActiveRoster', data?.filterActiveRoster)
                        return (
                          <NewRosterCard
                            key={i}
                            data={v}
                            index={i}
                            state={{
                              isOwnRoster: {
                                status: true,
                              },
                            }}
                            checkBoxIds={nonActive}
                            handleClick={handleNonActive}
                            playerCaps={data?.playerCaps}
                            averagePf={data?.averagePf}
                            // currentYearSalaryCap={data?.currentYearSalaryCap}
                          />
                        )
                      })
                    ) : (
                      <Empty text={'Active Squad IS EMPTY'} />
                    )}
                  </section>
                  {/* ---------------------------------------------------- */}
                  <div className='practice_squad_header' style={{ marginTop: '20px' }}>
                    <p className='heading'>
                      Non-Active<b>Squad</b>
                    </p>
                  </div>
                  <section className='stats_container'>
                    {data?.filterNonActiveRoster?.length > 0 ? (
                      sortedArray(data?.filterNonActiveRoster)?.map((v, i) => {
                        return (
                          <NewRosterCard
                            key={i}
                            data={v}
                            index={i}
                            state={{
                              isOwnRoster: {
                                status: true,
                              },
                            }}
                            checkBoxIds={nonActive}
                            handleClick={handleNonActive}
                            playerCaps={data?.playerCaps}
                            averagePf={data?.averagePf}
                           // currentYearSalaryCap={data?.currentYearSalaryCap}
                          />
                        )
                      })
                    ) : (
                      <Empty text={'Non-Active Squad IS EMPTY'} />
                    )}
                  </section>
                  {/* ---------------------------------------------------- */}
                  <hr style={{ marginBlock: '20px' }} />
                  <div className='practice_squad_header'>
                    <p className='heading'>
                      Practice<b>Squad</b>
                    </p>
                    {!isLocked() && (
                      <Button
                        loading={submitLoading}
                        onClick={handleProtectedSubmit}
                        type='primary'
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <section className='stats_container'>
                    {data?.filterPracticeRoster?.length > 0 ? (
                      sortedArray(data?.filterPracticeRoster)?.map((v, i) => {
                        return (
                          <NewRosterCard
                            key={i}
                            data={v}
                            index={i}
                            state={{
                              isOwnRoster: {
                                status: true,
                              },
                            }}
                            checkBoxIds={protectedCheck}
                            handleClick={handleProtectedCheckbox}
                            isPractice={true}
                            playerCaps={data?.playerCaps}
                            averagePf={data?.averagePf}
                           // currentYearSalaryCap={data?.currentYearSalaryCap}
                          />
                        )
                      })
                    ) : (
                      <Empty text={'PRACTICE Squad IS EMPTY'} />
                    )}
                  </section>
                  {/* ---------------------------------------------------- */}
                  <div className='practice_squad_header' style={{ marginTop: '20px' }}>
                    <p className='heading'>
                      Protected<b>Squad</b>
                    </p>
                  </div>
                  <section className='stats_container'>
                    {data?.filterProtectedRoster?.length > 0 ? (
                      sortedArray(data?.filterProtectedRoster)?.map((v, i) => {
                        return (
                          <NewRosterCard
                            key={i}
                            data={v}
                            index={i}
                            state={{
                              isOwnRoster: {
                                status: true,
                              },
                            }}
                            checkBoxIds={protectedCheck}
                            handleClick={handleProtectedCheckbox}
                            isPractice={true}
                            playerCaps={data?.playerCaps}
                            averagePf={data?.averagePf}
                           // currentYearSalaryCap={data?.currentYearSalaryCap}
                          />
                        )
                      })
                    ) : (
                      <Empty text={'Protected Squad IS EMPTY'} />
                    )}
                  </section>
                  {/* ---------------------------------------------------- */}
                  <hr style={{ marginBlock: '20px' }} />
                  <div className='practice_squad_header'>
                    <p className='heading'>
                      Draft<b>Picks</b>
                    </p>
                  </div>
                  <section className='draft_pick_box'>
                    {data?.drafts?.length > 0 ? (
                      data?.drafts?.map((v, i) => {
                        return (
                          // <div key={i} className='draft_pick_row'>
                          //   <p>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
                          // </div>
                          <div key={i} className='draft_pick_row'>
                          <p>
                            {`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}
                            {/* Show mainTeam name within brackets if team and mainTeam IDs are different */}
                            {v?.team?._id !== v?.mainTeam?._id && (
                              <span> via ({v?.mainTeam?.name})</span>
                            )}
                          </p>
                        </div>
                        
                        )
                      })
                    ) : (
                      <Empty text={'DRAFT PICK IS EMPTY'} />
                    )}
                  </section>
                  {/* ---------------------------------------------------- */}
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}></Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default PlayerRoster
