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

const TeamRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [activePlayerData, setActivePlayerData] = useState([])
  const [practiveSquadData, setPractiveSquadData] = useState([])
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
  const [playerCaps, setPlayerCaps] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

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
      setActivePlayerData(res?.active)
      setPractiveSquadData(res?.practice)
      setNonActive(nonAcitvePlayer)
      setProtectedCheck(protectedPlayer)
    }
    setLoading(false)
  }

  // const isTeamObj = {
  //   status: true,
  //   teamName: activePlayerData[0]?.team?.name ? activePlayerData[0]?.team?.name : null,
  //   teamId: id ? id : null,
  // }

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
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            <div className='practice_squad_header' style={{ marginTop: '20px' }}>
              <p className='heading'>
                Active<b>Squad</b>
              </p>
            </div>
            <section className='stats_container'>
              {activePlayerData?.map((v, i) => {
                return (
                  <NewRosterCard
                    key={i}
                    data={v}
                    index={i}
                    state={nonActive}
                    handleClick={() => {}}
                    playerCaps={playerCaps}
                    // isTeam={isTeamObj}
                  />
                )
              })}
            </section>
            {/* <section className='stats_container'>
            {activePlayerData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  key={i}
                  data={v}
                  index={i}
                  state={nonActive}
                  playerCaps={playerCaps}
                />
              )
            })}
          </section> */}
            {/* -------------------------------------------------- */}
            <hr style={{ marginBlock: '20px' }} />
            <div className='practice_squad_header'>
              <p className='heading'>
                Practice<b>Squad</b>
              </p>
            </div>
            <section className='stats_container'>
              {practiveSquadData?.map((v, i) => {
                return (
                  <NewRosterCard
                    key={i}
                    data={v}
                    index={i}
                    state={protectedCheck}
                    handleClick={() => {}}
                    playerCaps={playerCaps}
                    // isTeam={isTeamObj}
                    isPractice={true}
                  />
                )
              })}
            </section>
            {/* <section className='stats_container'>
            {practiveSquadData?.map((v, i) => {
              return (
                <PlayerRosterCard
                  key={i}
                  data={v}
                  index={i}
                  state={protectedCheck}
                  isPractice={true}
                  playerCaps={playerCaps}
                />
              )
            })}
          </section> */}
            {/* -------------------------------------------------- */}
            <hr style={{ marginBlock: '20px' }} />
            <div className='practice_squad_header'>
              <p className='heading'>
                Draft<b>Picks</b>
              </p>
            </div>
            <section className='stats_container'>
              {draftPickData?.draft?.length > 0 ? (
                draftPickData?.draft?.map((v, i) => {
                  return (
                    <div key={i} className='draft_pick_row'>
                      <p>{v} Pick</p>
                    </div>
                  )
                })
              ) : (
                <Empty text={'practice Squad IS EMPTY'} />
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamRoster
