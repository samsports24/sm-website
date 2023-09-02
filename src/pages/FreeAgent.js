import React, { useEffect, useState } from 'react'

import { Button, Breadcrumb, Typography, Input, Pagination as AntPagination } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import { SearchOutlined } from '@ant-design/icons'

// Component
import Header from '../components/Header'

// import barIcon from '../assets/bar-icon.svg'

// import { practiceSquadData } from './mockData'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getFreeAgent } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { GrFormClose } from 'react-icons/gr'

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
  const [filterBy, setFilterBy] = useState('')

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
      searchTeam: filterBy === 'team' ? search : '',
      searchPosition: filterBy === 'position' ? search : '',
      limit: limit,
      page: page,
    })
    setFreeAgents(res)
    setLoading(false)
  }

  const handlePagination = (val) => setPage(val)

  const handleFilterBy = async (val) => {
    setFilterBy(val)
    if (search?.trim() !== '') {
      const res = await getFreeAgent({
        searchTeam: val === 'team' ? search : '',
        searchPosition: val === 'position' ? search : '',
        limit: limit,
        page: 1,
      })
      setFreeAgents(res)
    }
  }

  const onFieldClear = async () => {
    setLoading(true)
    const res = await getFreeAgent({
      searchTeam: '',
      searchPosition: '',
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

      <ButtonsAndPagination />

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
            <Button type='primary' onClick={() => handleFilterBy('team')}>
              TEAM
            </Button>
            <Button type='primary' onClick={() => handleFilterBy('position')}>
              POSITION
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
              I.R IS EMPTY
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
                  return (
                    <div key={i} className='squad_card_box'>
                      {/* <div className='squad_header'>
                    <h2>{v?.title}</h2>
                  </div> */}
                      <div className='squad_content_body'>
                        <div className='squad_image_box'>
                          {v?.image ? (
                            <img src={v?.image} />
                          ) : (
                            <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
                          )}
                        </div>
                        <div>
                          <p className='squad_text1'>position</p>
                          <p className='squad_text2'>{v?.Position || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>player name</p>
                          <p className='squad_text2'>{v?.Name || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>age</p>
                          <p className='squad_text2'>{v?.Age || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>team</p>
                          <p className='squad_text2'>{v?.Team || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>bye</p>
                          <p className='squad_text2'>{v?.ByeWeek || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>player cap #</p>
                          <p className='squad_text2'>{v?.PlayerCap || '-'}</p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            year left <br /> experation &nbsp;
                            <span className='squad_text2'>{v?.YearLeftExperation || '-'}</span>
                          </p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            point per <br /> game &nbsp;
                            <span className='squad_text2'>{v?.pointsPerGame || '-'}</span>
                          </p>
                        </div>
                        <div>
                          <p className='squad_text1'>
                            player <br /> rank &nbsp;
                            <span className='squad_text2'>{v?.playerRank || '-'}</span>
                          </p>
                        </div>
                        {/* <img src={barIcon} /> */}
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
