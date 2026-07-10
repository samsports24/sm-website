import React, { useState, useEffect, useCallback } from 'react'
import { Modal, notification, Spin, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  WarningOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined,
} from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'

/* ═══════════════════════════════════════════════════════════════════════
   LEAGUE DELETION VOTE CARD (NFL)

   Mirror of the soccer version. Talks to
     POST /league/deletion-vote/propose
     POST /league/deletion-vote/cast
     POST /league/deletion-vote/cancel
     GET  /league/deletion-vote/:leagueId
   ═════════════════════════════════════════════════════════════════════ */

const C = {
  panel: 'rgba(17,24,39,0.55)',
  border: 'rgba(239,68,68,0.35)',
  borderSoft: 'rgba(255,255,255,0.08)',
  red: '#EF4444',
  green: '#22C55E',
  amber: '#F59E0B',
  ivory: '#ECEAE3',
  muted: 'rgba(255,255,255,0.6)',
  mutedHard: 'rgba(255,255,255,0.4)',
}

const Stat = ({ label, value, color = C.ivory }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: C.mutedHard, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{value}</div>
  </div>
)

const ProgressBar = ({ percent, threshold = 67 }) => (
  <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
    <div style={{
      width: `${Math.min(100, Math.max(0, percent))}%`,
      height: '100%',
      background: percent >= threshold
        ? 'linear-gradient(90deg,#16A34A,#22C55E)'
        : 'linear-gradient(90deg,#B45309,#F59E0B)',
      transition: 'width 220ms ease',
    }} />
    <div style={{ position: 'absolute', left: `${threshold}%`, top: -3, bottom: -3, width: 2, background: 'rgba(255,255,255,0.45)' }} />
  </div>
)

function daysLeft(expiresAt) {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 0
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return '< 1h'
}

