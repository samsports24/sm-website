import React, { useState, useEffect } from 'react'
import { Modal, Input, notification, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { attachToken, privateAPI, serverUrls } from '../../config/constants'
import { joinLeagueFromPlatform, getUserLeagues } from '../../redux/actions/leagueActions'
import { getUser } from '../../redux/actions/authActions'
import store from '../../redux/store'

// Soccer backend base (shared `token` works as Bearer, same as SportHub does)
const SOCCER_API =
  (serverUrls.find((s) => s.key === 'eleven_fc') || {}).url ||
  process.env.REACT_APP_SOCCER_API_URL ||
  'https://soccerbackend.samsports.io'

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0 SP'
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B SP`
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M SP`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K SP`
  return `${val} SP`
}

const formatSamPoints = (val) => {
  if (!val && val !== 0) return '0'
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(0)}B`
  if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
  return `${val}`
}

const JoinLeagueModal = ({ button, sport, frontEndUrl }) => {
  // Soccer onboarding must browse/join on the soccer backend — not the football
  // platform. Without this the modal always listed NFL leagues for soccer users.
  const isSoccer = sport === 'eleven_fc' || sport === 'soccer'
  const [visible, setVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(null)
  const [joinedData, setJoinedData] = useState(null)
  const [teamNamePrompt, setTeamNamePrompt] = useState(null) // league object awaiting team name
  const [teamNameInput, setTeamNameInput] = useState('')
  const userLeagues = useSelector((state) => state.league?.userLeagues) || []
  const userId = useSelector((state) => state.user?.userDetails?._id)

  useEffect(() => {
    if (visible) {
      fetchLeagues()
      setJoinedData(null)
    }
  }, [visible])

  const fetchLeagues = async () => {
    setLoading(true)
    try {
      if (isSoccer) {
        // Soccer backend: list all public/joinable leagues
        const token = localStorage.getItem('token')
        const res = await axios.get(`${SOCCER_API}/api/v1/leagues/public`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const list = res?.data?.data
        setLeagues(Array.isArray(list) ? list : [])
      } else {
        attachToken()
        const res = await privateAPI.get('/league/get', { params: { allleagues: true } })
        const data = res?.data?.data
        const available = [
          ...(data?.nonUserLeagues || []),
          ...(data?.futureLeagues || []),
        ]
        setLeagues(available)
      }
    } catch (err) {
      console.error('Failed to load leagues:', err)
    }
    setLoading(false)
  }

  const isAlreadyJoined = (league) => {
    if (league.isJoined) return true // soccer backend supplies this directly
    return userLeagues.some((ul) => String(ul._id) === String(league._id))
      || (league.users && league.users.some((uid) => String(uid) === String(userId)))
  }

  const handleJoin = (league) => {
    if (isAlreadyJoined(league)) {
      notification.warning({
        message: 'Already a Member',
        description: 'You already have a team in this league. You cannot join the same league twice.',
        duration: 4,
      })
      return
    }
    // Show team name prompt before joining
    setTeamNamePrompt(league)
    setTeamNameInput('')
  }

  const confirmJoin = async () => {
    const league = teamNamePrompt
    if (!league) return
    const trimmedName = teamNameInput.trim()
    if (!trimmedName) {
      notification.warning({ message: 'Please enter a team name', duration: 2 })
      return
    }
    setJoining(league._id)
    setTeamNamePrompt(null)
    try {
      if (isSoccer) {
        // Join on the soccer backend so the team is created in the right sport.
        const token = localStorage.getItem('token')
        const res = await axios.post(
          `${SOCCER_API}/api/v1/leagues/join`,
          { leagueId: league._id, teamName: trimmedName },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        const rd = res?.data?.data || {}
        store.dispatch(getUser())
        getUserLeagues()
        setJoinedData({
          isSoccer: true,
          leagueName: rd.leagueName || league.name,
          teamName: rd.teamName || trimmedName,
          samPoints: rd.startingSamPoints || league.startingSamPoints || 0,
        })
        setJoining(null)
        return
      }

      const res = await joinLeagueFromPlatform({ leagueId: league._id, teamName: trimmedName })
      const responseData = res?.data?.data
      store.dispatch(getUser())
      getUserLeagues()

      // Show the salary cap / SamPoints confirmation
      setJoinedData({
        leagueName: responseData?.leagueName || league.name,
        teamName: responseData?.teamName || trimmedName,
        salaryCap: responseData?.salaryCap || league.salaryCap || 301200000,
        samPoints: responseData?.samPoints || league.startingSamPoints || 300000000,
        preAuctionPoints: responseData?.preAuctionPoints || 1000000,
        capCeiling: responseData?.capCeiling || league.capCeiling || 301200000,
        capFloor: responseData?.capFloor || league.capFloor || 271080000,
        draftPositionMode: responseData?.draftPositionMode || 'auction',
      })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to join league'
      if (msg.toLowerCase().includes('already')) {
        notification.warning({
          message: 'Already a Member',
          description: msg,
          duration: 4,
        })
      } else {
        notification.error({ message: msg, duration: 3 })
      }
    }
    setJoining(null)
  }

  const handleEnterLeague = () => {
    setVisible(false)
    setJoinedData(null)
    if (isSoccer) {
      const token = localStorage.getItem('token')
      const dest = frontEndUrl || process.env.REACT_APP_SOCCER_URL || 'https://football.samsports.io'
      window.location.href = token ? `${dest}/war-room?token=${encodeURIComponent(token)}` : dest
      return
    }
    window.location.href = '/dashboard'
  }

  const filtered = leagues.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leagueId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div onClick={() => setVisible(true)}>{button}</div>
      <Modal
        open={visible}
        onCancel={() => { setVisible(false); setJoinedData(null); setTeamNamePrompt(null); setTeamNameInput('') }}
        footer={null}
        width={560}
        title={null}
        closable
        centered
        className="join-league-modal"
        bodyStyle={{
          background: 'linear-gradient(145deg, #0C1222, #111827)',
          borderRadius: '16px',
          padding: 0,
        }}
        style={{ top: 20 }}
        closeIcon={<span style={{ color: '#9CA3AF', fontSize: 16 }}>✕</span>}
      >
        <style>{`
          .join-league-modal .ant-modal-content {
            background: linear-gradient(145deg, #0C1222, #111827) !important;
            border: 1px solid rgba(34,197,94,0.15) !important;
            border-radius: 16px !important;
            padding: 0 !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important;
          }
          .join-league-modal .ant-modal-body {
            padding: 0 !important;
          }
          .join-league-modal .ant-modal-close {
            top: 16px !important;
            right: 16px !important;
          }
          .join-league-modal .ant-input-affix-wrapper {
            background: rgba(0,0,0,0.35) !important;
            border: 1px solid rgba(110,105,128,0.2) !important;
            border-radius: 10px !important;
            padding: 10px 14px !important;
          }
          .join-league-modal .ant-input-affix-wrapper .ant-input {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            color: #fff !important;
            font-size: 14px !important;
          }
          .join-league-modal .ant-input-affix-wrapper:focus,
          .join-league-modal .ant-input-affix-wrapper-focused {
            border-color: rgba(34,197,94,0.4) !important;
            box-shadow: 0 0 0 2px rgba(34,197,94,0.1) !important;
          }
          .join-league-modal .ant-input {
            background: rgba(0,0,0,0.35) !important;
            border: 1px solid rgba(110,105,128,0.2) !important;
            border-radius: 10px !important;
            color: #fff !important;
            font-size: 14px !important;
            padding: 10px 14px !important;
          }
          .join-league-modal .ant-input::placeholder,
          .join-league-modal .ant-input-affix-wrapper .ant-input::placeholder {
            color: rgba(255,255,255,0.3) !important;
          }
          .join-league-modal .ant-input-prefix {
            color: rgba(255,255,255,0.3) !important;
          }
          .join-league-modal .ant-input:focus,
          .join-league-modal .ant-input-focused {
            border-color: rgba(34,197,94,0.4) !important;
            box-shadow: 0 0 0 2px rgba(34,197,94,0.1) !important;
          }
          .jlm-row:hover {
            background: rgba(34,197,94,0.06) !important;
            border-color: rgba(34,197,94,0.2) !important;
          }
          .jlm-scrollbar::-webkit-scrollbar { width: 4px; }
          .jlm-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .jlm-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        `}</style>

        {/* ═══ TEAM NAME PROMPT — shown before joining a league ═══ */}
        {teamNamePrompt && !joinedData ? (
          <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(59,130,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid rgba(59,130,246,0.3)',
            }}>
              <span style={{ fontSize: 28 }}>{isSoccer ? '⚽' : '🏈'}</span>
            </div>

            <h2 style={{
              color: '#fff', fontFamily: "'Rajdhani', sans-serif",
              fontSize: 22, fontWeight: 700, margin: '0 0 4px',
            }}>
              Name Your Team
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 6px' }}>
              Joining <span style={{ color: '#22C55E', fontWeight: 600 }}>{teamNamePrompt.name}</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 24px' }}>
              Choose a name for your franchise. You can change it later.
            </p>

            <Input
              placeholder="e.g. Thunder Hawks"
              value={teamNameInput}
              onChange={(e) => setTeamNameInput(e.target.value)}
              onPressEnter={() => teamNameInput.trim() && confirmJoin()}
              style={{ marginBottom: 16, textAlign: 'center', fontSize: 16, padding: '12px 14px' }}
              maxLength={30}
              autoFocus
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setTeamNamePrompt(null)}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}
              >
                Back
              </button>
              <button
                onClick={confirmJoin}
                disabled={!teamNameInput.trim()}
                style={{
                  flex: 2,
                  background: teamNameInput.trim()
                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                    : 'rgba(34,197,94,0.15)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  cursor: teamNameInput.trim() ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  boxShadow: teamNameInput.trim() ? '0 4px 16px rgba(34,197,94,0.3)' : 'none',
                }}
              >
                Join League
              </button>
            </div>
          </div>
        ) : null}

        {/* ═══ SUCCESS SCREEN, shows salary cap & SamPoints after joining ═══ */}
        {joinedData && !teamNamePrompt ? (
          <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid rgba(34,197,94,0.3)',
            }}>
              <span style={{ fontSize: 28, color: '#22C55E' }}>✓</span>
            </div>

            <h2 style={{
              color: '#fff', fontFamily: "'Rajdhani', sans-serif",
              fontSize: 22, fontWeight: 700, margin: '0 0 4px',
            }}>
              Welcome to {joinedData.leagueName}!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 24px' }}>
              Your team <span style={{ color: '#22C55E', fontWeight: 600 }}>{joinedData.teamName}</span> is ready to compete
            </p>

            {!joinedData.isSoccer && (
            <>
            {/* Economy Info Cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
              marginBottom: 16,
            }}>
              {/* Salary Cap Card */}
              <div style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 12, padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)',
                  marginBottom: 6,
                }}>
                  Salary Cap
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#22C55E',
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {formatCurrency(joinedData.salaryCap)}
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  Player contracts limit
                </div>
              </div>

              {/* Main Draft SamPoints Card */}
              <div style={{
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 12, padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)',
                  marginBottom: 6,
                }}>
                  Draft Budget
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#3B82F6',
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {formatSamPoints(joinedData.samPoints)} SP
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  Main player draft only
                </div>
              </div>

              {/* Pre-Auction Draft Points Card */}
              <div style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: 12, padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)',
                  marginBottom: 6,
                }}>
                  Pick Auction
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#A855F7',
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {formatSamPoints(joinedData.preAuctionPoints)} SP
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4,
                }}>
                  Draft position bids
                </div>
              </div>
            </div>

            {/* Rules Note */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '12px 14px',
              textAlign: 'left', marginBottom: 20,
              fontSize: 11, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontSize: 11 }}>
                Point Rules:
              </div>
              <span style={{ color: '#3B82F6', fontWeight: 700 }}>300M SP</span>, Only for the main player draft. Cannot be used for the Draft Pick Auction.
              <br />
              <span style={{ color: '#A855F7', fontWeight: 700 }}>1M SP</span>, Only for the Draft Pick Auction (bidding on draft position). Non-transferable, non-earnable, and cannot be purchased.
              <br />
              If your 1M runs out, you can buy extra SamPoints, but the 300M draft budget stays locked.
            </div>
            </>
            )}

            <button
              onClick={handleEnterLeague}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '13px 24px', fontSize: 15, fontWeight: 700,
                fontFamily: "'Rajdhani', sans-serif",
                cursor: 'pointer', letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                transition: 'all 0.2s',
              }}
            >
              Enter League Dashboard
            </button>
          </div>
        ) : null}

        {/* ═══ LEAGUE LIST SCREEN ═══ */}
        {!joinedData && !teamNamePrompt ? (
          <>
            <div style={{ padding: '28px 24px 0' }}>
              <h2 style={{
                color: '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                margin: '0 0 4px',
                letterSpacing: '0.5px',
              }}>
                Find & Join a League
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 20px' }}>
                Search available leagues and join the competition
              </p>

              <Input
                prefix={<SearchOutlined />}
                placeholder="Search by league name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
              />
            </div>

            <div className="jlm-scrollbar" style={{
              maxHeight: 380,
              overflowY: 'auto',
              padding: '0 24px 24px',
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 14,
                }}>
                  {searchTerm ? 'No leagues match your search' : 'No available leagues found'}
                </div>
              ) : (
                filtered.map((league) => {
                  const joined = isAlreadyJoined(league)
                  const cap = league.salaryCap || 301200000
                  const sp = league.startingSamPoints || 300000000
                  return (
                    <div
                      key={league._id}
                      className="jlm-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        marginBottom: 8,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 15,
                          fontFamily: "'Rajdhani', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                          {league.leagueLogo ? (
                            <img
                              src={league.leagueLogo}
                              alt=""
                              style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: 'rgba(34,197,94,0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              color: '#22C55E',
                              fontWeight: 700,
                            }}>
                              {league.name?.[0]?.toUpperCase() || 'L'}
                            </span>
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {league.name}
                          </span>
                          {league.leagueType === 'private' && (
                            <span style={{
                              fontSize: 9,
                              background: 'rgba(239,68,68,0.12)',
                              color: '#EF4444',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0,
                            }}>
                              Private
                            </span>
                          )}
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.35)',
                          fontSize: 12,
                          marginTop: 3,
                          paddingLeft: 32,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}>
                          {league.leagueId && (
                            <span style={{ color: 'rgba(34,197,94,0.7)', fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px' }}>
                              {league.leagueId}
                            </span>
                          )}
                          <span>{league.teams?.length || 0}/{league.numberOfTeams || '?'} teams</span>
                          {league.draftType && <span>· {league.draftType} draft</span>}
                          <span style={{ color: 'rgba(34,197,94,0.6)' }}>· Cap {formatCurrency(cap)}</span>
                          <span style={{ color: 'rgba(59,130,246,0.6)' }}>· {formatSamPoints(sp)} SP</span>
                          <span style={{ color: 'rgba(168,85,247,0.5)' }}>· 1M Pick Auction</span>
                        </div>
                      </div>
                      {joined ? (
                        <span style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.4)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          padding: '7px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                          flexShrink: 0,
                          marginLeft: 12,
                        }}>
                          Joined
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(league)}
                          disabled={joining === league._id}
                          style={{
                            background: joining === league._id
                              ? 'rgba(34,197,94,0.15)'
                              : 'linear-gradient(135deg, #22C55E, #16A34A)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Rajdhani', sans-serif",
                            cursor: joining === league._id ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            marginLeft: 12,
                            boxShadow: joining === league._id ? 'none' : '0 2px 8px rgba(34,197,94,0.25)',
                          }}
                        >
                          {joining === league._id ? 'Joining...' : 'Join'}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : null}
      </Modal>
    </>
  )
}

export default JoinLeagueModal
