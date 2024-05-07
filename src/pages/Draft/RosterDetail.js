import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import { getRemainingSeconds, isDraftStart } from '../../config/helperFunctions'
import { addPlayerToDraft } from '../../redux/actions/draftAction'

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

  const handleDraftPlayer = async () => {
    setLoading(true)
    await addPlayerToDraft({
      playerId: player?._id,
      position: draftCounter?.position,
      round: draftCounter?.round,
      remainingTime: getRemainingSeconds(draftCounter?.time),
      teamId: onTheClock?.team?._id, // will be removed after testing
    })
    setLoading(false)
  }

  return (
    <div className='roster_detail_box'>
      <div
        className='rdb_left'
        style={{ backgroundImage: `url(${player?.HostedHeadshotNoBackgroundUrl})` }}
      />
      <div className='rdb_right'>
        <div className='rdb_right_row1'>
          <div className='left'>
            <p>{player?.Name}</p>
            <p>
              {/* #12  */}| {player?.Position}, {player?.Team}
            </p>
          </div>
          <div className='right'>
            {activeTab != 3 && (
              <Button
                loading={loading}
                disabled={
                  // false

                  // !isDraftStart(currentLeague?.draftStart) &&
                  completed || !(onTheClock?.team?._id === USER?.userDetails?.team?._id)
                }
                type='primary'
                onClick={handleDraftPlayer}
              >
                DRAFT PLAYER
              </Button>
            )}
          </div>
        </div>
        <div className='rdb_right_row2'>
          <p className='active'>2023 Stats</p>
          <p>|</p>
          <p>2024 Projected Stats</p>
          <p>|</p>
          <p>Career Stats</p>
        </div>
        <div className='rdb_right_row3'>
          <div>
            <p>Bye</p>
            <p>-</p>
          </div>
          <div>
            <p>23</p>
            <p>{player?.pf || '-'}</p>
          </div>
          <div>
            <p>24 Proj</p>
            <p>{player?.mlbFantasyPoints || '-'}</p>
          </div>
          {/* <div>
            <p>Pass Yds</p>
            <p>-</p>
          </div>
          <div>
            <p>Pass Td</p>
            <p>-</p>
          </div>
          <div>
            <p>PassInt</p>
            <p>-</p>
          </div> */}
        </div>
        <div className='rdb_right_row4'>
          {/* <div className='draft_by'>
            <p>Draft By</p>
            <p>Team 4</p>
          </div> */}
          {playerFinancials && (
            <div className='pf_box'>
              <p>Player Financials:</p>
              <p>23’ CAP HIT $28,90,000</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RosterDetail
