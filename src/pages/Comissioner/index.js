import { Button, Select, InputNumber, Switch, Input, notification, Spin, Dropdown, Modal, Radio, TimePicker, Card, Tabs, Tooltip, Tag } from 'antd'
import { useEffect, useState, useMemo } from 'react'
import SamDatePicker from '../../components/SamDatePicker'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  SettingOutlined,
  TeamOutlined,
  SwapOutlined,
  OrderedListOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import { getLeagueDetails, getProfessionalLeagueRanks, impersonateUser, updateCommissionersInLeague, getSamMetric } from '../../redux'
import { updateLeagueCommissioner, deleteLeagueCommissioner } from '../../redux/actions/leagueActions'
import { attachToken, privateAPI } from '../../config/constants'
import { getRenewalStatus, respondToRenewal, revokeCancellation, transferCommissioner } from '../../redux/actions/seasonRenewalAction'
import { updateTeamConfDivision, getAllTeamsList } from '../../redux/actions/teamActions'
import { createConference, createDivision } from '../../redux/actions/confAndDivisionAction'
import {
  createDraftRound,
  createRandomizedDraftRound,
  deleteDraftRound,
  generateAllRound,
  getDraftRound,
} from '../../redux/actions/draftAction'
import useDebounce from '../../hooks/useDebounce'
import Header from '../../components/Header'
import OnboardingGuide from '../../components/OnboardingGuide'
import { useLanguage } from '../../i18n/LanguageContext'

import '../../styles/pages/commissioner.css'

// ── Design System Constants (matches Soccer Commissioner) ──
const COLORS = {
  bg: '#0A0F1A',
  glass: 'rgba(20, 28, 45, 0.6)',
  border: 'rgba(110, 105, 128, 0.15)',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryHigh: '#4ADE80',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  textDim: 'rgba(255,255,255,0.6)',
}

const GLASS_STYLE = {
  background: COLORS.glass,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
}

const TABS = [
  { key: 'inbox', labelKey: 'inbox', icon: <InboxOutlined /> },
  { key: 'rules', labelKey: 'gameRules', icon: <SettingOutlined /> },
  { key: 'scoring', labelKey: 'scoring', icon: <TrophyOutlined /> },
  { key: 'teams', labelKey: 'teamsAndOwners', icon: <TeamOutlined /> },
  { key: 'trades', labelKey: 'trades', icon: <SwapOutlined /> },
  { key: 'draft', labelKey: 'draft', icon: <OrderedListOutlined /> },
  { key: 'integrity', labelKey: 'teamControl', icon: <SafetyCertificateOutlined /> },
  { key: 'admins', labelKey: 'commissioners', icon: <UserSwitchOutlined /> },
  { key: 'season', labelKey: 'season', icon: <CalendarOutlined /> },
]

/* ═══════════════════════════════════════════════════════════
   SAM METRIC POSITIONS, Platform Scoring System
   ═══════════════════════════════════════════════════════════ */
const SAM_POSITIONS = [
  { name: 'Quarter Back', abbr: 'QB', color: '#FFE871' },
  { name: 'Running Back', abbr: 'RB', color: '#FFFF72' },
  { name: 'Wide Receiver', abbr: 'WR', color: '#EE909E' },
  { name: 'Tight End', abbr: 'TE', color: '#EE919E' },
  { name: 'Offensive Lineman', abbr: 'OL', color: '#FE73FF' },
  { name: 'Interior D-Lineman', abbr: 'DT', color: '#93FF94' },
  { name: 'Edge Rusher', abbr: 'DE', color: '#93FF94' },
  { name: 'Linebacker', abbr: 'LB', color: '#98CBE6' },
  { name: 'Corner Back', abbr: 'CB', color: '#C3E2A6' },
  { name: 'Safeties', abbr: 'S', color: '#98CCE6' },
  { name: 'Punter', abbr: 'P', color: '#98CBE6' },
  { name: 'Kicker', abbr: 'K', color: '#D1D0C6' },
]

// SAM Metric 53-man roster defaults (min 1 per position)
const DEFAULT_ROSTER = {
  QB: 3,
  RB: 4,
  WR: 6,
  TE: 3,
  OL: 9,
  DT: 4,
  DE: 4,
  LB: 7,
  CB: 6,
  S: 4,
  K: 1,
  P: 2,
}

const Comissioner = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [tab, setTab] = useState('inbox')
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState(null)
  const SETTING = useSelector((state) => state.user?.setting)
  const user = useSelector((state) => state.user?.userDetails)
  const userLeague = useSelector((state) => state.user?.SamPoints?.league)
  const leagueState = useSelector((state) => state.league) || {}
  const currentLeague = leagueState.currentLeague

  // Access gate is league-aware: trust the global `user.isCommissioner` flag
  // when set (legacy behavior), AND fall back to a fresh check of the active
  // league document. Previously we only used the global flag, which meant that
  // newly-added co-commissioners got "Commissioner Access Required" until they
  // logged out and back in — because the global boolean hadn't been refreshed
  // on their session yet.
  const requesterId = String(user?._id || user?.id || '')
  const ownerId = String(currentLeague?.createdBy?._id || currentLeague?.createdBy || '')
  const coId = String(currentLeague?.coComissioner?._id || currentLeague?.coComissioner || '')
  const leagueCommIds = (currentLeague?.leagueCommissioners || []).map((c) => String(c?._id || c))
  const isLeagueCommissioner = !!requesterId && (
    (!!ownerId && requesterId === ownerId) ||
    (!!coId && requesterId === coId) ||
    leagueCommIds.includes(requesterId)
  )
  const isCommissioner = (user?.isCommissioner ?? false) || isLeagueCommissioner
  const currentLeagueId = user?.team?.currentLeague?._id

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem('token')) {
        await getLeagueDetails()
        await getProLeagueRank()
      }
      setLoading(false)
    }
    init()
  }, [SETTING?.week, currentLeagueId])

  const getProLeagueRank = async () => {
    let data = await getProfessionalLeagueRanks(SETTING?.week)
    setTeams(data?.teams)
  }

  if (loading) {
    return (
      <>
        <Header />
        <hr className='divider' />
        <div className='cm-page'>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Spin size='large' />
          </div>
        </div>
      </>
    )
  }

  if (!isCommissioner) {
    return (
      <>
        <Header />
        <hr className='divider' />
        <div className='cm-page'>
          <div className='cm-unauthorized'>
            <svg width='56' height='56' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.15)' strokeWidth='1.5'>
              <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
              <path d='M7 11V7a5 5 0 0 1 10 0v4' />
            </svg>
            <p>Commissioner Access Required</p>
            <span>Only league commissioners can manage these settings</span>
          </div>
        </div>
      </>
    )
  }

  const tabItems = TABS.map((tabDef) => ({
    key: tabDef.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}>
        {tabDef.icon} {t(tabDef.labelKey)}
      </span>
    ),
    children:
      tabDef.key === 'inbox' ? <InboxTab currentLeague={currentLeague} /> :
      tabDef.key === 'rules' ? <GameRulesTab currentLeague={currentLeague} /> :
      tabDef.key === 'scoring' ? <ScoringTab currentLeague={currentLeague} /> :
      tabDef.key === 'teams' ? <TeamsTab teams={teams} currentLeague={currentLeague} user={user} userLeague={userLeague} /> :
      tabDef.key === 'trades' ? <TradesTab /> :
      tabDef.key === 'draft' ? <DraftTab currentLeague={currentLeague} /> :
      tabDef.key === 'integrity' ? <TeamControlTab teams={teams} currentLeague={currentLeague} /> :
      tabDef.key === 'admins' ? <AdminsTab teams={teams} user={user} userLeague={userLeague} currentLeague={currentLeague} /> :
      tabDef.key === 'season' ? <SeasonTab teams={teams} user={user} currentLeague={currentLeague} /> :
      null,
  }))

  return (
    <>
      <Header />
      <OnboardingGuide tabKey="commissioner" />
      <hr className='divider' />
      <div className='cm-page' style={{
        background: COLORS.bg,
        minHeight: '100vh',
        paddingBottom: '60px',
        display: 'block',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 24px',
        }}>
          {/* HEADER */}
          <div style={{
            ...GLASS_STYLE,
            padding: '32px',
            marginBottom: '40px',
          }}>
            <button
              onClick={() => navigate('/homepage')}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                padding: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ← {t('backToLeague')}
            </button>
            <h1 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '36px',
              fontWeight: 800,
              color: COLORS.text,
              margin: '0 0 8px 0',
            }}>
              {currentLeague?.leagueName || currentLeague?.leagueId || 'League'} {t('commissionerSettings')}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: COLORS.textMuted,
              margin: 0,
            }}>
              {t('configureLeague')}
            </p>
          </div>

          {/* TABS */}
          <div style={{
            ...GLASS_STYLE,
            padding: '32px',
          }}>
            <Tabs
              activeKey={tab}
              onChange={setTab}
              items={tabItems}
              tabBarStyle={{
                borderBottom: `1px solid ${COLORS.border}`,
                marginBottom: '32px',
              }}
              tabBarExtraContent={null}
            />
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Game Rules, Fantasy football specific
   ═══════════════════════════════════════════════════════════ */
