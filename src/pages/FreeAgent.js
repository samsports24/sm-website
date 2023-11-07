import React, { useEffect, useState } from 'react'

import { Button, Input, Pagination as AntPagination, Table } from 'antd'

// import Arrow from '../assets/arrow-right.svg'
import { SearchOutlined } from '@ant-design/icons'

// Component
import Header from '../components/Header'

import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { createAuction, getFreeAgent } from '../redux/actions/rosterAction'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'

const FreeAgent = () => {
  const [freeAgents, setFreeAgents] = useState({
    total: 0,
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [playerID, setPlayerID] = useState(false)
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

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
      search,
      limit: limit,
      page: page,
    })
    setFreeAgents(res)
    setLoading(false)
  }

  const handlePagination = (val) => setPage(val)

  const handleFilterBy = async () => {
    setLoading(true)
    if (search?.trim() !== '') {
      const res = await getFreeAgent({
        search,
        limit: limit,
        page: 1,
      })
      setFreeAgents(res)
    }
    setLoading(false)
  }

  const onFieldClear = async () => {
    setLoading(true)
    const res = await getFreeAgent({
      search: '',
      limit: limit,
      page: 1,
    })
    setFreeAgents(res)
    setLoading(false)
  }

  const handleCreateAuction = async (playerID, player_id) => {
    setPlayerID(playerID)
    const res = await createAuction({
      PlayerID: playerID,
      player_id: player_id,
      auctionFrom: 'nonowner',
    })
    if (res) {
      navigate('/player-auction')
    }
    setPlayerID('')
  }

  const columns = [
    {
      title: ' ',
      dataIndex: 'HostedHeadshotNoBackgroundUrl',
      key: 'HostedHeadshotNoBackgroundUrl',
      render: (text) => {
        return (
          <div className='squad_image_box'>
            {text ? (
              <img src={text} alt={'Player'} />
            ) : (
              <GiAmericanFootballPlayer size={45} color={'#c4c4c4'} />
            )}
          </div>
        )
      },
    },
    {
      title: 'POSITION',
      dataIndex: 'Position',
      key: 'Position',
    },
    {
      title: 'PLAYER NAME',
      dataIndex: 'Name',
      key: 'Name',
      render: (t, obj) => {
        return (
          <p
            onClick={() => {
              navigate(`/agent-player-interface/${obj?.PlayerID}`)
            }}
            style={{ cursor: 'pointer' }}
            className='name_text_hover'
          >
            {t || '-'}
          </p>
        )
      },
    },
    {
      title: 'PF',
      dataIndex: 'pointsPerGame',
      key: 'pointsPerGame',
      render: (t) => <p>{t > 0 ? t : '-'}</p>,
    },
    {
      title: 'PLAYER RANK',
      dataIndex: 'playerRank',
      key: 'playerRank',
      render: (t) => <p>{t > 0 ? t : '-'}</p>,
    },
    {
      title: 'AGE',
      dataIndex: 'Age',
      key: 'Age',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'TEAM',
      dataIndex: 'Team',
      key: 'Team',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'OPP',
      dataIndex: 'UpcomingGameOpponent',
      key: 'UpcomingGameOpponent',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'BYE',
      dataIndex: 'ByeWeek',
      key: 'ByeWeek',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'PLAYER CAP #',
      dataIndex: 'PlayerCap',
      key: 'PlayerCap',
      render: (t) => <p> {t ? `$${t?.toLocaleString()}` : '-'}</p>,
    },

    {
      title: ' ',
      dataIndex: 'auction',
      key: 'auction',
      render: (_, obj) => {
        return (
          <Button
            disabled={false}
            loading={playerID == obj?.PlayerID}
            type='primary'
            className='_button'
            onClick={() => {
              handleCreateAuction(obj?.PlayerID, obj?._id)
            }}
          >
            Auction
          </Button>
        )
      },
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BREADCRUMB */}
      {/* <section className='_breadcrumb'>
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
      </section> */}

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination noWeek={true} />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <div className='header'>
          <h2>FREE AGENT</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Input
              className='free_agent_search_input'
              size='small'
              placeholder='Search here...'
              prefix={<SearchOutlined />}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value === '') {
                  onFieldClear()
                }
              }}
              allowClear={{ clearIcon: <GrFormClose size={25} onClick={onFieldClear} /> }}
            />
            <Button type='primary' onClick={handleFilterBy}>
              SEARCH
            </Button>
          </div>
        </div>
        <div className='new_table_container'>
          <Table
            loading={loading}
            dataSource={freeAgents?.players}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1100 }}
          />
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
      </section>
    </div>
  )
}

export default FreeAgent
