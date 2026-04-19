import React, { useEffect, useState, useCallback } from 'react'
import { Spin, Modal, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Pagination from '../components/Pagination'
import { getScheduleByWeek, getWeeklyNflSchedule, getGameDetails, updateWeek } from '../redux'
import { useSelector, useDispatch } from 'react-redux'
import Carousel from 'react-multi-carousel'
import { TiChevronRight } from 'react-icons/ti'
import Player1 from '../assets/player-img-60x60.png'
import { positions } from '../config/constants'
import PlayerAvatar from '../components/PlayerAvatar'

const mapPos = (p) => positions[p] || p

/* ═══════════════════════════════════════════════════════════
   LEAGUE SCORES, Soccer-style matchup rows
   Click team  → team player breakdown
   Click score → H2H player-by-player comparison
   Click player→ stat breakdown popup
   ═══════════════════════════════════════════════════════════ */

const LeagueScore = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const currentLeagueId = useSelector((state) => state?.user?.userDetails?.team?.currentLeague?._id)
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('token')
  !isAuthenticated && navigate('/transactions')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [carouselData, setCarouselData] = useState([])
  const dispatch = useDispatch()

  // Track expanded states: { matchIndex: 'team1' | 'team2' | 'h2h' | null }
  const [expanded, setExpanded] = useState({})
  // Cache game details per match
  const [gameDetailsCache, setGameDetailsCache] = useState({})
  const [detailsLoading, setDetailsLoading] = useState({})

  useEffect(() => {
    getDataByWeek()
  }, [SETTING?.week, currentLeagueId])

  const getDataByWeek = async () => {
    setLoading(true)
    setExpanded({})
    setGameDetailsCache({})
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
    const schedule = await getWeeklyNflSchedule({ week: SETTING?.week })
    setCarouselData(schedule)
    setLoading(false)
  }

  const handlePagination = (page) => {
    dispatch(updateWeek(page))
  }

  // Fetch game details for a match (cached)
  const fetchDetails = useCallback(async (matchIndex, matchData) => {
    if (gameDetailsCache[matchIndex]) return gameDetailsCache[matchIndex]
    setDetailsLoading((p) => ({ ...p, [matchIndex]: true }))
    const d = await getGameDetails({
      team1: matchData?.opponentOne?._id,
      team2: matchData?.opponentTwo?._id,
      week: SETTING?.week,
    })
    setGameDetailsCache((p) => ({ ...p, [matchIndex]: d }))
    setDetailsLoading((p) => ({ ...p, [matchIndex]: false }))
    return d
  }, [SETTING?.week, gameDetailsCache])

  // Toggle expand: clicking the same thing closes it
  const handleExpand = async (matchIndex, type, matchData) => {
    const current = expanded[matchIndex]
    if (current === type) {
      setExpanded((p) => ({ ...p, [matchIndex]: null }))
      return
    }
    setExpanded((p) => ({ ...p, [matchIndex]: type }))
    // Fetch details if not cached
    if (!gameDetailsCache[matchIndex]) {
      await fetchDetails(matchIndex, matchData)
    }
  }

  return (
    <div className='ls-container'>
      <Header />

      {/* ── Page Header ── */}
      <div className='ls-page-header'>
        <div className='ls-page-header-bg' />
        <div className='ls-page-header-content'>
          <div className='ls-page-header-left'>
            <h1 className='ls-page-title'>
              LEAGUE <span>SCORES</span>
            </h1>
            <p className='ls-page-subtitle'>
              Week {SETTING?.week} matchups &amp; results
            </p>
          </div>
          <div className='ls-week-selector'>
            <span className='ls-week-label'>Go to week:</span>
            <Pagination
              title=''
              current={SETTING?.week}
              defaultCurrent={SETTING?.week}
              total={230}
              onChange={handlePagination}
            />
          </div>
        </div>
      </div>

      {/* ── NFL Ticker Carousel ── */}
      {carouselData?.length > 0 && (
        <div className='ls-ticker-wrap'>
          <div className='ls-ticker-carousel'>
            <CarouselComponent data={carouselData} />
          </div>
        </div>
      )}

      {/* ── Matchup List (Soccer-style rows) ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 20px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size='large' />
          </div>
        ) : data?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data?.map((match, index) => (
              <MatchupRow
                key={index}
                match={match}
                index={index}
                expandedType={expanded[index] || null}
                onExpandTeam1={() => handleExpand(index, 'team1', match)}
                onExpandTeam2={() => handleExpand(index, 'team2', match)}
                onExpandH2H={() => handleExpand(index, 'h2h', match)}
                details={gameDetailsCache[index]}
                detailsLoading={detailsLoading[index]}
                week={SETTING?.week}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
            No schedule for this week
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MATCHUP ROW, Single match (soccer-style)
   ═══════════════════════════════════════════════════════════ */
const MatchupRow = ({ match, index, expandedType, onExpandTeam1, onExpandTeam2, onExpandH2H, details, detailsLoading }) => {
  const score1 = parseFloat(match?.scoreOne) || 0
  const score2 = parseFloat(match?.scoreTwo) || 0
  const lead1 = score1 > score2
  const lead2 = score2 > score1

  const getName = (name) => {
    if (!name) return '—'
    const parts = name.split(' ')
    return parts.length > 2 ? `${parts[0]} ${parts[1]}` : name
  }

  const isExpanded = !!expandedType

  return (
    <div style={{
      borderBottom: '1px solid rgba(110,105,128,0.1)',
      background: isExpanded ? 'rgba(20,28,45,0.4)' : 'transparent',
      transition: 'background 0.2s',
    }}>
      {/* ── Main Row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 16px',
        cursor: 'default',
      }}>
        {/* Team 1, Left */}
        <div
          onClick={onExpandTeam1}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', padding: '4px 0',
            opacity: lead2 ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            backgroundImage: `url(${match?.opponentOne?.logo})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            border: '2px solid rgba(110,105,128,0.15)',
          }} />
          <div>
            <div style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
              color: lead1 ? '#fff' : 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
            }}>
              {getName(match?.opponentOne?.name)}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {match?.opponentOne?.name?.split(' ').pop()?.substring(0, 3)?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Score, Center (clickable for H2H) */}
        <div
          onClick={onExpandH2H}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', padding: '6px 20px',
            borderRadius: 8,
            background: expandedType === 'h2h' ? 'rgba(34,197,94,0.08)' : 'transparent',
            border: expandedType === 'h2h' ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 900, minWidth: 40, textAlign: 'right',
            color: lead1 ? '#22C55E' : '#fff',
          }}>
            {score1.toFixed(1)}
          </span>
          <span style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.25)',
            margin: '0 2px',
          }}>
            —
          </span>
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 900, minWidth: 40, textAlign: 'left',
            color: lead2 ? '#22C55E' : '#fff',
          }}>
            {score2.toFixed(1)}
          </span>
        </div>

        {/* Team 2, Right */}
        <div
          onClick={onExpandTeam2}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 12,
            flexDirection: 'row-reverse',
            cursor: 'pointer', padding: '4px 0',
            opacity: lead1 ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            backgroundImage: `url(${match?.opponentTwo?.logo})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            border: '2px solid rgba(110,105,128,0.15)',
          }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
              color: lead2 ? '#fff' : 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
            }}>
              {getName(match?.opponentTwo?.name)}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {match?.opponentTwo?.name?.split(' ').pop()?.substring(0, 3)?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Panel ── */}
      {isExpanded && (
        <div style={{
          padding: '0 16px 16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {detailsLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin size='small' />
            </div>
          ) : expandedType === 'team1' ? (
            <TeamBreakdownPanel
              details={details}
              teamSide='player1'
              teamName={match?.opponentOne?.name}
              teamLogo={match?.opponentOne?.logo}
              score={score1}
            />
          ) : expandedType === 'team2' ? (
            <TeamBreakdownPanel
              details={details}
              teamSide='player2'
              teamName={match?.opponentTwo?.name}
              teamLogo={match?.opponentTwo?.logo}
              score={score2}
            />
          ) : expandedType === 'h2h' ? (
            <H2HPanel
              details={details}
              match={match}
              score1={score1}
              score2={score2}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEAM BREAKDOWN PANEL, Shows one team's players + scores
   ═══════════════════════════════════════════════════════════ */
const TeamBreakdownPanel = ({ details, teamSide, teamName, teamLogo, score }) => {
  const [breakdownPlayer, setBreakdownPlayer] = useState(null)
  const starters = details?.starters || []
  const bench = teamSide === 'player1' ? (details?.bench1 || []) : (details?.bench2 || [])

  // Extract players for this team side
  const starterPlayers = starters
    .map((s) => ({ ...s[teamSide], position: s.position }))
    .filter((p) => p?.Name || p?.ShortName)

  const benchPlayers = bench
    .map((b) => ({ ...b?.players, position: 'BNH' }))
    .filter((p) => p?.Name || p?.ShortName)

  return (
    <div style={{
      background: 'rgba(10,15,26,0.5)', borderRadius: 12,
      border: '1px solid rgba(110,105,128,0.1)', overflow: 'hidden',
    }}>
      {/* Team Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(110,105,128,0.1)',
        background: 'rgba(20,28,45,0.4)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundImage: `url(${teamLogo})`,
          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }} />
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', flex: 1 }}>
          {teamName}
        </span>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, fontWeight: 900, color: '#22C55E' }}>
          {score?.toFixed(2)}
        </span>
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '6px 16px',
        borderBottom: '1px solid rgba(110,105,128,0.06)',
      }}>
        <span style={{ width: 40, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>POS</span>
        <span style={{ flex: 1, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>PLAYER</span>
        <span style={{ width: 40, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>TEAM</span>
        <span style={{ width: 60, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'right' }}>PTS</span>
      </div>

      {/* Starter Rows */}
      {starterPlayers.map((player, i) => (
        <PlayerRow key={`s-${i}`} player={player} onBreakdown={() => setBreakdownPlayer(player)} />
      ))}

      {/* Bench Section */}
      {benchPlayers.length > 0 && (
        <>
          <div style={{
            padding: '6px 16px',
            background: 'rgba(245,158,11,0.04)',
            borderTop: '1px solid rgba(110,105,128,0.08)',
            borderBottom: '1px solid rgba(110,105,128,0.06)',
          }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 1 }}>
              BENCH (25%)
            </span>
          </div>
          {benchPlayers.map((player, i) => (
            <PlayerRow key={`b-${i}`} player={player} isBench onBreakdown={() => setBreakdownPlayer(player)} />
          ))}
        </>
      )}

      {/* Stat Breakdown Modal */}
      <BreakdownModal player={breakdownPlayer} onClose={() => setBreakdownPlayer(null)} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PLAYER ROW, Single player within team breakdown
   ═══════════════════════════════════════════════════════════ */
const PlayerRow = ({ player, isBench, onBreakdown }) => {
  const score = player?.playerScore || 0
  const img = player?.HostedHeadshotNoBackgroundUrl || Player1

  return (
    <div
      onClick={onBreakdown}
      style={{
        display: 'flex', alignItems: 'center', padding: '8px 16px',
        borderBottom: '1px solid rgba(110,105,128,0.04)',
        cursor: 'pointer',
        opacity: isBench ? 0.65 : 1,
        transition: 'background 0.15s',
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.03)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Position */}
      <span style={{
        width: 40, fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700,
        color: isBench ? '#F59E0B' : '#22C55E',
      }}>
        {mapPos(player?.Position) || player?.position || '—'}
      </span>

      {/* Photo + Name */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flexShrink: 0, border: '1px solid rgba(110,105,128,0.15)', borderRadius: '50%' }}>
          <PlayerAvatar
            name={player?.Name || '—'}
            src={player?.HostedHeadshotNoBackgroundUrl}
            size={28}
          />
        </div>
        <span style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player?.Name?.length >= 18 ? player?.ShortName : player?.Name || '—'}
        </span>
      </div>

      {/* Pro Team */}
      <span style={{
        width: 40, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
      }}>
        {player?.Team || '—'}
      </span>

      {/* Score */}
      <div style={{ width: 60, textAlign: 'right' }}>
        <span style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700,
          color: score > 10 ? '#22C55E' : score > 5 ? '#D4A843' : score > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
        }}>
          {score ? score.toFixed(1) : '—'}
        </span>
        {isBench && score > 0 && (
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: '#F59E0B' }}>
            25%: {(score * 0.25).toFixed(1)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   H2H PANEL, Head-to-head player comparison
   ═══════════════════════════════════════════════════════════ */
const H2HPanel = ({ details, match, score1, score2 }) => {
  const [breakdownPlayer, setBreakdownPlayer] = useState(null)
  const starters = details?.starters || []
  const lead1 = score1 > score2

  // Build bench matchup rows
  const b1 = details?.bench1 || []
  const b2 = details?.bench2 || []
  const maxBench = Math.max(b1.length, b2.length)
  const benchRows = []
  for (let i = 0; i < maxBench; i++) {
    benchRows.push({
      player1: b1[i]?.players || null,
      player2: b2[i]?.players || null,
      position: 'BNH',
    })
  }

  const H2HRow = ({ data, isBench }) => {
    const p1 = data?.player1
    const p2 = data?.player2
    const s1 = p1?.playerScore || 0
    const s2 = p2?.playerScore || 0
    const pos = data?.position

    const PlayerSide = ({ player, score, isRight, won }) => {
      if (!player?.Name && !player?.ShortName) {
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: isRight ? 'flex-end' : 'flex-start', padding: '6px 0', opacity: 0.3 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Empty</span>
          </div>
        )
      }
      const img = player?.HostedHeadshotNoBackgroundUrl || Player1
      const nm = player?.Name?.length >= 16 ? player?.ShortName : player?.Name

      return (
        <div
          onClick={() => setBreakdownPlayer(player)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            flexDirection: isRight ? 'row-reverse' : 'row',
            cursor: 'pointer', padding: '4px 0',
            opacity: isBench ? 0.65 : 1,
          }}
        >
          <div style={{
            flexShrink: 0,
            border: won ? '2px solid rgba(34,197,94,0.5)' : '1px solid rgba(110,105,128,0.15)',
            borderRadius: '50%',
          }}>
            <PlayerAvatar
              name={nm || '—'}
              src={player?.HostedHeadshotNoBackgroundUrl}
              size={28}
            />
          </div>
          <div style={{ flex: 1, textAlign: isRight ? 'right' : 'left', overflow: 'hidden' }}>
            <div style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 600, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{nm || '—'}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              {player?.Team}
            </div>
          </div>
          <span style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, minWidth: 32,
            textAlign: isRight ? 'left' : 'right',
            color: won ? '#22C55E' : score > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
          }}>
            {score ? score.toFixed(1) : '—'}
          </span>
        </div>
      )
    }

    return (
      <div style={{
        display: 'flex', alignItems: 'center', padding: '6px 16px',
        borderBottom: '1px solid rgba(110,105,128,0.04)',
      }}>
        <PlayerSide player={p1} score={s1} won={s1 > s2} />

        {/* Position Badge */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0, margin: '0 6px',
          background: 'rgba(10,15,26,0.9)', border: `1.5px solid ${isBench ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {pos?.split('/').map((p) => (
            <span key={p} style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 8, fontWeight: 800,
              color: isBench ? '#F59E0B' : '#22C55E', lineHeight: 1.1,
            }}>{p}</span>
          ))}
        </div>

        <PlayerSide player={p2} score={s2} isRight won={s2 > s1} />
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(10,15,26,0.5)', borderRadius: 12,
      border: '1px solid rgba(110,105,128,0.1)', overflow: 'hidden',
    }}>
      {/* H2H Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(110,105,128,0.1)',
        background: 'rgba(20,28,45,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundImage: `url(${match?.opponentOne?.logo})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }} />
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 900, color: lead1 ? '#22C55E' : '#fff' }}>
            {score1.toFixed(2)}
          </span>
        </div>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2 }}>
          HEAD TO HEAD
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 900, color: !lead1 && score1 !== score2 ? '#22C55E' : '#fff' }}>
            {score2.toFixed(2)}
          </span>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundImage: `url(${match?.opponentTwo?.logo})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }} />
        </div>
      </div>

      {/* Starter Rows */}
      {starters.map((s, i) => (
        <H2HRow key={`s-${i}`} data={s} />
      ))}

      {/* Bench Section */}
      {benchRows.length > 0 && (
        <>
          <div style={{
            padding: '6px 16px',
            background: 'rgba(245,158,11,0.04)',
            borderTop: '1px solid rgba(110,105,128,0.08)',
            borderBottom: '1px solid rgba(110,105,128,0.06)',
          }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 1 }}>
              BENCH (25%)
            </span>
          </div>
          {benchRows.map((b, i) => (
            <H2HRow key={`b-${i}`} data={b} isBench />
          ))}
        </>
      )}

      {/* Breakdown Modal */}
      <BreakdownModal player={breakdownPlayer} onClose={() => setBreakdownPlayer(null)} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   BREAKDOWN MODAL, Full stat-by-stat popup for a player
   ═══════════════════════════════════════════════════════════ */
const BreakdownModal = ({ player, onClose }) => {
  if (!player) return null

  const breakdown = player?.playerScoreBreakDown || []
  const isOL = player?.FantasyPosition === 'OL' || player?.Position === 'OL' || player?.Position === 'G' || player?.Position === 'OT' || player?.Position === 'C'

  const camelToTitle = (str) => {
    if (!str) return ''
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase())
  }

  // OL data is shaped differently (object instead of array)
  const dataSource = isOL && breakdown.length > 0 && typeof breakdown[0] === 'object' && !breakdown[0].metric
    ? Object.entries(breakdown[0])
        .filter(([k]) => k !== 'playerSnap')
        .map(([metric, units], i) => ({ key: i, metric: camelToTitle(metric), units }))
    : breakdown.map((b, i) => ({ ...b, key: i, metric: camelToTitle(b.metric) }))

  const columns = isOL
    ? [
        { title: 'Stat', dataIndex: 'metric', key: 'metric' },
        { title: 'Value', dataIndex: 'units', key: 'units' },
      ]
    : [
        { title: 'Stat', dataIndex: 'metric', key: 'metric' },
        { title: 'Units', dataIndex: 'units', key: 'units' },
        { title: 'Pts/Unit', dataIndex: 'pointsPerUnit', key: 'ppu', render: (v) => v?.toFixed(4) },
        { title: 'Points', dataIndex: 'total', key: 'total', render: (v) => <span style={{ color: v > 0 ? '#22C55E' : v < 0 ? '#EF4444' : '#fff', fontWeight: 700 }}>{v?.toFixed(2)}</span> },
      ]

  const img = player?.HostedHeadshotNoBackgroundUrl || Player1

  return (
    <Modal
      open={!!player}
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      className='view_breakdown_modal'
      closable
    >
      <div style={{ padding: '16px 0 0' }}>
        {/* Player Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%' }}>
            <PlayerAvatar
              name={player?.Name || player?.ShortName || '—'}
              src={player?.HostedHeadshotNoBackgroundUrl}
              size={48}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, fontWeight: 800, color: '#fff' }}>
              {player?.Name || player?.ShortName}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {mapPos(player?.Position)}, {player?.Team}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 900, color: '#22C55E' }}>
              {player?.playerScore?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
              Total Points
            </div>
          </div>
        </div>

        {/* Stat Table */}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size='small'
          style={{ background: 'transparent' }}
        />
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL (kept from original)
   ═══════════════════════════════════════════════════════════ */
const CarouselComponent = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1500 }, items: 7 },
    desktop1: { breakpoint: { max: 1600, min: 1400 }, items: 5 },
    desktop2: { breakpoint: { max: 1400, min: 1300 }, items: 4 },
    desktop3: { breakpoint: { max: 1300, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 600 }, items: 2 },
    mobile: { breakpoint: { max: 600, min: 0 }, items: 1 },
  }

  let carousel

  const getSchedule = (status, obj) => {
    if (obj?.AwayTeam === 'BYE') return `${obj?.HomeTeam} BYE`
    if (status === 'Final') return 'FINAL'
    if (status === 'Scheduled') return 'SCHED'
    return `${status}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Carousel
          responsive={responsive}
          arrows={false}
          ref={(el) => (carousel = el)}
          beforeChange={(s) => setCurrentSlide(s)}
          infinite
        >
          {data?.map((v, i) => {
            const isLive = v?.Status === 'InProgress'
            return (
              <div key={i} className='ls-ticker-card'>
                <div className='ls-ticker-row'>
                  <p className={`ls-ticker-team ${isLive ? 'ls-ticker-live' : ''}`}>{v?.HomeTeam}</p>
                  <p className={`ls-ticker-score ${isLive ? 'ls-ticker-live' : ''}`}>
                    {v?.HomeScore > 0 ? v?.HomeScore : '-'}
                  </p>
                </div>
                <div className='ls-ticker-row'>
                  <p className={`ls-ticker-team ${isLive ? 'ls-ticker-live' : ''}`}>{v?.AwayTeam}</p>
                  <p className={`ls-ticker-score ${isLive ? 'ls-ticker-live' : ''}`}>
                    {v?.AwayScore > 0 ? v?.AwayScore : '-'}
                  </p>
                </div>
                <p className={`ls-ticker-status ${isLive ? 'ls-ticker-live' : ''}`}>
                  {getSchedule(v?.Status, v)}
                </p>
              </div>
            )
          })}
        </Carousel>
      </div>
      <div className='ls-ticker-arrow'>
        <div className='ls-arrow-btn' onClick={() => carousel?.next()}>
          <TiChevronRight color='#22C55E' size={24} />
        </div>
      </div>
    </div>
  )
}

export default LeagueScore
