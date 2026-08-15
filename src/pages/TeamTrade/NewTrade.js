import React, { useEffect, useRef, useState } from 'react'
import { Button, Select, notification, InputNumber, Modal, Tooltip, Switch, DatePicker } from 'antd'
import dayjs from 'dayjs'
import {
  SwapOutlined,
  CloseOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  TeamOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ReadOutlined,
  LockOutlined,
  BulbOutlined,
  SafetyOutlined,
  EyeOutlined,
  FireOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  StarFilled,
  StarOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  CalculatorOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import AddPlayerToTrade from '../../components/modal/PlayerInterfaceModals/AddPlayerToTrade'
import AddPickToTrade from '../../components/modal/PlayerInterfaceModals/AddPickToTrade'
import TradeRulesBook from './TradeRulesBook'

import {
  createTeamTrade,
  getOtherTeamTrade,
  analyzeTrade,
  initializeDraftPicks,
  getLeagueTradeFeed,
  getPendingTrade,
  getLeagueTradeBlock,
  toggleTradeBlock,
  getTradeSettings,
  updateTradeSettings,
  setTradeDeadline,
  computeTradeWindow,
  DEFAULT_TRADE_DEADLINE_WEEK,
} from '../../redux/actions/teamTradeAction'
import { getAllTeam } from '../../redux/actions/teamActions'
import { getRoster } from '../../redux/actions/rosterAction'
import { getLeagueDetails } from '../../redux'
import { positions, matchesPositionFilter } from '../../config/constants'

/* ── Real-field helpers (read defensively; never fabricate) ── */
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
const ovrOf = (pl) => num(pl?.OVR ?? pl?.overall ?? pl?.ovr ?? pl?.rating)
const valOf = (pl) => num(pl?.marketValue ?? pl?.value ?? pl?.ktcValue ?? pl?.tradeValue)
const salOf = (pl) => Number(pl?.currentYearSalaryCap ?? pl?.salary ?? pl?.contractSalary ?? 0)
const ppgOf = (pl) => num(pl?.pointsPerGame ?? pl?.avgPf ?? pl?.ppg ?? pl?.PPG)
const teamOf = (pl) => pl?.Team || pl?.team?.name || pl?.teamAbbr || null
const mapPos = (pos) => positions[pos] || pos || '—'

/* Ordinal for draft-pick rounds (1 → "1st", 2 → "2nd" …) — real round number only */
const ordinal = (n) => {
  if (n == null) return null
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

/* Relative "time ago" for the league trade feed (real createdAt timestamps) */
const timeAgo = (d) => {
  const t = new Date(d).getTime()
  if (Number.isNaN(t)) return ''
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  const w = Math.floor(days / 7)
  if (w < 5) return `${w}w ago`
  const mo = Math.floor(days / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

/* SP salary → compact display (real cap value; unit is SAM-Points "SP") */
const fmtSP = (n) => {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return `${Math.round(v)}`
}

/* VALUE tier from the REAL dynasty value (analyze per-asset value, else a value field).
   Scale reference: elite dynasty assets ~200+, mid ~50-120, low <50. */
const tierOf = (v) => {
  if (v == null) return null
  if (v >= 200) return { t: 'Elite', cls: 'elite' }
  if (v >= 120) return { t: 'High', cls: 'high' }
  if (v >= 50) return { t: 'Medium', cls: 'med' }
  return { t: 'Low', cls: 'low' }
}

/* letter grade from fairnessScore (0-100) */
const gradeFromScore = (s) => {
  if (s == null) return 'F'
  if (s >= 90) return 'A'
  if (s >= 85) return 'A-'
  if (s >= 80) return 'B+'
  if (s >= 75) return 'B'
  if (s >= 70) return 'B-'
  if (s >= 60) return 'C'
  if (s >= 50) return 'D'
  return 'F'
}

const DEF_LABELS = new Set(['EDGE', 'IDL', 'DE', 'DT', 'DL', 'LB', 'CB', 'S', 'DB', 'FS', 'SS', 'DEF'])
/* Roster-breakdown groups — 10 buckets, CB+S combined into DB (matched via
   POSITION_GROUPS.DB), K and P split out. Order = display order (5 per row). */
const ROSTER_GROUPS = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P']

const statusOf = (pl) => {
  if (pl?.isPlayerProtected) return { t: 'LOCKED', c: '#06b6d4' }
  if (pl?.inPracticeSquad) return { t: 'PRACTICE', c: '#f6c453' }
  if (pl?.isActive === false) return { t: 'INACTIVE', c: '#8a93a6' }
  return { t: 'ACTIVE', c: '#24d26c' }
}

/* group counts — each player assigned to first matching group only */
const countByGroup = (players) => {
  const m = {}
  ROSTER_GROUPS.forEach((g) => (m[g] = 0))
  players.forEach((pl) => {
    const pos = pl?.Position
    const g = ROSTER_GROUPS.find((gr) => matchesPositionFilter(pos, gr))
    if (g) m[g] += 1
  })
  return m
}

const isPickTraded = (v) =>
  v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)

/* ── Team Needs: per-position depth targets (real-roster derived) ── */
// Full SAM Metric position set (matches the draft-pool taxonomy). `key` is the
// POSITION_GROUPS bucket used to count real players; `disp` is the label shown.
// D-line is split EDGE (POSITION_GROUPS.DE) / IDL (DT); secondary is split CB / S.
const NEEDS_TARGETS = [
  { key: 'QB', disp: 'QB', target: 2 },
  { key: 'RB', disp: 'RB', target: 5 },
  { key: 'WR', disp: 'WR', target: 5 },
  { key: 'TE', disp: 'TE', target: 2 },
  { key: 'OL', disp: 'OL', target: 8 },
  { key: 'DE', disp: 'EDGE', target: 3 },
  { key: 'DT', disp: 'IDL', target: 3 },
  { key: 'LB', disp: 'LB', target: 4 },
  { key: 'CB', disp: 'CB', target: 4 },
  { key: 'S', disp: 'S', target: 3 },
  { key: 'K', disp: 'K', target: 1 },
  { key: 'P', disp: 'P', target: 1 },
]
const needStrength = (count, target) => {
  if (count >= target) return { label: 'Good', cls: 'good' }
  if (count >= target - 1) return { label: 'Average', cls: 'avg' }
  return { label: 'Weak', cls: 'weak' }
}

/* ── Trade offer expiration options (League default = no explicit expiry) ── */
const EXPIRY_OPTIONS = [
  { value: 'default', label: 'League default' },
  { value: '1h', label: '1 hour', hours: 1 },
  { value: '6h', label: '6 hours', hours: 6 },
  { value: '24h', label: '24 hours', hours: 24 },
  { value: '3d', label: '3 days', hours: 72 },
]
const computeExpiresAt = (value) => {
  const opt = EXPIRY_OPTIONS.find((o) => o.value === value)
  if (!opt || !opt.hours) return null
  return new Date(Date.now() + opt.hours * 3600 * 1000).toISOString()
}

const DRAFT_KEY = 'tt_new_trade_draft_v1'

const NewTrade = ({ onGoPending }) => {
  const SETTING = useSelector((state) => state?.user)
  const { currentLeague } = useSelector((state) => state?.league)
  const myleagueSalaryCap = useSelector((state) => state.user?.leagueSalaryCap?.leagueSalaryCap)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [tradeCounts, setTradeCounts] = useState({ completed: 0, pending: 0 })
  const [loading2, setLoading2] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [myTeam, setMyTeam] = useState(null)
  const [otherTeam, setOtherTeam] = useState(null)

  const [myTeamSelected, setMyTeamSelected] = useState([])
  const [otherTeamSelected, setOtherTeamSelected] = useState([])
  const [selectTeam, setSelectTeam] = useState(null)

  const [myTeamDraft, setMyTeamDraft] = useState([])
  const [otherTeamDraft, setOtherTeamDraft] = useState([])
  const [myTeamSelectedDraft, setMyTeamSelectedDraft] = useState([])
  const [otherTeamSelectedDraft, setOtherTeamSelectedDraft] = useState([])

  // SAM Points
  const [myTeamSamPoints, setMyTeamSamPoints] = useState(0)
  const [otherTeamSamPoints, setOtherTeamSamPoints] = useState(0)

  // AI Analysis
  const [aiResult, setAiResult] = useState(null)

  // UI-only enrichment state (client-safe, does not touch trade logic)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [gmNote, setGmNote] = useState('')
  const [mobileSide, setMobileSide] = useState('give')
  const [favorites, setFavorites] = useState(() => new Set()) // client-only asset stars
  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(String(id)) ? next.delete(String(id)) : next.add(String(id))
      return next
    })

  // ── Trade note + expiration (sent with the offer) ──
  const [tradeMessage, setTradeMessage] = useState('')
  const [tradeExpiry, setTradeExpiry] = useState('default')

  // ── League Trade Feed ──
  const [leagueFeed, setLeagueFeed] = useState([])
  const [feedModalOpen, setFeedModalOpen] = useState(false)

  // ── Trade Block ──
  const [blockPlayers, setBlockPlayers] = useState([])
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockBusyId, setBlockBusyId] = useState(null)

  // ── Trade Rules Book ──
  const [rulesBookOpen, setRulesBookOpen] = useState(false)

  // ── Trade Settings ──
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [tradePrefs, setTradePrefs] = useState({
    tradeNotifications: true,
    autoRejectExpired: false,
    available: true,
  })
  const [prefsSaving, setPrefsSaving] = useState(false)

  // ── Trade Deadline (commissioner control) ──
  const [deadlineDraft, setDeadlineDraft] = useState(null) // dayjs | null
  const [deadlineSaving, setDeadlineSaving] = useState(false)

  const draftRef = useRef(null)

  // ── Trade window (deadline) — mirrors server guard: explicit date, else Week 8 ──
  const currentWeek = SETTING?.setting?.week
  const tradeWindow = computeTradeWindow(currentLeague, currentWeek)
  const tradeWindowOpen = tradeWindow.open

  // Set of player _ids currently on the league trade block (for badges)
  const blockedIds = new Set((blockPlayers || []).map((p) => String(p.playerId)))

  const isCommissioner =
    (SETTING?.isCommissioner ?? false) ||
    String(currentLeague?.createdBy?._id || currentLeague?.createdBy || '') ===
      String(SETTING?.userDetails?._id || '')

  // ── Init (unchanged data flow) ──
  useEffect(() => {
    // Read any persisted draft once, so it can be restored after data loads
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      draftRef.current = raw ? JSON.parse(raw) : null
    } catch {
      draftRef.current = null
    }
    if (draftRef.current?.selectTeam) {
      setSelectTeam(draftRef.current.selectTeam)
      setMyTeamSamPoints(draftRef.current.myTeamSamPoints || 0)
      setOtherTeamSamPoints(draftRef.current.otherTeamSamPoints || 0)
      setGmNote(draftRef.current.gmNote || '')
    }
    const init = async () => {
      // Load everything the page needs in parallel. The old code awaited the
      // draft-pick init POST FIRST, so the roster, team list and league details
      // all sat behind one slow request — that's what made the page crawl.
      // Now they fire immediately; draft-pick init runs alongside and, once it
      // finishes, we silently refresh the roster so any freshly created picks
      // appear without a spinner flash.
      getTeams()
      getMyTeam()
      getLeagueDetails()
      try {
        await initializeDraftPicks()
        getMyTeam({ silent: true })
      } catch (e) {
        // Pick init is best-effort; the roster already loaded above.
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTeams = async () => {
    if (currentLeague?._id) {
      try {
        const res = await getAllTeam({ currentLeague: currentLeague?._id })
        setTeams(res)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }
  }

  useEffect(() => {
    getTeams()
    loadLeagueFeed()
    loadTradeBlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLeague])

  useEffect(() => {
    selectTeam && getOtherTeamData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectTeam])

  const loadLeagueFeed = async () => {
    if (!currentLeague?._id) return
    const res = await getLeagueTradeFeed(currentLeague._id)
    if (res) setLeagueFeed(res.feed || [])
  }

  const loadTradeBlock = async () => {
    if (!currentLeague?._id) return
    const res = await getLeagueTradeBlock(currentLeague._id)
    if (res) setBlockPlayers(res.players || [])
  }

  const openSettings = async () => {
    setSettingsModalOpen(true)
    setDeadlineDraft(currentLeague?.tradeDeadline ? dayjs(currentLeague.tradeDeadline) : null)
    const res = await getTradeSettings()
    if (res?.tradePreferences) setTradePrefs(res.tradePreferences)
  }

  const saveTradeDeadline = async () => {
    setDeadlineSaving(true)
    const iso = deadlineDraft ? deadlineDraft.toISOString() : null
    const res = await setTradeDeadline({ leagueId: currentLeague?._id, tradeDeadline: iso })
    if (res) {
      notification.success({ message: res.message || 'Trade deadline updated', duration: 3 })
      await getLeagueDetails() // refresh currentLeague so the new deadline gates the UI
    }
    setDeadlineSaving(false)
  }

  const savePref = async (patch) => {
    const next = { ...tradePrefs, ...patch }
    setTradePrefs(next)
    setPrefsSaving(true)
    const res = await updateTradeSettings(patch)
    if (res?.tradePreferences) setTradePrefs(res.tradePreferences)
    setPrefsSaving(false)
  }

  const handleToggleBlock = async (playerId, onBlock) => {
    setBlockBusyId(String(playerId))
    const res = await toggleTradeBlock({ playerId, onBlock })
    if (res) {
      notification.success({ message: res.message, duration: 2 })
      await loadTradeBlock()
    }
    setBlockBusyId(null)
  }

  const getMyTeam = async (opts = {}) => {
    // `silent` refreshes the roster in the background without flashing the main
    // spinner — used after draft-pick init so newly created picks appear.
    if (!opts.silent) { !loading && setLoading(true) }
    const res = await getRoster(SETTING?.setting?.week)
    if (res) {
      setMyTeam(res)
      // restore my side from a saved draft if present
      const d = draftRef.current
      if (d?.myPlayerIds?.length) {
        setMyTeamSelected((res?.active || []).filter((e) => d.myPlayerIds.includes(e?.players?._id)))
      }
      const allDrafts = res?.drafts || []
      if (d?.myPickIds?.length) {
        setMyTeamSelectedDraft(allDrafts.filter((v) => d.myPickIds.includes(v?._id)))
        setMyTeamDraft(allDrafts.filter((v) => !d.myPickIds.includes(v?._id)))
      } else {
        setMyTeamDraft(allDrafts)
      }
    }
    if (!opts.silent) setLoading(false)
  }

  const getOtherTeamData = async () => {
    setLoading2(true)
    const res = await getOtherTeamTrade({ id: selectTeam })
    setOtherTeam({ ...res, active: res?.active || [] })
    const allDrafts = res?.drafts || []
    const d = draftRef.current
    if (d?.otherPlayerIds?.length) {
      setOtherTeamSelected(
        (res?.active || [])
          .filter((p) => d.otherPlayerIds.includes(p?._id))
          .map((p) => ({ players: p })),
      )
    }
    if (d?.otherPickIds?.length) {
      setOtherTeamSelectedDraft(allDrafts.filter((v) => d.otherPickIds.includes(v?._id)))
      setOtherTeamDraft(allDrafts.filter((v) => !d.otherPickIds.includes(v?._id)))
    } else {
      setOtherTeamDraft(allDrafts)
    }
    // draft consumed
    draftRef.current = null
    setLoading2(false)
  }

  const clearDraftStorage = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
  }

  const clear = () => {
    setMyTeamSelected([])
    setMyTeamSelectedDraft([])
    setOtherTeamSelected([])
    setOtherTeamSelectedDraft([])
    setOtherTeam(null)
    setOtherTeamDraft([])
    setSelectTeam(null)
    setMyTeamSamPoints(0)
    setOtherTeamSamPoints(0)
    setAiResult(null)
    setGmNote('')
    setTradeMessage('')
    setTradeExpiry('default')
    clearDraftStorage()
  }

  // ── AI Analysis (unchanged) ──
  const handleAnalyzeTrade = async () => {
    const hasItems =
      (myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0) &&
      (otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0)

    if (!hasItems) {
      notification.warning({ message: 'Add players, picks, or SAM Points to both sides first', duration: 3 })
      return
    }

    setAnalyzeLoading(true)
    const result = await analyzeTrade({
      buyerPlayers: myTeamSelected.map((v) => v?.players?._id),
      sellerPlayers: otherTeamSelected.map((v) => v?.players?._id),
      buyerDrafts: myTeamSelectedDraft.map((v) => v._id),
      sellerDrafts: otherTeamSelectedDraft.map((v) => v._id),
      buyerSamPoints: myTeamSamPoints,
      sellerSamPoints: otherTeamSamPoints,
    })
    if (result) {
      setAiResult(result)
    }
    setAnalyzeLoading(false)
  }

  // ── Submit Trade (unchanged) ──
  const createTrade = async () => {
    const isMyTeam = myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0
    const isOtherTeam = otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0

    if (isMyTeam && isOtherTeam) {
      setBtnLoading(true)
      const res = await createTeamTrade({
        buyerPlayers: myTeamSelected.map((v) => v?.players?._id),
        buyerDrafts: myTeamSelectedDraft.map((v) => v._id),
        sellerPlayers: otherTeamSelected.map((v) => v?.players?._id),
        sellerDrafts: otherTeamSelectedDraft.map((v) => v._id),
        sellerTeam: otherTeam?.team?._id,
        buyerSamPoints: myTeamSamPoints,
        sellerSamPoints: otherTeamSamPoints,
        message: tradeMessage?.trim() || undefined,
        expiresAt: computeExpiresAt(tradeExpiry) || undefined,
        aiAnalysis: aiResult
          ? {
              fairnessScore: aiResult.fairnessScore,
              verdict: aiResult.verdict,
              summary: aiResult.summary,
              buyerValue: aiResult.buyerValue,
              sellerValue: aiResult.sellerValue,
              flaggedForReview: aiResult.flaggedForReview,
              analyzedAt: aiResult.analyzedAt,
            }
          : undefined,
      })
      setConfirmOpen(false)
      clear()
      notification.success({ message: res, duration: 3 })
      setBtnLoading(false)
    } else {
      notification.error({ message: 'Please add assets to both sides of the trade', duration: 3 })
    }
  }

  // Draft pick handlers (unchanged)
  const handleMyDraftSelect = (obj) => {
    setMyTeamDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setMyTeamSelectedDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleMyDraftRemove = (obj) => {
    setMyTeamSelectedDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setMyTeamDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleOtherDraftSelect = (obj) => {
    setOtherTeamDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setOtherTeamSelectedDraft((prev) => [...prev, obj])
    setAiResult(null)
  }
  const handleOtherDraftRemove = (obj) => {
    setOtherTeamSelectedDraft((prev) => prev.filter((v) => v._id !== obj._id))
    setOtherTeamDraft((prev) => [...prev, obj])
    setAiResult(null)
  }

  // Cap calculations (unchanged)
  const myCapAfter = (() => {
    const sending = myTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    const receiving = otherTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    return (SETTING?.teamSalaryCap || 0) - sending + receiving
  })()

  const otherCapAfter = (() => {
    const sending = otherTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    const receiving = myTeamSelected.reduce((t, p) => t + (p?.players?.currentYearSalaryCap || 0), 0)
    return (otherTeam?.salaryCap || 0) - sending + receiving
  })()

  // Verdict helpers (unchanged)
  const getVerdictIcon = (verdict) => {
    if (verdict === 'fair') return <CheckCircleOutlined />
    if (verdict === 'slightly_unfair') return <WarningOutlined />
    if (verdict === 'unfair') return <ExclamationCircleOutlined />
    return <StopOutlined />
  }
  const getVerdictLabel = (verdict) => {
    if (verdict === 'fair') return 'FAIR TRADE'
    if (verdict === 'slightly_unfair') return 'SLIGHTLY UNFAIR'
    if (verdict === 'unfair') return 'UNFAIR'
    return 'LOPSIDED'
  }
  // tone class for grade badge / headline colouring
  const verdictTone = (verdict) => {
    if (verdict === 'fair') return 'green'
    if (verdict === 'slightly_unfair') return 'gold'
    return 'red'
  }
  // mini bar-meter used in the AI panel (value 0-100)
  const Meter = ({ label, value, tone = 'green' }) => (
    <div className='tt-meter'>
      <div className='tt-meter-top'>
        <span className='l'>{label}</span>
        <span className='n'>{value}</span>
      </div>
      <div className='tt-meter-track'>
        <div className={`tt-meter-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )

  // ── Derived (client-safe, real data only) ──
  const enoughForAnalysis =
    (myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0) &&
    (otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0)

  // Auto-run the AI Commissioner Analysis once both sides carry an asset and there is
  // no current result (no "Run Analysis" button in the reference — it runs on its own).
  useEffect(() => {
    if (enoughForAnalysis && !aiResult && !analyzeLoading) {
      handleAnalyzeTrade()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enoughForAnalysis, aiResult, analyzeLoading])

  // Real completed/pending counts for the "My Trade History" card
  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await getPendingTrade({})
      if (!alive || !Array.isArray(res)) return
      setTradeCounts({
        completed: res.filter((t) => t?.status === 'approved').length,
        pending: res.filter((t) => t?.status === 'pending').length,
      })
    })()
    return () => { alive = false }
  }, [])

  // Trades in the league feed created today (real feed data; never fabricated)
  const feedTodayCount = (leagueFeed || []).filter((f) => {
    if (!f?.createdAt) return false
    return new Date(f.createdAt).toDateString() === new Date().toDateString()
  }).length

  const submitDisabled =
    aiResult?.flaggedForReview ||
    !tradeWindowOpen ||
    !(
      selectTeam &&
      (myTeamSelected.length > 0 || myTeamSelectedDraft.length > 0 || myTeamSamPoints > 0) &&
      (otherTeamSelected.length > 0 || otherTeamSelectedDraft.length > 0 || otherTeamSamPoints > 0)
    )

  const myTeamName = myTeam?.active?.[0]?.team?.name || 'Your Team'
  const myTeamId = SETTING?.userDetails?.team?._id
  const leagueCap = Number(myleagueSalaryCap || 0)
  const teamSalaryNow = Number(SETTING?.teamSalaryCap || 0)
  // Cap bar reflects current team salary vs league cap (matches the "$x / $y" line under it)
  const usagePct = leagueCap > 0 ? Math.min(100, Math.round((teamSalaryNow / leagueCap) * 100)) : 0

  // roster breakdown (my team) — real data
  const myPlayers = (myTeam?.active || []).map((e) => e?.players).filter(Boolean)
  const groupsNow = countByGroup(myPlayers)
  const projectedPlayers = [
    ...myPlayers.filter((p) => !myTeamSelected.some((s) => s?.players?._id === p?._id)),
    ...otherTeamSelected.map((s) => s?.players).filter(Boolean),
  ]
  const groupsAfter = countByGroup(projectedPlayers)

  // Team Needs — derived purely from real loaded roster counts vs targets
  const teamNeeds = NEEDS_TARGETS.map(({ key, target, disp }) => {
    const count = myPlayers.filter((p) => matchesPositionFilter(p?.Position, key)).length
    return { key, disp: disp || key, target, count, ...needStrength(count, target) }
  })

  const rosterMax = num(
    currentLeague?.rosterSize ?? currentLeague?.maxRoster ?? currentLeague?.activeRosterLimit,
  )

  // opponent meta (only render what the API actually returns)
  const oppRecord =
    otherTeam?.team?.record ||
    (num(otherTeam?.team?.wins) != null ? `${otherTeam?.team?.wins}-${otherTeam?.team?.losses ?? 0}` : null)
  const oppRank = num(otherTeam?.team?.rank ?? otherTeam?.team?.standing)
  const oppOwner =
    otherTeam?.team?.owner?.name || otherTeam?.team?.coachName || otherTeam?.team?.manager || null

  // ── Cap-impact per side (real salary deltas; unit is SP) ──
  const myCapImpact = (() => {
    const sending = myTeamSelected.reduce((t, p) => t + salOf(p?.players), 0)
    const receiving = otherTeamSelected.reduce((t, p) => t + salOf(p?.players), 0)
    return receiving - sending // +adds salary, -sheds salary
  })()
  const otherCapImpact = -myCapImpact

  // ── Per-asset VALUE map from the REAL analyze breakdown (keyed by player _id) ──
  const valueById = (() => {
    const m = {}
    ;(aiResult?.buyerBreakdown || []).forEach((p) => (m[String(p._id)] = num(p.value)))
    ;(aiResult?.sellerBreakdown || []).forEach((p) => (m[String(p._id)] = num(p.value)))
    return m
  })()
  const cardValue = (pl) => valueById[String(pl?._id)] ?? valOf(pl)

  // ── AI Commissioner sub-scores — every value traces to the analyze response ──
  const aiGrade = aiResult ? gradeFromScore(aiResult.fairnessScore) : null
  const aiScores = (() => {
    if (!aiResult) return null
    const bv = num(aiResult.buyerValue) || 0
    const sv = num(aiResult.sellerValue) || 0
    const combinedTotal = bv + sv
    const bdraft = num(aiResult.buyerDraftValue) || 0
    const sdraft = num(aiResult.sellerDraftValue) || 0
    const combinedDraft = bdraft + sdraft
    // per-side player value (sum of real per-asset breakdown values)
    const bp = (aiResult.buyerBreakdown || []).reduce((t, p) => t + (num(p.value) || 0), 0)
    const sp = (aiResult.sellerBreakdown || []).reduce((t, p) => t + (num(p.value) || 0), 0)
    return {
      // Overall value parity between the two full packages
      teamBalance: Math.round(aiResult.fairnessScore),
      // Win-now parity: how evenly matched the immediate on-field talent is
      competitive:
        bp > 0 && sp > 0
          ? Math.round((100 * Math.min(bp, sp)) / Math.max(bp, sp))
          : Math.round(aiResult.fairnessScore),
      // Share of the whole trade that is future draft capital
      futureValue: combinedTotal > 0 ? Math.round((100 * combinedDraft) / combinedTotal) : 0,
    }
  })()

  // ── AI findings checklist — generated only from real signals ──
  const aiFindings = (() => {
    if (!aiResult) return []
    const out = []
    const bv = num(aiResult.buyerValue) || 0
    const sv = num(aiResult.sellerValue) || 0
    // Both teams receive comparable value (both non-trivial + within 60% of each other)
    const balancedValue = bv > 0 && sv > 0 && Math.min(bv, sv) >= 0.6 * Math.max(bv, sv)
    out.push({
      ok: balancedValue,
      text: balancedValue ? 'Both teams receive high-value assets' : 'Value is uneven between the two sides',
    })
    // Salary cap — real cap math on both sides
    const myCapOk = myCapAfter >= 0 && (leagueCap > 0 ? myCapAfter <= leagueCap : true)
    const oppCapOk = otherCapAfter >= 0
    const capOk = myCapOk && oppCapOk
    out.push({
      ok: capOk,
      text: capOk ? 'No salary cap concerns detected' : 'A team would breach its salary cap',
    })
    // Future draft capital balance — only when picks are actually involved
    const bdraft = num(aiResult.buyerDraftValue) || 0
    const sdraft = num(aiResult.sellerDraftValue) || 0
    if (bdraft > 0 || sdraft > 0) {
      const draftBal = Math.min(bdraft, sdraft) >= 0.7 * Math.max(bdraft, sdraft, 1)
      out.push({
        ok: draftBal,
        text: draftBal ? 'Future draft capital is balanced' : 'Draft capital favors one side',
      })
    }
    // Positions of need — only when Team Needs data supports it
    const weakOrAvg = new Set(teamNeeds.filter((n) => n.cls !== 'good').map((n) => n.key))
    const incomingPos = otherTeamSelected.map((v) => v?.players?.Position).filter(Boolean)
    if (incomingPos.length > 0 && weakOrAvg.size > 0) {
      const addressed = incomingPos.some((pos) =>
        NEEDS_TARGETS.some((t) => weakOrAvg.has(t.key) && matchesPositionFilter(pos, t.key)),
      )
      out.push({
        ok: addressed,
        text: addressed ? 'Positions of need are addressed' : 'Trade does not address your top needs',
      })
    }
    if (aiResult.flaggedForReview) {
      out.push({ ok: false, text: 'Flagged for commissioner review' })
    }
    return out
  })()

  // ── Per-side package totals normalised to /100 (richer package = 100) ──
  const sideTotals = (() => {
    if (!aiResult) return null
    const bv = num(aiResult.buyerValue) || 0
    const sv = num(aiResult.sellerValue) || 0
    const mx = Math.max(bv, sv, 1)
    return {
      your: Math.round((bv / mx) * 1000) / 10,
      their: Math.round((sv / mx) * 1000) / 10,
      yourRaw: bv,
      theirRaw: sv,
    }
  })()

  // persist current package (used before navigating away / manual Save As Draft)
  const buildDraft = () => ({
    selectTeam,
    myPlayerIds: myTeamSelected.map((v) => v?.players?._id),
    otherPlayerIds: otherTeamSelected.map((v) => v?.players?._id),
    myPickIds: myTeamSelectedDraft.map((v) => v?._id),
    otherPickIds: otherTeamSelectedDraft.map((v) => v?._id),
    myTeamSamPoints,
    otherTeamSamPoints,
    gmNote,
  })
  const persistDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraft()))
    } catch {
      /* ignore quota */
    }
  }
  const handleSaveDraft = () => {
    persistDraft()
    notification.success({ message: 'Trade draft saved on this device', duration: 3 })
  }
  const handleViewRoster = () => {
    if (!selectTeam) return
    persistDraft() // keep the in-progress trade when leaving the page
    navigate('/roster-board', { state: { teamId: selectTeam } })
  }

  /* ── render helpers ── */
  const PlayerAssetCard = ({ entry, onRemove }) => {
    const pl = entry?.players
    if (!pl) return null
    const label = mapPos(pl?.Position)
    const isDef = DEF_LABELS.has(String(label).toUpperCase())
    const ovr = ovrOf(pl)
    const age = num(pl?.Age)
    const ppg = ppgOf(pl)
    const tier = tierOf(cardValue(pl))
    const team = teamOf(pl)
    const sal = salOf(pl)
    const img = pl?.HostedHeadshotNoBackgroundUrl
    const fav = favorites.has(String(pl?._id))
    const goRoster = () => navigate('/roster-board', { state: { teamId: selectTeam || pl?.team } })
    return (
      <div
        className='tt-asset'
        role='button'
        tabIndex={0}
        title={`View ${pl?.Name}`}
        onClick={goRoster}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            goRoster()
          }
        }}
      >
        <button
          className={`tt-asset-fav ${fav ? 'on' : ''}`}
          aria-label={fav ? 'Unstar player' : 'Star player'}
          aria-pressed={fav}
          onClick={(e) => {
            e.stopPropagation()
            toggleFav(pl?._id)
          }}
        >
          {fav ? <StarFilled /> : <StarOutlined />}
        </button>

        <div className='tt-asset-avwrap'>
          {img ? (
            <img src={img} alt='' className='tt-asset-av' />
          ) : (
            <div className='tt-asset-av-ph'>{(pl?.Name || '?').charAt(0)}</div>
          )}
          {ovr != null && <span className='tt-asset-ovrbadge'>{ovr}</span>}
        </div>

        <div className='tt-asset-mid'>
          <span className='tt-asset-name'>
            {pl?.Name}
            {blockedIds.has(String(pl?._id)) && <span className='tt-block-badge'>ON BLOCK</span>}
          </span>
          <div className='tt-asset-sub'>
            <span className={`tt-pos ${isDef ? 'def' : ''}`}>{label}</span>
            {team && <span className='tt-asset-team'>· {team}</span>}
          </div>
        </div>

        <div className='tt-asset-right'>
          <div className='tt-asset-statrow'>
            <span className='tt-mini'>
              <i>AGE</i>
              <b>{age != null ? age : '—'}</b>
            </span>
            <span className='tt-mini'>
              <i>OVR</i>
              <b>{ovr != null ? ovr : '—'}</b>
            </span>
            <span className='tt-mini'>
              <i>PPG</i>
              <b>{ppg != null ? ppg.toFixed(1) : '—'}</b>
            </span>
            <span className='tt-mini'>
              <i>VALUE</i>
              {tier ? <b className={`tt-tier ${tier.cls}`}>{tier.t}</b> : <b>—</b>}
            </span>
          </div>
          <div className='tt-asset-aav'>{sal > 0 ? `${fmtSP(sal)} SP AAV` : '— AAV'}</div>
        </div>

        <button
          className='tt-remove'
          aria-label={`Remove ${pl?.Name}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(pl?._id)
          }}
        >
          <CloseOutlined />
        </button>
      </div>
    )
  }

  const PickCard = ({ pick, onRemove }) => {
    const traded = isPickTraded(pick)
    const round = num(pick?.round)
    const roundLabel = ordinal(round) // "1st" / "2nd" … from the real round number
    return (
      <div className='tt-pick'>
        <div className='tt-pick-shield'>{roundLabel ? roundLabel.toUpperCase() : 'PICK'}</div>
        <div className='tt-pick-mid'>
          <span className='tt-pick-title'>
            {pick?.season ? `${pick.season} ` : ''}
            {roundLabel ? `${roundLabel} Round Pick` : 'Draft Pick'}
          </span>
          {traded && pick?.mainTeam?.name && (
            <span className='tt-pick-sub'>({pick.mainTeam.name})</span>
          )}
        </div>
        <button className='tt-remove' aria-label='Remove pick' onClick={() => onRemove(pick)}>
          <CloseOutlined />
        </button>
      </div>
    )
  }

  const sideAssetCount = (players, picks, sam) => players.length + picks.length + (sam > 0 ? 1 : 0)

  /* ── Loading skeleton (no full-page spinner) ── */
  if (loading) {
    return (
      <section className='tt-page tt-new'>
        <div className='tt-skel tt-skel-bar' style={{ width: '40%', height: 44 }} />
        <div className='tt-shortcuts'>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className='tt-skel' style={{ height: 72 }} />
          ))}
        </div>
        <div className='tt-skel-grid'>
          <div className='tt-skel tt-skel-col' />
          <div className='tt-skel tt-skel-col' style={{ height: 240 }} />
          <div className='tt-skel tt-skel-col' />
        </div>
      </section>
    )
  }

  return (
    <section className='tt-page tt-new'>
      {/* ── Main layout ── */}
      <div className='tt-layout'>
        {/* landscape-mobile side switch */}
        <div className='tt-mobile-switch'>
          <button className={mobileSide === 'give' ? 'active' : ''} onClick={() => setMobileSide('give')}>
            YOU GIVE
          </button>
          <button className={mobileSide === 'get' ? 'active' : ''} onClick={() => setMobileSide('get')}>
            YOU GET
          </button>
        </div>

        <div className='tt-main'>
          {/* ── Workflow shortcut cards (5 reference modules — all wired to real handlers) ── */}
          <div className='tt-shortcuts'>
        <button className='tt-shortcut' onClick={handleAnalyzeTrade}>
          <span className='tt-shortcut-ic purple'>
            <CalculatorOutlined />
          </span>
          <span className='tt-shortcut-tx'>
            <span className='t'>Trade Calculator</span>
            <span className='d'>Get AI-powered trade value &amp; fairness</span>
          </span>
          <span className='tt-shortcut-cta-wrap'>
            <span className='tt-shortcut-ctatext'>Get Analysis</span>
            <span className='tt-shortcut-cta'>
              <ArrowRightOutlined />
            </span>
          </span>
        </button>

        <button className='tt-shortcut' onClick={() => setBlockModalOpen(true)}>
          <span className='tt-shortcut-ic green'>
            <FireOutlined />
          </span>
          <span className='tt-shortcut-tx'>
            <span className='t'>Trade Block</span>
            <span className='d'>
              {`${blockPlayers.length} player${blockPlayers.length === 1 ? '' : 's'} on the block`}
            </span>
          </span>
          <span className='tt-shortcut-cta-wrap'>
            <span className='tt-shortcut-ctatext'>View Players</span>
            <span className='tt-shortcut-cta'>
              <ArrowRightOutlined />
            </span>
          </span>
        </button>

        <button className='tt-shortcut' onClick={() => setFeedModalOpen(true)}>
          <span className='tt-shortcut-ic gold'>
            <SwapOutlined />
          </span>
          <span className='tt-shortcut-tx'>
            <span className='t'>League Trade Feed</span>
            <span className='d'>
              {`${feedTodayCount} trade${feedTodayCount === 1 ? '' : 's'} proposed today`}
            </span>
          </span>
          <span className='tt-shortcut-cta-wrap'>
            <span className='tt-shortcut-ctatext'>View Feed</span>
            <span className='tt-shortcut-cta'>
              <ArrowRightOutlined />
            </span>
          </span>
        </button>

        <button className='tt-shortcut' onClick={() => onGoPending && onGoPending()}>
          <span className='tt-shortcut-ic blue'>
            <HistoryOutlined />
          </span>
          <span className='tt-shortcut-tx'>
            <span className='t'>My Trade History</span>
            <span className='d'>{tradeCounts.completed} completed · {tradeCounts.pending} pending</span>
          </span>
          <span className='tt-shortcut-cta-wrap'>
            <span className='tt-shortcut-ctatext'>View History</span>
            <span className='tt-shortcut-cta'>
              <ArrowRightOutlined />
            </span>
          </span>
        </button>

        <button className='tt-shortcut' onClick={openSettings}>
          <span className='tt-shortcut-ic red'>
            <SettingOutlined />
          </span>
          <span className='tt-shortcut-tx'>
            <span className='t'>Trade Settings</span>
            <span className='d'>Customize trade preferences</span>
          </span>
          <span className='tt-shortcut-cta-wrap'>
            <span className='tt-shortcut-ctatext'>Manage</span>
            <span className='tt-shortcut-cta'>
              <ArrowRightOutlined />
            </span>
          </span>
        </button>
      </div>

      {/* ── Opponent selector ── */}
      <div className='tt-oppbar'>
        <span className='tt-oppbar-label'>Select opponent team:</span>
        <Select
          placeholder='Choose a team to trade with...'
          className='tt-oppselect'
          value={selectTeam}
          showSearch
          filterOption={(input, option) => (option?.name || '').toLowerCase().includes(input.toLowerCase())}
          onChange={(e) => {
            setSelectTeam(e)
            setOtherTeamSelected([])
            setOtherTeamSelectedDraft([])
            setOtherTeamSamPoints(0)
            setAiResult(null)
          }}
          optionLabelProp='label'
          options={teams
            ?.filter((x) => x?._id !== myTeamId)
            ?.map((v) => {
              const own = v?.owner?.name || v?.coachName || v?.manager || v?.userName || null
              return {
                value: v?._id,
                name: v?.name,
                label: (
                  <div className='tt-select-opt'>
                    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                      {/* Initial sits underneath; a valid logo covers it. A broken
                          logo URL hides its img (onError) and reveals the initial,
                          instead of showing the browser's broken-image icon. */}
                      <span className='tt-select-logo-ph'>{(v?.name || '?').charAt(0)}</span>
                      {v?.logo ? (
                        <img
                          src={v.logo}
                          alt=''
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : null}
                    </span>
                    <span className='tt-select-txt'>
                      <span className='tt-select-name'>{v?.name}</span>
                      {own && <span className='tt-select-owner'>@{own}</span>}
                    </span>
                  </div>
                ),
              }
            })}
        />

        {selectTeam && otherTeam && (
          <div className='tt-oppstats'>
            {oppRecord && (
              <div className='tt-oppstat'>
                <span className='k'>Overall</span>
                <span className='v'>{oppRecord}</span>
              </div>
            )}
            {oppRank != null && (
              <div className='tt-oppstat'>
                <span className='k'>Rank</span>
                <span className='v'>#{oppRank}</span>
              </div>
            )}
            <div className='tt-oppstat'>
              <span className='k'>Cap Space</span>
              <span className={`v ${leagueCap - (otherTeam?.salaryCap || 0) < 0 ? 'neg' : 'pos'}`}>
                {fmtSP(leagueCap - (otherTeam?.salaryCap || 0))} SP
              </span>
            </div>
            <div className='tt-oppstat'>
              <span className='k'>Roster Spots</span>
              <span className='v'>
                {(otherTeam?.active || []).length}
                {rosterMax != null ? `/${rosterMax}` : ''}
              </span>
            </div>
          </div>
        )}

        {selectTeam && (
          <button className='tt-viewroster-btn' onClick={handleViewRoster}>
            <EyeOutlined /> VIEW ROSTER
          </button>
        )}
      </div>

          <div className='tt-builder'>
          {/* ── YOUR TEAM ── */}
          <div className={`tt-col tt-col-give ${mobileSide === 'give' ? '' : 'hide-mobile'}`}>
            <div className='tt-col-head'>
              <div className='tt-col-head-tx'>
                <span className='tt-col-eyebrow'>YOUR TEAM</span>
                <h3>{myTeamName}</h3>
              </div>
              <span className='tt-col-cap'>
                <i>CAP SPACE</i>
                <b className={leagueCap - teamSalaryNow < 0 ? 'neg' : 'pos'}>
                  {fmtSP(leagueCap - teamSalaryNow)} SP
                </b>
              </span>
            </div>

            <div className='tt-section'>
              <div className='tt-section-h'>
                <span className='lbl'>
                  Players You Give <span className='cnt'>{myTeamSelected.length}</span>
                </span>
                <AddPlayerToTrade
                  teamName={myTeamName}
                  data={myTeam ? [...(myTeam?.active || [])] : []}
                  selected={myTeamSelected}
                  setSelected={(val) => {
                    setMyTeamSelected(val)
                    setAiResult(null)
                  }}
                />
              </div>
              <div className='tt-assets'>
                {myTeamSelected.length > 0 ? (
                  myTeamSelected.map((v) => (
                    <PlayerAssetCard
                      key={v?.players?._id}
                      entry={v}
                      onRemove={(id) => {
                        setMyTeamSelected((prev) => prev.filter((x) => x?.players?._id !== id))
                        setAiResult(null)
                      }}
                    />
                  ))
                ) : (
                  <div className='tt-empty-slot'>No players added — use + Add Player</div>
                )}
              </div>
            </div>

            <div className='tt-section'>
              <div className='tt-section-h'>
                <span className='lbl'>
                  Draft Picks You Give <span className='cnt'>{myTeamSelectedDraft.length}</span>
                </span>
                <AddPickToTrade
                  teamName={myTeamName}
                  picks={myTeamDraft}
                  selectedCount={myTeamSelectedDraft.length}
                  onSelect={handleMyDraftSelect}
                />
              </div>
              <div className='tt-assets'>
                {myTeamSelectedDraft.length > 0 ? (
                  myTeamSelectedDraft.map((v, i) => (
                    <PickCard key={v?._id || i} pick={v} onRemove={handleMyDraftRemove} />
                  ))
                ) : (
                  <div className='tt-empty-slot'>
                    {myTeamDraft?.length > 0 ? 'No draft picks added — use + Add Pick' : 'No draft picks available'}
                  </div>
                )}
              </div>
            </div>

            <div className='tt-section'>
              <div className='tt-section-h'>
                <span className='lbl'>
                  SAM Points
                  <Tooltip title='SAM Points are tradable league currency added to even out a package.'>
                    <InfoCircleOutlined className='tt-lbl-info' />
                  </Tooltip>
                </span>
              </div>
              <div className='tt-sam'>
                <InputNumber
                  min={0}
                  value={myTeamSamPoints}
                  onChange={(val) => {
                    setMyTeamSamPoints(val || 0)
                    setAiResult(null)
                  }}
                  placeholder='0'
                  addonAfter='SP'
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </div>
            </div>

            <div className='tt-sidefoot'>
              <div className='tt-sidefoot-cell'>
                <span className='k'>TOTAL VALUE</span>
                <span className='v give'>{sideTotals ? `${sideTotals.your} / 100` : '—'}</span>
              </div>
              <div className='tt-sidefoot-cell'>
                <span className='k'>CAP IMPACT</span>
                <span className={`v ${myCapImpact > 0 ? 'neg' : 'pos'}`}>
                  {myCapImpact > 0 ? '+' : myCapImpact < 0 ? '-' : ''}
                  {fmtSP(Math.abs(myCapImpact))} SP
                </span>
              </div>
            </div>
          </div>

          {/* ── CENTER: AI Commissioner Analysis ── */}
          <div className='tt-col tt-center'>
            <div className='tt-center-inner'>
              <div className='tt-ai-panelhead'>
                <span className='tt-ai-title'>
                  <RobotOutlined /> AI Commissioner Analysis
                </span>
                <span className='tt-ai-beta'>BETA</span>
              </div>

              {!enoughForAnalysis ? (
                <div className='tt-ai-empty'>
                  <RobotOutlined className='ic' />
                  <span>Add assets from both teams to analyze this trade.</span>
                </div>
              ) : analyzeLoading ? (
                <div className='tt-ai tt-ai-skel'>
                  <div className='tt-skel' style={{ width: 96, height: 96, borderRadius: '50%', margin: '4px auto' }} />
                  <div className='tt-skel' style={{ height: 16, width: '60%', margin: '10px auto' }} />
                  <div className='tt-skel' style={{ height: 40, marginTop: 10 }} />
                  <div className='tt-skel' style={{ height: 70, marginTop: 10 }} />
                  <div className='tt-skel' style={{ height: 70, marginTop: 8 }} />
                </div>
              ) : aiResult ? (
                <div className='tt-ai'>
                  <div className={`tt-grade ${verdictTone(aiResult.verdict)}`}>
                    <span className='g'>{aiGrade}</span>
                    <span className='s'>
                      {aiResult.fairnessScore}
                      <i>/100</i>
                    </span>
                  </div>

                  <div className='tt-ai-headline'>
                    <span className={`hl ${verdictTone(aiResult.verdict)}`}>
                      {getVerdictIcon(aiResult.verdict)} {getVerdictLabel(aiResult.verdict)}
                    </span>
                    {aiResult.flaggedForReview && (
                      <span className='tt-ai-flag'>
                        <ExclamationCircleOutlined /> COMMISSIONER REVIEW
                      </span>
                    )}
                  </div>

                  {aiResult.summary && <p className='tt-ai-desc'>{aiResult.summary}</p>}

                  {aiScores && (
                    <div className='tt-meters'>
                      <Meter label='TEAM BALANCE' value={aiScores.teamBalance} tone={verdictTone(aiResult.verdict)} />
                      <Meter label='COMPETITIVE' value={aiScores.competitive} tone='green' />
                      <Meter label='FUTURE VALUE' value={aiScores.futureValue} tone='gold' />
                    </div>
                  )}

                  {aiFindings.length > 0 && (
                    <div className='tt-checks'>
                      {aiFindings.map((f, i) => (
                        <div key={i} className={`tt-check ${f.ok ? 'ok' : 'no'}`}>
                          {f.ok ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                <div className='tt-ai-empty'>
                  <RobotOutlined className='ic' />
                  <span>Add assets from both teams to analyze this trade.</span>
                </div>
              )}

              {enoughForAnalysis && (
                <>
                  {!tradeWindowOpen && (
                    <div
                      className='tt-deadline-banner'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        margin: '4px 0 8px',
                        borderRadius: 8,
                        background: 'rgba(255,90,95,.12)',
                        border: '1px solid rgba(255,90,95,.4)',
                        color: '#ff8a8e',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <LockOutlined />
                      Trade deadline passed — {tradeWindow.label}
                    </div>
                  )}

                  <Button
                    type='primary'
                    icon={<ThunderboltOutlined />}
                    className='tt-submit-btn'
                    onClick={() => setConfirmOpen(true)}
                    disabled={submitDisabled}
                    block
                  >
                    {!tradeWindowOpen
                      ? 'TRADE DEADLINE PASSED'
                      : aiResult?.flaggedForReview
                      ? 'FLAGGED — NEEDS REVIEW'
                      : 'SUBMIT TRADE OFFER'}
                  </Button>

                  <Button
                    icon={<SaveOutlined />}
                    className='tt-draft-btn'
                    onClick={handleSaveDraft}
                    disabled={!selectTeam}
                    block
                  >
                    Save As Draft
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── OPPONENT ── */}
          <div className={`tt-col tt-col-get ${mobileSide === 'get' ? '' : 'hide-mobile'}`}>
            {loading2 ? (
              <div className='tt-section'>
                <div className='tt-skel' style={{ height: 40, marginBottom: 10 }} />
                <div className='tt-skel' style={{ height: 56, marginBottom: 8 }} />
                <div className='tt-skel' style={{ height: 56 }} />
              </div>
            ) : selectTeam && otherTeam ? (
              <>
                <div className='tt-col-head'>
                  <div className='tt-col-head-tx'>
                    <span className='tt-col-eyebrow get'>THEY GIVE</span>
                    <h3>{otherTeam?.team?.name || 'Other Team'}</h3>
                  </div>
                  <span className='tt-col-cap'>
                    <i>CAP SPACE</i>
                    <b className={leagueCap - (otherTeam?.salaryCap || 0) < 0 ? 'neg' : 'pos'}>
                      {fmtSP(leagueCap - (otherTeam?.salaryCap || 0))} SP
                    </b>
                  </span>
                </div>

                <div className='tt-section'>
                  <div className='tt-section-h'>
                    <span className='lbl'>
                      Players They Give <span className='cnt'>{otherTeamSelected.length}</span>
                    </span>
                    <AddPlayerToTrade
                      teamName={otherTeam?.team?.name}
                      data={otherTeam ? (otherTeam.active || []).map((v) => ({ players: v })) : []}
                      selected={otherTeamSelected}
                      setSelected={(val) => {
                        setOtherTeamSelected(val)
                        setAiResult(null)
                      }}
                    />
                  </div>
                  <div className='tt-assets'>
                    {otherTeamSelected.length > 0 ? (
                      otherTeamSelected.map((v) => (
                        <PlayerAssetCard
                          key={v?.players?._id}
                          entry={v}
                          onRemove={(id) => {
                            setOtherTeamSelected((prev) => prev.filter((x) => x?.players?._id !== id))
                            setAiResult(null)
                          }}
                        />
                      ))
                    ) : (
                      <div className='tt-empty-slot'>No players added — use + Add Player</div>
                    )}
                  </div>
                </div>

                <div className='tt-section'>
                  <div className='tt-section-h'>
                    <span className='lbl'>
                      Draft Picks They Give <span className='cnt'>{otherTeamSelectedDraft.length}</span>
                    </span>
                    <AddPickToTrade
                      teamName={otherTeam?.team?.name}
                      picks={otherTeamDraft}
                      selectedCount={otherTeamSelectedDraft.length}
                      onSelect={handleOtherDraftSelect}
                    />
                  </div>
                  <div className='tt-assets'>
                    {otherTeamSelectedDraft.length > 0 ? (
                      otherTeamSelectedDraft.map((v, i) => (
                        <PickCard key={v?._id || i} pick={v} onRemove={handleOtherDraftRemove} />
                      ))
                    ) : (
                      <div className='tt-empty-slot'>
                        {otherTeamDraft?.length > 0
                          ? 'No draft picks added — use + Add Pick'
                          : 'No draft picks available'}
                      </div>
                    )}
                  </div>
                </div>

                <div className='tt-section'>
                  <div className='tt-section-h'>
                    <span className='lbl'>
                      SAM Points
                      <Tooltip title='SAM Points are tradable league currency added to even out a package.'>
                        <InfoCircleOutlined className='tt-lbl-info' />
                      </Tooltip>
                    </span>
                  </div>
                  <div className='tt-sam'>
                    <InputNumber
                      min={0}
                      value={otherTeamSamPoints}
                      onChange={(val) => {
                        setOtherTeamSamPoints(val || 0)
                        setAiResult(null)
                      }}
                      placeholder='0'
                      addonAfter='SP'
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </div>
                </div>

                <div className='tt-sidefoot'>
                  <div className='tt-sidefoot-cell'>
                    <span className='k'>TOTAL VALUE</span>
                    <span className='v get'>{sideTotals ? `${sideTotals.their} / 100` : '—'}</span>
                  </div>
                  <div className='tt-sidefoot-cell'>
                    <span className='k'>CAP IMPACT</span>
                    <span className={`v ${otherCapImpact > 0 ? 'neg' : 'pos'}`}>
                      {otherCapImpact > 0 ? '+' : otherCapImpact < 0 ? '-' : ''}
                      {fmtSP(Math.abs(otherCapImpact))} SP
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className='tt-empty-opp'>
                <SwapOutlined className='ic' />
                <span className='msg'>Select an opponent above</span>
              </div>
            )}
          </div>
          </div>

          {/* ── Bottom info cards (beneath the builder, inside the main column) ── */}
          <div className='tt-info-cards'>
            <div className='tt-info tip'>
              <div className='tt-info-h'>
                <span className='tt-info-ic gold'>
                  <BulbOutlined />
                </span>
                <h5>Pro Tip</h5>
              </div>
              <p>
                Run the AI Commissioner Analysis before submitting. It is advisory only, but a flagged trade will
                require commissioner review before it can go through.
              </p>
            </div>
            <div className='tt-info tips'>
              <div className='tt-info-h'>
                <span className='tt-info-ic green'>
                  <CheckCircleOutlined />
                </span>
                <h5>Trade Tips</h5>
              </div>
              <ul className='tt-info-checks'>
                <li>
                  <CheckCircleOutlined /> Balance salary going out vs coming in to stay under the cap.
                </li>
                <li>
                  <CheckCircleOutlined /> Draft picks and SAM Points can help even out a package.
                </li>
                <li>
                  <CheckCircleOutlined /> Check your roster breakdown so you don&apos;t leave a position thin.
                </li>
              </ul>
              <span
                className='tt-info-link'
                role='button'
                tabIndex={0}
                onClick={() => setRulesBookOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setRulesBookOpen(true)
                  }
                }}
              >
                View all tips →
              </span>
            </div>
            <div className='tt-info safety'>
              <div className='tt-info-h'>
                <span className='tt-info-ic blue'>
                  <SafetyOutlined />
                </span>
                <h5>Trade Safety</h5>
              </div>
              <p>
                Nothing is final until both teams and (if required) the commissioner approve. Cap, ownership and
                pick-ownership rules are enforced server-side on submit.
              </p>
            </div>
            <div className='tt-info rules'>
              <div className='tt-info-h'>
                <span className='tt-info-ic purple'>
                  <ReadOutlined />
                </span>
                <h5>League Rules</h5>
              </div>
              <p>Trades are validated against your league&apos;s salary cap, roster and deadline rules.</p>
              <span
                className='tt-info-link'
                role='button'
                tabIndex={0}
                onClick={() => setRulesBookOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setRulesBookOpen(true)
                  }
                }}
              >
                View All Rules →
              </span>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className='tt-sidebar'>
          {/* Team Needs — grid of position chips (live roster depth vs targets) */}
          <div className='tt-card'>
            <div className='tt-card-h'>
              <h4>
                <TeamOutlined /> Team Needs
              </h4>
            </div>
            <div className='tt-card-b'>
              <div className='tt-needgrid'>
                {teamNeeds.map((n) => (
                  <div
                    key={n.key}
                    className={`tt-needchip ${n.cls}`}
                    title={`${n.count}/${n.target} — ${n.label}`}
                  >
                    <span className='pos'>{n.disp || n.key}</span>
                    <span className={`str ${n.cls}`}>{n.label}</span>
                  </div>
                ))}
              </div>
              <p className='tt-advisory-note' style={{ textAlign: 'left', marginTop: 8 }}>
                Strength is your live roster depth vs typical per-position targets.
              </p>
            </div>
          </div>

          {/* Salary Cap Summary */}
          <div className='tt-card'>
            <div className='tt-card-h'>
              <h4>
                <DollarOutlined /> Salary Cap Summary
              </h4>
            </div>
            <div className='tt-card-b'>
              <div className='tt-capstats'>
                <div className='tt-capstat'>
                  <span className='k'>Team Salary</span>
                  <span className='v'>{fmtSP(teamSalaryNow)} SP</span>
                </div>
                <div className='tt-capstat'>
                  <span className='k'>Cap Space</span>
                  <span className={`v ${leagueCap - teamSalaryNow < 0 ? 'neg' : 'pos'}`}>
                    {fmtSP(leagueCap - teamSalaryNow)} SP
                  </span>
                </div>
              </div>
              <div className='tt-capbar'>
                <div
                  className={`tt-capbar-fill grad ${usagePct >= 100 ? 'over' : ''}`}
                  style={{ width: `${Math.max(0, Math.min(100, usagePct))}%` }}
                />
              </div>
              <div className='tt-capbar-nums'>
                {fmtSP(teamSalaryNow)} SP / {fmtSP(leagueCap)} SP
              </div>
            </div>
          </div>

          {/* Roster Breakdown */}
          <div className='tt-card'>
            <div className='tt-card-h'>
              <h4>
                <TeamOutlined /> Roster Breakdown
              </h4>
              <span className='tt-asset-stat'>
                {myPlayers.length}
                {rosterMax != null ? `/${rosterMax}` : ''}
              </span>
            </div>
            <div className='tt-card-b'>
              <div className='tt-rostertotal'>
                <span className='k'>Total Players</span>
                <span className='v'>
                  {projectedPlayers.length}
                  {rosterMax != null ? ` / ${rosterMax}` : ''}
                </span>
              </div>
              <div className='tt-posgrid five'>
                {ROSTER_GROUPS.map((g) => {
                  const now = groupsNow[g] || 0
                  const after = groupsAfter[g] || 0
                  const delta = after - now
                  return (
                    <div key={g} className='tt-poscell'>
                      <div className='p'>{g}</div>
                      <div className='c'>{after}</div>
                      {delta !== 0 && (
                        <div className={`delta ${delta > 0 ? 'up' : 'down'}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Trades In League */}
          <div className='tt-card'>
            <div className='tt-card-h'>
              <h4>
                <SwapOutlined /> Recent Trades In League
              </h4>
              {leagueFeed.length > 0 && (
                <span className='tt-info-link' onClick={() => setFeedModalOpen(true)}>
                  View All →
                </span>
              )}
            </div>
            <div className='tt-card-b'>
              {leagueFeed.length === 0 ? (
                <div className='tt-feed-empty'>No completed trades in this league yet.</div>
              ) : (
                <div className='tt-feed'>
                  {leagueFeed.slice(0, 4).map((f) => (
                    <div key={f._id} className='tt-feed-row'>
                      <div className='tt-feed-head'>
                        {f.teamA?.logo ? (
                          <img src={f.teamA.logo} alt='' className='tt-feed-logo' />
                        ) : (
                          <span className='tt-feed-logo-ph'>{(f.teamA?.name || '?').charAt(0)}</span>
                        )}
                        <div className='tt-feed-teams'>
                          <span className='nm'>{f.teamA?.name}</span>
                          <SwapOutlined className='ic' />
                          <span className='nm'>{f.teamB?.name}</span>
                        </div>
                        {f.createdAt && <span className='tt-feed-time'>{timeAgo(f.createdAt)}</span>}
                      </div>
                      {f.assetSummary && <div className='tt-feed-assets'>{f.assetSummary}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='tt-card'>
            <div className='tt-card-h'>
              <h4>
                <ThunderboltOutlined /> Quick Actions
              </h4>
            </div>
            <div className='tt-card-b tt-qa'>
              <button className='tt-qa-btn blue' onClick={() => setBlockModalOpen(true)}>
                <FireOutlined /> Trade Block Players
              </button>
              <button className='tt-qa-btn green' onClick={() => navigate('/search-player')}>
                <BarChartOutlined /> View Player Values
              </button>
              <button
                className='tt-qa-btn subtle'
                onClick={() => (isCommissioner ? navigate('/commissioner') : setRulesBookOpen(true))}
              >
                <SettingOutlined /> League Settings
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Confirmation dialog ── */}
      <Modal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        footer={null}
        centered
        width={620}
        className='tt-confirm'
        closable
      >
        <h3 className='tt-confirm-head'>Confirm Trade Offer</h3>
        <p className='tt-confirm-sub'>Review both sides before sending. This proposes the trade — it is not final.</p>

        <div className='tt-confirm-sides'>
          <div className='tt-confirm-side'>
            <h6>{myTeamName} gives</h6>
            <ul>
              {myTeamSelected.map((v) => (
                <li key={v?.players?._id}>
                  <span>{mapPos(v?.players?.Position)}</span>
                  {v?.players?.Name}
                </li>
              ))}
              {myTeamSelectedDraft.map((v, i) => (
                <li key={v?._id || i}>
                  <span>PICK</span>
                  {`${v?.season}' Rd ${v?.round}`}
                </li>
              ))}
              {myTeamSamPoints > 0 && (
                <li>
                  <span>SAM</span>
                  {myTeamSamPoints.toLocaleString()} pts
                </li>
              )}
              {sideAssetCount(myTeamSelected, myTeamSelectedDraft, myTeamSamPoints) === 0 && (
                <li style={{ color: '#8a93a6' }}>No assets</li>
              )}
            </ul>
          </div>
          <SwapOutlined className='tt-confirm-swap' />
          <div className='tt-confirm-side'>
            <h6>{otherTeam?.team?.name || 'Opponent'} gives</h6>
            <ul>
              {otherTeamSelected.map((v) => (
                <li key={v?.players?._id}>
                  <span>{mapPos(v?.players?.Position)}</span>
                  {v?.players?.Name}
                </li>
              ))}
              {otherTeamSelectedDraft.map((v, i) => (
                <li key={v?._id || i}>
                  <span>PICK</span>
                  {`${v?.season}' Rd ${v?.round}`}
                </li>
              ))}
              {otherTeamSamPoints > 0 && (
                <li>
                  <span>SAM</span>
                  {otherTeamSamPoints.toLocaleString()} pts
                </li>
              )}
              {sideAssetCount(otherTeamSelected, otherTeamSelectedDraft, otherTeamSamPoints) === 0 && (
                <li style={{ color: '#8a93a6' }}>No assets</li>
              )}
            </ul>
          </div>
        </div>

        <div className='tt-confirm-impact'>
          <div className='box'>
            <div className='k'>Your Cap After</div>
            <div className={`v ${myCapAfter < 0 ? 'neg' : ''}`}>{myCapAfter.toLocaleString()} SP</div>
          </div>
          <div className='box'>
            <div className='k'>Your Roster After</div>
            <div className='v'>
              {projectedPlayers.length}
              {rosterMax != null ? `/${rosterMax}` : ''}
            </div>
          </div>
        </div>

        <div className='tt-confirm-note'>
          <ExclamationCircleOutlined />
          <span>
            {aiResult?.flaggedForReview
              ? 'This package was flagged and will require commissioner review before it can be accepted.'
              : 'The opponent must accept this offer, and it is subject to your league’s commissioner-review rules.'}
          </span>
        </div>

        {/* Message + expiration are chosen at submit time and travel with the offer (see createTrade payload). */}
        <div className='tt-confirm-meta'>
          <div className='tt-confirm-meta-row' style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <span className='k'>
              <MessageOutlined /> Trade Message
            </span>
            <textarea
              className='tt-offer-msg'
              value={tradeMessage}
              maxLength={280}
              onChange={(e) => setTradeMessage(e.target.value)}
              placeholder='Add a note for the other team… (optional)'
              aria-label='Trade message'
            />
            <div className='tt-offer-cnt'>{tradeMessage.length}/280</div>
          </div>
          <div className='tt-confirm-meta-row'>
            <span className='k'>
              <ClockCircleOutlined /> Offer Expires
            </span>
            <Select
              className='tt-offer-expiry'
              value={tradeExpiry}
              onChange={setTradeExpiry}
              options={EXPIRY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <Button className='tt-draft-btn' style={{ width: 'auto', padding: '0 18px' }} onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            type='primary'
            className='tt-submit-btn'
            style={{ width: 'auto', padding: '0 22px' }}
            loading={btnLoading}
            disabled={submitDisabled}
            onClick={createTrade}
          >
            Confirm &amp; Submit
          </Button>
        </div>
      </Modal>

      {/* ── League Trade Feed modal ── */}
      <Modal
        open={feedModalOpen}
        onCancel={() => setFeedModalOpen(false)}
        footer={null}
        centered
        width={620}
        className='tt-confirm'
        title={<span><SwapOutlined /> League Trade Feed</span>}
      >
        {leagueFeed.length === 0 ? (
          <div className='tt-feed-empty' style={{ padding: '18px 0' }}>
            No completed trades in this league yet.
          </div>
        ) : (
          <div className='tt-feed tt-feed-modal'>
            {leagueFeed.map((f) => (
              <div key={f._id} className='tt-feed-row'>
                <div className='tt-feed-teams'>
                  {f.teamA?.logo && <img src={f.teamA.logo} alt='' className='tt-feed-logo' />}
                  <span className='nm'>{f.teamA?.name}</span>
                  <SwapOutlined className='ic' />
                  {f.teamB?.logo && <img src={f.teamB.logo} alt='' className='tt-feed-logo' />}
                  <span className='nm'>{f.teamB?.name}</span>
                </div>
                {f.assets?.length > 0 && (
                  <div className='tt-feed-assets'>
                    {f.assets.map((a, i) => (
                      <span key={i} className='tt-feed-asset'>
                        {a.position ? `${mapPos(a.position)} ` : ''}
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                {f.createdAt && (
                  <div className='tt-feed-time'>
                    {new Date(f.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Trade Block modal ── */}
      <Modal
        open={blockModalOpen}
        onCancel={() => setBlockModalOpen(false)}
        footer={null}
        centered
        width={640}
        className='tt-confirm'
        title={<span><FireOutlined /> Trade Block</span>}
      >
        {/* Your players — toggle on/off the block */}
        <div className='tt-block-sec'>
          <h6 className='tt-block-h'>Your Players</h6>
          <div className='tt-block-list'>
            {myPlayers.length === 0 ? (
              <div className='tt-feed-empty'>No players on your roster.</div>
            ) : (
              myPlayers.map((pl) => {
                const on = blockedIds.has(String(pl?._id))
                return (
                  <div key={pl?._id} className='tt-block-row'>
                    <div className='tt-block-pl'>
                      <span className='tt-pos'>{mapPos(pl?.Position)}</span>
                      <span className='nm'>{pl?.Name}</span>
                      {on && <span className='tt-block-badge'>ON BLOCK</span>}
                    </div>
                    <Button
                      size='small'
                      type={on ? 'default' : 'primary'}
                      loading={blockBusyId === String(pl?._id)}
                      onClick={() => handleToggleBlock(pl?._id, !on)}
                    >
                      {on ? 'Remove' : 'Add to Block'}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* League-wide on-block browser */}
        <div className='tt-block-sec'>
          <h6 className='tt-block-h'>On The Block — League Wide ({blockPlayers.length})</h6>
          <div className='tt-block-list'>
            {blockPlayers.length === 0 ? (
              <div className='tt-feed-empty'>No players on the block right now.</div>
            ) : (
              blockPlayers.map((p) => (
                <div key={String(p.playerId)} className='tt-block-row'>
                  <div className='tt-block-pl'>
                    {p.headshot ? (
                      <img src={p.headshot} alt='' className='tt-feed-logo' />
                    ) : null}
                    <span className='tt-pos'>{mapPos(p.position)}</span>
                    <span className='nm'>{p.name}</span>
                  </div>
                  <span className='tt-block-team'>{p.teamName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ── Trade Settings modal ── */}
      <Modal
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        footer={null}
        centered
        width={480}
        className='tt-confirm'
        title={<span><SettingOutlined /> Trade Settings</span>}
      >
        <div className='tt-settings'>
          <div className='tt-setting-row'>
            <div className='tt-setting-tx'>
              <span className='t'>Trade Notifications</span>
              <span className='d'>Get notified about new offers and updates.</span>
            </div>
            <Switch
              checked={tradePrefs.tradeNotifications}
              loading={prefsSaving}
              onChange={(v) => savePref({ tradeNotifications: v })}
            />
          </div>
          <div className='tt-setting-row'>
            <div className='tt-setting-tx'>
              <span className='t'>Auto-Reject Expired Offers</span>
              <span className='d'>Automatically decline offers past their expiration.</span>
            </div>
            <Switch
              checked={tradePrefs.autoRejectExpired}
              loading={prefsSaving}
              onChange={(v) => savePref({ autoRejectExpired: v })}
            />
          </div>
          <div className='tt-setting-row'>
            <div className='tt-setting-tx'>
              <span className='t'>Open To Trades</span>
              <span className='d'>Show other GMs you are available to trade.</span>
            </div>
            <Switch
              checked={tradePrefs.available}
              loading={prefsSaving}
              onChange={(v) => savePref({ available: v })}
            />
          </div>

          {/* ── Trade Deadline — commissioner-configurable (read-only otherwise) ── */}
          <div className='tt-setting-row'>
            <div className='tt-setting-tx'>
              <span className='t'>Trade Deadline</span>
              <span className='d'>
                {isCommissioner
                  ? `Set the date after which trades lock. Clear to use the Week ${DEFAULT_TRADE_DEADLINE_WEEK} default.`
                  : currentLeague?.tradeDeadline
                  ? `Trades lock on ${new Date(currentLeague.tradeDeadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}.`
                  : `Default: end of Week ${DEFAULT_TRADE_DEADLINE_WEEK}.`}
              </span>
            </div>
            {isCommissioner ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <DatePicker
                  value={deadlineDraft}
                  onChange={setDeadlineDraft}
                  placeholder={`Week ${DEFAULT_TRADE_DEADLINE_WEEK} default`}
                  allowClear
                />
                <Button size='small' type='primary' loading={deadlineSaving} onClick={saveTradeDeadline}>
                  Save
                </Button>
              </div>
            ) : (
              <span style={{ fontWeight: 700, color: '#c7ccd6' }}>
                {currentLeague?.tradeDeadline
                  ? new Date(currentLeague.tradeDeadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : `Week ${DEFAULT_TRADE_DEADLINE_WEEK}`}
              </span>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Trade Rules Book — read-only rules surfaced from the League Rules cards ── */}
      <TradeRulesBook
        open={rulesBookOpen}
        onClose={() => setRulesBookOpen(false)}
        currentLeague={currentLeague}
        tradeWindow={tradeWindow}
        defaultWeek={DEFAULT_TRADE_DEADLINE_WEEK}
        isCommissioner={isCommissioner}
        blockCount={blockPlayers.length}
        onEditDeadline={() => {
          setRulesBookOpen(false)
          openSettings()
        }}
      />
    </section>
  )
}

export default NewTrade
