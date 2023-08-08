import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button } from 'antd'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'
import DepthCard from '../components/DepthCard'

// Mock Data
import { depthCardData } from './mockData'

const DepthChart = () => {
  const [activeFilter, setActiveFilter] = useState('Offence')
  const [data, setData] = useState([])

  const handleFilter = (value) => {
    setActiveFilter(value)
  }
  useEffect(() => {
    const filterData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterData)
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

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      <section className='depth_chart_filter'>
        <h2
          onClick={() => handleFilter('Offence')}
          className={activeFilter === 'Offence' && 'active'}
        >
          offence
        </h2>
        <p>|</p>
        <h2
          onClick={() => handleFilter('Defence')}
          className={activeFilter === 'Defence' && 'active'}
        >
          defence
        </h2>
        <p>|</p>
        <h2
          onClick={() => handleFilter('Special Team')}
          className={activeFilter === 'Special Team' && 'active'}
        >
          special team
        </h2>
      </section>

      <section className='depth_chart_wrapper'>
        <div className='depth_chart_cards'>
          {data?.map((v, i) => {
            return <DepthCard key={i} data={v} index={i} />
          })}
        </div>
      </section>
    </div>
  )
}

export default DepthChart