const LeagueDeletionVoteCard = ({ currentLeague, currentTeam, user, isHeadCommissioner, isTeamOwner, onLeagueDeleted }) => {
  const navigate = useNavigate()
  const leagueId = currentLeague?._id
  const leagueName = currentLeague?.name || ''
  const [vote, setVote] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTyped, setConfirmTyped] = useState('')

  const myUserId = String(user?._id || user?.id || '')

  const refresh = useCallback(async () => {
    if (!leagueId) return
    try {
      attachToken()
      const res = await privateAPI.get(`/league/deletion-vote/${leagueId}`)
      const d = res.data?.data || res.data || {}
      setVote(d.vote || null)
      setSummary(d.summary || null)
    } catch (_) {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [leagueId])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 15000)
    return () => clearInterval(t)
  }, [refresh])

  const myVote = vote?.votes?.find((v) => String(v.user) === myUserId)?.vote
  const isOpen = vote?.status === 'open'
  const teamCount = (currentLeague?.teams?.length) || (currentLeague?.currentTeamCount || 0)

  const propose = async () => {
    setActing(true)
    try {
      attachToken()
      await privateAPI.post(`/league/deletion-vote/propose`, { leagueId })
      notification.success({ message: 'Deletion vote started', description: 'Team owners have 7 days to vote.' })
      await refresh()
    } catch (err) {
      notification.error({ message: 'Could not start vote', description: err?.response?.data?.message })
    } finally {
      setActing(false)
    }
  }

  const cast = async (choice) => {
    setActing(true)
    try {
      attachToken()
      const res = await privateAPI.post(`/league/deletion-vote/cast`, { leagueId, vote: choice })
      const data = res.data?.data || res.data || {}
      if (data.vote?.status === 'passed') {
        notification.success({ message: 'League deleted', description: 'Threshold reached — wallets refunded.' })
        if (onLeagueDeleted) onLeagueDeleted()
        navigate('/hub')
        return
      }
      notification.success({ message: `Vote recorded: ${choice.toUpperCase()}` })
      await refresh()
    } catch (err) {
      notification.error({ message: 'Could not record vote', description: err?.response?.data?.message })
    } finally {
      setActing(false)
    }
  }

  const cancel = async () => {
    setActing(true)
    try {
      attachToken()
      await privateAPI.post(`/league/deletion-vote/cancel`, { leagueId })
      notification.success({ message: 'Vote cancelled' })
      await refresh()
    } catch (err) {
      notification.error({ message: 'Could not cancel vote', description: err?.response?.data?.message })
    } finally {
      setActing(false)
    }
  }

  // Solo commissioner fast-path. NFL backend's `delete-league-commissioner`
  // is locked down (returns 409), but if you're the only team owner you can
  // still propose a vote and your auto-YES will immediately pass it.
  const showSoloDelete = isHeadCommissioner && teamCount <= 1 && !isOpen

  if (!isHeadCommissioner && !isTeamOwner) return null
  if (loading) {
    return (
      <div style={{ padding: 20, marginTop: 24, border: `1px solid ${C.borderSoft}`, borderRadius: 16, background: C.panel, textAlign: 'center' }}>
        <Spin size="small" /> <span style={{ marginLeft: 10, color: C.muted, fontSize: 12 }}>Loading deletion status…</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 22, marginTop: 24, border: `1px solid ${C.border}`, borderRadius: 16, background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(127,29,29,0.03))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <WarningOutlined style={{ color: C.red, fontSize: 18 }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.red, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danger Zone</h3>
      </div>

      {!isOpen && isHeadCommissioner && (
        <>
          <p style={{ color: C.muted, fontSize: 13, margin: '4px 0 14px' }}>
            Deleting a league requires consent from {showSoloDelete ? 'you' : 'the team owners'}.
            {showSoloDelete
              ? ' You are the only team owner — starting a vote will pass immediately and any SamPoints in your team wallet will be transferred to your main wallet.'
              : ' Open a 7-day vote — if ≥ 67% of team owners vote YES, the league is removed and every team\'s SamPoints are transferred to that owner\'s main wallet.'}
          </p>
          <Button danger size="large" icon={<ThunderboltOutlined />} loading={acting} onClick={propose}>
            {showSoloDelete ? 'Delete League' : 'Start Deletion Vote'}
          </Button>
        </>
      )}

      {!isOpen && !isHeadCommissioner && (
        <p style={{ color: C.mutedHard, fontSize: 12, margin: '4px 0 0' }}>
          Only the head commissioner can start a league deletion vote.
        </p>
      )}

      {isOpen && summary && (
        <>
          <p style={{ color: C.muted, fontSize: 13, margin: '4px 0 14px' }}>
            A vote is open to delete this league. {summary.yesCount} of {vote.totalOwners} owners have voted YES so far ({summary.yesPercent}%). Threshold is 67%. Window closes in <strong style={{ color: C.amber }}>{daysLeft(vote.expiresAt) || 'soon'}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.borderSoft}`, marginBottom: 14 }}>
            <Stat label="Yes" value={summary.yesCount} color={C.green} />
            <Stat label="No" value={summary.noCount} color={C.red} />
            <Stat label="Pending" value={summary.openSlots} color={C.amber} />
            <Stat label="Need" value={`${summary.requiredYes} yes`} />
            <Stat label="Closes" value={daysLeft(vote.expiresAt) || '—'} color={C.amber} />
          </div>
          <ProgressBar percent={summary.yesPercent} threshold={vote.thresholdPercent || 67} />

          {isTeamOwner && (
            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: C.muted, fontSize: 12 }}>
                {myVote
                  ? <>Your vote: <strong style={{ color: myVote === 'yes' ? C.green : C.red }}>{myVote.toUpperCase()}</strong> · change at any time</>
                  : 'Cast your vote:'}
              </span>
              <Button size="small" style={{ background: myVote === 'yes' ? C.green : 'transparent', borderColor: C.green, color: myVote === 'yes' ? '#0a1206' : C.green }} icon={<CheckCircleOutlined />} loading={acting} onClick={() => cast('yes')}>Yes — delete</Button>
              <Button size="small" style={{ background: myVote === 'no' ? C.red : 'transparent', borderColor: C.red, color: myVote === 'no' ? '#fff' : C.red }} icon={<CloseCircleOutlined />} loading={acting} onClick={() => cast('no')}>No — keep</Button>
            </div>
          )}

          {isHeadCommissioner && String(vote.proposer) === myUserId && (
            <div style={{ marginTop: 12 }}>
              <Button size="small" type="text" onClick={cancel} loading={acting} style={{ color: C.mutedHard }}>
                Cancel this vote
              </Button>
            </div>
          )}
        </>
      )}

      {vote && !isOpen && vote.status !== 'cancelled' && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.borderSoft}` }}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: C.mutedHard }}>Last vote</div>
          <div style={{ fontSize: 13, color: C.ivory, marginTop: 4 }}>
            <strong style={{ color: vote.status === 'passed' ? C.green : C.red }}>{vote.status.toUpperCase()}</strong>
            {' · '}{vote.finalizedSummary?.yesCount ?? 0} yes / {vote.finalizedSummary?.noCount ?? 0} no
            {vote.status === 'passed' && ' — league removed, wallets refunded'}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeagueDeletionVoteCard
