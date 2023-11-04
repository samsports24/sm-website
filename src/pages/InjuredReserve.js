import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import MoveToRoster from '../components/modal/PlayerInterfaceModals/MoveToRoster'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { getAllIr } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'
import Empty from '../components/Empty'

const InjuredReserve = () => {
  const [injuredReserve, setInjuredReserve] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const res = await getAllIr()
    if (res) {
      setInjuredReserve(res)
    }
    setLoading(false)
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BREADCRUMB */}
      <section className='_breadcrumb'>
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
      </section>
      {/* HEADER */}
      <Header />
      <ButtonsAndPagination noWeek={true} />
      <hr className='divider' />
      <section className='squad_card_container transparent'>
        <div className='header'>
          <h2>INJURED RESERVE</h2>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {injuredReserve?.data?.length > 0 ? (
              <div className='standing-table-bg'>
                {injuredReserve?.data?.map((v, i) => {
                  const { player: p } = v
                  return (
                    <div key={i} className='squad_card_box'>
                      <div className='squad_content_body'>
                        <div className='squad_image_box'>
                          {p?.HostedHeadshotNoBackgroundUrl ? (
                            <img src={p?.HostedHeadshotNoBackgroundUrl} />
                          ) : (
                            <GiAmericanFootballPlayer size={45} color={'#c4c4c4'} />
                          )}
                        </div>
                        <div>
                          <p className='squad_text2'>position</p>
                          <p className='squad_text1'>{p?.Position || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>player name</p>
                          <p className='squad_text1'>{p?.Name || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>age</p>
                          <p className='squad_text1'>{p?.Age || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>team</p>
                          <p className='squad_text1'>{p?.Team || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>opp</p>
                          <p className='squad_text1'>{p?.UpcomingGameOpponent || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>bye</p>
                          <p className='squad_text1'>{p?.ByeWeek || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>player cap #</p>
                          <p className='squad_text1'>
                            {injuredReserve?.playerCaps[p?.PlayerID]
                              ? `$${injuredReserve?.playerCaps[p?.PlayerID]?.toLocaleString()}`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className='squad_text2'>PF &nbsp;</p>
                          <p className='squad_text1'>{p?.pointsPerGame || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text2'>player rank</p>
                          <p className='squad_text1'>{p?.playerRank || '-'}</p>
                        </div>
                        <MoveToRoster
                          activeDate={v?.activeDate}
                          injuredDate={v?.injuredDate}
                          playerId={v?.PlayerID}
                          injuredId={v?._id}
                          getData={getData}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty text={'I.R IS EMPTY'} />
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default InjuredReserve

// Your roster is full, it has all 53 players
// However, you can move this player to the practice squad
