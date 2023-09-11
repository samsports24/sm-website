import React, { useEffect, useState } from 'react'

import { Breadcrumb } from 'antd'

// Component
import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import { ColorFilter } from '../components/FilterComponent'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

// Mock Data
import { depthCardData } from './mockData'

import { getActiveRosterCount } from '../redux/actions/depthChartAction'
import {
  activeRosterCount,
  firstLetterCap,
  legalPlayers,
  nonActivePlayers,
} from '../config/constants'
import { useSelector } from 'react-redux'

const DepthChart = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [activeFilter, setActiveFilter] = useState('offense')
  const [data, setData] = useState([])
  const [activeCount, setActiveCount] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleFilter = (value) => {
    setActiveFilter(value)
  }

  useEffect(() => {
    getDepthChartData()
  }, [activeFilter, SETTING?.week])

  const getDepthChartData = async () => {
    const filtered = depthCardData.filter((obj) => obj.type === activeFilter)
    setLoading(true)

    const res = await getActiveRosterCount({
      type: activeFilter === 'special team' ? 'special' : activeFilter,
    })
    if (res) {
      setActiveCount(res?.count)

      if (res?.data?.length > 0) {
        res?.data.map((item) => {
          let index = filtered.findIndex((item2) => {
            return item2.classKey === item.classKey
          })
          if (index !== -1) {
            filtered.splice(index, 1, {
              imageUrl: item?.player?.HostedHeadshotNoBackgroundUrl || filtered[index].imageUrl,
              Name: item?.player?.Name,
              Position: filtered[index].Position,
              classKey: filtered[index].classKey,
              type: filtered[index].type,
            })
          }
        })
        setData([...filtered])
      } else {
        setData([...filtered])
      }
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
              title: <p>{firstLetterCap(activeFilter)}</p>,
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
            <h2>{`You have an illegal Roster`}</h2>
            <h4>{`kindly have ${activeRosterCount} players and ${nonActivePlayers} non active players on the roster`}</h4>
          </div>
          {/* FILTER */}
          <ColorFilter
            data={['offense', 'defense', 'special team']}
            activeFilter={activeFilter}
            handleFilter={handleFilter}
          />

          <section className='depth_chart_wrapper'>
            <div
              className={`depth_chart_cards ${
                activeFilter === 'special team'
                  ? 'special_team_container'
                  : activeFilter + '_container'
              }`}
            >
              {data?.map((v, i) => {
                return (
                  <DepthCard key={i} data={v} index={i} getDepthChartData={getDepthChartData} />
                )
              })}
            </div>
          </section>
        </section>
      )}
    </div>
  )
}

export default DepthChart
