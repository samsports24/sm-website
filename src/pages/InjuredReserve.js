import React, { useEffect, useState } from 'react'
import { Spin, Empty, Tooltip } from 'antd'

import Header from '../components/Header'
import MoveToRoster from '../components/modal/PlayerInterfaceModals/MoveToRoster'

import { getAllIr } from '../redux/actions/rosterAction'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { getPf, getRankAndPosition } from '../config/helperFunctions'
import { positions } from '../config/constants'

import '../styles/pages/injuredReserve.css'

const InjuredReserve = () => {
  const [injuredReserve, setInjuredReserve] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  function mapPosition(position) {
    return positions[position] || position
  }

  const getData = async () => {
    setLoading(true)
    const res = await getAllIr()
    if (res) {
      setInjuredReserve(res)
    }
    setLoading(false)
  }

  const getPositionColor = (pos) => {
    const mapped = mapPosition(pos)
    const colors = {
      QB: '#e74c3c',
      RB: '#2ecc71',
      WR: '#22C55E',
      TE: '#f39c12',
      K: '#9b59b6',
      DEF: '#1abc9c',
      OL: '#e67e22',
      DL: '#e74c3c',
      LB: '#3498db',
      DB: '#2ecc71',
    }
    return colors[mapped] || '#22C55E'
  }

  const getDaysRemaining = (activeDate) => {
    if (!activeDate) return null
    const diff = Math.ceil((new Date(activeDate) - new Date()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const irData = injuredReserve?.data || []
  const totalIr = irData.length

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />
      <hr className='divider' />

      <div className='ir-page'>
        {/* ── Header ── */}
        <div className='ir-header'>
          <div className='ir-header-left'>
            <div className='ir-header-icon'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#ff6b6b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </div>
            <div>
              <h2 className='ir-title'>Injured Reserve</h2>
              <span className='ir-subtitle'>{totalIr} player{totalIr !== 1 ? 's' : ''} on IR</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className='ir-loading'>
            <Spin size='large' />
          </div>
        ) : irData.length === 0 ? (
          <div className='ir-empty'>
            <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.15)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
            </svg>
            <p>No players on Injured Reserve</p>
            <span>Players placed on IR will appear here</span>
          </div>
        ) : (
          <div className='ir-cards-grid'>
            {irData.map((item, index) => {
              const player = item?.player
              const pos = mapPosition(player?.Position)
              const posColor = getPositionColor(player?.Position)
              const cap = injuredReserve?.playerCaps?.[player?.PlayerID]
              const pfData = getPf(injuredReserve?.averagePf?.[player?.PlayerID])
              const rankData = getRankAndPosition(injuredReserve?.averagePf?.[player?.PlayerID])
              const daysLeft = getDaysRemaining(item?.activeDate)

              return (
                <div key={item?._id || index} className='ir-card'>
                  {/* Status bar */}
                  <div className='ir-card-status-bar' style={{ background: daysLeft > 0 ? '#ef4444' : '#22c55e' }} />

                  <div className='ir-card-body'>
                    {/* Top row: Avatar + Info + Action */}
                    <div className='ir-card-top'>
                      <div className='ir-card-player'>
                        <div className='ir-card-avatar'>
                          {player?.HostedHeadshotNoBackgroundUrl ? (
                            <img src={player.HostedHeadshotNoBackgroundUrl} alt={player?.Name} />
                          ) : (
                            <GiAmericanFootballPlayer size={32} color='rgba(255,255,255,0.3)' />
                          )}
                        </div>
                        <div className='ir-card-info'>
                          <h3 className='ir-card-name'>{player?.Name || 'Unknown'}</h3>
                          <div className='ir-card-meta'>
                            <span className='ir-card-pos-badge' style={{ background: `${posColor}22`, color: posColor, borderColor: `${posColor}44` }}>
                              {pos || '-'}
                            </span>
                            <span className='ir-card-team'>{player?.Team || '-'}</span>
                            <span className='ir-card-age'>Age {player?.Age || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div className='ir-card-action'>
                        <MoveToRoster
                          activeDate={item?.activeDate}
                          injuredDate={item?.injuredDate}
                          playerId={item?.PlayerID}
                          injuredId={item?._id}
                          getData={getData}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className='ir-card-stats'>
                      <div className='ir-card-stat'>
                        <span className='ir-card-stat-label'>Value</span>
                        <span className='ir-card-stat-value'>{cap ? `${cap.toLocaleString()} SP` : '-'}</span>
                      </div>
                      <div className='ir-card-stat-divider' />
                      <div className='ir-card-stat'>
                        <span className='ir-card-stat-label'>PF</span>
                        <span className='ir-card-stat-value'>{pfData?.tpf || '-'}</span>
                      </div>
                      <div className='ir-card-stat-divider' />
                      <div className='ir-card-stat'>
                        <span className='ir-card-stat-label'>Rank</span>
                        <span className='ir-card-stat-value'>{rankData?.playerOverallRank || '-'}</span>
                      </div>
                      <div className='ir-card-stat-divider' />
                      <div className='ir-card-stat'>
                        <span className='ir-card-stat-label'>OPP</span>
                        <span className='ir-card-stat-value'>{player?.UpcomingGameOpponent || '-'}</span>
                      </div>
                      <div className='ir-card-stat-divider' />
                      <div className='ir-card-stat'>
                        <span className='ir-card-stat-label'>BYE</span>
                        <span className='ir-card-stat-value'>{player?.ByeWeek || '-'}</span>
                      </div>
                    </div>

                    {/* Return timer */}
                    {daysLeft !== null && daysLeft > 0 && (
                      <div className='ir-card-return'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                          <circle cx='12' cy='12' r='10' />
                          <polyline points='12 6 12 12 16 14' />
                        </svg>
                        <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} until eligible</span>
                      </div>
                    )}
                    {daysLeft !== null && daysLeft === 0 && (
                      <div className='ir-card-return ir-card-return-ready'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                          <polyline points='22 4 12 14.01 9 11.01' />
                        </svg>
                        <span>Eligible to return</span>
                      </div>
                    )}
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

export default InjuredReserve
