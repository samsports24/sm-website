import React, { useEffect, useState, useRef } from 'react'
import { Button, Tooltip, Spin, notification } from 'antd'

import Header from '../components/Header'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { approveAndRejectAuction, auctionEnded, getAuctionPlayer, markAsPaid, cancelAuction } from '../redux/actions/rosterAction'
import { useSelector } from 'react-redux'
import moment from 'moment'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import LiveAuctionModal from '../components/modal/LiveAuctionModal'
import { positions } from '../config/constants'

import '../styles/pages/playerAuction.css'

const PlayerAuction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { data } = useSelector((state) => state.auction)
  const leagueState = useSelector((state) => state.league) || {}
  const currentLeague = leagueState.currentLeague
  const draftNotCompleted = currentLeague && currentLeague.draftCompleted !== true
  const freeAgentAuctionsOff = currentLeague?.freeAgentAuctionsEnabled === false
  const ownerAuctionsOff = currentLeague?.ownerToOwnerAuctionsEnabled === false
  const [tab, setTab] = useState('live')
  const [dismissedAuctions, setDismissedAuctions] = useState(new Set())
  const [dismissingId, setDismissingId] = useState('')
  const [bidModalAuctionId, setBidModalAuctionId] = useState(null)

  const USER = useSelector((state) => state?.user?.userDetails)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const bidParam = searchParams.get('bid')
    if (bidParam) {
      setBidModalAuctionId(bidParam)
      searchParams.delete('bid')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setIsLoading(true)
    await getAuctionPlayer()
    setIsLoading(false)
  }

  function mapPosition(position) {
    return positions[position] || position
  }

  const getPositionColor = (pos) => {
    const mapped = mapPosition(pos)
    const colors = {
      QB: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
      RB: { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
      WR: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
      TE: { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
      K: { bg: 'rgba(255, 195, 0, 0.12)', border: 'rgba(255, 195, 0, 0.3)', text: '#FFC300' },
      DEF: { bg: 'rgba(40, 159, 201, 0.12)', border: 'rgba(40, 159, 201, 0.3)', text: '#22C55E' },
    }
    return colors[mapped] || { bg: 'rgba(110, 105, 128, 0.12)', border: 'rgba(110, 105, 128, 0.3)', text: '#6e6980' }
  }

  // Check if user is the highest bidder on an auction
  const isUserWinning = (auction) => {
    if (!auction?.bidHistory?.length || !USER?._id) return false
    const sorted = [...auction.bidHistory].sort((a, b) => b.bid - a.bid)
    const topBidder = sorted[0]
    // Check by user ID
    const topBidderId = topBidder?.user?._id || topBidder?.user
    if (String(topBidderId) === String(USER._id)) return true
    // Check by team ID (bidHistory.team or nested user.team)
    const topBidderTeamId = topBidder?.team?._id || topBidder?.team || topBidder?.user?.team?._id || topBidder?.user?.team
    if (USER?.team?._id && String(topBidderTeamId) === String(USER.team._id)) return true
    return false
  }

  const handleDismissAuction = (auctionId) => {
    setDismissingId(auctionId)
    const newDismissed = new Set(dismissedAuctions)
    newDismissed.add(auctionId)
    setDismissedAuctions(newDismissed)
    setDismissingId('')
    notification.success({ message: 'Auction dismissed', duration: 2 })
  }

  const handleClearCompleted = () => {
    const newDismissed = new Set(dismissedAuctions)
    data?.pastAuctions?.forEach((auction) => newDismissed.add(auction._id))
    setDismissedAuctions(newDismissed)
    notification.success({ message: 'All completed auctions cleared', duration: 2 })
  }

  const getVisiblePastAuctions = () => {
    return data?.pastAuctions?.filter(a => !dismissedAuctions.has(a._id)) || []
  }

  const currentData = tab === 'live' ? data?.liveAuctions : getVisiblePastAuctions()

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />
      <hr className='divider' />

      <div className='auc-page'>
        {/* Draft Not Complete Banner */}
        {draftNotCompleted && (
          <div style={{
            background: 'rgba(20, 28, 45, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 16,
            padding: '18px 22px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>
              🏈
            </div>
            <div>
              <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", marginBottom: 3, letterSpacing: '0.3px' }}>
                Draft In Progress
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'Inter', sans-serif", lineHeight: '1.5' }}>
                Auctions will become available once the league draft has been completed. Finish all draft rounds first.
              </div>
            </div>
          </div>
        )}

        {/* League Feature Banners */}
        {!draftNotCompleted && (freeAgentAuctionsOff || ownerAuctionsOff) && (
          <div style={{
            background: 'rgba(20, 28, 45, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            borderRadius: 16,
            padding: '14px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
            }}>
              &#x1F6AB;
            </div>
            <span style={{ color: '#f87171', fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: '1.5' }}>
              {freeAgentAuctionsOff && ownerAuctionsOff
                ? 'All auctions are disabled in this league by the commissioner.'
                : freeAgentAuctionsOff
                ? 'Free Agent Auctions are disabled. Only owner-to-owner auctions are active.'
                : 'Owner-to-Owner Auctions are disabled. Only free agent auctions are active.'}
            </span>
          </div>
        )}

        {/* Header */}
        <div className='auc-page-header'>
          <div className='auc-header-left'>
            <div className='auc-header-icon-wrap'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
              </svg>
            </div>
            <div>
              <h2 className='auc-page-title'>Auctions</h2>
              <span className='auc-page-subtitle'>
                {data?.liveAuctions?.length || 0} live &middot; {data?.pastAuctions?.length || 0} ended
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='auc-tab-bar'>
          <button className={`auc-tab-btn ${tab === 'live' ? 'auc-tab-btn-active' : ''}`} onClick={() => setTab('live')}>
            Live Auction
            <span className='auc-tab-count'>{data?.liveAuctions?.length || 0}</span>
          </button>
          <button className={`auc-tab-btn ${tab === 'past' ? 'auc-tab-btn-active' : ''}`} onClick={() => setTab('past')}>
            Past Auction
            <span className='auc-tab-count'>{getVisiblePastAuctions()?.length || 0}</span>
          </button>
          {tab === 'past' && getVisiblePastAuctions().length > 0 && (
            <button className='auc-tab-clear-btn' onClick={handleClearCompleted}>Clear Completed</button>
          )}
        </div>

        {/* Auction Rows (Compact List) */}
        {isLoading ? (
          <div className='auc-loading'><Spin size='large' /></div>
        ) : !currentData || currentData.length === 0 ? (
          <div className='auc-empty'>
            <svg width='52' height='52' viewBox='0 0 24 24' fill='none' stroke='rgba(34,197,94,0.15)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
            </svg>
            <p>No {tab === 'live' ? 'live' : 'past'} auctions</p>
            <span>{tab === 'live' ? 'Check back when new auctions are posted' : 'No completed auctions yet'}</span>
          </div>
        ) : (
          <div className='auc-list'>
            {/* Table header */}
            <div className='auc-row auc-row-header'>
              <div className='auc-col auc-col-player'>Player</div>
              <div className='auc-col auc-col-bid'>Current Bid</div>
              <div className='auc-col auc-col-cap'>Value</div>
              <div className='auc-col auc-col-time'>Time Left</div>
              <div className='auc-col auc-col-status'>Status</div>
              <div className='auc-col auc-col-action'></div>
            </div>

            {currentData.map((auction) => {
              const player = auction?.player_id
              const posColor = getPositionColor(player?.Position)
              const isEnded = auction?.hasAuctionEnded
              const winning = !isEnded && isUserWinning(auction)
              const wonButUnpaid = isEnded && isUserWinning(auction) && !auction?.isPaid

              return (
                <div
                  key={auction._id}
                  className={`auc-row ${isEnded ? 'auc-row-ended' : ''} ${winning ? 'auc-row-winning' : ''} ${wonButUnpaid ? 'auc-row-unpaid' : ''}`}
                >
                  {/* Player */}
                  <div className='auc-col auc-col-player'>
                    <div className='auc-row-avatar'>
                      {player?.HostedHeadshotNoBackgroundUrl ? (
                        <img src={player.HostedHeadshotNoBackgroundUrl} alt={player.Name} />
                      ) : (
                        <GiAmericanFootballPlayer size={20} color='rgba(255,255,255,0.3)' />
                      )}
                    </div>
                    <div className='auc-row-player-info'>
                      <PlayerDetailsModal
                        button={<span className='auc-row-name'>{player?.Name || '-'}</span>}
                        state={{
                          playerID: null, isReserve: false, teamId: null, teamName: '', teamLogo: null,
                          isAuction: { status: true, auctionId: auction?._id, hasAuctionEnded: auction?.hasAuctionEnded },
                        }}
                      />
                      <div className='auc-row-meta'>
                        <span className='auc-row-pos' style={{ background: posColor.bg, borderColor: posColor.border, color: posColor.text }}>
                          {mapPosition(player?.Position) || '-'}
                        </span>
                        <span className='auc-row-team'>{player?.Team || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid */}
                  <div className='auc-col auc-col-bid'>
                    <span className={auction?.highestCurrentBid ? 'auc-row-bid-value' : 'auc-row-bid-none'}>
                      {auction?.highestCurrentBid ? `SP ${auction.highestCurrentBid.toLocaleString()}` : 'No bids'}
                    </span>
                  </div>

                  {/* Cap Hit */}
                  <div className='auc-col auc-col-cap'>
                    <span className='auc-row-cap'>
                      {player?.currentYearSalaryCap ? `SP ${player.currentYearSalaryCap.toLocaleString()}` : '-'}
                    </span>
                  </div>

                  {/* Time */}
                  <div className='auc-col auc-col-time'>
                    <AuctionTimerBadge data={auction} getData={getData} />
                  </div>

                  {/* Status */}
                  <div className='auc-col auc-col-status'>
                    {isEnded && isUserWinning(auction) && auction?.isPaid && (
                      <span className='auc-status-badge auc-status-paid'>PAID</span>
                    )}
                    {wonButUnpaid && (
                      <span className='auc-status-badge auc-status-won'>WON</span>
                    )}
                    {!isEnded && winning && (
                      <span className='auc-status-badge auc-status-winning'>WINNING</span>
                    )}
                    {!isEnded && !winning && auction?.bidHistory?.some(b => String(b?.user?._id || b?.user) === String(USER?._id)) && (
                      <span className='auc-status-badge auc-status-outbid'>OUTBID</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className='auc-col auc-col-action'>
                    {!isEnded && (
                      <button className='auc-row-bid-btn' onClick={() => setBidModalAuctionId(auction._id)}>
                        {winning ? 'View' : 'Bid'}
                      </button>
                    )}
                    {wonButUnpaid && (
                      <PayButton data={auction} getData={getData} compact />
                    )}
                    {isEnded && !isUserWinning(auction) && (
                      <button className='auc-row-dismiss-btn' onClick={() => handleDismissAuction(auction._id)}>
                        Dismiss
                      </button>
                    )}
                    <CancelAuctionButton auction={auction} getData={getData} compact />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* My Auctions Section */}
        {data?.myAuctions && data.myAuctions.length > 0 && (
          <div className='auc-my-section'>
            <div className='auc-section-header-row'>
              <div className='auc-section-icon'>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                  <circle cx='12' cy='7' r='4' />
                </svg>
              </div>
              <h3 className='auc-section-title-text'>My Auctions</h3>
            </div>

            <div className='auc-my-cards-list'>
              {data.myAuctions.map((auction) => {
                const player = auction?.player_id
                const posColor = getPositionColor(player?.Position)

                return (
                  <div key={auction._id} className='auc-my-card'>
                    <div className='auc-my-card-player'>
                      <div className='auc-row-avatar'>
                        {player?.HostedHeadshotNoBackgroundUrl ? (
                          <img src={player.HostedHeadshotNoBackgroundUrl} alt={player.Name} />
                        ) : (
                          <GiAmericanFootballPlayer size={20} color='rgba(255,255,255,0.3)' />
                        )}
                      </div>
                      <div className='auc-row-player-info'>
                        <PlayerDetailsModal
                          button={<span className='auc-row-name'>{player?.Name || '-'}</span>}
                          state={{
                            playerID: null, isReserve: false, teamId: null, teamName: '', teamLogo: null,
                            isAuction: { status: true, auctionId: auction?._id, hasAuctionEnded: auction?.hasAuctionEnded },
                          }}
                        />
                        <div className='auc-row-meta'>
                          <span className='auc-row-pos' style={{ background: posColor.bg, borderColor: posColor.border, color: posColor.text }}>
                            {mapPosition(player?.Position) || '-'}
                          </span>
                          <span className='auc-row-team'>{player?.Team || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className='auc-my-card-center'>
                      <div className='auc-my-card-stat'>
                        <span className='auc-my-card-stat-label'>Current Bid</span>
                        <span className='auc-my-card-stat-value' style={{ color: '#22C55E' }}>
                          {auction?.highestCurrentBid ? `SP ${auction.highestCurrentBid.toLocaleString()}` : '-'}
                        </span>
                      </div>
                      <div className='auc-my-card-stat'>
                        <span className='auc-my-card-stat-label'>Value</span>
                        <span className='auc-my-card-stat-value'>
                          {player?.currentYearSalaryCap ? `SP ${player.currentYearSalaryCap.toLocaleString()}` : '-'}
                        </span>
                      </div>
                      <div className='auc-my-card-stat'>
                        <span className='auc-my-card-stat-label'>Time Left</span>
                        <span className='auc-my-card-stat-value'>
                          <AuctionTimerBadge data={auction} getData={getData} />
                        </span>
                      </div>
                    </div>
                    <div className='auc-my-card-right'>
                      <PayButton data={auction} getData={getData} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live Auction Bid Modal */}
      <LiveAuctionModal
        auctionId={bidModalAuctionId}
        open={!!bidModalAuctionId}
        onClose={() => setBidModalAuctionId(null)}
        onBidPlaced={getData}
      />
    </div>
  )
}

const AuctionTimerBadge = ({ data: v, getData }) => {
  const [remainingTime, setRemainingTime] = useState('')
  const endedCalledRef = useRef(false)

  const ended = async () => {
    // Guard: only call end-auction once per auction
    if (endedCalledRef.current) return
    endedCalledRef.current = true
    try {
      const res = await auctionEnded({ auctionId: v?._id })
      if (res) await getData()
    } catch (e) {
      endedCalledRef.current = false // allow retry on error
    }
  }

  useEffect(() => {
    let interval
    if (v?.hasAuctionEnded) {
      setRemainingTime('ended')
      endedCalledRef.current = true // already ended, don't call again
      return
    }
    // Check if already past end date on mount
    const now = moment()
    const end = moment(v?.endDate)
    if (end.diff(now) <= 0) {
      setRemainingTime('ended')
      ended()
      return
    }
    interval = setInterval(() => {
      const now = moment()
      const end = moment(v?.endDate)
      const duration = moment.duration(end.diff(now))
      if (duration.asSeconds() <= 0) {
        clearInterval(interval)
        setRemainingTime('ended')
        ended()
      } else {
        const days = Math.floor(duration.asDays())
        const hours = String(duration.hours()).padStart(2, '0')
        const minutes = String(duration.minutes()).padStart(2, '0')
        const seconds = String(duration.seconds()).padStart(2, '0')
        setRemainingTime(
          days === 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : `${days}d ${hours}h ${minutes}m ${seconds}s`,
        )
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [v?._id])

  if (!v?.hasAuctionStarted && !v?.hasAuctionEnded) {
    return <span className='auc-timer-pending'>Starts {moment(v?.startDate).format('MMM D, h:mm a')}</span>
  }
  if (remainingTime === 'ended' || v?.hasAuctionEnded) {
    return <span className='auc-timer-ended'>Ended</span>
  }
  return (
    <span className='auc-timer-live'>
      <span className='auc-timer-dot' />
      {remainingTime || '-'}
    </span>
  )
}

const PayButton = ({ data: v, getData, compact }) => {
  const USER = useSelector((state) => state?.user?.userDetails)
  const [loadingId, setLoadingId] = useState('')
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)

  const pay = async (id, CapHit) => {
    let wallet_deduct = false
    let status = 'Rejected'
    setLoadingId(id)

    if (sampoints < CapHit) {
      notification.error({
        message: `Bid amount ${CapHit?.toLocaleString()} exceeds your available points of ${sampoints?.toLocaleString()}.`,
        duration: 4,
      })
      setLoadingId('')
      return
    } else {
      wallet_deduct = true
      status = 'approved'
    }

    const res = await approveAndRejectAuction({ auctionId: id, wallet_deduct, status })
    if (res) {
      setLoadingId('')
      await getData()
      await getAuctionPlayer()
    }
  }

  // Find the highest bidder (sort by bid descending)
  const sorted = [...(v?.bidHistory || [])].sort((a, b) => b.bid - a.bid)
  const topBidder = sorted[0]
  const topBidderUserId = topBidder?.user?._id || topBidder?.user
  const topBidderTeamId = topBidder?.team?._id || topBidder?.team || topBidder?.user?.team?._id || topBidder?.user?.team
  const isWinner = v?.hasAuctionEnded && (
    String(topBidderUserId) === String(USER?._id) ||
    (USER?.team?._id && String(topBidderTeamId) === String(USER.team._id))
  )
  if (!isWinner) return null
  if (v?.isPaid) return <span className='auc-paid-badge'>PAID</span>

  // Calculate countdown to payBefore deadline
  const deadlineMoment = moment(v?.payBefore)
  const now = moment()
  const duration = moment.duration(deadlineMoment.diff(now))
  const hoursLeft = Math.max(0, Math.floor(duration.asHours()))
  const minsLeft = Math.max(0, duration.minutes())
  const isUrgent = hoursLeft < 4

  return (
    <Tooltip
      placement='top'
      overlayClassName='auc-pay-tooltip'
      overlayInnerStyle={{
        background: 'linear-gradient(145deg, #141C2D, #1A2438)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: '12px',
        padding: '14px 16px',
        maxWidth: '240px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      title={
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            Payment Deadline
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '6px',
            background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.2)'}`,
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: isUrgent ? '#ef4444' : '#22c55e', fontFamily: "'Rajdhani', sans-serif" }}>
              {hoursLeft}h {minsLeft}m
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>remaining</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
            {deadlineMoment.format('ddd, MMM D · h:mm A')}
          </div>
          <div style={{
            marginTop: '8px', paddingTop: '8px',
            borderTop: '1px solid rgba(110,105,128,0.15)',
            fontSize: '10px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.4',
          }}>
            Auto-deducted from wallet if not paid in time
          </div>
        </div>
      }
    >
      <button
        className={compact ? 'auc-row-pay-btn' : 'auc-pay-btn'}
        disabled={loadingId === v?._id}
        onClick={() => pay(v?._id, v?.highestCurrentBid)}
      >
        {loadingId === v?._id ? 'Paying...' : 'PAY'}
      </button>
    </Tooltip>
  )
}

const CANCEL_WINDOW_SECONDS = 180

const CancelAuctionButton = ({ auction, getData, compact }) => {
  const USER = useSelector((state) => state?.user?.userDetails)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)

  const isCreator = String(auction?.auctionStartedBy?.user?._id || auction?.auctionStartedBy?.user) === String(USER?._id)

  useEffect(() => {
    if (!isCreator || !auction?.createdAt) return
    const calc = () => {
      const elapsed = moment().diff(moment(auction.createdAt), 'seconds')
      setRemaining(Math.max(0, CANCEL_WINDOW_SECONDS - elapsed))
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [isCreator, auction?.createdAt])

  if (!isCreator || remaining <= 0 || auction?.hasAuctionEnded) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const handleCancel = async () => {
    setLoading(true)
    const success = await cancelAuction({ auctionId: auction._id })
    if (success) await getData()
    setLoading(false)
  }

  return (
    <button className={compact ? 'auc-row-cancel-btn' : 'auc-cancel-btn'} disabled={loading} onClick={handleCancel}>
      {loading ? '...' : `Cancel (${mins}:${String(secs).padStart(2, '0')})`}
    </button>
  )
}

export default PlayerAuction
