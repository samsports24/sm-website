import React, { useEffect, useState } from 'react'

import { Button, notification, Tooltip } from 'antd'
import {
  SafetyCertificateFilled,
  PauseCircleOutlined,
  TeamOutlined,
  LockOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
} from '@ant-design/icons'

// Component
import Header from '../components/Header'
import Loader from '../components/Loader'
import Empty from '../components/Empty'
import NewRosterCard from '../components/NewRosterCard'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'
import OnboardingGuide from '../components/OnboardingGuide'

import { useSelector } from 'react-redux'
import { isLocked } from '../config/constants'
import { getRoster, setNonActivePlayer, setProtectedPlayer, moveToPractice, moveFromPractice, moveToIr } from '../redux/actions/rosterAction'
import { sortedArray } from '../config/helperFunctions'

import '../styles/pages/playerRoster.css'

const MAX_ACTIVE_ROSTER = 53
const MAX_PRACTICE_SQUAD = 16

const PlayerRoster = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const { isLoading, data } = useSelector((state) => state?.roster)
  const [nonActive, setNonActive] = useState([])
  const [protectedCheck, setProtectedCheck] = useState([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    nonActive: true,
    practice: true,
    protected: true,
  })

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
      await setNonActivePlayer(
        { ids: nonActive },
        SETTING.week,
      )
      setSubmitLoading(false)
    } else {
      notification.error({
        message: `Select at least 7 Players (${nonActive?.length}/7)`,
        duration: 3,
      })
    }
  }

  const handleProtectedCheckbox = (event, id) => {
    if (event) {
      setProtectedCheck([...protectedCheck, id])
    } else {
      const temp = [...protectedCheck]
      let keyInd = temp?.indexOf(id)
      if (keyInd !== -1) {
        temp.splice(keyInd, 1)
        setProtectedCheck(temp)
      }
    }
  }

  const handleProtectedSubmit = async () => {
    if (protectedCheck?.length === 4) {
      setSubmitLoading(true)
      await setProtectedPlayer(
        { ids: protectedCheck },
        SETTING.week,
      )
      setSubmitLoading(false)
    } else {
      notification.error({
        message: `Select at least 4 Players (${protectedCheck?.length}/4)`,
        duration: 3,
      })
    }
  }

  const handleMoveToPractice = async (playerId) => {
    const practiceCount = (data?.filterPracticeRoster?.length || 0) + (data?.filterProtectedRoster?.length || 0)
    if (practiceCount >= MAX_PRACTICE_SQUAD) {
      notification.error({
        message: 'Practice Squad Full',
        description: `Practice squad is at full capacity (${MAX_PRACTICE_SQUAD}). Move another player to active roster first.`,
        duration: 5,
      })
      return
    }
    setMoveLoading(true)
    await moveToPractice({ id: playerId, week: SETTING?.week })
    setMoveLoading(false)
  }

  const handleMoveToActive = async (playerId) => {
    const activeCount = (data?.filterActiveRoster?.length || 0) + (data?.filterNonActiveRoster?.length || 0)
    if (activeCount >= MAX_ACTIVE_ROSTER) {
      notification.error({
        message: 'Active Roster Full',
        description: `Active roster is at full capacity (${MAX_ACTIVE_ROSTER}). Move another player to practice squad first.`,
        duration: 5,
      })
      return
    }
    setMoveLoading(true)
    await moveFromPractice({ id: playerId, week: SETTING?.week })
    setMoveLoading(false)
  }

  const handleMoveToIR = async (playerId) => {
    setMoveLoading(true)
    await moveToIr({ id: playerId, week: SETTING?.week })
    setMoveLoading(false)
  }

  useEffect(() => {
    SETTING?.week !== 0 && getData()
  }, [SETTING?.week, currentLeagueId])

  useEffect(() => {
    setNonActive(data?.nonActivePlayer)
    setProtectedCheck(data?.protectedPlayer)
  }, [data])

  const getData = async () => {
    await getRoster(SETTING?.week)
  }

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const SECTIONS = [
    {
      key: 'active',
      title: 'Active Squad Management',
      badge: 'ROSTER',
      badgeClass: 'sqd-badge--green',
      icon: <SafetyCertificateFilled />,
      data: data?.filterActiveRoster || [],
      onSubmit: handleSubmit,
      handleCheck: handleNonActive,
      checkIds: nonActive,
      isSubmittable: true,
      checkLabel: 'Non-Active',
      infoText: 'Select 7 non-active players each week',
      requiredCount: 7,
      currentCount: nonActive?.length || 0,
      onMovePlayer: handleMoveToPractice,
      moveDirection: 'down',
      onMoveToIR: handleMoveToIR,
    },
    {
      key: 'nonActive',
      title: 'Non-Active Players',
      badge: 'BENCH',
      badgeClass: 'sqd-badge--amber',
      icon: <PauseCircleOutlined />,
      data: data?.filterNonActiveRoster || [],
      onSubmit: null,
      handleCheck: handleNonActive,
      checkIds: nonActive,
      isSubmittable: false,
      checkLabel: 'Non-Active',
      infoText: null,
      onMovePlayer: handleMoveToPractice,
      moveDirection: 'down',
      onMoveToIR: handleMoveToIR,
    },
    {
      key: 'practice',
      title: 'Practice Squad',
      badge: 'PRACTICE',
      badgeClass: 'sqd-badge--blue',
      icon: <TeamOutlined />,
      data: data?.filterPracticeRoster || [],
      onSubmit: handleProtectedSubmit,
      handleCheck: handleProtectedCheckbox,
      checkIds: protectedCheck,
      isSubmittable: true,
      checkLabel: 'Protected',
      infoText: 'Select 4 players to protect from poaching',
      requiredCount: 4,
      currentCount: protectedCheck?.length || 0,
      onMovePlayer: handleMoveToActive,
      moveDirection: 'up',
    },
    {
      key: 'protected',
      title: 'Protected Players',
      badge: 'LOCKED',
      badgeClass: 'sqd-badge--purple',
      icon: <LockOutlined />,
      data: data?.filterProtectedRoster || [],
      onSubmit: null,
      handleCheck: handleProtectedCheckbox,
      checkIds: protectedCheck,
      isSubmittable: false,
      checkLabel: 'Protected',
      infoText: null,
    },
  ]

  return (
    <div className='player_roster_container'>
      <Header />
      <OnboardingGuide tabKey="roster" />
      <HeadingAndWeek />
      <hr className='divider' />

      {isLoading ? (
        <Loader />
      ) : (
        <div className='sqd-page'>
          {/* Page title bar */}
          <div className='sqd-page-header'>
            <div className='sqd-page-title-group'>
              <ThunderboltFilled className='sqd-page-icon' />
              <div>
                <h1 className='sqd-page-title'>Squad Management</h1>
                <p className='sqd-page-subtitle'>Manage your active roster, bench, and practice squad</p>
              </div>
            </div>
            <div className='sqd-page-week'>
              Week {SETTING?.week || '-'}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className='sqd-stats-bar'>
            <div className='sqd-stat'>
              <span className='sqd-stat-num'>{data?.filterActiveRoster?.length || 0}</span>
              <span className='sqd-stat-label'>Active</span>
            </div>
            <div className='sqd-stat-divider' />
            <div className='sqd-stat'>
              <span className='sqd-stat-num sqd-stat-num--amber'>{data?.filterNonActiveRoster?.length || 0}</span>
              <span className='sqd-stat-label'>Bench</span>
            </div>
            <div className='sqd-stat-divider' />
            <div className='sqd-stat'>
              <span className='sqd-stat-num sqd-stat-num--blue'>{data?.filterPracticeRoster?.length || 0}</span>
              <span className='sqd-stat-label'>Practice</span>
            </div>
            <div className='sqd-stat-divider' />
            <div className='sqd-stat'>
              <span className='sqd-stat-num sqd-stat-num--purple'>{data?.filterProtectedRoster?.length || 0}</span>
              <span className='sqd-stat-label'>Protected</span>
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((section) => {
            const isEmpty = (section.data?.length || 0) === 0
            const isExpanded = expandedSections[section.key]

            return (
              <div className={`sqd-section ${isExpanded ? 'sqd-section--open' : ''}`} key={section.key}>
                {/* Section Header */}
                <div className='sqd-section-hd' onClick={() => toggleSection(section.key)}>
                  <div className='sqd-section-left'>
                    <span className={`sqd-badge ${section.badgeClass}`}>{section.badge}</span>
                    <h2 className='sqd-section-title'>{section.title}</h2>
                    <span className='sqd-section-count'>{section.data?.length || 0}</span>
                  </div>
                  <div className='sqd-section-right'>
                    {section.isSubmittable && section.requiredCount && (
                      <div className='sqd-selection-tracker'>
                        <span className={`sqd-tracker-num ${section.currentCount === section.requiredCount ? 'sqd-tracker-num--done' : ''}`}>
                          {section.currentCount}/{section.requiredCount}
                        </span>
                        {section.currentCount === section.requiredCount && <CheckCircleFilled className='sqd-tracker-check' />}
                      </div>
                    )}
                    <span className={`sqd-chevron ${isExpanded ? 'sqd-chevron--open' : ''}`}>›</span>
                  </div>
                </div>

                {/* Table */}
                {isExpanded && (
                  <div className='sqd-section-body'>
                    {!isEmpty ? (
                      <>
                        {/* Table header */}
                        <div className='sqd-table-hd'>
                          <span className='sqd-th sqd-th-rank'>#</span>
                          <span className='sqd-th sqd-th-player'>PLAYER</span>
                          <span className='sqd-th sqd-th-pos'>POS</span>
                          <span className='sqd-th sqd-th-sametric'>SAM METRIC</span>
                          <span className='sqd-th sqd-th-stats'>TPF</span>
                          <span className='sqd-th sqd-th-stats'>PPG</span>
                          <span className='sqd-th sqd-th-cap'>VALUE</span>
                          {section.onMovePlayer && <span className='sqd-th sqd-th-move'>MOVE</span>}
                          <span className='sqd-th sqd-th-check'>{section.checkLabel?.toUpperCase()}</span>
                        </div>

                        {/* Player rows */}
                        <div className='sqd-table-body'>
                          {sortedArray(section.data)?.map((v, i) => (
                            <NewRosterCard
                              key={i}
                              data={v}
                              index={i}
                              state={{
                                isOwnRoster: { status: true },
                              }}
                              checkBoxIds={section.checkIds}
                              handleClick={section.handleCheck}
                              playerCaps={data?.playerCaps}
                              averagePf={data?.averagePf}
                              currentYearSalaryCap={data?.currentyearsalarycap}
                              isPractice={section.key === 'practice' || section.key === 'protected'}
                              onMovePlayer={section.onMovePlayer}
                              moveDirection={section.moveDirection}
                              moveLoading={moveLoading}
                              onMoveToIR={section.onMoveToIR}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className='sqd-empty'>
                        <span className='sqd-empty-icon'>{section.icon}</span>
                        <span>{section.title} is empty</span>
                      </div>
                    )}

                    {/* Footer bar */}
                    {section.isSubmittable && !isEmpty && (
                      <div className='sqd-section-footer'>
                        <div className='sqd-footer-info'>
                          <InfoCircleOutlined />
                          <span>{section.infoText}</span>
                        </div>
                        {!isLocked() && (
                          <Button
                            loading={submitLoading}
                            onClick={(e) => { e.stopPropagation(); section.onSubmit() }}
                            className='sqd-submit-btn'
                          >
                            SUBMIT
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PlayerRoster
