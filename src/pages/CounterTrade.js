import React, { useEffect, useState } from 'react'

import { Button, Row, Col, notification } from 'antd'

// import Arrow from '../assets/arrow-right.svg'
import { AiFillCloseCircle } from 'react-icons/ai'

// Component
import Header from '../components/Header'
import AddPlayerToTrade from '../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import {
  approveTrade,
  cancelTrade,
  getTrade,
  updateCounterTrade,
} from '../redux/actions/teamTradeAction'

import { leagueSalaryCap } from '../config/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import Empty from '../components/Empty'
import { useSelector } from 'react-redux'

const CounterTrade = () => {
  const [loading, setLoading] = useState('all')
  const SETTING = useSelector((state) => state?.user)

  const [data, setData] = useState(null)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])

  const [myTeamDraft, setMyTeamDraft] = useState([])
  const [otherTeamDraft, setOtherTeamDraft] = useState([])

  const [myTeamSelectedDraft, setMyTeamSelectedDraft] = useState([])
  const [otherTeamSelectedDraft, setOtherTeamSelectedDraft] = useState([])
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)

  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    state?.tradeId && _getTrade()
  }, [])

  const navigateToNoti = () => {
    navigate('/league-notification')
  }

  const _getTrade = async () => {
    setLoading('all')
    const res = await getTrade({ tradeId: state?.tradeId })
    setData(res)

    setMyTeamSelected(
      res?.teamData?.buyer?.players?.map((v) => {
        return {
          players: v,
        }
      }),
    )
    setOtherTeamSelected(
      res?.teamData?.seller?.players?.map((v) => {
        return {
          players: v,
        }
      }),
    )
    setMyTeamSelectedDraft(res?.teamData?.buyer?.drafts)
    setOtherTeamSelectedDraft(res?.teamData?.seller?.drafts)
    let _myTeamDraft = []
    res?.buyer?.buyerDrafts?.forEach((v) => {
      const index = res?.teamData?.buyer?.drafts?.findIndex((x) => x?._id === v?._id)
      if (index === -1) {
        _myTeamDraft.push(v)
      }
    })
    setMyTeamDraft(_myTeamDraft)
    let _otherTeamDraft = []
    res?.seller?.sellerDrafts?.map((v) => {
      const index = res?.teamData?.seller?.drafts?.findIndex((x) => x?._id === v?._id)
      if (index === -1) {
        _otherTeamDraft.push(v)
      }
    })
    setOtherTeamDraft(_otherTeamDraft)
    setLoading('')
  }

  const createTrade = async () => {
    const isMyTeam = myTeamSelected?.length > 0 || myTeamSelectedDraft?.length > 0
    const isOtherTeam = otherTeamSelected?.length > 0 || otherTeamSelectedDraft?.length > 0

    if (isMyTeam || isOtherTeam) {
      setLoading('counter')
      const res = await updateCounterTrade({
        buyerPlayers: myTeamSelected?.map((v) => v?.players?._id),
        buyerDrafts: myTeamSelectedDraft?.map((v) => v._id),
        sellerPlayers: otherTeamSelected?.map((v) => v?.players?._id),
        sellerDrafts: otherTeamSelectedDraft?.map((v) => v._id),
        tradeId: state?.tradeId,
        buyerId: data?.teamData?.buyer?.team?._id,
      })
      navigateToNoti()
      notification.success({
        message: res,
        duration: 3,
      })
      setLoading('')
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

  const handleCancelTrade = async () => {
    setLoading('cancel')
    const res = await cancelTrade({ tradeId: state?.tradeId })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      navigateToNoti()
    }
    setLoading('')
  }

  const handleApproveTrade = async () => {
    setLoading('approve')
    const res = await approveTrade({ tradeId: state?.tradeId })
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
      navigateToNoti()
    }
    setLoading('')
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <h1 className='heading'>COUNTER TRADE</h1>

      {loading === 'all' ? (
        <Loader />
      ) : (
        <section className='squad_card_container transparent'>
          <Row gutter={[30, 30]}>
            <Col xs={24} lg={12}>
              <div className='add-player'>
                <div className='header'>
                  {/* <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div> */}
                  <h2>{(data && data?.teamData?.buyer?.team?.name) || 'Your Team'}</h2>
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
                    teamName={data && data?.teamData?.buyer?.team?.name}
                    data={
                      data
                        ? [
                            ...data?.buyer?.buyerActive.map((v) => {
                              return { players: v }
                            }),
                          ]
                        : []
                    }
                    selected={myTeamSelected}
                    setSelected={setMyTeamSelected}
                  />
                  {/* <p>Team name here</p> */}
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className='add-player'>
                <div className='header'>
                  {/* <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div> */}
                  <h2>{(data && data?.teamData?.seller?.team?.name) || 'Other Team'}</h2>
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
                    teamName={data && data?.teamData?.seller?.team?.name}
                    data={
                      data
                        ? [
                            ...data?.seller?.sellerActive?.map((v) => {
                              return { players: v }
                            }),
                          ]
                        : []
                    }
                    selected={otherTeamSelected}
                    setSelected={setOtherTeamSelected}
                  />
                  {/* <p>Team name here</p> */}
                </div>
              </div>
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
                    title: 'UFAFL TOTAL CAP',
                    // value: `$${leagueSalaryCap?.toLocaleString()}`,
                    value: `$${myleagueSalaryCap?.toLocaleString()}`,
                  },
                  {
                    title: 'TEAM TOTAL CAP',
                    // value: data?.teamData?.buyer?.caps
                    //   ? `$${data?.teamData?.buyer?.caps?.toLocaleString()}`
                    //   : `$0`,
                    value: (() => {
                      const totalCurrentYearSalaryCap = myTeamSelected.reduce((total, player) => {
                        // console.log('myteamCurrentYearSalaryCap player',player);
                        
                        return total + (player?.players?.currentYearSalaryCap || 0);
                      }, 0);


                      const otherteamCurrentYearSalaryCap = otherTeamSelected.reduce((total, player) => {
                        // console.log('otherteamCurrentYearSalaryCap player',player);
                        
                        return total + (player?.players?.currentYearSalaryCap || 0);
                      }, 0);

                      //  console.log('seller totalCurrentYearSalaryCap',totalCurrentYearSalaryCap);
                      //  console.log('seller otherteamCurrentYearSalaryCap',otherteamCurrentYearSalaryCap);
                      
                  
                      const totalSalaryCap = (SETTING?.teamSalaryCap || 0) - totalCurrentYearSalaryCap + otherteamCurrentYearSalaryCap;
                      
                      return totalSalaryCap ? `$${totalSalaryCap.toLocaleString()}` : '$0';
                    })(),
                  },
                ].map((item, index) => (
                  <div key={index} className='add-player-section'>
                    <p>{item.title}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
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
                    title: 'UFAFL TOTAL CAP',
                    // value: `$${leagueSalaryCap?.toLocaleString()}`,
                    value: `$${myleagueSalaryCap?.toLocaleString()}`,
                  },
                  {
                    title: 'TEAM TOTAL CAP',
                    value: (() => {
                      const totalCurrentYearSalaryCap = otherTeamSelected.reduce((total, player) => {
                        console.log('player',player);
                        
                        return total + (player?.players?.currentYearSalaryCap || 0);
                      }, 0);


                      const myteamCurrentYearSalaryCap = myTeamSelected.reduce((total, player) => {
                        console.log('player',player);
                        
                        return total + (player?.players?.currentYearSalaryCap || 0);
                      }, 0);

                      

                      // console.log('totalCurrentYearSalaryCap',totalCurrentYearSalaryCap);
                      
                  
                      const otherteamSalaryCap = (data?.teamData?.seller?.salaryCap || 0) - totalCurrentYearSalaryCap + myteamCurrentYearSalaryCap;
                      
                      return otherteamSalaryCap ? `$${otherteamSalaryCap.toLocaleString()}` : '$0';
                    })(),
                    // value: data?.teamData?.seller?.caps
                    //   ? `$${data?.teamData?.seller?.caps?.toLocaleString()}`
                    //   : `$0`,
                    
                  },
                ].map((item, index) => (
                  <div key={index} className='add-player-section'>
                    <p>{item.title}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </Col>

            <Col xs={24} lg={24}>
              <div className='actions_btn_box'>
                <Button
                  loading={loading === 'approve'}
                  type='primary'
                  className='approve_button'
                  onClick={handleApproveTrade}
                >
                  Approve
                </Button>
                <Button
                  loading={loading === 'cancel'}
                  type='primary'
                  className='approve_button'
                  onClick={handleCancelTrade}
                >
                  Deny
                </Button>
                <Button loading={loading === 'counter'} type='primary' onClick={createTrade}>
                  Counter
                </Button>
              </div>
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
              {/* {!loading2 && ( */}
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
              {/* )} */}
            </Col>
          </Row>
        </section>
      )}
    </div>
  )
}

export default CounterTrade
