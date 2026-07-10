import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button, Input, Tag, Spin, Empty, Tabs, Tooltip, notification, Image } from 'antd'
import { CiSearch } from 'react-icons/ci'
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  TrophyOutlined,
  TeamOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import Header from '../../components/Header'
import SamDatePicker from '../../components/SamDatePicker'
import { attachToken, privateAPI } from '../../config/constants'
import OnboardingGuide from '../../components/OnboardingGuide'
import BreakingNewsPopup from '../../components/BreakingNewsPopup'

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'FLEX']
const OFFENSE_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'FLEX']

const ROUND_LABELS = {
  wild_card: 'Wild Card',
  divisional: 'Divisional',
  conference_champ: 'Conference Championship',
  super_bowl: 'Super Bowl',
}

const ROUND_ORDER = ['wild_card', 'divisional', 'conference_champ', 'super_bowl']

// ── Countdown Hook ───────────────────────────────────────────
const useCountdown = (deadline) => {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!deadline) { setSeconds(0); return }
    const calc = () => setSeconds(Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)))
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [deadline])
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return { seconds, display: `${mins}:${String(secs).padStart(2, '0')}`, isUrgent: seconds <= 10 && seconds > 0 }
}

// ═══════════════════════════════════════════════════════════════
//  PLAYOFF DRAFT PAGE
// ═══════════════════════════════════════════════════════════════
const PlayoffDraft = () => {
  const user = useSelector((s) => s.user)
  const currentLeague = useSelector((s) => s.league?.currentLeague)
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const POS_LIST = isOffenseOnly ? OFFENSE_POSITIONS : POSITIONS
  const leagueId = currentLeague?._id

  const [drafts, setDrafts] = useState([])
  const [activeDraft, setActiveDraft] = useState(null)
  const [pool, setPool] = useState([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState(false)
  const [posFilter, setPosFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedRound, setSelectedRound] = useState(null)
  const [initRound, setInitRound] = useState('wild_card')
  const [initLoading, setInitLoading] = useState(false)
  const [dateLoading, setDateLoading] = useState(false)

  // ── Breaking News Popup ──
  const [breakingNews, setBreakingNews] = useState(null) // { roundLabel, isFinalRound, winners, losers, champion }
  const shownNewsRef = useRef(new Set()) // track which rounds we've already shown this session

  // Show popup ONLY for the latest completed round (not every completed round sequentially)
  useEffect(() => {
    if (!drafts.length) return

    // Collect all completed rounds, sorted by round order (latest last)
    const completedDrafts = drafts
      .filter((d) => d.status === 'completed')
      .sort((a, b) => ROUND_ORDER.indexOf(a.playoffRound) - ROUND_ORDER.indexOf(b.playoffRound))

    if (!completedDrafts.length) return

    // Mark ALL older rounds as seen so they never trigger a popup
    for (let i = 0; i < completedDrafts.length - 1; i++) {
      const oldKey = `${leagueId}_${completedDrafts[i].playoffRound}_${completedDrafts[i].season}`
      shownNewsRef.current.add(oldKey)
      try { localStorage.setItem(`breaking_news_seen_${oldKey}`, '1') } catch (e) { /* ok */ }
    }

    // Only consider the latest (most recent) completed round for popup
    const draft = completedDrafts[completedDrafts.length - 1]
    const roundKey = `${leagueId}_${draft.playoffRound}_${draft.season}`

    // Skip if already shown this session or on a previous visit
    if (shownNewsRef.current.has(roundKey)) return
    const storageKey = `breaking_news_seen_${roundKey}`
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) return

    // Build winners and losers from draftOrder (drafters are winners)
    const winners = (draft.draftOrder || []).map((t) => ({
      teamName: t.team?.name || t.team?.teamName || t.teamName || 'Unknown',
      teamLogo: t.team?.logo || t.team?.image || t.teamLogo || null,
      seed: t.seed,
      conference: t.conference,
      record: t.regSeasonWins != null ? `${t.regSeasonWins}W` : '',
    }))

    // Losers: teams whose players were in the pool (fromTeam), excluding drafter teams
    const drafterIds = new Set((draft.draftOrder || []).map((t) => String(t.team?._id || t.team)))
    const loserMap = new Map()
    for (const p of (draft.pool || [])) {
      const fromId = String(p.fromTeam?._id || p.fromTeam)
      if (!drafterIds.has(fromId) && !loserMap.has(fromId)) {
        loserMap.set(fromId, {
          teamName: p.fromTeamName || p.fromTeam?.name || 'Eliminated',
          teamLogo: p.fromTeam?.logo || p.fromTeam?.image || null,
        })
      }
    }
    const losers = Array.from(loserMap.values())

    const isFinal = draft.playoffRound === 'super_bowl'
    const roundLabel = ROUND_LABELS[draft.playoffRound] || draft.playoffRound

    // For Super Bowl, the winner is the champion
    let champion = null
    if (isFinal && winners.length >= 1) {
      champion = winners[0]
    }

    // Mark as seen IMMEDIATELY (in localStorage + ref) so re-mounts / tab switches don't re-trigger
    shownNewsRef.current.add(roundKey)
    try { localStorage.setItem(storageKey, '1') } catch (e) { /* ok */ }
    setBreakingNews({ roundLabel, isFinalRound: isFinal, winners, losers, champion })
  }, [drafts, leagueId])

  const handleCloseBreakingNews = () => {
    setBreakingNews(null)
  }

  const pollRef = useRef(null)

  // ── Load drafts ────────────────────────────────────────────
  const loadDrafts = useCallback(async () => {
    if (!leagueId) return
    try {
      attachToken()
      const res = await privateAPI.get(`/playoff-draft/status?leagueId=${leagueId}`)
      const d = res.data?.data?.drafts || res.data?.drafts || []
      setDrafts(d)

      // Auto-select the active/most recent draft
      const live = d.find((dr) => dr.status === 'in_progress')
      const pooling = d.find((dr) => dr.status === 'pooling')
      const latest = live || pooling || d[d.length - 1]
      if (latest && (!activeDraft || activeDraft._id !== latest._id)) {
        setActiveDraft(latest)
        setSelectedRound(latest.playoffRound)
        if (latest.status === 'in_progress' || latest.status === 'pooling') {
          loadPool(latest._id)
        }
      } else if (latest) {
        setActiveDraft(latest)
      }
    } catch (err) {
      console.error('Failed to load playoff drafts:', err)
    } finally {
      setLoading(false)
    }
  }, [leagueId])

  const loadPool = async (draftId) => {
    try {
      attachToken()
      const res = await privateAPI.get(`/playoff-draft/pool?draftId=${draftId}`)
      setPool(res.data?.data?.availablePlayers || res.data?.availablePlayers || [])
    } catch (err) {
      console.error('Failed to load pool:', err)
    }
  }

  useEffect(() => { loadDrafts() }, [loadDrafts])

  // Poll while draft is live
  useEffect(() => {
    if (activeDraft?.status === 'in_progress') {
      pollRef.current = setInterval(() => {
        loadDrafts()
        if (activeDraft?._id) loadPool(activeDraft._id)
      }, 5000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeDraft?.status, activeDraft?._id])

  // ── Commissioner: Initialize draft ─────────────────────────
  const handleInitialize = async () => {
    setInitLoading(true)
    try {
      attachToken()
      await privateAPI.post('/playoff-draft/initialize', { leagueId, playoffRound: initRound })
      notification.success({ message: `${ROUND_LABELS[initRound]} Playoff Draft initialized!` })
      await loadDrafts()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to initialize' })
    } finally {
      setInitLoading(false)
    }
  }

  // ── Commissioner: Start draft ──────────────────────────────
  const handleStart = async () => {
    if (!activeDraft) return
    try {
      attachToken()
      await privateAPI.post('/playoff-draft/start', { draftId: activeDraft._id })
      notification.success({ message: 'Playoff Draft is live!' })
      await loadDrafts()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to start' })
    }
  }

  // ── Make pick ──────────────────────────────────────────────
  const handlePick = async (playerId) => {
    if (!activeDraft || picking) return
    setPicking(true)
    try {
      attachToken()
      const res = await privateAPI.post('/playoff-draft/make-pick', { draftId: activeDraft._id, playerId })
      const msg = res.data?.data?.message || res.data?.message || 'Pick made!'
      notification.success({ message: msg })
      await loadDrafts()
      if (activeDraft?._id) await loadPool(activeDraft._id)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to pick' })
    } finally {
      setPicking(false)
    }
  }

  // ── Auto pick ──────────────────────────────────────────────
  const handleAutoPick = async () => {
    if (!activeDraft) return
    try {
      attachToken()
      await privateAPI.post('/playoff-draft/auto-pick', { draftId: activeDraft._id })
      notification.success({ message: 'Auto-pick complete!' })
      await loadDrafts()
      if (activeDraft?._id) await loadPool(activeDraft._id)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Auto-pick failed' })
    }
  }

  // ── Skip pick ──────────────────────────────────────────────
  const handleSkip = async () => {
    if (!activeDraft) return
    try {
      attachToken()
      await privateAPI.post('/playoff-draft/skip-pick', { draftId: activeDraft._id })
      notification.info({ message: 'Pick skipped' })
      await loadDrafts()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Skip failed' })
    }
  }

  // ── Cancel draft ───────────────────────────────────────────
  const handleCancel = async () => {
    if (!activeDraft) return
    try {
      attachToken()
      await privateAPI.post('/playoff-draft/cancel', { draftId: activeDraft._id })
      notification.info({ message: 'Playoff Draft cancelled' })
      await loadDrafts()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Cancel failed' })
    }
  }

  // ── Commissioner: Set draft date ──────────────────────────
  const handleSetDate = async (dateValue) => {
    if (!activeDraft) return
    setDateLoading(true)
    try {
      attachToken()
      const scheduledDate = dateValue ? dateValue.toISOString() : null
      await privateAPI.post('/playoff-draft/set-date', { draftId: activeDraft._id, scheduledDate })
      notification.success({ message: scheduledDate ? 'Draft date set! All teams have been notified.' : 'Draft date cleared' })
      await loadDrafts()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to set date' })
    } finally {
      setDateLoading(false)
    }
  }

  // ── Derived state ──────────────────────────────────────────
  const isCommissioner = currentLeague?.commissioner === user?._id
  const activePick = activeDraft?.picks?.find((p) => p.status === 'active')
  const myTeamId = user?.team?._id
  const isMyTurn = activePick && String(activePick.team?._id || activePick.team) === String(myTeamId)
  const completedPicks = activeDraft?.picks?.filter((p) => p.status === 'completed') || []

  // Filter pool
  const filteredPool = pool.filter((p) => {
    if (posFilter !== 'ALL') {
      if (posFilter === 'FLEX') {
        if (!['RB', 'WR', 'TE'].includes(p.position)) return false
      } else if (p.position !== posFilter) return false
    }
    if (search) {
      if (!(p.name || '').toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  }).sort((a, b) => (b.seasonPF || 0) - (a.seasonPF || 0))

  // My team's needs
  const myTeamEntry = activeDraft?.draftOrder?.find(
    (t) => String(t.team?._id || t.team) === String(myTeamId)
  )

  if (loading) {
    return (
      <div className='page-container'>
        <Header title='Playoff Draft' />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size='large' /></div>
      </div>
    )
  }

  return (
    <div className='page-container'>
      <Header title='Playoff Draft' icon={<TrophyOutlined />} />
      <OnboardingGuide tabKey="playoff-draft" />

      {/* ── Round Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROUND_ORDER.map((r) => {
          const draft = drafts.find((d) => d.playoffRound === r)
          const isActive = selectedRound === r
          return (
            <button
              key={r}
              onClick={() => {
                setSelectedRound(r)
                if (draft) { setActiveDraft(draft); if (draft._id) loadPool(draft._id) }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: `1px solid ${isActive ? '#22C55E' : 'rgba(255,255,255,0.1)'}`,
                background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#22C55E' : '#c8d0dc',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {ROUND_LABELS[r]}
              {draft && (
                <Tag
                  color={draft.status === 'completed' ? 'green' : draft.status === 'in_progress' ? 'blue' : 'orange'}
                  style={{ marginLeft: 8, fontSize: 10 }}
                >
                  {draft.status.replace('_', ' ')}
                </Tag>
              )}
            </button>
          )
        })}
      </div>

      {/* ── No Draft Yet → Commissioner Initialize ── */}
      {!activeDraft && isCommissioner && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: 32,
          textAlign: 'center',
          maxWidth: 500,
          margin: '40px auto',
        }}>
          <TrophyOutlined style={{ fontSize: 40, color: '#22C55E', marginBottom: 16 }} />
          <h3 style={{ color: '#e2e8f0', fontSize: 18, marginBottom: 8 }}>Initialize Playoff Draft</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
            After a playoff round completes and teams are eliminated, initialize the draft to pool their players
            and let surviving teams fill roster gaps.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            {ROUND_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => setInitRound(r)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${initRound === r ? '#22C55E' : 'rgba(255,255,255,0.1)'}`,
                  background: initRound === r ? 'rgba(34,197,94,0.15)' : 'transparent',
                  color: initRound === r ? '#22C55E' : '#a0a8b8',
                  fontWeight: initRound === r ? 700 : 400,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {ROUND_LABELS[r]}
              </button>
            ))}
          </div>
          <Button
            type='primary'
            size='large'
            loading={initLoading}
            onClick={handleInitialize}
            style={{ background: '#22C55E', borderColor: '#22C55E', fontWeight: 600, display: 'block', margin: '0 auto' }}
          >
            Initialize {ROUND_LABELS[initRound]} Draft
          </Button>
        </div>
      )}

      {!activeDraft && !isCommissioner && (
        <Empty description='No playoff draft active' style={{ marginTop: 60 }} />
      )}

      {/* ── Active Draft ── */}
      {activeDraft && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          {/* LEFT: Pool + Picks */}
          <div>
            {/* Active Pick Banner */}
            {activePick && activeDraft.status === 'in_progress' && (
              <ActivePickBanner
                pick={activePick}
                isMyTurn={isMyTurn}
                deadline={activeDraft.currentPickDeadline}
                onAutoPick={handleAutoPick}
                onSkip={handleSkip}
              />
            )}

            {/* Commissioner: Start button + Date picker */}
            {activeDraft.status === 'pooling' && isCommissioner && (
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>
                      Draft Ready — {activeDraft.pool?.length || 0} players pooled
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                      {activeDraft.picks?.length || 0} total picks · {activeDraft.draftOrder?.length || 0} teams drafting
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={handleCancel} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Cancel</Button>
                    <Button
                      type='primary'
                      icon={<PlayCircleOutlined />}
                      onClick={handleStart}
                      style={{ background: '#22C55E', borderColor: '#22C55E', fontWeight: 600 }}
                    >
                      Start Draft
                    </Button>
                  </div>
                </div>

                {/* Draft Date Picker */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 14px',
                }}>
                  <ClockCircleOutlined style={{ color: '#22C55E', fontSize: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>
                      Draft Date & Time — your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </div>
                    <SamDatePicker
                      showTime
                      value={activeDraft.scheduledDate ? new Date(activeDraft.scheduledDate) : null}
                      onChange={handleSetDate}
                      placeholder='Select draft date and time...'
                      style={{ maxWidth: 280 }}
                    />
                  </div>
                  {activeDraft.scheduledDate && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
                        {new Date(activeDraft.scheduledDate).toLocaleString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit', hour12: true,
                          timeZoneName: 'short',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completed banner */}
            {activeDraft.status === 'completed' && (
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
                textAlign: 'center',
              }}>
                <TrophyOutlined style={{ fontSize: 24, color: '#22C55E', marginBottom: 8 }} />
                <div style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>
                  {ROUND_LABELS[activeDraft.playoffRound]} Playoff Draft Complete
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
                  {completedPicks.length} picks made
                </div>
              </div>
            )}

            {/* Position Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {POS_LIST.map((p) => (
                <button
                  key={p}
                  onClick={() => setPosFilter(p)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: posFilter === p ? '#22C55E' : 'rgba(255,255,255,0.06)',
                    color: posFilter === p ? '#fff' : '#a0a8b8',
                    fontWeight: posFilter === p ? 700 : 400,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
              <Input
                prefix={<CiSearch style={{ color: 'rgba(255,255,255,0.3)' }} />}
                placeholder='Search players...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: 180,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  marginLeft: 'auto',
                }}
              />
            </div>

            {/* Player Pool Table */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 80px 80px 100px',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
              }}>
                <span>Player</span>
                <span>Pos</span>
                <span>PF</span>
                <span>Salary</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </div>
              {filteredPool.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  No players available
                </div>
              ) : (
                filteredPool.slice(0, 50).map((p, i) => (
                  <div
                    key={`${p.player}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 80px 80px 100px',
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{p.name || 'Unknown'}</span>
                    <Tag color={getPositionColor(p.position)} style={{ fontSize: 11 }}>{p.position}</Tag>
                    <span style={{ color: '#22C55E', fontWeight: 600, fontSize: 13 }}>{(p.seasonPF || 0).toFixed(1)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                      {p.salary ? `${(p.salary / 1000000).toFixed(1)}M` : '—'}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      {isMyTurn && activeDraft.status === 'in_progress' ? (
                        <Button
                          size='small'
                          type='primary'
                          loading={picking}
                          onClick={() => handlePick(p.player)}
                          style={{ background: '#22C55E', borderColor: '#22C55E', fontWeight: 600, fontSize: 11 }}
                        >
                          Draft
                        </Button>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>—</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Draft Board + Team Needs */}
          <div>
            {/* My Team Needs */}
            {myTeamEntry && (
              <div style={{
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}>
                <div style={{ color: '#22C55E', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <TeamOutlined /> Your Roster Needs
                </div>
                {myTeamEntry.positionsNeeded?.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {myTeamEntry.positionsNeeded.map((pos, i) => (
                      <Tag key={i} color={getPositionColor(pos)} style={{ fontSize: 12 }}>{pos}</Tag>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Roster complete!</span>
                )}
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6 }}>
                  {myTeamEntry.picksMade || 0} / {myTeamEntry.totalPicksAllowed || 0} picks used
                </div>
              </div>
            )}

            {/* Draft Order */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                Draft Order (Best Record First)
              </div>
              {(activeDraft.draftOrder || []).map((t, i) => {
                const teamName = t.team?.name || t.team?.abbreviation || `Team ${i + 1}`
                const teamAbbr = t.team?.abbreviation || ''
                const isOnClock = activePick && String(activePick.team?._id || activePick.team) === String(t.team?._id || t.team)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isOnClock ? 'rgba(34,197,94,0.12)' : 'transparent',
                      borderLeft: isOnClock ? '3px solid #22C55E' : '3px solid transparent',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, width: 20, fontWeight: 600 }}>#{i + 1}</span>
                    <span style={{ color: isOnClock ? '#22C55E' : '#e2e8f0', fontSize: 13, fontWeight: isOnClock ? 700 : 500, flex: 1 }}>
                      {teamName}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      {t.regSeasonWins || 0}W · {t.totalPicksAllowed || 0} picks
                    </span>
                    {t.hasBye && <Tag color='gold' style={{ fontSize: 9 }}>BYE</Tag>}
                    {t.isComplete && <Tag color='green' style={{ fontSize: 9 }}>DONE</Tag>}
                    {isOnClock && <Tag color='blue' style={{ fontSize: 9 }}>ON CLOCK</Tag>}
                  </div>
                )
              })}
            </div>

            {/* Recent Picks */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                <SwapOutlined /> Recent Picks
              </div>
              {completedPicks.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No picks yet</div>
              ) : (
                [...completedPicks].reverse().slice(0, 20).map((pk, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 11, width: 30 }}>
                      #{pk.overallPick}
                    </span>
                    <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500, flex: 1 }}>
                      {pk.playerName || 'Unknown'}
                    </span>
                    <Tag color={getPositionColor(pk.position)} style={{ fontSize: 10 }}>{pk.position}</Tag>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                      {pk.team?.abbreviation || ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Breaking News Popup ── */}
      <BreakingNewsPopup
        visible={!!breakingNews}
        onClose={handleCloseBreakingNews}
        roundLabel={breakingNews?.roundLabel || ''}
        isFinalRound={breakingNews?.isFinalRound || false}
        winners={breakingNews?.winners || []}
        losers={breakingNews?.losers || []}
        champion={breakingNews?.champion || null}
        sport="nfl"
      />
    </div>
  )
}

// ── Active Pick Banner ────────────────────────────────────────
const ActivePickBanner = ({ pick, isMyTurn, deadline, onAutoPick, onSkip }) => {
  const { display, isUrgent } = useCountdown(deadline)
  const teamName = pick.team?.name || pick.team?.abbreviation || 'Team'
  return (
    <div style={{
      background: isMyTurn ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.1)',
      border: `1px solid ${isMyTurn ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.2)'}`,
      borderRadius: 12,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    }}>
      <div>
        <div style={{ color: isMyTurn ? '#22C55E' : '#60a5fa', fontWeight: 700, fontSize: 15 }}>
          {isMyTurn ? '🎯 YOUR PICK!' : `${teamName} is on the clock`}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
          Pick #{pick.overallPick}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: isUrgent ? '#ff4757' : isMyTurn ? '#22C55E' : '#60a5fa',
          fontVariantNumeric: 'tabular-nums',
          animation: isUrgent ? 'blink 0.5s infinite' : 'none',
        }}>
          <ClockCircleOutlined style={{ fontSize: 16, marginRight: 6 }} />
          {display}
        </span>
        {isMyTurn && (
          <>
            <Button size='small' onClick={onAutoPick} icon={<ThunderboltOutlined />}
              style={{ borderColor: '#22C55E', color: '#22C55E' }}>Auto</Button>
            <Button size='small' onClick={onSkip} icon={<StopOutlined />}
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}>Skip</Button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Position color helper ─────────────────────────────────────
const getPositionColor = (pos) => {
  const map = {
    QB: 'red', RB: 'blue', WR: 'green', TE: 'orange', K: 'purple', P: 'purple',
    OL: 'cyan', DE: 'magenta', DT: 'magenta', LB: 'gold', CB: 'lime', S: 'geekblue',
    DEF: 'volcano', FLEX: 'default',
  }
  return map[pos] || 'default'
}

export default PlayoffDraft
