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
      playerId: player?.player?._id,
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
        style={{ backgroundImage: `url(${player?.player?.HostedHeadshotNoBackgroundUrl})` }}
      />
      <div className='rdb_right'>
        <div className='rdb_right_row1'>
          <div className='left'>
            <p>{player?.player?.Name}</p>
            <p>
              {/* #12  */}- {player?.player?.Position}, {player?.player?.Team}
            </p>
          </div>
          <div className='right'>
            {activeTab != 3 && (
              <Button
              className='updatebtn'
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


        

        {/* <div className='rdb_right_row2'>
          <p className='active'>2023 Stats</p>
          <p>|</p>
          <p>2024 Projected Stats</p>
          <p>-</p>
          <p>Career Stats</p>
        </div> */}

        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap'}}>
        <div className='rdb_right_row3'>
          {/* <div style={{paddingBottom:'20px'}}> */}
          <div>
            <p style={{fontSize:'20px'}}>SAM ADP</p>
            <p>{player?.player?.samAdp24 ? `${player?.player?.samAdp24?.toFixed(3)}` : '-'}
            </p>
          </div>
          <div>
          <p>{`23' TOTAL POINTS`}</p>
            {/* <p>{player?.player?.pf.toFixed(3)  || '-'}</p> */}
            <p>{player?.player?.pf ? `${player.player.pf.toFixed(3)}` : '-'}</p>
          </div>
          <div>
            <p>{`23' AVG. POINTS`}</p>
            {/* <p>{player?.player?.avgPf?.toFixed(3) || '-'}</p> */}
            <p>{player?.player?.avgPf ? `${player.player.avgPf.toFixed(3)}` : '-'}</p>
          </div>
          <div>
          {/* <p>{`24' PROJ.`}<br /> TOTAL POINTS</p> */}
          <p>{`24' PROJ.`}TOTAL POINTS</p>
            {/* <p>{player?.stats?.stats?.FantasyPoints24?.toFixed(3) || '-'}</p> */}
            <p>{player?.stats?.stats?.FantasyPoints24 ? `${player?.stats?.stats?.FantasyPoints24.toFixed(3)}` : '-'}</p>
          </div>
         
          <div>
            {/* <p>{`24' PROJ.`}<br /> AVG.POINTS</p> */}
            <p>{`24' PROJ.`} AVG.POINTS</p>
            {/* <p>{player?.stats?.stats?.AvgFantasyPoints24?.toFixed(3) || '-'}</p> */}
            <p>{player?.stats?.stats?.AvgFantasyPoints24 ? `${player?.stats?.stats?.AvgFantasyPoints24.toFixed(3)}` : '-'}</p>
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
        <div>
            <p className='label'>{`24' CAP HIT`}</p>
            <p className='value'>
            {`$${(player?.player?.currentYearSalaryCap || '-').toLocaleString()}` ||'-'}
              {/* {player?.player?.currentYearSalaryCap.toFixed(2) || '-'} */}
              
              </p>
           
          </div>
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
