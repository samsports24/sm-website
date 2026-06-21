import React, { useState, useEffect } from 'react'
import { Input, Button, notification, Tabs, Table, Tag, Spin, Select, Empty, Modal, Popconfirm, Switch } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  TrophyOutlined,
  BgColorsOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BarChartOutlined,
  UploadOutlined,
  CrownOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  LinkOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  FileTextOutlined,
  GiftOutlined,
  NotificationOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { publicAPI } from '../../config/constants'
import { QRCodeSVG } from 'qrcode.react'
import './partnerDashboard.css'

const PartnerDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Dashboard data
  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState({ users: [], pagination: {} })
  const [leagues, setLeagues] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Adverts
  const [adverts, setAdverts] = useState([])
  const [advertModal, setAdvertModal] = useState(false)
  const [advertForm, setAdvertForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'landing-banner' })

  // Support tickets
  const [tickets, setTickets] = useState([])
  const [ticketModal, setTicketModal] = useState(false)
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', priority: 'medium', category: 'general' })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  const token = localStorage.getItem('partnerToken')

  const partnerAPI = () => {
    const headers = { Authorization: `Bearer ${token || localStorage.getItem('partnerToken')}` }
    return {
      get: (url) => publicAPI.get(url, { headers }),
      put: (url, data) => publicAPI.put(url, data, { headers }),
      post: (url, data) => publicAPI.post(url, data, { headers }),
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('partnerToken')
    const savedPartner = localStorage.getItem('partnerData')
    if (savedToken && savedPartner) {
      setAuthenticated(true)
      setPartner(JSON.parse(savedPartner))
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadDashboard()
      loadUsers()
      loadLeagues()
    }
  }, [authenticated])

  // ── Auth ──
  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await publicAPI.post('/partner/login', loginForm)
      const { token: t, data } = res.data
      localStorage.setItem('partnerToken', t)
      localStorage.setItem('partnerData', JSON.stringify(data))
      setPartner(data)
      setAuthenticated(true)
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('partnerToken')
    localStorage.removeItem('partnerData')
    setAuthenticated(false)
    setPartner(null)
  }

  // ── Data Loading ──
  const loadDashboard = async () => {
    try {
      const res = await partnerAPI().get('/partner/dashboard')
      setDashboard(res.data?.data)
    } catch (err) {
      console.error('Dashboard load error:', err)
    }
  }

  const loadUsers = async (page = 1, search = '') => {
    try {
      const res = await partnerAPI().get(`/partner/users?page=${page}&limit=20&search=${search}`)
      setUsers(res.data?.data || { users: [], pagination: {} })
    } catch (err) {
      console.error('Users load error:', err)
    }
  }

  const loadLeagues = async () => {
    try {
      const res = await partnerAPI().get('/partner/leagues')
      setLeagues(res.data?.data || [])
    } catch (err) {
      console.error('Leagues load error:', err)
    }
  }

  // ── User Management ──
  const handleBlockUser = async (userId, block = true) => {
    try {
      await partnerAPI().post(`/partner/users/${userId}/${block ? 'block' : 'unblock'}`, {})
      notification.success({ message: block ? 'User blocked' : 'User unblocked' })
      loadUsers()
      loadDashboard()
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Action failed' })
    }
  }

  const handleRemoveUser = async (userId) => {
    try {
      await publicAPI.delete(`/partner/users/${userId}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('partnerToken')}` },
      })
      notification.success({ message: 'User removed from platform' })
      loadUsers()
      loadDashboard()
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to remove user' })
    }
  }

  // ── Adverts ──
  const loadAdverts = async () => {
    try {
      const res = await partnerAPI().get('/partner/adverts')
      setAdverts(res.data?.data || [])
    } catch (err) {
      console.error('Adverts load error:', err)
    }
  }

  const handleAddAdvert = async () => {
    if (!advertForm.imageUrl) {
      notification.error({ message: 'Image URL is required' })
      return
    }
    try {
      const res = await partnerAPI().post('/partner/adverts', advertForm)
      setAdverts(res.data?.data || [])
      setAdvertModal(false)
      setAdvertForm({ title: '', imageUrl: '', linkUrl: '', position: 'landing-banner' })
      notification.success({ message: 'Advert added!' })
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to add advert' })
    }
  }

  const handleToggleAdvert = async (index, active) => {
    try {
      const res = await partnerAPI().put(`/partner/adverts/${index}`, { active })
      setAdverts(res.data?.data || [])
    } catch (err) {
      notification.error({ message: 'Failed to update advert' })
    }
  }

  const handleDeleteAdvert = async (index) => {
    try {
      await publicAPI.delete(`/partner/adverts/${index}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('partnerToken')}` },
      })
      setAdverts((prev) => prev.filter((_, i) => i !== index))
      notification.success({ message: 'Advert removed' })
    } catch (err) {
      notification.error({ message: 'Failed to delete advert' })
    }
  }

  // ── Support Tickets ──
  const loadTickets = async () => {
    try {
      const res = await partnerAPI().get('/partner/tickets')
      setTickets(res.data?.data || [])
    } catch (err) {
      console.error('Tickets load error:', err)
    }
  }

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      notification.error({ message: 'Subject and message are required' })
      return
    }
    setSubmittingTicket(true)
    try {
      const res = await partnerAPI().post('/partner/tickets', ticketForm)
      notification.success({ message: res.data?.message || 'Ticket created!' })
      setTicketModal(false)
      setTicketForm({ subject: '', message: '', priority: 'medium', category: 'general' })
      loadTickets()
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to create ticket' })
    } finally {
      setSubmittingTicket(false)
    }
  }

  // ── Branding Update ──
  const [brandingForm, setBrandingForm] = useState(null)
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    if (partner?.branding) setBrandingForm({ ...partner.branding })
  }, [partner])

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      notification.error({ message: 'Please upload a PNG, JPG, WebP, GIF, or SVG image' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      notification.error({ message: 'Logo must be under 5MB' })
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('pictures', file)
      const tk = token || localStorage.getItem('partnerToken')
      const res = await publicAPI.post('/partner/upload-logo', formData, {
        headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'multipart/form-data' },
      })
      const logoUrl = res.data?.data?.url
      if (logoUrl) {
        setBrandingForm((f) => ({ ...f, logo: logoUrl }))
        // Save immediately
        await publicAPI.put('/partner/branding', { branding: { logo: logoUrl } }, {
          headers: { Authorization: `Bearer ${tk}` },
        })
        notification.success({ message: 'Logo uploaded!' })
        // Refresh partner data
        const profileRes = await publicAPI.get('/partner/profile', { headers: { Authorization: `Bearer ${tk}` } })
        const updated = profileRes.data?.data
        setPartner(updated)
        localStorage.setItem('partnerData', JSON.stringify(updated))
      }
    } catch (err) {
      notification.error({ message: 'Failed to upload logo' })
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    try {
      const tk = token || localStorage.getItem('partnerToken')
      await publicAPI.put('/partner/branding', { branding: { logo: '' } }, {
        headers: { Authorization: `Bearer ${tk}` },
      })
      setBrandingForm((f) => ({ ...f, logo: '' }))
      notification.success({ message: 'Logo removed' })
      const profileRes = await publicAPI.get('/partner/profile', { headers: { Authorization: `Bearer ${tk}` } })
      const updated = profileRes.data?.data
      setPartner(updated)
      localStorage.setItem('partnerData', JSON.stringify(updated))
    } catch (err) {
      notification.error({ message: 'Failed to remove logo' })
    }
  }

  const saveBranding = async () => {
    try {
      await partnerAPI().put('/partner/branding', { branding: brandingForm })
      notification.success({ message: 'Branding updated!' })
      // Refresh partner data
      const res = await partnerAPI().get('/partner/profile')
      const updated = res.data?.data
      setPartner(updated)
      localStorage.setItem('partnerData', JSON.stringify(updated))
    } catch (err) {
      notification.error({ message: 'Failed to update branding' })
    }
  }

  // ── Settings Update ──
  const [settingsForm, setSettingsForm] = useState(null)
  useEffect(() => {
    if (partner?.settings) setSettingsForm({ ...partner.settings })
  }, [partner])

  const saveSettings = async () => {
    try {
      const res = await partnerAPI().put('/partner/settings', { settings: settingsForm })
      // Update local partner state + localStorage so a refresh keeps the new values
      const updatedSettings = res.data?.data || settingsForm
      setPartner((prev) => {
        const updated = { ...prev, settings: { ...prev.settings, ...updatedSettings } }
        localStorage.setItem('partnerData', JSON.stringify(updated))
        return updated
      })
      notification.success({ message: 'Settings updated!' })
    } catch (err) {
      notification.error({ message: 'Failed to update settings' })
    }
  }

  // ── Rules & Regulations ──
  const [rulesForm, setRulesForm] = useState({
    termsOfService: '',
    privacyPolicy: '',
    houseRules: '',
    requireAcceptance: false,
  })
  useEffect(() => {
    if (partner?.rules) setRulesForm({ ...partner.rules })
  }, [partner])

  const saveRules = async () => {
    try {
      await partnerAPI().put('/partner/rules', { rules: rulesForm })
      notification.success({ message: 'Rules & Regulations saved!' })
    } catch (err) {
      notification.error({ message: 'Failed to save rules' })
    }
  }

  // ── Promo Codes ──
  const [promoCodes, setPromoCodes] = useState([])
  const [promoModal, setPromoModal] = useState(false)
  const [promoForm, setPromoForm] = useState({ code: '', type: 'bonus_sp', value: 100, maxUses: 50 })

  const loadPromoCodes = async () => {
    try {
      const res = await partnerAPI().get('/partner/promo-codes')
      setPromoCodes(res?.data?.data || [])
    } catch (err) {}
  }

  const createPromo = async () => {
    try {
      await partnerAPI().post('/partner/promo-codes', promoForm)
      notification.success({ message: 'Promo code created!' })
      setPromoModal(false)
      setPromoForm({ code: '', type: 'bonus_sp', value: 100, maxUses: 50 })
      loadPromoCodes()
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to create promo code' })
    }
  }

  const deletePromo = async (index) => {
    try {
      await partnerAPI().delete(`/partner/promo-codes/${index}`)
      notification.success({ message: 'Promo code deleted' })
      loadPromoCodes()
    } catch (err) {
      notification.error({ message: 'Failed to delete' })
    }
  }

  // ── Announcements ──
  const [announcements, setAnnouncements] = useState([])
  const [announceModal, setAnnounceModal] = useState(false)
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '', type: 'info' })

  const loadAnnouncements = async () => {
    try {
      const res = await partnerAPI().get('/partner/announcements')
      setAnnouncements(res?.data?.data || [])
    } catch (err) {}
  }

  const createAnnouncement = async () => {
    try {
      await partnerAPI().post('/partner/announcements', announceForm)
      notification.success({ message: 'Announcement posted!' })
      setAnnounceModal(false)
      setAnnounceForm({ title: '', message: '', type: 'info' })
      loadAnnouncements()
    } catch (err) {
      notification.error({ message: 'Failed to post announcement' })
    }
  }

  const deleteAnnouncement = async (index) => {
    try {
      await partnerAPI().delete(`/partner/announcements/${index}`)
      loadAnnouncements()
    } catch (err) {}
  }

  // ── Events ──
  const [events, setEvents] = useState([])
  const [eventModal, setEventModal] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', description: '', type: 'other', date: '' })

  const loadEvents = async () => {
    try {
      const res = await partnerAPI().get('/partner/events')
      setEvents(res?.data?.data || [])
    } catch (err) {}
  }

  const createEventItem = async () => {
    try {
      await partnerAPI().post('/partner/events', eventForm)
      notification.success({ message: 'Event created!' })
      setEventModal(false)
      setEventForm({ title: '', description: '', type: 'other', date: '' })
      loadEvents()
    } catch (err) {
      notification.error({ message: 'Failed to create event' })
    }
  }

  const deleteEventItem = async (index) => {
    try {
      await partnerAPI().delete(`/partner/events/${index}`)
      loadEvents()
    } catch (err) {}
  }

  // ── Login Page ──
  if (!authenticated) {
    return (
      <div className="pd-login-page">
        <div className="pd-login-box">
          <h1 className="pd-login-title">PARTNER DASHBOARD</h1>
          <p className="pd-login-subtitle">Manage your branded SamSports platform</p>
          <div className="pd-login-field">
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
              onPressEnter={handleLogin}
            />
          </div>
          <div className="pd-login-field">
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              onPressEnter={handleLogin}
            />
          </div>
          <Button
            type="primary"
            loading={loading}
            onClick={handleLogin}
            className="pd-login-btn"
            block
          >
            LOGIN
          </Button>
        </div>
      </div>
    )
  }

  // ── User table columns ──
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <div className="pd-user-cell">
          {record.image ? (
            <img src={record.image} alt="" className="pd-user-avatar" />
          ) : (
            <div className="pd-user-avatar-placeholder">
              <UserOutlined />
            </div>
          )}
          <div>
            <div className="pd-user-name">{name || record.name || 'Unknown'}</div>
            <div className="pd-user-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => d ? new Date(d).toLocaleDateString() : '-',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (d) => d ? new Date(d).toLocaleDateString() : 'Never',
    },
    {
      title: 'SAM Points',
      dataIndex: 'earnedSamPoints',
      key: 'earnedSamPoints',
      render: (v) => (v || 0).toLocaleString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.blockedByPartner ? 'red' : record.isActive !== false ? 'green' : 'orange'}>
          {record.blockedByPartner ? 'BLOCKED' : record.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {record.blockedByPartner ? (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleBlockUser(record._id, false)}
              style={{ fontSize: 11 }}
            >
              Unblock
            </Button>
          ) : (
            <Popconfirm
              title="Block this user?"
              description="They won't be able to access your platform"
              onConfirm={() => handleBlockUser(record._id, true)}
              okText="Block"
              cancelText="Cancel"
            >
              <Button size="small" icon={<StopOutlined />} danger style={{ fontSize: 11 }}>
                Block
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Remove this user?"
            description="They will be removed from all your leagues and unlinked from your platform"
            onConfirm={() => handleRemoveUser(record._id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" icon={<DeleteOutlined />} danger type="text" style={{ fontSize: 11 }}>
              Remove
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  const handleDeleteLeague = async (leagueId) => {
    try {
      await publicAPI.delete(`/partner/leagues/${leagueId}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('partnerToken')}` },
      })
      notification.success({ message: 'League deleted' })
      loadLeagues()
      loadDashboard()
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to delete league' })
    }
  }

  const leagueColumns = [
    { title: 'League', dataIndex: 'name', key: 'name' },
    { title: 'ID', dataIndex: 'leagueId', key: 'leagueId' },
    { title: 'Sport', dataIndex: 'sport', key: 'sport', render: (s) => s?.toUpperCase() },
    { title: 'Season', dataIndex: 'season', key: 'season' },
    { title: 'Teams', dataIndex: 'teamCount', key: 'teamCount' },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => (
        <Tag color={r.draftCompleted ? 'green' : r.isDraftLive ? 'blue' : 'orange'}>
          {r.draftCompleted ? 'ACTIVE' : r.isDraftLive ? 'DRAFTING' : 'PRE-DRAFT'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Delete this league?"
          description="All teams in this league will be removed. This cannot be undone."
          onConfirm={() => handleDeleteLeague(record._id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" icon={<DeleteOutlined />} danger type="text" style={{ fontSize: 11 }}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="pd-page">
      {/* Sidebar */}
      <div className="pd-sidebar">
        <div className="pd-sidebar-header">
          {partner?.branding?.logo ? (
            <img src={partner.branding.logo} alt="" className="pd-sidebar-logo" />
          ) : (
            <div className="pd-sidebar-logo-placeholder">{partner?.name?.[0] || 'P'}</div>
          )}
          <div className="pd-sidebar-info">
            <span className="pd-sidebar-name">{partner?.name}</span>
            <span className="pd-sidebar-sub">{partner?.subdomain}.samsports.io</span>
            {partner?.partnerCode && (
              <span className="pd-sidebar-code">Code: {partner.partnerCode}</span>
            )}
          </div>
        </div>
        <div className="pd-sidebar-plan">
          <Tag color={partner?.plan === 'enterprise' ? 'purple' : partner?.plan === 'pro' ? 'blue' : 'default'}>
            {(partner?.plan || 'free').toUpperCase()}
          </Tag>
        </div>
        <nav className="pd-sidebar-nav">
          {[
            { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
            { key: 'users', icon: <TeamOutlined />, label: 'Users' },
            { key: 'leagues', icon: <TrophyOutlined />, label: 'Leagues' },
            { key: 'branding', icon: <BgColorsOutlined />, label: 'Branding' },
            { key: 'adverts', icon: <PictureOutlined />, label: 'Adverts' },
            { key: 'promos', icon: <GiftOutlined />, label: 'Promo Codes' },
            { key: 'announcements', icon: <NotificationOutlined />, label: 'Announce' },
            { key: 'events', icon: <CalendarOutlined />, label: 'Events' },
            { key: 'plan', icon: <CrownOutlined />, label: 'Plan' },
            { key: 'support', icon: <QuestionCircleOutlined />, label: 'Support' },
            { key: 'rules', icon: <FileTextOutlined />, label: 'Rules' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.key}
              className={`pd-nav-item ${activeTab === item.key ? 'pd-nav-active' : ''}`}
              onClick={() => {
                setActiveTab(item.key)
                if (item.key === 'adverts') loadAdverts()
                if (item.key === 'support') loadTickets()
                if (item.key === 'promos') loadPromoCodes()
                if (item.key === 'announcements') loadAnnouncements()
                if (item.key === 'events') loadEvents()
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="pd-nav-item pd-nav-logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="pd-main">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="pd-section">
            <h2 className="pd-section-title">DASHBOARD</h2>
            {dashboard ? (
              <>
                <div className="pd-stats-grid">
                  <div className="pd-stat-card">
                    <TeamOutlined className="pd-stat-icon" />
                    <div className="pd-stat-value">{dashboard.stats?.totalUsers || 0}</div>
                    <div className="pd-stat-label">Total Users</div>
                    <div className="pd-stat-bar">
                      <div
                        className="pd-stat-bar-fill"
                        style={{ width: `${Math.min(dashboard.usage?.users?.percent || 0, 100)}%` }}
                      />
                    </div>
                    <div className="pd-stat-limit">
                      {dashboard.usage?.users?.current} / {dashboard.usage?.users?.max === -1 ? 'Unlimited' : dashboard.usage?.users?.max}
                    </div>
                  </div>
                  <div className="pd-stat-card">
                    <TrophyOutlined className="pd-stat-icon" />
                    <div className="pd-stat-value">{dashboard.stats?.totalLeagues || 0}</div>
                    <div className="pd-stat-label">Leagues</div>
                    <div className="pd-stat-bar">
                      <div
                        className="pd-stat-bar-fill"
                        style={{ width: `${Math.min(dashboard.usage?.leagues?.percent || 0, 100)}%` }}
                      />
                    </div>
                    <div className="pd-stat-limit">
                      {dashboard.usage?.leagues?.current} / {dashboard.usage?.leagues?.max === -1 ? 'Unlimited' : dashboard.usage?.leagues?.max}
                    </div>
                  </div>
                  <div className="pd-stat-card">
                    <BarChartOutlined className="pd-stat-icon" />
                    <div className="pd-stat-value">{dashboard.stats?.activeUsers30d || 0}</div>
                    <div className="pd-stat-label">Active (30d)</div>
                  </div>
                  <div className="pd-stat-card">
                    <BarChartOutlined className="pd-stat-icon" style={{ color: '#22C55E' }} />
                    <div className="pd-stat-value">{dashboard.stats?.activeUsers7d || 0}</div>
                    <div className="pd-stat-label">Active (7d)</div>
                  </div>
                  <div className="pd-stat-card">
                    <TeamOutlined className="pd-stat-icon" style={{ color: '#22C55E' }} />
                    <div className="pd-stat-value">{dashboard.stats?.signupsThisWeek || 0}</div>
                    <div className="pd-stat-label">Signups This Week</div>
                    {dashboard.stats?.signupsLastWeek > 0 && (
                      <div className="pd-stat-limit" style={{ color: dashboard.stats.signupsThisWeek >= dashboard.stats.signupsLastWeek ? '#22C55E' : '#ff3b3b' }}>
                        {dashboard.stats.signupsThisWeek >= dashboard.stats.signupsLastWeek ? '↑' : '↓'} vs {dashboard.stats.signupsLastWeek} last week
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code & Share */}
                <div className="pd-qr-section">
                  <div className="pd-qr-card">
                    <div className="pd-qr-code-wrap">
                      <QRCodeSVG
                        id="partner-qr"
                        value={`https://${partner?.subdomain || 'samsports'}.samsports.io`}
                        size={160}
                        bgColor="#141C2D"
                        fgColor="#D4A843"
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="pd-qr-info">
                      <h3 className="pd-sub-title" style={{ marginTop: 0 }}>Your QR Code</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>
                        Print this and place it in your venue. Customers scan to join instantly.
                      </p>
                      <div className="pd-qr-url">
                        https://{partner?.subdomain || 'samsports'}.samsports.io
                      </div>
                      <div className="pd-qr-actions">
                        <Button size="small" onClick={() => {
                          const svg = document.getElementById('partner-qr')
                          const svgData = new XMLSerializer().serializeToString(svg)
                          const canvas = document.createElement('canvas')
                          canvas.width = 400; canvas.height = 400
                          const ctx = canvas.getContext('2d')
                          const img = new Image()
                          img.onload = () => {
                            ctx.fillStyle = '#141C2D'
                            ctx.fillRect(0, 0, 400, 400)
                            ctx.drawImage(img, 0, 0, 400, 400)
                            ctx.fillStyle = '#D4A843'
                            ctx.font = 'bold 18px Rajdhani, sans-serif'
                            ctx.textAlign = 'center'
                            ctx.fillText(partner?.businessName || 'SamSports', 200, 380)
                            const link = document.createElement('a')
                            link.download = `${partner?.subdomain || 'samsports'}-qr.png`
                            link.href = canvas.toDataURL('image/png')
                            link.click()
                          }
                          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
                        }}>
                          Download QR
                        </Button>
                        <Button size="small" onClick={() => {
                          navigator.clipboard.writeText(`https://${partner?.subdomain}.samsports.io`)
                          notification.success({ message: 'Link copied!' })
                        }}>
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="pd-sub-title">Recent Users</h3>
                <div className="pd-recent-list">
                  {dashboard.recentUsers?.length > 0 ? (
                    dashboard.recentUsers.map((u, i) => (
                      <div key={i} className="pd-recent-item">
                        <UserOutlined className="pd-recent-icon" />
                        <span className="pd-recent-name">{u.userName || u.email}</span>
                        <span className="pd-recent-date">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="pd-empty">No users yet. Share your platform link!</div>
                  )}
                </div>
              </>
            ) : (
              <div className="pd-loading"><Spin /></div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">USERS</h2>
              <Input.Search
                placeholder="Search users..."
                onSearch={(v) => loadUsers(1, v)}
                className="pd-search"
                allowClear
              />
            </div>
            <Table
              dataSource={users.users}
              columns={userColumns}
              rowKey="_id"
              pagination={{
                current: users.pagination?.page || 1,
                total: users.pagination?.total || 0,
                pageSize: 20,
                onChange: (p) => loadUsers(p),
              }}
              className="pd-table"
              size="small"
            />
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="pd-section">
            <h2 className="pd-section-title">LEAGUES</h2>
            <Table
              dataSource={leagues}
              columns={leagueColumns}
              rowKey="_id"
              className="pd-table"
              size="small"
              locale={{ emptyText: <Empty description="No leagues created yet" /> }}
            />
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && brandingForm && (
          <div className="pd-section">
            <h2 className="pd-section-title">BRANDING</h2>
            <p className="pd-section-desc">
              Customize how your platform looks to your customers.
              {partner?.plan === 'free' && ' Upgrade to Pro for full branding control.'}
            </p>

            {/* Logo Upload */}
            <div className="pd-brand-logo-section">
              <h3 className="pd-sub-title">YOUR LOGO</h3>
              <div className="pd-logo-upload-area">
                {brandingForm.logo ? (
                  <div className="pd-logo-preview-wrap">
                    <img src={brandingForm.logo} alt="Logo" className="pd-logo-preview-img" />
                    <div className="pd-logo-actions">
                      <label className="pd-logo-change-btn">
                        <UploadOutlined /> Change
                        <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                      </label>
                      <button className="pd-logo-remove-btn" onClick={removeLogo}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="pd-logo-dropzone">
                    {uploading ? (
                      <Spin />
                    ) : (
                      <>
                        <UploadOutlined style={{ fontSize: 32, color: '#666' }} />
                        <span className="pd-logo-dropzone-text">Click to upload your logo</span>
                        <span className="pd-logo-dropzone-hint">PNG, JPG, SVG or WebP — max 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                  </label>
                )}
              </div>
            </div>

            {/* Font Selection */}
            <div className="pd-brand-font-section">
              <h3 className="pd-sub-title">FONT</h3>
              <Select
                value={brandingForm.fontFamily || 'Rajdhani'}
                onChange={(v) => setBrandingForm((f) => ({ ...f, fontFamily: v }))}
                className="pd-font-select"
                style={{ width: 280 }}
              >
                <Select.Option value="Rajdhani"><span style={{ fontFamily: 'Rajdhani' }}>Rajdhani (Default)</span></Select.Option>
                <Select.Option value="Inter"><span style={{ fontFamily: 'Inter, sans-serif' }}>Inter</span></Select.Option>
                <Select.Option value="Roboto"><span style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</span></Select.Option>
                <Select.Option value="Montserrat"><span style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat</span></Select.Option>
                <Select.Option value="Oswald"><span style={{ fontFamily: 'Oswald, sans-serif' }}>Oswald</span></Select.Option>
                <Select.Option value="Poppins"><span style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins</span></Select.Option>
                <Select.Option value="Bebas Neue"><span style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Bebas Neue</span></Select.Option>
                <Select.Option value="Barlow"><span style={{ fontFamily: 'Barlow, sans-serif' }}>Barlow</span></Select.Option>
                <Select.Option value="Archivo"><span style={{ fontFamily: 'Archivo, sans-serif' }}>Archivo</span></Select.Option>
              </Select>
              <div className="pd-font-preview" style={{ fontFamily: brandingForm.fontFamily || 'Rajdhani' }}>
                <span className="pd-font-preview-big">The quick brown fox jumps</span>
                <span className="pd-font-preview-small">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</span>
              </div>
            </div>

            {/* Colors */}
            <h3 className="pd-sub-title">COLORS</h3>
            <div className="pd-brand-grid">
              <div className="pd-brand-field">
                <label>Primary Color</label>
                <div className="pd-color-row">
                  <input
                    type="color"
                    value={brandingForm.primaryColor || '#D4A843'}
                    onChange={(e) => setBrandingForm((f) => ({ ...f, primaryColor: e.target.value }))}
                    className="pd-color-input"
                  />
                  <span>{brandingForm.primaryColor}</span>
                </div>
              </div>
              {partner?.plan !== 'free' && (
                <>
                  <div className="pd-brand-field">
                    <label>Secondary Color</label>
                    <div className="pd-color-row">
                      <input
                        type="color"
                        value={brandingForm.secondaryColor || '#141C2D'}
                        onChange={(e) => setBrandingForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                        className="pd-color-input"
                      />
                      <span>{brandingForm.secondaryColor}</span>
                    </div>
                  </div>
                  <div className="pd-brand-field">
                    <label>Accent Color</label>
                    <div className="pd-color-row">
                      <input
                        type="color"
                        value={brandingForm.accentColor || '#22C55E'}
                        onChange={(e) => setBrandingForm((f) => ({ ...f, accentColor: e.target.value }))}
                        className="pd-color-input"
                      />
                      <span>{brandingForm.accentColor}</span>
                    </div>
                  </div>
                  <div className="pd-brand-field">
                    <label>Header Background</label>
                    <div className="pd-color-row">
                      <input
                        type="color"
                        value={brandingForm.headerBg || '#0A0F1C'}
                        onChange={(e) => setBrandingForm((f) => ({ ...f, headerBg: e.target.value }))}
                        className="pd-color-input"
                      />
                      <span>{brandingForm.headerBg}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Live Preview */}
            <h3 className="pd-sub-title">PREVIEW</h3>
            <div className="pd-brand-preview">
              <div className="pd-preview-header" style={{ background: brandingForm.headerBg || '#0A0F1C' }}>
                {brandingForm.logo && <img src={brandingForm.logo} alt="" className="pd-preview-logo" />}
                <span style={{ color: brandingForm.primaryColor, fontFamily: brandingForm.fontFamily || 'Rajdhani' }}>
                  {partner?.businessName || partner?.name}
                </span>
              </div>
              <div className="pd-preview-body" style={{ background: brandingForm.secondaryColor || '#141C2D' }}>
                <div className="pd-preview-card" style={{ borderColor: `${brandingForm.primaryColor}30` }}>
                  <span style={{ color: brandingForm.primaryColor, fontFamily: brandingForm.fontFamily || 'Rajdhani' }}>
                    SAM Rating: 87.4
                  </span>
                  <span style={{ color: brandingForm.accentColor || '#22C55E' }}>+2.3</span>
                </div>
              </div>
            </div>

            {/* ── Email Branding ── */}
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginTop: 32, marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
              <MailOutlined style={{ marginRight: 8 }} />
              Email Branding
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.5 }}>
              Customize how emails (verification codes, welcome messages, password resets) appear to your users.
            </p>
            <div className="pd-branding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="pd-setting-item">
                <label>Email &ldquo;From&rdquo; Name</label>
                <Input
                  value={brandingForm.emailFromName || ''}
                  onChange={(e) => setBrandingForm((f) => ({ ...f, emailFromName: e.target.value }))}
                  placeholder={partner?.businessName || 'Your Business Name'}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, display: 'block' }}>
                  Shown as the sender name in users&apos; inboxes
                </span>
              </div>
              <div className="pd-setting-item">
                <label>Reply-To Email</label>
                <Input
                  value={brandingForm.emailReplyTo || ''}
                  onChange={(e) => setBrandingForm((f) => ({ ...f, emailReplyTo: e.target.value }))}
                  placeholder="contact@yourbusiness.com"
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, display: 'block' }}>
                  When users reply to emails, replies go here
                </span>
              </div>
              <div className="pd-setting-item">
                <label>Email Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={brandingForm.emailAccentColor || brandingForm.accentColor || '#22C55E'}
                    onChange={(e) => setBrandingForm((f) => ({ ...f, emailAccentColor: e.target.value }))}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                  />
                  <Input
                    value={brandingForm.emailAccentColor || ''}
                    onChange={(e) => setBrandingForm((f) => ({ ...f, emailAccentColor: e.target.value }))}
                    placeholder={brandingForm.accentColor || '#22C55E'}
                    style={{ width: 120 }}
                  />
                </div>
              </div>
              <div className="pd-setting-item">
                <label>Email Footer Text</label>
                <Input
                  value={brandingForm.emailFooterText || ''}
                  onChange={(e) => setBrandingForm((f) => ({ ...f, emailFooterText: e.target.value }))}
                  placeholder={`${partner?.businessName || 'Your Bar'} — Powered by SamSports`}
                />
              </div>
            </div>

            <Button type="primary" className="pd-save-btn" onClick={saveBranding}>
              SAVE BRANDING
            </Button>
          </div>
        )}

        {/* Adverts Tab */}
        {activeTab === 'adverts' && (
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">ADVERTS</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAdvertModal(true)}
                className="pd-save-btn"
                style={{ height: 36, fontSize: 12 }}
              >
                ADD ADVERT
              </Button>
            </div>
            <p className="pd-section-desc">
              Add banner ads that display on your branded landing page. Upload images and set destination links.
            </p>

            {adverts.length === 0 ? (
              <div className="pd-empty">No adverts yet. Click &ldquo;Add Advert&rdquo; to create your first banner.</div>
            ) : (
              <div className="pd-adverts-grid">
                {adverts.map((ad, i) => (
                  <div key={i} className="pd-advert-card">
                    <div className="pd-advert-img-wrap">
                      <img src={ad.imageUrl} alt={ad.title} className="pd-advert-img" />
                      {!ad.active && <div className="pd-advert-disabled-overlay">PAUSED</div>}
                    </div>
                    <div className="pd-advert-info">
                      <div className="pd-advert-title">{ad.title || 'Untitled'}</div>
                      {ad.linkUrl && (
                        <div className="pd-advert-link">
                          <LinkOutlined style={{ fontSize: 10 }} />
                          <span>{ad.linkUrl.replace(/^https?:\/\//, '').slice(0, 30)}</span>
                        </div>
                      )}
                      <div className="pd-advert-meta">
                        <Tag>{ad.position?.replace('-', ' ')}</Tag>
                      </div>
                    </div>
                    <div className="pd-advert-actions">
                      <Switch
                        checked={ad.active}
                        onChange={(v) => handleToggleAdvert(i, v)}
                        size="small"
                      />
                      <Popconfirm
                        title="Delete this advert?"
                        onConfirm={() => handleDeleteAdvert(i)}
                        okText="Delete"
                        cancelText="Cancel"
                      >
                        <Button size="small" icon={<DeleteOutlined />} danger type="text" />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Modal
              title="Add New Advert"
              open={advertModal}
              onOk={handleAddAdvert}
              onCancel={() => setAdvertModal(false)}
              okText="Add Advert"
              className="pd-modal"
            >
              <div className="pd-modal-field">
                <label>Title</label>
                <Input
                  value={advertForm.title}
                  onChange={(e) => setAdvertForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer Promo"
                />
              </div>
              <div className="pd-modal-field">
                <label>Image URL</label>
                <Input
                  value={advertForm.imageUrl}
                  onChange={(e) => setAdvertForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://your-image-host.com/banner.png"
                />
              </div>
              <div className="pd-modal-field">
                <label>Link URL (where the ad links to)</label>
                <Input
                  value={advertForm.linkUrl}
                  onChange={(e) => setAdvertForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="https://your-site.com/promo"
                />
              </div>
              <div className="pd-modal-field">
                <label>Position</label>
                <Select
                  value={advertForm.position}
                  onChange={(v) => setAdvertForm((f) => ({ ...f, position: v }))}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="landing-banner">Landing Page Banner</Select.Option>
                  <Select.Option value="sidebar">Sidebar</Select.Option>
                  <Select.Option value="in-feed">In Feed</Select.Option>
                </Select>
              </div>
            </Modal>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="pd-section">
            <h2 className="pd-section-title">YOUR PLAN</h2>
            <p className="pd-section-desc">
              Current plan: <Tag color={partner?.plan === 'enterprise' ? 'purple' : partner?.plan === 'pro' ? 'blue' : 'default'} style={{ marginLeft: 4 }}>
                {(partner?.plan || 'free').toUpperCase()}
              </Tag>
            </p>

            <div className="pd-plans-grid">
              {/* Free */}
              <div className={`pd-plan-card ${partner?.plan === 'free' ? 'pd-plan-current' : ''}`}>
                <div className="pd-plan-badge">FREE</div>
                <div className="pd-plan-price">$0<span>/mo</span></div>
                <ul className="pd-plan-features">
                  <li>Up to 100 users</li>
                  <li>Up to 5 leagues</li>
                  <li>20 users per league</li>
                  <li>Primary color branding</li>
                  <li>5 adverts</li>
                </ul>
                {partner?.plan === 'free' ? (
                  <div className="pd-plan-current-label">Current Plan</div>
                ) : (
                  <div className="pd-plan-current-label" style={{ color: 'rgba(255,255,255,0.2)' }}>—</div>
                )}
              </div>

              {/* Pro */}
              <div className={`pd-plan-card pd-plan-featured ${partner?.plan === 'pro' ? 'pd-plan-current' : ''}`}>
                <div className="pd-plan-badge pd-plan-badge-pro">PRO</div>
                <div className="pd-plan-price">$49<span>/mo</span></div>
                <ul className="pd-plan-features">
                  <li>Up to 500 users</li>
                  <li>Up to 25 leagues</li>
                  <li>50 users per league</li>
                  <li>Full branding + custom CSS</li>
                  <li>White-label (remove SamSports branding)</li>
                  <li>10 adverts</li>
                  <li>Priority support</li>
                </ul>
                {partner?.plan === 'pro' ? (
                  <div className="pd-plan-current-label">Current Plan</div>
                ) : partner?.plan === 'free' ? (
                  <Button
                    type="primary"
                    className="pd-plan-upgrade-btn"
                    onClick={() => {
                      window.open('mailto:hello@samsports.io?subject=Upgrade to Pro&body=Hi, I would like to upgrade my partner account (' + (partner?.subdomain || '') + '.samsports.io) to the Pro plan.', '_blank')
                      notification.info({ message: 'Email opened — contact us to upgrade to Pro!' })
                    }}
                  >
                    UPGRADE TO PRO
                  </Button>
                ) : (
                  <div className="pd-plan-current-label" style={{ color: 'rgba(255,255,255,0.2)' }}>—</div>
                )}
              </div>

              {/* Enterprise */}
              <div className={`pd-plan-card ${partner?.plan === 'enterprise' ? 'pd-plan-current' : ''}`}>
                <div className="pd-plan-badge pd-plan-badge-ent">ENTERPRISE</div>
                <div className="pd-plan-price">Custom</div>
                <ul className="pd-plan-features">
                  <li>Unlimited users</li>
                  <li>Unlimited leagues</li>
                  <li>Unlimited users per league</li>
                  <li>Full branding + custom CSS</li>
                  <li>White-label</li>
                  <li>Unlimited adverts</li>
                  <li>API access</li>
                  <li>Dedicated support</li>
                </ul>
                {partner?.plan === 'enterprise' ? (
                  <div className="pd-plan-current-label">Current Plan</div>
                ) : (
                  <Button
                    className="pd-plan-upgrade-btn"
                    onClick={() => {
                      window.open('mailto:hello@samsports.io?subject=Enterprise Plan Inquiry&body=Hi, I would like to discuss the Enterprise plan for my partner account (' + (partner?.subdomain || '') + '.samsports.io).', '_blank')
                      notification.info({ message: 'Email opened — contact us for Enterprise pricing!' })
                    }}
                  >
                    CONTACT US
                  </Button>
                )}
              </div>
            </div>

            <div className="pd-plan-usage">
              <h3 className="pd-sub-title">CURRENT USAGE</h3>
              <div className="pd-plan-usage-grid">
                <div className="pd-plan-usage-item">
                  <div className="pd-plan-usage-label">Users</div>
                  <div className="pd-plan-usage-value">
                    {dashboard?.usage?.users?.current || 0} / {dashboard?.usage?.users?.max === -1 ? 'Unlimited' : dashboard?.usage?.users?.max || 100}
                  </div>
                  <div className="pd-stat-bar">
                    <div className="pd-stat-bar-fill" style={{ width: `${Math.min(dashboard?.usage?.users?.percent || 0, 100)}%` }} />
                  </div>
                </div>
                <div className="pd-plan-usage-item">
                  <div className="pd-plan-usage-label">Leagues</div>
                  <div className="pd-plan-usage-value">
                    {dashboard?.usage?.leagues?.current || 0} / {dashboard?.usage?.leagues?.max === -1 ? 'Unlimited' : dashboard?.usage?.leagues?.max || 5}
                  </div>
                  <div className="pd-stat-bar">
                    <div className="pd-stat-bar-fill" style={{ width: `${Math.min(dashboard?.usage?.leagues?.percent || 0, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="pd-section">
            <div className="pd-section-header-row">
              <h2 className="pd-section-title">SUPPORT TICKETS</h2>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTicketModal(true)}>
                New Ticket
              </Button>
            </div>
            <p className="pd-section-desc">Submit a ticket and our team will respond within 24 hours.</p>

            {tickets.length === 0 ? (
              <Empty description="No tickets yet" style={{ marginTop: 40 }} />
            ) : (
              <div className="pd-tickets-list">
                {tickets.map((ticket, idx) => (
                  <div key={ticket.ticketId || idx} className="pd-ticket-card">
                    <div className="pd-ticket-header">
                      <div className="pd-ticket-subject">{ticket.subject}</div>
                      <div className="pd-ticket-meta">
                        <Tag color={
                          ticket.status === 'open' ? 'blue' :
                          ticket.status === 'in-progress' ? 'orange' :
                          ticket.status === 'resolved' ? 'green' : 'default'
                        }>
                          {(ticket.status || 'open').toUpperCase()}
                        </Tag>
                        <Tag color={
                          ticket.priority === 'urgent' ? 'red' :
                          ticket.priority === 'high' ? 'volcano' :
                          ticket.priority === 'medium' ? 'gold' : 'default'
                        }>
                          {(ticket.priority || 'medium').toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                    <div className="pd-ticket-body">{ticket.message}</div>
                    <div className="pd-ticket-footer">
                      <span className="pd-ticket-category">
                        <Tag>{(ticket.category || 'general').replace('-', ' ').toUpperCase()}</Tag>
                      </span>
                      <span className="pd-ticket-date">
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="pd-ticket-replies">
                        {ticket.replies.map((reply, rIdx) => (
                          <div key={rIdx} className={`pd-ticket-reply ${reply.from === 'admin' ? 'pd-reply-admin' : 'pd-reply-partner'}`}>
                            <div className="pd-reply-from">
                              {reply.from === 'admin' ? 'SamSports Team' : 'You'}
                            </div>
                            <div className="pd-reply-message">{reply.message}</div>
                            <div className="pd-reply-date">
                              {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Create Ticket Modal */}
            <Modal
              title="Create Support Ticket"
              open={ticketModal}
              onCancel={() => setTicketModal(false)}
              onOk={handleCreateTicket}
              confirmLoading={submittingTicket}
              okText="Submit Ticket"
              className="pd-dark-modal"
            >
              <div className="pd-modal-field">
                <label>Subject</label>
                <Input
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="pd-modal-field">
                <label>Category</label>
                <Select
                  value={ticketForm.category}
                  onChange={(v) => setTicketForm((f) => ({ ...f, category: v }))}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="general">General</Select.Option>
                  <Select.Option value="billing">Billing</Select.Option>
                  <Select.Option value="technical">Technical</Select.Option>
                  <Select.Option value="feature-request">Feature Request</Select.Option>
                </Select>
              </div>
              <div className="pd-modal-field">
                <label>Priority</label>
                <Select
                  value={ticketForm.priority}
                  onChange={(v) => setTicketForm((f) => ({ ...f, priority: v }))}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="low">Low</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="urgent">Urgent</Select.Option>
                </Select>
              </div>
              <div className="pd-modal-field">
                <label>Message</label>
                <Input.TextArea
                  rows={5}
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                />
              </div>
            </Modal>
          </div>
        )}

        {/* Promo Codes Tab */}
        {activeTab === 'promos' && (
          <div className="pd-section">
            <div className="pd-section-header-row">
              <h2 className="pd-section-title">PROMO CODES</h2>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setPromoModal(true)}>
                Create Code
              </Button>
            </div>
            {promoCodes.length > 0 ? (
              <div className="pd-promo-list">
                {promoCodes.map((p, i) => (
                  <div key={i} className="pd-promo-card">
                    <div>
                      <div className="pd-promo-code">{p.code}</div>
                      <div className="pd-promo-meta">
                        {p.type === 'bonus_sp' ? `+${p.value} SP` : p.type === 'free_entry' ? 'Free Entry' : `${p.value}% Off`}
                        {' · '}{p.usedCount}/{p.maxUses} used
                        {p.expiresAt && ` · Expires ${new Date(p.expiresAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Button size="small" onClick={() => {
                        navigator.clipboard.writeText(p.code)
                        notification.success({ message: 'Code copied!' })
                      }}>Copy</Button>
                      <Popconfirm title="Delete this code?" onConfirm={() => deletePromo(i)}>
                        <Button size="small" danger><DeleteOutlined /></Button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No promo codes yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Modal
              title="Create Promo Code"
              open={promoModal}
              onOk={createPromo}
              onCancel={() => setPromoModal(false)}
              className="pd-modal"
            >
              <div className="pd-setting-item">
                <label>Code</label>
                <Input
                  value={promoForm.code}
                  onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. JOESBAR50"
                  maxLength={12}
                />
              </div>
              <div className="pd-setting-item">
                <label>Type</label>
                <Select value={promoForm.type} onChange={(v) => setPromoForm((f) => ({ ...f, type: v }))}>
                  <Select.Option value="bonus_sp">Bonus SamPoints</Select.Option>
                  <Select.Option value="free_entry">Free League Entry</Select.Option>
                  <Select.Option value="discount">Discount</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>{promoForm.type === 'bonus_sp' ? 'SP Amount' : promoForm.type === 'discount' ? 'Discount %' : 'Value'}</label>
                <Input
                  type="number"
                  value={promoForm.value}
                  onChange={(e) => setPromoForm((f) => ({ ...f, value: Number(e.target.value) }))}
                />
              </div>
              <div className="pd-setting-item">
                <label>Max Uses</label>
                <Input
                  type="number"
                  value={promoForm.maxUses}
                  onChange={(e) => setPromoForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
                />
              </div>
            </Modal>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="pd-section">
            <div className="pd-section-header-row">
              <h2 className="pd-section-title">ANNOUNCEMENTS</h2>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAnnounceModal(true)}>
                Post Announcement
              </Button>
            </div>
            {announcements.length > 0 ? (
              <div className="pd-announcement-list">
                {[...announcements].reverse().map((a, i) => (
                  <div key={i} className="pd-announcement-card">
                    <div className="pd-announcement-header">
                      <span className="pd-announcement-title">
                        <Tag color={a.type === 'urgent' ? 'red' : a.type === 'event' ? 'blue' : a.type === 'promo' ? 'gold' : 'green'}>
                          {a.type?.toUpperCase()}
                        </Tag>
                        {a.title}
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="pd-announcement-date">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                        </span>
                        <Popconfirm title="Delete?" onConfirm={() => deleteAnnouncement(announcements.length - 1 - i)}>
                          <Button size="small" danger><DeleteOutlined /></Button>
                        </Popconfirm>
                      </div>
                    </div>
                    <div className="pd-announcement-body">{a.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No announcements yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Modal
              title="Post Announcement"
              open={announceModal}
              onOk={createAnnouncement}
              onCancel={() => setAnnounceModal(false)}
              className="pd-modal"
            >
              <div className="pd-setting-item">
                <label>Title</label>
                <Input
                  value={announceForm.title}
                  onChange={(e) => setAnnounceForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Draft Night This Thursday!"
                />
              </div>
              <div className="pd-setting-item">
                <label>Type</label>
                <Select value={announceForm.type} onChange={(v) => setAnnounceForm((f) => ({ ...f, type: v }))}>
                  <Select.Option value="info">Info</Select.Option>
                  <Select.Option value="event">Event</Select.Option>
                  <Select.Option value="promo">Promo</Select.Option>
                  <Select.Option value="urgent">Urgent</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>Message</label>
                <Input.TextArea
                  rows={4}
                  value={announceForm.message}
                  onChange={(e) => setAnnounceForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Write your announcement..."
                />
              </div>
            </Modal>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="pd-section">
            <div className="pd-section-header-row">
              <h2 className="pd-section-title">EVENTS</h2>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setEventModal(true)}>
                Create Event
              </Button>
            </div>
            {events.length > 0 ? (
              <div className="pd-events-list">
                {events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((ev, i) => {
                    const d = new Date(ev.date)
                    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
                    return (
                      <div key={i} className="pd-event-card">
                        <div className="pd-event-date-box">
                          <div className="pd-event-date-month">{months[d.getMonth()]}</div>
                          <div className="pd-event-date-day">{d.getDate()}</div>
                        </div>
                        <div className="pd-event-info" style={{ flex: 1 }}>
                          <h4>
                            <Tag color="gold" style={{ marginRight: 8 }}>{ev.type?.replace('_', ' ').toUpperCase()}</Tag>
                            {ev.title}
                          </h4>
                          <p>{ev.description || 'No description'}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            {d.toLocaleString()}
                          </p>
                        </div>
                        <Popconfirm title="Delete this event?" onConfirm={() => deleteEventItem(i)}>
                          <Button size="small" danger><DeleteOutlined /></Button>
                        </Popconfirm>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <Empty description="No events scheduled" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Modal
              title="Create Event"
              open={eventModal}
              onOk={createEventItem}
              onCancel={() => setEventModal(false)}
              className="pd-modal"
            >
              <div className="pd-setting-item">
                <label>Event Title</label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Premier League Draft Night"
                />
              </div>
              <div className="pd-setting-item">
                <label>Type</label>
                <Select value={eventForm.type} onChange={(v) => setEventForm((f) => ({ ...f, type: v }))}>
                  <Select.Option value="draft_night">Draft Night</Select.Option>
                  <Select.Option value="watch_party">Watch Party</Select.Option>
                  <Select.Option value="prediction">Prediction Event</Select.Option>
                  <Select.Option value="tournament">Tournament</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>Date & Time</label>
                <Input
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="pd-setting-item">
                <label>Description</label>
                <Input.TextArea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell your customers what to expect..."
                />
              </div>
            </Modal>
          </div>
        )}

        {/* Rules & Regulations Tab */}
        {activeTab === 'rules' && (
          <div className="pd-section">
            <h2 className="pd-section-title">RULES & REGULATIONS</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>
              Add your own terms, privacy policy, and house rules. These will be shown on your subdomain
              and optionally required for users to accept when joining.
            </p>
            <div className="pd-rules-grid">
              <div className="pd-setting-item">
                <label>Terms of Service</label>
                <Input.TextArea
                  rows={8}
                  value={rulesForm.termsOfService}
                  onChange={(e) => setRulesForm((f) => ({ ...f, termsOfService: e.target.value }))}
                  placeholder="Enter your venue's terms of service. Leave blank to use SamSports defaults."
                />
              </div>
              <div className="pd-setting-item">
                <label>Privacy Policy</label>
                <Input.TextArea
                  rows={8}
                  value={rulesForm.privacyPolicy}
                  onChange={(e) => setRulesForm((f) => ({ ...f, privacyPolicy: e.target.value }))}
                  placeholder="Enter your venue's privacy policy. Leave blank to use SamSports defaults."
                />
              </div>
              <div className="pd-setting-item">
                <label>House Rules</label>
                <Input.TextArea
                  rows={8}
                  value={rulesForm.houseRules}
                  onChange={(e) => setRulesForm((f) => ({ ...f, houseRules: e.target.value }))}
                  placeholder="Enter league rules, conduct guidelines, scoring rules, etc."
                />
              </div>
              <div className="pd-setting-item">
                <label>Require Acceptance at Signup</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    checked={rulesForm.requireAcceptance}
                    onChange={(v) => setRulesForm((f) => ({ ...f, requireAcceptance: v }))}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {rulesForm.requireAcceptance
                      ? 'Users must accept your rules when joining a league'
                      : 'Rules are visible but not required to accept'}
                  </span>
                </div>
              </div>
            </div>
            <Button type="primary" className="pd-save-btn" onClick={saveRules}>
              SAVE RULES
            </Button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settingsForm && (
          <div className="pd-section">
            <h2 className="pd-section-title">PLATFORM SETTINGS</h2>
            <div className="pd-settings-grid">
              <div className="pd-setting-item">
                <label>Landing Page Mode</label>
                <Select
                  value={settingsForm.landingPageMode || 'simple'}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, landingPageMode: v }))}
                >
                  <Select.Option value="full">Full Sports Hub</Select.Option>
                  <Select.Option value="simple">Simple Branded Page</Select.Option>
                  <Select.Option value="login">Direct to Login</Select.Option>
                </Select>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, display: 'block' }}>
                  {settingsForm.landingPageMode === 'full' && 'Shows the full live scores & sports hub landing page with your branding'}
                  {settingsForm.landingPageMode === 'simple' && 'Shows a clean branded page with your logo, welcome message, and join/login buttons'}
                  {settingsForm.landingPageMode === 'login' && 'Sends visitors straight to the game selection / login page'}
                  {!settingsForm.landingPageMode && 'Shows a clean branded page with your logo, welcome message, and join/login buttons'}
                </span>
              </div>
              <div className="pd-setting-item">
                <label>Welcome Message</label>
                <Input.TextArea
                  rows={3}
                  value={settingsForm.customWelcomeMessage || ''}
                  onChange={(e) =>
                    setSettingsForm((f) => ({ ...f, customWelcomeMessage: e.target.value }))
                  }
                  placeholder="Welcome to our fantasy league!"
                />
              </div>
              <div className="pd-setting-item">
                <label>Allow Public Leagues</label>
                <Select
                  value={settingsForm.allowPublicLeagues}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, allowPublicLeagues: v }))}
                >
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No (Invite Only)</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>Enable Chat</label>
                <Select
                  value={settingsForm.enableChat}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, enableChat: v }))}
                >
                  <Select.Option value={true}>Enabled</Select.Option>
                  <Select.Option value={false}>Disabled</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>Enable Auctions</label>
                <Select
                  value={settingsForm.enableAuctions}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, enableAuctions: v }))}
                >
                  <Select.Option value={true}>Enabled</Select.Option>
                  <Select.Option value={false}>Disabled</Select.Option>
                </Select>
              </div>
              <div className="pd-setting-item">
                <label>Enable SAM Points</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    checked={settingsForm.enableSamPoints !== false}
                    onChange={(v) => setSettingsForm((f) => ({ ...f, enableSamPoints: v }))}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {settingsForm.enableSamPoints !== false ? 'Users earn SAM Points on your platform' : 'SAM Points disabled for your users'}
                  </span>
                </div>
              </div>
              {settingsForm.enableSamPoints !== false && (
                <div className="pd-setting-item">
                  <label>SAM Points Multiplier</label>
                  <Select
                    value={settingsForm.samPointsMultiplier}
                    onChange={(v) => setSettingsForm((f) => ({ ...f, samPointsMultiplier: v }))}
                  >
                    <Select.Option value={1}>1x (Standard)</Select.Option>
                    <Select.Option value={1.5}>1.5x (Bonus)</Select.Option>
                    <Select.Option value={2}>2x (Double)</Select.Option>
                  </Select>
                </div>
              )}
              <div className="pd-setting-item">
                <label>Timezone</label>
                <Select
                  showSearch
                  value={settingsForm.timezone || 'America/New_York'}
                  onChange={(v) => setSettingsForm((f) => ({ ...f, timezone: v }))}
                  filterOption={(input, option) =>
                    (option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Select.Option value="America/New_York">Eastern Time (US)</Select.Option>
                  <Select.Option value="America/Chicago">Central Time (US)</Select.Option>
                  <Select.Option value="America/Denver">Mountain Time (US)</Select.Option>
                  <Select.Option value="America/Los_Angeles">Pacific Time (US)</Select.Option>
                  <Select.Option value="America/Anchorage">Alaska Time</Select.Option>
                  <Select.Option value="Pacific/Honolulu">Hawaii Time</Select.Option>
                  <Select.Option value="Europe/London">London (GMT/BST)</Select.Option>
                  <Select.Option value="Europe/Paris">Central Europe (CET)</Select.Option>
                  <Select.Option value="Europe/Berlin">Berlin (CET)</Select.Option>
                  <Select.Option value="Europe/Madrid">Madrid (CET)</Select.Option>
                  <Select.Option value="Europe/Rome">Rome (CET)</Select.Option>
                  <Select.Option value="Europe/Amsterdam">Amsterdam (CET)</Select.Option>
                  <Select.Option value="Europe/Athens">Athens (EET)</Select.Option>
                  <Select.Option value="Europe/Moscow">Moscow (MSK)</Select.Option>
                  <Select.Option value="Europe/Istanbul">Istanbul (TRT)</Select.Option>
                  <Select.Option value="Asia/Dubai">Dubai (GST)</Select.Option>
                  <Select.Option value="Asia/Kolkata">India (IST)</Select.Option>
                  <Select.Option value="Asia/Singapore">Singapore (SGT)</Select.Option>
                  <Select.Option value="Asia/Tokyo">Tokyo (JST)</Select.Option>
                  <Select.Option value="Asia/Shanghai">China (CST)</Select.Option>
                  <Select.Option value="Australia/Sydney">Sydney (AEST)</Select.Option>
                  <Select.Option value="Australia/Melbourne">Melbourne (AEST)</Select.Option>
                  <Select.Option value="Australia/Perth">Perth (AWST)</Select.Option>
                  <Select.Option value="Pacific/Auckland">New Zealand (NZST)</Select.Option>
                  <Select.Option value="Africa/Lagos">Lagos (WAT)</Select.Option>
                  <Select.Option value="Africa/Johannesburg">Johannesburg (SAST)</Select.Option>
                  <Select.Option value="Africa/Cairo">Cairo (EET)</Select.Option>
                  <Select.Option value="America/Sao_Paulo">Sao Paulo (BRT)</Select.Option>
                  <Select.Option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</Select.Option>
                  <Select.Option value="America/Mexico_City">Mexico City (CST)</Select.Option>
                  <Select.Option value="America/Toronto">Toronto (EST)</Select.Option>
                  <Select.Option value="America/Vancouver">Vancouver (PST)</Select.Option>
                </Select>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, display: 'block' }}>
                  Used for event times, announcements, and TV display clock
                </span>
              </div>
            </div>
            <Button type="primary" className="pd-save-btn" onClick={saveSettings}>
              SAVE SETTINGS
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PartnerDashboard
