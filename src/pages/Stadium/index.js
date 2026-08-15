import React, { useEffect, useState, useRef } from 'react'
import Header from '../../components/Header'
import { IoMdArrowDropdown } from 'react-icons/io'
import { Button, Select, Input, notification, Modal } from 'antd'
import sampointslogo from '../../assets/samcoinlogo.png'
import {
  ArrowUpOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  RiseOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { getLeagueDetails } from '../../redux'
import { useDispatch, useSelector } from 'react-redux'
import {
  createStadium,
  getallstadiumlevel,
  getstadium,
  setMystadium,
} from '../../redux/actions/stadium'
import StadiumModal from '../../components/modal/StadiumModal'
import StadiumImage from '../../components/StadiumImage'
import { isValidStadiumImage, extractLevelNumber } from '../../utils/stadiumImageUtils'
import { privateAPI, attachToken } from '../../config/constants'
import OnboardingGuide from '../../components/OnboardingGuide'
import gridiron from '../../assets/stadiums/gridiron-park.png'
import thunder from '../../assets/stadiums/thunder-dome.png'
import legends from '../../assets/stadiums/legends-arena.png'
import empire from '../../assets/stadiums/empire-stadium.png'
import colosseum from '../../assets/stadiums/colosseum.png'
import '../../styles/pages/stadium2.css'

/* ═══════════════════════════════════════════════════════════════
   STADIUM — SamPoints Economy (UI reskin over existing logic)

   Economics (surfaced in UI, computed from real stadium data):
   - 90% → Home Owner revenue | 10% → Away Team share
   - Win: +3% attendance | Loss: -3% attendance
   - Daily login (Sun-Wed): +1.5% attendance per login
   - Minimum attendance floor: 49%
   - Upgrades increase capacity up to 80,000 seats
   ═══════════════════════════════════════════════════════════════ */

// Stadium level names (level number → name)
const STADIUM_NAMES = {
  1: 'Gridiron Park',
  2: 'Thunder Dome',
  3: 'Legends Arena',
  4: 'Empire Stadium',
  5: 'The Colosseum',
}

// Staged renders (bundled by webpack) mapped by level number
const LEVEL_IMAGES = {
  1: gridiron,
  2: thunder,
  3: legends,
  4: empire,
  5: colosseum,
}

const getStadiumName = (level) => {
  const lvlNum = typeof level === 'string' ? parseInt(level.replace(/\D/g, ''), 10) : level
  return STADIUM_NAMES[lvlNum] || `Stadium Level ${lvlNum}`
}

const getLevelImage = (lvl) => LEVEL_IMAGES[lvl] || null

const formatInt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return new Intl.NumberFormat('en-US').format(Math.round(val))
}

/* ── SamPoints icon ── */
const SPIcon = ({ small }) => (
  <img className={`std-sp-ico${small ? ' sm' : ''}`} src={sampointslogo} alt="SP" />
)

/* ── Count-up hook + component (no deps) ── */
const useCountUp = (target, duration = 900) => {
  const [val, setVal] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    const start = Number(prev.current) || 0
    const end = Number(target) || 0
    if (start === end) {
      setVal(end)
      return undefined
    }
    let raf
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const tick = (now) => {
      const elapsed = now - t0
      const p = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(start + (end - start) * eased)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prev.current = end
      }
    }
    raf = requestAnimationFrame(tick)
    return () => raf && cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

const CountUp = ({ value, duration, format }) => {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0
  const animated = useCountUp(numeric, duration)
  if (!Number.isFinite(Number(value))) return <>—</>
  return <>{format ? format(animated) : Math.round(animated).toLocaleString()}</>
}

/* ── Decorative inline-SVG sparkline (illustrative trend, no historical
      data exists in the API, so bars are seeded from the current value
      and intentionally carry no numeric labels) ── */
