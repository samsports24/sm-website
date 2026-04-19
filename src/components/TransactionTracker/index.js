import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { BiRightArrowAlt } from 'react-icons/bi'
import {
  FiRepeat, FiUserMinus, FiUserPlus, FiAlertCircle,
  FiArrowRight, FiActivity, FiClock, FiChevronRight, FiMessageSquare
} from 'react-icons/fi'
import { getTopTransactions } from '../../redux'
import { getCommissionerAnnouncements } from '../../redux/actions/notificationAction'
import PlayerDetailsModal from '../modal/PlayerDetailsModal'
import { useSelector } from 'react-redux'

/* ── Helper: build a human-readable sentence for each transaction ── */
const getTransactionInfo = (item, userTeamId) => {
  const mod = item?.module?.toLowerCase()
  const sub = item?.sub_module?.toLowerCase()
  const teamName = item?.team?.name || 'Unknown'
  const playerNames = item?.player?.map((v) => v?.player_id?.Name).filter(Boolean)

  if (mod === 'trade' && sub === 'player traded') {
    return {
      icon: <FiRepeat size={14} />,
      type: 'Trade',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      summary: `${item?.sellerTeam?.name || '?'} traded with ${item?.buyerTeam?.name || '?'}`,
    }
  }
  if (mod === 'squad' && sub === 'move to non-active') {
    return {
      icon: <FiUserMinus size={14} />,
      type: 'Roster',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.1)',
      summary: `${teamName} moved player(s) to non-active`,
    }
  }
  if (mod === 'squad' && sub === 'move to practice squad') {
    return {
      icon: <FiRepeat size={14} />,
      type: 'Roster',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.1)',
      summary: `${teamName} swapped active/practice squad`,
    }
  }
  if (mod === 'squad' && sub === 'removed') {
    return {
      icon: <FiUserMinus size={14} />,
      type: 'Release',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      summary: `${teamName} released player(s)`,
    }
  }
  if (mod === 'squad' && sub === 'moved to injury list') {
    return {
      icon: <FiAlertCircle size={14} />,
      type: 'Injury',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      summary: `${teamName} placed player(s) on injured list`,
    }
  }
  if (mod === 'squad' && sub === 'auction') {
    return {
      icon: <FiActivity size={14} />,
      type: 'Auction',
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.1)',
      summary: `${teamName} listed player(s) for auction`,
    }
  }
  if (mod === 'squad' && sub === 'auction completed') {
    return {
      icon: <FiUserPlus size={14} />,
      type: 'Auction Won',
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      summary: `${teamName} won auction`,
    }
  }
  if (mod === 'squad' && sub === 'poaching') {
    return {
      icon: <FiAlertCircle size={14} />,
      type: 'Poach',
      color: '#eab308',
      bg: 'rgba(234,179,8,0.1)',
      summary: `Player being poached from ${teamName}`,
    }
  }
  if (mod === 'squad' && sub === 'poaching completed') {
    return {
      icon: <FiUserPlus size={14} />,
      type: 'Poach',
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      summary: `${item?.poachingteam?.name || '?'} signed player from ${teamName} via poaching`,
    }
  }
  if (mod === 'squad' && sub === 'player approved from draft') {
    return {
      icon: <FiUserPlus size={14} />,
      type: 'Draft',
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      summary: `${teamName} approved draft pick`,
    }
  }

  // Fallback
  return {
    icon: <FiActivity size={14} />,
    type: item?.module || 'Transaction',
    color: '#a5b4fc',
    bg: 'rgba(165,180,252,0.1)',
    summary: `${teamName} — ${item?.sub_module || 'activity'}`,
  }
}

const PRIORITY_COLORS = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'URGENT' },
  important: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'IMPORTANT' },
  normal: { color: '#d9aa00', bg: 'rgba(217,170,0,0.10)', label: 'COMMISSIONER' },
}

