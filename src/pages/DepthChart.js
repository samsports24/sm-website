import React, { useEffect, useState } from 'react'

import { Breadcrumb } from 'antd'

// Component
import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import { ColorFilter } from '../components/FilterComponent'

// Mock Data
import { depthCardData } from './mockData'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const DepthChart = () => {
  const [activeFilter, setActiveFilter] = useState('offence')
  const [data, setData] = useState([])

  const handleFilter = (value) => {
    setActiveFilter(value)
  }
  useEffect(() => {
    const filterdData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterdData)
  }, [activeFilter])

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

      {/* FILTER */}
      <ColorFilter data={['offence', 'defence', 'special team']} handleFilter={handleFilter} />

      <section className='depth_chart_wrapper'>
        <div
          className={`depth_chart_cards ${
            activeFilter === 'special team' ? 'special_team_container' : activeFilter + '_container'
          }`}
        >
          {data?.map((v, i) => {
            return <DepthCard key={i} data={v} index={i} />
          })}
        </div>
      </section>
    </div>
  )
}

export default DepthChart
