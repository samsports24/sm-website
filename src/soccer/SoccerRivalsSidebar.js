import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CrownOutlined,
  TeamOutlined,
  SwapOutlined,
  BarChartOutlined,
  TrophyOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  MessageOutlined,
  SettingOutlined,
  AimOutlined,
} from '@ant-design/icons'

const NAV_ITEMS = [
  { key: '/soccer', label: 'Overview', icon: <CrownOutlined /> },
  { key: '/soccer/squad', label: 'Squad', icon: <TeamOutlined /> },
  { key: '/soccer/transfers', label: 'Transfer Market', icon: <SearchOutlined /> },
  { key: '/soccer/lineup', label: 'Lineup', icon: <BarChartOutlined /> },
  { key: '/soccer/league', label: 'League', icon: <TrophyOutlined /> },
  { key: '/soccer/draft', label: 'Draft', icon: <SwapOutlined /> },
  { key: '/soccer/trades', label: 'Trades', icon: <SwapOutlined /> },
  { key: '/soccer/predictor', label: 'Predictor', icon: <AimOutlined /> },
  { key: '/soccer/cl-fantasy', label: 'CL Fantasy', icon: <TrophyOutlined /> },
  { key: '/soccer/profile', label: 'Profile', icon: <UserOutlined /> },
  { key: '/soccer/commissioner', label: 'Commissioner', icon: <SettingOutlined /> },
  { key: '/soccer/chat', label: 'Chat', icon: <MessageOutlined /> },
]

const SoccerRivalsSidebar = ({ collapsed, onToggle, leagueColor = '#4CAF50' }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className={`nflr-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ '--league-color': leagueColor }}>
      {/* Brand */}
      <div className="nflr-sidebar-brand" onClick={() => navigate('/soccer')}>
        {collapsed ? (
          <span style={{ fontSize: 28 }}>⚽</span>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: leagueColor,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              ⚽ SAM SOCCER
            </span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button className="nflr-sidebar-toggle" onClick={onToggle}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      {/* Nav items */}
      <nav className="nflr-sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive =
            item.key === '/soccer'
              ? location.pathname === '/soccer' || location.pathname === '/soccer/'
              : location.pathname.startsWith(item.key)
          return (
            <div
              key={item.key}
              className={`nflr-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.key)}
            >
              <span className="nflr-sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="nflr-sidebar-label">{item.label}</span>}
            </div>
          )
        })}
      </nav>

      {/* Back to Hub */}
      <div className="nflr-sidebar-footer">
        <div
          className="nflr-sidebar-back-btn"
          onClick={() => navigate('/hub')}
        >
          <ArrowLeftOutlined />
          {!collapsed && <span>Back to Hub</span>}
        </div>
      </div>
    </div>
  )
}

export default SoccerRivalsSidebar