const TransactionTracker = ({ height = '400px' }) => {
  const navigate = useNavigate()
  const [topTransaction, setTopTransaction] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const userDetails = useSelector((state) => state.user.userDetails)

  useEffect(() => {
    ;(async () => {
      const [txData, annData] = await Promise.all([
        getTopTransactions(),
        getCommissionerAnnouncements(),
      ])
      setTopTransaction(txData || [])
      setAnnouncements(annData || [])
    })()
  }, [])

  const buildPlayerModal = (v, index, item) => {
    const isSelf = userDetails?.team?._id === item?.team?._id
    return (
      <PlayerDetailsModal
        key={index}
        button={v?.player_id?.Name}
        state={{
          isFreeAgent: { status: !item?.team },
          isOwnRoster: { status: isSelf },
          isTeamRoster: { status: !isSelf },
          playerID: v?.player_id?.PlayerID,
          teamId: item?.team?._id,
          teamName: item?.team?.name,
          teamLogo: item?.team?.logo,
        }}
        transaction={true}
      />
    )
  }

  return (
    <div className='tt-container'>
      <div className='tt-header'>
        <div className='tt-header-left'>
          <FiActivity size={16} className='tt-header-icon' />
          <h4>Transaction Tracker</h4>
        </div>
        <span className='tt-view-all' onClick={() => navigate('/all-transaction')}>
          View All <FiChevronRight size={14} />
        </span>
      </div>

      <div className='tt-feed' style={{ maxHeight: height }}>
        {/* ═══ Commissioner Announcements — pinned at top ═══ */}
        {announcements.map((ann, i) => {
          const pri = PRIORITY_COLORS[ann.priority] || PRIORITY_COLORS.normal
          return (
            <div key={`ann-${i}`} className='tt-item'>
              <div className='tt-timeline'>
                <div className='tt-dot' style={{ background: pri.color, boxShadow: `0 0 8px ${pri.color}55` }} />
                {(i < announcements.length - 1 || topTransaction.length > 0) && <div className='tt-line' />}
              </div>
              <div className='tt-card tt-card-announcement' style={{ borderLeft: `2px solid ${pri.color}` }}>
                <div className='tt-card-top'>
                  <span className='tt-type-badge' style={{ background: pri.bg, color: pri.color }}>
                    <FiMessageSquare size={12} />
                    {pri.label}
                  </span>
                  <span className='tt-time'>
                    <FiClock size={10} />
                    {moment(ann.createdAt).fromNow()}
                  </span>
                </div>
                {ann.title && <p className='tt-ann-title'>{ann.title}</p>}
                <p className='tt-summary'>{ann.message}</p>
                <span className='tt-ann-author'>— {ann.author?.name || 'Commissioner'}</span>
              </div>
            </div>
          )
        })}

        {(!topTransaction || topTransaction.length === 0) && announcements.length === 0 && (
          <div className='tt-empty'>
            <FiActivity size={28} />
            <p>No recent transactions</p>
          </div>
        )}

        {topTransaction.map((item, i) => {
          const info = getTransactionInfo(item, userDetails?.team?._id)
          const players = item?.player || []

          return (
            <div key={i} className='tt-item'>
              {/* Timeline dot */}
              <div className='tt-timeline'>
                <div className='tt-dot' style={{ background: info.color }} />
                {i < topTransaction.length - 1 && <div className='tt-line' />}
              </div>

              {/* Card content */}
              <div className='tt-card'>
                <div className='tt-card-top'>
                  <span className='tt-type-badge' style={{ background: info.bg, color: info.color }}>
                    {info.icon}
                    {info.type}
                  </span>
                  <span className='tt-time'>
                    <FiClock size={10} />
                    {moment(item?.createdAt).fromNow()}
                  </span>
                </div>

                <p className='tt-summary'>{info.summary}</p>

                {/* Player names as clickable chips */}
                {players.length > 0 && (
                  <div className='tt-players'>
                    {players.map((v, idx) => (
                      <span key={idx} className='tt-player-chip'>
                        {buildPlayerModal(v, idx, item)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TransactionTracker