const Sparkline = ({ seed = 1, color = '#24d26c', bars = 9 }) => {
  let s = (Math.abs(Math.floor(seed)) % 997) + 11
  const values = []
  for (let i = 0; i < bars; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const base = 0.35 + ((s >> 8) % 100) / 150
    values.push(Math.min(1, base * (0.65 + i / (bars * 1.5))))
  }
  const w = 100
  const h = 34
  const gap = 2
  const bw = (w - gap * (bars - 1)) / bars
  return (
    <svg className="std-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      {values.map((v, i) => {
        const bh = Math.max(2, v * (h - 2))
        const x = i * (bw + gap)
        const y = h - bh
        const op = 0.35 + (i / bars) * 0.6
        return (
          <rect key={i} x={x} y={y} width={bw} height={bh} rx="1.4" fill={color} opacity={op} />
        )
      })}
    </svg>
  )
}

/* ── Stadium visual (DB image → staged render → SVG fallback) ── */
const StadiumVisual = ({ dbImg, level, preferLevel }) => {
  const png = getLevelImage(level)
  // Upgrade cards/thumbnails prefer the bundled per-level render (always present,
  // transparent bg). Hero keeps the DB art first, falling back to the level render.
  if (preferLevel && png) {
    return <img src={png} alt="stadium" className="std-visual-img" />
  }
  if (isValidStadiumImage(dbImg)) {
    return <img src={dbImg} alt="stadium" className="std-visual-img" onError={(e) => { if (png) { e.target.src = png } else { e.target.style.display = 'none' } }} />
  }
  if (png) {
    return <img src={png} alt="stadium" className="std-visual-img" />
  }
  return <StadiumImage level={level || 0} />
}

/* ── Skeleton loader ── */
const StadiumSkeleton = () => (
  <div className="std-wrap">
    <div className="std-skel std-skel-line" style={{ width: 240, height: 30 }} />
    <div className="std-skel std-skel-line" style={{ width: 180 }} />
    <div className="std-overview" style={{ marginTop: 24 }}>
      <div className="std-card">
        <div className="std-skel std-skel-hero" />
        <div className="std-hero-stats" style={{ marginTop: 14 }}>
          <div className="std-skel std-skel-block" />
          <div className="std-skel std-skel-block" />
          <div className="std-skel std-skel-block" />
        </div>
      </div>
      <div className="std-metrics">
        <div className="std-skel std-skel-block" />
        <div className="std-skel std-skel-block" />
        <div className="std-skel std-skel-block" />
        <div className="std-skel std-skel-block" />
      </div>
    </div>
    <div className="std-card" style={{ marginTop: 24 }}>
      <div className="std-skel std-skel-row" />
      <div className="std-skel std-skel-row" />
      <div className="std-skel std-skel-row" />
    </div>
  </div>
)

