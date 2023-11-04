import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Row, Col, Select, notification } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import { AiFillCloseCircle } from 'react-icons/ai'

import { useSelector } from 'react-redux'

// Component
import Header from '../components/Header'
import AddPlayerToTrade from '../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import { createTeamTrade, getOtherTeamTrade } from '../redux/actions/teamTradeAction'
import { getAllTeam } from '../redux/actions/teamActions'
import { getRoster } from '../redux/actions/rosterAction'

import { leagueSalaryCap } from '../config/constants'
import { useNavigate } from 'react-router-dom'

const TeamTrade = () => {
  const SETTING = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [myTeam, setMyTeam] = useState(null)
  const [otherTeam, setOtherTeam] = useState(null)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])

  const [selectTeam, setSelectTeam] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    getTeams()
    getMyTeam()
  }, [])

  useEffect(() => {
    selectTeam && getOtherTeam()
  }, [selectTeam])

  const getTeams = async () => {
    const res = await getAllTeam()
    setTeams(res)
  }
  const getMyTeam = async () => {
    !loading && setLoading(true)
    const res = await getRoster(SETTING?.setting?.week)
    if (res) {
      setMyTeam(res)
    }
    setLoading(false)
  }
  const getOtherTeam = async () => {
    setLoading2(true)
    const res = await getOtherTeamTrade({ id: selectTeam })
    setOtherTeam(res)
    setLoading2(false)
  }

  const createTrade = async () => {
    if (myTeamSelected?.length > 0 && otherTeamSelected?.length > 0) {
      setBtnLoading(true)
      const res = await createTeamTrade({
        buyerPlayers: myTeamSelected?.map((v) => v?.players?._id),
        sellerPlayers: otherTeamSelected?.map((v) => v?.players?._id),
        sellerTeam: otherTeam?.team?._id,
      })
      notification.success({
        message: res,
        duration: 3,
      })
      setBtnLoading(false)
    } else {
      notification.error({
        message: 'Please select player',
        duration: 3,
      })
    }
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BREADCRUMB */}
      <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <h1 className='heading'>TEAM TRADE</h1>

      {loading ? (
        <Loader />
      ) : (
        <section className='squad_card_container transparent'>
          <Row gutter={[30, 30]}>
            {/* <Col xs={24} lg={12}>
              <Select
                placeholder='Teams'
                style={{ minWidth: 250, float: 'right' }}
                value={selectTeam}
                onChange={(e) => setSelectTeam(e)}
                options={teams?.map((v) => {
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
            </Col> */}
            <Col xs={24} lg={24}>
              {/* <Button
                loading={btnLoading}
                type='primary'
                style={{ float: 'right' }}
                onClick={createTrade}
              >
                Submit
              </Button> */}
              <Select
                placeholder='Team'
                style={{ minWidth: 250, float: 'right' }}
                value={selectTeam}
                onChange={(e) => setSelectTeam(e)}
                options={teams?.map((v) => {
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
                  {/* <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div> */}
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
                    {/* <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div> */}
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
                    {/* <p>Team name here</p> */}
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
        </section>
      )}
    </div>
  )
}

export default TeamTrade
