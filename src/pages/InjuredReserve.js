import React, { useEffect, useState } from 'react'

import { Table } from 'antd'

// import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import MoveToRoster from '../components/modal/PlayerInterfaceModals/MoveToRoster'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { getAllIr } from '../redux/actions/rosterAction'
import { useNavigate } from 'react-router-dom'

const InjuredReserve = () => {
  const [injuredReserve, setInjuredReserve] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

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
  const columns = [
    {
      title: ' ',
      dataIndex: 'HostedHeadshotNoBackgroundUrl',
      key: 'HostedHeadshotNoBackgroundUrl',
      render: (_, obj) => {
        return (
          <div className='squad_image_box'>
            {obj?.player?.HostedHeadshotNoBackgroundUrl ? (
              <img src={obj?.player?.HostedHeadshotNoBackgroundUrl} alt={'Player'} />
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
      render: (_, obj) => <p>{obj?.player?.Position || '-'}</p>,
    },
    {
      title: 'PLAYER NAME',
      dataIndex: 'Name',
      key: 'Name',
      render: (_, obj) => <p>{obj?.player?.Name || '-'}</p>,
    },
    {
      title: 'AGE',
      dataIndex: 'Age',
      key: 'Age',
      render: (_, obj) => <p>{obj?.player?.Age || '-'}</p>,
    },
    {
      title: 'TEAM',
      dataIndex: 'Team',
      key: 'Team',
      render: (_, obj) => <p>{obj?.player?.Team || '-'}</p>,
    },
    {
      title: 'OPP',
      dataIndex: 'UpcomingGameOpponent',
      key: 'UpcomingGameOpponent',
      render: (_, obj) => <p>{obj?.player?.UpcomingGameOpponent || '-'}</p>,
    },
    {
      title: 'BYE',
      dataIndex: 'ByeWeek',
      key: 'ByeWeek',
      render: (_, obj) => <p>{obj?.player?.ByeWeek || '-'}</p>,
    },
    {
      title: 'PLAYER CAP #',
      dataIndex: 'PlayerCap',
      key: 'PlayerCap',
      render: (_, obj) => (
        <p>
          {' '}
          {injuredReserve?.playerCaps[obj?.player?.PlayerID]
            ? `$${injuredReserve?.playerCaps[obj?.player?.PlayerID]?.toLocaleString()}`
            : '-'}
        </p>
      ),
    },
    {
      title: 'PF',
      dataIndex: 'pointsPerGame',
      key: 'pointsPerGame',
      render: (_, obj) => <p>{obj?.player?.pointPerGame > 0 ? obj?.player?.pointPerGame : '-'}</p>,
    },
    {
      title: 'PLAYER RANK',
      dataIndex: 'playerRank',
      key: 'playerRank',
      render: (_, obj) => <p>{obj?.player?.playerRank > 0 ? obj?.player?.playerRank : '-'}</p>,
    },
    {
      title: ' ',
      dataIndex: 'auction',
      key: 'auction',
      render: (_, obj) => {
        return (
          <MoveToRoster
            activeDate={obj?.activeDate}
            injuredDate={obj?.injuredDate}
            playerId={obj?.PlayerID}
            injuredId={obj?._id}
            getData={getData}
          />
        )
      },
    },
  ]

  return (
    <div className='practice_squad_container team_trade_main'>
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

      <Header />

      <ButtonsAndPagination noWeek={true} />

      <hr className='divider' />

      <div className='header' style={{ marginBottom: '20px' }}>
        <h2>INJURED RESERVE</h2>
      </div>

      <div className='new_table_container'>
        <Table
          loading={loading}
          dataSource={injuredReserve?.data}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </div>

      {/* <section className='squad_card_container transparent'>
        {loading ? (
          <Loader />
        ) : (
          <>
            {injuredReserve?.data?.length < 0 ? (
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
      </section> */}
    </div>
  )
}

export default InjuredReserve

// Your roster is full, it has all 53 players
// However, you can move this player to the practice squad
