import { Checkbox, Tooltip } from 'antd'
import React from 'react'
import { isLocked, positions } from '../../config/constants'
import { MdLock } from 'react-icons/md'
import { ArrowDownOutlined, ArrowUpOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import PlayerDetailsModal from '../modal/PlayerDetailsModal'
import { useParams } from 'react-router-dom'
import { getPf, getPositionColor, getRankAndPosition } from '../../config/helperFunctions'

const NewRosterCard = (props) => {
  const {
    data,
    index,
    checkBoxIds,
    state,
    handleClick,
    isPractice = false,
    currentYearSalaryCap,
    checkBox = true,
    averagePf,
    onMovePlayer,
    moveDirection,
    moveLoading,
    onMoveToIR,
  } = props

  const {
    players: {
      PlayerID,
      Name,
      Age,
      Team,
      ByeWeek,
      Position,
      UpcomingGameOpponent,
      isPlayerLocked,
      FantasyPosition,
    },
    playerDetails: { InjuryStatus },
    team,
  } = data

  const { id } = useParams()

  function mapPosition(position) {
    return positions[position] || position
  }

  const posColor = getPositionColor(FantasyPosition === 'OL' ? 'OL' : Position)
  const tpf = averagePf[PlayerID] ? getPf(averagePf[PlayerID])?.tpf : '0.00'
  const ppg = averagePf[PlayerID]
    ? getPf(averagePf[PlayerID].filter((item) => item.season === 2024))?.apf || '0.00'
    : '0.00'
  const pRank = getRankAndPosition(averagePf[PlayerID])?.playerOverallRank || 'N/A'
  const capHit = currentYearSalaryCap[PlayerID]
    ? `${currentYearSalaryCap[PlayerID]?.toLocaleString()} SP`
    : '-'

  // SAMetric = PPG as the primary score displayed
  const sametricScore = ppg

  const injuryTag =
    InjuryStatus === 'Out' ? { text: 'OUT', cls: 'rc-inj-out' }
    : InjuryStatus === 'Questionable' ? { text: 'Q', cls: 'rc-inj-q' }
    : InjuryStatus === 'Doubtful' ? { text: 'D', cls: 'rc-inj-d' }
    : InjuryStatus === 'Suspended' ? { text: 'SSPD', cls: 'rc-inj-sspd' }
    : InjuryStatus === 'Injured Reserve' ? { text: 'IR', cls: 'rc-inj-ir' }
    : null

  const isChecked = checkBoxIds?.includes(PlayerID)

  return (
    <div className={`rc-row ${isChecked ? 'rc-row--selected' : ''}`}>
      {/* Rank */}
      <div className="rc-cell rc-cell-rank">{index + 1}</div>

      {/* Player Name + Team + Injury */}
      <div className="rc-cell rc-cell-player">
        <div className="rc-player-main">
          <PlayerDetailsModal
            button={Name}
            state={{
              ...state,
              playerID: PlayerID,
              teamId: id ? id : null,
              teamName: team?.name ? team?.name : '',
              teamLogo: team?.logo ? team?.logo : null,
            }}
          />
          {isPlayerLocked && <MdLock size={12} className="rc-lock" />}
          {injuryTag && <span className={`rc-inj ${injuryTag.cls}`}>{injuryTag.text}</span>}
        </div>
        <div className="rc-player-meta">
          <span className="rc-team-abbr">{Team}</span>
          <span className="rc-meta-sep">·</span>
          <span>Age {Age || '-'}</span>
          <span className="rc-meta-sep">·</span>
          <span>Bye {ByeWeek || '-'}</span>
          {UpcomingGameOpponent && (
            <>
              <span className="rc-meta-sep">·</span>
              <span>vs {UpcomingGameOpponent}</span>
            </>
          )}
        </div>
      </div>

      {/* Position Badge */}
      <div className="rc-cell rc-cell-pos">
        <span className="rc-pos-badge" style={{ color: posColor, borderColor: `${posColor}40`, background: `${posColor}12` }}>
          {mapPosition(Position)}
        </span>
      </div>

      {/* SAMetric Score */}
      <div className="rc-cell rc-cell-sametric">
        <span className="rc-sametric-val">{sametricScore}</span>
      </div>

      {/* TPF */}
      <div className="rc-cell rc-cell-stat">
        <span className="rc-stat-val">{tpf}</span>
      </div>

      {/* PPG */}
      <div className="rc-cell rc-cell-stat">
        <span className="rc-stat-val">{ppg}</span>
      </div>

      {/* Cap Hit */}
      <div className="rc-cell rc-cell-cap">
        <span className="rc-cap-val">{capHit}</span>
      </div>

      {/* Move Button */}
      {onMovePlayer && !isLocked() && (
        <div className="rc-cell rc-cell-move" style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={moveDirection === 'down' ? 'Move to Practice Squad' : 'Move to Active Roster'}>
            <button
              className={`rc-move-btn ${moveDirection === 'down' ? 'rc-move-btn--down' : 'rc-move-btn--up'}`}
              onClick={(e) => { e.stopPropagation(); onMovePlayer(PlayerID) }}
              disabled={moveLoading}
            >
              {moveDirection === 'down' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              <span>{moveDirection === 'down' ? 'PS' : 'Active'}</span>
            </button>
          </Tooltip>
          {onMoveToIR && InjuryStatus === 'Injured Reserve' && (
            <Tooltip title="Move to Injured Reserve">
              <button
                className="rc-move-btn rc-move-btn--ir"
                onClick={(e) => { e.stopPropagation(); onMoveToIR(PlayerID) }}
                disabled={moveLoading}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#ef4444',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <MedicineBoxOutlined />
                <span>IR</span>
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {/* Checkbox */}
      {checkBox && (
        <div className="rc-cell rc-cell-check">
          <Checkbox
            onChange={(event) => handleClick(event.target.checked, PlayerID)}
            checked={isChecked}
            disabled={isLocked() || isPlayerLocked}
          />
        </div>
      )}
    </div>
  )
}

export default NewRosterCard
