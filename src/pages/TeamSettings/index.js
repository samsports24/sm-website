import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { notification, Modal, Switch, DatePicker, Input } from 'antd'
import Header from '../../components/Header'
import { attachToken, privateAPI } from '../../config/constants'
import { useLanguage } from '../../i18n/LanguageContext'
import OnboardingGuide from '../../components/OnboardingGuide'
import PushNotificationToggle from '../../components/PushNotificationToggle'
import CommissionerBadge from '../../components/CommissionerBadge'
import { CREST_STYLES, COLORS, crestDataUri } from '../../utils/crestStyles'
import '../../styles/pages/teamSettings.css'

const ROLE_BADGES = {
  gm: (color, size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color} opacity="0.2"/>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="12" cy="12" r="3" fill={color} opacity="0.4"/>
    </svg>
  ),
  assistant_gm: (color, size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} opacity="0.15"/>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  scout: (color, size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="7.5" r="4.5" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5"/>
      <circle cx="10.5" cy="7.5" r="1.5" fill={color} opacity="0.35"/>
      <circle cx="17" cy="10" r="3.5" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5"/>
      <circle cx="17" cy="10" r="1.2" fill={color} opacity="0.35"/>
      <line x1="10.5" y1="12" x2="10.5" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="13.5" x2="17" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  analyst: (color, size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill={color} opacity="0.1" stroke={color} strokeWidth="1.5"/>
      <path d="M7 17V13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 17V10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 17V7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="6" r="2" fill={color} opacity="0.5"/>
    </svg>
  ),
}

const ROLES = [
  { key: 'gm', label: 'General Manager', desc: 'Full control over team operations', color: '#22C55E' },
  { key: 'assistant_gm', label: 'Assistant GM', desc: 'Lineup and formation control', color: '#3B82F6' },
  { key: 'scout', label: 'Scout', desc: 'View-only access with chat', color: '#F59E0B' },
  { key: 'analyst', label: 'Analyst', desc: 'Financial visibility with chat', color: '#A855F7' },
]

// Card accent colours + permission preview shown on each role template.
const ROLE_CARD = {
  gm: { color: '#A855F7', badge: 'Full Access', preview: [['Draft', 1], ['Trades', 1], ['Roster Management', 1], ['Starting XI', 1], ['Staff Management', 1], ['Stadium & Branding', 1], ['League Settings', 1]] },
  assistant_gm: { color: '#3B82F6', badge: 'Limited Access', preview: [['Draft', 1], ['Trades', 1], ['Roster Management', 1], ['Starting XI', 1], ['Staff Management', 0], ['Stadium & Branding', 0], ['League Settings', 0]] },
  scout: { color: '#22C55E', badge: 'View Only', preview: [['View Players', 1], ['Scouting Reports', 1], ['Mock Drafts', 1], ['Trades', 0], ['Waivers', 0], ['Roster Changes', 0], ['League Settings', 0]] },
  analyst: { color: '#F59E0B', badge: 'Analytics Access', preview: [['View League Data', 1], ['Financial Reports', 1], ['Salary Cap', 1], ['Contracts', 1], ['Trades', 0], ['Roster Changes', 0], ['Staff Management', 0]] },
}

const PERMISSIONS = [
  { key: 'canSetLineup', label: 'Set Lineup', desc: 'Change starting XI and bench' },
  { key: 'canChangeFormation', label: 'Change Formation', desc: 'Switch tactical formation' },
  { key: 'canSetCaptain', label: 'Set Captain', desc: 'Choose team captain' },
  { key: 'canMakeTrades', label: 'Make Trades', desc: 'Propose and accept trades with other teams' },
  { key: 'canDraftPlayers', label: 'Draft Players', desc: 'Pick players during draft rounds' },
  { key: 'canManageAuctions', label: 'Manage Auctions', desc: 'Create and bid in player auctions' },
  { key: 'canReleasePlayer', label: 'Release Players', desc: 'Drop players to free agency' },
  { key: 'canManageLoan', label: 'Manage Loans', desc: 'Send and receive loan deals' },
  { key: 'canViewFinancials', label: 'View Financials', desc: 'See salary cap, budget, and spending' },
  { key: 'canChat', label: 'League Chat', desc: 'Send messages in league chat' },
]