/* ── Upgrade preview modal ── */
const UpgradePreviewModal = ({
  open,
  onCancel,
  onConfirm,
  loading,
  stadium,
  currentLevel,
  currentName,
  currentImg,
  currentCapacity,
  currentTicket,
  currentWeeklyHomeOwner,
  homeAttendance,
}) => {
  if (!stadium) return null

  const nextLevel = extractLevelNumber(stadium.level)
  const nextName = getStadiumName(stadium.level)
  const newCapacity = stadium?.newseatingCapacity ?? 0
  const newTicket = stadium?.newticketCost ?? 0
  const upgradeCost = stadium?.upgradedCost ?? 0

  const att = Number.isFinite(Number(homeAttendance)) ? Number(homeAttendance) : null
  const nextWeeklyTicket = att !== null ? (att * newCapacity * newTicket) / 100 : null
  const nextHomeOwner = nextWeeklyTicket !== null ? nextWeeklyTicket * 0.9 : null

  const pct = (from, to) => (from > 0 ? Math.round(((to - from) / from) * 100) : null)
  const deltaCell = (from, to, isSp) => {
    if (from === null || to === null || from === undefined || to === undefined) {
      return <span className="std-td-delta is-flat">—</span>
    }
    const diff = to - from
    const p = pct(from, to)
    return (
      <span className={`std-td-delta${diff === 0 ? ' is-flat' : ''}`}>
        {diff >= 0 ? '+' : ''}
        {isSp ? <SPIcon small /> : null}
        {formatInt(diff)}
        {p !== null ? ` (${p >= 0 ? '+' : ''}${p}%)` : ''}
      </span>
    )
  }

  // ROI (weeks) — derivable only when the extra Home Owner share is positive
  const weeklyGain =
    nextHomeOwner !== null && Number.isFinite(currentWeeklyHomeOwner)
      ? nextHomeOwner - currentWeeklyHomeOwner
      : null
  const roiWeeks = weeklyGain && weeklyGain > 0 ? Math.ceil(upgradeCost / weeklyGain) : null

  return (
    <Modal
      className="std-modal"
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={560}
      title=""
    >
      <div className="std-modal-inner">
        <h2 className="std-modal-title">Upgrade Preview</h2>
        <p className="std-modal-sub">Review the impact before you spend SamPoints.</p>

        <div className="std-modal-compare">
          <div className="std-compare-cell">
            <div className="std-compare-media">
              <StadiumVisual dbImg={currentImg} level={currentLevel} preferLevel />
            </div>
            <div className="std-compare-tag">Current · Lvl {currentLevel}</div>
            <div className="std-compare-name">{currentName}</div>
          </div>
          <div className="std-compare-arrow" aria-hidden="true">→</div>
          <div className="std-compare-cell">
            <div className="std-compare-media">
              <StadiumVisual dbImg={stadium?.stadiumimg} level={nextLevel} preferLevel />
            </div>
            <div className="std-compare-tag">Next · Lvl {nextLevel}</div>
            <div className="std-compare-name">{nextName}</div>
          </div>
        </div>

        <table className="std-modal-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Next</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Seating Capacity</td>
              <td>{formatInt(currentCapacity)}</td>
              <td><span className="std-td-new">{formatInt(newCapacity)}</span></td>
              <td>{deltaCell(currentCapacity, newCapacity)}</td>
            </tr>
            <tr>
              <td>Ticket Price</td>
              <td><SPIcon small /> {formatInt(currentTicket)}</td>
              <td><span className="std-td-new"><SPIcon small /> {formatInt(newTicket)}</span></td>
              <td>{deltaCell(currentTicket, newTicket, true)}</td>
            </tr>
            <tr>
              <td>Weekly Ticket Sales (Est.)</td>
              <td>{att !== null ? formatInt((att * currentCapacity * currentTicket) / 100) : '—'}</td>
              <td><span className="std-td-new">{nextWeeklyTicket !== null ? formatInt(nextWeeklyTicket) : '—'}</span></td>
              <td>{deltaCell(att !== null ? (att * currentCapacity * currentTicket) / 100 : null, nextWeeklyTicket, true)}</td>
            </tr>
            <tr>
              <td>Home Owner Share (90%)</td>
              <td>{Number.isFinite(currentWeeklyHomeOwner) ? formatInt(currentWeeklyHomeOwner) : '—'}</td>
              <td><span className="std-td-new">{nextHomeOwner !== null ? formatInt(nextHomeOwner) : '—'}</span></td>
              <td>{deltaCell(Number.isFinite(currentWeeklyHomeOwner) ? currentWeeklyHomeOwner : null, nextHomeOwner, true)}</td>
            </tr>
            <tr>
              <td>Upgrade Cost</td>
              <td>—</td>
              <td><span className="std-td-new" style={{ color: '#24d26c' }}><SPIcon small /> {formatInt(upgradeCost)}</span></td>
              <td><span className="std-td-delta is-flat">—</span></td>
            </tr>
          </tbody>
        </table>

        {roiWeeks !== null && (
          <div className="std-roi">
            <span className="std-roi-label">
              Estimated payback at current attendance ({att}%)
            </span>
            <span className="std-roi-value">~{roiWeeks} {roiWeeks === 1 ? 'week' : 'weeks'}</span>
          </div>
        )}

        <div className="std-modal-actions">
          <button type="button" className="std-btn is-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="std-btn is-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Upgrading…' : 'Confirm Upgrade'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const Stadium = () => {
  const { currentLeague } = useSelector((state) => state?.league)
  const user = useSelector((state) => state.user.userDetails)
  const allstadiumlevel = useSelector((state) => state?.stadium?.allstadium?.allstadiumlevel)
  const mystadiumlevel = useSelector((state) => state?.stadium?.mystadium)

  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [team, setTeam] = useState(null)
  const [modalshow, setModalshow] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [renameSaving, setRenameSaving] = useState(false)
  const [previewStadium, setPreviewStadium] = useState(null)

  const myleague = async () => {
    await getLeagueDetails()
  }

  const handleConfirm = async () => {
    setModalshow(false)
    localStorage.removeItem('modalShown')
  }

  useEffect(() => {
    const hasModalBeenShown = localStorage.getItem('modalShown')
    if (!hasModalBeenShown) {
      setModalshow(true)
      localStorage.setItem('modalShown', 'true')
    }
  }, [])

  const dayMapping = {
    day1: 'SUN',
    day2: 'MON',
    day3: 'TUE',
    day4: 'WED',
  }

  useEffect(() => {
    setLoading(true)
    myleague()
    getallstadiumlevel()
    setLoading(false)
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getstadium({
        season: user?.team?.currentLeague?.season,
        league: user?.team?.currentLeague._id,
        teamId: user?.team?._id,
      })
      if (data) {
        dispatch(setMystadium(data))
      }
      setLoading(false)
    }
    if (user) {
      fetchData()
    }
  }, [user])

  const getteamstadium = async (teamid) => {
    if (!teamid) return
    setLoading(true)
    setTeam(teamid)
    try {
      const data = await getstadium({
        season: user?.team?.currentLeague?.season,
        league: user?.team?.currentLeague._id,
        teamId: teamid,
      })
      if (data) {
        dispatch(setMystadium(data))
      }
    } catch (error) {
      console.error('Failed to fetch stadium data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxMyStadiumLevel = Math.max(
    ...mystadiumlevel
      .filter((item) => item.stadiumlevel)
      .map((item) => parseInt(item.stadiumlevel?.level.replace(/\D/g, ''), 10))
      .filter((level) => !isNaN(level)),
  )

  const filteredStadiums = allstadiumlevel?.filter((stadium) => {
    if (stadium.level === 'level0') return false
    const stadiumLevel = parseInt(stadium.level.replace(/\D/g, ''), 10)
    return !isNaN(stadiumLevel) && stadiumLevel > maxMyStadiumLevel
  })

  const sortedStadiums = filteredStadiums?.sort((a, b) => {
    const levelA = parseInt(a.level.replace(/\D/g, ''), 10)
    const levelB = parseInt(b.level.replace(/\D/g, ''), 10)
    return levelA - levelB
  })

  const handlecreatestadium = async (stadiumlevelId) => {
    setUpgradeLoading(stadiumlevelId)
    try {
      const payload = {
        league: user?.team?.currentLeague._id,
        user: user?._id,
        teamId: user?.team?._id,
        season: user?.team?.currentLeague?.season,
        stadiumlevel: stadiumlevelId,
      }
      await createStadium(payload)
    } catch (error) {
      console.error('Error upgrading stadium:', error)
    } finally {
      setUpgradeLoading(null)
    }
  }

  const handleConfirmUpgrade = async () => {
    if (!previewStadium) return
    await handlecreatestadium(previewStadium._id)
    setPreviewStadium(null)
  }

  // ── Rename handler ──
  const handleRenameStart = () => {
    const currentCustomName = mystadiumlevel?.[0]?.stadiumName || ''
    setRenameValue(currentCustomName || stadiumName)
    setIsRenaming(true)
  }

  const handleRenameSave = async () => {
    if (!renameValue.trim()) return
    setRenameSaving(true)
    try {
      attachToken()
      await privateAPI.post('/stadium/rename', {
        stadiumName: renameValue.trim(),
        league: user?.team?.currentLeague._id,
        teamId: user?.team?._id,
        season: user?.team?.currentLeague?.season,
      })
      // Re-fetch stadium data to reflect the new name
      const data = await getstadium({
        season: user?.team?.currentLeague?.season,
        league: user?.team?.currentLeague._id,
        teamId: user?.team?._id,
      })
      if (data) dispatch(setMystadium(data))
      notification.success({ message: 'Stadium renamed!', duration: 2 })
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Failed to rename stadium',
        duration: 3,
      })
    } finally {
      setRenameSaving(false)
      setIsRenaming(false)
    }
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setRenameValue('')
  }

  // Derive display values from Redux state
  const seatingCapacity = mystadiumlevel?.[0]?.stadiumlevel?.newseatingCapacity || 60000
  const ticketCost = mystadiumlevel?.[0]?.stadiumlevel?.newticketCost || 85
  const homeAttendance = mystadiumlevel?.[0]?.homeAttendance || 100

  let weeklyticketsale = (homeAttendance * seatingCapacity * ticketCost) / 100
  let weeklyHomeOwner = weeklyticketsale * 0.9
  let weeklyAwayShare = weeklyticketsale * 0.1

  const loginObject = mystadiumlevel?.[0]?.login
  const defaultDays = ['SUN', 'MON', 'TUE', 'WED']

  const daysToDisplay =
    loginObject && typeof loginObject === 'object'
      ? Object.entries(loginObject)
          .filter(([key]) => key !== '_id')
          .map(([key, value]) => [dayMapping[key] || key.toUpperCase(), value])
      : defaultDays.map((day) => [day, false])

  const customStadiumName = mystadiumlevel?.[0]?.stadiumName
  const stadiumName =
    customStadiumName ||
    getStadiumName(maxMyStadiumLevel) ||
    mystadiumlevel?.[0]?.teamId?.name ||
    user?.team?.name ||
    'Stadium'
  const teamName = user?.team?.name || 'My Team'
  const season = user?.team?.currentLeague?.season || new Date().getFullYear()

  // Safe display level (max can be -Infinity before data loads)
  const displayLevel = Number.isFinite(maxMyStadiumLevel) && maxMyStadiumLevel > 0 ? maxMyStadiumLevel : 1
  const currentDbImg = mystadiumlevel?.[0]?.stadiumlevel?.stadiumimg

  // Next upgradeable stadium (lowest level above what you own)
  const nextAvailableId = sortedStadiums?.[0]?._id

  // Full level ladder (all tiers) for the upgrade cards
  const allSorted = (allstadiumlevel || [])
    .filter((s) => s.level !== 'level0')
    .slice()
    .sort((a, b) => extractLevelNumber(a.level) - extractLevelNumber(b.level))

  // ── Daily-login derived values ──
  const weekDays = [
    ...daysToDisplay.map(([name, active]) => ({ name, active, real: true })),
    { name: 'THU', active: false, real: false },
    { name: 'FRI', active: false, real: false },
    { name: 'SAT', active: false, real: false },
  ]
  let loginStreak = 0
  for (let i = 0; i < daysToDisplay.length; i += 1) {
    if (daysToDisplay[i][1]) loginStreak += 1
    else break
  }
  // "Reset In" — derived from the documented weekly Sun-Wed cadence (no API field)
  const now = new Date()
  const dow = now.getDay() // 0 = Sunday
  let daysUntilReset = (7 - dow) % 7
  if (daysUntilReset === 0) daysUntilReset = 7
  const resetTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilReset)
  const msLeft = resetTarget.getTime() - now.getTime()
  const resetDays = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  const resetHours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const resetIn = `${resetDays}d ${resetHours}h`

  const teamSelect = currentLeague && currentLeague?.teams && currentLeague.teams.length > 1 && (
    <Select
      style={{ minWidth: 160 }}
      className="stadium-team-select"
      allowClear
      placeholder="View other team"
      onChange={getteamstadium}
      value={team}
      suffixIcon={<IoMdArrowDropdown size={14} color="rgba(36,210,108,0.7)" />}
      dropdownStyle={{
        background: '#141C2D',
        borderRadius: 10,
        border: '1px solid rgba(36,210,108,0.15)',
      }}
      popupClassName="stadium-team-dropdown"
    >
      {currentLeague.teams.map((t) => (
        <Select.Option key={t._id} value={t._id}>
          {t.name}
        </Select.Option>
      ))}
    </Select>
  )

  return (
    <>
      <Header />
      <OnboardingGuide tabKey="stadium" />
      {modalshow && <StadiumModal visible={modalshow} onClose={handleConfirm} />}

      <UpgradePreviewModal
        open={!!previewStadium}
        onCancel={() => setPreviewStadium(null)}
        onConfirm={handleConfirmUpgrade}
        loading={upgradeLoading === previewStadium?._id}
        stadium={previewStadium}
        currentLevel={displayLevel}
        currentName={stadiumName}
        currentImg={currentDbImg}
        currentCapacity={seatingCapacity}
        currentTicket={ticketCost}
        currentWeeklyHomeOwner={weeklyHomeOwner}
        homeAttendance={homeAttendance}
      />

      <div className="std-page">
        {loading ? (
          <StadiumSkeleton />
        ) : (
          <div className="std-wrap">
            {/* ── Page header ── */}
            <div className="std-header">
              <div>
                <h1 className="std-title">
                  <ThunderboltOutlined className="std-title-ico" />
                  Stadium
                </h1>
                <p className="std-subtitle">
                  {teamName} &bull; Season {season}
                </p>
              </div>
              <div className="std-header-actions">{teamSelect}</div>
            </div>

            {/* ═══ 1. STADIUM OVERVIEW ═══ */}
            <div className="std-overview std-section std-fade">
              {/* Hero */}
              <div className="std-hero">
                <div className="std-hero-media">
                  <StadiumVisual dbImg={currentDbImg} level={displayLevel} />
                  <div className="std-hero-overlay">
                    <div>
                      <div className="std-hero-level-label">Stadium Level: {getStadiumName(displayLevel)}</div>
                      {isRenaming ? (
                        <div className="std-rename-row">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            maxLength={30}
                            onPressEnter={handleRenameSave}
                            autoFocus
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid #24d26c',
                              borderRadius: 8,
                              color: '#fff',
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 18,
                              fontWeight: 700,
                              width: 200,
                            }}
                          />
                          <Button
                            type="text"
                            icon={<CheckOutlined />}
                            loading={renameSaving}
                            onClick={handleRenameSave}
                            aria-label="Save stadium name"
                            style={{ color: '#24d26c', fontSize: 16, minWidth: 44, minHeight: 44 }}
                          />
                          <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={handleRenameCancel}
                            aria-label="Cancel rename"
                            style={{ color: '#EF4444', fontSize: 16, minWidth: 44, minHeight: 44 }}
                          />
                        </div>
                      ) : (
                        <div className="std-hero-name">
                          {stadiumName}
                        </div>
                      )}
                    </div>
                    {!isRenaming && (
                      <button
                        type="button"
                        className="std-edit-btn"
                        onClick={handleRenameStart}
                        aria-label="Rename stadium"
                      >
                        <EditOutlined />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hero stat cards */}
                <div className="std-hero-stats">
                  <div className="std-stat">
                    <div className="std-stat-label"><TeamOutlined /> Seating Capacity</div>
                    <div className="std-stat-value">
                      <CountUp value={seatingCapacity} />
                    </div>
                  </div>
                  <div className="std-stat">
                    <div className="std-stat-label"><RiseOutlined /> Home Attendance</div>
                    <div className="std-stat-value is-green">
                      <CountUp value={homeAttendance} />%
                    </div>
                  </div>
                  <div className="std-stat">
                    <div className="std-stat-label"><DollarOutlined /> Avg Ticket Price</div>
                    <div className="std-stat-value is-green">
                      <SPIcon small /> <CountUp value={ticketCost} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="std-metrics">
                <div className="std-metric">
                  <div className="std-metric-label"><DollarOutlined /> Weekly Ticket Sales</div>
                  <div className="std-metric-value is-green">
                    <SPIcon /> <CountUp value={weeklyticketsale} />
                  </div>
                  <Sparkline seed={weeklyticketsale} color="#24d26c" />
                </div>

                <div className="std-metric">
                  <div className="std-metric-label"><TrophyOutlined /> Home Owner Share</div>
                  <div className="std-metric-value is-green">
                    <SPIcon /> <CountUp value={weeklyHomeOwner} />
                  </div>
                  <div className="std-metric-sub">90% of ticket sales</div>
                  <Sparkline seed={weeklyHomeOwner} color="#24d26c" />
                </div>

                <div className="std-metric">
                  <div className="std-metric-label"><ThunderboltOutlined /> Away Team Share</div>
                  <div className="std-metric-value is-orange">
                    <SPIcon /> <CountUp value={weeklyAwayShare} />
                  </div>
                  <div className="std-metric-sub">10% of ticket sales</div>
                  <Sparkline seed={weeklyAwayShare} color="#f97316" />
                </div>

                <div className="std-metric">
                  <div className="std-metric-label"><DollarOutlined /> Avg Ticket Price</div>
                  <div className="std-metric-value is-purple">
                    <SPIcon /> <CountUp value={ticketCost} />
                  </div>
                  <div className="std-metric-sub">Per seat, per game</div>
                  <Sparkline seed={ticketCost * 37} color="#8b5cf6" />
                </div>
              </div>
            </div>

            {/* ═══ 2. ATTENDANCE DYNAMICS ═══ */}
            <div className="std-card std-section std-fade">
              <div className="std-section-head">
                <h2 className="std-section-title">
                  <RiseOutlined className="std-sec-ico" /> Attendance Dynamics
                </h2>
              </div>

              <div className="std-pills">
                {[
                  { delta: '-3%', trigger: 'Per Loss', cls: 'is-red' },
                  { delta: '+3%', trigger: 'Per Win', cls: 'is-green' },
                  { delta: '+1.5%', trigger: 'Daily Login (Sun-Wed)', cls: 'is-blue' },
                  { delta: '49%', trigger: 'Minimum Floor', cls: 'is-orange' },
                ].map((item) => (
                  <div key={item.trigger} className={`std-pill ${item.cls}`}>
                    <div className="std-pill-value">{item.delta}</div>
                    <div className="std-pill-label">{item.trigger}</div>
                  </div>
                ))}
              </div>

              <div className="std-dyn-grid">
                {/* Weekly revenue split */}
                <div className="std-subcard">
                  <div className="std-subcard-title">Weekly Revenue Split</div>
                  <div className="std-split-row">
                    <div className="std-split-track">
                      <div className="std-split-fill is-green" style={{ width: '90%' }} />
                    </div>
                    <span className="std-split-pct is-green">90%</span>
                    <span className="std-split-name">Home Owner</span>
                  </div>
                  <div className="std-split-row">
                    <div className="std-split-track">
                      <div className="std-split-fill is-orange" style={{ width: '10%' }} />
                    </div>
                    <span className="std-split-pct is-orange">10%</span>
                    <span className="std-split-name">Away Team</span>
                  </div>
                  <p className="std-login-hint">
                    Home Owner earns <SPIcon small /> {formatInt(weeklyHomeOwner)} SP · Away Team earns{' '}
                    <SPIcon small /> {formatInt(weeklyAwayShare)} SP this week.
                  </p>
                </div>

                {/* Daily login */}
                <div className="std-subcard">
                  <div className="std-subcard-title">
                    <CalendarOutlined /> Daily Login
                  </div>
                  <div className="std-login-days">
                    {weekDays.map((d, i) => {
                      const done = d.real && d.active
                      const inactive = !d.real
                      const upcoming = d.real && !d.active
                      return (
                        <div
                          key={i}
                          className={`std-day${done ? ' is-done' : ''}${inactive ? ' is-inactive' : ''}`}
                        >
                          <div className="std-day-name">{d.name}</div>
                          <div className={`std-day-mark${upcoming ? ' is-plus' : ''}`}>
                            {done ? '✓' : inactive ? '–' : '+'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="std-login-meta">
                    <div className="std-login-stat">
                      <div className="std-login-stat-label">Current Streak</div>
                      <div className="std-login-stat-value">{loginStreak} {loginStreak === 1 ? 'Day' : 'Days'}</div>
                    </div>
                    <div className="std-login-stat">
                      <div className="std-login-stat-label">Next Reward</div>
                      <div className="std-login-stat-value">+{(Math.max(0, 4 - loginStreak) * 1.5 || 6).toFixed(0)}% Attendance</div>
                    </div>
                    <div className="std-login-stat">
                      <div className="std-login-stat-label">Reset In</div>
                      <div className="std-login-stat-value">{resetIn}</div>
                    </div>
                  </div>
                  <p className="std-login-hint">
                    Log in Sun–Wed to boost attendance by +1.5% per day.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ 3. STADIUM UPGRADES ═══ */}
            <div className="std-card std-section std-fade">
              <div className="std-section-head">
                <h2 className="std-section-title">
                  <ArrowUpOutlined className="std-sec-ico" /> Stadium Upgrades
                </h2>
                <span className="std-pill-count">{sortedStadiums?.length || 0} available</span>
              </div>

              <div className="std-upgrades">
                {allSorted.map((s) => {
                  const levelNum = extractLevelNumber(s?.level) || 0
                  const owned = Number.isFinite(maxMyStadiumLevel) && levelNum <= maxMyStadiumLevel
                  const isCurrent = Number.isFinite(maxMyStadiumLevel) && levelNum === maxMyStadiumLevel
                  const isAvailable = s._id === nextAvailableId
                  const isLocked = !owned && !isAvailable

                  let cardCls = 'std-upcard'
                  if (isCurrent) cardCls += ' is-current'
                  else if (isAvailable) cardCls += ' is-available'
                  else if (isLocked) cardCls += ' is-locked'

                  return (
                    <div key={s._id} className={cardCls}>
                      <div className="std-upcard-thumb">
                        <StadiumVisual dbImg={s?.stadiumimg} level={levelNum} preferLevel />
                      </div>

                      <div className="std-upcard-body">
                        <div className="std-upcard-head">
                          <span className="std-upcard-name">{getStadiumName(s?.level)}</span>
                          <span className="std-badge is-level">{s?.level?.toUpperCase?.()}</span>
                          {isCurrent && <span className="std-badge is-current">Current Stadium</span>}
                          {owned && !isCurrent && <span className="std-badge is-owned">Owned</span>}
                        </div>

                        <div className="std-upcard-stats">
                          <div className="std-mini">
                            <div className="std-mini-label">Seating Capacity</div>
                            <div className="std-mini-diff">
                              <span className="std-mini-old">{s?.previousseatingCapacity?.toLocaleString?.()}</span>
                              <span className="std-mini-arrow">→</span>
                              <span className="std-mini-new">{s?.newseatingCapacity?.toLocaleString?.()}</span>
                            </div>
                          </div>
                          <div className="std-mini">
                            <div className="std-mini-label">Ticket Price</div>
                            <div className="std-mini-diff">
                              <span className="std-mini-old"><SPIcon small /> {s?.previousticketCost}</span>
                              <span className="std-mini-arrow">→</span>
                              <span className="std-mini-new"><SPIcon small /> {s?.newticketCost}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="std-upcard-action">
                        <div className="std-cost-label">Upgrade Cost</div>
                        <div className="std-cost-value">
                          <SPIcon /> {s?.upgradedCost?.toLocaleString?.()}
                        </div>
                        {isAvailable ? (
                          <button
                            type="button"
                            className="std-btn is-primary"
                            onClick={() => setPreviewStadium(s)}
                            disabled={upgradeLoading === s._id}
                          >
                            {upgradeLoading === s._id ? 'Upgrading…' : 'Upgrade Now'}
                          </button>
                        ) : owned ? (
                          <button type="button" className="std-btn is-owned" disabled>
                            {isCurrent ? 'Current' : 'Owned'}
                          </button>
                        ) : (
                          <button type="button" className="std-btn is-locked" disabled>
                            Locked
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {allSorted.length === 0 && (
                  <div className="std-empty">
                    <TrophyOutlined className="std-empty-ico" />
                    <p>Your stadium is fully upgraded!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Stadium
