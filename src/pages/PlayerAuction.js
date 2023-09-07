import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import Loader from '../components/Loader'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'

const PlayerAuction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setData([])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate(-1)}>
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
              title: <p>Player</p>,
            },
            {
              title: <p>Player Auction</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <section className='squad_card_container transparent' style={{ marginTop: '45px' }}>
        <div className='header'>
          <h2>PLAYER AUCTION</h2>
        </div>

        {isLoading ? (
          <Loader />
        ) : data?.length > 0 ? (
          <div className='standing-table-bg'>
            {data?.map((v, i) => {
              return (
                <div key={i} className='squad_card_box'>
                  <div className='squad_content_body'>
                    <div className='squad_image_box'>
                      {v?.image ? (
                        <img src={v?.image} />
                      ) : (
                        <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
                      )}
                    </div>
                    <div>
                      <p className='squad_text2'>position</p>
                      <p className='squad_text1'>{v?.Position || '-'}</p>
                    </div>
                    <div>
                      <p style={{ width: '160px' }} className='squad_text2'>
                        player name
                      </p>
                      <p
                        onClick={() => {
                          navigate(`/player-live-auction/${v?._id}`)
                        }}
                        style={{ cursor: 'pointer' }}
                        className='squad_text1 name_text_hover'
                      >
                        {v?.Name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className='squad_text2'>age</p>
                      <p className='squad_text1'>{v?.Age || '-'}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>team</p>
                      <p className='squad_text1'>{v?.Team || '-'}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>opp</p>
                      <p className='squad_text1'>{v?.UpcomingGameOpponent || '-'}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>bye</p>
                      <p className='squad_text1'>{v?.ByeWeek || '-'}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>player cap #</p>
                      <p className='squad_text1'>{v?.PlayerCap || '-'}</p>
                    </div>
                    {/* <div>
                  <p className='squad_text2'>
                    year left <br /> experation &nbsp;
                    <span className='squad_text2'>{v?.YearLeftExperation || '-'}</span>
                  </p>
                </div> */}
                    <div>
                      <p className='squad_text2'>PF &nbsp;</p>
                      <p className='squad_text1'>{v?.pointsPerGame || '-'}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>player rank</p>
                      <p className='squad_text1'>{v?.playerRank || '-'}</p>
                    </div>
                    {/* <Button type='primary'>Auction</Button> */}
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
              AUCTION IS EMPTY
            </Typography.Title>
          </div>
        )}

        {/* {isEmpty && (
          <div
            style={{
              minHeight: '70vh',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '30px',
            }}
          >
            <Typography.Title level={5} style={{ color: 'white' }}>
              AUCTION IS EMPTY
            </Typography.Title>
          </div>
        )}
        <div className='standing-table-bg'>
          {!isEmpty &&
            practiceSquadData?.map((v, i) => {
              return (
                <div key={i} className='squad_card_box'>
                  <div className='squad_content_body'>
                    {v?.image ? (
                      <img src={v?.image} />
                    ) : (
                      <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
                    )}
                    <div>
                      <p className='squad_text2'>position</p>
                      <p className='squad_text1'>{v?.position}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>player name</p>
                      <p className='squad_text1'>{v?.playerName}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>age</p>
                      <p className='squad_text1'>{v?.age}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>team</p>
                      <p className='squad_text1'>{v?.team}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>bye</p>
                      <p className='squad_text1'>{v?.bye}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>player cap #</p>
                      <p className='squad_text1'>{v?.playerCap}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>PPG</p>
                      <p className='squad_text1'>{v?.playerCap}</p>
                    </div>
                    <div>
                      <p className='squad_text2'>player rank</p>
                      <p className='squad_text1'>{v?.playerCap}</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div> */}
      </section>
    </div>
  )
}

export default PlayerAuction
