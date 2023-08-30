import React, { useEffect, useState } from 'react'

import { Breadcrumb, Button, notification } from 'antd'
import Arrow from '../assets/arrow-right.svg'
// Component
import DepthCard from '../components/DepthCard'
import Header from '../components/Header'

// Mock Data
import { depthCardData } from './mockData'
import PlayerRosterCard from '../components/PlayerRosterCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import { getRoster, setNonActivePlayer } from '../redux/actions/rosterAction'

const PlayerRoster = () => {
  const [activeFilter] = useState('Roster')
  const [data, setData] = useState([])
  const [activePlayerData, setActivePlayerData] = useState([])
  const [practiveSquadData, setPractiveSquadData] = useState([])
  const [nonActive, setNonActive] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleNonActive = (event, id) => {
    if (event) {
      setNonActive([...nonActive, id])
    } else {
      const temp = [...nonActive]
      let keyInd = temp?.indexOf(id)
      if (keyInd !== -1) {
        temp.splice(keyInd, 1)
        setNonActive(temp)
      }
    }
  }

  const handleSubmit = async () => {
    if (nonActive?.length === 7) {
      setSubmitLoading(true)
      await setNonActivePlayer(nonActive)
      setSubmitLoading(false)
    } else {
      notification.error({
        message: `Select atleast 7 Players (${nonActive?.length}/7)`,
        duration: 3,
      })
    }
  }

  useEffect(() => {
    const filterdData = depthCardData?.filter((v) => v?.type === activeFilter?.toLocaleLowerCase())
    setData(filterdData)
    getData()
  }, [activeFilter])

  const getData = async () => {
    setLoading(true)
    const res = await getRoster()
    if (res) {
      const filtered = res?.players?.map((v) => {
        const filterStats = res?.stats?.filter((x) => v?._id === x?.player)
        let updateStats = {}
        filterStats.forEach((val) => {
          if (v.ByeWeek && v.ByeWeek === val.weekNo) {
            updateStats[`score${val.weekNo}`] = 'B'
          } else {
            updateStats[`score${val.weekNo}`] = val.score
          }
        })
        return {
          ...v,
          stats: updateStats,
        }
      })
      const activePlayer = filtered?.filter((v) => v?.inPracticeSquad === false)
      const practiceSquad = filtered?.filter((v) => v?.inPracticeSquad === true)
      const nonAcitvePlayer = []
      res?.players?.forEach((v) => {
        if (v?.isActive !== true) {
          nonAcitvePlayer.push(v?._id)
        }
      })
      setActivePlayerData(activePlayer)
      setPractiveSquadData(practiceSquad)
      setNonActive(nonAcitvePlayer)
    }
    setLoading(false)
  }

  return (
    <div className='player_roster_container'>
      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
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

      {/* FILTER */}
      <ButtonsAndPagination />

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

      <div className='submit_button_box'>
        <Button loading={submitLoading} onClick={handleSubmit} type='primary'>
          Submit
        </Button>
      </div>

      {/* STATS */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <section className='stats_container'>
            {activePlayerData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  // style={{ margin: '20px 0px' }}
                  key={i}
                  data={v}
                  index={i}
                  nonActive={nonActive}
                  handleNonActive={handleNonActive}
                  checkbox={true}
                />
              )
            })}
          </section>

          <hr style={{ marginBlock: '40px' }} />

          <p className='heading'>Practice Squad</p>

          {/* STATS */}
          <section className='stats_container'>
            {practiveSquadData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  // style={{ margin: '20px 0px' }}
                  key={i}
                  data={v}
                  index={i}
                  nonActive={nonActive}
                  handleNonActive={handleNonActive}
                />
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerRoster
