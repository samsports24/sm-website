import React, { useEffect, useState } from 'react'
import { Input, Pagination as AntPagination, Table, Select } from 'antd'

import moment from 'moment'
import { useSelector } from 'react-redux'

import PlayerDetailsModal from '../../components/modal/PlayerDetailsModal'

import { LiaSearchSolid } from 'react-icons/lia'
import { IoIosClose } from 'react-icons/io'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import Header from '../../components/Header'
import PositionComponent from './PositionComponent'

const SearchPlayer = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [limit] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [year, setYear] = useState(moment().format('YYYY'))
  const [week, setWeek] = useState(SETTING?.week)

  useEffect(() => {
    getData()
  }, [page, search, position, year, week])

  const getData = () => {
    const payload = {
      page,
      limit,
    }
    if (search.trim() !== '') payload.search = search
    if (position) payload.position = position
    if (year) payload.year = Number(year)
    if (week) payload.week = week

    setTimeout(() => {
      setData([])
      setLoading(false)
      console.log('Payload:', payload)
    }, 2000)
  }

  const columns = [
    {
      title: 'POS',
      dataIndex: 'position',
      key: 'position',
      render: (_, obj) => (
        <div className='_positionColumn'>
          <p>{obj?.Position || '-'}</p>
        </div>
      ),
    },
    {
      title: 'PLAYER NAME',
      dataIndex: 'Name',
      key: 'Name',
      render: (t, obj) => {
        return (
          <PlayerDetailsModal
            button={<span className='fa_p_name name_text_hover'>{t || '-'}</span>}
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
      title: <p style={{ lineHeight: 1 }}>OWNED BY</p>,
      dataIndex: 'HostedHeadshotNoBackgroundUrl',
      key: 'HostedHeadshotNoBackgroundUrl',
      render: (t) => {
        return (
          <div className='squad_image_box'>
            {t ? (
              <img src={t} alt={'Player'} style={{ height: '20px', width: 'auto' }} />
            ) : (
              <GiAmericanFootballPlayer size={25} color={'#c4c4c4'} />
            )}
          </div>
        )
      },
      width: 60,
    },
    {
      title: <p style={{ lineHeight: 1 }}>TOTAL PTS</p>,
      dataIndex: 'totalPts',
      key: 'totalPts',
      render: (_, obj) => <p>{obj?.pts || '-'}</p>,
      width: 60,
    },
    {
      title: 'PPG',
      dataIndex: 'playerScore',
      key: 'playerScore',
      render: (_, obj) => <p>{obj?.avgPf || '-'}</p>,
    },
    {
      title: 'SCORE',
      dataIndex: 'score',
      key: 'score',
      render: (_, obj) => <p>{obj?.score || '-'}</p>,
    },
    {
      title: <p style={{ lineHeight: 1 }}>AVERAGE SNAP %</p>,
      dataIndex: 'avgSnap',
      key: 'avgSnap',
      render: (t) => <p>{t || '-'}</p>,
      width: 100,
    },
    {
      title: 'SNAP %',
      dataIndex: 'snap',
      key: 'snap',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'TACKLE',
      dataIndex: 'tackle',
      key: 'tackle',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: <p style={{ lineHeight: 1 }}>TACKLE FOR LOSS</p>,
      dataIndex: 'tackleForLoss',
      key: 'tackleForLoss',
      render: (t) => <p>{t || '-'}</p>,
      width: 100,
    },
    {
      title: 'SACK',
      dataIndex: 'sack',
      key: 'sack',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: <p style={{ lineHeight: 1 }}>FORCED FUMBLE</p>,
      dataIndex: 'forcedFumble',
      key: 'forcedFumble',
      render: (t) => <p>{t || '-'}</p>,
      width: 80,
    },
    {
      title: <p style={{ lineHeight: 1 }}>FUMBLE RECOVERY</p>,
      dataIndex: 'sumbleRecovery',
      key: 'sumbleRecovery',
      render: (t) => <p>{t || '-'}</p>,
      width: 80,
    },
    {
      title: <p style={{ lineHeight: 1 }}>PASS DEFENDED</p>,
      dataIndex: 'passDefended',
      key: 'passDefended',
      render: (t) => <p>{t || '-'}</p>,
      width: 80,
    },
    {
      title: 'INTERCEPTION',
      dataIndex: 'interception',
      key: 'interception',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'TOUCHDOWN',
      dataIndex: 'touchdown',
      key: 'touchdown',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'KR',
      dataIndex: 'kr',
      key: 'kr',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'KR YARDS',
      dataIndex: 'krYards',
      key: 'krYards',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'PR',
      dataIndex: 'pr',
      key: 'pr',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'PR YARDS',
      dataIndex: 'prYards',
      key: 'prYards',
      render: (t) => <p>{t || '-'}</p>,
    },
    {
      title: 'ST TD',
      dataIndex: 'stTd',
      key: 'stTd',
      render: (t) => <p>{t || '-'}</p>,
    },
  ]

  const handlePagination = (val) => setPage(val)

  const onFieldClear = () => {
    setSearch('')
  }

  return (
    <div className='_searchPlayerContainer'>
      <Header />
      <hr className='divider' />
      <header>
        <h2>
          PLAYER<b>SEARCH</b>
        </h2>
        <PositionComponent position={position} setPosition={setPosition} />
        <div className='_searchBox'>
          <p>
            PLAYER<b>NAME</b>
          </p>
          <Input
            value={search}
            className='_searchInput'
            size='small'
            placeholder='Type Name...'
            suffix={<LiaSearchSolid size={20} style={{ color: '#00DDE9' }} />}
            onChange={(e) => {
              setSearch(e.target.value)
              if (e.target.value === '') {
                onFieldClear()
              }
            }}
            allowClear={{
              clearIcon: (
                <IoIosClose
                  size={25}
                  style={{ color: '#00DDE9', marginBottom: '-4px' }}
                  onClick={() => {}}
                />
              ),
            }}
          />
        </div>
      </header>
      <section>
        <div className='new_table_container _tableContainer'>
          <div className='_filterBox'>
            <Select
              value={position}
              style={{ width: 120 }}
              onChange={(val) => setPosition(val)}
              options={[
                {
                  value: 'ALL',
                  label: 'ALL',
                },
                {
                  value: 'QB',
                  label: 'QB',
                },
                {
                  value: 'RB',
                  label: 'RB',
                },
                {
                  value: 'WR',
                  label: 'WR',
                },
                {
                  value: 'TE',
                  label: 'TE',
                },
                {
                  value: 'OL',
                  label: 'OL',
                },
                {
                  value: 'DL',
                  label: 'DL',
                },
                {
                  value: 'LB',
                  label: 'LB',
                },
                {
                  value: 'DB',
                  label: 'DB',
                },
                {
                  value: 'K',
                  label: 'K',
                },
                {
                  value: 'P',
                  label: 'P',
                },
              ]}
            />
            <Select
              value={year}
              style={{ width: 120 }}
              onChange={(val) => setYear(val)}
              options={[
                {
                  value: 2024,
                  label: 2024,
                },
                {
                  value: 2023,
                  label: 2023,
                },
                {
                  value: 2022,
                  label: 2022,
                },
              ]}
            />
            <Select
              value={week}
              style={{ width: 120 }}
              onChange={(val) => setWeek(val)}
              options={[
                {
                  value: 1,
                  label: 'Week 1',
                },
                {
                  value: 2,
                  label: 'Week 2',
                },
                {
                  value: 3,
                  label: 'Week 3',
                },
                {
                  value: 4,
                  label: 'Week 4',
                },
                {
                  value: 5,
                  label: 'Week 5',
                },
                {
                  value: 6,
                  label: 'Week 6',
                },
                {
                  value: 7,
                  label: 'Week 7',
                },
                {
                  value: 8,
                  label: 'Week 8',
                },
                {
                  value: 9,
                  label: 'Week 9',
                },
                {
                  value: 10,
                  label: 'Week 10',
                },
              ]}
            />
          </div>
          <Table
            loading={loading}
            dataSource={data}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ x: 1700 }}
            rowKey='_id'
          />
        </div>
        <div className='custom_pagination_box pagination_box'>
          <AntPagination
            defaultCurrent={page}
            total={data?.length}
            showSizeChanger={false}
            onChange={handlePagination}
            pageSize={limit}
          />
        </div>
      </section>
    </div>
  )
}

export default SearchPlayer