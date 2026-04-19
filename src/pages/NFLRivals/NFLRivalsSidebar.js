import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import nflRivalsLogo from '../../assets/nfl-rivals-logo.svg'
import {
  CrownOutlined,
  TeamOutlined,
  FireOutlined,
  TrophyOutlined,
  BarChartOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons'

const NAV_ITEMS = [
  { key: '/nfl-rivals', label: 'Overview', icon: <CrownOutlined /> },
  { key: '/nfl-rivals/squad', label: 'Squad', icon: <TeamOutlined /> },
  { key: '/nfl-rivals/search', label: 'Player Market', icon: <SearchOutlined /> },
  { key: '/nfl-rivals/pod', label: 'Pod', icon: <FireOutlined /> },
  { key: '/nfl-rivals/matchday', label: 'Matchday', icon: <BarChartOutlined /> },
  { key: '/nfl-rivals/trophies', label: 'Trophies', icon: <TrophyOutlined /> },
  { key: '/nfl-rivals/history', label: 'History', icon: <HistoryOutlined /> },
  { key: '/nfl-rivals/ai-coach', label: 'AI Coach', icon: <MedicineBoxOutlined /> },
  { key: '/nfl-rivals/leaderboard', label: 'Leaderboard', icon: <UserOutlined /> },
  { key: '/nfl-rivals/rulesbook', label: 'Rulesbook', icon: <BookOutlined /> },
]

const NFLRivalsSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className={`nflr-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="nflr-sidebar-brand" onClick={() => navigate('/nfl-rivals')}>
        {collapsed ? (
          <CrownOutlined className="nflr-sidebar-logo" />
        ) : (
          <img
            src={nflRivalsLogo}
            alt="SAM RIVALS"
            style={{ width: '100%', maxWidth: 200, height: 'auto', display: 'block', margin: '0 auto' }}
          />
        )}
      </div>

      {/* Toggle */}
      <button className="nflr-sidebar-toggle" onClick={onToggle}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      {/* Nav items */}
      <nav className="nflr-sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.key
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

export default NFLRivalsSidebar
