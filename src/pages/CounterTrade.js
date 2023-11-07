import React, { useEffect, useState } from 'react'

import { Button, Row, Col, notification } from 'antd'

// import Arrow from '../assets/arrow-right.svg'
import { AiFillCloseCircle } from 'react-icons/ai'

// Component
import Header from '../components/Header'
import AddPlayerToTrade from '../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

import { getTrade, updateCounterTrade } from '../redux/actions/teamTradeAction'

import { leagueSalaryCap } from '../config/constants'
import { useLocation } from 'react-router-dom'

const CounterTrade = () => {
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)

  const [data, setData] = useState(null)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])

  const { state } = useLocation()

  useEffect(() => {
    state?.tradeId && _getTrade()
  }, [])

  const _getTrade = async () => {
    !loading && setLoading(true)
    const res = await getTrade({ tradeId: state?.tradeId })
    setData(res)
    console.log('res?.teamData?.buyer', res?.teamData?.buyer)
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
    setLoading(false)
  }

  const createTrade = async () => {
    if (myTeamSelected?.length > 0 && otherTeamSelected?.length > 0) {
      setBtnLoading(true)
      const res = await updateCounterTrade({
        buyerPlayers: myTeamSelected?.map((v) => v?.players?._id),
        sellerPlayers: otherTeamSelected?.map((v) => v?.players?._id),
        tradeId: state?.tradeId,
        buyerId: data?.teamData?.buyer?.team?._id,
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
      {/* <section className='_breadcrumb'>
        <Button className='_back_button' type='primary'>
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
      </section> */}

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <h1 className='heading'>COUNTER TRADE</h1>

      {loading ? (
        <Loader />
      ) : (
        <section className='squad_card_container transparent'>
          <Row gutter={[30, 30]}>
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
                    value: `$${leagueSalaryCap?.toLocaleString()}`,
                  },
                  {
                    title: 'TEAM TOTAL CAP',
                    value: data?.teamData?.buyer?.caps
                      ? `$${data?.teamData?.buyer?.caps?.toLocaleString()}`
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
                    value: `$${leagueSalaryCap?.toLocaleString()}`,
                  },
                  {
                    title: 'TEAM TOTAL CAP',
                    value: data?.teamData?.seller?.caps
                      ? `$${data?.teamData?.seller?.caps?.toLocaleString()}`
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
          </Row>
        </section>
      )}
    </div>
  )
}

export default CounterTrade
