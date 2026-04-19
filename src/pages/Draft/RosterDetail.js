import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { getRemainingSeconds, isDraftStart } from '../../config/helperFunctions'
import { addPlayerToDraft } from '../../redux/actions/draftAction'
import { positions } from '../../config/constants'

const RosterDetail = ({ playerFinancials }) => {
  const {
    selectedPlayer: player,
    activeTab,
    draftCounter,
    draftRounds,
    onTheClock,
    completed,
  } = useSelector((state) => state.draft)
  const USER = useSelector((state) => state.user)
  const { currentLeague } = useSelector((state) => state.league)
  const [loading, setLoading] = useState(false)

  // Dynamic year labels, auto-updates every season
  const currentYear = new Date().getFullYear()
  const shortYear = `${currentYear.toString().slice(-2)}'`

  const handleDraftPlayer = async () => {
    setLoading(true)
    await addPlayerToDraft({
      playerId: player?.player?._id,
      position: draftCounter?.position,
      round: draftCounter?.round,
      remainingTime: getRemainingSeconds(draftCounter?.time),
      teamId: onTheClock?.team?._id, // will be removed after testing
    })
    setLoading(false)
  }

  function mapPosition(position) {
  return positions[position] || position;
}

 
  return (
    <div className='dr-player-card'>
      {/* Player headshot */}
      {player?.player?.HostedHeadshotNoBackgroundUrl ? (
        <div
          className='dr-player-avatar'
          style={{ backgroundImage: `url(${player.player.HostedHeadshotNoBackgroundUrl})` }}
        />
      ) : (
        <div
          className='dr-player-avatar'
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <GiAmericanFootballPlayer size={55} color='rgba(255,255,255,0.25)' />
        </div>
      )}

      <div className='dr-player-info'>
        {/* Name + Position + Draft button */}
        <div className='dr-player-top'>
          <div className='dr-player-name-wrap'>
            <h3 className='dr-player-name'>{player?.player?.Name || 'Select a Player'}</h3>
            <span className='dr-player-meta'>
              {mapPosition(player?.player?.otcPosition || player?.player?.Position)}{player?.player?.Team ? `, ${player.player.Team}` : ''}
            </span>
          </div>
          {activeTab != 3 && (
            <Button
              className='dr-draft-btn'
              loading={loading}
              disabled={completed || !(onTheClock?.team?._id === USER?.userDetails?.team?._id)}
              type='primary'
              onClick={handleDraftPlayer}
            >
              DRAFT PLAYER
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className='dr-stats-row'>
          <div className='dr-stat'>
            <span className='dr-stat-label'>SAM ADP</span>
            <span className='dr-stat-value'>
              {player?.player?.samAdp24 ? player.player.samAdp24.toFixed(3) : '-'}
            </span>
          </div>
          <div className='dr-stat'>
            <span className='dr-stat-label'>{shortYear} PROJ. TOTAL PTS</span>
            <span className='dr-stat-value'>
              {player?.player?.projectedFantasyPoints && player.player.projectedFantasyPoints > 0
                ? player.player.projectedFantasyPoints.toFixed(3)
                : player?.stats?.stats?.FantasyPoints24
                  ? player.stats.stats.FantasyPoints24.toFixed(3)
                  : '-'}
            </span>
          </div>
          <div className='dr-stat'>
            <span className='dr-stat-label'>{shortYear} PROJ. AVG PTS</span>
            <span className='dr-stat-value'>
              {player?.player?.projectedAvgFantasyPoints && player.player.projectedAvgFantasyPoints > 0
                ? player.player.projectedAvgFantasyPoints.toFixed(3)
                : player?.stats?.stats?.AvgFantasyPoints24
                  ? player.stats.stats.AvgFantasyPoints24.toFixed(3)
                  : '-'}
            </span>
          </div>
          <div className='dr-stat'>
            <span className='dr-stat-label'>{shortYear} CAP HIT</span>
            <span className='dr-stat-value dr-cap-value'>
              {player?.player?.otcCapHit && player.player.otcCapHit > 0
                ? `$${(player.player.otcCapHit / 1_000_000).toFixed(1)}M`
                : player?.player?.currentYearSalaryCap
                  ? `${player.player.currentYearSalaryCap.toLocaleString()} SP`
                  : '-'}
            </span>
          </div>
          {player?.player?.otcTotalValue > 0 && (
            <div className='dr-stat'>
              <span className='dr-stat-label'>CONTRACT</span>
              <span className='dr-stat-value'>
                {`$${(player.player.otcTotalValue / 1_000_000).toFixed(0)}M / ${player.player.yearsLeftSalaryCap || player.player.otcContractYears || '-'}yr`}
              </span>
            </div>
          )}
        </div>

        {/* Player financials (if applicable) */}
        {playerFinancials && (
          <div className='dr-financials'>
            <span>Player Financials:</span>
            <span>{`${(currentYear - 1).toString().slice(-2)}' VALUE 28,900,000 SP`}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default RosterDetail
