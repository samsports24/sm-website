import React from 'react'
import userImg from '../../assets/account.svg'
import { FiShield, FiZap } from 'react-icons/fi'
import PlayerAvatar from '../PlayerAvatar'
import './topPlayersBox.css'

/* ═══ Position groups for each formation slot ═══ */
const OFFENSE_SLOTS = [
  { label: 'QB', positions: ['QB'], count: 1 },
  { label: 'RB', positions: ['RB', 'FB'], count: 1 },
  { label: 'WR', positions: ['WR'], count: 2 },
  { label: 'TE', positions: ['TE'], count: 1 },
  { label: 'OL', positions: ['OL', 'OT', 'OG', 'G', 'C', 'T', 'LT', 'RT', 'LG', 'RG', 'IOL', 'OC'], count: 6 },
]

const DEFENSE_SLOTS = [
  { label: 'EDGE', positions: ['DE', 'DL', 'LE', 'RE', 'EDGE'], count: 2 },
  { label: 'IDL', positions: ['DT', 'NT', 'IDL'], count: 2 },
  { label: 'LB', positions: ['LB', 'OLB', 'ILB', 'MLB', 'LOLB', 'ROLB'], count: 3 },
  { label: 'CB', positions: ['CB', 'SCB', 'NCB'], count: 2 },
  { label: 'S', positions: ['S', 'SS', 'FS', 'DB'], count: 2 },
]

/* ═══ Formation row layouts ═══ */
const OFFENSE_ROWS = [
  { labels: ['WR', 'WR'], type: 'wide' },
  { labels: ['TE'], type: 'offset-left' },
  { labels: ['QB'], type: 'center' },
  { labels: ['RB'], type: 'center' },
  { labels: ['OL', 'OL', 'OL', 'OL', 'OL', 'OL'], type: 'line' },
]

const DEFENSE_ROWS = [
  { labels: ['CB', 'S', 'S', 'CB'], type: 'secondary' },
  { labels: ['LB', 'LB', 'LB'], type: 'center' },
  { labels: ['EDGE', 'IDL', 'IDL', 'EDGE'], type: 'line' },
]

/**
 * Build the starting 11 from playerRanks for either offense or defense.
 */
function buildStarting11(playerRanks, side) {
  const slots = side === 'offense' ? OFFENSE_SLOTS : DEFENSE_SLOTS
  const allPlayers = playerRanks || []
  const usedIds = new Set()
  const starters = {}

  for (const slot of slots) {
    const available = allPlayers.filter((v) => {
      const pos = v?.players?.Position || ''
      const pid = v?.players?.PlayerID || v?.players?._id
      return slot.positions.includes(pos) && !usedIds.has(pid)
    })
    for (let i = 0; i < slot.count; i++) {
      const player = available[i]
      const key = `${slot.label}_${i}`
      if (player) {
        usedIds.add(player?.players?.PlayerID || player?.players?._id)
        starters[key] = player
      } else {
        starters[key] = null
      }
    }
  }
  return starters
}

/* ═══ Player Node — the circular avatar on the field ═══ */
const PlayerNode = ({ player, label, teams, isOffense, compact }) => {
  const isEmpty = !player
  const p = player?.players
  const team = teams?.find((x) => player?.teamId === x?._id)
  const score = p?.playerScore
  const accentVar = isOffense ? 'var(--off-accent)' : 'var(--def-accent)'

  return (
    <div className={`pn ${isEmpty ? 'pn--empty' : ''} ${compact ? 'pn--compact' : ''}`}>
      {/* Position tag */}
      <span className={`pn-pos ${isOffense ? 'pn-pos--off' : 'pn-pos--def'}`}>{label}</span>

      {/* Avatar ring */}
      <div className='pn-ring' style={{ '--accent': accentVar }}>
        {isEmpty ? (
          <div className='pn-ring-empty' />
        ) : (
          <PlayerAvatar
            className='pn-img'
            name={`${p?.FirstName || ''}${p?.LastName ? ' ' + p.LastName : ''}`}
            src={p?.HostedHeadshotNoBackgroundUrl}
            size={40}
          />
        )}
      </div>

      {/* Name + score (hidden on compact/line rows) */}
      {!compact && !isEmpty && (
        <div className='pn-meta'>
          <span className='pn-name'>{p?.FirstName?.[0]}. {p?.LastName}</span>
          <span className='pn-score'>
            {score != null ? (typeof score === 'number' ? score.toFixed(1) : score) : '—'}
          </span>
        </div>
      )}
      {compact && !isEmpty && (
        <span className='pn-score pn-score--compact'>
          {score != null ? (typeof score === 'number' ? score.toFixed(1) : score) : ''}
        </span>
      )}
    </div>
  )
}

/* ═══ Main Component ═══ */
const TopPlayersBox = ({ data, side = 'offense' }) => {
  const isOffense = side === 'offense'
  const icon = isOffense ? <FiZap size={14} /> : <FiShield size={14} />
  const title = isOffense ? 'Starting Offense' : 'Starting Defense'
  const subtitle = isOffense ? '1 QB · 1 RB · 2 WR · 1 TE · 6 OL' : '4-3 · 2 EDGE · 2 IDL · 3 LB · 2 CB · 2 S'
  const accentClass = isOffense ? 'tpb-offense' : 'tpb-defense'
  const rows = isOffense ? OFFENSE_ROWS : DEFENSE_ROWS

  const positions = isOffense
    ? OFFENSE_SLOTS.flatMap((s) => s.positions)
    : DEFENSE_SLOTS.flatMap((s) => s.positions)

  const filteredRanks = (data?.playerRanks || []).filter((v) =>
    positions.includes(v?.players?.Position || '')
  )

  const starters = buildStarting11(filteredRanks, side)
  const slotCounters = {}

  return (
    <div className={`tpb ${accentClass}`}>
      {/* ── Header ── */}
      <div className='tpb-hdr'>
        <div className='tpb-hdr-left'>
          <span className='tpb-hdr-icon'>{icon}</span>
          <div>
            <h4 className='tpb-hdr-title'>{title}</h4>
            <span className='tpb-hdr-sub'>{subtitle}</span>
          </div>
        </div>
        <span className='tpb-hdr-badge'>STARTING 11</span>
      </div>

      {/* ── Field ── */}
      <div className='tpb-field'>
        {/* Yard lines */}
        <div className='tpb-yard tpb-yard--1' />
        <div className='tpb-yard tpb-yard--2' />
        <div className='tpb-yard tpb-yard--3' />
        <div className='tpb-yard tpb-yard--4' />

        {/* Hash marks */}
        <div className='tpb-hash tpb-hash--l' />
        <div className='tpb-hash tpb-hash--r' />

        {/* Formation rows */}
        {rows.map((row, ri) => {
          const isLine = row.type === 'line'
          return (
            <div key={ri} className={`tpb-row tpb-row--${row.type}`}>
              {row.labels.map((label, ci) => {
                if (!slotCounters[label]) slotCounters[label] = 0
                const idx = slotCounters[label]++
                const key = `${label}_${idx}`
                return (
                  <PlayerNode
                    key={key}
                    player={starters[key]}
                    label={label}
                    teams={data?.teams}
                    isOffense={isOffense}
                    compact={isLine}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopPlayersBox
