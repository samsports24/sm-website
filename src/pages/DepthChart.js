import React, { useEffect, useState } from 'react'

import { Breadcrumb } from 'antd'

// Component
import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import { ColorFilter } from '../components/FilterComponent'

// Mock Data
import { depthCardData } from './mockData'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getActiveRosterCount } from '../redux/actions/depthChartAction'
import { legalPlayers } from '../config/constants'
import Loader from '../components/Loader'

const DepthChart = () => {
  const [activeFilter, setActiveFilter] = useState('offense')
  const [data, setData] = useState([])
  const [activeCount, setActiveCount] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleFilter = (value) => {
    setActiveFilter(value)
  }

  useEffect(() => {
    const filterdData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterdData)
    getData()
  }, [activeFilter])

  const getData = async () => {
    setLoading(true)
    const res = await getActiveRosterCount({
      type: activeFilter === 'special team' ? 'special' : activeFilter,
    })
    if (res) {
      setActiveCount(res?.count)
      console.log(res)
    }
    setLoading(false)
  }

  return (
    <div className='depth_chart_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator='>'
          items={[
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Depth-Chart</p>,
            },
            {
              title: <p>{activeFilter}</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      {loading ? (
        <Loader />
      ) : (
        <section style={{ position: 'relative' }}>
          <div
            className='overlay'
            style={{ display: activeCount == legalPlayers ? 'none' : 'flex' }}
          >
            <h2>You have an illegal Roster</h2>
          </div>
          {/* FILTER */}
          <ColorFilter data={['offense', 'defense', 'special team']} handleFilter={handleFilter} />

          <section className='depth_chart_wrapper'>
            <div
              className={`depth_chart_cards ${
                activeFilter === 'special team'
                  ? 'special_team_container'
                  : activeFilter + '_container'
              }`}
            >
              {data?.map((v, i) => {
                return <DepthCard key={i} data={v} index={i} />
              })}
            </div>
          </section>
        </section>
      )}
    </div>
  )
}

export default DepthChart