const GameRulesTab = ({ currentLeague }) => {
  const currentLeagueId = currentLeague?._id
  const [saving, setSaving] = useState(false)
  const [leagueId, setLeagueId] = useState(currentLeague?.leagueId || '')
  const [roster, setRoster] = useState(() => {
    let settings = currentLeague?.rosterSettings || {}
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings) } catch { settings = {} }
    }
    return { ...DEFAULT_ROSTER, ...settings }
  })

  // League Mode & Scoring Mode
  const [leagueMode, setLeagueMode] = useState(currentLeague?.leagueMode ?? 'full')
  const [scoringMode, setScoringMode] = useState(currentLeague?.scoringMode ?? 'sam_metric')

  // Draft Position Mode
  const [draftPositionMode, setDraftPositionMode] = useState(currentLeague?.draftPositionMode ?? 'auction')

  // Draft Pick Timer (minutes per pick)
  const [draftPickTimer, setDraftPickTimer] = useState(currentLeague?.draftPickTimer ?? 2)

  // Economy / Auction settings state
  const [auctionDuration, setAuctionDuration] = useState(currentLeague?.auctionDuration ?? 24)
  const [startingSamPoints, setStartingSamPoints] = useState(currentLeague?.startingSamPoints ?? 300000000)
  const [salaryCap, setSalaryCap] = useState(currentLeague?.salaryCap ?? (() => { try { return JSON.parse(localStorage.getItem('samsports_cap_settings') || '{}').nflCeiling || 301200000; } catch { return 301200000; } })())
  const [commissionFee, setCommissionFee] = useState(currentLeague?.commissionFee ?? 15)

  // Draft Schedule dates (model fields: draftStart, computedAuctionDate)
  const [preAuctionDate, setPreAuctionDate] = useState(currentLeague?.computedAuctionDate || currentLeague?.spotAuctionEnd || null)
  const [draftDate, setDraftDate] = useState(currentLeague?.draftStart || null)

  // Trade Rules toggles
  const [tradeReviewEnabled, setTradeReviewEnabled] = useState(currentLeague?.tradeReviewEnabled ?? true)
  const [commissionerApproval, setCommissionerApproval] = useState(currentLeague?.commissionerApproval ?? true)
  const [allowDraftPickTrading, setAllowDraftPickTrading] = useState(currentLeague?.allowDraftPickTrading ?? true)
  const [tradeDeadlineEnabled, setTradeDeadlineEnabled] = useState(currentLeague?.tradeDeadlineEnabled ?? false)

  // Auction & Free Agency toggles
  const [freeAgentAuctionsEnabled, setFreeAgentAuctionsEnabled] = useState(currentLeague?.freeAgentAuctionsEnabled ?? true)
  const [ownerAuctionsEnabled, setOwnerAuctionsEnabled] = useState(currentLeague?.ownerToOwnerAuctionsEnabled ?? true)
  const [auctionApprovalRequired, setAuctionApprovalRequired] = useState(currentLeague?.commissionerAuctionApproval ?? false)
  const [poachingEnabled, setPoachingEnabled] = useState(currentLeague?.practiceSquadPoachingEnabled ?? true)

  // Sync ALL fields from currentLeague when it loads asynchronously
  // (useState initializers only run once — if currentLeague was null on mount,
  //  fields would be stuck on defaults forever without this effect)
  useEffect(() => {
    if (!currentLeague) return
    setLeagueId(currentLeague.leagueId || '')
    setLeagueMode(currentLeague.leagueMode ?? 'full')
    setScoringMode(currentLeague.scoringMode ?? 'sam_metric')
    setDraftPositionMode(currentLeague.draftPositionMode ?? 'auction')
    setDraftPickTimer(currentLeague.draftPickTimer ?? 2)
    setAuctionDuration(currentLeague.auctionDuration ?? 24)
    setStartingSamPoints(currentLeague.startingSamPoints ?? 300000000)
    if (currentLeague.salaryCap != null) setSalaryCap(currentLeague.salaryCap)
    setCommissionFee(currentLeague.commissionFee ?? 15)
    setPreAuctionDate(currentLeague.computedAuctionDate || currentLeague.spotAuctionEnd || null)
    setDraftDate(currentLeague.draftStart || null)
    setTradeReviewEnabled(currentLeague.tradeReviewEnabled ?? true)
    setCommissionerApproval(currentLeague.commissionerApproval ?? true)
    setAllowDraftPickTrading(currentLeague.allowDraftPickTrading ?? true)
    setTradeDeadlineEnabled(currentLeague.tradeDeadlineEnabled ?? false)
    setFreeAgentAuctionsEnabled(currentLeague.freeAgentAuctionsEnabled ?? true)
    setOwnerAuctionsEnabled(currentLeague.ownerToOwnerAuctionsEnabled ?? true)
    setAuctionApprovalRequired(currentLeague.commissionerAuctionApproval ?? false)
    setPoachingEnabled(currentLeague.practiceSquadPoachingEnabled ?? true)
    // Sync roster
    let settings = currentLeague.rosterSettings || {}
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings) } catch { settings = {} }
    }
    if (typeof settings === 'object' && !Array.isArray(settings)) {
      setRoster({ ...DEFAULT_ROSTER, ...settings })
    }
  }, [currentLeague?._id])

  // Auto-save toggle changes
  const handleToggleSave = async (field, value) => {
    await updateLeagueCommissioner({ _id: currentLeague?._id, [field]: value })
  }

  // Update league settings (used by rookie draft format selector, etc.)
  const handleUpdateLeague = async (updates) => {
    await updateLeagueCommissioner({ _id: currentLeague?._id, ...updates })
  }

  // Conference / Division state, scales with numberOfTeams
  // 10 teams → 2 conf × 1 div, 16 → 2×2, 24 → 2×3, 32 → 2×4
  const numTeams = currentLeague?.numberOfTeams || 32
  const divsPerConf = numTeams <= 10 ? 1 : numTeams <= 16 ? 2 : numTeams <= 24 ? 3 : 4
  const totalDivs = divsPerConf * 2

  const [conf1, setConf1] = useState('')
  const [conf2, setConf2] = useState('')
  const [divisions, setDivisions] = useState(Array(8).fill(''))

  // ── Expansion Draft state ──
  const [expansionDraft, setExpansionDraft] = useState(null)
  const [expansionNewSize, setExpansionNewSize] = useState(null)
  const [expansionProtCount, setExpansionProtCount] = useState(8)
  const [expansionRounds, setExpansionRounds] = useState(5)
  const [expansionSaving, setExpansionSaving] = useState(false)
  const [expansionDateSaving, setExpansionDateSaving] = useState(false)

  // Load expansion draft status
  useEffect(() => {
    if (currentLeagueId) {
      attachToken()
      privateAPI.get(`/expansion-draft/status/${currentLeagueId}`)
        .then(res => setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null))
        .catch(() => setExpansionDraft(null))
    }
  }, [currentLeagueId])

  // Expansion draft valid sizes
  const expansionValidSizes = useMemo(() => {
    const sizes = []
    if (numTeams >= 10 && numTeams <= 22) {
      for (let s = 10; s <= 22; s += 2) { if (s !== numTeams) sizes.push(s) }
      sizes.push(32)
    } else if (numTeams === 24) {
      sizes.push(32)
    } else if (numTeams === 32) {
      for (let s = 10; s <= 22; s += 2) { sizes.push(s) }
      sizes.push(24)
    }
    return sizes
  }, [numTeams])

  // ── Max expansion draft rounds = roster size - protected count ──
  const rosterSize = leagueMode === 'full' ? 53 : 20
  const maxExpansionRounds = Math.max(1, rosterSize - expansionProtCount)

  const handleInitiateExpansion = async () => {
    if (!expansionNewSize) return
    setExpansionSaving(true)
    try {
      attachToken()
      const res = await privateAPI.post('/expansion-draft/initiate', {
        leagueId: currentLeagueId,
        newSize: expansionNewSize,
        protectedPlayerCount: expansionProtCount,
        totalRounds: expansionRounds,
      })
      setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null)
      notification.success({ message: `Expansion draft initiated: ${expansionNewSize > numTeams ? 'expand' : 'contract'} to ${expansionNewSize} teams` })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to initiate expansion draft' })
    } finally { setExpansionSaving(false) }
  }

  const handleCancelExpansion = async () => {
    Modal.confirm({
      title: 'Cancel Expansion Draft?',
      content: 'This will cancel the current expansion/contraction process.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          attachToken()
          await privateAPI.post('/expansion-draft/cancel', { leagueId: currentLeagueId })
          setExpansionDraft(null)
          notification.success({ message: 'Expansion draft cancelled' })
        } catch (err) {
          notification.error({ message: err.response?.data?.message || 'Failed to cancel' })
        }
      }
    })
  }

  const handleStartProtectionVote = async () => {
    setExpansionSaving(true)
    try {
      attachToken()
      await privateAPI.post('/expansion-draft/start-protection-vote', {
        leagueId: currentLeagueId,
        proposedCount: expansionProtCount,
        votingDays: 2,
      })
      const res = await privateAPI.get(`/expansion-draft/status/${currentLeagueId}`)
      setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null)
      notification.success({ message: 'Protection vote started' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to start vote' })
    } finally { setExpansionSaving(false) }
  }

  const handleForceProtectionDeadline = async () => {
    setExpansionSaving(true)
    try {
      attachToken()
      await privateAPI.post('/expansion-draft/force-protection-deadline', { leagueId: currentLeagueId })
      const res = await privateAPI.get(`/expansion-draft/status/${currentLeagueId}`)
      setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null)
      notification.success({ message: 'Protection deadline forced. Draft ready.' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to force deadline' })
    } finally { setExpansionSaving(false) }
  }

  const handleStartExpansionDraft = async () => {
    setExpansionSaving(true)
    try {
      attachToken()
      await privateAPI.post('/expansion-draft/start', { leagueId: currentLeagueId })
      const res = await privateAPI.get(`/expansion-draft/status/${currentLeagueId}`)
      setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null)
      notification.success({ message: 'Expansion draft is live!' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to start draft' })
    } finally { setExpansionSaving(false) }
  }

  const handleSetExpansionDraftDate = async (dateValue) => {
    setExpansionDateSaving(true)
    try {
      attachToken()
      const draftDate = dateValue ? dateValue.toISOString() : null
      await privateAPI.post('/expansion-draft/set-date', { leagueId: currentLeagueId, draftDate })
      notification.success({ message: draftDate ? 'Draft date set! All teams have been notified.' : 'Draft date cleared' })
      const res = await privateAPI.get(`/expansion-draft/status/${currentLeagueId}`)
      setExpansionDraft(res.data?.data?.expansionDraft || res.data?.expansionDraft || null)
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to set draft date' })
    } finally { setExpansionDateSaving(false) }
  }

  useEffect(() => {
    if (currentLeague) {
      setLeagueId(currentLeague.leagueId || '')
      const c1 = currentLeague.conferences?.find((v) => v?.key === 1)
      const c2 = currentLeague.conferences?.find((v) => v?.key === 2)
      setConf1(c1?.name || '')
      setConf2(c2?.name || '')
      const divs = Array(8).fill('')
      currentLeague.divisions?.forEach((d) => {
        if (d?.key >= 1 && d?.key <= 8) divs[d.key - 1] = d.name || ''
      })
      setDivisions(divs)
    }
  }, [currentLeague])

  const _handleConference = useDebounce((name, key) => {
    createConference({ name, key })
  }, 1000)

  const _handleDivision = useDebounce((payload) => {
    createDivision(payload)
  }, 1000)

  const handleDivisionChange = (val, key) => {
    const newDivs = [...divisions]
    newDivs[key - 1] = val
    setDivisions(newDivs)
    const c1 = currentLeague?.conferences?.find((v) => v?.key === 1)
    const c2 = currentLeague?.conferences?.find((v) => v?.key === 2)
    const conferenceId = key <= divsPerConf ? c1?._id : c2?._id
    _handleDivision({ name: val, key, conference: conferenceId })
  }

  const handleSaveGeneral = async () => {
    setSaving(true)
    await updateLeagueCommissioner({
      _id: currentLeague?._id,
      leagueId,
      leagueMode,
      scoringMode: leagueMode === 'full' ? 'sam_metric' : scoringMode,
      rosterSettings: roster,
      draftPositionMode,
      draftPickTimer,
      auctionDuration,
      commissionFee,
      computedAuctionDate: preAuctionDate,
      spotAuctionEnd: preAuctionDate,
      draftStart: draftDate,
    })
    setSaving(false)
  }

  const updateRoster = (pos, val) => {
    setRoster((prev) => ({ ...prev, [pos]: val }))
  }

  return (
    <>
      {/* General Settings */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-blue'>
            <SettingOutlined />
          </div>
          <h3 className='cm-section-title'>General Settings</h3>
        </div>
        <div className='cm-form-grid'>
          <div className='cm-field'>
            <label className='cm-field-label'>League ID</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#F1F5F9', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '1px', flex: 1 }}>
                {leagueId || '—'}
              </span>
              <span
                style={{ cursor: 'pointer', fontSize: '12px', color: '#22C55E', fontWeight: 600 }}
                onClick={() => navigator.clipboard.writeText(leagueId || '')}
              >
                Copy
              </span>
            </div>
            <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Auto-generated. Cannot be changed.</span>
          </div>
        </div>
      </div>

      {/* League Mode & Scoring */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-green'>
            <TrophyOutlined />
          </div>
          <h3 className='cm-section-title'>League Mode</h3>
          <span className='cm-section-desc'>Choose the game format for this league</span>
        </div>

        <div className='cm-draft-pick-cards'>
          {[
            {
              value: 'full',
              emoji: '🏟️',
              title: 'Full Mode',
              desc: '53-man full roster (46 active, 7 inactive), Offense, Defense & Special Teams. SAM Metric scoring with 22 starters + K + P.',
              tag: 'Default',
              tagColor: '#22C55E',
            },
            {
              value: 'offense_only',
              emoji: '🎯',
              title: 'Offense Only',
              desc: '30-player roster, Skill position players + kicker only. Choose your preferred scoring format below.',
              tag: 'Casual',
              tagColor: '#2899c9',
            },
          ].map((opt) => (
            <div
              key={opt.value}
              className={`cm-draft-pick-card ${leagueMode === opt.value ? 'cm-draft-pick-card--active' : ''}`}
              onClick={() => {
                setLeagueMode(opt.value)
                if (opt.value === 'full') setScoringMode('sam_metric')
                else if (scoringMode === 'sam_metric') setScoringMode('ppr')
              }}
            >
              <div className='cm-draft-pick-card-top'>
                <span className='cm-draft-pick-card-emoji'>{opt.emoji}</span>
                {leagueMode === opt.value && (
                  <span className='cm-draft-pick-card-check'>✓</span>
                )}
              </div>
              <h4 className='cm-draft-pick-card-title'>{opt.title}</h4>
              <p className='cm-draft-pick-card-desc'>{opt.desc}</p>
              <span className='cm-draft-pick-card-tag' style={{ '--tag-color': opt.tagColor }}>{opt.tag}</span>
            </div>
          ))}
        </div>

        {leagueMode === 'offense_only' && (
          <div style={{ marginTop: 20 }}>
            <label className='cm-field-label' style={{ marginBottom: 12, display: 'block' }}>Scoring Format</label>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>
              Choose how player performance is scored in this league.
            </p>
            <div className='cm-timer-options'>
              {[
                { value: 'ppr', label: 'PPR', desc: '1 pt/rec', icon: '🏈' },
                { value: 'half_ppr', label: 'Half PPR', desc: '0.5 pt/rec', icon: '📊' },
                { value: 'standard', label: 'Standard', desc: 'No rec bonus', icon: '📋' },
                { value: 'superflex', label: 'Superflex', desc: 'PPR + SF slot', icon: '⚡' },
                { value: 'te_premium', label: 'TE Premium', desc: '1.5 pt TE rec', icon: '🎯' },
              ].map((opt) => (
                <div
                  key={opt.value}
                  className={`cm-timer-chip ${scoringMode === opt.value ? 'cm-timer-chip--active' : ''}`}
                  onClick={() => setScoringMode(opt.value)}
                >
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  <span className='cm-timer-chip-label'>{opt.label}</span>
                  <span className='cm-timer-chip-desc'>{opt.desc}</span>
                  {opt.value === 'ppr' && <span className='cm-timer-chip-rec'>Popular</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {leagueMode === 'full' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.15)' }}>
            <span style={{ fontSize: 13, color: '#22C55E', fontWeight: 600 }}>SAM Metric Scoring</span>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
              Full Mode uses SAM Metric, a proprietary scoring system that evaluates all positions (offense, defense, special teams) with a unified metric.
            </p>
          </div>
        )}
      </div>

      {/* Roster Settings */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-green'>
            <TeamOutlined />
          </div>
          <h3 className='cm-section-title'>Roster Positions</h3>
          <span className='cm-section-desc'>Set how many slots per position</span>
        </div>
        <div className='cm-roster-grid'>
          {Object.entries(roster).filter(([pos]) => Object.keys(DEFAULT_ROSTER).includes(pos)).map(([pos, count]) => {
            const DEFENSE_POSITIONS = ['DT', 'DE', 'LB', 'CB', 'S', 'P']
            const isBlocked = leagueMode === 'offense_only' && DEFENSE_POSITIONS.includes(pos)
            return (
              <div key={pos} className='cm-roster-slot' style={isBlocked ? { opacity: 0.35, pointerEvents: 'none', position: 'relative' } : {}}>
                <span className='cm-roster-pos'>{pos}</span>
                <InputNumber
                  className='cm-roster-count-input'
                  min={isBlocked ? 0 : 1}
                  max={15}
                  value={isBlocked ? 0 : count}
                  onChange={(val) => updateRoster(pos, val)}
                  size='small'
                  disabled={isBlocked}
                />
                {isBlocked && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: '#ff4d4f', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 5px', lineHeight: '16px' }}>N/A</span>
                )}
              </div>
            )
          })}
        </div>
        {(() => {
          const total = Object.entries(roster)
            .filter(([pos]) => Object.keys(DEFAULT_ROSTER).includes(pos))
            .reduce((sum, [pos, count]) => {
              const DEFENSE_POSITIONS = ['DT', 'DE', 'LB', 'CB', 'S', 'P']
              if (leagueMode === 'offense_only' && DEFENSE_POSITIONS.includes(pos)) return sum
              return sum + (count || 0)
            }, 0)
          return (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: total === 53 ? COLORS.primary : '#F97316' }}>
                Roster Total: {total} / 53
              </span>
              {total !== 53 && (
                <span style={{ fontSize: 11, color: '#F97316', fontFamily: "'Inter', sans-serif" }}>
                  ({total < 53 ? `${53 - total} slots remaining` : `${total - 53} over limit`})
                </span>
              )}
            </div>
          )
        })()}
        {leagueMode === 'offense_only' && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
            Offense Only mode, defensive positions (DT, DE, LB, CB, S) and Punter are not available.
          </p>
        )}
      </div>

      {/* Trade Rules */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-amber'>
            <SwapOutlined />
          </div>
          <h3 className='cm-section-title'>Trade Rules</h3>
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Trade Review Period</span>
            <span className='cm-toggle-desc'>After AI approval, give other owners 24 hours to review trades before they process</span>
          </div>
          <Switch checked={tradeReviewEnabled} onChange={(v) => { setTradeReviewEnabled(v); handleToggleSave('tradeReviewEnabled', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Commissioner Override</span>
            <span className='cm-toggle-desc'>AI Commissioner auto-approves fair trades, enable this to also require your manual approval on trades the AI did not auto-approve</span>
          </div>
          <Switch checked={commissionerApproval} onChange={(v) => { setCommissionerApproval(v); handleToggleSave('commissionerApproval', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Allow Draft Pick Trading</span>
            <span className='cm-toggle-desc'>Teams can trade future draft picks</span>
          </div>
          <Switch checked={allowDraftPickTrading} onChange={(v) => { setAllowDraftPickTrading(v); handleToggleSave('allowDraftPickTrading', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Trade Deadline Enforcement</span>
            <span className='cm-toggle-desc'>Block trades after the configured deadline week</span>
          </div>
          <Switch checked={tradeDeadlineEnabled} onChange={(v) => { setTradeDeadlineEnabled(v); handleToggleSave('tradeDeadlineEnabled', v) }} />
        </div>
      </div>

      {/* Auction & Free Agency */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-purple'>
            <OrderedListOutlined />
          </div>
          <h3 className='cm-section-title'>Auction & Free Agency</h3>
          <span className='cm-section-desc'>Player acquisition via SamPoints bidding</span>
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Free Agent Auctions</span>
            <span className='cm-toggle-desc'>Allow owners to auction free agents using SamPoints, starting bid equals the player&apos;s salary cap hit</span>
          </div>
          <Switch checked={freeAgentAuctionsEnabled} onChange={(v) => { setFreeAgentAuctionsEnabled(v); handleToggleSave('freeAgentAuctionsEnabled', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Owner-to-Owner Auctions</span>
            <span className='cm-toggle-desc'>Allow owners to put their rostered players up for auction with a custom starting bid</span>
          </div>
          <Switch checked={ownerAuctionsEnabled} onChange={(v) => { setOwnerAuctionsEnabled(v); handleToggleSave('ownerToOwnerAuctionsEnabled', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Commissioner Auction Approval</span>
            <span className='cm-toggle-desc'>Require commissioner sign-off before auction results are finalized</span>
          </div>
          <Switch checked={auctionApprovalRequired} onChange={(v) => { setAuctionApprovalRequired(v); handleToggleSave('commissionerAuctionApproval', v) }} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Practice Squad Poaching</span>
            <span className='cm-toggle-desc'>Allow teams to poach unprotected practice squad players (3-week lockout applies)</span>
          </div>
          <Switch checked={poachingEnabled} onChange={(v) => { setPoachingEnabled(v); handleToggleSave('practiceSquadPoachingEnabled', v) }} />
        </div>

        {/* Draft Position Mode, Visual Cards */}
        <div className='cm-section' style={{ marginTop: 20, border: '1px solid rgba(34,197,94,0.12)', background: 'rgba(34,197,94,0.02)' }}>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-green'>
              <OrderedListOutlined />
            </div>
            <h3 className='cm-section-title'>Draft Pick Order</h3>
            <span className='cm-section-desc'>How will teams select their draft position?</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Choose how teams get their draft picks. This determines the order teams draft players in each round.
          </p>

          <div className='cm-draft-pick-cards'>
            {[
              {
                value: 'auction',
                emoji: '💰',
                title: 'Draft Pick Auction',
                desc: 'Teams bid SamPoints to choose their draft position. Highest bidder picks first. Strategy matters, save points or go all-in for the #1 pick.',
                tag: 'Most Popular',
                tagColor: '#22C55E',
              },
              {
                value: 'random',
                emoji: '🎲',
                title: 'Random Order',
                desc: 'The system randomly assigns draft positions before the draft begins. Fair and simple, every team has an equal chance at the top pick.',
                tag: 'Quick Setup',
                tagColor: '#2899c9',
              },
              {
                value: 'join_order',
                emoji: '📋',
                title: 'Join Order',
                desc: 'Draft positions are assigned in the order teams joined the league. First to join gets first pick. Rewards early commitment.',
                tag: 'First Come',
                tagColor: '#a5b4fc',
              },
            ].map((opt) => (
              <div
                key={opt.value}
                className={`cm-draft-pick-card ${draftPositionMode === opt.value ? 'cm-draft-pick-card--active' : ''}`}
                onClick={() => setDraftPositionMode(opt.value)}
              >
                <div className='cm-draft-pick-card-top'>
                  <span className='cm-draft-pick-card-emoji'>{opt.emoji}</span>
                  {draftPositionMode === opt.value && (
                    <span className='cm-draft-pick-card-check'>✓</span>
                  )}
                </div>
                <h4 className='cm-draft-pick-card-title'>{opt.title}</h4>
                <p className='cm-draft-pick-card-desc'>{opt.desc}</p>
                <span className='cm-draft-pick-card-tag' style={{ '--tag-color': opt.tagColor }}>{opt.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Draft Pick Timer, Visual Cards */}
        <div style={{ marginTop: 20 }}>
          <label className='cm-field-label' style={{ marginBottom: 12, display: 'block' }}>Draft Pick Timer</label>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>
            How long each team has to make their pick during the draft.
          </p>
          <div className='cm-timer-options'>
            {[
              { value: 1, label: '1 min', desc: 'Speed', icon: '⚡' },
              { value: 2, label: '2 min', desc: 'Standard', icon: '⏱️' },
              { value: 3, label: '3 min', desc: 'Relaxed', icon: '☕' },
              { value: 5, label: '5 min', desc: 'Extended', icon: '🧠' },
            ].map((opt) => (
              <div
                key={opt.value}
                className={`cm-timer-chip ${draftPickTimer === opt.value ? 'cm-timer-chip--active' : ''}`}
                onClick={() => setDraftPickTimer(opt.value)}
              >
                <span style={{ fontSize: 18 }}>{opt.icon}</span>
                <span className='cm-timer-chip-label'>{opt.label}</span>
                <span className='cm-timer-chip-desc'>{opt.desc}</span>
                {opt.value === 2 && <span className='cm-timer-chip-rec'>Recommended</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Auction Economy Settings */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(110,105,128,0.15)' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Economy Settings
          </span>
          <div className='cm-form-grid' style={{ marginTop: 12 }}>
            <div className='cm-field'>
              <label className='cm-field-label'>Auction Duration (hours)</label>
              <InputNumber
                min={1}
                max={72}
                value={auctionDuration}
                onChange={(val) => setAuctionDuration(val)}
                style={{ width: '100%' }}
              />
            </div>
            <div className='cm-field'>
              <label className='cm-field-label'>Starting SamPoints Wallet</label>
              <InputNumber
                value={startingSamPoints}
                disabled
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' SP'}
                parser={(v) => v.replace(/[SP, ]/g, '')}
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div className='cm-field'>
              <label className='cm-field-label'>Salary Cap</label>
              <InputNumber
                value={salaryCap}
                disabled
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' SP'}
                parser={(v) => v.replace(/[SP, ]/g, '')}
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div className='cm-field'>
              <label className='cm-field-label' style={{ opacity: 0.4 }}>Prize Pool Fee (%)</label>
              <Tooltip title="Coming Soon, All auctions & drafts will generate a SAM Points prize pool (up to 10%) distributed across all teams based on final season standings.">
                <InputNumber
                  min={0}
                  max={10}
                  value={commissionFee}
                  disabled
                  formatter={(v) => `${v}%`}
                  parser={(v) => v.replace('%', '')}
                  style={{ width: '100%', opacity: 0.4, cursor: 'not-allowed' }}
                />
              </Tooltip>
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Schedule, Pick Auction + Startup Draft dates */}
        {draftPositionMode === 'auction' && (
          <div style={{ marginTop: 16, padding: 20, background: 'rgba(34, 197, 94, 0.06)', borderRadius: 12, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CalendarOutlined style={{ fontSize: 16, color: '#22C55E' }} />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Draft Schedule
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
              The Draft Pick Auction determines draft order. It must be scheduled <strong style={{ color: '#ff4d4f' }}>before</strong> the Startup Draft date.
            </p>
            <div className='cm-form-grid'>
              <div className='cm-field'>
                <label className='cm-field-label'>Draft Pick Auction Date</label>
                <SamDatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select auction start"
                  value={preAuctionDate ? dayjs(preAuctionDate) : null}
                  onChange={(date) => setPreAuctionDate(date ? date.toISOString() : null)}
                  disabledDate={(current) => {
                    if (draftDate) return current && current >= dayjs(draftDate)
                    return current && current < dayjs().startOf('day')
                  }}
                  style={{ width: '100%' }}
                />
                {preAuctionDate && auctionDuration && (
                  <span style={{ fontSize: 11, color: '#22C55E', display: 'block', marginTop: 4 }}>
                    Ends: {new Date(new Date(preAuctionDate).getTime() + auctionDuration * 60 * 60 * 1000).toLocaleString()}
                  </span>
                )}
              </div>
              <div className='cm-field'>
                <label className='cm-field-label'>Startup Draft Date</label>
                <SamDatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select draft start"
                  value={draftDate ? dayjs(draftDate) : null}
                  onChange={(date) => setDraftDate(date ? date.toISOString() : null)}
                  disabledDate={(current) => {
                    if (preAuctionDate) return current && current <= dayjs(preAuctionDate)
                    return current && current < dayjs().startOf('day')
                  }}
                  style={{ width: '100%' }}
                />
                {draftDate && preAuctionDate && new Date(preAuctionDate) >= new Date(draftDate) && (
                  <span style={{ fontSize: 11, color: '#ff4d4f', display: 'block', marginTop: 4, fontWeight: 600 }}>
                    Warning: Auction must be before Startup Draft!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cap Violation Settings */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(110,105,128,0.15)' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Salary Cap Enforcement
          </span>
          <div className='cm-toggle-row' style={{ marginTop: 12 }}>
            <div className='cm-toggle-info'>
              <span className='cm-toggle-title'>Cap Violation Fines</span>
              <span className='cm-toggle-desc'>Auto-fine teams that exceed the salary cap (tiered: 2.5M → 25M SamPoints)</span>
            </div>
            <Switch defaultChecked={currentLeague?.capViolationFines ?? true} />
          </div>
          <div className='cm-toggle-row'>
            <div className='cm-toggle-info'>
              <span className='cm-toggle-title'>Lineup Lock on Violation</span>
              <span className='cm-toggle-desc'>Lock a team&apos;s lineup after 21 days of unresolved cap violations</span>
            </div>
            <Switch defaultChecked={currentLeague?.lineupLockOnViolation ?? true} />
          </div>
        </div>
      </div>

      {/* ── EXPANSION DRAFT (League Resize) ── */}
      {numTeams >= 10 && expansionValidSizes.length > 0 && (
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon' style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
              <SwapOutlined />
            </div>
            <h3 className='cm-section-title'>League Resize / Expansion Draft</h3>
            <span className='cm-section-desc'>
              {expansionDraft
                ? `${expansionDraft.type === 'expand' ? 'Expanding' : 'Contracting'}: ${expansionDraft.previousSize} → ${expansionDraft.newSize} teams • ${expansionDraft.status?.replace(/_/g, ' ')}`
                : `Current size: ${numTeams} teams`}
            </span>
          </div>

          {expansionDraft ? (
            <div>
              {/* Status rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, background: 'rgba(139,92,246,0.1)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Protected Players</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 4 }}>{expansionDraft.protectedPlayerCount}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(139,92,246,0.1)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Draft Rounds</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 4 }}>{expansionDraft.totalRounds}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(139,92,246,0.1)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Lists Submitted</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 4 }}>
                    {(expansionDraft.protectedLists || []).filter(l => l.submitted).length}/{(expansionDraft.protectedLists || []).length}
                  </div>
                </div>
              </div>

              {/* Expansion teams count */}
              {expansionDraft.type === 'expand' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(110,105,128,0.15)', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Expansion Teams Joined</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {(expansionDraft.expansionTeams || []).length}/{expansionDraft.newSize - expansionDraft.previousSize}
                  </span>
                </div>
              )}

              {/* Expansion Invite Code */}
              {expansionDraft.type === 'expand' && expansionDraft.expansionInviteCode && (
                <div style={{ padding: 16, background: 'rgba(139,92,246,0.12)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.25)', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Expansion Invite Code
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 3, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {expansionDraft.expansionInviteCode}
                    </span>
                    <Button size='small' type='primary' onClick={() => {
                      navigator.clipboard.writeText(expansionDraft.expansionInviteCode)
                      notification.success({ message: 'Invite code copied!' })
                    }}>Copy</Button>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
                    Send this code to new team owners. They&apos;ll use it to join as an expansion team.
                  </div>
                </div>
              )}

              {/* Protection vote info */}
              {expansionDraft.protectionVote?.isActive && (
                <div style={{ padding: 12, background: 'rgba(250,204,21,0.1)', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FACC15' }}>
                    Vote: Protect {expansionDraft.protectionVote.proposedCount} players
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    For: {(expansionDraft.protectionVote.votesFor || []).length} • Against: {(expansionDraft.protectionVote.votesAgainst || []).length}
                  </div>
                </div>
              )}

              {/* Draft Date Picker */}
              {expansionDraft.status !== 'completed' && expansionDraft.status !== 'cancelled' && (
                <div style={{
                  padding: 16, background: 'rgba(139,92,246,0.08)', borderRadius: 12,
                  border: '1px solid rgba(139,92,246,0.2)', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <ClockCircleOutlined style={{ color: '#8B5CF6', fontSize: 14 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>Draft Date & Time</span>
                    {expansionDraft.draftDate && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginLeft: 'auto' }}>
                        {new Date(expansionDraft.draftDate).toLocaleString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit', hour12: true,
                          timeZoneName: 'short',
                        })}
                      </span>
                    )}
                  </div>
                  <SamDatePicker
                    showTime
                    value={expansionDraft.draftDate ? new Date(expansionDraft.draftDate) : null}
                    onChange={handleSetExpansionDraftDate}
                    placeholder='Set draft date and time...'
                    style={{ maxWidth: 280 }}
                  />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                    Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). All teams will be notified.
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {expansionDraft.status === 'pending' && (
                  <Button type='primary' loading={expansionSaving} onClick={handleStartProtectionVote}>
                    Start Protection Vote
                  </Button>
                )}
                {expansionDraft.status === 'protection_phase' && (
                  <Button style={{ background: '#FACC15', borderColor: '#FACC15', color: '#000' }} loading={expansionSaving} onClick={handleForceProtectionDeadline}>
                    Force Protection Deadline
                  </Button>
                )}
                {expansionDraft.status === 'ready' && (
                  <Button type='primary' loading={expansionSaving} onClick={handleStartExpansionDraft}>
                    Start Expansion Draft
                  </Button>
                )}
                {expansionDraft.status === 'in_progress' && (
                  <div style={{ padding: 12, background: 'rgba(34,197,94,0.1)', borderRadius: 10, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>Draft In Progress</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                      Pick {(expansionDraft.picks || []).filter(p => p.status === 'completed').length + 1} of {(expansionDraft.picks || []).length}
                    </div>
                  </div>
                )}
                {expansionDraft.status !== 'completed' && expansionDraft.status !== 'in_progress' && (
                  <Button danger onClick={handleCancelExpansion}>Cancel Expansion Draft</Button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                Resize your league before the season starts. Existing teams protect players, new teams draft from the unprotected pool via snake draft.
              </p>

              {/* Size picker */}
              <div style={{ marginBottom: 16 }}>
                <label className='cm-field-label'>New Size (even numbers only)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {expansionValidSizes.map(s => (
                    <button key={s} onClick={() => setExpansionNewSize(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: `2px solid ${s === expansionNewSize ? '#8B5CF6' : 'rgba(110,105,128,0.2)'}`,
                        background: s === expansionNewSize ? 'rgba(139,92,246,0.15)' : 'transparent',
                        color: s === expansionNewSize ? '#8B5CF6' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}>
                      {s} {s > numTeams ? '▲' : '▼'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protection count */}
              <div className='cm-form-grid' style={{ marginBottom: 16 }}>
                <div className='cm-field'>
                  <label className='cm-field-label'>Protected Players Per Team (4-8)</label>
                  <InputNumber min={4} max={8} value={expansionProtCount} onChange={v => setExpansionProtCount(v)} style={{ width: '100%' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, display: 'block' }}>Set by league vote (majority wins)</span>
                </div>
                <div className='cm-field'>
                  <label className='cm-field-label'>Expansion Draft Rounds (1-{maxExpansionRounds})</label>
                  <InputNumber min={1} max={maxExpansionRounds} value={expansionRounds} onChange={v => setExpansionRounds(v)} style={{ width: '100%' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, display: 'block' }}>Snake draft only • Max = roster ({rosterSize}) - protected ({expansionProtCount})</span>
                </div>
              </div>

              {/* Info box */}
              <div style={{ padding: 14, background: 'rgba(139,92,246,0.06)', borderRadius: 10, borderLeft: '3px solid #8B5CF6', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.7)' }}>How it works:</strong><br/>
                  1. Commissioner sets new size + protection count<br/>
                  2. League votes on protection count (majority wins)<br/>
                  3. Each team protects up to N players<br/>
                  4. Unprotected players enter the expansion draft pool<br/>
                  5. New teams pick via snake draft<br/>
                  6. Teams losing top players may receive draft pick compensation
                </p>
              </div>

              <Button type='primary' size='large' block loading={expansionSaving} disabled={!expansionNewSize}
                onClick={handleInitiateExpansion}
                style={{ background: expansionNewSize ? '#8B5CF6' : undefined, borderColor: expansionNewSize ? '#8B5CF6' : undefined }}>
                {expansionNewSize && expansionNewSize > numTeams ? 'Initiate Expansion Draft' : expansionNewSize ? 'Initiate Contraction Draft' : 'Select a New Size'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Conferences & Divisions */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-red'>
            <TrophyOutlined />
          </div>
          <h3 className='cm-section-title'>Conferences & Divisions</h3>
          <span className='cm-section-desc'>
            {numTeams} teams, {divsPerConf === 1 ? '2 conferences, no divisions' : `2 conferences × ${divsPerConf} divisions`}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.5 }}>
          {divsPerConf <= 1
            ? `Name your two conferences below (${Math.floor(numTeams / 2)} teams each). With ${numTeams} teams, no divisions are needed — teams play everyone in their conference.`
            : `Name your conferences and divisions below. Each division will hold ${Math.floor(numTeams / totalDivs)} teams. After naming, go to the `}
          {divsPerConf > 1 && <><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Teams</strong> tab to assign each team to a division.</>}
        </p>
        <div className='cm-form-grid' style={{ marginBottom: 16 }}>
          <div className='cm-field'>
            <label className='cm-field-label'>Conference 1</label>
            <Input
              value={conf1}
              placeholder='e.g. NFC'
              onChange={(e) => { setConf1(e.target.value); _handleConference(e.target.value, 1) }}
            />
          </div>
          <div className='cm-field'>
            <label className='cm-field-label'>Conference 2</label>
            <Input
              value={conf2}
              placeholder='e.g. AFC'
              onChange={(e) => { setConf2(e.target.value); _handleConference(e.target.value, 2) }}
            />
          </div>
        </div>
        {divsPerConf > 1 && (
          <div className='cm-form-grid'>
            {divisions.slice(0, totalDivs).map((d, i) => (
              <div key={i} className='cm-field'>
                <label className='cm-field-label'>
                  {i < divsPerConf ? conf1 || 'Conf 1' : conf2 || 'Conf 2'}, Division {(i % divsPerConf) + 1}
                </label>
                <Input
                  value={d}
                  placeholder={`Division ${i + 1}`}
                  disabled={i < divsPerConf ? !conf1 : !conf2}
                  onChange={(e) => handleDivisionChange(e.target.value, i + 1)}
                />
              </div>
            ))}
          </div>
        )}
        {divsPerConf === 1 && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            With {numTeams} teams, each conference operates as a single group, no divisions needed.
          </p>
        )}
      </div>

      {/* Save */}
      <div className='cm-save-bar'>
        <button className='cm-save-btn' disabled={saving} onClick={handleSaveGeneral}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Scoring, SAM Metric or Custom Scoring
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_CUSTOM_STATS = {
  QB: [
    { label: 'Passing Yards', points: 0.04 },
    { label: 'Passing TD', points: 4 },
    { label: 'Interception', points: -2 },
    { label: 'Rushing Yards', points: 0.1 },
    { label: 'Rushing TD', points: 6 },
    { label: 'Fumble Lost', points: -2 },
  ],
  RB: [
    { label: 'Rushing Yards', points: 0.1 },
    { label: 'Rushing TD', points: 6 },
    { label: 'Receptions', points: 1 },
    { label: 'Receiving Yards', points: 0.1 },
    { label: 'Receiving TD', points: 6 },
    { label: 'Fumble Lost', points: -2 },
  ],
  WR: [
    { label: 'Receptions', points: 1 },
    { label: 'Receiving Yards', points: 0.1 },
    { label: 'Receiving TD', points: 6 },
    { label: 'Rushing Yards', points: 0.1 },
    { label: 'Rushing TD', points: 6 },
    { label: 'Fumble Lost', points: -2 },
  ],
  TE: [
    { label: 'Receptions', points: 1 },
    { label: 'Receiving Yards', points: 0.1 },
    { label: 'Receiving TD', points: 6 },
    { label: 'Fumble Lost', points: -2 },
  ],
  OL: [
    { label: 'Sacks Allowed', points: -2 },
    { label: 'Pancake Blocks', points: 1.5 },
    { label: 'Penalties', points: -1 },
    { label: 'Rushing Yards Contributed', points: 0.05 },
  ],
  DT: [
    { label: 'Sack', points: 3 },
    { label: 'Tackle', points: 1 },
    { label: 'Tackle for Loss', points: 2 },
    { label: 'QB Hit', points: 1.5 },
    { label: 'Forced Fumble', points: 3 },
    { label: 'Fumble Recovery', points: 2 },
  ],
  DE: [
    { label: 'Sack', points: 3 },
    { label: 'Tackle', points: 1 },
    { label: 'Tackle for Loss', points: 2 },
    { label: 'QB Hit', points: 1.5 },
    { label: 'Forced Fumble', points: 3 },
    { label: 'Pass Deflection', points: 1.5 },
  ],
  LB: [
    { label: 'Tackle', points: 1 },
    { label: 'Sack', points: 3 },
    { label: 'Interception', points: 5 },
    { label: 'Forced Fumble', points: 3 },
    { label: 'Tackle for Loss', points: 2 },
    { label: 'Pass Deflection', points: 1.5 },
  ],
  CB: [
    { label: 'Interception', points: 5 },
    { label: 'Pass Deflection', points: 1.5 },
    { label: 'Tackle', points: 1 },
    { label: 'Forced Fumble', points: 3 },
    { label: 'Defensive TD', points: 6 },
    { label: 'Yards Allowed', points: -0.05 },
  ],
  S: [
    { label: 'Interception', points: 5 },
    { label: 'Tackle', points: 1 },
    { label: 'Sack', points: 3 },
    { label: 'Pass Deflection', points: 1.5 },
    { label: 'Forced Fumble', points: 3 },
    { label: 'Defensive TD', points: 6 },
  ],
  K: [
    { label: 'FG Made (0-39)', points: 3 },
    { label: 'FG Made (40-49)', points: 4 },
    { label: 'FG Made (50+)', points: 5 },
    { label: 'Extra Point Made', points: 1 },
    { label: 'FG Missed', points: -1 },
  ],
  P: [
    { label: 'Punt Inside 20', points: 2 },
    { label: 'Punt Avg 45+ Yards', points: 1 },
    { label: 'Touchback', points: -1 },
    { label: 'Punt Blocked', points: -3 },
  ],
}

// ── Preset scoring rules (mirrored from backend scoringPresets.js) ──
const PRESET_SCORING = {
  ppr: {
    label: 'PPR (Points Per Reception)',
    desc: '1 point per reception — the most popular scoring format',
    rules: [
      { cat: 'Passing', stats: [{ label: 'Passing Yards', value: '0.04 (1 pt per 25 yds)' }, { label: 'Passing TDs', value: '+4' }, { label: 'Interceptions Thrown', value: '-2' }] },
      { cat: 'Rushing', stats: [{ label: 'Rushing Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Rushing TDs', value: '+6' }] },
      { cat: 'Receiving', stats: [{ label: 'Receptions', value: '+1' }, { label: 'Receiving Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Receiving TDs', value: '+6' }] },
      { cat: 'Turnovers', stats: [{ label: 'Fumble Lost', value: '-2' }] },
      { cat: '2-Point Conversions', stats: [{ label: 'Rush/Rec/Pass', value: '+2' }] },
      { cat: 'Kicking', stats: [{ label: 'FG 0-39 yds', value: '+3' }, { label: 'FG 40-49 yds', value: '+4' }, { label: 'FG 50+ yds', value: '+5' }, { label: 'Extra Point Made', value: '+1' }, { label: 'Extra Point Missed', value: '-1' }] },
      { cat: 'Special Teams', stats: [{ label: 'Kick/Punt Return TD', value: '+6' }] },
    ],
  },
  half_ppr: {
    label: 'Half-PPR',
    desc: '0.5 points per reception — the most balanced format',
    rules: [
      { cat: 'Passing', stats: [{ label: 'Passing Yards', value: '0.04 (1 pt per 25 yds)' }, { label: 'Passing TDs', value: '+4' }, { label: 'Interceptions Thrown', value: '-2' }] },
      { cat: 'Rushing', stats: [{ label: 'Rushing Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Rushing TDs', value: '+6' }] },
      { cat: 'Receiving', stats: [{ label: 'Receptions', value: '+0.5' }, { label: 'Receiving Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Receiving TDs', value: '+6' }] },
      { cat: 'Turnovers', stats: [{ label: 'Fumble Lost', value: '-2' }] },
      { cat: '2-Point Conversions', stats: [{ label: 'Rush/Rec/Pass', value: '+2' }] },
      { cat: 'Kicking', stats: [{ label: 'FG 0-39 yds', value: '+3' }, { label: 'FG 40-49 yds', value: '+4' }, { label: 'FG 50+ yds', value: '+5' }, { label: 'Extra Point Made', value: '+1' }, { label: 'Extra Point Missed', value: '-1' }] },
      { cat: 'Special Teams', stats: [{ label: 'Kick/Punt Return TD', value: '+6' }] },
    ],
  },
  standard: {
    label: 'Standard (Non-PPR)',
    desc: 'No points for receptions — pure yardage and touchdown scoring',
    rules: [
      { cat: 'Passing', stats: [{ label: 'Passing Yards', value: '0.04 (1 pt per 25 yds)' }, { label: 'Passing TDs', value: '+4' }, { label: 'Interceptions Thrown', value: '-2' }] },
      { cat: 'Rushing', stats: [{ label: 'Rushing Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Rushing TDs', value: '+6' }] },
      { cat: 'Receiving', stats: [{ label: 'Receptions', value: '0' }, { label: 'Receiving Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Receiving TDs', value: '+6' }] },
      { cat: 'Turnovers', stats: [{ label: 'Fumble Lost', value: '-2' }] },
      { cat: '2-Point Conversions', stats: [{ label: 'Rush/Rec/Pass', value: '+2' }] },
      { cat: 'Kicking', stats: [{ label: 'FG 0-39 yds', value: '+3' }, { label: 'FG 40-49 yds', value: '+4' }, { label: 'FG 50+ yds', value: '+5' }, { label: 'Extra Point Made', value: '+1' }, { label: 'Extra Point Missed', value: '-1' }] },
      { cat: 'Special Teams', stats: [{ label: 'Kick/Punt Return TD', value: '+6' }] },
    ],
  },
  superflex: {
    label: 'Superflex / 2QB',
    desc: 'PPR with boosted QB scoring (6pt passing TDs, 300yd bonus)',
    rules: [
      { cat: 'Passing', stats: [{ label: 'Passing Yards', value: '0.04 (1 pt per 25 yds)' }, { label: 'Passing TDs', value: '+6' }, { label: 'Interceptions Thrown', value: '-3' }, { label: '300 Yard Bonus', value: '+3' }, { label: '400 Yard Bonus', value: '+3' }] },
      { cat: 'Rushing', stats: [{ label: 'Rushing Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Rushing TDs', value: '+6' }, { label: '100 Yard Bonus', value: '+2' }] },
      { cat: 'Receiving', stats: [{ label: 'Receptions', value: '+1' }, { label: 'Receiving Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Receiving TDs', value: '+6' }, { label: '100 Yard Bonus', value: '+2' }] },
      { cat: 'Turnovers', stats: [{ label: 'Fumble Lost', value: '-2' }] },
      { cat: '2-Point Conversions', stats: [{ label: 'Rush/Rec/Pass', value: '+2' }] },
      { cat: 'Kicking', stats: [{ label: 'FG 0-39 yds', value: '+3' }, { label: 'FG 40-49 yds', value: '+4' }, { label: 'FG 50+ yds', value: '+5' }, { label: 'Extra Point Made', value: '+1' }, { label: 'Extra Point Missed', value: '-1' }] },
      { cat: 'Special Teams', stats: [{ label: 'Kick/Punt Return TD', value: '+6' }] },
    ],
  },
  te_premium: {
    label: 'TE Premium (TEP)',
    desc: '1.5 PPR for Tight Ends, 1.0 for all others',
    rules: [
      { cat: 'Passing', stats: [{ label: 'Passing Yards', value: '0.04 (1 pt per 25 yds)' }, { label: 'Passing TDs', value: '+4' }, { label: 'Interceptions Thrown', value: '-2' }] },
      { cat: 'Rushing', stats: [{ label: 'Rushing Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Rushing TDs', value: '+6' }] },
      { cat: 'Receiving', stats: [{ label: 'Receptions (non-TE)', value: '+1' }, { label: 'Receptions (TE)', value: '+1.5' }, { label: 'Receiving Yards', value: '0.1 (1 pt per 10 yds)' }, { label: 'Receiving TDs', value: '+6' }] },
      { cat: 'Turnovers', stats: [{ label: 'Fumble Lost', value: '-2' }] },
      { cat: '2-Point Conversions', stats: [{ label: 'Rush/Rec/Pass', value: '+2' }] },
      { cat: 'Kicking', stats: [{ label: 'FG 0-39 yds', value: '+3' }, { label: 'FG 40-49 yds', value: '+4' }, { label: 'FG 50+ yds', value: '+5' }, { label: 'Extra Point Made', value: '+1' }, { label: 'Extra Point Missed', value: '-1' }] },
      { cat: 'Special Teams', stats: [{ label: 'Kick/Punt Return TD', value: '+6' }] },
    ],
  },
}

const ScoringTab = ({ currentLeague }) => {
  const { allSamMetric } = useSelector((state) => state?.league)
  const [selectedPos, setSelectedPos] = useState('QB')
  const [loading, setLoading] = useState(false)
  const leagueScoringMode = currentLeague?.scoringMode || 'sam_metric'
  const isPresetMode = ['ppr', 'half_ppr', 'standard', 'superflex', 'te_premium'].includes(leagueScoringMode)
  const [useSamMetric, setUseSamMetric] = useState(isPresetMode ? false : (currentLeague?.useSamMetric ?? true))
  const [customScoring, setCustomScoring] = useState(currentLeague?.customScoring || DEFAULT_CUSTOM_STATS)
  const [customSelectedPos, setCustomSelectedPos] = useState('QB')

  // Sync scoring state when currentLeague loads async
  useEffect(() => {
    if (!currentLeague) return
    const mode = currentLeague.scoringMode || 'sam_metric'
    const preset = ['ppr', 'half_ppr', 'standard', 'superflex', 'te_premium'].includes(mode)
    setUseSamMetric(preset ? false : (currentLeague.useSamMetric ?? true))
    if (currentLeague.customScoring) setCustomScoring(currentLeague.customScoring)
  }, [currentLeague?._id])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        await getSamMetric()
      } catch (e) {
        console.error('Failed to load SAM Metric:', e)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const selectedMetric = useMemo(() => {
    return allSamMetric?.sammetric?.find((m) => m?.Position === selectedPos)
  }, [allSamMetric, selectedPos])

  const selectedColor = SAM_POSITIONS.find((p) => p.abbr === selectedPos)?.color || '#22C55E'

  const handleCustomPointChange = (posKey, statIndex, newVal) => {
    setCustomScoring((prev) => {
      const updated = { ...prev }
      updated[posKey] = [...(updated[posKey] || [])]
      updated[posKey][statIndex] = { ...updated[posKey][statIndex], points: newVal }
      return updated
    })
  }

  const handleAddCustomStat = (posKey) => {
    setCustomScoring((prev) => {
      const updated = { ...prev }
      updated[posKey] = [...(updated[posKey] || []), { label: 'New Stat', points: 0 }]
      return updated
    })
  }

  const handleRemoveCustomStat = (posKey, statIndex) => {
    setCustomScoring((prev) => {
      const updated = { ...prev }
      updated[posKey] = updated[posKey].filter((_, i) => i !== statIndex)
      return updated
    })
  }

  const handleCustomLabelChange = (posKey, statIndex, newLabel) => {
    setCustomScoring((prev) => {
      const updated = { ...prev }
      updated[posKey] = [...(updated[posKey] || [])]
      updated[posKey][statIndex] = { ...updated[posKey][statIndex], label: newLabel }
      return updated
    })
  }

  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  const DEFENSE_POS = ['DT', 'DE', 'LB', 'CB', 'S', 'P']
  const CUSTOM_POSITIONS = isOffenseOnly
    ? ['QB', 'RB', 'WR', 'TE', 'OL', 'K']
    : ['QB', 'RB', 'WR', 'TE', 'OL', 'DT', 'DE', 'LB', 'CB', 'S', 'K', 'P']
  const filteredSamPositions = isOffenseOnly
    ? SAM_POSITIONS.filter((p) => !DEFENSE_POS.includes(p.abbr))
    : SAM_POSITIONS

  return (
    <>
      {/* Scoring Mode Toggle */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-blue'>
            <TrophyOutlined />
          </div>
          <h3 className='cm-section-title'>Scoring System</h3>
          <span className='cm-section-desc'>
            {isPresetMode
              ? `This league uses ${PRESET_SCORING[leagueScoringMode]?.label || leagueScoringMode} scoring`
              : 'Choose between SAM Metric or custom scoring rules'}
          </span>
        </div>
        {!isPresetMode && (
          <div className='cm-toggle-row' style={{ marginBottom: 20 }}>
            <div className='cm-toggle-info'>
              <span className='cm-toggle-title'>Use SAM Metric Scoring</span>
              <span className='cm-toggle-desc'>
                {useSamMetric
                  ? 'Position-based scoring derived from NFL franchise tag valuations, the SamSports standard'
                  : 'SAM Metric is off, configure your own points per stat below'}
              </span>
            </div>
            <Switch checked={useSamMetric} onChange={(val) => setUseSamMetric(val)} />
          </div>
        )}
      </div>

      {isPresetMode ? (
        /* ── Preset Scoring View (PPR, Half-PPR, Standard, etc.) ── */
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-green'>
              <TrophyOutlined />
            </div>
            <h3 className='cm-section-title'>{PRESET_SCORING[leagueScoringMode]?.label}</h3>
            <span className='cm-section-desc'>{PRESET_SCORING[leagueScoringMode]?.desc}</span>
          </div>
          {PRESET_SCORING[leagueScoringMode]?.rules?.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#22C55E', marginBottom: 8, paddingLeft: 4 }}>
                {cat.cat}
              </div>
              {cat.stats.map((stat, si) => (
                <div key={si} className='cm-rule-row' style={{ marginBottom: 4 }}>
                  <span className='cm-rule-name' style={{ flex: 3, fontSize: 13 }}>{stat.label}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: stat.value.startsWith('-') ? '#EF4444' : '#22C55E', textAlign: 'right' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : useSamMetric ? (
        /* ── SAM Metric View ── */
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-green'>
              <TrophyOutlined />
            </div>
            <h3 className='cm-section-title'>SAM Metric Scoring</h3>
            <span className='cm-section-desc'>Position-based scoring from franchise tag valuations</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {filteredSamPositions.map((pos) => (
              <button
                key={pos.abbr}
                className={`cm-nav-btn ${selectedPos === pos.abbr ? 'cm-nav-btn-active' : ''}`}
                style={selectedPos === pos.abbr ? { borderColor: pos.color, color: pos.color, background: `${pos.color}15` } : {}}
                onClick={() => setSelectedPos(pos.abbr)}
              >
                {pos.abbr}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
          ) : selectedMetric ? (
            <>
              {/* Position Summary */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className='cm-roster-slot' style={{ flex: 1, minWidth: 160 }}>
                  <span className='cm-roster-pos'>Franchise Tag</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: selectedColor }}>
                    ${selectedMetric?.FranchiseTagCost?.toLocaleString()}
                  </span>
                </div>
                <div className='cm-roster-slot' style={{ flex: 1, minWidth: 160 }}>
                  <span className='cm-roster-pos'>Metric %</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: selectedColor }}>
                    {selectedMetric?.Percentage}%
                  </span>
                </div>
              </div>

              {/* Column Headers */}
              <div className='cm-rule-row' style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(110,105,128,0.25)', marginBottom: 4 }}>
                <span className='cm-rule-name' style={{ flex: 3, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)' }}>Scoring Topic</span>
                <span style={{ flex: 1, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Full Scale</span>
                <span style={{ flex: 1, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', textAlign: 'right' }}>Points</span>
              </div>

              {/* Scoring Rows */}
              {selectedMetric?.sammetricstats?.map((stat, i) => (
                <div key={i} className='cm-rule-row' style={{ marginBottom: 4 }}>
                  <span className='cm-rule-name' style={{ flex: 3, fontSize: 12 }}>{stat.label}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                    {stat.fullScale}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: selectedColor, textAlign: 'right' }}>
                    {typeof stat.percentvalue === 'number' ? stat.percentvalue.toFixed(4) : stat.percentvalue}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
              No SAM Metric data available for this position
            </div>
          )}
        </div>
      ) : (
        /* ── Custom Scoring View ── */
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-amber'>
              <TrophyOutlined />
            </div>
            <h3 className='cm-section-title'>Custom Scoring</h3>
            <span className='cm-section-desc'>Set your own points per stat for each position group</span>
          </div>

          {/* Position Selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {CUSTOM_POSITIONS.map((pos) => (
              <button
                key={pos}
                className={`cm-nav-btn ${customSelectedPos === pos ? 'cm-nav-btn-active' : ''}`}
                onClick={() => setCustomSelectedPos(pos)}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Column Headers */}
          <div className='cm-rule-row' style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(110,105,128,0.25)', marginBottom: 4 }}>
            <span className='cm-rule-name' style={{ flex: 3, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)' }}>Stat</span>
            <span style={{ flex: 1, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', textAlign: 'right' }}>Points</span>
            <span style={{ width: 32 }} />
          </div>

          {/* Editable Scoring Rows */}
          {(customScoring[customSelectedPos] || []).map((stat, i) => (
            <div key={i} className='cm-rule-row' style={{ marginBottom: 4, alignItems: 'center' }}>
              <Input
                value={stat.label}
                onChange={(e) => handleCustomLabelChange(customSelectedPos, i, e.target.value)}
                style={{ flex: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff', fontSize: 12 }}
                size='small'
              />
              <InputNumber
                value={stat.points}
                onChange={(val) => handleCustomPointChange(customSelectedPos, i, val)}
                step={0.01}
                style={{ flex: 1, marginLeft: 8 }}
                size='small'
              />
              <button
                onClick={() => handleRemoveCustomStat(customSelectedPos, i)}
                style={{ width: 32, height: 28, background: 'none', border: 'none', color: 'rgba(255,80,80,0.6)', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}
                title='Remove stat'
              >
                ×
              </button>
            </div>
          ))}

          {/* Add Stat Button */}
          <button
            onClick={() => handleAddCustomStat(customSelectedPos)}
            style={{
              marginTop: 12,
              padding: '6px 16px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px dashed rgba(34,197,94,0.3)',
              borderRadius: 6,
              color: '#22C55E',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            + Add Stat
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className='cm-save-bar'>
        <button
          className='cm-save-btn'
          onClick={() => {
            updateLeagueCommissioner({
              _id: currentLeague?._id,
              useSamMetric,
              ...(!useSamMetric && { customScoringStats: customScoring }),
            })
          }}
        >
          Save Scoring Settings
        </button>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Teams & Owners
   ═══════════════════════════════════════════════════════════ */
const TeamsTab = ({ teams, currentLeague, user, userLeague }) => {
  const handleImpersonate = async (userId) => {
    const impersonatedToken = await impersonateUser(userId, userLeague, user?.email)
    if (impersonatedToken) {
      // TODO: Migrate to httpOnly cookies (requires backend cookie support)
      localStorage.setItem('originalToken', localStorage.getItem('token'))
      localStorage.setItem('token', impersonatedToken)
      window.location.href = '/dashboard'
    }
  }

  const handleDivisionChange = async (teamId, divisionId) => {
    await updateTeamConfDivision({
      teamId,
      division: divisionId,
      conference: currentLeague?.divisions?.find((v) => v?._id === divisionId)?.conference,
    })
  }

  return (
    <div className='cm-section'>
      <div className='cm-section-header'>
        <div className='cm-section-icon cm-section-icon-blue'>
          <TeamOutlined />
        </div>
        <h3 className='cm-section-title'>Teams & Ownership</h3>
        <span className='cm-section-desc'>{teams?.length || 0} teams · Click to impersonate</span>
      </div>
      <div className='cm-teams-grid'>
        {teams?.filter((t) => t?.user).map((team, index) => (
          <div key={index} className='cm-team-card' onClick={() => handleImpersonate(team?.user?._id)}>
            <div className='cm-team-avatar'>
              {team?.abbreviation?.slice(0, 2) || '#'}
            </div>
            <div className='cm-team-info'>
              <p className='cm-team-name'>{team?.name}</p>
              <span className='cm-team-owner'>{team?.user?.firstName && team?.user?.lastName ? `${team.user.firstName} ${team.user.lastName}` : team?.user?.userName} · {team?.hometown || '-'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              {team?.division?.name && (
                <span className='cm-team-division-badge'>{team.division.name}</span>
              )}
              <span className='cm-team-impersonate'>Impersonate</span>
            </div>
          </div>
        ))}
      </div>

      {/* Division Assignment */}
      {currentLeague?.divisions?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-purple'>
              <OrderedListOutlined />
            </div>
            <h3 className='cm-section-title'>Division Assignment</h3>
          </div>
          <div className='cm-form-grid'>
            {teams?.filter((t) => t?.user).map((team, index) => (
              <div key={index} className='cm-field'>
                <label className='cm-field-label'>{team?.name}</label>
                <Select
                  value={team?.division?._id || undefined}
                  placeholder='Assign division'
                  onChange={(val) => handleDivisionChange(team?._id, val)}
                  options={currentLeague?.divisions?.map((v) => ({
                    value: v?._id,
                    label: v?.name,
                  }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Commissioner Inbox — Anti-Tanking Sale Approval Requests
   ═══════════════════════════════════════════════════════════ */
const InboxTab = ({ currentLeague }) => {
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [decidingId, setDecidingId] = useState(null)

  const leagueId = currentLeague?._id

  const fetchPending = async () => {
    if (!leagueId) return
    try {
      attachToken()
      const res = await privateAPI.get(`/sale-approval/${leagueId}/pending`)
      const data = res.data?.data || res.data || []
      setPending(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Failed to fetch pending sale approvals:', err.message)
    }
  }

  const fetchHistory = async () => {
    if (!leagueId) return
    try {
      attachToken()
      const res = await privateAPI.get(`/sale-approval/${leagueId}/history`)
      const data = res.data?.data || res.data || []
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Failed to fetch approval history:', err.message)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchPending()
      await fetchHistory()
      setLoading(false)
    }
    init()
  }, [leagueId])

  const handleDecide = async (approvalId, decision, reason = '') => {
    setDecidingId(approvalId)
    try {
      attachToken()
      await privateAPI.post(`/sale-approval/${approvalId}/decide`, { decision, reason })
      notification.success({ message: `Request ${decision} successfully`, duration: 3 })
      await fetchPending()
      await fetchHistory()
    } catch (err) {
      notification.error({ message: err.response?.data?.message || `Failed to ${decision} request`, duration: 3 })
    } finally {
      setDecidingId(null)
    }
  }

  const handleRejectWithReason = (approvalId) => {
    let customReason = ''
    Modal.confirm({
      title: 'Reject Sale Request',
      content: (
        <div>
          <p style={{ color: COLORS.textMuted, marginBottom: 8 }}>Provide a reason for rejecting this sale request:</p>
          <Input.TextArea
            rows={3}
            placeholder='Enter rejection reason...'
            onChange={(e) => (customReason = e.target.value)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          />
        </div>
      ),
      okText: 'Reject Request',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      className: 'wr-dark-confirm',
      onOk: () => {
        handleDecide(approvalId, 'rejected', customReason.trim() || 'Rejected by commissioner')
      },
    })
  }

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return ''
    const now = new Date()
    const exp = new Date(expiresAt)
    const diff = exp - now
    if (diff <= 0) return 'Expired'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const statusColor = (status) => {
    if (status === 'approved') return '#22C55E'
    if (status === 'rejected') return '#ef4444'
    if (status === 'expired') return '#94a3b8'
    return '#eab308'
  }

  const statusIcon = (status) => {
    if (status === 'approved') return <CheckCircleOutlined style={{ color: '#22C55E' }} />
    if (status === 'rejected') return <CloseCircleOutlined style={{ color: '#ef4444' }} />
    if (status === 'expired') return <ClockCircleOutlined style={{ color: '#94a3b8' }} />
    return <WarningOutlined style={{ color: '#eab308' }} />
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div>
      {/* ── Pending Requests ── */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-amber'>
            <InboxOutlined />
          </div>
          <h3 className='cm-section-title'>Pending Sale Requests</h3>
          <span className='cm-section-desc'>{pending.length} awaiting your decision</span>
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>
            <InboxOutlined style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
            No pending sale requests
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pending.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  borderLeft: '4px solid #eab308',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Tag color='orange' style={{ margin: 0, fontWeight: 700 }}>PENDING</Tag>
                    <Tag color='blue' style={{ margin: 0 }}>{item.actionType?.toUpperCase()}</Tag>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {getTimeRemaining(item.expiresAt)}
                  </span>
                </div>

                {/* Team & Requester */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {item.team?.teamName || 'Unknown Team'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>
                    Requested by: {item.requestedBy?.userName || 'Unknown'} — {formatDate(item.createdAt)}
                  </div>
                </div>

                {/* Players to be released/sold */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>
                    PLAYERS INVOLVED
                  </div>
                  {(item.players || []).map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#e2e8f0', fontSize: 14 }}>
                      <span>{p.playerName} <span style={{ color: '#94a3b8', fontSize: 12 }}>({p.position})</span></span>
                      <span style={{ color: '#eab308' }}>${(p.capHit || 0).toLocaleString()} cap hit</span>
                    </div>
                  ))}
                </div>

                {/* Cap Situation */}
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  border: '1px solid rgba(239,68,68,0.15)',
                }}>
                  <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>
                    <WarningOutlined style={{ marginRight: 4 }} /> ANTI-TANKING FLAG
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: 13 }}>{item.reason}</div>
                  <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      Team Cap: <span style={{ color: '#fff' }}>${(item.teamCapAtRequest || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      Cap Floor: <span style={{ color: '#fff' }}>${(item.capFloor || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      80% Threshold: <span style={{ color: '#ef4444' }}>${(item.floorThreshold || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button
                    type='primary'
                    loading={decidingId === item._id}
                    onClick={() => handleDecide(item._id, 'approved')}
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #16a34a)',
                      border: 'none',
                      fontWeight: 700,
                      borderRadius: 8,
                      height: 36,
                      paddingInline: 24,
                    }}
                  >
                    <CheckCircleOutlined /> Approve Sale
                  </Button>
                  <Button
                    loading={decidingId === item._id}
                    onClick={() => handleRejectWithReason(item._id)}
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontWeight: 700,
                      borderRadius: 8,
                      height: 36,
                      paddingInline: 24,
                    }}
                  >
                    <CloseCircleOutlined /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── History Toggle ── */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.primary,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 16,
          }}
        >
          {showHistory ? '▾ Hide' : '▸ Show'} Decision History ({history.length})
        </button>

        {showHistory && history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  borderLeft: `4px solid ${statusColor(item.status)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {statusIcon(item.status)}
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                      {item.team?.teamName || 'Team'} — {item.actionType}
                    </span>
                    <Tag style={{ margin: 0 }} color={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'default'}>
                      {item.status?.toUpperCase()}
                    </Tag>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{formatDate(item.updatedAt)}</span>
                </div>
                {item.players?.length > 0 && (
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
                    Players: {item.players.map((p) => p.playerName).join(', ')}
                  </div>
                )}
                {item.commissionerReason && (
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    Reason: {item.commissionerReason}
                  </div>
                )}
                {item.commissionerDecidedBy?.userName && (
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                    Decided by: {item.commissionerDecidedBy.userName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showHistory && history.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>
            No previous decisions
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Trades, Approval
   ═══════════════════════════════════════════════════════════ */
const TradesTab = () => {
  const [pendingTrades, setPendingTrades] = useState([])
  const [loadingTrades, setLoadingTrades] = useState(true)

  useEffect(() => {
    const fetchPendingTrades = async () => {
      try {
        attachToken()
        const res = await privateAPI.get('/trade/commissioner-pending')
        const trades = res.data?.data || res.data || []
        setPendingTrades(Array.isArray(trades) ? trades : [])
      } catch (err) {
        console.warn('Failed to fetch pending trades:', err.message)
      } finally {
        setLoadingTrades(false)
      }
    }
    fetchPendingTrades()
  }, [])

  const buildTradeDescription = (trade) => {
    const buyerName = trade.buyer?.team?.teamName || trade.buyer?.team?.name || 'Team A'
    const sellerName = trade.seller?.team?.teamName || trade.seller?.team?.name || 'Team B'
    const buyerPlayers = (trade.buyer?.players || []).map((p) => p.Name).join(', ')
    const sellerPlayers = (trade.seller?.players || []).map((p) => p.Name).join(', ')
    const buyerDrafts = (trade.buyer?.drafts || []).map((d) => `Round ${d.round || '?'} pick`).join(', ')
    const sellerDrafts = (trade.seller?.drafts || []).map((d) => `Round ${d.round || '?'} pick`).join(', ')
    const buyerAssets = [buyerPlayers, buyerDrafts].filter(Boolean).join(' and ')
    const sellerAssets = [sellerPlayers, sellerDrafts].filter(Boolean).join(' and ')
    return `${buyerName} trades ${buyerAssets || 'nothing'}. ${sellerName} trades ${sellerAssets || 'nothing'}.`
  }

  const handleApproveTrade = async (tradeId) => {
    try {
      attachToken()
      await privateAPI.post('/trade/approve-admin', { tradeId })
      setPendingTrades((prev) => prev.filter((t) => (t._id || t.id) !== tradeId))
      notification.success({ message: 'Trade approved', duration: 2 })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to approve trade', duration: 3 })
    }
  }

  const handleRejectTrade = async (tradeId, reason) => {
    try {
      attachToken()
      await privateAPI.post('/trade/veto', { tradeId, reason })
      setPendingTrades((prev) => prev.filter((t) => (t._id || t.id) !== tradeId))
      notification.success({ message: 'Trade rejected', duration: 2 })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to reject trade', duration: 3 })
    }
  }

  const rejectItems = [
    { key: '1', label: 'Unfair Trade' },
    { key: '2', label: 'Financial Cap Issue' },
    { key: '3', label: 'Payment Unpaid' },
    { key: '4', label: 'Illegal Roster' },
  ]

  return (
    <div className='cm-section'>
      <div className='cm-section-header'>
        <div className='cm-section-icon cm-section-icon-amber'>
          <SwapOutlined />
        </div>
        <h3 className='cm-section-title'>Pending Trades</h3>
        <span className='cm-section-desc'>{pendingTrades.length} awaiting review</span>
      </div>

      {loadingTrades ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size='small' />
        </div>
      ) : pendingTrades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
          No trades pending approval
        </div>
      ) : (
        <div className='cm-trade-list'>
          {pendingTrades.map((trade) => (
            <div key={trade._id || trade.id} className='cm-trade-card'>
              <p className='cm-trade-desc'>{trade.description || buildTradeDescription(trade)}</p>
              <div className='cm-trade-actions'>
                <button className='cm-approve-btn' onClick={() => handleApproveTrade(trade._id || trade.id)}>
                  Approve
                </button>
                <Dropdown
                  menu={{
                    items: rejectItems.map((item) => ({
                      ...item,
                      label: (
                        <span onClick={() => handleRejectTrade(trade._id || trade.id, item.label)}>
                          {item.label}
                        </span>
                      ),
                    })),
                  }}
                  trigger={['click']}
                >
                  <button className='cm-reject-btn' onClick={(e) => e.preventDefault()}>
                    Reject
                  </button>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Auction Schedule Section
   ═══════════════════════════════════════════════════════════ */
const AuctionScheduleSection = ({ currentLeague, draftDate }) => {
  const [timingOption, setTimingOption] = useState(currentLeague?.auctionTimingOption || 'just-before')
  const [auctionTime, setAuctionTime] = useState(() => {
    // If there's a computed auction date saved, use it as a full datetime
    if (currentLeague?.computedAuctionDate) return dayjs(currentLeague.computedAuctionDate)
    // Otherwise build a valid date from the time string + draft date
    const timeStr = currentLeague?.auctionScheduleTime || '14:00'
    const [h, m] = timeStr.split(':').map(Number)
    const base = draftDate ? dayjs(draftDate) : dayjs()
    return base.hour(h || 14).minute(m || 0).second(0)
  })
  const [saving, setSaving] = useState(false)
  const [scheduleComputed, setScheduleComputed] = useState(null)

  useEffect(() => {
    computeAuctionDate()
  }, [timingOption, auctionTime, draftDate])

  const computeAuctionDate = () => {
    if (!draftDate) { setScheduleComputed(null); return }

    const draftDateObj = dayjs(draftDate)
    if (!draftDateObj.isValid()) { setScheduleComputed(null); return }

    let auctionDateObj

    switch (timingOption) {
      case '7-days-before':
        auctionDateObj = draftDateObj.subtract(7, 'day')
        break
      case '1-day-before':
        auctionDateObj = draftDateObj.subtract(1, 'day')
        break
      case 'just-before':
      default:
        auctionDateObj = draftDateObj.subtract(2, 'hour')
        break
    }

    const hr = auctionTime && auctionTime.isValid() ? auctionTime.hour() : 14
    const mn = auctionTime && auctionTime.isValid() ? auctionTime.minute() : 0
    auctionDateObj = auctionDateObj.set('hour', hr).set('minute', mn)
    setScheduleComputed(auctionDateObj.isValid() ? auctionDateObj : null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateLeagueCommissioner({
        _id: currentLeague?._id,
        auctionTimingOption: timingOption,
        auctionScheduleTime: auctionTime?.isValid() ? auctionTime.format('HH:mm') : '14:00',
        computedAuctionDate: scheduleComputed?.isValid() ? scheduleComputed.toISOString() : null,
        spotAuctionEnd: scheduleComputed?.isValid() ? scheduleComputed.toISOString() : null,
        auctionReminderSent: false,
      })
      notification.success({
        message: 'Auction schedule saved successfully',
        description: scheduleComputed?.isValid() ? `Auction scheduled for ${scheduleComputed.format('MMMM DD, YYYY [at] hh:mm A')}` : 'Schedule updated',
        duration: 3,
      })
    } catch (err) {
      notification.error({
        message: 'Failed to save auction schedule',
        description: err?.response?.data?.message || err?.message || 'Unknown error',
        duration: 3,
      })
    } finally {
      setSaving(false)
    }
  }

  const timingCards = [
    { value: '7-days-before', emoji: '📅', label: '7 Days Before', desc: 'Give teams a full week to bid on their preferred draft position', tag: 'Most Time' },
    { value: '1-day-before', emoji: '⏰', label: '1 Day Before', desc: 'Quick 24-hour auction window before draft day', tag: 'Recommended' },
    { value: 'just-before', emoji: '⚡', label: 'Just Before Draft', desc: 'Starts 2 hours before the draft, fast-paced bidding', tag: 'Quick' },
  ]

  return (
    <div className='cm-section' style={{ marginTop: 24 }}>
      <div className='cm-section-header'>
        <div className='cm-section-icon cm-section-icon-blue'>
          <ClockCircleOutlined />
        </div>
        <h3 className='cm-section-title'>Draft Pick Auction Schedule</h3>
        <span className='cm-section-desc'>Set when teams can bid SamPoints for their draft position</span>
      </div>

      {/* Legend */}
      <div className='cm-auction-legend'>
        <span className='cm-auction-legend-icon'>&#9876;</span>
        <span>Battle it out with your peers to claim the top of the draft. Use your SamPoints to bid for the best draft position!</span>
      </div>

      {/* Timing Cards */}
      <label className='cm-field-label' style={{ marginBottom: 12, display: 'block' }}>When should the auction open?</label>
      <div className='cm-draft-pick-cards'>
        {timingCards.map((card) => (
          <div
            key={card.value}
            className={`cm-draft-pick-card ${timingOption === card.value ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setTimingOption(card.value)}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>{card.emoji}</span>
              {timingOption === card.value && (
                <span className='cm-draft-pick-card-check'>✓</span>
              )}
            </div>
            <h4 className='cm-draft-pick-card-title'>{card.label}</h4>
            <p className='cm-draft-pick-card-desc'>{card.desc}</p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': card.tag === 'Recommended' ? '#22C55E' : '#60a5fa' }}>{card.tag}</span>
          </div>
        ))}
      </div>

      {/* Time Picker */}
      <div className='cm-field' style={{ marginTop: 24, maxWidth: 300 }}>
        <label className='cm-field-label'>Auction Start Date &amp; Time</label>
        <SamDatePicker
          showTime
          value={auctionTime}
          onChange={(val) => setAuctionTime(val || dayjs('14:00', 'HH:mm'))}
          disabledDate={(date) => date && date.isBefore(dayjs().startOf('day'))}
          placeholder='Select date &amp; time'
          style={{ width: '100%' }}
        />
        <span className='cm-field-hint'>The exact date and time the auction opens for bidding</span>
      </div>

      {/* Computed Date Display */}
      {scheduleComputed && scheduleComputed.isValid() && (
        <div className='cm-auction-preview'>
          <div className='cm-auction-preview-label'>Auction Opens</div>
          <div className='cm-auction-preview-date'>
            {scheduleComputed.format('dddd, MMMM DD, YYYY')}
          </div>
          <div className='cm-auction-preview-time'>
            {scheduleComputed.format('hh:mm A')}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className='cm-save-bar'>
        <button className='cm-save-btn' onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Auction Schedule'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Draft Order
   ═══════════════════════════════════════════════════════════ */
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET)' },
]

const PICK_DURATIONS = [
  { value: 120, label: '2 Minutes' },
  { value: 300, label: '5 Minutes' },
  { value: 28800, label: '8 Hours' },
  { value: 86400, label: '24 Hours' },
]

const DraftTab = ({ currentLeague }) => {
  const { t } = useLanguage()
  // Use actual league team count, falls back to 32 only if no league data
  const positionLength = currentLeague?.numberOfTeams || currentLeague?.teams?.length || 32
  const isOffenseOnly = currentLeague?.leagueMode === 'offense_only'
  // Offense-only: 30-player roster = 30 draft rounds; Full: 53
  const roundLength = currentLeague?.draftRounds || (isOffenseOnly ? 30 : 53)
  const { loading: draftLoading, draftRounds } = useSelector((state) => state.draft)
  const [data, setData] = useState([])
  const [draftTeams, setDraftTeams] = useState([])
  const [ids, setIds] = useState(
    Object.fromEntries(Array.from({ length: roundLength }, (_, i) => [i + 1, []])),
  )
  const [btnLoading, setBtnLoading] = useState(false)
  const [draftType, setDraftType] = useState(currentLeague?.draftType || 'snake')

  // ── Draft Speed Mode (Fast vs Slow) ──
  const [draftSpeed, setDraftSpeed] = useState(currentLeague?.draftSpeed || 'fast')
  const [slowDraftStartTime, setSlowDraftStartTime] = useState(
    currentLeague?.slowDraft?.startTime ? dayjs(currentLeague.slowDraft.startTime) : null
  )
  const [slowDraftEndTime, setSlowDraftEndTime] = useState(
    currentLeague?.slowDraft?.endTime ? dayjs(currentLeague.slowDraft.endTime) : null
  )
  const [slowDraftTimezone, setSlowDraftTimezone] = useState(
    currentLeague?.slowDraft?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  )
  const [slowDraftPickDuration, setSlowDraftPickDuration] = useState(
    currentLeague?.slowDraft?.pickDuration || 86400
  )
  const [slowDraftTimeExpire, setSlowDraftTimeExpire] = useState(
    currentLeague?.slowDraft?.timeExpireBehavior || 'auto_draft'
  )
  const [slowDraftSaving, setSlowDraftSaving] = useState(false)

  // Sync draft state when currentLeague loads async
  useEffect(() => {
    if (!currentLeague) return
    setDraftType(currentLeague.draftType || 'snake')
    setDraftSpeed(currentLeague.draftSpeed || 'fast')
    if (currentLeague.slowDraft?.startTime) setSlowDraftStartTime(dayjs(currentLeague.slowDraft.startTime))
    if (currentLeague.slowDraft?.endTime) setSlowDraftEndTime(dayjs(currentLeague.slowDraft.endTime))
    if (currentLeague.slowDraft?.timezone) setSlowDraftTimezone(currentLeague.slowDraft.timezone)
    if (currentLeague.slowDraft?.pickDuration) setSlowDraftPickDuration(currentLeague.slowDraft.pickDuration)
    if (currentLeague.slowDraft?.timeExpireBehavior) setSlowDraftTimeExpire(currentLeague.slowDraft.timeExpireBehavior)
  }, [currentLeague?._id])

  const handleUpdateLeague = async (updates) => {
    await updateLeagueCommissioner({ _id: currentLeague?._id, ...updates })
  }

  const handleSaveSlowDraft = async () => {
    setSlowDraftSaving(true)
    try {
      await updateLeagueCommissioner({
        _id: currentLeague?._id,
        draftSpeed,
        slowDraft: {
          startTime: slowDraftStartTime?.toISOString() || null,
          endTime: slowDraftEndTime?.toISOString() || null,
          timezone: slowDraftTimezone,
          pickDuration: slowDraftPickDuration,
          timeExpireBehavior: slowDraftTimeExpire,
        },
      })
      notification.success({ message: 'Draft settings saved', duration: 2 })
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to save draft settings', duration: 3 })
    }
    setSlowDraftSaving(false)
  }

  const getMock = () => {
    const _data = []
    for (let i = 1; i <= positionLength; i++) {
      const obj = { position: i, rounds: [] }
      for (let n = 1; n <= roundLength; n++) {
        obj.rounds.push({ round: n, disabled: false, team: '', _id: '' })
      }
      _data.push(obj)
    }
    return _data
  }

  useEffect(() => {
    _getTeams()
  }, [])

  useEffect(() => {
    getData()
    return () => {
      setIds(Object.fromEntries(Array.from({ length: roundLength }, (_, i) => [i + 1, []])))
    }
  }, [draftRounds])

  const getData = () => {
    const mockData = [...getMock()]
    draftRounds?.forEach((v) => {
      const posIndex = mockData?.findIndex((x) => v?.position === x?.position)
      const roundIndex = mockData[posIndex]?.rounds?.findIndex((x) => v?.round === x?.round)
      if (posIndex >= 0 && roundIndex >= 0) {
        mockData[posIndex].rounds[roundIndex].team = v?.team?._id
        mockData[posIndex].rounds[roundIndex]._id = v?._id
        setIds((prev) => {
          const updated = [...prev[roundIndex + 1]]
          if (!updated.includes(v?.team?._id)) updated.push(v?.team?._id)
          return { ...prev, [roundIndex + 1]: updated }
        })
      }
    })
    setData(mockData)
  }

  const _getTeams = async () => {
    const res = await getAllTeamsList()
    setDraftTeams(res)
    await getDraftRound()
  }

  const handleSelect = async (value, position, round) => {
    const temp = [...data]
    temp[position - 1].rounds[round - 1].team = value
    setData(temp)
    setIds((prev) => ({ ...prev, [round]: [...prev[round], value] }))
    await createDraftRound({ team: value, position, round })
  }

  const handleClear = async (value, position, round, teamId) => {
    const temp = [...data]
    temp[position - 1].rounds[round - 1].team = ''
    setData(temp)
    setIds((prev) => ({ ...prev, [round]: prev[round].filter((id) => id !== teamId) }))
    await deleteDraftRound(value)
  }

  const handleRandomized = async () => {
    setBtnLoading(2)
    if (draftTeams?.length > 0) {
      // Fisher-Yates shuffle to actually randomize the draft order
      const shuffled = [...draftTeams]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      const _rounds = shuffled.map((v, i) => ({
        position: i + 1,
        round: 1,
        league: currentLeague?._id,
        team: v?._id,
      }))
      await createRandomizedDraftRound({ rounds: _rounds })
    } else {
      notification.error({
        message: 'No teams found in this league.',
        duration: 3,
      })
    }
    setBtnLoading(-1)
  }

  const handleGenerateAll = async () => {
    setBtnLoading(1)
    await getDraftRound(false)
    const isComplete = draftRounds?.filter((v) => v?.round === 1)
    const teamCount = draftTeams?.length || positionLength
    if (isComplete?.length >= teamCount) {
      await generateAllRound({ draftType })
    } else {
      notification.error({ message: `Please complete round one first (${isComplete?.length || 0}/${teamCount}).`, duration: 3 })
    }
    setBtnLoading(-1)
  }

  const handleRandomDraftExecute = async () => {
    setBtnLoading(3)
    try {
      attachToken()
      const { data } = await privateAPI.post('/draft/random-draft', { leagueId: currentLeagueId })
      const result = data.data || data
      notification.success({
        message: 'Random Draft Complete',
        description: `${result.summary?.playersDistributed || 'All'} players distributed to ${result.summary?.teamsCount || 'all'} teams with parity.`,
        duration: 6,
      })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Random draft failed', duration: 5 })
    }
    setBtnLoading(-1)
  }

  // Round navigation
  const [activeRoundPage, setActiveRoundPage] = useState(0)
  const roundsPerPage = 7
  const totalPages = Math.ceil(roundLength / roundsPerPage)

  // Color palette for teams (consistent colors per team)
  const TEAM_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F1948A', '#82E0AA', '#F0B27A', '#AED6F1', '#D7BDE2',
    '#A3E4D7', '#FAD7A0', '#F5B7B1', '#D5F5E3', '#FADBD8',
    '#D4E6F1', '#FCF3CF', '#E8DAEF', '#D5D8DC', '#ABEBC6',
    '#F9E79F', '#A2D9CE', '#F5CBA7', '#D2B4DE', '#AEB6BF',
    '#73C6B6', '#EC7063',
  ]

  const getTeamColor = (teamId) => {
    if (!teamId) return null
    const idx = draftTeams?.findIndex((t) => t?._id === teamId)
    return idx >= 0 ? TEAM_COLORS[idx % TEAM_COLORS.length] : null
  }

  const getTeamName = (teamId) => {
    if (!teamId) return null
    const team = draftTeams?.find((t) => t?._id === teamId)
    return team?.name || null
  }

  const getTeamAbbr = (teamId) => {
    const name = getTeamName(teamId)
    if (!name) return null
    return name.length > 10 ? name.substring(0, 8) + '..' : name
  }

  const startRound = activeRoundPage * roundsPerPage
  const endRound = Math.min(startRound + roundsPerPage, roundLength)

  // Stats
  const filledSlots = draftRounds?.length || 0
  const totalSlots = positionLength * roundLength
  const fillPercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

  return (
    <>
      {/* Draft Board Header */}
      <div className='cm-draft-header'>
        <div className='cm-draft-header-left'>
          <div className='cm-draft-header-icon'>
            <OrderedListOutlined style={{ fontSize: 20, color: '#22C55E' }} />
          </div>
          <div>
            <h3 className='cm-draft-header-title'>{t('draftBoard')}</h3>
            <span className='cm-draft-header-sub'>{positionLength} {t('positions')} &times; {roundLength} {t('rounds')}</span>
          </div>
        </div>
        <div className='cm-draft-stats'>
          <div className='cm-draft-stat'>
            <span className='cm-draft-stat-value'>{filledSlots}</span>
            <span className='cm-draft-stat-label'>{t('assigned')}</span>
          </div>
          <div className='cm-draft-stat'>
            <span className='cm-draft-stat-value'>{totalSlots - filledSlots}</span>
            <span className='cm-draft-stat-label'>{t('empty')}</span>
          </div>
          <div className='cm-draft-stat'>
            <span className='cm-draft-stat-value' style={{ color: fillPercent > 50 ? '#22C55E' : '#fbbf24' }}>{fillPercent}%</span>
            <span className='cm-draft-stat-label'>{t('complete')}</span>
          </div>
        </div>
      </div>

      {/* ── Draft Speed: Fast vs Slow ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Draft Speed
        </div>
        <div className='cm-draft-pick-cards' style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 0 }}>
          <div
            className={`cm-draft-pick-card ${draftSpeed === 'fast' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setDraftSpeed('fast')}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>⚡</span>
              {draftSpeed === 'fast' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>Fast Draft</h4>
            <p className='cm-draft-pick-card-desc'>
              Live real-time draft. All owners pick in a single session with a short clock per pick.
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#22C55E' }}>Standard</span>
          </div>
          <div
            className={`cm-draft-pick-card ${draftSpeed === 'slow' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setDraftSpeed('slow')}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>🕐</span>
              {draftSpeed === 'slow' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>Slow Draft</h4>
            <p className='cm-draft-pick-card-desc'>
              Asynchronous draft over hours or days. Each owner picks when it&apos;s their turn within a time window.
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#a5b4fc' }}>Async</span>
          </div>
        </div>

        {/* ── Slow Draft Configuration ── */}
        {draftSpeed === 'slow' && (
          <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(34, 197, 94, 0.04)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Slow Draft Configuration</div>

            {/* Start / End Time */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Draft Start</div>
                <SamDatePicker
                  showTime
                  value={slowDraftStartTime}
                  onChange={(val) => setSlowDraftStartTime(val)}
                  disabledDate={(date) => date && date.isBefore(dayjs().startOf('day'))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px' }}
                  placeholder='Select start date & time'
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Draft End</div>
                <SamDatePicker
                  showTime
                  value={slowDraftEndTime}
                  onChange={(val) => setSlowDraftEndTime(val)}
                  disabledDate={(date) => date && date.isBefore(slowDraftStartTime || dayjs().startOf('day'))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px' }}
                  placeholder='Select end date & time'
                />
              </div>
            </div>

            {/* Timezone + Pick Duration */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Time Zone</div>
                <select
                  value={slowDraftTimezone}
                  onChange={(e) => setSlowDraftTimezone(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', padding: '8px 12px', fontSize: '13px' }}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>Time Per Pick</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PICK_DURATIONS.map((pd) => (
                    <button
                      key={pd.value}
                      onClick={() => setSlowDraftPickDuration(pd.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: slowDraftPickDuration === pd.value ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.12)',
                        background: slowDraftPickDuration === pd.value ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                        color: slowDraftPickDuration === pd.value ? '#22C55E' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {pd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Expire Behavior */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>When Time Expires</div>
              <div className='cm-draft-pick-cards' style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 0 }}>
                <div
                  className={`cm-draft-pick-card ${slowDraftTimeExpire === 'auto_draft' ? 'cm-draft-pick-card--active' : ''}`}
                  onClick={() => setSlowDraftTimeExpire('auto_draft')}
                  style={{ padding: '12px 16px' }}
                >
                  <div className='cm-draft-pick-card-top' style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    {slowDraftTimeExpire === 'auto_draft' && <span className='cm-draft-pick-card-check'>✓</span>}
                  </div>
                  <h4 className='cm-draft-pick-card-title' style={{ fontSize: 13 }}>Auto-Draft</h4>
                  <p className='cm-draft-pick-card-desc' style={{ fontSize: 11 }}>
                    Automatically draft the best available player when time runs out
                  </p>
                </div>
                <div
                  className={`cm-draft-pick-card ${slowDraftTimeExpire === 'pause' ? 'cm-draft-pick-card--active' : ''}`}
                  onClick={() => setSlowDraftTimeExpire('pause')}
                  style={{ padding: '12px 16px' }}
                >
                  <div className='cm-draft-pick-card-top' style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>⏸️</span>
                    {slowDraftTimeExpire === 'pause' && <span className='cm-draft-pick-card-check'>✓</span>}
                  </div>
                  <h4 className='cm-draft-pick-card-title' style={{ fontSize: 13 }}>Pause Draft</h4>
                  <p className='cm-draft-pick-card-desc' style={{ fontSize: 11 }}>
                    Pause the draft until the owner makes their selection
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              className='cm-save-btn'
              onClick={handleSaveSlowDraft}
              disabled={slowDraftSaving}
              style={{ width: '100%', marginTop: 4 }}
            >
              {slowDraftSaving ? 'Saving...' : 'Save Slow Draft Settings'}
            </button>
          </div>
        )}
      </div>

      {/* Draft Type Selector with Explanations */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          {t('draftType')}
        </div>
        <div className='cm-draft-pick-cards' style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
          <div
            className={`cm-draft-pick-card ${draftType === 'snake' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setDraftType('snake')}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>🐍</span>
              {draftType === 'snake' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>{t('snakeDraft')}</h4>
            <p className='cm-draft-pick-card-desc'>
              {t('snakeDesc')}
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#22C55E' }}>{t('recommended')}</span>
          </div>
          <div
            className={`cm-draft-pick-card ${draftType === 'linear' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setDraftType('linear')}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>📏</span>
              {draftType === 'linear' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>{t('linearDraft')}</h4>
            <p className='cm-draft-pick-card-desc'>
              {t('linearDesc')}
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#a5b4fc' }}>{t('traditional')}</span>
          </div>
          <div
            className={`cm-draft-pick-card ${draftType === 'random' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => setDraftType('random')}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>🎲</span>
              {draftType === 'random' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>{t('randomDraft') || 'Random Draft'}</h4>
            <p className='cm-draft-pick-card-desc'>
              {t('randomDraftDesc') || 'All players are distributed to all teams instantly in one go with parity. No draft room needed — done in seconds.'}
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#22C55E' }}>{t('instant') || 'Instant'}</span>
          </div>
        </div>
        {draftType === 'random' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              {t('randomDraftDesc') || 'All players are distributed to all teams instantly in one go with parity. No draft room needed — done in seconds. Each team gets roughly equal talent at every position.'}
            </p>
            <button
              className='cm-draft-action-btn cm-draft-action-generate'
              disabled={btnLoading === 3}
              onClick={handleRandomDraftExecute}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: 16 }}>🎲</span>
              {btnLoading === 3 ? 'Distributing Players...' : 'Execute Random Draft — Instant'}
            </button>
          </div>
        )}
      </div>

      {/* Rookie Draft Format Selector */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Rookie Draft Format
        </div>
        <div className='cm-draft-pick-cards' style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 0 }}>
          <div
            className={`cm-draft-pick-card ${(currentLeague?.draftFormat || 'combined') === 'combined' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => handleUpdateLeague({ draftFormat: 'combined' })}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>📋</span>
              {(currentLeague?.draftFormat || 'combined') === 'combined' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>Combined Draft</h4>
            <p className='cm-draft-pick-card-desc'>
              Rookies and veterans are available in one entry draft. Standard for redraft and startup leagues.
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#22C55E' }}>Standard</span>
          </div>
          <div
            className={`cm-draft-pick-card ${currentLeague?.draftFormat === 'separate_rookie' ? 'cm-draft-pick-card--active' : ''}`}
            onClick={() => handleUpdateLeague({ draftFormat: 'separate_rookie', rookieDraftRounds: currentLeague?.rookieDraftRounds || 7 })}
          >
            <div className='cm-draft-pick-card-top'>
              <span className='cm-draft-pick-card-emoji'>🏈</span>
              {currentLeague?.draftFormat === 'separate_rookie' && <span className='cm-draft-pick-card-check'>✓</span>}
            </div>
            <h4 className='cm-draft-pick-card-title'>Separate Rookie Draft</h4>
            <p className='cm-draft-pick-card-desc'>
              Dynasty-style: rookies are excluded from the entry draft and drafted in a separate 7-round rookie-only draft.
            </p>
            <span className='cm-draft-pick-card-tag' style={{ '--tag-color': '#a5b4fc' }}>Dynasty</span>
          </div>
        </div>
        {currentLeague?.draftFormat === 'separate_rookie' && (
          <div style={{ marginTop: '12px', padding: '14px 16px', background: 'rgba(0, 180, 120, 0.06)', border: '1px solid rgba(0, 180, 120, 0.18)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>Rounds</div>
                <select
                  value={currentLeague?.rookieDraftRounds || 7}
                  onChange={(e) => handleUpdateLeague({ rookieDraftRounds: Number(e.target.value) })}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '13px' }}
                >
                  <option value={4}>4 Rounds</option>
                  <option value={5}>5 Rounds</option>
                  <option value={6}>6 Rounds</option>
                  <option value={7}>7 Rounds</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>Pick Timer</div>
                <select
                  value={currentLeague?.rookieDraftPickTimer || 120}
                  onChange={(e) => handleUpdateLeague({ rookieDraftPickTimer: Number(e.target.value) })}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '13px' }}
                >
                  <option value={60}>1 min</option>
                  <option value={120}>2 min</option>
                  <option value={180}>3 min</option>
                  <option value={300}>5 min</option>
                  <option value={480}>8 min</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>Draft Order</div>
                <select
                  value={currentLeague?.rookieDraftOrderMethod || 'inverse_standings'}
                  onChange={(e) => handleUpdateLeague({ rookieDraftOrderMethod: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '13px' }}
                >
                  <option value="inverse_standings">Inverse Standings</option>
                  <option value="lottery">Lottery (Anti-Tanking)</option>
                  <option value="commissioner_set">Commissioner Set</option>
                </select>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '10px 0 0 0', lineHeight: 1.4 }}>
              The rookie draft is typically held after the NFL Draft. You can set the date in League Settings.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='cm-draft-actions'>
        <button className='cm-draft-action-btn cm-draft-action-randomize' disabled={btnLoading === 2} onClick={handleRandomized}>
          <span style={{ fontSize: 16 }}>🎲</span>
          {btnLoading === 2 ? t('randomizing') : t('randomizeRound1')}
        </button>
        <button className='cm-draft-action-btn cm-draft-action-generate' disabled={btnLoading === 1} onClick={handleGenerateAll}>
          <span style={{ fontSize: 16 }}>⚡</span>
          {btnLoading === 1 ? t('generating') : t('generateAllRounds')}
        </button>
      </div>

      {/* Round Navigation */}
      <div className='cm-draft-round-nav'>
        <button
          className='cm-draft-round-arrow'
          disabled={activeRoundPage === 0}
          onClick={() => setActiveRoundPage((p) => Math.max(0, p - 1))}
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`cm-draft-round-page ${activeRoundPage === i ? 'cm-draft-round-page--active' : ''}`}
            onClick={() => setActiveRoundPage(i)}
          >
            Rd {i * roundsPerPage + 1}-{Math.min((i + 1) * roundsPerPage, roundLength)}
          </button>
        )).slice(0, 8)}
        {totalPages > 8 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>...</span>}
        <button
          className='cm-draft-round-arrow'
          disabled={activeRoundPage === totalPages - 1}
          onClick={() => setActiveRoundPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          ›
        </button>
      </div>

      {/* Draft Board Grid */}
      {draftLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size='large' /></div>
      ) : (
        <div className='cm-draft-board-wrap'>
          <div className='cm-draft-board'>
            {/* Header Row */}
            <div className='cm-draft-board-row cm-draft-board-header-row'>
              <div className='cm-draft-board-cell cm-draft-board-pick-num'>#</div>
              {Array.from({ length: endRound - startRound }, (_, i) => (
                <div key={i} className='cm-draft-board-cell cm-draft-board-round-header'>
                  Rd {startRound + i + 1}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {data.slice(0, positionLength).map((row) => (
              <div key={row.position} className='cm-draft-board-row'>
                <div className='cm-draft-board-cell cm-draft-board-pick-num'>
                  {row.position}
                </div>
                {row.rounds.slice(startRound, endRound).map((cell) => {
                  const teamColor = getTeamColor(cell.team)
                  const teamName = getTeamAbbr(cell.team)
                  return (
                    <div
                      key={cell.round}
                      className={`cm-draft-board-cell cm-draft-board-team-cell ${teamName ? 'cm-draft-board-team-cell--filled' : ''}`}
                      style={teamColor ? { '--team-color': teamColor } : undefined}
                    >
                      {teamName ? (
                        <div className='cm-draft-board-team-pill'>
                          <span className='cm-draft-board-team-name'>{teamName}</span>
                          <button
                            className='cm-draft-board-team-clear'
                            onClick={(e) => { e.stopPropagation(); handleClear(cell._id, row.position, cell.round, cell.team) }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Select
                          size='small'
                          placeholder='—'
                          className='cm-draft-board-select'
                          popupClassName='cm-draft-board-dropdown'
                          value={undefined}
                          onChange={(val) => val !== undefined && handleSelect(val, row.position, cell.round)}
                          options={draftTeams
                            ?.filter((t) => !ids[cell.round]?.includes(t?._id))
                            .map((t) => ({ value: t?._id, label: t?.name }))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Legend */}
      {draftTeams?.length > 0 && (
        <div className='cm-draft-legend'>
          <span className='cm-draft-legend-title'>Teams</span>
          <div className='cm-draft-legend-items'>
            {draftTeams.map((t, i) => (
              <div key={t?._id} className='cm-draft-legend-item'>
                <span className='cm-draft-legend-dot' style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
                <span className='cm-draft-legend-name'>{t?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auction Schedule Section */}
      <AuctionScheduleSection currentLeague={currentLeague} draftDate={currentLeague?.draftStart} />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Team Control, Anti-Tanking, Inactive Owners, AI Autopilot
   ═══════════════════════════════════════════════════════════ */
const TeamControlTab = ({ teams, currentLeague }) => {
  const [saving, setSaving] = useState(false)

  // Anti-Tanking thresholds (matching AI Commissioner values)
  const [tankingThresholdHigh, setTankingThresholdHigh] = useState(currentLeague?.tankingThresholdHigh ?? 50)
  const [tankingThresholdMed, setTankingThresholdMed] = useState(currentLeague?.tankingThresholdMed ?? 30)
  const [tankingAutoBlock, setTankingAutoBlock] = useState(currentLeague?.tankingAutoBlock ?? true)
  const [tankingNotifyCommissioner, setTankingNotifyCommissioner] = useState(currentLeague?.tankingNotifyCommissioner ?? true)

  // Inactive Owner settings
  const [inactivityDays, setInactivityDays] = useState(currentLeague?.inactivityDays ?? 14)
  const [inactivityWarningDays, setInactivityWarningDays] = useState(currentLeague?.inactivityWarningDays ?? 7)
  const [autoTransferOnInactivity, setAutoTransferOnInactivity] = useState(currentLeague?.autoTransferOnInactivity ?? false)

  // AI Autopilot
  const [aiAutopilotEnabled, setAiAutopilotEnabled] = useState(currentLeague?.aiAutopilotEnabled ?? true)

  // Sync team control state when currentLeague loads async
  useEffect(() => {
    if (!currentLeague) return
    setTankingThresholdHigh(currentLeague.tankingThresholdHigh ?? 50)
    setTankingThresholdMed(currentLeague.tankingThresholdMed ?? 30)
    setTankingAutoBlock(currentLeague.tankingAutoBlock ?? true)
    setTankingNotifyCommissioner(currentLeague.tankingNotifyCommissioner ?? true)
    setInactivityDays(currentLeague.inactivityDays ?? 14)
    setInactivityWarningDays(currentLeague.inactivityWarningDays ?? 7)
    setAutoTransferOnInactivity(currentLeague.autoTransferOnInactivity ?? false)
    setAiAutopilotEnabled(currentLeague.aiAutopilotEnabled ?? true)
  }, [currentLeague?._id])

  // Team takeover state
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [takeoverAction, setTakeoverAction] = useState(null)
  const [showTakeoverModal, setShowTakeoverModal] = useState(false)

  // Transfer wizard state
  const [transferStep, setTransferStep] = useState(0) // 0=closed, 1=select-abandonment, 2=cooldown/waiting, 3=enter-email, 4=enter-otp, 5=done
  const [transferTeamId, setTransferTeamId] = useState(null)
  const [abandonmentType, setAbandonmentType] = useState(null)
  const [transferReason, setTransferReason] = useState('')
  const [transferId, setTransferId] = useState(null)
  const [transferStatus, setTransferStatus] = useState(null)
  const [newOwnerEmail, setNewOwnerEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')

  const resetTransferWizard = () => {
    setTransferStep(0)
    setTransferTeamId(null)
    setAbandonmentType(null)
    setTransferReason('')
    setTransferId(null)
    setTransferStatus(null)
    setNewOwnerEmail('')
    setOtpCode('')
    setTransferLoading(false)
    setTransferError('')
  }

  const handleInitiateTransfer = async () => {
    if (!transferTeamId || !abandonmentType) return
    setTransferLoading(true)
    setTransferError('')
    try {
      attachToken()
      const res = await privateAPI.post('/team-control/transfer/initiate', {
        teamId: transferTeamId,
        abandonmentType,
        reason: transferReason,
      })
      const data = res.data?.data
      setTransferId(data?.transfer?._id)
      setTransferStatus(data?.transfer?.status)
      if (data?.transfer?.status === 'ready_for_transfer') {
        setTransferStep(3) // skip to email entry
      } else {
        setTransferStep(2) // cooldown or pending consent
      }
    } catch (err) {
      setTransferError(err?.response?.data?.message || 'Failed to initiate transfer')
    }
    setTransferLoading(false)
  }

  const handleSendOtp = async () => {
    if (!newOwnerEmail || !transferId) return
    setTransferLoading(true)
    setTransferError('')
    try {
      attachToken()
      await privateAPI.post('/team-control/transfer/send-otp', {
        transferId,
        newOwnerEmail,
      })
      setTransferStep(4)
    } catch (err) {
      setTransferError(err?.response?.data?.message || 'Failed to send verification code')
    }
    setTransferLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || !transferId) return
    setTransferLoading(true)
    setTransferError('')
    try {
      attachToken()
      await privateAPI.post('/team-control/transfer/verify-otp', {
        transferId,
        otpCode,
      })
      setTransferStep(5)
      notification.success({ message: 'Team transferred successfully!', duration: 4 })
    } catch (err) {
      setTransferError(err?.response?.data?.message || 'Invalid verification code')
    }
    setTransferLoading(false)
  }

  const handleCheckTransferStatus = async () => {
    if (!transferId) return
    try {
      attachToken()
      const res = await privateAPI.get(`/team-control/transfer/status/${transferId}`)
      const data = res.data?.data
      setTransferStatus(data?.status)
      if (data?.status === 'ready_for_transfer') {
        setTransferStep(3)
      } else if (data?.status === 'cancelled') {
        setTransferError('The original owner has reclaimed the team. Transfer cancelled.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await updateLeagueCommissioner({
      _id: currentLeague?._id,
      tankingThresholdHigh,
      tankingThresholdMed,
      autoBlockTanking: tankingAutoBlock,
      notifyOnTanking: tankingNotifyCommissioner,
      inactivityTransferDays: inactivityDays,
      inactivityWarningDays,
      autoTransferOnInactivity,
      aiAutopilotEnabled,
    })
    setSaving(false)
  }

  const handleTakeoverConfirm = async () => {
    if (!selectedTeam || !takeoverAction) return
    try {
      attachToken()
      if (takeoverAction === 'ai_autopilot') {
        await privateAPI.post('/team-control/enable-ai-autopilot', { teamId: selectedTeam })
      } else if (takeoverAction === 'remove_autopilot') {
        await privateAPI.post('/team-control/disable-ai-autopilot', { teamId: selectedTeam })
      } else if (takeoverAction === 'transfer') {
        // Open the transfer wizard instead of a simple lock
        setTransferTeamId(selectedTeam)
        setTransferStep(1)
        setShowTakeoverModal(false)
        setSelectedTeam(null)
        setTakeoverAction(null)
        return
      } else if (takeoverAction === 'lock') {
        await privateAPI.post('/team-control/lock-team', {
          teamId: selectedTeam,
          reason: 'Locked by commissioner',
        })
      }
      notification.success({
        message: takeoverAction === 'ai_autopilot'
          ? 'AI Commissioner is now managing this team'
          : takeoverAction === 'remove_autopilot'
            ? 'AI Autopilot disabled'
            : takeoverAction === 'transfer'
              ? 'Team locked, pending ownership transfer'
              : 'Team has been locked',
        duration: 3,
      })
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Failed to execute action',
        duration: 3,
      })
    }
    setShowTakeoverModal(false)
    setSelectedTeam(null)
    setTakeoverAction(null)
  }

  return (
    <>
      {/* Anti-Tanking Enforcement */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-red'>
            <ExclamationCircleOutlined />
          </div>
          <h3 className='cm-section-title'>Anti-Tanking Enforcement</h3>
          <span className='cm-section-desc'>Uses the same scoring values as AI Commissioner</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          The AI Commissioner scores tanking risk based on player value dumps, salary cap drops,
          roster gutting, and trade imbalances. Configure the thresholds and automatic responses below.
        </p>

        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Auto-Block High-Risk Trades</span>
            <span className='cm-toggle-desc'>Automatically block trades flagged as high tanking risk by the AI Commissioner</span>
          </div>
          <Switch checked={tankingAutoBlock} onChange={setTankingAutoBlock} />
        </div>
        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Notify Commissioner on Detection</span>
            <span className='cm-toggle-desc'>Send commissioner a notification when any tanking behavior is detected</span>
          </div>
          <Switch checked={tankingNotifyCommissioner} onChange={setTankingNotifyCommissioner} />
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(110,105,128,0.15)' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Tanking Score Thresholds
          </span>
          <div className='cm-form-grid' style={{ marginTop: 12 }}>
            <div className='cm-field'>
              <label className='cm-field-label'>High Risk Threshold (auto-block)</label>
              <InputNumber
                min={20}
                max={100}
                value={tankingThresholdHigh}
                onChange={setTankingThresholdHigh}
                style={{ width: '100%' }}
              />
              <span className='cm-field-hint'>Default: 50, Trades scoring at or above this are blocked</span>
            </div>
            <div className='cm-field'>
              <label className='cm-field-label'>Medium Risk Threshold (flag for review)</label>
              <InputNumber
                min={10}
                max={80}
                value={tankingThresholdMed}
                onChange={setTankingThresholdMed}
                style={{ width: '100%' }}
              />
              <span className='cm-field-hint'>Default: 30, Trades scoring at or above this require commissioner review</span>
            </div>
          </div>
        </div>

        {/* Tanking Score Breakdown, read-only reference */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(110,105,128,0.15)' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            How Tanking Score is Calculated
          </span>
          <div style={{ marginTop: 12 }}>
            {[
              { label: 'Selling high-value players for low returns (>2.5× gap)', pts: '+30' },
              { label: 'Moderate value gap in trades (>1.8× gap)', pts: '+15' },
              { label: 'Dropping to <2% of salary cap floor', pts: '+40' },
              { label: 'Dropping to <5% of salary cap floor', pts: '+20' },
              { label: 'Dropping to <10% of salary cap floor', pts: '+10' },
              { label: 'Selling 2× more players than receiving', pts: '+20' },
              { label: 'Leaving roster near minimum players', pts: '+15' },
              { label: 'Salary cap drop >20% from single trade', pts: '+25' },
              { label: 'Salary cap drop >10% from single trade', pts: '+10' },
            ].map((item, i) => (
              <div key={i} className='cm-rule-row' style={{ marginBottom: 4 }}>
                <span className='cm-rule-name' style={{ flex: 4, fontSize: 12 }}>{item.label}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#EF4444', textAlign: 'right' }}>{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inactive Owner Detection */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-amber'>
            <CalendarOutlined />
          </div>
          <h3 className='cm-section-title'>Inactive Owner Detection</h3>
          <span className='cm-section-desc'>Automatically detect and respond to unresponsive owners</span>
        </div>

        <div className='cm-form-grid'>
          <div className='cm-field'>
            <label className='cm-field-label'>Warning After (days inactive)</label>
            <InputNumber
              min={3}
              max={30}
              value={inactivityWarningDays}
              onChange={setInactivityWarningDays}
              style={{ width: '100%' }}
            />
            <span className='cm-field-hint'>Send the owner a warning notification after this many days of inactivity</span>
          </div>
          <div className='cm-field'>
            <label className='cm-field-label'>Takeover Eligible After (days inactive)</label>
            <InputNumber
              min={7}
              max={60}
              value={inactivityDays}
              onChange={setInactivityDays}
              style={{ width: '100%' }}
            />
            <span className='cm-field-hint'>Commissioner can take control of team after this many days with no response</span>
          </div>
        </div>

        <div className='cm-toggle-row' style={{ marginTop: 16 }}>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Auto-Transfer to AI on Expiry</span>
            <span className='cm-toggle-desc'>
              If the owner does not respond after the takeover window, automatically hand the team to the AI Commissioner
            </span>
          </div>
          <Switch checked={autoTransferOnInactivity} onChange={setAutoTransferOnInactivity} />
        </div>
      </div>

      {/* Team Takeover & AI Autopilot */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-blue'>
            <SafetyCertificateOutlined />
          </div>
          <h3 className='cm-section-title'>Team Takeover & AI Autopilot</h3>
          <span className='cm-section-desc'>Take control of a team or assign AI Commissioner to manage it</span>
        </div>

        <div className='cm-toggle-row' style={{ marginBottom: 20 }}>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Enable AI Autopilot</span>
            <span className='cm-toggle-desc'>
              Allow the AI Commissioner to fully manage a team, setting lineups, making roster moves, and
              handling auctions, while you find a replacement owner. Keeps the league competitive and healthy.
            </span>
          </div>
          <Switch checked={aiAutopilotEnabled} onChange={setAiAutopilotEnabled} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Take Action on a Team
          </span>
        </div>

        <div className='cm-form-grid' style={{ marginBottom: 16 }}>
          <div className='cm-field'>
            <label className='cm-field-label'>Select Team</label>
            <Select
              placeholder='Choose a team'
              value={selectedTeam || undefined}
              onChange={setSelectedTeam}
              style={{ width: '100%' }}
            >
              {teams?.filter((t) => t?.user).map((team, i) => (
                <Select.Option key={i} value={team?._id}>
                  {team?.name}, {team?.user?.firstName && team?.user?.lastName ? `${team.user.firstName} ${team.user.lastName}` : team?.user?.userName}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className='cm-field'>
            <label className='cm-field-label'>Action</label>
            <Select
              placeholder='Select action'
              value={takeoverAction || undefined}
              onChange={setTakeoverAction}
              style={{ width: '100%' }}
            >
              <Select.Option value='ai_autopilot'>
                Assign AI Commissioner (Autopilot)
              </Select.Option>
              <Select.Option value='transfer'>
                Transfer Team to New Owner
              </Select.Option>
              <Select.Option value='lock'>
                Lock Team (Freeze All Activity)
              </Select.Option>
              <Select.Option value='remove_autopilot'>
                Remove AI Autopilot (Return to Owner)
              </Select.Option>
            </Select>
          </div>
        </div>

        <button
          className='cm-save-btn'
          disabled={!selectedTeam || !takeoverAction}
          onClick={() => setShowTakeoverModal(true)}
          style={{ marginBottom: 16 }}
        >
          Execute Action
        </button>

        {/* Takeover Confirmation Modal */}
        <Modal
          title='Confirm Team Action'
          open={showTakeoverModal}
          onOk={handleTakeoverConfirm}
          onCancel={() => setShowTakeoverModal(false)}
          okText='Confirm'
          okType={takeoverAction === 'lock' ? 'danger' : 'primary'}
        >
          {takeoverAction === 'ai_autopilot' && (
            <p>
              The AI Commissioner will take over managing this team, setting optimal lineups,
              handling auction bids within SamPoints budget, and maintaining roster compliance.
              The original owner will be notified and can reclaim the team once you allow it.
            </p>
          )}
          {takeoverAction === 'transfer' && (
            <p>
              This will revoke the current owner&apos;s access and allow you to assign a new owner.
              The current owner will be notified that their team rights have been transferred.
            </p>
          )}
          {takeoverAction === 'lock' && (
            <p>
              This will freeze all activity on this team, no trades, no auctions, no lineup changes.
              Use this as an emergency measure until the situation is resolved.
            </p>
          )}
          {takeoverAction === 'remove_autopilot' && (
            <p>
              This will return full control of the team back to the original owner and disable
              AI Commissioner management. The owner will be notified.
            </p>
          )}
        </Modal>
      </div>

      {/* ═══ Transfer Wizard Modal ═══ */}
      <Modal
        title={null}
        open={transferStep > 0}
        onCancel={resetTransferWizard}
        footer={null}
        width={560}
        destroyOnClose
        className='cm-transfer-modal'
      >
        <div className='cm-transfer-wizard'>
          {/* Progress steps */}
          <div className='cm-transfer-steps'>
            {['Verify', 'New Owner', 'Confirm'].map((label, i) => (
              <div key={i} className={`cm-transfer-step ${transferStep >= (i === 0 ? 1 : i === 1 ? 3 : 4) ? 'cm-transfer-step--active' : ''} ${transferStep === 5 ? 'cm-transfer-step--done' : ''}`}>
                <span className='cm-transfer-step-num'>{transferStep === 5 ? '✓' : i + 1}</span>
                <span className='cm-transfer-step-label'>{label}</span>
              </div>
            ))}
          </div>

          {transferError && (
            <div className='cm-transfer-error'>{transferError}</div>
          )}

          {/* Step 1: Select abandonment verification method */}
          {transferStep === 1 && (
            <div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '20px 0 8px' }}>
                Why is this team being transferred?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
                To protect owners, you must verify the reason before transferring a team. This prevents abuse.
              </p>
              <div className='cm-draft-pick-cards' style={{ gridTemplateColumns: '1fr' }}>
                {[
                  {
                    value: 'inactivity',
                    emoji: '💤',
                    title: 'Owner Inactivity',
                    desc: `System-verified: owner must be inactive for ${currentLeague?.inactivityTransferDays || 14}+ days. The system checks automatically.`,
                    tag: 'Auto-Verified',
                  },
                  {
                    value: 'commissioner_declared',
                    emoji: '📢',
                    title: 'Commissioner Declaration',
                    desc: 'You declare the team abandoned. The original owner gets notified and has 48 hours to respond and reclaim their team before the transfer proceeds.',
                    tag: '48h Cooldown',
                  },
                  {
                    value: 'owner_consent',
                    emoji: '🤝',
                    title: 'Owner Voluntarily Gives Up Team',
                    desc: 'The original owner has agreed to transfer their team. They will receive a notification to confirm their consent before the transfer can proceed.',
                    tag: 'Owner Confirms',
                  },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    className={`cm-draft-pick-card ${abandonmentType === opt.value ? 'cm-draft-pick-card--active' : ''}`}
                    onClick={() => setAbandonmentType(opt.value)}
                    style={{ padding: '16px 18px' }}
                  >
                    <div className='cm-draft-pick-card-top'>
                      <span className='cm-draft-pick-card-emoji' style={{ fontSize: 24 }}>{opt.emoji}</span>
                      {abandonmentType === opt.value && <span className='cm-draft-pick-card-check'>✓</span>}
                    </div>
                    <h4 className='cm-draft-pick-card-title' style={{ fontSize: 15 }}>{opt.title}</h4>
                    <p className='cm-draft-pick-card-desc'>{opt.desc}</p>
                    <span className='cm-draft-pick-card-tag' style={{ '--tag-color': opt.value === 'owner_consent' ? '#22C55E' : opt.value === 'commissioner_declared' ? '#f59e0b' : '#60a5fa' }}>
                      {opt.tag}
                    </span>
                  </div>
                ))}
              </div>
              <div className='cm-field' style={{ marginTop: 16 }}>
                <label className='cm-field-label'>Reason (optional)</label>
                <Input.TextArea
                  rows={2}
                  placeholder='Why is this transfer needed?'
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff' }}
                />
              </div>
              <button
                className='cm-save-btn'
                style={{ marginTop: 20, width: '100%' }}
                disabled={!abandonmentType || transferLoading}
                onClick={handleInitiateTransfer}
              >
                {transferLoading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          )}

          {/* Step 2: Cooldown / Waiting for owner */}
          {transferStep === 2 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {transferStatus === 'cooldown_active' ? '⏳' : '📩'}
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {transferStatus === 'cooldown_active' ? 'Waiting for Owner Response' : 'Consent Request Sent'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                {transferStatus === 'cooldown_active'
                  ? 'The original owner has been notified and has 48 hours to respond. If they don\'t respond, the transfer will automatically be approved.'
                  : 'The original owner has been asked to confirm they want to give up the team. You\'ll be able to proceed once they consent.'}
              </p>
              <button
                className='cm-save-btn'
                style={{ width: '100%' }}
                onClick={handleCheckTransferStatus}
              >
                Check Status
              </button>
              <button
                className='cm-reject-btn'
                style={{ width: '100%', marginTop: 12 }}
                onClick={async () => {
                  try {
                    attachToken()
                    await privateAPI.post('/team-control/transfer/cancel', { transferId })
                    resetTransferWizard()
                    notification.info({ message: 'Transfer cancelled', duration: 3 })
                  } catch (err) {
                    setTransferError(err?.response?.data?.message || 'Failed to cancel')
                  }
                }}
              >
                Cancel Transfer
              </button>
            </div>
          )}

          {/* Step 3: Enter new owner email */}
          {transferStep === 3 && (
            <div>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>✅</div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
                Abandonment Verified
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
                Enter the new owner&apos;s email address. They&apos;ll receive a 6-digit verification code to claim the team.
              </p>
              <div className='cm-field'>
                <label className='cm-field-label'>New Owner Email</label>
                <Input
                  placeholder='e.g. newowner@email.com'
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110,105,128,0.2)', color: '#fff' }}
                  onPressEnter={handleSendOtp}
                />
                <span className='cm-field-hint'>
                  If this email is already a SamSports user, the team will be assigned to their existing account.
                </span>
              </div>
              <button
                className='cm-save-btn'
                style={{ marginTop: 20, width: '100%' }}
                disabled={!newOwnerEmail || transferLoading}
                onClick={handleSendOtp}
              >
                {transferLoading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {/* Step 4: Enter OTP */}
          {transferStep === 4 && (
            <div>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📧</div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
                Enter Verification Code
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
                A 6-digit code was sent to <strong style={{ color: '#22C55E' }}>{newOwnerEmail}</strong>.
                The new owner needs to share this code with you or enter it themselves.
              </p>
              <div className='cm-field' style={{ maxWidth: 280, margin: '0 auto' }}>
                <Input
                  placeholder='000000'
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '2px solid rgba(34,197,94,0.3)',
                    color: '#22C55E',
                    fontSize: 28,
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: 8,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    padding: '12px 16px',
                  }}
                  onPressEnter={handleVerifyOtp}
                />
                <span className='cm-field-hint' style={{ textAlign: 'center', display: 'block', marginTop: 8 }}>
                  Code expires in 30 minutes
                </span>
              </div>
              <button
                className='cm-save-btn'
                style={{ marginTop: 20, width: '100%' }}
                disabled={otpCode.length !== 6 || transferLoading}
                onClick={handleVerifyOtp}
              >
                {transferLoading ? 'Verifying...' : 'Verify & Transfer'}
              </button>
              <button
                className='cm-reject-btn'
                style={{ width: '100%', marginTop: 12, background: 'transparent', border: '1px solid rgba(110,105,128,0.3)' }}
                onClick={() => { setTransferStep(3); setOtpCode(''); setTransferError(''); }}
              >
                Resend Code
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {transferStep === 5 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: '#22C55E', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                Transfer Complete!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                The team has been successfully transferred to <strong style={{ color: '#fff' }}>{newOwnerEmail}</strong>.
                They now have full control of the roster, draft picks, and SamPoints.
              </p>
              <button className='cm-save-btn' style={{ width: '100%' }} onClick={resetTransferWizard}>
                Done
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Save */}
      <div className='cm-save-bar'>
        <button className='cm-save-btn' disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save Team Control Settings'}
        </button>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Commissioners (Admin)
   ═══════════════════════════════════════════════════════════ */
const AdminsTab = ({ teams, user, userLeague, currentLeague }) => {
  const [goingToBeCommissioner, setGoingToBeCommissioner] = useState(
    currentLeague?.leagueCommissioners || [],
  )
  const [loading, setLoading] = useState(false)

  const updateLeagueCommissioners = async () => {
    setLoading(true)
    // Use the ACTUAL active league id. `userLeague` came from
    // state.user.SamPoints.league which is not always set, so the previous
    // call frequently sent a falsy leagueId — the backend's
    // findByIdAndUpdate silently no-op'd and the new commissioner never
    // landed in league.leagueCommissioners[], even though their
    // User.isCommissioner global flag flipped. Result: granted user could
    // not access /commissioner because the league-aware gate (createdBy /
    // coComissioner / leagueCommissioners) didn't include them.
    const leagueId = currentLeague?._id || userLeague
    if (!leagueId) {
      setLoading(false)
      try { (await import('antd')).notification.error({ message: 'No active league selected' }) } catch (_) {}
      return
    }
    try {
      // `goingToBeCommissioner` may be a mix of objects (existing populated
      // commissioners) and strings (newly-picked user ids) depending on the
      // Select control. Normalise to ObjectId strings before sending.
      const userIds = (goingToBeCommissioner || []).map((u) => String(u?._id || u))
      await updateCommissionersInLeague({
        leagueId,
        users: userIds,
      })
      // Refresh the league so currentLeague.leagueCommissioners reflects
      // the new state — otherwise the UI stays stale until a hard refresh.
      try { await getLeagueDetails() } catch (_) {}
      try { (await import('antd')).notification.success({ message: 'Commissioners updated' }) } catch (_) {}
    } catch (err) {
      try { (await import('antd')).notification.error({ message: 'Could not update commissioners', description: err?.response?.data?.message || err?.message || 'Server error' }) } catch (_) {}
    }
    setLoading(false)
  }

  return (
    <div className='cm-section'>
      <div className='cm-section-header'>
        <div className='cm-section-icon cm-section-icon-amber'>
          <UserSwitchOutlined />
        </div>
        <h3 className='cm-section-title'>Manage Commissioners</h3>
      </div>

      <div className='cm-field' style={{ marginBottom: 16 }}>
        <label className='cm-field-label'>Add / Remove Commissioners</label>
        <Select
          placeholder='Select users to make commissioner'
          mode='multiple'
          value={goingToBeCommissioner}
          allowClear
          onChange={(vals) => setGoingToBeCommissioner(vals)}
        >
          {teams?.map((item) =>
            item?.user ? (
              <Select.Option key={item.user._id} value={item.user._id}>
                {item.user.firstName && item.user.lastName ? `${item.user.firstName} ${item.user.lastName}` : item.user.userName} ({item.name})
              </Select.Option>
            ) : null,
          )}
        </Select>
        <span className='cm-field-hint'>Selected users will have full commissioner access</span>
      </div>

      <div className='cm-save-bar'>
        <button
          className='cm-save-btn'
          disabled={goingToBeCommissioner?.length === 0 || loading}
          onClick={updateLeagueCommissioners}
        >
          {loading ? 'Saving...' : 'Update Commissioners'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: Season, Renewal & Commissioner Transfer
   ═══════════════════════════════════════════════════════════ */
const SeasonTab = ({ teams, user, currentLeague }) => {
  const [renewal, setRenewal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [transferTarget, setTransferTarget] = useState(null)

  // Schedule Management (smaller leagues 10-24 teams)
  const leagueSize = currentLeague?.numberOfTeams || 32
  const isSmallLeague = leagueSize >= 10 && leagueSize <= 24
  const [scheduleMethod, setScheduleMethod] = useState(currentLeague?.scheduleMethod || 'ai_random')
  const [regularSeasonWeeks, setRegularSeasonWeeks] = useState(currentLeague?.regularSeasonWeeks || (isSmallLeague ? 14 : 18))
  const [matchupsPerWeek, setMatchupsPerWeek] = useState(Math.floor(leagueSize / 2))

  // Sync season state when currentLeague loads async
  useEffect(() => {
    if (!currentLeague) return
    setScheduleMethod(currentLeague.scheduleMethod || 'ai_random')
    const size = currentLeague.numberOfTeams || 32
    const small = size >= 10 && size <= 24
    setRegularSeasonWeeks(currentLeague.regularSeasonWeeks || (small ? 14 : 18))
    setMatchupsPerWeek(Math.floor(size / 2))
  }, [currentLeague?._id])
  const [scheduleGenerating, setScheduleGenerating] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    const data = await getRenewalStatus()
    setRenewal(data)
    setLoading(false)
  }

  const handleRenew = async () => {
    setActionLoading(true)
    const result = await respondToRenewal('accept')
    if (result) await fetchStatus()
    setActionLoading(false)
  }

  const handleDecline = async () => {
    Modal.confirm({
      title: 'Decline Season Renewal',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure? The league will be permanently deleted 60 days after cancellation.',
      okText: 'Yes, Decline',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setActionLoading(true)
        const result = await respondToRenewal('decline')
        if (result) await fetchStatus()
        setActionLoading(false)
      },
    })
  }

  const handleRevoke = async () => {
    setActionLoading(true)
    const result = await revokeCancellation()
    if (result) await fetchStatus()
    setActionLoading(false)
  }

  const handleTransfer = async () => {
    if (!transferTarget) return
    setActionLoading(true)
    const result = await transferCommissioner(transferTarget)
    if (result) {
      setShowTransferModal(false)
      setTransferTarget(null)
      notification.success({ message: 'Commissioner rights transferred successfully', duration: 3 })
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size='large' />
      </div>
    )
  }

  const status = renewal?.renewalStatus || currentLeague?.renewalStatus || 'active'

  const handleGenerateSchedule = async () => {
    setScheduleGenerating(true)
    try {
      // First save schedule settings to league
      await updateLeagueCommissioner({
        _id: currentLeague?._id,
        scheduleMethod,
        regularSeasonWeeks,
      })
      // Then generate the schedule
      attachToken()
      const res = await privateAPI.post('/schedule/generate-league-schedule', {
        leagueId: currentLeague?._id,
        season: currentLeague?.season,
      })
      const data = res?.data?.data
      notification.success({
        message: data?.message || 'Schedule generated successfully',
        duration: 4,
      })
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Failed to generate schedule',
        duration: 3,
      })
    }
    setScheduleGenerating(false)
  }

  return (
    <>
      {/* Schedule Management, Smaller Leagues (10-24 Teams) */}
      {isSmallLeague && (
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-green'>
              <CalendarOutlined />
            </div>
            <h3 className='cm-section-title'>Schedule Management</h3>
            <span className='cm-section-desc'>{leagueSize}-team league, all standard rules apply, no playoffs</span>
          </div>

          {/* No Playoffs Notice */}
          <div style={{
            background: 'rgba(255, 170, 0, 0.08)',
            border: '1px solid rgba(255, 170, 0, 0.25)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <ExclamationCircleOutlined style={{ color: '#ffaa00', fontSize: 16, marginTop: 2 }} />
            <div>
              <div style={{ color: '#ffaa00', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Playoffs Not Available</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.5 }}>
                Leagues with 10-24 teams follow regular season play only. All other rules, salary cap ($301.2M),
                SamPoints economy, auction system, trade rules, AI Commissioner enforcement, and tanking detection, apply the same as a 32-team league.
              </div>
            </div>
          </div>

          {/* Schedule Method */}
          <div className='cm-form-grid' style={{ marginBottom: 20 }}>
            <div className='cm-field'>
              <label className='cm-field-label'>Schedule Generation</label>
              <Select
                value={scheduleMethod}
                onChange={(val) => setScheduleMethod(val)}
                style={{ width: '100%' }}
              >
                <Select.Option value='ai_random'>AI Commissioner, Random Balanced Schedule</Select.Option>
                <Select.Option value='commissioner_manual'>Commissioner, Manual Setup</Select.Option>
              </Select>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 6, display: 'block' }}>
                {scheduleMethod === 'ai_random'
                  ? 'AI generates a balanced schedule ensuring every team plays each opponent at least once with fair home/away distribution.'
                  : 'You set each week&apos;s matchups manually. Useful for custom rivalry weeks or themed scheduling.'}
              </span>
            </div>
          </div>

          {/* Season Length */}
          <div className='cm-form-grid' style={{ marginBottom: 20 }}>
            <div className='cm-field'>
              <label className='cm-field-label'>Regular Season Length (Weeks)</label>
              <InputNumber
                min={leagueSize - 1}
                max={18}
                value={regularSeasonWeeks}
                onChange={(val) => setRegularSeasonWeeks(val)}
                style={{ width: 120 }}
              />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 6, display: 'block' }}>
                Minimum {leagueSize - 1} weeks so every team faces each opponent at least once. Maximum 18 weeks (NFL regular season).
              </span>
            </div>
            <div className='cm-field'>
              <label className='cm-field-label'>Matchups Per Week</label>
              <InputNumber
                value={matchupsPerWeek}
                disabled
                style={{ width: 120 }}
              />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 6, display: 'block' }}>
                {matchupsPerWeek} matchups per week ({leagueSize} teams / 2).
                {leagueSize % 2 !== 0 && ' One team gets a bye each week (odd league size).'}
              </span>
            </div>
          </div>

          {/* Generate / Manage Buttons */}
          <div className='cm-save-bar'>
            <button
              className='cm-save-btn'
              disabled={scheduleGenerating}
              onClick={handleGenerateSchedule}
            >
              {scheduleGenerating
                ? 'Generating...'
                : scheduleMethod === 'ai_random'
                  ? 'Generate Schedule with AI'
                  : 'Open Manual Schedule Builder'}
            </button>
          </div>
        </div>
      )}

      {/* Schedule Management, NFL Format (32 Teams) */}
      {leagueSize === 32 && (
        <div className='cm-section'>
          <div className='cm-section-header'>
            <div className='cm-section-icon cm-section-icon-green'>
              <CalendarOutlined />
            </div>
            <h3 className='cm-section-title'>A.Football Schedule Generator</h3>
            <span className='cm-section-desc'>32-team league, full A.Football format (17 games, 18 weeks, 1 bye)</span>
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.06)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            lineHeight: 1.6,
          }}>
            <div style={{ color: '#22C55E', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>How It Works</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              Generates a full A.Football-format schedule: 6 divisional games, 4 intra-conference, 4 inter-conference, 2 same-finish, and 1 cross-conference, totaling 17 games per team spread across 18 weeks with bye weeks during weeks 5-14. Each season uses a unique seed so schedules vary year to year.
            </div>
          </div>

          <div className='cm-save-bar'>
            <button
              className='cm-save-btn'
              disabled={scheduleGenerating}
              onClick={async () => {
                setScheduleGenerating(true)
                try {
                  attachToken()
                  const res = await privateAPI.post('/schedule/generate-nfl-format-schedule', {
                    leagueId: currentLeague?._id,
                    season: currentLeague?.season,
                  })
                  const data = res?.data?.data
                  notification.success({
                    message: data?.message || 'A.Football schedule generated successfully!',
                    description: data?.byeWeeks ? `${Object.keys(data.byeWeeks).length} teams scheduled with bye weeks` : '',
                    duration: 5,
                  })
                } catch (err) {
                  notification.error({
                    message: err?.response?.data?.message || 'Failed to generate A.Football schedule',
                    description: 'Ensure the league has exactly 32 teams across 2 conferences and 8 divisions.',
                    duration: 5,
                  })
                }
                setScheduleGenerating(false)
              }}
            >
              {scheduleGenerating ? 'Generating A.Football Schedule...' : 'Generate A.Football-Format Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* Draft Status Section */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon' style={{ background: currentLeague?.isDraftLive ? '#22C55E' : 'rgba(110,105,128,0.3)' }}>
            <OrderedListOutlined />
          </div>
          <h3 className='cm-section-title'>Draft Status</h3>
          <span className='cm-section-desc'>
            {currentLeague?.isDraftLive ? 'Draft is currently marked as LIVE' : 'No draft in progress'}
          </span>
        </div>

        <div style={{
          background: currentLeague?.isDraftLive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
          border: `1px solid ${currentLeague?.isDraftLive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`,
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: currentLeague?.isDraftLive ? '#EF4444' : '#22C55E', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {currentLeague?.isDraftLive ? '⚠ Draft Live Flag is ON' : '✓ Draft is not active'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              {currentLeague?.isDraftLive
                ? 'If no draft is running, this flag is stuck. Reset it to restore the full sidebar navigation.'
                : 'All navigation tabs are visible. Draft can be started from the Draft page.'}
            </div>
          </div>
          {currentLeague?.isDraftLive && (
            <Button
              type="primary"
              danger
              onClick={async () => {
                await updateLeagueCommissioner({ _id: currentLeague?._id, isDraftLive: false })
                notification.success({ message: 'Draft flag reset. Refresh the page to see all tabs.', duration: 4 })
                await getLeagueDetails()
              }}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Reset Draft Flag
            </Button>
          )}
        </div>

        <div className='cm-toggle-row'>
          <div className='cm-toggle-info'>
            <span className='cm-toggle-title'>Draft Completed</span>
            <span className='cm-toggle-desc'>
              {currentLeague?.draftCompleted ? 'Yes, draft has finished for this season' : 'No, draft has not been completed yet'}
            </span>
          </div>
          <span style={{ color: currentLeague?.draftCompleted ? '#22C55E' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 13 }}>
            {currentLeague?.draftCompleted ? 'COMPLETED' : 'PENDING'}
          </span>
        </div>
      </div>

      {/* Season Renewal Section */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-blue'>
            <CalendarOutlined />
          </div>
          <h3 className='cm-section-title'>Season Renewal</h3>
          <span className='cm-section-desc'>Season {renewal?.season || currentLeague?.season || '—'}</span>
        </div>

        {/* Status Banner */}
        <div className={`cm-renewal-status cm-renewal-${status}`}>
          <div className='cm-renewal-status-dot' />
          <div className='cm-renewal-status-info'>
            <span className='cm-renewal-status-label'>
              {status === 'active' && 'Active Season'}
              {status === 'pending_renewal' && 'Renewal Required'}
              {status === 'renewed' && 'Season Renewed'}
              {status === 'cancelled' && 'League Cancelled'}
              {status === 'expired' && 'League Expired (No Response)'}
            </span>
            <span className='cm-renewal-status-desc'>
              {status === 'active' && 'Your league is currently active. Renewal will be prompted after playoffs end.'}
              {status === 'pending_renewal' && (
                <>
                  The AI Commissioner is asking if you want to renew for the next season.
                  {renewal?.daysToAutoExpire != null && (
                    <strong> {renewal.daysToAutoExpire} days remaining to respond.</strong>
                  )}
                </>
              )}
              {status === 'renewed' && 'The new season has been created. Set up your draft to begin!'}
              {status === 'cancelled' && (
                <>
                  League is scheduled for deletion.
                  {renewal?.daysToDeletion != null && (
                    <strong> {renewal.daysToDeletion} days until permanent deletion.</strong>
                  )}
                </>
              )}
              {status === 'expired' && (
                <>
                  No response was received within 90 days. League will be deleted.
                  {renewal?.daysToDeletion != null && (
                    <strong> {renewal.daysToDeletion} days remaining.</strong>
                  )}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {status === 'pending_renewal' && (
          <div className='cm-renewal-actions'>
            <button className='cm-save-btn' disabled={actionLoading} onClick={handleRenew}>
              {actionLoading ? 'Processing...' : 'Accept, Start New Season'}
            </button>
            <button className='cm-reject-btn' disabled={actionLoading} onClick={handleDecline}>
              Decline, Cancel League
            </button>
          </div>
        )}

        {(status === 'cancelled' || status === 'expired') && (
          <div className='cm-renewal-actions'>
            <button className='cm-save-btn' disabled={actionLoading} onClick={handleRevoke}>
              {actionLoading ? 'Processing...' : 'Revoke Cancellation'}
            </button>
          </div>
        )}

        {/* Season History */}
        {renewal?.seasonHistory?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Season History
            </h4>
            <div className='cm-season-history'>
              {renewal.seasonHistory.map((s, i) => (
                <div key={i} className='cm-season-history-row'>
                  <span className='cm-season-num'>Season {s.season}</span>
                  <span className='cm-season-dates'>
                    {s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'} →{' '}
                    {s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'}
                  </span>
                  {s.champion && <span className='cm-season-champ'>Champion</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Commissioner Transfer Section */}
      <div className='cm-section'>
        <div className='cm-section-header'>
          <div className='cm-section-icon cm-section-icon-amber'>
            <UserSwitchOutlined />
          </div>
          <h3 className='cm-section-title'>Transfer Commissioner Rights</h3>
          <span className='cm-section-desc'>Hand off league ownership to another member</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Transferring commissioner rights will make the selected user the new league owner.
          You will be demoted to co-commissioner. This action cannot be undone.
        </p>

        <div className='cm-field' style={{ maxWidth: 400 }}>
          <label className='cm-field-label'>Transfer to</label>
          <Select
            placeholder='Select a league member'
            value={transferTarget || undefined}
            onChange={(val) => setTransferTarget(val)}
            style={{ width: '100%' }}
          >
            {teams?.filter((t) => t?.user && t?.user?._id !== user?._id).map((team) => (
              <Select.Option key={team.user._id} value={team.user._id}>
                {team.user.firstName && team.user.lastName ? `${team.user.firstName} ${team.user.lastName}` : team.user.userName} ({team.name})
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className='cm-save-bar'>
          <button
            className='cm-reject-btn'
            disabled={!transferTarget || actionLoading}
            onClick={() => setShowTransferModal(true)}
            style={{ marginTop: 12 }}
          >
            {actionLoading ? 'Transferring...' : 'Transfer Commissioner'}
          </button>
        </div>

        <Modal
          title='Confirm Commissioner Transfer'
          open={showTransferModal}
          onOk={handleTransfer}
          onCancel={() => setShowTransferModal(false)}
          okText='Transfer'
          okType='danger'
          confirmLoading={actionLoading}
        >
          <p>Are you sure you want to transfer your commissioner rights? You will be demoted to co-commissioner and cannot undo this action.</p>
        </Modal>
      </div>

      {/* ═══ DANGER ZONE: Delete League ═══
          Top-level section inside SeasonTab so it stands on its own (the
          version nested in the Transfer Commissioner card was visually
          hidden under the transfer button). */}
      <DangerZoneNFL currentLeague={currentLeague} />
    </>
  )
}

/* ───────── Danger Zone: Vote-based League Deletion (NFL) ─────────
   The old single-click delete is superseded by a 67%/7-day owner vote.
   This thin wrapper picks up the league + user context and renders the
   shared vote card. Solo commissioner → auto-passes immediately. */
import LeagueDeletionVoteCardNFL from '../../components/LeagueDeletionVoteCard'

const DangerZoneNFL = ({ currentLeague }) => {
  const user = useSelector((s) => s.user?.user || s.user?.userDetails)
  const requesterId = String(user?._id || user?.id || '')
  const ownerId = String(currentLeague?.createdBy?._id || currentLeague?.createdBy || '')
  const isHeadCommissioner = !!requesterId && !!ownerId && requesterId === ownerId
  // Any user with a team in the league is an owner who can vote.
  const myTeamInLeague = (currentLeague?.teams || []).some(
    (t) => String(t?.owner?._id || t?.owner || t?.user?._id || t?.user) === requesterId
  )
  return (
    <LeagueDeletionVoteCardNFL
      currentLeague={currentLeague}
      user={user}
      isHeadCommissioner={isHeadCommissioner}
      isTeamOwner={myTeamInLeague || isHeadCommissioner}
    />
  )
}

// Old direct-delete component kept for reference; no longer rendered.
const _LegacyDangerZoneNFL = ({ currentLeague }) => {
  const navigate = useNavigate()
  // Look up the current user across the same shapes the rest of the page uses
  // (the redux store has been seen as both s.user.user and s.user.userDetails
  // depending on which slice last hydrated).
  const user = useSelector((s) => s.user?.user || s.user?.userDetails)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const targetName = currentLeague?.name || currentLeague?.leagueName || ''
  const canDelete = typed.trim().length > 0 && typed.trim() === targetName.trim()

  // UI gate (defense in depth — the backend already enforces "only createdBy
  // can delete" and 403s everyone else). We surface the panel to:
  //   - the head commissioner (league.createdBy), AND
  //   - any user listed in league.leagueCommissioners[]
  // so co-commissioners can SEE the option and read the explanation, but the
  // backend still refuses if they try to actually delete. If the league object
  // is missing those fields entirely (older sessions, partial hydration), we
  // fall back to the page-level isCommissioner check — if you're allowed on
  // /commissioner at all, you're allowed to read the Danger Zone copy.
  const requesterId = String(user?._id || user?.id || '')
  const ownerId = String(
    currentLeague?.createdBy?._id || currentLeague?.createdBy || ''
  )
  const coIds = (currentLeague?.leagueCommissioners || []).map(
    (c) => String(c?._id || c)
  )
  const isHeadCommissioner = !!requesterId && !!ownerId && requesterId === ownerId
  const isAnyCommissioner = isHeadCommissioner || coIds.includes(requesterId)
  // Final gate: if we can confidently identify the head commissioner, restrict
  // to commissioners; otherwise (no createdBy on the object) fall through so
  // the panel still surfaces — the API will still 403 anyone unauthorized.
  if (ownerId && !isAnyCommissioner) return null

  const onDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    try {
      await deleteLeagueCommissioner({ _id: currentLeague?._id })
      notification.success({
        message: 'League deleted',
        description: `${targetName} has been permanently removed.`,
      })
      setOpen(false)
      navigate('/hub')
    } catch (err) {
      notification.error({
        message: 'Could not delete league',
        description: err?.response?.data?.message || err?.message || 'The league could not be deleted. Make sure you are the only commissioner and no other teams remain.',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{
      ...GLASS_STYLE,
      padding: '24px',
      marginTop: '32px',
      borderColor: 'rgba(239,68,68,0.35)',
      background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(127,29,29,0.03))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <WarningOutlined style={{ color: '#EF4444', fontSize: 18 }} />
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          color: '#EF4444',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>Danger Zone</h3>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 16px' }}>
        Deleting the league removes every team, draft, trade, fixture and history record for {targetName || 'this league'}.
        This cannot be undone. Only the commissioner can perform this action, and only when no other teams remain.
      </p>
      <Button
        danger
        size='large'
        icon={<ExclamationCircleOutlined />}
        onClick={() => { setTyped(''); setOpen(true) }}
        style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
      >
        Delete League
      </Button>

      <Modal
        open={open}
        title={null}
        footer={null}
        closable={false}
        centered
        onCancel={() => !deleting && setOpen(false)}
        styles={{ content: { background: '#111827', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', padding: '28px' } }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <ExclamationCircleOutlined style={{ color: '#EF4444', fontSize: 22 }} />
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
              Permanently delete league
            </h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>
            This action is irreversible. Every team, draft, trade, fixture and trophy from{' '}
            <span style={{ color: '#22C55E', fontWeight: 700 }}>{targetName}</span>{' '}
            will be deleted.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px' }}>
            Type the league name to confirm:
          </p>
          <input
            type='text'
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={targetName}
            disabled={deleting}
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${canDelete ? '#22C55E' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: 8,
              padding: '10px 14px',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              marginBottom: 18,
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              onClick={() => setOpen(false)}
              disabled={deleting}
              style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(110,105,128,0.3)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              disabled={!canDelete || deleting}
              loading={deleting}
              style={{
                flex: 1.4, height: 40, borderRadius: 8, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                background: canDelete ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'rgba(239,68,68,0.25)',
                color: '#fff', border: 'none',
                cursor: canDelete && !deleting ? 'pointer' : 'not-allowed',
                opacity: canDelete ? 1 : 0.55,
              }}
            >
              {deleting ? 'Deleting…' : 'Delete league'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Comissioner
