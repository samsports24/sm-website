import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Button, Spin, notification } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

import Header from '../components/Header'
import DepthCard from '../components/DepthCard'
import Loader from '../components/Loader'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'
import OnboardingGuide from '../components/OnboardingGuide'

import {
  getActiveRosterCount,
  assignLineupFormation,
  getteamFormation,
  clearDepthChart,
} from '../redux/actions/depthChartAction'

import '../styles/pages/depthChart.css'

/* ── Formation options ──
   IMPORTANT: values MUST match the CSS class names in depthCard.css
   so the parent container class triggers correct player positioning.
── */
const DEFENSE_FORMATIONS = [
  { label: '4-3', value: 'formation_43' },
  { label: '3-4', value: 'formation_34' },
  { label: 'Nickel', value: 'formation_425' },
  { label: 'Dime', value: 'dime' },
  { label: '3-3-5', value: 'nickel' },
  { label: 'Cover 2', value: 'cover2' },
]

const OFFENSE_FORMATIONS = [
  { label: 'Shotgun', value: 'shortgunnormal' },
  { label: 'Singleback', value: 'singleback' },
  { label: 'I-Form', value: 'iformaton' },
  { label: 'Pistol', value: 'pistol' },
  { label: 'Spread', value: 'spread' },
]

/* ── Pure CSS Football Field ── */
const FootballField = () => {
  const yardLines = [12, 24, 36, 48, 60, 72, 84]
  return (
    <div className='dc-field'>
      <div className='dc-field-midline' />
      {yardLines.map((pct, i) => (
        <div
          key={i}
          className='dc-field-yardline'
          style={{ top: `${pct}%` }}
        >
          <span>{50 - i * 10}</span>
        </div>
      ))}
      <div className='dc-field-hash dc-field-hash-left' />
      <div className='dc-field-hash dc-field-hash-right' />
      <div className='dc-field-logo'>SAMSPORTS</div>
      <div className='dc-field-endzone' />
    </div>
  )
}