const TeamSettings = () => {
  const { t } = useLanguage()
  const user = useSelector((s) => s.user?.userDetails)
  const teamId = user?.team?._id || user?.team?.id || user?.activeTeam

  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newRole, setNewRole] = useState('assistant_gm')
  const [newNickname, setNewNickname] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [crestOpen, setCrestOpen] = useState(false)
  const [colorA, setColorA] = useState(COLORS[4].val)
  const [colorB, setColorB] = useState(COLORS[1].val)

  // Away / vacation mode
  const [awayUntilInput, setAwayUntilInput] = useState(null)
  const [awayMsgInput, setAwayMsgInput] = useState('')
  const [savingAway, setSavingAway] = useState(false)

  // Commissioner badge visibility (only relevant when the owner is a commissioner)
  const [hideBadge, setHideBadge] = useState(false)
  const [savingBadge, setSavingBadge] = useState(false)

  const saveCrest = async (styleKey) => {
    setSavingLogo(true)
    try {
      attachToken()
      const dataUri = crestDataUri(styleKey, team?.name || 'Team', colorA, colorB)
      await privateAPI.post('/team/set-logo', { logo: dataUri, teamId: resolvedTeamId })
      notification.success({ message: 'Crest set as your team logo!' })
      // Refresh in place — NOT a hard reload. A full page reload re-derives the
      // active team from the login token, which bounces a multi-team user to
      // their OTHER team. Refetching keeps them on the team they just edited.
      await fetchSettings(resolvedTeamId)
      setCrestOpen(false)
      setSavingLogo(false)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to save crest' })
      setSavingLogo(false)
    }
  }

  const [resolvedTeamId, setResolvedTeamId] = useState(teamId)

  // If no teamId from Redux, try to discover it from /league/my-teams
  useEffect(() => {
    if (teamId) {
      setResolvedTeamId(teamId)
    } else {
      const discoverTeam = async () => {
        try {
          attachToken()
          const res = await privateAPI.get('/team/my-teams')
          const teams = res?.data?.data
          if (Array.isArray(teams) && teams.length > 0) {
            setResolvedTeamId(teams[0]._id || teams[0].id)
          } else {
            setLoading(false)
          }
        } catch {
          setLoading(false)
        }
      }
      discoverTeam()
    }
  }, [teamId])

  useEffect(() => {
    if (resolvedTeamId) {
      fetchSettings(resolvedTeamId)
    } else {
      setLoading(false)
    }
  }, [resolvedTeamId])

  const fetchSettings = async (tid) => {
    setLoading(true)
    setFetchError(null)
    try {
      attachToken()
      const res = await privateAPI.get(`/team/settings/${tid}`)
      setSettings(res.data?.data || res.data)
    } catch (err) {
      console.error('Failed to load team settings:', err)
      const status = err?.response?.status
      if (status === 403) {
        setFetchError('You do not have permission to view these team settings.')
      } else if (status === 404) {
        setFetchError('Team not found. It may have been deleted.')
      } else {
        setFetchError('Failed to load team settings. Please try again.')
      }
    }
    setLoading(false)
  }

  const handleAddManager = async () => {
    if (!newUsername.trim()) return notification.error({ message: t('enterUsername') })
    setAdding(true)
    try {
      attachToken()
      await privateAPI.post(`/team/settings/${resolvedTeamId}/managers`, {
        userName: newUsername.trim(),
        role: newRole,
        nickname: newNickname.trim(),
      })
      notification.success({ message: t('staffMemberAdded') })
      setAddModal(false)
      setNewUsername('')
      setNewRole('assistant_gm')
      setNewNickname('')
      fetchSettings(resolvedTeamId)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to add staff' })
    }
    setAdding(false)
  }

  const handleUpdatePermission = async (managerId, key, value) => {
    try {
      attachToken()
      await privateAPI.put(`/team/settings/${resolvedTeamId}/managers/${managerId}`, { permissions: { [key]: value } })
      fetchSettings(resolvedTeamId)
    } catch (err) {
      notification.error({ message: t('failedToUpdate') })
    }
  }

  const handleUpdateRole = async (managerId, role) => {
    try {
      attachToken()
      await privateAPI.put(`/team/settings/${resolvedTeamId}/managers/${managerId}`, { role })
      notification.success({ message: t('roleUpdated') })
      fetchSettings(resolvedTeamId)
    } catch (err) {
      notification.error({ message: t('failedToUpdateRole') })
    }
  }

  const handleQuit = async () => {
    Modal.confirm({
      title: 'Resign from this team?',
      content: 'You will lose all access immediately. This cannot be undone.',
      okText: 'Resign',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          attachToken()
          await privateAPI.post(`/team/settings/${resolvedTeamId}/quit`)
          notification.success({ message: t('youHaveResigned') })
          window.location.href = '/war-room'
        } catch (err) {
          notification.error({ message: err.response?.data?.message || t('failedToUpdate') })
        }
      },
    })
  }

  const [payModal, setPayModal] = useState({ open: false, managerId: null, managerName: '' })
  const [payAmount, setPayAmount] = useState('')

  const handlePay = async () => {
    if (!payAmount || parseInt(payAmount) <= 0) return notification.error({ message: t('enterValidAmount') })
    try {
      attachToken()
      const res = await privateAPI.post(`/team/settings/${resolvedTeamId}/pay/${payModal.managerId}`, { amount: parseInt(payAmount) })
      notification.success({ message: res.data?.data?.message || 'Payment sent!' })
      setPayModal({ open: false, managerId: null, managerName: '' })
      setPayAmount('')
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Payment failed' })
    }
  }

  const handleSetAway = async () => {
    if (!awayUntilInput) return notification.error({ message: 'Pick a return date' })
    setSavingAway(true)
    try {
      attachToken()
      await privateAPI.post('/team/away', { until: awayUntilInput, message: awayMsgInput })
      notification.success({ message: 'Away status set' })
      setAwayUntilInput(null)
      setAwayMsgInput('')
      fetchSettings(resolvedTeamId)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to set away status' })
    }
    setSavingAway(false)
  }

  const handleClearAway = async () => {
    setSavingAway(true)
    try {
      attachToken()
      await privateAPI.post('/team/away/clear')
      notification.success({ message: 'Away status cleared' })
      fetchSettings(resolvedTeamId)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to clear away status' })
    }
    setSavingAway(false)
  }

  // Keep the local badge toggle in sync with what the server returned.
  useEffect(() => {
    if (settings?.team) setHideBadge(!!settings.team.hideCommissionerBadge)
  }, [settings])

  // Toggle: ON = show badge (hideCommissionerBadge false). Persists via /team/update.
  const handleToggleBadge = async (checked) => {
    const nextHide = !checked
    setSavingBadge(true)
    setHideBadge(nextHide) // optimistic
    try {
      attachToken()
      await privateAPI.post('/team/update', { teamId: resolvedTeamId, hideCommissionerBadge: nextHide })
      setSettings((prev) => (prev ? { ...prev, team: { ...prev.team, hideCommissionerBadge: nextHide } } : prev))
      notification.success({ message: nextHide ? 'Commissioner badge hidden' : 'Commissioner badge is now visible' })
    } catch (err) {
      setHideBadge(!nextHide) // revert on failure
      notification.error({ message: err.response?.data?.message || 'Failed to update badge preference' })
    }
    setSavingBadge(false)
  }

  const handleDeleteTeam = () => {
    Modal.confirm({
      title: 'Delete this team?',
      content: 'This permanently deletes your team. It is only allowed before the draft starts and while your roster is empty. This cannot be undone.',
      okText: 'Delete Team',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          attachToken()
          await privateAPI.delete('/team/my-team')
          notification.success({ message: 'Team deleted' })
          window.location.href = '/war-room'
        } catch (err) {
          notification.error({ message: err.response?.data?.message || 'Failed to delete team' })
        }
      },
    })
  }

  const handleRemoveManager = async (managerId, name) => {
    Modal.confirm({
      title: `Remove ${name}?`,
      content: 'This will revoke all their access.',
      okText: 'Remove',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          attachToken()
          await privateAPI.delete(`/team/settings/${resolvedTeamId}/managers/${managerId}`)
          notification.success({ message: `${name} removed` })
          fetchSettings(resolvedTeamId)
        } catch (err) {
          notification.error({ message: t('failedToRemove') })
        }
      },
    })
  }

  if (loading) return (
    <div className="ts-skel-page" style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <div className="ts-skel" style={{ width: 120, height: 12, marginBottom: 12 }} />
      <div className="ts-skel" style={{ width: 260, height: 30, marginBottom: 6 }} />
      <div className="ts-skel" style={{ width: 200, height: 14, marginBottom: 26 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 30 }}>
        <div className="ts-skel" style={{ height: 120, borderRadius: 16 }} />
        <div className="ts-skel" style={{ height: 120, borderRadius: 16 }} />
      </div>
      <div className="ts-skel" style={{ width: 180, height: 20, marginBottom: 14 }} />
      <div className="ts-skel" style={{ height: 180, borderRadius: 16, marginBottom: 30 }} />
      <div className="ts-skel" style={{ width: 220, height: 20, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="ts-skel" style={{ height: 220, borderRadius: 14 }} />)}
      </div>
    </div>
  )

  if (!settings) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{fetchError ? '⚠️' : '⚙️'}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
        {fetchError ? 'Unable to Load Settings' : resolvedTeamId ? 'Loading...' : 'No Team Selected'}
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
        {fetchError || (resolvedTeamId ? 'Please wait...' : 'Join a league first to manage team staff.')}
      </p>
      {fetchError && (
        <button
          onClick={fetchSettings}
          style={{
            marginTop: 16, padding: '10px 24px', borderRadius: 8,
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  )

  const { team, owner, managers, isOwner, isCommissioner } = settings

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <OnboardingGuide tabKey="team-settings" />
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>
          Team Settings
        </div>
        {editingName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = draftName.trim()
                  if (!trimmed) return
                  setSavingName(true)
                  attachToken()
                  privateAPI.post('/team/update', { name: trimmed, teamId: resolvedTeamId })
                    .then(() => {
                      setSettings((prev) => ({ ...prev, team: { ...prev.team, name: trimmed } }))
                      setEditingName(false)
                      notification.success({ message: 'Team name updated!' })
                    })
                    .catch((err) => notification.error({ message: err.response?.data?.message || 'Failed to update' }))
                    .finally(() => setSavingName(false))
                }
                if (e.key === 'Escape') setEditingName(false)
              }}
              autoFocus
              maxLength={30}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(34,197,94,0.4)',
                borderRadius: 8,
                color: '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                padding: '2px 12px',
                height: 40,
                flex: 1,
                maxWidth: 360,
                outline: 'none',
              }}
            />
            <button
              disabled={savingName}
              onClick={() => {
                const trimmed = draftName.trim()
                if (!trimmed) return
                setSavingName(true)
                attachToken()
                privateAPI.post('/team/update', { name: trimmed, teamId: resolvedTeamId })
                  .then(() => {
                    setSettings((prev) => ({ ...prev, team: { ...prev.team, name: trimmed } }))
                    setEditingName(false)
                    notification.success({ message: 'Team name updated!' })
                  })
                  .catch((err) => notification.error({ message: err.response?.data?.message || 'Failed to update' }))
                  .finally(() => setSavingName(false))
              }}
              style={{ background: '#22C55E', border: 'none', borderRadius: 8, color: '#0A0F1A', fontWeight: 700, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
            >
              {savingName ? '...' : 'Save'}
            </button>
            <button
              onClick={() => setEditingName(false)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1
            onClick={() => { setDraftName(team?.name || ''); setEditingName(true) }}
            title="Click to rename team"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {team?.name || 'My Team'}
            <CommissionerBadge show={isCommissioner && !hideBadge} size={18} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>&#9998;</span>
          </h1>
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
          {team?.league?.name || 'League'} &bull; {team?.abbreviation}
        </p>
      </div>

      {/* ═══ Team Logo Upload ═══ */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* Current logo or preview */}
        <div
          onClick={() => document.getElementById('logo-upload-input')?.click()}
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.3)',
            border: '2px dashed rgba(34,197,94,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.7)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'}
        >
          {logoPreview || team?.logo ? (
            <img
              src={logoPreview || team?.logo}
              alt="Team logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>
              {(team?.name || 'T')?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <input
          id='logo-upload-input'
          type='file'
          accept='image/png,image/jpeg,image/webp,image/gif'
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 5 * 1024 * 1024) {
              notification.error({ message: 'Image must be under 5MB' })
              return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (ev) => setLogoPreview(ev.target.result)
            reader.readAsDataURL(file)
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Rajdhani', sans-serif" }}>
            Team Logo
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.4 }}>
            Click the image to upload a new logo. PNG, JPG, or WebP, max 5MB.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => document.getElementById('logo-upload-input')?.click()}
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8,
                color: '#22C55E',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              Choose Image
            </button>
            <button
              onClick={() => setCrestOpen((o) => !o)}
              style={{
                background: crestOpen ? 'rgba(34,197,94,0.28)' : 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22C55E',
                fontSize: 12, fontWeight: 600, padding: '6px 14px', cursor: 'pointer',
              }}
            >
              Design Crest
            </button>
            {logoFile && (
              <>
                <button
                  disabled={savingLogo}
                  onClick={async () => {
                    setSavingLogo(true)
                    try {
                      attachToken()
                      const formData = new FormData()
                      formData.append('pictures', logoFile)
                      formData.append('teamId', resolvedTeamId)
                      await privateAPI.post('/team/update', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      })
                      notification.success({ message: 'Team logo updated!' })
                      setLogoFile(null)
                      setLogoPreview(null)
                      // Refresh in place instead of a hard reload — a reload
                      // re-derives the active team from the token and can bounce
                      // a multi-team user to their other team.
                      await fetchSettings(resolvedTeamId)
                    } catch (err) {
                      notification.error({ message: err.response?.data?.message || 'Failed to upload logo' })
                    }
                    setSavingLogo(false)
                  }}
                  style={{
                    background: '#22C55E',
                    border: 'none',
                    borderRadius: 8,
                    color: '#0A0F1A',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    opacity: savingLogo ? 0.6 : 1,
                  }}
                >
                  {savingLogo ? 'Uploading...' : 'Save Logo'}
                </button>
                <button
                  onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 12,
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Crest Designer */}
      {isOwner && crestOpen && (
        <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
          {[{ lbl: 'Primary colour', val: colorA, set: setColorA }, { lbl: 'Secondary colour (for split styles)', val: colorB, set: setColorB }].map((row) => (
            <div key={row.lbl} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>{row.lbl}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {COLORS.map((c) => (
                  <button key={c.key} onClick={() => row.set(c.val)} title={c.key}
                    style={{ width: 30, height: 30, borderRadius: 7, cursor: 'pointer', background: c.val,
                      border: row.val === c.val ? '2px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                      boxShadow: row.val === c.val ? '0 0 8px rgba(34,197,94,0.4)' : 'none' }} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 12px', fontFamily: "'Rajdhani', sans-serif" }}>Choose a style</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
            {CREST_STYLES.map((st) => (
              <button key={st.key} onClick={() => saveCrest(st.key)} disabled={savingLogo}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8,
                  cursor: savingLogo ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                <img alt={st.label} src={crestDataUri(st.key, team?.name || 'Team', colorA, colorB)} style={{ width: 76, height: 76 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{st.label}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>Click a style to set it as your team crest. You can change it anytime.</div>
        </div>
      )}

      {/* Owner Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#0A0F1A',
          }}>
            {owner?.userName?.charAt(0)?.toUpperCase() || 'O'}
          </div>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>{owner?.userName || 'Owner'}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: '#22C55E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Owner</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Full Access</span>
      </div>

      {/* Notifications */}
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
        Notifications
      </h2>
      <PushNotificationToggle />

      {/* ═══ Away / Vacation Status ═══ */}
      {isOwner && (() => {
        const isAwayActive = team?.awayUntil && new Date(team.awayUntil) > new Date()
        return (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '20px 24px',
            margin: '24px 0',
          }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
              Away Status
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 16px', lineHeight: 1.5 }}>
              Going on vacation? Set an away date so your lineup is auto-filled each week and incoming trades are held until you return.
            </p>

            {isAwayActive ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                    color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 6, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                  }}>
                    ✈ Away
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                    Away until {new Date(team.awayUntil).toLocaleDateString()}
                  </div>
                  {team?.awayMessage && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>&ldquo;{team.awayMessage}&rdquo;</div>
                  )}
                </div>
                <button
                  onClick={handleClearAway}
                  disabled={savingAway}
                  style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#EF4444', borderRadius: 8, padding: '8px 18px', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {savingAway ? '...' : 'Clear Away'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Away until</label>
                  <DatePicker
                    onChange={(d, ds) => setAwayUntilInput(ds || null)}
                    style={{ minWidth: 180 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Message (optional)</label>
                  <Input
                    value={awayMsgInput}
                    onChange={(e) => setAwayMsgInput(e.target.value)}
                    maxLength={280}
                    placeholder="e.g. On vacation, back next week"
                  />
                </div>
                <button
                  onClick={handleSetAway}
                  disabled={savingAway || !awayUntilInput}
                  style={{
                    background: awayUntilInput ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'rgba(110,105,128,0.2)',
                    border: 'none', color: awayUntilInput ? '#0A0F1A' : 'rgba(255,255,255,0.3)',
                    borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700,
                    cursor: awayUntilInput ? 'pointer' : 'default',
                  }}
                >
                  {savingAway ? 'Saving...' : 'Set Away'}
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ═══ Commissioner Badge (only for commissioners of this league) ═══ */}
      {isOwner && isCommissioner && (
        <div style={{
          background: 'rgba(217,170,0,0.05)',
          border: '1px solid rgba(217,170,0,0.25)',
          borderRadius: 12,
          padding: '20px 24px',
          margin: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                Commissioner Badge
              </h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(217,170,0,0.15)', border: '1px solid rgba(217,170,0,0.35)', borderRadius: 999, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: '#e8c400', lineHeight: 1.4 }}>
                <span aria-hidden>👮</span>Commissioner
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              Show a Commissioner badge on your team name everywhere your team appears in this league. You can hide it if you prefer.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              {hideBadge ? 'Hidden' : 'Visible'}
            </span>
            <Switch
              checked={!hideBadge}
              disabled={savingBadge}
              onChange={handleToggleBadge}
              style={{ background: !hideBadge ? '#e8c400' : 'rgba(110,105,128,0.3)' }}
            />
          </div>
        </div>
      )}

      {/* Staff Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
          Team Staff ({managers?.length || 0}/5)
        </h2>
        {isOwner && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                border: 'none', color: '#0A0F1A', padding: '10px 20px',
                borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              + Add by Username
            </button>
            <button
              onClick={async () => {
                try {
                  attachToken()
                  const res = await privateAPI.post(`/team/settings/${resolvedTeamId}/invite`, { role: 'assistant_gm' })
                  const link = res.data?.data?.inviteLink
                  if (link) {
                    navigator.clipboard.writeText(link)
                    notification.success({ message: t('inviteLinkCopied'), description: link, duration: 10 })
                  }
                } catch (err) {
                  notification.error({ message: err.response?.data?.message || t('failedToUpdate') })
                }
              }}
              style={{
                background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)',
                color: '#D4A843', padding: '10px 20px',
                borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              🔗 Generate Invite Link
            </button>
          </div>
        )}
      </div>

      {(!managers || managers.length === 0) ? (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '48px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>No Staff Members Yet</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Add assistant GMs, scouts, or analysts to help manage your team. Each role comes with customizable permissions.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {managers.map((m) => {
            const roleInfo = ROLES.find((r) => r.key === m.role) || ROLES[1]
            return (
              <div key={m._id} style={{
                background: 'rgba(20,28,45,0.8)', border: '1px solid rgba(110,105,128,0.15)',
                borderRadius: 14, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${roleInfo.color}20`, border: `1px solid ${roleInfo.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ROLE_BADGES[roleInfo.key] ? ROLE_BADGES[roleInfo.key](roleInfo.color, 22) : (
                        <span style={{ fontSize: 16, fontWeight: 700, color: roleInfo.color }}>
                          {m.user?.userName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        {m.user?.userName || 'Unknown'} {m.nickname ? `(${m.nickname})` : ''}
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 10, fontWeight: 700, color: roleInfo.color,
                        padding: '2px 8px 2px 4px', borderRadius: 6,
                        background: `${roleInfo.color}15`, border: `1px solid ${roleInfo.color}30`,
                        fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {ROLE_BADGES[roleInfo.key] && ROLE_BADGES[roleInfo.key](roleInfo.color, 12)}
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={m.role}
                        onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)',
                          color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer',
                        }}
                      >
                        {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                      </select>
                      <button
                        onClick={() => setPayModal({ open: true, managerId: m._id, managerName: m.user?.userName })}
                        style={{
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22C55E', borderRadius: 6, padding: '4px 10px', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Pay SP
                      </button>
                      <button
                        onClick={() => handleRemoveManager(m._id, m.user?.userName)}
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                          color: '#EF4444', borderRadius: 6, padding: '4px 10px', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Fire
                      </button>
                    </div>
                  )}
                  {/* Quit button for the assistant themselves */}
                  {!isOwner && m.user?._id === user?._id && (
                    <button
                      onClick={handleQuit}
                      style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#EF4444', borderRadius: 8, padding: '8px 16px', fontSize: 12,
                        fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif",
                        width: '100%', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}
                    >
                      Resign from this Team
                    </button>
                  )}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px',
                  background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '12px 16px',
                }}>
                  {PERMISSIONS.map((perm) => (
                    <div key={perm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{perm.label}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{perm.desc}</div>
                      </div>
                      <Switch
                        size="small"
                        checked={m.permissions?.[perm.key] ?? false}
                        disabled={!isOwner}
                        onChange={(checked) => handleUpdatePermission(m._id, perm.key, checked)}
                        style={{ background: m.permissions?.[perm.key] ? '#22C55E' : 'rgba(110,105,128,0.3)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        title={null} open={addModal} onCancel={() => setAddModal(false)}
        footer={null} width={960}
        styles={{
          content: { background: '#111827', border: '1px solid rgba(110,105,128,0.2)', borderRadius: 16, padding: 0 },
          mask: { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' },
        }}
        closable={false}
      >
        <div style={{ padding: 28 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Add Staff Member</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Username</label>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Enter their username"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>1. Select Role</label>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Choose a role template to get started. Permissions are applied automatically and can be tuned per staff member afterward.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
              {ROLES.map((r) => {
                const cc = ROLE_CARD[r.key]; const sel = newRole === r.key
                return (
                  <div key={r.key} onClick={() => setNewRole(r.key)}
                    style={{ position: 'relative', padding: 16, borderRadius: 14, cursor: 'pointer', background: sel ? `${cc.color}12` : 'rgba(0,0,0,0.22)', border: `1.5px solid ${sel ? cc.color + '99' : 'rgba(110,105,128,0.16)'}`, boxShadow: sel ? `0 0 18px ${cc.color}33` : 'none', transition: 'all 0.15s ease' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? cc.color : 'rgba(255,255,255,0.2)'}`, background: sel ? cc.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A0F1A' }} />}</div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 10px', background: `${cc.color}18`, border: `1px solid ${cc.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ROLE_BADGES[r.key](cc.color, 24)}</div>
                    <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>{r.label}</div>
                    <div style={{ textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.4)', margin: '3px 0 12px', minHeight: 26 }}>{r.desc}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                      {cc.preview.map(([label, on]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>
                          <span style={{ color: on ? '#22C55E' : '#EF4444', fontWeight: 800, fontSize: 12 }}>{on ? '✓' : '✕'}</span>{label}
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: cc.color, background: `${cc.color}14`, border: `1px solid ${cc.color}33`, borderRadius: 7, padding: '5px 0' }}>{cc.badge}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Nickname (optional)</label>
            <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} placeholder="e.g. Joe's Scout"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setAddModal(false)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >Cancel</button>
            <button onClick={handleAddManager} disabled={adding || !newUsername.trim()}
              style={{
                background: newUsername.trim() ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'rgba(110,105,128,0.2)',
                border: 'none', color: newUsername.trim() ? '#0A0F1A' : 'rgba(255,255,255,0.3)',
                padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: newUsername.trim() ? 'pointer' : 'default',
              }}
            >{adding ? 'Adding...' : 'Add to Team'}</button>
          </div>
        </div>
      </Modal>

      {/* Pay Staff Modal */}
      <Modal
        title={null} open={payModal.open} onCancel={() => { setPayModal({ open: false, managerId: null, managerName: '' }); setPayAmount('') }}
        footer={null} width={400}
        styles={{ content: { background: '#111827', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: 0 }, mask: { background: 'rgba(0,0,0,0.7)' } }}
        closable={false}
      >
        <div style={{ padding: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Pay {payModal.managerName}</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 20px' }}>Send SamPoints as salary payment. This comes from your personal SP balance.</p>
          <div style={{ marginBottom: 16 }}>
            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Amount (SP)"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)', color: '#fff', fontSize: 16, fontWeight: 700, outline: 'none' }} />
            {payAmount && parseInt(payAmount) > 0 && <div style={{ fontSize: 11, color: '#22C55E', marginTop: 6 }}>{parseInt(payAmount).toLocaleString()} SP</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => { setPayModal({ open: false, managerId: null, managerName: '' }); setPayAmount('') }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handlePay} disabled={!payAmount || parseInt(payAmount) <= 0}
              style={{ background: payAmount && parseInt(payAmount) > 0 ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'rgba(110,105,128,0.2)', border: 'none', color: payAmount && parseInt(payAmount) > 0 ? '#fff' : 'rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: payAmount && parseInt(payAmount) > 0 ? 'pointer' : 'default' }}>Send Payment</button>
          </div>
        </div>
      </Modal>

      {/* ═══ Danger Zone ═══ */}
      {isOwner && (
        <div style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12,
          padding: '20px 24px',
          marginTop: 32,
        }}>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: '#EF4444', margin: '0 0 6px' }}>
            Danger Zone
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 16px', lineHeight: 1.5 }}>
            Permanently delete this team. This is only possible before the draft starts and while your roster is empty. Otherwise, ask your commissioner to remove it.
          </p>
          <button
            onClick={handleDeleteTeam}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#EF4444', borderRadius: 8, padding: '9px 20px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Delete Team
          </button>
        </div>
      )}
    </div>
  )
}

export default TeamSettings
