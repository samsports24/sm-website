// Component
import { useState, useEffect, useCallback } from 'react'
import { Col, Row, Spin, Empty, Drawer } from 'antd'
import {
  CaretRightOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import StandingHeader from '../components/StandingHeader'

// API
import { privateAPI, attachToken } from '../config/constants'
import { getScheduleByWeek, getGameDetails } from '../redux/actions/leagueActions'

/* ═══════════════════════════════════════════════════════════════
   NFL LIVESCORE, Full match-day experience
   Mirrors the Soccer LiveScore page design:
   - Fantasy Matchup cards (team vs team with scores)
   - Clickable team names → per-player breakdown drawer
   - Week selector
   - Auto-refresh every 60s
   ═══════════════════════════════════════════════════════════════ */

const PULSE_CSS = `
@keyframes nflPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`

/* ── Shared styles ── */
const glassCard = {
  background: '#111827',
  border: '1px solid rgba(34,197,94,0.12)',
  borderRadius: 14,
  overflow: 'hidden',
}

/* ── Tab Selector ── */
const TabSelector = ({ tabs, active, onChange }) => (
  <div style={{
    display: 'flex', gap: 6, padding: '4px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 10, width: 'fit-content', marginBottom: 16,
  }}>
    {tabs.map(t => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        style={{
          padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
          background: active === t.key ? 'rgba(34,197,94,0.15)' : 'transparent',
          color: active === t.key ? '#22C55E' : '#94A3B8',
          transition: 'all 0.2s',
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
)

/* ── Fantasy Matchup Card ── */
const FantasyMatchupCard = ({ matchup, onTeamClick }) => {
  const hasScore = matchup.scoreOne != null && matchup.scoreTwo != null
  const t1 = matchup.opponentOne
  const t2 = matchup.opponentTwo
  const t1Name = t1?.teamName || t1?.name || 'Team 1'
  const t2Name = t2?.teamName || t2?.name || 'Team 2'
  const s1 = matchup.scoreOne
  const s2 = matchup.scoreTwo
  const t1Wins = hasScore && s1 > s2
  const t2Wins = hasScore && s2 > s1

  return (
    <div style={{
      ...glassCard,
      padding: '16px 20px',
      transition: 'all 0.2s',
    }}>
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {hasScore ? (
          <>
            <CheckCircleOutlined style={{ fontSize: 10, color: '#22C55E' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', letterSpacing: '1px' }}>FINAL</span>
          </>
        ) : (
          <>
            <ClockCircleOutlined style={{ fontSize: 10, color: '#64748B' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '1px' }}>UPCOMING</span>
          </>
        )}
      </div>

      {/* Matchup Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Team 1 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => onTeamClick && t1?._id && onTeamClick(t1._id, t1Name)}
            style={{
              fontSize: 15, fontWeight: 700,
              color: t1Wins ? '#22C55E' : '#E2E8F0',
              cursor: onTeamClick ? 'pointer' : 'default',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'color 0.15s',
            }}
          >
            {t1Name}
          </div>
          {t1?.user?.username && (
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {t1.user.username}
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px',
          background: hasScore ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
          borderRadius: 8,
          border: hasScore ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{
            fontSize: 20, fontWeight: 900,
            color: t1Wins ? '#22C55E' : hasScore ? '#CBD5E1' : '#475569',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {hasScore ? s1 : '-'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}>vs</span>
          <span style={{
            fontSize: 20, fontWeight: 900,
            color: t2Wins ? '#22C55E' : hasScore ? '#CBD5E1' : '#475569',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {hasScore ? s2 : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
          <div
            onClick={() => onTeamClick && t2?._id && onTeamClick(t2._id, t2Name)}
            style={{
              fontSize: 15, fontWeight: 700,
              color: t2Wins ? '#22C55E' : '#E2E8F0',
              cursor: onTeamClick ? 'pointer' : 'default',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'color 0.15s',
            }}
          >
            {t2Name}
          </div>
          {t2?.user?.username && (
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {t2.user.username}
            </div>
          )}
        </div>
      </div>

      {/* W-L record line */}
      {matchup.record && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 10,
          paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontSize: 10, color: '#64748B' }}>
            Record: {matchup.record.teamOne?.wins ?? '-'}-{matchup.record.teamOne?.losses ?? '-'}
          </span>
          <span style={{ fontSize: 10, color: '#64748B' }}>
            Record: {matchup.record.teamTwo?.wins ?? '-'}-{matchup.record.teamTwo?.losses ?? '-'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Team Breakdown Drawer ── */
const TeamBreakdownDrawer = ({ open, onClose, teamId, teamName, week }) => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalScore, setTotalScore] = useState(0)

  useEffect(() => {
    if (!open || !teamId || !week) return
    let cancelled = false
    const fetch = async () => {
      try {
        setLoading(true)
        attachToken()
        const { data } = await privateAPI.post('/schedule/get-game-details', {
          team1: teamId,
          week: Number(week),
        })
        if (!cancelled) {
          const roster = data?.data?.roster || data?.data || []
          const playerList = Array.isArray(roster) ? roster : []
          setPlayers(playerList)
          setTotalScore(playerList.reduce((sum, p) => sum + (p.playerScore || p.score || 0), 0))
        }
      } catch (e) {
        console.error('Breakdown fetch error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [open, teamId, week])

  return (
    <Drawer
      title={null}
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{
        body: { padding: 0, background: '#0A0F1A' },
        header: { display: 'none' },
      }}
    >
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #111827, #0A0F1A)',
        borderBottom: '1px solid rgba(34,197,94,0.12)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <ArrowLeftOutlined onClick={onClose} style={{ color: '#94A3B8', fontSize: 16, cursor: 'pointer' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9' }}>{teamName}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Week {week} Breakdown</div>
        </div>
        <div style={{
          marginLeft: 'auto',
          fontSize: 20, fontWeight: 900, color: '#22C55E',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {totalScore.toFixed(1)}
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : players.length === 0 ? (
          <Empty description="No player data available" style={{ marginTop: 40 }} />
        ) : (
          players.map((p, idx) => (
            <div
              key={p._id || idx}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 8,
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                marginBottom: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                {/* Position badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 22, borderRadius: 4,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: 9, fontWeight: 700, color: '#22C55E',
                  letterSpacing: '0.5px', flexShrink: 0,
                }}>
                  {p.position || p.pos || '--'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#E2E8F0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {p.playerName || p.name || 'Unknown'}
                  </div>
                  {p.nflTeam && (
                    <div style={{ fontSize: 10, color: '#64748B' }}>{p.nflTeam}</div>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 800,
                color: (p.playerScore || p.score || 0) > 0 ? '#22C55E' : '#64748B',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {(p.playerScore || p.score || 0).toFixed(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </Drawer>
  )
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */

const LiveScore = () => {
  const currentWeek = useSelector((state) => state.user?.currentWeek)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [matchups, setMatchups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTeamId, setDrawerTeamId] = useState(null)
  const [drawerTeamName, setDrawerTeamName] = useState('')

  // Init selected week from Redux
  useEffect(() => {
    if (currentWeek && !selectedWeek) {
      setSelectedWeek(Number(currentWeek))
    }
  }, [currentWeek])

  // Fetch matchups for selected week
  const fetchMatchups = useCallback(async () => {
    if (!selectedWeek) return
    try {
      setLoading(true)
      const data = await getScheduleByWeek(selectedWeek)
      setMatchups(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Error fetching matchups:', err)
      setError(err.message)
      setMatchups([])
    } finally {
      setLoading(false)
    }
  }, [selectedWeek])

  useEffect(() => {
    fetchMatchups()
    const interval = setInterval(fetchMatchups, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [fetchMatchups])

  // Filter matchups
  const withScores = matchups.filter(m => m.scoreOne != null && m.scoreTwo != null)
  const upcoming = matchups.filter(m => m.scoreOne == null || m.scoreTwo == null)
  const filtered = activeTab === 'completed' ? withScores
    : activeTab === 'upcoming' ? upcoming
    : matchups

  const handleTeamClick = (teamId, teamName) => {
    setDrawerTeamId(teamId)
    setDrawerTeamName(teamName)
    setDrawerOpen(true)
  }

  const handlePagination = (page) => {
    setSelectedWeek(page)
  }

  // Week selector buttons
  const weekButtons = []
  const maxWeek = Number(currentWeek) || 1
  for (let w = Math.max(1, maxWeek - 3); w <= maxWeek; w++) {
    weekButtons.push(w)
  }

  return (
    <div className='standing_container' style={{ padding: '0 16px' }}>
      <style>{PULSE_CSS}</style>

      {/* HEADER */}
      <StandingHeader pagination={true} handlePagination={handlePagination} />

      {/* Week + Filter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, marginBottom: 16, marginTop: 16,
      }}>
        {/* Week buttons */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {weekButtons.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: selectedWeek === w ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                color: selectedWeek === w ? '#22C55E' : '#94A3B8',
                transition: 'all 0.2s',
              }}
            >
              WK {w}
            </button>
          ))}
        </div>

        {/* Tab filter */}
        <TabSelector
          tabs={[
            { key: 'all', label: `All (${matchups.length})` },
            { key: 'completed', label: `Final (${withScores.length})` },
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
          <TrophyOutlined style={{ color: '#22C55E', marginRight: 8 }} />
          Week {selectedWeek} Fantasy Matchups
        </h2>
        <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
          {withScores.length} completed &bull; {upcoming.length} upcoming
        </p>
      </div>

      {/* Matchup Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Empty description={`Error: ${error}`} />
      ) : filtered.length === 0 ? (
        <Empty description="No matchups for this week" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((m, i) => (
            <Col key={m._id || i} xs={24} lg={12}>
              <FantasyMatchupCard
                matchup={m}
                onTeamClick={handleTeamClick}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Per-player Breakdown Drawer */}
      <TeamBreakdownDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        teamId={drawerTeamId}
        teamName={drawerTeamName}
        week={selectedWeek}
      />
    </div>
  )
}

export default LiveScore
