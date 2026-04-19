import React, { useEffect, useState } from 'react'
import { Spin, Tooltip } from 'antd'

import Header from '../components/Header'

import { GiHockey } from 'react-icons/gi'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTeamFinancials } from '../redux/actions/leagueActions'
import { getUser } from '../redux'

import '../styles/pages/teamFinancials.css'

const TeamFinancials = () => {
  const SETTING = useSelector((state) => state.user)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const leagueSalaryFloor = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryFloor)
  const soccerFinancials = useSelector((state) => state.user?.soccerFinancials)

  const navigate = useNavigate()

  useEffect(() => {
    getData()
    getUser()
  }, [])

  const getData = async () => {
    !isLoading && setIsLoading(true)
    const res = await getTeamFinancials()
    setData(res)
    setIsLoading(false)
  }

  const handleRosterNavigate = (obj) => {
    const myTeam = obj?._id === SETTING?.userDetails?.team?._id
    if (myTeam) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${obj?._id}`, {
        state: { teamName: obj?.name, teamLogo: obj?.logo },
      })
    }
  }

  // Format large numbers: 310,000,000 → $310M
  const formatCap = (val) => {
    if (val == null) return '$0'
    const abs = Math.abs(val)
    const sign = val < 0 ? '-' : ''
    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B SP`
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M SP`
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K SP`
    return `${sign}${abs} SP`
  }

  // Cap status helpers
  const getCapStatus = (teamCap) => {
    if (!teamCap || !myleagueSalaryCap) return { label: '-', color: '#fff', status: 'none' }
    const capLeft = myleagueSalaryCap - teamCap
    if (teamCap < (leagueSalaryFloor || 0)) {
      return { label: 'Below Floor', color: '#FFC300', status: 'floor' }
    }
    if (capLeft >= 0) {
      return { label: 'Within Cap', color: '#22c55e', status: 'within' }
    }
    return { label: 'Over Cap', color: '#ef4444', status: 'over' }
  }

  const getCapBarPercent = (teamCap) => {
    if (!teamCap || !myleagueSalaryCap) return 0
    return Math.min(100, Math.max(0, (teamCap / myleagueSalaryCap) * 100))
  }

  // Sort by team salary cap descending
  const sortedData = [...(data || [])].sort((a, b) => (b.teamSalaryCap || 0) - (a.teamSalaryCap || 0))

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />
      <hr className='divider' />

      <div className='tfn-page'>
        {/* ── Header ── */}
        <div className='tfn-header'>
          <div className='tfn-header-left'>
            <div className='tfn-header-icon'>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='12' y1='1' x2='12' y2='23' />
                <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </div>
            <div>
              <h2 className='tfn-title'>Team Financials</h2>
              {soccerFinancials ? (
                <span className='tfn-subtitle'>
                  League Value Cap: {formatCap(soccerFinancials.leagueValueCap)}
                  {' · '}Salary Cap: {formatCap(soccerFinancials.salaryCap)}
                  {' · '}League Avg: {formatCap(soccerFinancials.leagueSalaryCapAverage)}
                </span>
              ) : (
                <span className='tfn-subtitle'>
                  League Cap: {formatCap(myleagueSalaryCap)}
                  {leagueSalaryFloor ? ` · Floor: ${formatCap(leagueSalaryFloor)}` : ''}
                </span>
              )}
            </div>
          </div>
          {/* Legend */}
          <div className='tfn-legend'>
            <div className='tfn-legend-item'>
              <span className='tfn-legend-dot' style={{ background: '#22c55e' }} />
              <span>Within Cap</span>
            </div>
            <div className='tfn-legend-item'>
              <span className='tfn-legend-dot' style={{ background: '#FFC300' }} />
              <span>Below Floor</span>
            </div>
            <div className='tfn-legend-item'>
              <span className='tfn-legend-dot' style={{ background: '#ef4444' }} />
              <span>Over Cap</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className='tfn-loading'>
            <Spin size='large' />
          </div>
        ) : !sortedData || sortedData.length === 0 ? (
          <div className='tfn-empty'>
            <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.15)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='12' y1='1' x2='12' y2='23' />
              <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
            </svg>
            <p>No financial data available</p>
          </div>
        ) : (
          <div className='tfn-cards-list'>
            {sortedData.map((team, index) => {
              const capLeft = (myleagueSalaryCap || 0) - (team.teamSalaryCap || 0)
              const capStatus = getCapStatus(team.teamSalaryCap)
              const barPercent = getCapBarPercent(team.teamSalaryCap)
              const isMyTeam = team._id === SETTING?.userDetails?.team?._id

              return (
                <div
                  key={team._id || index}
                  className={`tfn-card ${isMyTeam ? 'tfn-card-mine' : ''}`}
                >
                  {/* Left: Rank + Team */}
                  <div className='tfn-card-team'>
                    <span className='tfn-card-rank'>#{index + 1}</span>
                    <div className='tfn-card-logo'>
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} />
                      ) : (
                        <GiHockey size={22} color='rgba(255,255,255,0.3)' />
                      )}
                    </div>
                    <div className='tfn-card-team-info'>
                      <span className='tfn-card-name'>
                        {team.name}
                        {isMyTeam && <span className='tfn-my-badge'>YOU</span>}
                      </span>
                      <span className='tfn-card-owner'>{team?.user?.name?.trim() || team?.user?.userName || '-'}</span>
                    </div>
                  </div>

                  {/* Center: Cap Bar + Values */}
                  <div className='tfn-card-cap'>
                    <div className='tfn-card-cap-values'>
                      <Tooltip title={`${(team.teamSalaryCap || 0).toLocaleString()} SP`}>
                        <div className='tfn-card-cap-item'>
                          <span className='tfn-card-cap-label'>Team Cap</span>
                          <span className='tfn-card-cap-num'>{formatCap(team.teamSalaryCap)}</span>
                        </div>
                      </Tooltip>
                      <Tooltip title={`${capLeft.toLocaleString()} SP`}>
                        <div className='tfn-card-cap-item'>
                          <span className='tfn-card-cap-label'>Cap Left</span>
                          <span className='tfn-card-cap-num' style={{ color: capStatus.color }}>
                            {formatCap(capLeft)}
                          </span>
                        </div>
                      </Tooltip>
                    </div>
                    <div className='tfn-card-bar-track'>
                      <div
                        className='tfn-card-bar-fill'
                        style={{
                          width: `${barPercent}%`,
                          background: capStatus.color,
                        }}
                      />
                      {/* Floor line */}
                      {leagueSalaryFloor && myleagueSalaryCap && (
                        <div
                          className='tfn-card-bar-floor'
                          style={{
                            left: `${Math.min(100, (leagueSalaryFloor / myleagueSalaryCap) * 100)}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Status + Action */}
                  <div className='tfn-card-right'>
                    <span className='tfn-card-status' style={{ color: capStatus.color, borderColor: `${capStatus.color}44`, background: `${capStatus.color}12` }}>
                      {capStatus.label}
                    </span>
                    <span className='tfn-card-roster-link' onClick={() => handleRosterNavigate(team)}>
                      View Roster
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamFinancials
