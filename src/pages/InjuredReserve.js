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
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
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

      <section className='squad_card_container transparent'>
        <div className='header'>
          <h2>INJURED RESERVE</h2>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {injuredReserve?.length > 0 ? (
              <div className='standing-table-bg'>
                {injuredReserve?.map((v, i) => {
                  const { player: p } = v
                  return (
                    <div key={i} className='squad_card_box'>
                      <div className='squad_content_body'>
                        <div className='squad_image_box'>
                          {v?.image ? (
                            <img src={p?.image} />
                          ) : (
                            <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
                          )}
                        </div>
                        <div>
                          <p className='squad_text1'>position</p>
                          <p className='squad_text2'>{p?.Position || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>player name</p>
                          <p className='squad_text2'>{p?.Name || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>age</p>
                          <p className='squad_text2'>{p?.Age || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>team</p>
                          <p className='squad_text2'>{p?.Team || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>bye</p>
                          <p className='squad_text2'>{p?.ByeWeek || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>player cap #</p>
                          <p className='squad_text2'>{p?.PlayerCap || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            year left <br /> experation &nbsp;
                            <span className='squad_text2'>{p?.YearLeftExperation || '-'}</span>
                          </p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            point per <br /> game &nbsp;
                            <span className='squad_text2'>{p?.pointsPerGame || '-'}</span>
                          </p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            player <br /> rank &nbsp;
                            <span className='squad_text2'>{p?.playerRank || '-'}</span>
                          </p>
                        </div>
                        <MoveToRoster
                          activeDate={v?.activeDate}
                          injuredDate={v?.injuredDate}
                          playerId={p?._id}
                          injuredId={v?._id}
                          getData={getData}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  minHeight: '70vh',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '30px',
                }}
              >
                <Typography.Title level={5} style={{ color: 'white' }}>
                  I.R IS EMPTY
                </Typography.Title>
              </div>
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