const DepthChart = () => {
  const dispatch = useDispatch()
  const { teamID } = useParams()
  const SETTING = useSelector((state) => state?.user?.setting)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const currentLeague = useSelector((state) => state.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const depthChartState = useSelector((state) => state?.depthChart)
  const { staticData, data, activeFilter, rosterCount } = depthChartState

  const [isLoading, setIsLoading] = useState(true)
  const [offenseFormation, setOffenseFormation] = useState('shortgunnormal')
  const [defenseFormation, setDefenseFormation] = useState('formation_43')
  const [clearLoading, setClearLoading] = useState(false)

  // Active formation based on current filter
  const selectedFormation = activeFilter === 'offense' ? offenseFormation : defenseFormation

  /* ── Load formation + depth chart data ── */
  const getDepthChartData = useCallback(async () => {
    setIsLoading(true)
    try {
      const payload = {
        week: SETTING?.week,
        type: activeFilter,
        formation: selectedFormation,
      }
      if (teamID) payload.teamId = teamID

      const res = await getActiveRosterCount(payload)
      if (res) {
        dispatch({ type: 'SET_DEPTH_CHART_DATA', payload: { data: res.data, count: res.count } })
      }
    } catch (err) {
      console.error('Failed to load depth chart:', err)
    }
    setIsLoading(false)
  }, [SETTING?.week, activeFilter, selectedFormation, teamID, dispatch, currentLeagueId])

  /* ── Load saved formation on mount ── */
  useEffect(() => {
    const loadFormation = async () => {
      try {
        const res = await getteamFormation()
        if (res?.offense_Formation) {
          setOffenseFormation(res.offense_Formation)
        }
        if (res?.defense_Formation) {
          setDefenseFormation(res.defense_Formation)
        }
      } catch {}
    }
    loadFormation()
  }, [currentLeagueId])

  /* ── Re-fetch when filter/formation/week/league changes ── */
  useEffect(() => {
    if (SETTING?.week) {
      getDepthChartData()
    }
  }, [getDepthChartData])

  /* ── Handle formation change ── */
  const handleFormationChange = async (formation) => {
    if (activeFilter === 'offense') {
      setOffenseFormation(formation)
    } else {
      setDefenseFormation(formation)
    }
    try {
      await assignLineupFormation({
        payload: {
          formation,
          activeFilter: activeFilter,
          week: SETTING?.week,
        },
      })
    } catch {}
  }

  /* ── Handle offense/defense/special toggle ── */
  const handleFilterChange = (filter) => {
    // Offense-only leagues can't switch to defense
    if (isOffenseOnly && filter === 'defense') return
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter })
  }

  /* ── Force offense filter for offense-only leagues ── */
  useEffect(() => {
    if (isOffenseOnly && activeFilter === 'defense') {
      dispatch({ type: 'SET_ACTIVE_FILTER', payload: 'offense' })
    }
  }, [isOffenseOnly, activeFilter, dispatch])

  /* ── Clear lineup ── */
  const handleClearLineup = async () => {
    setClearLoading(true)
    try {
      await clearDepthChart({
        week: SETTING?.week,
        type: activeFilter,
      })
      await getDepthChartData()
      notification.success({ message: 'Lineup cleared', duration: 2 })
    } catch {
      notification.error({ message: 'Failed to clear lineup', duration: 3 })
    }
    setClearLoading(false)
  }

  /* ── ClassKeys for bench cards (BQB, K, P) - rendered below the field ── */
  const BENCH_KEYS = ['offense_qb-2', 'special_team_pk', 'special_team_pn']

  // Offense-only leagues: punter is completely hidden (not field, not bench)
  const HIDDEN_KEYS = isOffenseOnly ? ['special_team_pn'] : []

  /* ── Filter data by active type ── */
  const allFilteredData = data?.length > 0
    ? data?.filter((p) => !HIDDEN_KEYS.includes(p.classKey))
    : staticData?.filter((item) => item.type === activeFilter && !HIDDEN_KEYS.includes(item.classKey))

  /* Split into field players and bench players */
  const filteredData = allFilteredData?.filter((p) => !BENCH_KEYS.includes(p.classKey))
  const benchData = activeFilter === 'offense'
    ? allFilteredData?.filter((p) => BENCH_KEYS.includes(p.classKey))
    : []

  if (isLoading && !data?.length) {
    return (
      <>
        <Header />
        <Loader />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className='depth_chart_container'>
        <OnboardingGuide tabKey="depth-chart" />
        <HeadingAndWeek heading='Depth Chart' />

        {/* Viewing another team banner */}
        {teamID && (
          <div className='viewing_roster_heading'>
            <p>Viewing another team&apos;s starters (read-only)</p>
          </div>
        )}

        {/* ── Offense / Defense Toggle + Clear Button ── */}
        <div style={{ padding: '0 20px', maxWidth: 1140, margin: '0 auto' }}>
          <div className='filter_chart_box' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(isOffenseOnly ? ['offense'] : ['offense', 'defense']).map((filter) => (
                <Button
                  key={filter}
                  type='primary'
                  className={activeFilter === filter ? 'active_filter' : ''}
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter}
                </Button>
              ))}
              {isOffenseOnly && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8, alignSelf: 'center' }}>
                  Offense Only League
                </span>
              )}
            </div>
            {!teamID && (
              <Button
                danger
                icon={<ClearOutlined />}
                loading={clearLoading}
                onClick={handleClearLineup}
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: 1,
                  borderRadius: 10,
                }}
              >
                Clear {activeFilter}
              </Button>
            )}
          </div>
        </div>

        {/* ── Formation Picker ── */}
        <div style={{ padding: '0 20px', maxWidth: 1140, margin: '0 auto' }}>
          <div className='dc-formation-picker'>
            <span className='dc-formation-label'>Formation</span>
            <div className='dc-formation-pills'>
              {(activeFilter === 'offense' || isOffenseOnly ? OFFENSE_FORMATIONS : DEFENSE_FORMATIONS).map((f) => (
                <div
                  key={f.value}
                  className={`dc-formation-pill ${selectedFormation === f.value ? 'dc-pill-active' : ''}`}
                  onClick={() => handleFormationChange(f.value)}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Depth Chart Field ── */}
        <div className='depth_chart_wrapper'>
          <div className={`depth_chart_cards ${selectedFormation}`}>
            {/* Pure CSS football field background */}
            <FootballField />

            {/* Player cards rendered on top of the field */}
            {isLoading ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
              }}>
                <Spin size='large' />
              </div>
            ) : (
              filteredData?.map((player, index) => (
                <DepthCard
                  key={player.classKey || index}
                  data={player}
                  index={index}
                  getDepthChartData={getDepthChartData}
                  selectedValue={selectedFormation}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Bench Strip: BQB, K, P (below the field) ── */}
        {activeFilter === 'offense' && benchData?.length > 0 && (
          <div className='bench-strip'>
            <span className='bench-strip-label'>Bench</span>
            <div className='bench-strip-divider' />
            <div className='bench-strip-cards'>
              {benchData.map((player, index) => (
                <DepthCard
                  key={player.classKey || index}
                  data={player}
                  index={index}
                  getDepthChartData={getDepthChartData}
                  selectedValue={selectedFormation}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Roster count info ── */}
        {rosterCount !== null && rosterCount !== undefined && (
          <div style={{
            maxWidth: 1140,
            margin: '20px auto 0',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 10,
              padding: '10px 24px',
              color: '#94A3B8',
              fontSize: 13,
              fontWeight: 600,
            }}>
              Active Roster: <span style={{ color: '#22C55E' }}>{typeof rosterCount === 'object' ? rosterCount?.length || 0 : rosterCount}</span> / {isOffenseOnly ? 30 : 53}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DepthChart
