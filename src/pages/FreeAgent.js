import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography, Input, Pagination as AntPagination } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import { SearchOutlined } from '@ant-design/icons'

// Component
import Header from '../components/Header'

import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getFreeAgent } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'

const FreeAgent = () => {
  const [isEmpty] = useState(false)
  const [freeAgents, setFreeAgents] = useState({
    total: 0,
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  // const [filterBy, setFilterBy] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [page])

  const getData = async () => {
    window.scrollTo({
      top: 200,
      left: 0,
      behavior: 'smooth',
    })
    setLoading(true)
    const res = await getFreeAgent({
      // searchTeam: filterBy === 'team' ? search : '',
      // searchPosition: filterBy === 'position' ? search : '',
      search,
      limit: limit,
      page: page,
    })
    setFreeAgents(res)
    setLoading(false)
  }

  const handlePagination = (val) => setPage(val)

  const handleFilterBy = async () => {
    // setFilterBy(val)
    if (search?.trim() !== '') {
      const res = await getFreeAgent({
        // searchTeam: val === 'team' ? search : '',
        // searchPosition: val === 'position' ? search : '',
        search,
        limit: limit,
        page: 1,
      })
      setFreeAgents(res)
    }
  }

  const onFieldClear = async () => {
    setLoading(true)
    const res = await getFreeAgent({
      // searchTeam: '',
      // searchPosition: '',
      search: '',
      limit: limit,
      page: 1,
    })
    setFreeAgents(res)
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

      <ButtonsAndPagination noWeek={true} />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <div className='header'>
          <h2>FREE AGENT</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Input
              size='large'
              placeholder='SEARCH'
              prefix={<SearchOutlined />}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value === '') {
                  onFieldClear()
                }
              }}
              // allowClear
              allowClear={{ clearIcon: <GrFormClose size={25} onClick={onFieldClear} /> }}
            />
            {/* <Button type='primary' onClick={() => handleFilterBy('team')}>
              TEAM
            </Button>
            <Button type='primary' onClick={() => handleFilterBy('position')}>
              POSITION
            </Button> */}
            <Button type='primary' onClick={handleFilterBy}>
              SEARCH
            </Button>
          </div>
        </div>
        {isEmpty && (
          <div
            style={{
              minHeight: '70vh',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '30px',
            }}
          >
            <Typography.Title level={5} style={{ color: 'white' }}>
              NO FREE AGENTS
            </Typography.Title>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className='standing-table-bg'>
              {!isEmpty &&
                freeAgents?.players?.map((v, i) => {
                  console.log(v)
                  return (
                    <div key={i} className='squad_card_box'>
                      <div className='squad_content_body'>
                        <div className='squad_image_box'>
                          {v?.HostedHeadshotNoBackgroundUrl ? (
                            <img src={v?.HostedHeadshotNoBackgroundUrl} />
                          ) : (
                            <GiAmericanFootballPlayer size={45} color={'#c4c4c4'} />
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
                              navigate(`/agent-player-interface/${v?._id}`)
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
                        <Button type='primary'>Auction</Button>
                      </div>
                    </div>
                  )
                })}
            </div>
            <div className='custom_pagination_box pagination_box'>
              <AntPagination
                defaultCurrent={page}
                total={freeAgents?.total}
                showSizeChanger={false}
                onChange={handlePagination}
                pageSize={limit}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default FreeAgent
