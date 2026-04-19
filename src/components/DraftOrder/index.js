import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SampointsCoin from '../../assets/sampoints-coin.svg'
import { Button, Input, notification, Spin } from 'antd'
import { getDraftRound, makeBid } from '../../redux/actions/draftAction'
import { attachToken } from '../../config/constants'
import { getUser } from '../../redux/actions/authActions'
import moment from 'moment'

const DraftOrder = () => {
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  const draftRound = useSelector((state) => state.draft?.draftRound)
  const user = useSelector((state) => state.user?.userDetails)
  const walletData = useSelector((state) => state.user?.SamPoints)
  const preAuctionPoints = walletData?.preAuctionPoints || 0
  const currentLeague = useSelector((state) => state.league?.currentLeague)

  // Check if commissioner has enabled draft pick auction
  const draftPositionMode = currentLeague?.draftPositionMode || 'auction'
  const isAuctionMode = draftPositionMode === 'auction'
  const spotAuctionEnabled = currentLeague?.spotAuction !== false

  // Calculate auction end time (5 min before draft start)
  const draftStart = currentLeague?.draftStart
  const spotAuctionEnd = currentLeague?.spotAuctionEnd
  const auctionEndTime = spotAuctionEnd || (draftStart ? moment(draftStart).subtract(5, 'minutes').toISOString() : null)

  useEffect(() => {
    if (!isAuctionMode) return
    attachToken()
    getDraftRound()
  }, [isAuctionMode])

  // Countdown timer
  useEffect(() => {
    if (!auctionEndTime) {
      setTimeLeft('')
      return
    }

    const updateTimer = () => {
      const now = moment()
      const end = moment(auctionEndTime)
      const diff = end.diff(now)

      if (diff <= 0) {
        setTimeLeft('Auction Ended')
        return
      }

      const duration = moment.duration(diff)
      const days = Math.floor(duration.asDays())
      const hours = String(duration.hours()).padStart(2, '0')
      const minutes = String(duration.minutes()).padStart(2, '0')
      const seconds = String(duration.seconds()).padStart(2, '0')

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [auctionEndTime])

  // Don't render if commissioner hasn't set auction mode
  if (!isAuctionMode || !spotAuctionEnabled) {
    return null
  }

  // Build the draft order list from draftRound data
  const draftEntries = (() => {
    if (!draftRound) return []

    const rounds = Array.isArray(draftRound) ? draftRound : [draftRound]
    const entries = []

    rounds.forEach((round) => {
      if (round?.picks && Array.isArray(round.picks)) {
        round.picks.forEach((pick) => {
          entries.push({
            teamName: pick.team?.name || pick.teamName || 'Unowned Team',
            userName: pick.user?.name || pick.user?.userName || pick.userName || '',
            bid: pick.bidAmount || pick.bid || 0,
            pickNumber: pick.pickNumber || pick.overall || 0,
            isMyPick: String(pick.user?._id || pick.user) === String(user?._id),
          })
        })
      }
    })

    entries.sort((a, b) => b.bid - a.bid)
    return entries
  })()

  const isAuctionEnded = auctionEndTime && moment().isAfter(moment(auctionEndTime))

  const handleMakePayment = async () => {
    if (isAuctionEnded) {
      return notification.error({ message: 'Draft pick auction has ended.', duration: 3 })
    }

    const amount = parseFloat(bidAmount)
    if (!amount || amount <= 0) {
      return notification.warning({ message: 'Enter a valid bid amount', duration: 3 })
    }
    if (amount > preAuctionPoints) {
      return notification.error({
        message: `Insufficient points. You have ${preAuctionPoints.toLocaleString()} pre-auction points.`,
        duration: 3,
      })
    }

    setLoading(true)
    try {
      await makeBid({ amount })
      setBidAmount('')
      // Refresh user data to update wallet balance
      await getUser()
      notification.success({ message: 'Bid placed successfully!', duration: 3 })
    } catch (err) {
      // Error is already handled in makeBid action
    } finally {
      setLoading(false)
    }
  }

  const displayEntries = draftEntries.length > 0
    ? draftEntries
    : [
        { teamName: 'Waiting for bids...', userName: '', bid: 0, pickNumber: 0, isMyPick: false },
      ]

  return (
    <div className='draft_order'>
      <header>
        <h3>Draft Pick Auction</h3>
        {timeLeft && (
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isAuctionEnded ? '#ef4444' : '#22c55e',
            fontFamily: "'Rajdhani', sans-serif",
          }}>
            {isAuctionEnded ? 'Ended' : timeLeft}
          </span>
        )}
      </header>
      <section className='content_body'>
        {/* Pre-auction balance */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          marginBottom: '8px',
          background: 'rgba(34,197,94,0.06)',
          borderRadius: '6px',
          fontSize: '12px',
        }}>
          <span style={{ color: '#9CA3AF' }}>Your Balance</span>
          <span style={{ color: '#22c55e', fontWeight: 600 }}>
            <img src={SampointsCoin} alt="" style={{ width: 14, height: 14, marginRight: 4, verticalAlign: 'middle' }} />
            {preAuctionPoints.toLocaleString()} SP
          </span>
        </div>

        <div className='draft_order_box'>
          {displayEntries.map((entry, i, arr) => {
            const isLastItem = i === arr.length - 1
            return (
              <div
                key={i}
                className='draft_row'
                style={{
                  border: isLastItem ? 'none' : undefined,
                  background: entry.isMyPick ? 'rgba(34,197,94,0.08)' : undefined,
                }}
              >
                <p>
                  {entry.pickNumber > 0 ? `${entry.pickNumber}= ` : `${i + 1}= `}
                  {entry.userName || entry.teamName}
                </p>
                <h2>
                  <img src={SampointsCoin} alt="" /> {entry.bid.toFixed(2)} SP
                </h2>
              </div>
            )
          })}
        </div>

        {!isAuctionEnded && (
          <div className='draft_order_footer'>
            <p>Increase Bid</p>
            <Input
              type='number'
              placeholder='Amount'
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              onPressEnter={handleMakePayment}
            />
            <Button
              type='primary'
              onClick={handleMakePayment}
              loading={loading}
            >
              Place Bid
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

export default DraftOrder
