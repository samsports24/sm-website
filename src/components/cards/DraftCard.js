import { Button, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

import LeadIcon from '../../assets/lead.svg'
import SampointsCoin from '../../assets/sampoints-coin.svg'
import CalendarIcon from '../../assets/calender.svg'
import TrophyIcon from '../../assets/trophy.svg'
import { getDraftRound } from '../../redux/actions/draftAction'
import { attachToken, privateAPI } from '../../config/constants'

const DraftCard = ({ league: leagueProp = null }) => {
  const navigate = useNavigate()
  const [leagueInfo, setLeagueInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pull league data from Redux or props
  const reduxLeague = useSelector((state) => state.league?.currentLeague)
  const draftRound = useSelector((state) => state.draft?.draftRound)
  const user = useSelector((state) => state.user?.userDetails)

  const league = leagueProp || reduxLeague

  useEffect(() => {
    fetchLeagueInfo()
  }, [league])

  useEffect(() => {
    attachToken()
    getDraftRound()
  }, [])

  const fetchLeagueInfo = async () => {
    setLoading(true)
    try {
      if (league) {
        setLeagueInfo({
          name: league.name || 'League',
          leagueType: league.leagueType || league.type || 'SFL',
          numberOfTeams: league.numberOfTeams || league.teams?.length || 0,
          maxTeams: league.maxTeams || 32,
          draftDate: league.draftDate || null,
          minBidIncrement: league.minBidIncrement || league.bidIncrement || 0.25,
          entryFee: league.entryFee || 0,
          prizePool: league.prizePool || 0,
        })
      }
    } catch {
      // Fallback to empty
    } finally {
      setLoading(false)
    }
  }

  // Build draft order entries from draftRound data
  const draftEntries = React.useMemo(() => {
    if (!draftRound) return []
    const rounds = Array.isArray(draftRound) ? draftRound : [draftRound]
    const entries = []

    rounds.forEach((round) => {
      if (round?.picks && Array.isArray(round.picks)) {
        round.picks.forEach((pick) => {
          entries.push({
            userName: pick.user?.name || pick.user?.userName || pick.userName || 'Unowned Team',
            bid: pick.bidAmount || pick.bid || 0,
            pickNumber: pick.pickNumber || pick.overall || 0,
            isMyPick: String(pick.user?._id || pick.user) === String(user?._id),
          })
        })
      }
    })

    entries.sort((a, b) => b.bid - a.bid)
    return entries
  }, [draftRound, user])

  const formatDraftDate = (date) => {
    if (!date) return 'TBD'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  }

  const playerRange = leagueInfo
    ? `${leagueInfo.numberOfTeams}-${leagueInfo.maxTeams}`
    : '--'

  if (loading && !leagueInfo) {
    return (
      <div className='draft-container'>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin />
        </div>
      </div>
    )
  }

  return (
    <div className='draft-container'>
      <div className='top-div'>
        <div className='details'>
          <p>League Name</p>
          <h3>{leagueInfo?.name || 'No League Selected'}</h3>
        </div>
        <div className='btn-container'>
          <Button
            onClick={() => {
              navigate('/total-payment')
            }}
          >
            Join
          </Button>
        </div>
      </div>
      <div className='card-body'>
        <div className='widgets-div'>
          <div className='widget-box'>
            <p>Players</p>
            <div className='lead'>
              <img src={LeadIcon} alt='' />
              <p>{playerRange}</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>Draft Starts</p>
            <div className='lead'>
              <img src={CalendarIcon} alt='' />
              <p>{formatDraftDate(leagueInfo?.draftDate)}</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>League Type</p>
            <div className='lead'>
              <img src={TrophyIcon} alt='' />
              <p>{leagueInfo?.leagueType || '--'}</p>
            </div>
          </div>
        </div>
        <div className='widgets-div'>
          <div className='widget-box'>
            <p>League Bid Increments Min.</p>
            <div className='lead'>
              <img src={SampointsCoin} alt='' />
              <p>{(leagueInfo?.minBidIncrement || 0).toFixed(2)} SP</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>Entry Fee</p>
            <div className='lead'>
              <img src={SampointsCoin} alt='' />
              <p>{(leagueInfo?.entryFee || 0).toFixed(2)} SP</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>Prize Pool</p>
            <div className='lead'>
              <img src={SampointsCoin} alt='' />
              <p>{(leagueInfo?.prizePool || 0).toFixed(2)} SP</p>
            </div>
          </div>
        </div>
        <div className='draft-table'>
          <div className='table-head'>
            <h3>Current Draft Order</h3>
          </div>
          {draftEntries.length === 0 ? (
            <div className='table-row' style={{ justifyContent: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No draft picks yet
              </p>
            </div>
          ) : (
            draftEntries.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className='table-row'
                style={{
                  background: entry.isMyPick ? 'rgba(34,197,94,0.08)' : undefined,
                }}
              >
                <p>
                  {entry.pickNumber > 0 ? `${entry.pickNumber}= ` : `${i + 1}= `}
                  {entry.userName}
                </p>
                <div className='lead'>
                  <img src={SampointsCoin} alt='' />
                  <p>{entry.bid.toFixed(2)} SP</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DraftCard
