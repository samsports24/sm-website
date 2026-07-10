import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { IoMdArrowDropdown } from 'react-icons/io'
import { Button, Select, Spin, Input, notification } from 'antd'
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
import Loader from '../../components/Loader'
import StadiumModal from '../../components/modal/StadiumModal'
import StadiumImage from '../../components/StadiumImage'
import { isValidStadiumImage, extractLevelNumber } from '../../utils/stadiumImageUtils'
import { privateAPI, attachToken } from '../../config/constants'
import OnboardingGuide from '../../components/OnboardingGuide'

/* ═══════════════════════════════════════════════════════════════
   NFL STADIUM – SamPoints Economy

   Key economics:
   - 60,000 seats × 85 SP/seat = 5,100,000 SP weekly pot
   - 90% → Home Owner revenue
   - 10% → Away Team share
   - Win: +3% attendance | Loss: -3% attendance
   - Daily login (Sun-Wed): +1.5% attendance per login
   - Minimum attendance floor: 49%
   - Upgrades increase capacity up to 80,000 seats
   ═══════════════════════════════════════════════════════════════ */

const ACCENT = '#22C55E'
const ACCENT_DARK = '#16A34A'
const SP_ICON_IMG = (cls = 'stm-sp-icon-sm') => (
  <img className={cls} src={sampointslogo} alt="SP" style={{ width: cls === 'stm-sp-icon-xs' ? 14 : 18, height: cls === 'stm-sp-icon-xs' ? 14 : 18, marginRight: 4, verticalAlign: 'middle' }} />
)

const cardStyle = {
  background: 'rgba(20, 28, 45, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(110, 105, 128, 0.15)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
}

// Stadium level names
const STADIUM_NAMES = {
  1: 'Gridiron Park',
  2: 'Thunder Dome',
  3: 'Legends Arena',
  4: 'Empire Stadium',
  5: 'The Colosseum',
}

