import React, { useEffect, useState } from 'react'
import { Modal, Input, Button, notification, Spin } from 'antd'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { addBid, getSingleAuctionPlayer, approveAndRejectAuction, getAuctionPlayer } from '../../redux/actions/rosterAction'
import { positions } from '../../config/constants'

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

const LiveAuctionModal = ({ auctionId, open, onClose, onBidPlaced }) => {
  const [noti, contextHolder] = notification.useNotification()
  const [auction, setAuction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [manualBid, setManualBid] = useState('')
  const [bidError, setBidError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [quickBidding, setQuickBidding] = useState(false)
  const [remainingTime, setRemainingTime] = useState('')
  const [paying, setPaying] = useState(false)

  const USER = useSelector((state) => state.user)
  const sampoints = useSelector((state) => state.user?.SamPoints?.SamPoints)

  // Fetch auction data
  useEffect(() => {
    if (!open || !auctionId) return
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      const res = await getSingleAuctionPlayer(auctionId)
      if (!cancelled && res) setAuction(res)
      setLoading(false)
    }
    fetch()
    return () => { cancelled = true }
  }, [open, auctionId])

  // Clear bid error on input change
  useEffect(() => {
    if (bidError) setBidError('')
  }, [manualBid])

  // Countdown timer
  useEffect(() => {
    if (!auction?.endDate || auction?.hasAuctionEnded) {
      setRemainingTime(auction?.hasAuctionEnded ? 'Ended' : '')
      return
    }
    const tick = () => {
      const now = moment()
      const end = moment(auction.endDate)
      const duration = moment.duration(end.diff(now))
      if (duration.asSeconds() <= 0) {
        setRemainingTime('Ended')
        return
      }
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
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [auction?.endDate, auction?.hasAuctionEnded])

  const isOwner = auction?.auctionStartedBy?.team === USER?.userDetails?.team?._id && String(auction?.auctionFrom) === 'owner'

  // Check if current user won this auction
  const getIsWinner = () => {
    if (!auction?.hasAuctionEnded || !auction?.bidHistory?.length) return false
    const sorted = [...auction.bidHistory].sort((a, b) => b.bid - a.bid)
    const topBidder = sorted[0]
    const topUserId = topBidder?.user?._id || topBidder?.user
    const topTeamId = topBidder?.team?._id || topBidder?.team
    return String(topUserId) === String(USER?.userDetails?._id) || String(topTeamId) === String(USER?.userDetails?.team?._id)
  }
  const isWinner = getIsWinner()

  const handlePay = async () => {
    const bidAmount = auction?.highestCurrentBid
    if (sampoints < bidAmount) {
      noti.error({
        message: `Bid amount ${bidAmount?.toLocaleString()} exceeds your available points of ${sampoints?.toLocaleString()}.`,
        duration: 4,
      })
      return
    }
    setPaying(true)
    const res = await approveAndRejectAuction({ auctionId: auction._id, wallet_deduct: true, status: 'approved' })
    if (res) {
      setAuction({ ...auction, isPaid: true })
      onBidPlaced?.()
      await getAuctionPlayer()
      noti.success({ message: 'Payment successful! Player added to your roster.', duration: 3 })
    }
    setPaying(false)
  }

  const handleManualBid = async () => {
    if (!manualBid?.trim()) {
      setBidError('Enter a bid amount')
      return
    }
    if (Number(manualBid) <= (auction?.highestCurrentBid || 0)) {
      setBidError('Bid must be higher than current bid')
      return
    }
    setSubmitting(true)
    const res = await addBid({ auctionId: auction?._id, bidAmount: Number(manualBid) }, noti)
    if (res) {
      setAuction(res)
      setManualBid('')
      onBidPlaced?.()
    }
    setSubmitting(false)
  }

  const handleQuickBid = async () => {
    setQuickBidding(true)
    const res = await addBid(
      { auctionId: auction?._id, bidAmount: Number(auction?.highestCurrentBid || 0) + 1000 },
      noti,
    )
    if (res) {
      setAuction(res)
      onBidPlaced?.()
    }
    setQuickBidding(false)
  }

  const player = auction?.player_id
  const posColor = getPositionColor(player?.Position)

  return (
    <Modal
      title=''
      centered
      open={open}
      onCancel={onClose}
      footer={null}
      className='lam-modal'
      destroyOnClose
      width={520}
    >
      {contextHolder}
      <div className='lam-popup'>
        {/* Close button */}
        <button className='lam-close' onClick={onClose}>✕</button>

        {loading ? (
          <div className='lam-loader'><Spin size='large' /></div>
        ) : !auction ? (
          <div className='lam-loader'><p style={{ color: 'rgba(255,255,255,0.4)' }}>Auction not found</p></div>
        ) : (
          <>
            {/* ── Player Hero ── */}
            <div className='lam-hero'>
              <div className='lam-hero-avatar'>
                {player?.HostedHeadshotNoBackgroundUrl ? (
                  <img src={player.HostedHeadshotNoBackgroundUrl} alt={player.Name} />
                ) : (
                  <GiAmericanFootballPlayer size={44} color='rgba(255,255,255,0.3)' />
                )}
              </div>
              <div className='lam-hero-info'>
                <h2 className='lam-player-name'>{player?.Name || 'Unknown Player'}</h2>
                <div className='lam-hero-meta'>
                  <span
                    className='lam-pos-badge'
                    style={{ background: posColor.bg, borderColor: posColor.border, color: posColor.text }}
                  >
                    {mapPosition(player?.Position) || '-'}
                  </span>
                  <span className='lam-team-name'>{player?.Team || '-'}</span>
                  {player?.Age && <span className='lam-age'>Age {player.Age}</span>}
                </div>
              </div>
            </div>

            {/* ── Timer + Current Bid Row ── */}
            <div className='lam-bid-timer-row'>
              <div className='lam-current-bid-box'>
                <span className='lam-label'>Current Highest Bid</span>
                <span className='lam-bid-amount'>
                  {auction?.highestCurrentBid
                    ? `${auction.highestCurrentBid.toLocaleString()} SP`
                    : 'No bids yet'}
                </span>
              </div>
              <div className='lam-timer-box'>
                <span className='lam-label'>Time Remaining</span>
                <span className={`lam-timer-value ${remainingTime === 'Ended' ? 'lam-timer-ended' : ''}`}>
                  {remainingTime || '-'}
                </span>
              </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className='lam-stats-strip'>
              <div className='lam-stat'>
                <span className='lam-stat-label'>OPP</span>
                <span className='lam-stat-value'>{player?.UpcomingGameOpponent || '-'}</span>
              </div>
              <div className='lam-stat-divider' />
              <div className='lam-stat'>
                <span className='lam-stat-label'>BYE</span>
                <span className='lam-stat-value'>{player?.ByeWeek || '-'}</span>
              </div>
              <div className='lam-stat-divider' />
              <div className='lam-stat'>
                <span className='lam-stat-label'>Value</span>
                <span className='lam-stat-value'>
                  {player?.currentYearSalaryCap ? `${player.currentYearSalaryCap.toLocaleString()} SP` : '-'}
                </span>
              </div>
              <div className='lam-stat-divider' />
              <div className='lam-stat'>
                <span className='lam-stat-label'>Your Balance</span>
                <span className='lam-stat-value' style={{ color: '#22c55e' }}>
                  {sampoints?.toLocaleString() || '0'} SP
                </span>
              </div>
            </div>

            {/* ── Bid Input ── */}
            {remainingTime !== 'Ended' && !auction?.hasAuctionEnded && (
              <div className='lam-bid-section'>
                <div className='lam-bid-input-row'>
                  <Input
                    className='lam-bid-input'
                    type='number'
                    placeholder='Enter bid amount'
                    value={manualBid}
                    onChange={(e) => setManualBid(e.target.value)}
                    onPressEnter={handleManualBid}
                    disabled={isOwner}
                  />
                  <Button
                    className='lam-submit-btn'
                    type='primary'
                    loading={submitting}
                    onClick={handleManualBid}
                    disabled={isOwner}
                  >
                    Submit Bid
                  </Button>
                </div>
                {bidError && <p className='lam-bid-error'>{bidError}</p>}
                <Button
                  className='lam-quick-btn'
                  loading={quickBidding}
                  onClick={handleQuickBid}
                  disabled={isOwner}
                >
                  Quick Bid (+1,000 SP)
                </Button>
                {isOwner && (
                  <p className='lam-owner-note'>You cannot bid on your own auction</p>
                )}
              </div>
            )}

            {(remainingTime === 'Ended' || auction?.hasAuctionEnded) && (
              <div className='lam-ended-section'>
                {isWinner && !auction?.isPaid ? (
                  <div className='lam-winner-box'>
                    <div className='lam-winner-label'>You won this auction!</div>
                    <div className='lam-winner-amount'>
                      Pay <span style={{ color: '#22c55e', fontWeight: 800 }}>{auction?.highestCurrentBid?.toLocaleString()} SP</span> to add {player?.Name} to your roster
                    </div>
                    {auction?.payBefore && (
                      <div className='lam-winner-deadline'>
                        Auto-deducted after {moment(auction.payBefore).format('ddd, MMM D, h:mm a')}
                      </div>
                    )}
                    <button className='lam-pay-btn' onClick={handlePay} disabled={paying}>
                      {paying ? 'Processing...' : 'PAY NOW'}
                    </button>
                  </div>
                ) : isWinner && auction?.isPaid ? (
                  <div className='lam-ended-banner' style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}>
                    <span style={{ color: '#22c55e' }}>Paid, Player added to your roster</span>
                  </div>
                ) : (
                  <div className='lam-ended-banner'>
                    This auction has ended
                  </div>
                )}
              </div>
            )}

            {/* ── Bid History ── */}
            <div className='lam-history'>
              <h4 className='lam-history-title'>Bid History</h4>
              {!auction?.bidHistory || auction.bidHistory.length === 0 ? (
                <p className='lam-no-history'>No bids placed yet</p>
              ) : (
                <div className='lam-history-list'>
                  {auction.bidHistory
                    .slice()
                    .sort((a, b) => b.bid - a.bid)
                    .map((entry, i) => (
                      <div key={i} className={`lam-history-row ${i === 0 ? 'lam-history-top' : ''}`}>
                        <div className='lam-history-left'>
                          <span className='lam-history-rank'>#{i + 1}</span>
                          <div>
                            <p className='lam-history-user'>{entry?.user?.userName || '-'}</p>
                            <p className='lam-history-team'>{entry?.team?.name || '-'}</p>
                          </div>
                        </div>
                        <div className='lam-history-right'>
                          <span className='lam-history-bid'>{entry?.bid?.toLocaleString()} SP</span>
                          <span className='lam-history-date'>
                            {moment(entry?.date_time).format('MMM D, h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default LiveAuctionModal
