import React, { useEffect, useState } from 'react'

import Header from '../../components/Header'
import { useSelector } from 'react-redux'
import teamlogo from '../../assets/beast-square-2.png'
import { Image, Spin, Button, notification } from 'antd'
import { getDraftRound, makeBid } from '../../redux/actions/draftAction'
import sampointslogo from '../../assets/samcoinlogo.png'

import { getLeagueDetails } from '../../redux'
import SpotAuctionTimer from '../../components/spotAuctiontimer'
import Loader from '../Loader'

// ── Design System (matches Commissioner) ──
const COLORS = {
  glass: 'rgba(20, 28, 45, 0.6)',
  border: 'rgba(110, 105, 128, 0.15)',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  textDim: 'rgba(255,255,255,0.5)',
}

const GLASS = {
  background: COLORS.glass,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
}

const DraftAuction = () => {
  const { socket } = useSelector((state) => state.socket)
  const { draftRounds } = useSelector((state) => state.draft)
  const [bidAmount, setBidAmount] = useState('')
  const { currentLeague } = useSelector((state) => state.league)
  const user = useSelector((state) => state.user.userDetails)
  const round1Data = draftRounds.filter((round) => round.round === 1)
  const [loading, setLoading] = useState(true)
  const [isTimerFinished, setIsTimerFinished] = useState(false)

  const ConfDiv = [
    { position: 1, name: 'Apex', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecba60a538b0337c12d7', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 2, name: 'Ascendancy', conference: '65d6ebd560a538b0337c01c0', division: '65d6eedf60a538b0337c4bb9', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 3, name: 'Prestige', conference: '65d6ebd560a538b0337c01c0', division: '65d6eef060a538b0337c4d1f', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 4, name: 'Dominance', conference: '65d6eb7560a538b0337bfabc', division: '65d6ec7860a538b0337c0dbe', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 5, name: 'Excellence', conference: '65d6eb7560a538b0337bfabc', division: '65d6eca560a538b0337c1129', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 6, name: 'Superior', conference: '65d6ebd560a538b0337c01c0', division: '65d6eee960a538b0337c4c44', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 7, name: 'Vanguard', conference: '65d6ebd560a538b0337c01c0', division: '65d6eefb60a538b0337c4dda', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 8, name: 'Pinnacle', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecc460a538b0337c1a6c', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 9, name: 'Pinnacle', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecc460a538b0337c1a6c', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 10, name: 'Vanguard', conference: '65d6ebd560a538b0337c01c0', division: '65d6eefb60a538b0337c4dda', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 11, name: 'Superior', conference: '65d6ebd560a538b0337c01c0', division: '65d6eee960a538b0337c4c44', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 12, name: 'Excellence', conference: '65d6eb7560a538b0337bfabc', division: '65d6eca560a538b0337c1129', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 13, name: 'Dominance', conference: '65d6eb7560a538b0337bfabc', division: '65d6ec7860a538b0337c0dbe', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 14, name: 'Prestige', conference: '65d6ebd560a538b0337c01c0', division: '65d6eef060a538b0337c4d1f', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 15, name: 'Ascendancy', conference: '65d6ebd560a538b0337c01c0', division: '65d6eedf60a538b0337c4bb9', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 16, name: 'Apex', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecba60a538b0337c12d7', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 17, name: 'Elite', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecba60a538b0337c12d7', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 18, name: 'Ascendancy', conference: '65d6ebd560a538b0337c01c0', division: '65d6eedf60a538b0337c4bb9', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 19, name: 'Prestige', conference: '65d6ebd560a538b0337c01c0', division: '65d6eef060a538b0337c4d1f', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 20, name: 'Dominance', conference: '65d6eb7560a538b0337bfabc', division: '65d6ec7860a538b0337c0dbe', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 21, name: 'Excellence', conference: '65d6eb7560a538b0337bfabc', division: '65d6eca560a538b0337c1129', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 22, name: 'Superior', conference: '65d6ebd560a538b0337c01c0', division: '65d6eee960a538b0337c4c44', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 23, name: 'Vanguard', conference: '65d6ebd560a538b0337c01c0', division: '65d6eefb60a538b0337c4dda', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 24, name: 'Pinnacle', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecc460a538b0337c1a6c', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 25, name: 'Pinnacle', conference: '65d6ebd560a538b0337c01c0', division: '65d6ecc460a538b0337c1a6c', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 26, name: 'Vanguard', conference: '65d6ebd560a538b0337c01c0', division: '65d6eefb60a538b0337c4dda', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 27, name: 'Superior', conference: '65d6ebd560a538b0337c01c0', division: '65d6eee960a538b0337c4c44', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 28, name: 'Excellence', conference: '65d6eb7560a538b0337bfabc', division: '65d6eca560a538b0337c1129', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 29, name: 'Dominance', conference: '65d6eb7560a538b0337bfabc', division: '65d6ec7860a538b0337c0dbe', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
    { position: 30, name: 'Prestige', conference: '65d6ebd560a538b0337c01c0', division: '65d6eef060a538b0337c4d1f', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 31, name: 'Ascendancy', conference: '65d6ebd560a538b0337c01c0', division: '65d6eedf60a538b0337c4bb9', imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png' },
    { position: 32, name: 'Apex', conference: '65d6eb7560a538b0337bfabc', division: '65d6ecba60a538b0337c12d7', imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png' },
  ]

  useEffect(() => {
    getLeagueDetails()
    fetchData()
  }, [])

  useEffect(() => {
    if (socket) {
      const handleDraftSpot = () => {
        fetchData()
        getLeagueDetails()
      }
      socket.on('draftSpot', handleDraftSpot)
      return () => socket.off('draftSpot', handleDraftSpot)
    }
  }, [socket])

  const fetchData = async () => {
    setLoading(true)
    try {
      await getDraftRound()
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleMakeBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      notification.warning({ message: 'Enter a valid bid amount', duration: 3 })
      return
    }
    setLoading(true)
    try {
      await makeBid({
        leagueid: user?.team?.currentLeague._id,
        bidamount: parseFloat(bidAmount),
        teamid: user?.team?._id,
        spotAuctionEnd: currentLeague?.spotAuctionEnd,
      })
      setBidAmount('')
    } catch (error) {
      console.error('Error making bid:', error)
    }
    setLoading(false)
  }

  const sortedDraftRounds = round1Data?.sort((a, b) => a.position - b.position)

  // Find current user draft spot
  const myDraftSpot = round1Data.find((dr) => user?._id === dr?.team?.user?._id)

  return (
    <div>
      <Header />
      <hr className='divider' />

      {loading ? (
        <Loader />
      ) : (
        <div className='dsa-page'>
          {/* ── Page Header ── */}
          <div className='dsa-header'>
            <div className='dsa-header-left'>
              <div className='dsa-header-icon'>
                <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                </svg>
              </div>
              <div>
                <h2 className='dsa-title'>Draft Spot Auction</h2>
                <span className='dsa-subtitle'>{sortedDraftRounds?.length || 0} picks &middot; Round 1</span>
              </div>
            </div>
          </div>

          {/* ── Main Layout: List + Sidebar ── */}
          <div className='dsa-layout'>
            {/* ── Left: Picks List ── */}
            <div className='dsa-list-panel'>
              {/* Table Header */}
              <div className='dsa-table-header'>
                <div className='dsa-th dsa-th-pick'>#</div>
                <div className='dsa-th dsa-th-user'>Team</div>
                <div className='dsa-th dsa-th-bid'>Bid</div>
                <div className='dsa-th dsa-th-div'>Division</div>
              </div>

              {/* Rows */}
              <div className='dsa-table-body'>
                {sortedDraftRounds?.map((item, index) => {
                  const confDivItem = ConfDiv.find((c) => c?.position === item?.position)
                  const isMe = user?._id === item?.team?.user?._id

                  return (
                    <div key={index} className={`dsa-row ${isMe ? 'dsa-row-me' : ''}`}>
                      <div className='dsa-cell dsa-cell-pick'>
                        <span className='dsa-pick-badge'>{item?.position}</span>
                      </div>

                      <div className='dsa-cell dsa-cell-user'>
                        <div className='dsa-team-logo'>
                          <Image preview={false} src={item?.team?.logo || teamlogo} alt='team' />
                        </div>
                        <div className='dsa-user-info'>
                          <span className='dsa-username'>{item?.team?.user?.userName || '-'}</span>
                          {isMe && <span className='dsa-me-badge'>YOU</span>}
                        </div>
                      </div>

                      <div className='dsa-cell dsa-cell-bid'>
                        <div className='dsa-bid-wrap'>
                          <img className='dsa-sp-icon' src={sampointslogo} alt='SP' />
                          <span className='dsa-bid-amount'>{item?.bidamount?.toLocaleString() || '0'}</span>
                        </div>
                      </div>

                      <div className='dsa-cell dsa-cell-div'>
                        <div className='dsa-div-wrap'>
                          <div className='dsa-div-logo'>
                            <Image preview={false} src={confDivItem?.imageurl} alt='div' />
                          </div>
                          <span className='dsa-div-name'>{confDivItem?.name || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Right: Timer + Bid Panel ── */}
            <div className='dsa-sidebar'>
              {/* Timer Card */}
              <div className='dsa-timer-card'>
                <div className='dsa-timer-label'>Time Remaining</div>
                <SpotAuctionTimer
                  spotAuctionEnd={currentLeague?.spotAuctionEnd}
                  onTimerFinish={setIsTimerFinished}
                />
              </div>

              {/* Bid Card */}
              {!isTimerFinished && (
                <div className='dsa-bid-card'>
                  <div className='dsa-bid-card-label'>Your Bid</div>
                  <div className='dsa-bid-input-row'>
                    <div className='dsa-input-wrap'>
                      <img className='dsa-input-icon' src={sampointslogo} alt='SP' />
                      <input
                        className='dsa-bid-input'
                        placeholder='Enter amount'
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        type='number'
                      />
                    </div>
                    <Button
                      loading={loading}
                      onClick={handleMakeBid}
                      className='dsa-submit-btn'
                      type='primary'
                      disabled={isTimerFinished || !bidAmount}
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>
              )}

              {/* My Draft Spot Card */}
              {myDraftSpot && (
                <div className='dsa-myspot-card'>
                  <div className='dsa-myspot-label'>Your Draft Spot</div>
                  <div className='dsa-myspot-content'>
                    <div className='dsa-myspot-pick'>
                      <span className='dsa-myspot-number'>{myDraftSpot?.position}</span>
                    </div>
                    <div className='dsa-myspot-info'>
                      <div className='dsa-myspot-team-row'>
                        <div className='dsa-team-logo dsa-team-logo-sm'>
                          <Image preview={false} src={myDraftSpot?.team?.logo || teamlogo} alt='team' />
                        </div>
                        <span className='dsa-myspot-username'>{myDraftSpot?.team?.user?.userName}</span>
                      </div>
                      <div className='dsa-myspot-bid-row'>
                        <img className='dsa-sp-icon' src={sampointslogo} alt='SP' />
                        <span className='dsa-myspot-bid'>{myDraftSpot?.bidamount?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timer Finished Banner */}
              {isTimerFinished && (
                <div className='dsa-ended-card'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ef4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <line x1='15' y1='9' x2='9' y2='15' />
                    <line x1='9' y1='9' x2='15' y2='15' />
                  </svg>
                  <span>Auction has ended</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DraftAuction