const getStadiumName = (level) => {
  const lvlNum = typeof level === 'string' ? parseInt(level.replace(/\D/g, ''), 10) : level
  return STADIUM_NAMES[lvlNum] || `Stadium Level ${lvlNum}`
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

  const formatNum = (val) => {
    if (!isNaN(val) && typeof val === 'number') {
      return new Intl.NumberFormat('en-US').format(Math.round(val))
    }
    return '—'
  }

  const customStadiumName = mystadiumlevel?.[0]?.stadiumName
  const stadiumName = customStadiumName || getStadiumName(maxMyStadiumLevel) || mystadiumlevel?.[0]?.teamId?.name || user?.team?.name || 'Stadium'
  const teamName = user?.team?.name || 'My Team'
  const season = user?.team?.currentLeague?.season || new Date().getFullYear()

  return (
    <>
      <Header />
      <OnboardingGuide tabKey="stadium" />
      {modalshow && <StadiumModal visible={modalshow} onClose={handleConfirm} />}
      {loading ? (
        <Loader />
      ) : (
        <div style={{
          background: '#0A0F1A',
          minHeight: '100vh',
          paddingBottom: '60px',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '40px 24px',
          }}>
            {/* ── Page Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}>
              <div>
                <h1 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <ThunderboltOutlined style={{ color: ACCENT }} />
                  Stadium
                </h1>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}>
                  {teamName} &bull; Season {season}
                </p>
              </div>
              {currentLeague && currentLeague?.teams && currentLeague.teams.length > 1 && (
                <Select
                  style={{
                    minWidth: 160,
                  }}
                  className="stadium-team-select"
                  allowClear
                  placeholder="View other team"
                  onChange={getteamstadium}
                  value={team}
                  suffixIcon={<IoMdArrowDropdown size={14} color="rgba(34,197,94,0.7)" />}
                  dropdownStyle={{
                    background: '#141C2D',
                    borderRadius: 10,
                    border: '1px solid rgba(34,197,94,0.15)',
                  }}
                  popupClassName="stadium-team-dropdown"
                >
                  {currentLeague.teams.map((t) => (
                    <Select.Option key={t._id} value={t._id}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </div>

            {/* ═══ TOP ROW: Stadium Card + Stats + Daily Login ═══ */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 300px',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {/* Stadium Card */}
              <div style={{
                ...cardStyle,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, rgba(20,28,45,0.8), rgba(34,197,94,0.06))`,
                border: `1px solid rgba(34,197,94,0.15)`,
              }}>
                {/* Stadium visual */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                }}>
                  <div style={{ marginBottom: '8px', maxHeight: 120, overflow: 'hidden', borderRadius: 10 }}>
                    {isValidStadiumImage(mystadiumlevel?.[0]?.stadiumlevel?.stadiumimg) ? (
                      <img
                        src={mystadiumlevel?.[0]?.stadiumlevel?.stadiumimg}
                        alt="stadium"
                        style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 10 }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <StadiumImage
                        level={maxMyStadiumLevel || 0}
                        style={{ borderRadius: 10, maxHeight: 120 }}
                      />
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                  }}>
                    Your Stadium
                  </div>
                  {isRenaming ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={30}
                        onPressEnter={handleRenameSave}
                        autoFocus
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: `1px solid ${ACCENT}`,
                          borderRadius: 8,
                          color: '#fff',
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '18px',
                          fontWeight: 700,
                          textAlign: 'center',
                          width: 200,
                        }}
                      />
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        loading={renameSaving}
                        onClick={handleRenameSave}
                        style={{ color: ACCENT, fontSize: 16 }}
                      />
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleRenameCancel}
                        style={{ color: '#EF4444', fontSize: 16 }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}>
                      <div style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#fff',
                      }}>
                        {stadiumName}
                      </div>
                      <EditOutlined
                        onClick={handleRenameStart}
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.color = ACCENT}
                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                      />
                    </div>
                  )}
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Rajdhani', sans-serif",
                    marginTop: 2,
                  }}>
                    Level {maxMyStadiumLevel || 1}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DetailRow
                    icon={<TeamOutlined style={{ color: ACCENT }} />}
                    label="Seating Capacity"
                    value={seatingCapacity.toLocaleString()}
                  />
                  <DetailRow
                    icon={<RiseOutlined style={{ color: ACCENT }} />}
                    label="Home Attendance"
                    value={`${homeAttendance}%`}
                    accent
                  />
                  <DetailRow
                    icon={<DollarOutlined style={{ color: ACCENT }} />}
                    label="Avg. Ticket Cost"
                    value={
                      <span style={{ color: ACCENT, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        {SP_ICON_IMG('stm-sp-icon-xs')} {ticketCost} SP
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Stats Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Weekly Ticket Sales */}
                <div style={cardStyle}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <DollarOutlined /> Weekly Ticket Sales
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: ACCENT,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {SP_ICON_IMG()} {formatNum(weeklyticketsale)} SP
                  </div>
                </div>

                {/* Home Owner Share */}
                <div style={cardStyle}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <TrophyOutlined /> Home Owner Share
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#4ADE80',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {SP_ICON_IMG()} {formatNum(weeklyHomeOwner)} SP
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'Inter', sans-serif",
                    marginTop: '4px',
                  }}>
                    90% of ticket sales
                  </div>
                </div>

                {/* Away Team Share */}
                <div style={cardStyle}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Rajdhani', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <ThunderboltOutlined /> Away Team Share
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#F59E0B',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {SP_ICON_IMG()} {formatNum(weeklyAwayShare)} SP
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'Inter', sans-serif",
                    marginTop: '4px',
                  }}>
                    10% of ticket sales
                  </div>
                </div>
              </div>

              {/* Daily Login Card */}
              <div style={cardStyle}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}>
                  <CalendarOutlined style={{ color: ACCENT }} />
                  <h3 style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                  }}>
                    Daily Login
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '16px',
                }}>
                  {daysToDisplay.map(([day, active], index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: active
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(0,0,0,0.15)',
                        border: active
                          ? '1px solid rgba(34,197,94,0.25)'
                          : '1px solid rgba(110,105,128,0.08)',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: active ? ACCENT : 'rgba(255,255,255,0.4)',
                      }}>
                        {day}
                      </span>
                      {active && (
                        <span style={{ color: ACCENT, fontSize: '16px', fontWeight: 800 }}>&#10003;</span>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  Log in Sun-Wed to boost attendance by +1.5% per day
                </p>
              </div>
            </div>

            {/* ═══ ATTENDANCE DYNAMICS ═══ */}
            <div style={{
              ...cardStyle,
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <RiseOutlined style={{ color: ACCENT }} />
                Attendance Dynamics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}>
                {[
                  { delta: '-3%', trigger: 'Per Loss', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
                  { delta: '+3%', trigger: 'Per Win', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
                  { delta: '+1.5%', trigger: 'Daily Login (Sun-Wed)', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
                  { delta: '49%', trigger: 'Minimum Floor', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                ].map((item) => (
                  <div key={item.trigger} style={{
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '24px',
                      fontWeight: 800,
                      color: item.color,
                      marginBottom: '4px',
                    }}>
                      {item.delta}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {item.trigger}
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Split Visualization */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(110,105,128,0.1)',
              }}>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                }}>
                  Weekly Revenue Split
                </div>
                {[
                  { label: 'Home Owner', pct: 90, color: '#22C55E' },
                  { label: 'Away Team', pct: 10, color: '#F59E0B' },
                ].map((split) => (
                  <div key={split.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.04)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${split.pct}%`,
                        borderRadius: '4px',
                        background: `linear-gradient(90deg, ${split.color}, ${split.color}88)`,
                      }} />
                    </div>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: split.color,
                      minWidth: '50px',
                      textAlign: 'right',
                    }}>
                      {split.pct}%
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      minWidth: '140px',
                    }}>
                      {split.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ STADIUM UPGRADES ═══ */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <ArrowUpOutlined style={{ color: ACCENT }} />
                  Stadium Upgrades
                </h2>
                <span style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}>
                  {sortedStadiums?.length || 0} available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedStadiums?.map((s, index) => {
                  const isAvailable = index === 0
                  const levelNum = extractLevelNumber(s?.level) || 0
                  return (
                    <div key={s._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: isAvailable ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.15)',
                      border: isAvailable ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(110,105,128,0.08)',
                      opacity: isAvailable ? 1 : 0.5,
                    }}>
                      {/* Stadium image thumbnail */}
                      <div style={{ width: 80, height: 50, marginRight: 16, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {isValidStadiumImage(s?.stadiumimg) ? (
                          <img
                            src={s?.stadiumimg}
                            alt="stadium upgrade"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <StadiumImage
                            level={levelNum}
                            style={{ borderRadius: 8 }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#fff',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          {getStadiumName(s?.level)}
                          <span style={{
                            fontSize: '11px',
                            color: 'rgba(34,197,94,0.6)',
                            fontWeight: 600,
                          }}>
                            {s?.level?.toUpperCase?.()}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          flexWrap: 'wrap',
                        }}>
                          {/* Capacity change */}
                          <div>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.4)',
                              textTransform: 'uppercase',
                              marginBottom: '2px',
                            }}>
                              Seating Capacity
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'line-through',
                              }}>
                                {s?.previousseatingCapacity?.toLocaleString()}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>&rarr;</span>
                              <span style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: '14px',
                                fontWeight: 700,
                                color: ACCENT,
                              }}>
                                {s?.newseatingCapacity?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {/* Ticket cost change */}
                          <div>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.4)',
                              textTransform: 'uppercase',
                              marginBottom: '2px',
                            }}>
                              Ticket Cost
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'line-through',
                              }}>
                                {SP_ICON_IMG('stm-sp-icon-xs')} {s?.previousticketCost} SP
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>&rarr;</span>
                              <span style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: '14px',
                                fontWeight: 700,
                                color: ACCENT,
                              }}>
                                {SP_ICON_IMG('stm-sp-icon-xs')} {s?.newticketCost} SP
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upgrade cost + button */}
                      <div style={{ textAlign: 'right', minWidth: '160px' }}>
                        <div style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}>
                          Upgrade Cost
                        </div>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '18px',
                          fontWeight: 800,
                          color: ACCENT,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}>
                          {SP_ICON_IMG()} {s?.upgradedCost?.toLocaleString()} SP
                        </div>
                        <Button
                          loading={upgradeLoading === s._id}
                          onClick={() => handlecreatestadium(s._id)}
                          disabled={!isAvailable}
                          style={{
                            background: isAvailable
                              ? `linear-gradient(135deg, ${ACCENT_DARK}, ${ACCENT})`
                              : 'rgba(255,255,255,0.04)',
                            border: 'none',
                            color: isAvailable ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontWeight: 800,
                            borderRadius: '8px',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: '13px',
                            height: '34px',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {isAvailable ? 'UPGRADE NOW' : 'LOCKED'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {(!sortedStadiums || sortedStadiums.length === 0) && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    <TrophyOutlined style={{ fontSize: 32, color: ACCENT, marginBottom: 12 }} />
                    <p style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      Your stadium is fully upgraded!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Detail Row Sub-Component ── */
const DetailRow = ({ icon, label, value, accent }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid rgba(110,105,128,0.08)',
  }}>
    <span style={{ fontSize: '16px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '16px',
        fontWeight: 700,
        color: accent ? '#22C55E' : '#fff',
      }}>
        {typeof value === 'string' ? value : value}
      </div>
    </div>
  </div>
)

export default Stadium
