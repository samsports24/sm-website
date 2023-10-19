import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button } from 'antd'

// Component
import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import { ColorFilter } from '../components/FilterComponent'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'

// Mock Data
import { depthCardData } from './mockData'

import { clearDepthChart, getActiveRosterCount } from '../redux/actions/depthChartAction'
import {
  activeRosterCount,
  firstLetterCap,
  legalPlayers,
  nonActivePlayers,
} from '../config/constants'

import { useSelector } from 'react-redux'

// import { MdLock } from 'react-icons/md'

const DepthChart = () => {
  const USER = useSelector((state) => state?.user)
  const [activeFilter, setActiveFilter] = useState('offense')
  const [data, setData] = useState([])
  const [activeCount, setActiveCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clearBtnLoading, setClearBtnLoading] = useState(false)

  const handleFilter = (value) => {
    setActiveFilter(value)
  }

  useEffect(() => {
    getDepthChartData()
  }, [activeFilter, USER?.setting?.week])

  const getDepthChartData = async () => {
    const filtered = depthCardData.filter((obj) => obj.type === activeFilter)
    setLoading(true)

    const res = await getActiveRosterCount({
      type: activeFilter === 'special team' ? 'special' : activeFilter,
      week: USER?.setting?.week,
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
              isPlayerLocked: item?.player?.isPlayerLocked ? item?.player?.isPlayerLocked : false,
              _id: item?.player?._id ? item?.player?._id : false,
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

  const clearDepthChartRoster = async () => {
    setClearBtnLoading(true)
    let playerIds = []
    data?.forEach((v) => {
      if (!v?.isPlayerLocked && v?._id) {
        playerIds.push(v?._id)
      }
    })
    const res = await clearDepthChart({
      type: activeFilter,
      ids: playerIds,
    })
    setClearBtnLoading(false)
    if (res) {
      await getDepthChartData()
    }
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
          {/* ILLEGAL ROSTER */}
          <div
            className='overlay'
            style={{
              display: activeCount != legalPlayers ? 'flex' : 'none',
              // display:
              //   activeCount != legalPlayers && SETTING?.isGameLocked === false ? 'flex' : 'none',
            }}
          >
            <h2>{`You have an illegal Roster`}</h2>
            <h4>{`kindly have ${activeRosterCount} players and ${nonActivePlayers} non active players on the roster`}</h4>
          </div>

          {/* LOCKED */}
          {/* <div
            className='overlay'
            style={{
              display: SETTING?.isGameLocked ? 'flex' : 'none',
            }}
          >
            <MdLock size={100} color={'#fff'} />
            <h1
              style={{ fontSize: '30px', color: '#fff !important' }}
            >{`Depth chart is locked till the game ends.`}</h1>
          </div> */}

          {/* FILTER */}
          <ColorFilter
            data={['offense', 'defense', 'special team']}
            activeFilter={activeFilter}
            handleFilter={handleFilter}
          />

          {USER?.setting?.week == USER?.currentWeek && (
            <div className='clear_button_box'>
              <Button loading={clearBtnLoading} type='primary' onClick={clearDepthChartRoster}>
                Clear {activeFilter}
              </Button>
            </div>
          )}

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
