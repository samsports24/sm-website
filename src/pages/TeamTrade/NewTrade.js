import React, { useEffect, useState } from 'react'

import { Button, Row, Col, Select, notification } from 'antd'

import { AiFillCloseCircle } from 'react-icons/ai'

import { useSelector } from 'react-redux'

// Component
import AddPlayerToTrade from '../../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import Loader from '../../components/Loader'
import Empty from '../../components/Empty'

import { createTeamTrade, getOtherTeamTrade } from '../../redux/actions/teamTradeAction'
import { getAllTeam } from '../../redux/actions/teamActions'
import { getRoster } from '../../redux/actions/rosterAction'

import { leagueSalaryCap } from '../../config/constants'
import { getLeagueDetails } from '../../redux'

const NewTrade = () => {
  const SETTING = useSelector((state) => state?.user)
  const { currentLeague } = useSelector((state) => state?.league)
  
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [myTeam, setMyTeam] = useState(null)
  const [otherTeam, setOtherTeam] = useState(null)
  console.log('🚀 ~ file: NewTrade.js:28 ~ NewTrade ~ otherTeam:', otherTeam)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])

  const [selectTeam, setSelectTeam] = useState(null)

  const [myTeamDraft, setMyTeamDraft] = useState([])
  const [otherTeamDraft, setOtherTeamDraft] = useState([])

  const [myTeamSelectedDraft, setMyTeamSelectedDraft] = useState([])
  const [otherTeamSelectedDraft, setOtherTeamSelectedDraft] = useState([])


  
  useEffect(() => {
    getTeams()
    getMyTeam()
    getLeagueDetails()
  }, [])

  const getTeams = async () => {
    if (currentLeague?._id) {
      try {
        const res = await getAllTeam({ currentLeague: currentLeague?._id });
        setTeams(res);
      } catch (error) {
        console.error('Failed to fetch teams', error);
      }
    }
  };

  useEffect(() => {
    getTeams();
  }, [currentLeague]);

  useEffect(() => {
    selectTeam && getOtherTeam()
  }, [selectTeam])

  // const getTeams = async () => {
  //   const res = await getAllTeam({currentLeague:currentLeague?._id})
  //   setTeams(res)
  // }



  const getMyTeam = async () => {
    !loading && setLoading(true)
    const res = await getRoster(SETTING?.setting?.week)
    if (res) {
      setMyTeam(res)
      setMyTeamDraft(res?.drafts)
    }
    setLoading(false)
  }
  const getOtherTeam = async () => {
    setLoading2(true)
    const res = await getOtherTeamTrade({ id: selectTeam })
    setOtherTeam({
      ...res,
      active: res?.active || [],
    })
    setOtherTeamDraft(res?.drafts)
    setLoading2(false)
  }

  const clear = () => {
    setMyTeamSelected([])
    setMyTeamSelectedDraft([])
    setOtherTeamSelected([])
    setOtherTeamSelectedDraft([])
    setOtherTeam(null)
    setOtherTeamDraft([])
    setSelectTeam(null)
  }



  const createTrade = async () => {
    const isMyTeam = myTeamSelected?.length > 0 || myTeamSelectedDraft?.length > 0
    const isOtherTeam = otherTeamSelected?.length > 0 || otherTeamSelectedDraft?.length > 0

    if (isMyTeam && isOtherTeam) {
      setBtnLoading(true)
      const res = await createTeamTrade({
        buyerPlayers: myTeamSelected?.map((v) => v?.players?._id),
        buyerDrafts: myTeamSelectedDraft?.map((v) => v._id),
        sellerPlayers: otherTeamSelected?.map((v) => v?.players?._id),
        sellerDrafts: otherTeamSelectedDraft?.map((v) => v._id),
        sellerTeam: otherTeam?.team?._id,
      })
      clear()
      notification.success({
        message: res,
        duration: 3,
      })
      setBtnLoading(false)
    } else {
      notification.error({
        message: 'Please select player or draft',
        duration: 3,
      })
    }
  }

  const handleMyTeamSelectedDraft = (obj) => {
    const index = myTeamDraft?.findIndex((v) => v?._id === obj?._id)
    const temp = [...myTeamDraft]
    temp.splice(index, 1)
    setMyTeamDraft(temp)
    setMyTeamSelectedDraft((pre) => [...pre, obj])
  }
  const handleRemoveMyTeamSelectedDraft = (obj) => {
    const index = myTeamSelectedDraft?.findIndex((v) => v?._id === obj?._id)
    const temp = [...myTeamSelectedDraft]
    temp.splice(index, 1)
    setMyTeamSelectedDraft(temp)
    setMyTeamDraft((pre) => [...pre, obj])
  }
  const handleOtherTeamSelectedDraft = (obj) => {
    const index = otherTeamDraft?.findIndex((v) => v?._id === obj?._id)
    const temp = [...otherTeamDraft]
    temp.splice(index, 1)
    setOtherTeamDraft(temp)
    setOtherTeamSelectedDraft((pre) => [...pre, obj])
  }
  const handleRemoveOtherTeamSelectedDraft = (obj) => {
    const index = otherTeamSelectedDraft?.findIndex((v) => v?._id === obj?._id)
    const temp = [...otherTeamSelectedDraft]
    temp.splice(index, 1)
    setOtherTeamSelectedDraft(temp)
    setOtherTeamDraft((pre) => [...pre, obj])
  }



  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <section className='squad_card_container transparent'>
          <Row gutter={[30, 30]}>
            <Col xs={24} lg={24}>
              <Select
                placeholder='Team'
                className='team_select_box'
                value={selectTeam}
                onChange={(e) => {
                  setSelectTeam(e)
                  setOtherTeamSelected([])
                }}
                options={teams
                  ?.filter((x) => x?._id !== SETTING?.userDetails?.team?._id)
                  ?.map((v) => {
                    return {
                      value: v?._id,
                      label: (
                        <div className='select_box_label'>
                          <img src={v?.logo} alt='logo' />
                          <p>{v?.name}</p>
                        </div>
                      ),
                    }
                  })}
              />
            </Col>
            <Col xs={24} lg={12}>
              <div className='add-player'>
                <div className='header'>
                  <h2>{(myTeam && myTeam?.active[0]?.team?.name) || 'Your Team'}</h2>
                </div>
                {myTeamSelected?.map((v) => (
                  <div key={v?.players?._id} className='add-player-section'>
                    <p>{v?.players?.Name}</p>
                    <AiFillCloseCircle
                      color={'#fff'}
                      size={20}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const index = myTeamSelected?.findIndex(
                          (x) => x?.players?._id === v?.players?._id,
                        )
                        const temp = [...myTeamSelected]
                        temp.splice(index, 1)
                        setMyTeamSelected(temp)
                      }}
                    />
                  </div>
                ))}
                <div className='add-player-section'>
                  <AddPlayerToTrade
                    teamName={myTeam && myTeam?.active[0]?.team?.name}
                    data={myTeam ? [...myTeam?.active] : []}
                    selected={myTeamSelected}
                    setSelected={setMyTeamSelected}
                  />
                  {/* <p>Team name here</p> */}
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              {loading2 ? (
                <div className='container' style={{ height: '100px' }}>
                  <div className='loader'></div>
                </div>
              ) : (
                <div className='add-player'>
                  <div className='header'>
                    <h2>{(otherTeam && otherTeam?.team?.name) || 'Other Team'}</h2>
                  </div>
                  {otherTeamSelected?.map((v) => (
                    <div key={v?.players?._id} className='add-player-section'>
                      <p>{v?.players?.Name}</p>
                      <AiFillCloseCircle
                        color={'#fff'}
                        size={20}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const index = otherTeamSelected?.findIndex(
                            (x) => x?.players?._id === v?.players?._id,
                          )
                          const temp = [...otherTeamSelected]
                          temp.splice(index, 1)
                          setOtherTeamSelected(temp)
                        }}
                      />
                    </div>
                  ))}
                  <div className='add-player-section'>
                    <AddPlayerToTrade
                      teamName={otherTeam && otherTeam?.team?.name}
                      data={
                        otherTeam
                          ? [
                              ...otherTeam?.active?.map((v) => {
                                return { players: v }
                              }),
                            ]
                          : []
                      }
                      selected={otherTeamSelected}
                      setSelected={setOtherTeamSelected}
                    />
                  </div>
                </div>
              )}
            </Col>

            <Col xs={24} lg={12}>
              <div className='add-player'>
                <div className='header'>
                  <div className='left'>
                    <h2>THEIR TEAM BEFORE TRADE</h2>
                  </div>
                </div>
                {[
                  {
                    title: 'SFL TOTAL CAP',
                    value: `$${leagueSalaryCap?.toLocaleString()}`,
                  },
                  {
                    title: 'TEAM TOTAL CAP',
                    value: SETTING?.teamSalaryCap
                      ? `$${SETTING?.teamSalaryCap?.toLocaleString()}`
                      : '$0',
                  },
                ].map((item, index) => (
                  <div key={index} className='add-player-section'>
                    <p>{item.title}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </Col>

            {!loading2 && (
              <Col xs={24} lg={12}>
                <div className='add-player'>
                  <div className='header'>
                    <div className='left'>
                      <h2>THEIR TEAM BEFORE TRADE</h2>
                    </div>
                  </div>
                  {[
                    {
                      title: 'SFL TOTAL CAP',
                      value: `$${leagueSalaryCap?.toLocaleString()}`,
                    },
                    {
                      title: 'TEAM TOTAL CAP',
                      value: otherTeam?.salaryCap
                        ? `$${otherTeam?.salaryCap?.toLocaleString()}`
                        : `$0`,
                    },
                  ].map((item, index) => (
                    <div key={index} className='add-player-section'>
                      <p>{item.title}</p>
                      <p>{item.value}</p>
                    </div>
                  ))}
                </div>
              </Col>
            )}

            <Col xs={24} lg={24}>
              <Button
                loading={btnLoading}
                type='primary'
                style={{ float: 'right' }}
                onClick={createTrade}
              >
                Submit
              </Button>
            </Col>
          </Row>
          <Row gutter={[30, 30]} style={{ marginTop: '30px' }}>
            <Col xs={24} lg={12}>
              <div className='draftPickMainBox'>
                <h2 style={{ marginBottom: '20px' }}>SELECTED DRAFTS</h2>
                <section className='draft_pick_box'>
                  {myTeamSelectedDraft
                    ?.sort((a, b) => a?.season - b?.season)
                    ?.map((v, i) => {
                      return (
                        <div key={i} className='draft_pick_row'>
                          <p>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
                          <AiFillCloseCircle
                            color={'#fff'}
                            size={20}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRemoveMyTeamSelectedDraft(v)}
                          />
                        </div>
                      )
                    })}
                </section>
              </div>
              <div style={{ height: '20px' }} />
              <div className='draftPickMainBox'>
                <h2 style={{ marginBottom: '20px' }}>AVAILABLE DRAFTS</h2>
                <section className='draft_pick_box'>
                  {myTeamDraft?.length > 0 ? (
                    myTeamDraft
                      ?.sort((a, b) => a?.season - b?.season)
                      ?.map((v, i) => {
                        return (
                          <div
                            key={i}
                            className='draft_pick_row'
                            onClick={() => handleMyTeamSelectedDraft(v)}
                            style={{ cursor: 'pointer' }}
                          >
                            <p>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
                          </div>
                        )
                      })
                  ) : (
                    <Empty text={'DRAFT PICK IS EMPTY'} />
                  )}
                </section>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className='draftPickMainBox'>
                <h2 style={{ marginBottom: '20px' }}>SELECTED DRAFTS</h2>
                <section className='draft_pick_box'>
                  {otherTeamSelectedDraft
                    ?.sort((a, b) => a?.season - b?.season)
                    ?.map((v, i) => {
                      return (
                        <div key={i} className='draft_pick_row'>
                          <p>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
                          <AiFillCloseCircle
                            color={'#fff'}
                            size={20}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRemoveOtherTeamSelectedDraft(v)}
                          />
                        </div>
                      )
                    })}
                </section>
              </div>
              <div style={{ height: '20px' }} />
              {!loading2 && (
                <div className='draftPickMainBox'>
                  <h2 style={{ marginBottom: '20px' }}>AVAILABLE DRAFTS</h2>
                  <section className='draft_pick_box'>
                    {otherTeamDraft?.length > 0 ? (
                      otherTeamDraft
                        ?.sort((a, b) => a?.season - b?.season)
                        ?.map((v, i) => {
                          return (
                            <div
                              key={i}
                              className='draft_pick_row'
                              onClick={() => handleOtherTeamSelectedDraft(v)}
                              style={{ cursor: 'pointer' }}
                            >
                              <p>{`${v?.season}' ${v?.team?.name} ${v?.round} Round Pick`}</p>
                            </div>
                          )
                        })
                    ) : (
                      <Empty text={'DRAFT PICK IS EMPTY'} />
                    )}
                  </section>
                </div>
              )}
            </Col>
          </Row>
        </section>
      )}
    </>
  )
}

export default NewTrade
