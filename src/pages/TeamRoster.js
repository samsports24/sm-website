import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

// Component
import Header from '../components/Header'
// import PlayerRosterCard from '../components/PlayerRosterCard'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import Empty from '../components/Empty'

import { getTeamRoster } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'

import { draftData } from '../config/draftData'
import NewRosterCard from '../components/NewRosterCard'
import { sortedArray } from '../config/helperFunctions'
import { Col, Row } from 'antd'

const TeamRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [activePlayerData, setActivePlayerData] = useState([])
  const [practiveSquadData, setPractiveSquadData] = useState([])
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
  const [playerCaps, setPlayerCaps] = useState(null)
  const [averagePf, setAveragePf] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  const [filterData, setFilterData] = useState({
    filterActiveRoster: [],
    filterNonActiveRoster: [],
    filterPracticeRoster: [],
    filterProtectedRoster: [],
  })

  const [draftPickData] = useState(draftData?.find((v) => v?.teamId === id))

  useEffect(() => {
    SETTING?.week !== 0 && getData()
  }, [SETTING?.week, id])

  const getData = async () => {
    setLoading(true)
    const res = await getTeamRoster({ week: SETTING?.week, team: id })
    if (res) {
      const nonAcitvePlayer = []
      res?.active?.forEach((v) => {
        if (v?.players?.isActive !== true) {
          nonAcitvePlayer.push(v?.players?.PlayerID)
        }
      })
      const protectedPlayer = []
      res?.practice?.forEach((v) => {
        if (v?.players?.isPlayerProtected == true) {
          protectedPlayer.push(v?.players?.PlayerID)
        }
      })

      setPlayerCaps(res?.playerCaps)
      setAveragePf(res?.averagePf)
      setActivePlayerData(res?.active)
      setPractiveSquadData(res?.practice)
      setNonActive(nonAcitvePlayer)
      setProtectedCheck(protectedPlayer)
      setFilterData({
        filterActiveRoster: res?.active?.filter((x) => x?.players?.isActive === true),
        filterNonActiveRoster: res?.active?.filter((x) => x?.players?.isActive !== true),
        filterPracticeRoster: res?.practice?.filter((x) => x?.players?.isPlayerProtected !== true),
        filterProtectedRoster: res?.practice?.filter((x) => x?.players?.isPlayerProtected === true),
      })
    }
    setLoading(false)
  }

  return (
    <div className='player_roster_container team_roster_container'>
      <Header />
      <ButtonsAndPagination />
      <div className='viewing_roster_heading'>
        {activePlayerData[0]?.team?.name && (
          <h2>Your are viewing {activePlayerData[0]?.team?.name} rosters.</h2>
        )}
      </div>
      <hr className='divider' />

      {loading ? (
        <Loader />
      ) : (
        <Row>
          <Col xs={24} lg={16}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '800px' }}>
                <div className='practice_squad_header' style={{ marginTop: '20px' }}>
                  <p className='heading'>
                    Active<b>Squad</b>
                  </p>
                </div>
                <section className='stats_container'>
                  {filterData?.filterActiveRoster?.length > 0 ? (
                    sortedArray(filterData?.filterActiveRoster)?.map((v, i) => {
                      return (
                        <NewRosterCard
                          key={i}
                          data={v}
                          index={i}
                          state={{
                            isTeamRoster: { status: true },
                          }}
                          checkBoxIds={nonActive}
                          handleClick={() => {}}
                          playerCaps={playerCaps}
                          averagePf={averagePf}
                          checkBox={false}
                        />
                      )
                    })
                  ) : (
                    <Empty text={'Active Squad IS EMPTY'} />
                  )}
                </section>
                {/* -------------------------------------------------- */}
                <div className='practice_squad_header' style={{ marginTop: '20px' }}>
                  <p className='heading'>
                    Non-Active<b>Squad</b>
                  </p>
                </div>
                <section className='stats_container'>
                  {filterData?.filterNonActiveRoster?.length > 0 ? (
                    sortedArray(filterData?.filterNonActiveRoster)?.map((v, i) => {
                      return (
                        <NewRosterCard
                          key={i}
                          data={v}
                          index={i}
                          state={{
                            isTeamRoster: { status: true },
                          }}
                          checkBoxIds={nonActive}
                          handleClick={() => {}}
                          playerCaps={playerCaps}
                          averagePf={averagePf}
                          checkBox={false}
                        />
                      )
                    })
                  ) : (
                    <Empty text={'Non-Active Squad IS EMPTY'} />
                  )}
                </section>
                {/* -------------------------------------------------- */}
                <hr style={{ marginBlock: '20px' }} />
                <div className='practice_squad_header'>
                  <p className='heading'>
                    Practice<b>Squad</b>
                  </p>
                </div>
                <section className='stats_container'>
                  {filterData?.filterPracticeRoster?.length > 0 ? (
                    sortedArray(filterData?.filterPracticeRoster)?.map((v, i) => {
                      return (
                        <NewRosterCard
                          key={i}
                          data={v}
                          index={i}
                          state={{
                            isTeamRoster: { status: true },
                          }}
                          checkBoxIds={protectedCheck}
                          handleClick={() => {}}
                          playerCaps={playerCaps}
                          averagePf={averagePf}
                          isPractice={true}
                          checkBox={false}
                        />
                      )
                    })
                  ) : (
                    <Empty text={'Practice Squad IS EMPTY'} />
                  )}
                </section>
                {/* -------------------------------------------------- */}
                <div className='practice_squad_header' style={{ marginTop: '20px' }}>
                  <p className='heading'>
                    Protected<b>Squad</b>
                  </p>
                </div>
                <section className='stats_container'>
                  {filterData?.filterProtectedRoster?.length > 0 ? (
                    sortedArray(filterData?.filterProtectedRoster)?.map((v, i) => {
                      return (
                        <NewRosterCard
                          key={i}
                          data={v}
                          index={i}
                          state={{
                            isTeamRoster: { status: true },
                          }}
                          checkBoxIds={protectedCheck}
                          handleClick={() => {}}
                          playerCaps={playerCaps}
                          averagePf={averagePf}
                          isPractice={true}
                          checkBox={false}
                        />
                      )
                    })
                  ) : (
                    <Empty text={'Protected Squad IS EMPTY'} />
                  )}
                </section>
                {/* -------------------------------------------------- */}
                <hr style={{ marginBlock: '20px' }} />
                <div className='practice_squad_header'>
                  <p className='heading'>
                    Draft<b>Picks</b>
                  </p>
                </div>
                <section className='draft_pick_box'>
                  {draftPickData?.draft?.length > 0 ? (
                    draftPickData?.draft?.map((v, i) => {
                      return (
                        <div key={i} className='draft_pick_row'>
                          <p>{v} Pick</p>
                        </div>
                      )
                    })
                  ) : (
                    <Empty text={'Draft Data is empty'} />
                  )}
                </section>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={8}></Col>
        </Row>
      )}
    </div>
  )
}

export default TeamRoster
