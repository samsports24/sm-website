import React, { useEffect, useState } from 'react'
import { Table } from 'antd'

import Header from '../components/Header'

import { GiHockey } from 'react-icons/gi'
import { leagueSalaryCap } from '../config/constants'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTeamFinancials } from '../redux/actions/leagueActions'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'
import { getUser } from '../redux'

const TeamFinancials = () => {
  const SETTING = useSelector((state) => state.user)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
    getUser()
  }, [])

  const getData = async () => {
    !isLoading && setIsLoading(true)
    const res = await getTeamFinancials()
    setData(res)
    setIsLoading(false)
  }

  const handleRosterNavigate = (obj) => {
    const myTeam = obj?._id === SETTING?.userDetails?.team?._id
    if (myTeam) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${obj?._id}`, {
        state: {
          teamName: obj?.name,
          teamLogo: obj?.logo,
        },
      })
    }
  }

  const columns = [
    {
      title: ' ',
      dataIndex: 'logo',
      key: 'logo',
      render: (t) => {
        return (
          <div className='squad_image_box'>
            {t ? <img src={t} alt={'Logo'} /> : <GiHockey size={45} color={'#c4c4c4'} />}
          </div>
        )
      },
      width: 75,
    },
    {
      title: 'Teams',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Team Salary Cap',
      dataIndex: 'teamSalaryCap',
      key: 'teamSalaryCap',
      render: (t) => {
        return <p>{t ? `$${t?.toLocaleString()}` : '-'}</p>
      },
      sorter: {
        compare: (a, b) => a.teamSalaryCap - b.teamSalaryCap,
        multiple: 3,
      },
    },
    {
      title: 'Team Cap Left',
      dataIndex: 'teamSalaryCap',
      key: 'teamSalaryCap',
      render: (t) => {
        return (
          <p className={`${leagueSalaryCap - t > 0 ? 'green' : 'red'}`}>
            {t ? `$${(myleagueSalaryCap - t)?.toLocaleString()}` : '-'}
          </p>
        )
      },
      sorter: {
        compare: (a, b) => a.teamSalaryCap - b.teamSalaryCap,
        multiple: 3,
      },
    },
    {
      title: 'Rosters',
      dataIndex: '_id',
      key: '_id',
      render: (_, obj) => (
        <p onClick={() => handleRosterNavigate(obj)} className='view_roster_text'>
          View Roster
        </p>
      ),
    },
    {
      title: 'Contact Ownership',
      dataIndex: 'user',
      key: 'user',
      render: (_, obj) => <p>{obj?.user?.name?.trim() || obj?.user?.userName || '-'}</p>,
    },
  ]

  return (
    <div className='tf_container'>
      <Header />
      <HeadingAndWeek heading={'TEAM FINANCIALS'} week={false} />

      <div className='filters_section'>
        {[
          {
            name: 'Within Salary Cap',
            color: '#7ed957',
          },
          {
            name: 'Over Salary Cap',
            color: '#ff3131',
          },
        ].map((v) => {
          return (
            <div key={v?.name} className='filter_card'>
              <div className='filter_color' style={{ backgroundColor: v?.color }}></div>
              <p>{v?.name}</p>
            </div>
          )
        })}
      </div>

      <div className='border_table_container'>
        <Table
          sticky
          loading={isLoading}
          dataSource={data}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 1100 }}
          rowKey='_id'
        />
      </div>
    </div>
  )
}

export default TeamFinancials
