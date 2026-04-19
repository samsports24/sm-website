import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notification, Modal, Spin } from 'antd'
import {
  EditOutlined,
  LogoutOutlined,
  CheckOutlined,
  CloseOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
  SettingOutlined,
  TeamOutlined,
  SafetyOutlined,
  GlobalOutlined,
  BellOutlined,
  MailOutlined,
  HeartOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getUser } from '../redux/actions/authActions'
import { selectLeague } from '../redux/actions/leagueActions'
import { attachToken, privateAPI } from '../config/constants'
import '../styles/pages/EditProfile.css'

const TIMEZONE_OPTIONS = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'GMT (Greenwich Mean Time)', value: 'GMT' },
  { label: 'EST (Eastern Standard Time)', value: 'EST' },
  { label: 'CST (Central Standard Time)', value: 'CST' },
  { label: 'MST (Mountain Standard Time)', value: 'MST' },
  { label: 'PST (Pacific Standard Time)', value: 'PST' },
  { label: 'CET (Central European Time)', value: 'CET' },
  { label: 'EET (Eastern European Time)', value: 'EET' },
  { label: 'IST (India Standard Time)', value: 'IST' },
  { label: 'JST (Japan Standard Time)', value: 'JST' },
  { label: 'AEST (Australian Eastern)', value: 'AEST' },
]

const EditProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.user?.userDetails)
  const walletData = useSelector((state) => state.user?.SamPoints)
  const availableSP = (walletData?.SamPoints || 0) + (walletData?.preAuctionPoints || 0)
  const earnedSP = walletData?.earnedSamPoints || 0
  const record = useSelector((state) => state.user?.record)

  const [loading, setLoading] = useState(true)
  const [teamsLoaded, setTeamsLoaded] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState(null)
  const [editingTeamName, setEditingTeamName] = useState('')
  const [savingTeamName, setSavingTeamName] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    samPoints: 0,
    samPointsHistory: [],
    myTeams: [],
    stats: { totalFantasyPoints: 0, bestMatchweek: 0, winRate: 0, totalMatches: 0 },
    settings: {
      notifications: true,
      emailNotifications: true,
      timezone: 'UTC',
      favoriteClub: '',
      receivePromo: false,
    },
  })

  // Sync Redux data
  useEffect(() => {
    if (user || walletData) {
      setProfileData((prev) => ({
        ...prev,
        username: user?.username || user?.userName || user?.name || prev.username,
        email: user?.email || prev.email,
        avatar: user?.profileImage || user?.avatar || prev.avatar,
        samPoints: availableSP,
        stats: {
          totalFantasyPoints: record?.totalFantasyPoints || user?.totalFantasyPoints || 0,
          bestMatchweek: record?.bestMatchweek || user?.bestMatchweek || 0,
          winRate: record?.winRate || user?.winRate || 0,
          totalMatches: record?.totalMatches || (record ? (record.wins || 0) + (record.losses || 0) + (record.draws || 0) : 0),
        },
      }))
    }
  }, [user, walletData, availableSP, record])

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        attachToken()
        const res = await privateAPI.get('/team/my-teams')
        const raw = res?.data?.data || res?.data || []
        const arr = Array.isArray(raw) ? raw : []
        const teams = arr.map((t, i) => ({
          id: t._id || t.id || i,
          name: t.name || t.teamName || 'My Team',
          leagueId: t.leagueId || t.currentLeague?._id || t.currentLeague || null,
          leagueName: t.leagueName || t.league?.name || t.currentLeague?.name || 'League',
          sport: t.sport || 'A.Football',
          sportColor: t.sportColor || '#22C55E',
          ranking: t.position || t.ranking || 0,
          fantasyPoints: t.fantasyPoints || t.totalPoints || 0,
          record: `${t.wins || 0}W-${t.losses || 0}L`,
        }))
        setProfileData((prev) => ({ ...prev, myTeams: teams }))
      } catch (err) {
        console.warn('[Profile] Could not fetch teams:', err?.message)
      }
      setTeamsLoaded(true)
      setLoading(false)
    }
    fetchTeams()
  }, [])

  // Update local state only — no auto-save
  const handleSettingChangeLocal = useCallback((key, value) => {
    setProfileData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }))
  }, [])

  // Save all settings to backend at once
  const handleSaveSettings = useCallback(async () => {
    try {
      setSavingSettings(true)
      attachToken()
      await privateAPI.put('/user/update-settings', profileData.settings)
      notification.success({ message: 'Settings saved!', duration: 2 })
    } catch {
      notification.error({ message: 'Failed to save settings', duration: 3 })
    } finally {
      setSavingSettings(false)
    }
  }, [profileData.settings])

  const handleGoToTeam = (team) => {
    if (!team.leagueId) return
    selectLeague({ leagueId: team.leagueId }, navigate)
  }

  const handleSaveTeamName = async (teamId) => {
    const trimmed = editingTeamName.trim()
    if (!trimmed) return notification.error({ message: 'Team name cannot be empty' })
    try {
      setSavingTeamName(true)
      attachToken()
      await privateAPI.post('/team/update', { name: trimmed, teamId })
      setProfileData((prev) => ({
        ...prev,
        myTeams: prev.myTeams.map((t) => t.id === teamId ? { ...t, name: trimmed } : t),
      }))
      setEditingTeamId(null)
      dispatch(getUser())
      notification.success({ message: 'Team name updated!' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to update team name' })
    } finally { setSavingTeamName(false) }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return notification.error({ message: 'Image must be under 5MB' })
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) return
    try {
      attachToken()
      const formData = new FormData()
      formData.append('pictures', avatarFile)
      formData.append('userName', profileData.username)
      await privateAPI.post('/user/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfileData((prev) => ({ ...prev, avatar: avatarPreview }))
      setAvatarFile(null)
      dispatch(getUser())
      notification.success({ message: 'Avatar updated!' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to update avatar' })
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new) return notification.error({ message: 'Enter current and new password' })
    if (passwords.new !== passwords.confirm) return notification.error({ message: 'New passwords do not match' })
    if (passwords.new.length < 6) return notification.error({ message: 'Password must be at least 6 characters' })
    try {
      setSavingPassword(true)
      attachToken()
      await privateAPI.post('/user/update', { currentPassword: passwords.current, newPassword: passwords.new })
      notification.success({ message: 'Password updated successfully!' })
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Failed to update password' })
    } finally { setSavingPassword(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('week')
    localStorage.removeItem('leagueroom')
    localStorage.removeItem('roomId')
    // Clear stale league/invitation data so next login starts fresh
    ;['AssignLeague','paid','myinvitationtype','selectedGame','imagePath',
      'lrTeamId','modalShown','email','onboardingComplete','selectedSports','authToken'].forEach(k => localStorage.removeItem(k))
    setLogoutModal(false)
    navigate('/homepage')
  }

  if (loading) {
    return (
      <div className="pf-loading">
        <Spin size="large" />
      </div>
    )
  }

  const initials = (profileData.username || 'U').substring(0, 2).toUpperCase()

  return (
    <div className="pf-page">
      <Header />
      <div className="pf-container">

        {/* ═══════════ HERO HEADER ═══════════ */}
        <div className="pf-hero">
          <div className="pf-hero-bg" />
          <div className="pf-hero-content">
            <div className="pf-avatar-wrap">
              {(avatarPreview || profileData.avatar) ? (
                <img src={avatarPreview || profileData.avatar} alt="" className="pf-avatar-img" />
              ) : (
                <div className="pf-avatar-initials">{initials}</div>
              )}
              <div className="pf-avatar-ring" />
              <label htmlFor="avatar-upload-nfl" className="pf-avatar-camera">
                <CameraOutlined />
              </label>
              <input id="avatar-upload-nfl" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              {avatarFile && (
                <button className="pf-avatar-save" onClick={handleSaveAvatar}>Save</button>
              )}
            </div>
            <div className="pf-hero-info">
              <h1 className="pf-username">{profileData.username}</h1>
              <p className="pf-email">{profileData.email}</p>
              <div className="pf-hero-badges">
                <span className="pf-badge pf-badge-green">
                  <CrownOutlined /> Active Member
                </span>
                {teamsLoaded && profileData.myTeams.length > 0 && (
                  <span className="pf-badge pf-badge-blue">
                    {profileData.myTeams.length} Team{profileData.myTeams.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="pf-hero-actions">
              <button className="pf-btn pf-btn-ghost" onClick={() => setLogoutModal(true)}>
                <LogoutOutlined /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════ STATS BAR ═══════════ */}
        <div className="pf-stats-bar">
          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-stat-icon-green"><ThunderboltOutlined /></div>
            <div className="pf-stat-info">
              <span className="pf-stat-value">{profileData.samPoints.toLocaleString()}</span>
              <span className="pf-stat-label">SAM Points</span>
            </div>
          </div>
          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-stat-icon-gold"><TrophyOutlined /></div>
            <div className="pf-stat-info">
              <span className="pf-stat-value">{profileData.stats.totalFantasyPoints}</span>
              <span className="pf-stat-label">Fantasy Points</span>
            </div>
          </div>
          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-stat-icon-red"><FireOutlined /></div>
            <div className="pf-stat-info">
              <span className="pf-stat-value">{profileData.stats.bestMatchweek}</span>
              <span className="pf-stat-label">Best Week</span>
            </div>
          </div>
          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-stat-icon-blue"><TeamOutlined /></div>
            <div className="pf-stat-info">
              <span className="pf-stat-value">{profileData.stats.totalMatches}</span>
              <span className="pf-stat-label">Total Matches</span>
            </div>
          </div>
        </div>

        {/* ═══════════ MAIN GRID ═══════════ */}
        <div className="pf-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="pf-col-left">
            <section className="pf-card">
              <div className="pf-card-header">
                <TeamOutlined className="pf-card-header-icon" />
                <h2 className="pf-card-title">My Teams</h2>
              </div>
              <div className="pf-teams-list">
                {profileData.myTeams.length === 0 ? (
                  <div className="pf-empty">No teams yet. Join a league to get started!</div>
                ) : profileData.myTeams.map((team) => (
                  <div key={team.id} className="pf-team-row">
                    <div className="pf-team-left">
                      <div className="pf-team-emblem" style={{ borderColor: `${team.sportColor}30` }}>
                        <TeamOutlined style={{ color: team.sportColor }} />
                      </div>
                      <div className="pf-team-details">
                        {editingTeamId === team.id ? (
                          <div className="pf-team-edit-row">
                            <input
                              className="pf-inline-input"
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveTeamName(team.id)}
                              autoFocus
                              maxLength={30}
                            />
                            <button className="pf-icon-btn pf-icon-btn-green" onClick={() => handleSaveTeamName(team.id)} disabled={savingTeamName}>
                              <CheckOutlined />
                            </button>
                            <button className="pf-icon-btn" onClick={() => setEditingTeamId(null)}>
                              <CloseOutlined />
                            </button>
                          </div>
                        ) : (
                          <div className="pf-team-name-row">
                            <span className="pf-team-name pf-team-name-link" onClick={() => handleGoToTeam(team)}>{team.name}</span>
                            <EditOutlined
                              className="pf-team-edit-icon"
                              onClick={(e) => { e.stopPropagation(); setEditingTeamId(team.id); setEditingTeamName(team.name) }}
                            />
                          </div>
                        )}
                        <span className="pf-team-league">
                          <span className="pf-sport-tag" style={{ color: team.sportColor, borderColor: `${team.sportColor}40`, background: `${team.sportColor}10` }}>
                            {team.sport}
                          </span>
                          {team.leagueName}
                        </span>
                      </div>
                    </div>
                    <div className="pf-team-stats">
                      <div className="pf-team-stat">
                        <span className="pf-team-stat-val">#{team.ranking || '—'}</span>
                        <span className="pf-team-stat-lbl">Rank</span>
                      </div>
                      <div className="pf-team-stat">
                        <span className="pf-team-stat-val">{team.record}</span>
                        <span className="pf-team-stat-lbl">Record</span>
                      </div>
                      <div className="pf-team-stat">
                        <span className="pf-team-stat-val">{team.fantasyPoints}</span>
                        <span className="pf-team-stat-lbl">FPts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="pf-col-right">
            {/* SETTINGS */}
            <section className="pf-card">
              <div className="pf-card-header">
                <SettingOutlined className="pf-card-header-icon" />
                <h2 className="pf-card-title">Settings</h2>
              </div>

              <div className="pf-setting-row">
                <div className="pf-setting-left">
                  <GlobalOutlined className="pf-setting-icon" />
                  <span className="pf-setting-label">Timezone</span>
                </div>
                <select
                  className="pf-select"
                  value={profileData.settings.timezone}
                  onChange={(e) => handleSettingChangeLocal('timezone', e.target.value)}
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.value}</option>
                  ))}
                </select>
              </div>

              <div className="pf-setting-row">
                <div className="pf-setting-left">
                  <HeartOutlined className="pf-setting-icon" />
                  <span className="pf-setting-label">Favorite Team</span>
                </div>
                <input
                  className="pf-club-input"
                  type="text"
                  placeholder="Type your team..."
                  value={profileData.settings.favoriteClub}
                  onChange={(e) => handleSettingChangeLocal('favoriteClub', e.target.value)}
                />
              </div>

              <div className="pf-setting-divider" />

              <div className="pf-setting-row">
                <div className="pf-setting-left">
                  <BellOutlined className="pf-setting-icon" />
                  <div className="pf-setting-text">
                    <span className="pf-setting-label">Push Notifications</span>
                    <span className="pf-setting-desc">Draft alerts, match reminders</span>
                  </div>
                </div>
                <button
                  className={`pf-toggle ${profileData.settings.notifications ? 'pf-toggle-on' : ''}`}
                  onClick={() => handleSettingChangeLocal('notifications', !profileData.settings.notifications)}
                >
                  <span className="pf-toggle-thumb" />
                </button>
              </div>

              <div className="pf-setting-row">
                <div className="pf-setting-left">
                  <MailOutlined className="pf-setting-icon" />
                  <div className="pf-setting-text">
                    <span className="pf-setting-label">Email Notifications</span>
                    <span className="pf-setting-desc">Weekly summaries, trade offers</span>
                  </div>
                </div>
                <button
                  className={`pf-toggle ${profileData.settings.emailNotifications ? 'pf-toggle-on' : ''}`}
                  onClick={() => handleSettingChangeLocal('emailNotifications', !profileData.settings.emailNotifications)}
                >
                  <span className="pf-toggle-thumb" />
                </button>
              </div>

              <div className="pf-setting-row">
                <div className="pf-setting-left">
                  <MailOutlined className="pf-setting-icon" />
                  <div className="pf-setting-text">
                    <span className="pf-setting-label">Promotional Emails</span>
                    <span className="pf-setting-desc">New features, special offers</span>
                  </div>
                </div>
                <button
                  className={`pf-toggle ${profileData.settings.receivePromo ? 'pf-toggle-on' : ''}`}
                  onClick={() => handleSettingChangeLocal('receivePromo', !profileData.settings.receivePromo)}
                >
                  <span className="pf-toggle-thumb" />
                </button>
              </div>

              <div className="pf-setting-divider" />

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  style={{
                    background: savingSettings ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22C55E, #16A34A)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '10px 32px',
                    borderRadius: 8,
                    cursor: savingSettings ? 'not-allowed' : 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: '0.5px',
                  }}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </section>

            {/* SECURITY */}
            <section className="pf-card">
              <div className="pf-card-header">
                <SafetyOutlined className="pf-card-header-icon" />
                <h2 className="pf-card-title">Security</h2>
              </div>
              <div className="pf-pw-fields">
                <div className="pf-pw-group">
                  <label className="pf-pw-label">Current Password</label>
                  <div className="pf-pw-input-wrap">
                    <input className="pf-pw-input" type={showCurrentPw ? 'text' : 'password'} placeholder="Enter current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                    <button className="pf-pw-toggle" onClick={() => setShowCurrentPw(!showCurrentPw)}>{showCurrentPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button>
                  </div>
                </div>
                <div className="pf-pw-group">
                  <label className="pf-pw-label">New Password</label>
                  <div className="pf-pw-input-wrap">
                    <input className="pf-pw-input" type={showNewPw ? 'text' : 'password'} placeholder="Enter new password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                    <button className="pf-pw-toggle" onClick={() => setShowNewPw(!showNewPw)}>{showNewPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button>
                  </div>
                </div>
                <div className="pf-pw-group">
                  <label className="pf-pw-label">Confirm Password</label>
                  <div className="pf-pw-input-wrap">
                    <input className="pf-pw-input" type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                    <button className="pf-pw-toggle" onClick={() => setShowConfirmPw(!showConfirmPw)}>{showConfirmPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button>
                  </div>
                </div>
                <button className="pf-btn pf-btn-green pf-btn-full" onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ═══════════ LOGOUT MODAL ═══════════ */}
      <Modal
        open={logoutModal}
        onCancel={() => setLogoutModal(false)}
        footer={null}
        width={400}
        centered
        styles={{
          content: { background: 'linear-gradient(145deg, #0C1222, #111827)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '20px', padding: '0', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' },
          mask: { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' },
        }}
        closable={false}
      >
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="pf-modal-icon-wrap pf-modal-icon-red"><LogoutOutlined /></div>
            <div>
              <div className="pf-modal-title">Logout</div>
              <div className="pf-modal-subtitle">End your current session</div>
            </div>
          </div>
          <p className="pf-modal-body">Are you sure you want to logout? You&apos;ll need to sign in again to access your teams.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="pf-btn pf-btn-ghost" onClick={() => setLogoutModal(false)}>Cancel</button>
            <button className="pf-btn pf-btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EditProfile
