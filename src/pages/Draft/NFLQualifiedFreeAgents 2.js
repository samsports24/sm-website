import React, { useState, useEffect } from 'react'
import { Button, Select, Table, Pagination as AntPagination, Input } from 'antd'
import { useSelector } from 'react-redux'

import { SearchOutlined } from '@ant-design/icons'
import { GrFormClose } from 'react-icons/gr'
import { GiAmericanFootballPlayer } from 'react-icons/gi'

import Header from '../../components/Header'
import { getNFLFreeAgent, requestIsPicked } from '../../redux/actions/rosterAction'
import PlayerDetailsModal from '../../components/modal/PlayerDetailsModal'

const NFLQualifiedFreeAgents = () => {
  const userDetail = useSelector((state) => state?.user?.userDetails)
  const [qualifiedTeams, setQualifiedTeams] = useState([])
  const [nflFreeAgents, setNflFreeAgents] = useState([])
  const [playerID, setPlayerID] = useState(false)
  const [loading, setLoading] = useState(false)
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState('')

  const getData = async () => {
    setLoading(true)
    const res = await getNFLFreeAgent({ search, limit: limit, page: page, sort: filterBy })
    setNflFreeAgents(res)
    setQualifiedTeams(res?.qualifiedTeams)
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [page, filterBy])

  // useEffect(() => {
  // }, [nflFreeAgents])

  const handleFilterByText = async () => {
    setLoading(true)
    if (search?.trim() !== '') {
      const res = await getNFLFreeAgent({
        search,
        limit: limit,
        page: 1,
        sort: '',
      })
      setNflFreeAgents(res)
    }
    setLoading(false)
  }

  const handlePagination = (val) => setPage(val)

  const onFieldClear = async () => {
    setLoading(true)
    const res = await getNFLFreeAgent({
      search: '',
      limit: limit,
      page: 1,
      sort: '',
    })
    setNflFreeAgents(res)
    setLoading(false)
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
            // button={<span className='fa_p_name name_text_hover'>{t}</span>}
            button={
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className='fa_p_name name_text_hover'>{t}</span>
                {obj?.InjuryStatus === 'Out' ? (
                  <>
                    <img src={require('../../assets/plus-icon.png')} width={20} height={20} />
                    <p className='injury_plus_text'>O</p>
                  </>
                ) : obj?.InjuryStatus === 'Questionable' ? (
                  <p className='injury_status'>Q</p>
                ) : obj?.InjuryStatus === 'Doubtful' ? (
                  <p className='injury_status'>D</p>
                ) : obj?.InjuryStatus === 'Suspended' ? (
                  <p className='injury_status'>SSPD</p>
                ) : obj?.InjuryStatus === 'Injured Reserve' ? (
                  <p className='injury_status'>IR</p>
                ) : (
                  ''
                )}
              </div>
            }
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
      title: 'TEAM',
      dataIndex: 'Team',
      key: 'Team',
      render: (t) => <p>{t || '-'}</p>,
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
      title: 'AGE',
      dataIndex: 'Age',
      key: 'Age',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: ' ',
      dataIndex: 'auction',
      key: 'auction',
      render: (_, obj) => {
        return (
          <Button
            // disabled={qualifiedTeams.includes(userTeam?._id) ? false : true}
            disabled={!nflFreeAgents?.draftEnabled}
            loading={playerID == obj?.PlayerID}
            type='primary'
            className='_button'
            onClick={() => {
              handleIsPicked(obj?.PlayerID, obj?._id)
            }}
          >
            Pick
          </Button>
        )
        // return (
        //   <Button
        //     // disabled={qualifiedTeams.includes(userTeam?._id) ? false : true}
        //     // disabled={!nflFreeAgents?.draftEnabled}
        //     loading={playerID == obj?.PlayerID}
        //     type='primary'
        //     className='_button'
        //     onClick={() => {
        //       handleIsPicked(obj?.PlayerID, obj?._id)
        //     }}
        //   >
        //     Pick
        //   </Button>
        // )
      },
    },
  ]

  const handleIsPicked = async (playerID, nfl_player_id) => {
    setPlayerID(playerID)
    const res = await requestIsPicked({
      PlayerID: playerID,
      player_id: nfl_player_id,
    })
    if (res) {
      setPlayerID('')

      setLoading(true)
      const resPlayers = await getNFLFreeAgent({
        search,
        limit: limit,
        page: page,
        sort: '',
      })
      if (resPlayers) {
        setNflFreeAgents(resPlayers)
        setLoading(false)
      }
    } else {
      setPlayerID('')
    }
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <div className='header'>
          <div className='heading_selectBox'>
            <h2>Player Draft</h2>
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
            dataSource={nflFreeAgents?.players}
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
            total={nflFreeAgents?.total}
            showSizeChanger={false}
            onChange={handlePagination}
            pageSize={limit}
          />
        </div>
      </section>
    </div>
  )
}

export default NFLQualifiedFreeAgents
