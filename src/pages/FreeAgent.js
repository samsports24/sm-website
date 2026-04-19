import React, { useEffect, useState } from 'react'

import { Button, Input, Pagination as AntPagination, Table, Select, notification, Tooltip } from 'antd'

import { SearchOutlined } from '@ant-design/icons'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'

import { createAuction, getFreeAgent } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import { getRankAndPosition } from '../config/helperFunctions'

const FreeAgent = () => {
  const SETTING = useSelector((state) => state.user.setting)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true
  const [freeAgents, setFreeAgents] = useState({
    total: 0,
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [playerID, setPlayerID] = useState(false)
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState('')
  const [noti, contextHolder] = notification.useNotification()
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [page, filterBy])

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
      sort: filterBy,
    })
    setFreeAgents(res)
    setLoading(false)
  }

  const handlePagination = (val) => setPage(val)

  const handleFilterByText = async () => {
    setLoading(true)
    if (search?.trim() !== '') {
      const res = await getFreeAgent({
        search,
        limit: limit,
        page: 1,
        sort: '',
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
      sort: '',
    })
    setFreeAgents(res)
    setLoading(false)
  }




  const handleCreateAuction = async (playerID, player_id,CapHit) => {
// let CapHit=5;

    if (sampoints < CapHit) {
 
      // noti.error(`Bid amount ${bidAmount} exceeds your available points of ${sampoints}.`);
      notification.error({
        message: `Bid amount ${CapHit} exceeds your available points of ${sampoints}.`,
        duration: 4,
      });
      return
    }

    setPlayerID(playerID)

    const res = await createAuction({
      PlayerID: playerID,
      player_id: player_id,
      auctionFrom: 'nonowner',
      CapHit:CapHit === 0 ? 50000 : CapHit
   //   CapHit,
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
              isFreeAgent: {
                status: true,
              },
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
        return <p>{obj?.pf || '-'}</p>
      },
    },
    {
      title: 'AVG. PF',
      dataIndex: 'playerScore',
      key: 'playerScore',
      render: (_, obj) => {
        return <p>{obj?.avgPf || '-'}</p>
      },
    },
    {
      title: 'PLAYER RANK',
      dataIndex: 'playerRank',
      key: 'playerRank',
      render: (_, obj) => <p>{getRankAndPosition(obj?.weeklyScoring)?.playerOverallRank}</p>,
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
      render: (_, obj) => (
        <p>
          {obj ? `SP ${obj.currentYearSalaryCap.toLocaleString()}` : '-'}
        </p>
      )
      
      // render: (_, obj) => <p>{getRankAndPosition(obj?.weeklyScoring)?.playerOverallRank}</p>,
    },

    

    {
      title: ' ',
      dataIndex: 'auction',
      key: 'auction',
      render: (_, obj) => {
        return draftNotCompleted ? (
            <span style={{
              padding: '1px 8px', borderRadius: 3,
              background: 'rgba(110,105,128,0.1)',
              color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>locked</span>
          ) : (
            <Button
              loading={playerID == obj?.PlayerID}
              type='primary'
              className='_button'
              onClick={() => {
                handleCreateAuction(obj?.PlayerID, obj?._id,obj?.currentYearSalaryCap)
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
          <div className='heading_selectBox'>
            <h2>FREE AGENT</h2>
            <Select
              placeholder='Sort by'
              onChange={(v) => setFilterBy(v)}
              allowClear={{ clearIcon: <GrFormClose size={25} onClick={() => {}} /> }}
              options={[
                {
                  value: 'pf_asc',
                  label: 'Total PF Ascending',
                },
                {
                  value: 'pf_desc',
                  label: 'Total PF Descending',
                },
                {
                  value: 'apf_asc',
                  label: 'Average PF Ascending',
                },
                {
                  value: 'apf_desc',
                  label: 'Average PF Descending',
                },
              ]}
              className='filter_select_box'
            />
          </div>

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
            <Button type='primary' onClick={handleFilterByText}>
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
            rowKey='_id'
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
