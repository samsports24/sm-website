import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { message, Modal } from 'antd'
import {
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  PauseCircleOutlined,
  CrownOutlined,
  RobotOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import {
  initiateNoConfidence,
  castGovernanceVote,
  nominateForCommissioner,
  voteInElection,
  startElectionVoting,
  transferCommissioner,
  proposeLeaguePause,
  getActiveVotes,
  getGovernanceHistory,
  getCommissionerInfo,
} from '../../redux/actions/governanceActions'
import { attachToken, privateAPI } from '../../config/constants'
import { soccerAPI, attachSoccerToken } from '../../soccer/config/constants'

/* ═══════════════════════════════════════════════════════════
   HELPER, Time remaining
   ═══════════════════════════════════════════════════════════ */
const timeRemaining = (deadline) => {
  if (!deadline) return ''
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`
  return `${hrs}h ${mins}m`
}

/* ═══════════════════════════════════════════════════════════
   AI COMMISSIONER BANNER
   ═══════════════════════════════════════════════════════════ */
const AICommissionerBanner = ({ info }) => {
  if (!info?.aiCommissionerActive) return null
  const since = info.aiCommissionerSince ? new Date(info.aiCommissionerSince).toLocaleDateString() : ''
  return (
    <div className="wr-gov-ai-banner">
      <RobotOutlined className="wr-gov-ai-icon" />
      <div className="wr-gov-ai-text">
        <div className="wr-gov-ai-title">AI COMMISSIONER ACTIVE</div>
        <div className="wr-gov-ai-sub">
          Full league powers in effect since {since}. An election is underway to appoint a new commissioner.
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMMISSIONER INFO CARD
   ═══════════════════════════════════════════════════════════ */
const CommissionerCard = ({ info, onTransfer, isCommissioner }) => {
  const [transferTo, setTransferTo] = useState('')
  const [showTransfer, setShowTransfer] = useState(false)

  if (!info) return null

  return (
    <div className="wr-gov-card wr-gov-commissioner-card">
      <div className="wr-gov-card-header">
        <CrownOutlined className="wr-gov-card-icon" style={{ color: '#F59E0B' }} />
        <span>Commissioner</span>
      </div>
      <div className="wr-gov-commissioner-info">
        {info.aiCommissionerActive ? (
          <div className="wr-gov-commissioner-ai">
            <RobotOutlined /> AI Commissioner
          </div>
        ) : info.mainCommissioner ? (
          <div className="wr-gov-commissioner-name">
            {info.mainCommissioner.firstName} {info.mainCommissioner.lastName}
          </div>
        ) : (
          <div className="wr-gov-commissioner-name wr-gov-text-dim">No commissioner assigned</div>
        )}
      </div>
      {isCommissioner && !info.aiCommissionerActive && (
        <>
          <button className="wr-gov-action-btn wr-gov-transfer-btn" onClick={() => setShowTransfer(!showTransfer)}>
            <UserSwitchOutlined /> Transfer Commissioner
          </button>
          {showTransfer && (
            <div className="wr-gov-transfer-form">
              <input
                className="wr-gov-input"
                placeholder="Enter user ID to transfer to..."
                value={transferTo}
                onChange={e => setTransferTo(e.target.value)}
              />
              <button
                className="wr-gov-submit-btn"
                onClick={() => {
                  if (!transferTo.trim()) return message.warning('Enter a user ID')
                  onTransfer(transferTo.trim())
                  setTransferTo('')
                  setShowTransfer(false)
                }}
              >
                <SendOutlined /> Confirm Transfer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE VOTE CARD
   ═══════════════════════════════════════════════════════════ */
const VoteCard = ({ vote, userId, onCastVote }) => {
  const isNoConf = vote.voteType === 'no_confidence'
  const isPause = vote.voteType === 'league_pause'
  const userVote = vote.votes?.find(v => v.user === userId || v.user?._id === userId)
  const hasVoted = !!userVote

  const yesCount = vote.votes?.filter(v => v.vote === 'yes').length || 0
  const noCount = vote.votes?.filter(v => v.vote === 'no').length || 0
  const abstainCount = vote.votes?.filter(v => v.vote === 'abstain').length || 0
  const total = vote.totalEligibleVoters || 1
  const threshold = isNoConf ? '50% + 1' : '66%'

  return (
    <div className="wr-gov-card wr-gov-vote-card">
      <div className="wr-gov-card-header">
        {isNoConf ? (
          <><ExclamationCircleOutlined className="wr-gov-card-icon" style={{ color: '#EF4444' }} /> Vote of No Confidence</>
        ) : (
          <><PauseCircleOutlined className="wr-gov-card-icon" style={{ color: '#EAB308' }} /> League Pause Vote</>
        )}
        <span className="wr-gov-vote-timer">
          <ClockCircleOutlined /> {timeRemaining(vote.votingClosesAt)}
        </span>
      </div>

      <div className="wr-gov-vote-bar">
        <div className="wr-gov-vote-bar-fill wr-gov-yes" style={{ width: `${(yesCount / total) * 100}%` }} />
        <div className="wr-gov-vote-bar-fill wr-gov-no" style={{ width: `${(noCount / total) * 100}%` }} />
      </div>

      <div className="wr-gov-vote-stats">
        <span className="wr-gov-stat-yes"><CheckCircleFilled /> {yesCount} Yes</span>
        <span className="wr-gov-stat-no"><CloseCircleFilled /> {noCount} No</span>
        <span className="wr-gov-stat-abstain"><MinusCircleFilled /> {abstainCount} Abstain</span>
        <span className="wr-gov-stat-total"><TeamOutlined /> {total} Eligible</span>
      </div>

      <div className="wr-gov-vote-threshold">Requires {threshold} to pass</div>

      {!hasVoted && vote.status === 'active' ? (
        <div className="wr-gov-vote-actions">
          <button className="wr-gov-vote-btn wr-gov-vote-yes" onClick={() => onCastVote(vote._id, 'yes')}>
            <CheckCircleFilled /> Yes
          </button>
          <button className="wr-gov-vote-btn wr-gov-vote-no" onClick={() => onCastVote(vote._id, 'no')}>
            <CloseCircleFilled /> No
          </button>
          <button className="wr-gov-vote-btn wr-gov-vote-abstain" onClick={() => onCastVote(vote._id, 'abstain')}>
            <MinusCircleFilled /> Abstain
          </button>
        </div>
      ) : hasVoted ? (
        <div className="wr-gov-voted-badge">
          You voted: <strong>{userVote.vote?.toUpperCase()}</strong>
        </div>
      ) : null}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ELECTION CARD
   ═══════════════════════════════════════════════════════════ */
const ElectionCard = ({ vote, userId, onNominate, onVoteCandidate }) => {
  const [statement, setStatement] = useState('')
  const isNomination = vote.status === 'nomination_phase'
  const isVoting = vote.status === 'election_active'
  const userNominated = vote.candidates?.some(c => (c.user === userId || c.user?._id === userId))
  const userElectionVote = vote.electionVotes?.find(v => (v.voter === userId || v.voter?._id === userId))

  return (
    <div className="wr-gov-card wr-gov-election-card">
      <div className="wr-gov-card-header">
        <CrownOutlined className="wr-gov-card-icon" style={{ color: '#22C55E' }} />
        Commissioner Election
        <span className="wr-gov-vote-timer">
          <ClockCircleOutlined />
          {isNomination
            ? `Nominations: ${timeRemaining(vote.nominationClosesAt)}`
            : `Voting: ${timeRemaining(vote.votingClosesAt)}`
          }
        </span>
      </div>

      <div className="wr-gov-election-phase">
        <span className={`wr-gov-phase-badge ${isNomination ? 'active' : 'done'}`}>1. Nominations</span>
        <span className="wr-gov-phase-arrow">&rarr;</span>
        <span className={`wr-gov-phase-badge ${isVoting ? 'active' : ''}`}>2. Voting</span>
      </div>

      {/* Candidates list */}
      <div className="wr-gov-candidates">
        <div className="wr-gov-candidates-title">
          Candidates ({vote.candidates?.length || 0})
        </div>
        {vote.candidates?.length === 0 ? (
          <div className="wr-gov-no-candidates">No candidates yet</div>
        ) : (
          vote.candidates?.map((c, i) => (
            <div key={i} className="wr-gov-candidate-row">
              <div className="wr-gov-candidate-info">
                <div className="wr-gov-candidate-rank">#{i + 1}</div>
                <div>
                  <div className="wr-gov-candidate-name">
                    {c.user?.firstName || c.user?.username || `User ${String(c.user).slice(-6)}`}
                  </div>
                  {c.statement && <div className="wr-gov-candidate-statement">{c.statement}</div>}
                </div>
              </div>
              {isVoting && !userElectionVote && (
                <button
                  className="wr-gov-vote-btn wr-gov-vote-candidate"
                  onClick={() => onVoteCandidate(vote._id, c.user?._id || c.user)}
                >
                  Vote
                </button>
              )}
              {isVoting && c.votesReceived > 0 && (
                <span className="wr-gov-candidate-votes">{c.votesReceived} votes</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Nominate self */}
      {isNomination && !userNominated && (
        <div className="wr-gov-nominate-form">
          <textarea
            className="wr-gov-textarea"
            placeholder="Why should you be commissioner? (max 500 chars)"
            value={statement}
            onChange={e => setStatement(e.target.value.slice(0, 500))}
            rows={3}
          />
          <button
            className="wr-gov-submit-btn wr-gov-nominate-btn"
            onClick={() => {
              onNominate(vote._id, statement)
              setStatement('')
            }}
          >
            <CrownOutlined /> Nominate Myself
          </button>
        </div>
      )}

      {isNomination && userNominated && (
        <div className="wr-gov-voted-badge">You are a candidate in this election</div>
      )}

      {userElectionVote && (
        <div className="wr-gov-voted-badge">You have voted in this election</div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HELPER, Fetch all active sales from every backend
   ═══════════════════════════════════════════════════════════ */
const fetchAllActiveSales = async () => {
  const results = await Promise.allSettled([
    (() => { attachToken(); return privateAPI.get('/exchange/listings') })(),
    (() => { attachSoccerToken(); return soccerAPI.get('/api/v1/exchange/listings') })(),
    (() => { attachToken(); return privateAPI.get('/exchange/empire/listings') })(),
    (() => { attachSoccerToken(); return soccerAPI.get('/api/v1/exchange/empire/listings') })(),
  ])

  const extract = (r) => {
    if (r.status !== 'fulfilled') return []
    const d = r.value?.data?.data
    return Array.isArray(d) ? d : (d?.listings || [])
  }

  const nflListings = extract(results[0]).map(l => ({ ...l, _type: 'team', _sport: l.teamSnapshot?.sport?.toLowerCase() || 'nfl' }))
  const soccerListings = extract(results[1]).map(l => ({ ...l, _type: 'team', _sport: l.teamSnapshot?.sport?.toLowerCase() || 'soccer' }))
  const nflEmpire = extract(results[2]).map(e => ({ ...e, _type: 'empire', _sport: 'nfl' }))
  const soccerEmpire = extract(results[3]).map(e => ({ ...e, _type: 'empire', _sport: 'soccer' }))

  return [...nflListings, ...soccerListings, ...nflEmpire, ...soccerEmpire]
}

const fmtSP = (val) => {
  if (!val && val !== 0) return '0 SP'
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M SP`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K SP`
  return `${val.toLocaleString()} SP`
}

const SPORT_BADGE = {
  nfl: { icon: '🏈', color: '#22C55E', label: 'A.Football' },
  soccer: { icon: '⚽', color: '#3B82F6', label: 'Soccer' },
  nba: { icon: '🏀', color: '#F59E0B', label: 'NBA' },
  nhl: { icon: '🏒', color: '#8B5CF6', label: 'NHL' },
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE SALES SECTION, Groups by owner, cross-league
   ═══════════════════════════════════════════════════════════ */
const ActiveSalesSection = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchAllActiveSales().then(all => {
      if (!mounted) return
      setSales(all)
      setLoading(false)
    }).catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="wr-gov-section">
        <div className="wr-gov-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined /> Active Sales Across All Leagues
        </div>
        <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading sales...</div>
      </div>
    )
  }

  if (!sales.length) {
    return (
      <div className="wr-gov-section">
        <div className="wr-gov-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined /> Active Sales Across All Leagues
        </div>
        <div style={{
          textAlign: 'center', padding: '28px 16px',
          background: 'rgba(255,255,255,0.02)', borderRadius: 12,
          border: '1px solid rgba(110,105,128,0.1)',
        }}>
          <ShopOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.15)', display: 'block', marginBottom: 8 }} />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No teams or empires currently for sale</div>
        </div>
      </div>
    )
  }

  // Group by seller, for team listings use seller, for empire use seller
  const grouped = {}
  sales.forEach(s => {
    const sellerId = s.seller?._id || s.seller || s.user?._id || s.user || 'unknown'
    const sellerName = s.sellerName || s.seller?.userName || s.user?.userName || 'Unknown'
    if (!grouped[sellerId]) {
      grouped[sellerId] = { sellerId, sellerName, teams: [], empires: [] }
    }
    if (s._type === 'empire') {
      grouped[sellerId].empires.push(s)
    } else {
      grouped[sellerId].teams.push(s)
    }
  })

  const owners = Object.values(grouped).sort((a, b) =>
    (b.teams.length + b.empires.length) - (a.teams.length + a.empires.length)
  )

  return (
    <div className="wr-gov-section">
      <div className="wr-gov-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShopOutlined /> Active Sales Across All Leagues
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif",
        }}>
          {sales.length} listing{sales.length !== 1 ? 's' : ''} from {owners.length} owner{owners.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {owners.map(owner => {
          const allItems = [...owner.teams, ...owner.empires]
          const totalValue = allItems.reduce((s, item) => {
            if (item._type === 'empire') return s + (item.askingPrice || item.bundlePrice || 0)
            return s + (item.askingPrice || 0)
          }, 0)
          const hasEmpire = owner.empires.length > 0
          const empireSale = owner.empires[0]

          return (
            <div key={owner.sellerId} style={{
              background: hasEmpire
                ? 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(20,28,45,0.8) 100%)'
                : 'rgba(20,28,45,0.8)',
              border: hasEmpire
                ? '1px solid rgba(245,158,11,0.2)'
                : '1px solid rgba(110,105,128,0.15)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Owner Header */}
              <div style={{
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(110,105,128,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: hasEmpire ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)',
                    border: `1px solid ${hasEmpire ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {hasEmpire ? '👑' : '🏷️'}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700,
                      color: '#fff',
                    }}>
                      {owner.sellerName}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
                      {hasEmpire
                        ? `Empire Sale, ${empireSale.saleMode === 'bundle' ? 'Bundle' : 'Individual'}`
                        : `${owner.teams.length} team${owner.teams.length !== 1 ? 's' : ''} listed`
                      }
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700,
                    color: '#22C55E',
                  }}>
                    {fmtSP(totalValue)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', sans-serif" }}>
                    total asking
                  </div>
                </div>
              </div>

              {/* Team rows */}
              <div style={{ padding: '8px 12px' }}>
                {owner.teams.map((t, idx) => {
                  const sportBadge = SPORT_BADGE[t._sport] || SPORT_BADGE.nfl
                  const snap = t.teamSnapshot || {}
                  return (
                    <div key={t._id || idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 8px',
                      borderBottom: idx < owner.teams.length - 1 ? '1px solid rgba(110,105,128,0.08)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        {snap.logo ? (
                          <img src={snap.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: `${sportBadge.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                          }}>
                            {sportBadge.icon}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
                            color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {snap.name || 'Unknown Team'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: sportBadge.color,
                              padding: '1px 5px', borderRadius: 3,
                              background: `${sportBadge.color}15`, border: `1px solid ${sportBadge.color}25`,
                              textTransform: 'uppercase', letterSpacing: 0.3,
                            }}>
                              {sportBadge.label}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                              {snap.wins || 0}W-{snap.losses || 0}L
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                        color: '#fff', whiteSpace: 'nowrap',
                      }}>
                        {fmtSP(t.askingPrice)}
                      </div>
                    </div>
                  )
                })}

                {/* Empire sale row if bundle mode */}
                {hasEmpire && empireSale.saleMode === 'bundle' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 8px',
                    background: 'rgba(245,158,11,0.05)', borderRadius: 8, marginTop: 4,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>👑</span>
                      <div>
                        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
                          Full Empire Bundle
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                          {empireSale.teams?.length || '?'} teams, all-or-nothing
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: '#F59E0B',
                    }}>
                      {fmtSP(empireSale.askingPrice || empireSale.bundlePrice)}
                    </div>
                  </div>
                )}

                {/* Empire individual mode note */}
                {hasEmpire && empireSale.saleMode !== 'bundle' && (
                  <div style={{
                    padding: '8px 10px', marginTop: 4,
                    background: 'rgba(139,92,246,0.06)', borderRadius: 8,
                    fontSize: 11, color: 'rgba(255,255,255,0.45)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 13 }}>📦</span>
                    Empire Individual, each team sold separately at market value
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

/* ═══════════════════════════════════════════════════════════
   MAIN GOVERNANCE SECTION
   ═══════════════════════════════════════════════════════════ */
const SPORT_ICONS = {
  soccer: '⚽', football: '🏈', nfl: '🏈',
  basketball: '🏀', nba: '🏀',
  baseball: '⚾', mlb: '⚾',
  hockey: '🏒', nhl: '🏒',
}

const GovernanceSection = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user?.userDetails)
  const league = useSelector(state => state.league?.currentLeague || state.user?.userDetails?.team?.currentLeague)
  const { activeVotes, activeVotesLoading, history, commissionerInfo } = useSelector(state => state.governance || {})

  // Dark modal state variables
  const [noConfModal, setNoConfModal] = useState(false)
  const [pauseModal, setPauseModal] = useState(false)
  const [transferModal, setTransferModal] = useState({ open: false, transferToId: null })

  const leagueId = league?._id || league
  const userId = user?._id
  const leagueName = league?.name || commissionerInfo?.leagueName || ''
  const leagueSport = league?.sport || commissionerInfo?.sport || ''
  const sportIcon = SPORT_ICONS[leagueSport?.toLowerCase()] || '🏆'

  // Check if current user is commissioner
  const isCommissioner =
    commissionerInfo?.mainCommissioner?._id === userId ||
    commissionerInfo?.mainCommissioner === userId

  useEffect(() => {
    if (leagueId) {
      dispatch(getActiveVotes(leagueId))
      dispatch(getCommissionerInfo(leagueId))
      dispatch(getGovernanceHistory(leagueId))
    }
  }, [leagueId, dispatch])

  // Filter vote types
  const noConfVotes = activeVotes?.filter(v => v.voteType === 'no_confidence' && v.status === 'active') || []
  const pauseVotes = activeVotes?.filter(v => v.voteType === 'league_pause' && v.status === 'active') || []
  const elections = activeVotes?.filter(v =>
    v.voteType === 'commissioner_election' &&
    (v.status === 'nomination_phase' || v.status === 'election_active')
  ) || []

  const hasActiveNoConf = noConfVotes.length > 0

  /* ── Action Handlers ── */
  // NOTE: initiateNoConfidence, castGovernanceVote, transferCommissioner,
  // proposeLeaguePause, nominateForCommissioner, voteInElection are plain
  // async functions (NOT thunks), so call them directly without dispatch.
  // Only getActiveVotes, getGovernanceHistory, getCommissionerInfo are thunks.

  const handleInitiateNoConfidence = () => setNoConfModal(true)

  const handleProposePause = () => setPauseModal(true)

  const handleCastVote = async (voteId, vote) => {
    await castGovernanceVote(voteId, vote)
    if (leagueId) dispatch(getActiveVotes(leagueId))
  }

  const handleNominate = async (electionId, stmt) => {
    await nominateForCommissioner(electionId, stmt)
    if (leagueId) dispatch(getActiveVotes(leagueId))
  }

  const handleVoteCandidate = async (electionId, candidateId) => {
    await voteInElection(electionId, candidateId)
    if (leagueId) dispatch(getActiveVotes(leagueId))
  }

  const handleTransfer = (transferToId) => {
    setTransferModal({ open: true, transferToId })
  }

  if (!leagueId) {
    return (
      <div className="wr-gov-empty">
        <SafetyCertificateOutlined className="wr-gov-empty-icon" />
        <div className="wr-gov-empty-title">No League Selected</div>
        <div className="wr-gov-empty-sub">Join or select a league to access governance features</div>
      </div>
    )
  }

  return (
    <div className="wr-gov">
      {/* League Context Banner */}
      {leagueName && (
        <div className="wr-gov-league-banner">
          <span className="wr-gov-league-sport-icon">{sportIcon}</span>
          <div className="wr-gov-league-info">
            <div className="wr-gov-league-name">{leagueName}</div>
            <div className="wr-gov-league-sport">{leagueSport?.charAt(0).toUpperCase() + leagueSport?.slice(1)} League</div>
          </div>
        </div>
      )}

      {/* AI Commissioner Banner */}
      <AICommissionerBanner info={commissionerInfo} />

      {/* Commissioner Info */}
      <CommissionerCard
        info={commissionerInfo}
        isCommissioner={isCommissioner}
        onTransfer={handleTransfer}
      />

      {/* Active Sales, Cross-League */}
      <ActiveSalesSection />

      {/* Quick Actions */}
      <div className="wr-gov-actions-row">
        {!hasActiveNoConf && !commissionerInfo?.aiCommissionerActive && !isCommissioner && (
          <button className="wr-gov-action-card" onClick={handleInitiateNoConfidence}>
            <ExclamationCircleOutlined className="wr-gov-action-icon" style={{ color: '#EF4444' }} />
            <div className="wr-gov-action-label">Challenge Commissioner</div>
            <div className="wr-gov-action-desc">Start an anonymous team vote to remove the commissioner. Needs majority (50% + 1) of all teams.</div>
          </button>
        )}
        {isCommissioner && (
          <button className="wr-gov-action-card" onClick={handleProposePause}>
            <PauseCircleOutlined className="wr-gov-action-icon" style={{ color: '#EAB308' }} />
            <div className="wr-gov-action-label">Propose League Pause</div>
            <div className="wr-gov-action-desc">Requires 66% approval</div>
          </button>
        )}
      </div>

      {/* Active Votes */}
      {(noConfVotes.length > 0 || pauseVotes.length > 0) && (
        <div className="wr-gov-section">
          <div className="wr-gov-section-title">Active Votes</div>
          {noConfVotes.map(v => (
            <VoteCard key={v._id} vote={v} userId={userId} onCastVote={handleCastVote} />
          ))}
          {pauseVotes.map(v => (
            <VoteCard key={v._id} vote={v} userId={userId} onCastVote={handleCastVote} />
          ))}
        </div>
      )}

      {/* Active Elections */}
      {elections.length > 0 && (
        <div className="wr-gov-section">
          <div className="wr-gov-section-title">Commissioner Election</div>
          {elections.map(v => (
            <ElectionCard
              key={v._id}
              vote={v}
              userId={userId}
              onNominate={handleNominate}
              onVoteCandidate={handleVoteCandidate}
            />
          ))}
        </div>
      )}

      {/* History */}
      {history?.length > 0 && (
        <div className="wr-gov-section">
          <div className="wr-gov-section-title">Governance History</div>
          <div className="wr-gov-history">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="wr-gov-history-row">
                <div className={`wr-gov-history-status wr-gov-history--${h.status}`}>
                  {h.status === 'executed' || h.status === 'election_complete' ? (
                    <CheckCircleFilled />
                  ) : (
                    <CloseCircleFilled />
                  )}
                </div>
                <div className="wr-gov-history-info">
                  <div className="wr-gov-history-type">
                    {h.voteType === 'no_confidence' && 'No Confidence Vote'}
                    {h.voteType === 'league_pause' && 'League Pause Vote'}
                    {h.voteType === 'commissioner_election' && 'Commissioner Election'}
                    {h.voteType === 'commissioner_transfer' && 'Commissioner Transfer'}
                  </div>
                  <div className="wr-gov-history-detail">
                    {h.executionDetails || `${h.result?.yesVotes || 0} yes / ${h.result?.noVotes || 0} no`}
                  </div>
                </div>
                <div className="wr-gov-history-date">
                  {h.executedAt ? new Date(h.executedAt).toLocaleDateString() : new Date(h.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no activity */}
      {noConfVotes.length === 0 && pauseVotes.length === 0 && elections.length === 0 && !history?.length && (
        <div className="wr-gov-empty-activity">
          <SafetyCertificateOutlined />
          <div>No governance activity yet in this league</div>
        </div>
      )}

      {/* ═══ NO CONFIDENCE MODAL ═══ */}
      <Modal
        open={noConfModal}
        onCancel={() => setNoConfModal(false)}
        footer={null}
        closable={false}
        centered
        width={440}
        wrapClassName="wr-gov-dark-modal wr-gov-dark-modal--danger"
      >
        <div className="wr-gov-modal-inner">
          <div className="wr-gov-modal-header">
            <div className="wr-gov-modal-icon-wrap wr-gov-modal-icon-wrap--danger">
              <ExclamationCircleOutlined style={{ color: '#EF4444' }} />
            </div>
            <div>
              <h2 className="wr-gov-modal-title">Vote of No Confidence</h2>
              <div className="wr-gov-modal-subtitle wr-gov-modal-subtitle--danger">IRREVERSIBLE ACTION</div>
            </div>
          </div>
          <div className="wr-gov-modal-body wr-gov-modal-body--danger">
            <p>
              You are about to start an <strong>anonymous 72-hour vote</strong> to remove the current commissioner.
              Each team gets <strong>one vote</strong>, if a team has multiple owners or assistants, only one vote counts per team.
              Requires <strong>50% + 1</strong> of all teams to pass. Your identity will remain hidden.
            </p>
          </div>
          <div className="wr-gov-modal-footer">
            <button className="wr-gov-modal-btn wr-gov-modal-btn--cancel" onClick={() => setNoConfModal(false)}>
              Cancel
            </button>
            <button className="wr-gov-modal-btn wr-gov-modal-btn--danger" onClick={async () => { await initiateNoConfidence(leagueId); setNoConfModal(false); dispatch(getActiveVotes(leagueId)) }}>
              Start Vote
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══ PAUSE MODAL ═══ */}
      <Modal
        open={pauseModal}
        onCancel={() => setPauseModal(false)}
        footer={null}
        closable={false}
        centered
        width={440}
        wrapClassName="wr-gov-dark-modal wr-gov-dark-modal--warning"
      >
        <div className="wr-gov-modal-inner">
          <div className="wr-gov-modal-header">
            <div className="wr-gov-modal-icon-wrap wr-gov-modal-icon-wrap--warning">
              <PauseCircleOutlined style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h2 className="wr-gov-modal-title">Propose League Pause</h2>
              <div className="wr-gov-modal-subtitle wr-gov-modal-subtitle--warning">LEAGUE-WIDE VOTE</div>
            </div>
          </div>
          <div className="wr-gov-modal-body wr-gov-modal-body--warning">
            <p>
              This will start a <strong>72-hour vote</strong> to pause the league. Requires <strong>66%</strong> of all members to pass. The league will <strong className="success">NOT</strong> be deleted.
            </p>
          </div>
          <div className="wr-gov-modal-footer">
            <button className="wr-gov-modal-btn wr-gov-modal-btn--cancel" onClick={() => setPauseModal(false)}>
              Cancel
            </button>
            <button className="wr-gov-modal-btn wr-gov-modal-btn--warning" onClick={async () => { await proposeLeaguePause(leagueId); setPauseModal(false); dispatch(getActiveVotes(leagueId)) }}>
              Propose Pause
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══ TRANSFER MODAL ═══ */}
      <Modal
        open={transferModal.open}
        onCancel={() => setTransferModal({ open: false, transferToId: null })}
        footer={null}
        closable={false}
        centered
        width={440}
        wrapClassName="wr-gov-dark-modal wr-gov-dark-modal--danger"
      >
        <div className="wr-gov-modal-inner">
          <div className="wr-gov-modal-header">
            <div className="wr-gov-modal-icon-wrap wr-gov-modal-icon-wrap--danger">
              <UserSwitchOutlined style={{ color: '#EF4444' }} />
            </div>
            <div>
              <h2 className="wr-gov-modal-title">Transfer Commissioner</h2>
              <div className="wr-gov-modal-subtitle wr-gov-modal-subtitle--danger">PERMANENT &amp; IRREVERSIBLE</div>
            </div>
          </div>
          <div className="wr-gov-modal-body wr-gov-modal-body--danger">
            <p>
              This is <strong className="danger">immediate and irreversible</strong>. You will lose all commissioner powers permanently.
            </p>
          </div>
          <div className="wr-gov-modal-footer">
            <button className="wr-gov-modal-btn wr-gov-modal-btn--cancel" onClick={() => setTransferModal({ open: false, transferToId: null })}>
              Cancel
            </button>
            <button className="wr-gov-modal-btn wr-gov-modal-btn--danger" onClick={async () => { await transferCommissioner(leagueId, transferModal.transferToId); setTransferModal({ open: false, transferToId: null }); dispatch(getCommissionerInfo(leagueId)) }}>
              Transfer Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GovernanceSection
