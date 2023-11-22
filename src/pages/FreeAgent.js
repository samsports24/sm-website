import React, { useEffect, useState } from 'react'

import { Button, Input, Pagination as AntPagination, Table } from 'antd'

import { SearchOutlined } from '@ant-design/icons'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'

import { createAuction, getFreeAgent } from '../redux/actions/rosterAction'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import { useSelector } from 'react-redux'
import { getPfScore } from '../config/helperFunctions'

const FreeAgent = () => {
  const SETTING = useSelector((state) => state.user.setting)
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
          <PlayerDetailsModal
            button={<span className='fa_p_name name_text_hover'>{t}</span>}
            state={{
              playerID: obj?.PlayerID,
              teamId: null,
              teamName: '',
              teamLogo: null,
              isFreeAgent: true,
            }}
          />
        )
      },
    },
    {
      title: 'PF',
      dataIndex: 'playerScore',
      key: 'playerScore',
      render: (_, obj) => {
        return <p>{getPfScore(obj?.weeklyScoring)?.pf}</p>
      },
    },
    {
      title: 'AVG. PF',
      dataIndex: 'playerScore',
      key: 'playerScore',
      render: (_, obj) => {
        return <p>{getPfScore(obj?.weeklyScoring)?.avg}</p>
      },
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
      <Header />

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
