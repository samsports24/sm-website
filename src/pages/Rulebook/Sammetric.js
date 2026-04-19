import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   POSITION DATA, with theme-consistent colors
   ═══════════════════════════════════════════════════════════ */
const POSITIONS = [
  { name: 'QUARTER BACK', position: 'QB', color: '#F59E0B', group: 'Offense' },
  { name: 'RUNNING BACK', position: 'RB', color: '#F59E0B', group: 'Offense' },
  { name: 'WIDE RECEIVER', position: 'WR', color: '#22C55E', group: 'Offense' },
  { name: 'TIGHT END', position: 'TE', color: '#22C55E', group: 'Offense' },
  { name: 'OFFENSIVE LINEMAN', position: 'OL', color: '#A78BFA', group: 'Offense' },
  { name: 'PUNTER', position: 'ST', color: '#3B82F6', group: 'Special Teams' },
  { name: 'KICKER', position: 'ST', color: '#3B82F6', group: 'Special Teams' },
  { name: 'INTERIOR D-LINEMAN', position: 'DT', color: '#EF4444', group: 'Defense' },
  { name: 'EDGE RUSHER', position: 'DE', color: '#EF4444', group: 'Defense' },
  { name: 'LINEBACKER', position: 'LB', color: '#06B6D4', group: 'Defense' },
  { name: 'CORNER BACK', position: 'CB', color: '#EC4899', group: 'Defense' },
  { name: 'SAFETIES', position: 'S', color: '#06B6D4', group: 'Defense' },
]

/* ═══════════════════════════════════════════════════════════
   POSITION CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const PositionCard = ({ player, onClick }) => (
  <div className='sm-pos-card' onClick={onClick} style={{ '--pos-color': player.color }}>
    <div className='sm-pos-card-accent' />
    <div className='sm-pos-card-body'>
      <div className='sm-pos-tag' style={{ color: player.color, background: `${player.color}18` }}>
        {player.position}
      </div>
      <div className='sm-pos-name'>{player.name}</div>
      <div className='sm-pos-sub'>SCORING BREAKDOWN</div>
    </div>
    <div className='sm-pos-arrow'>
      <RightOutlined />
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const SammetricBreakdown = () => {
  const navigate = useNavigate()

  const handlePlayerClick = (playerName, playerPosition, playerColor) => {
    navigate('/rule-book/samposition', { state: { playerName, playerPosition, playerColor } })
  }

  // Group positions
  const offense = POSITIONS.filter((p) => p.group === 'Offense')
  const defense = POSITIONS.filter((p) => p.group === 'Defense')
  const special = POSITIONS.filter((p) => p.group === 'Special Teams')

  return (
    <div className='rb-page sm-page'>
      {/* ── Page Header ── */}
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>SAM METRIC <span>SCORING</span></h1>
            <span className='rb-page-subtitle'>POSITION BREAKDOWN</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      {/* ── Intro Card ── */}
      <div className='sm-intro'>
        <ThunderboltOutlined className='sm-intro-icon' />
        <div className='sm-intro-text'>
          <div className='sm-intro-title'>What is the SAM Metric?</div>
          <div className='sm-intro-desc'>
            The SAM Metric is a groundbreaking scoring system designed to replicate real-world dynamics and
            accurately reflect player values across all sports. Based on the Franchise Tag scale and average
            yearly contracts for each position, this metric ensures the highest-paid positions and players
            achieve the highest points per game averages. It evolves annually with NFL franchise tag updates.
          </div>
        </div>
      </div>

      {/* ── Franchise Tag Link ── */}
      <div className='sm-franchise-link' onClick={() => navigate('/rule-book/franchisetag')}>
        <div className='sm-franchise-link-inner'>
          <div>
            <div className='sm-franchise-link-title'>2026 Franchise Tag Breakdown</div>
            <div className='sm-franchise-link-sub'>View how franchise tag values determine scoring weights</div>
          </div>
          <RightOutlined style={{ color: '#F59E0B', fontSize: 16 }} />
        </div>
      </div>

      {/* ── Offense Positions ── */}
      <div className='sm-group'>
        <div className='sm-group-label'>
          <span className='sm-group-dot' style={{ background: '#F59E0B' }} />
          OFFENSE
        </div>
        <div className='sm-positions-grid'>
          {offense.map((p) => (
            <PositionCard key={p.name} player={p} onClick={() => handlePlayerClick(p.name, p.position, p.color)} />
          ))}
        </div>
      </div>

      {/* ── Defense Positions ── */}
      <div className='sm-group'>
        <div className='sm-group-label'>
          <span className='sm-group-dot' style={{ background: '#EF4444' }} />
          DEFENSE
        </div>
        <div className='sm-positions-grid'>
          {defense.map((p) => (
            <PositionCard key={p.name} player={p} onClick={() => handlePlayerClick(p.name, p.position, p.color)} />
          ))}
        </div>
      </div>

      {/* ── Special Teams ── */}
      <div className='sm-group'>
        <div className='sm-group-label'>
          <span className='sm-group-dot' style={{ background: '#3B82F6' }} />
          SPECIAL TEAMS
        </div>
        <div className='sm-positions-grid'>
          {special.map((p) => (
            <PositionCard key={p.name} player={p} onClick={() => handlePlayerClick(p.name, p.position, p.color)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SammetricBreakdown
