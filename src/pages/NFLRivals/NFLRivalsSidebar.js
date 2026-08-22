import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  QuestionCircleOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import HowToPlayTour from '../../components/HowToPlayTour'
import MobileBottomNav from '../../components/MobileBottomNav'

const NAV_ITEMS = [
  { key: '/nfl-rivals', label: 'Overview', icon: <CrownOutlined />, tour: 'nflr-overview' },
  { key: '/nfl-rivals/squad', label: 'Squad', icon: <TeamOutlined />, tour: 'nflr-squad' },
  { key: '/nfl-rivals/search', label: 'Player Market', icon: <SearchOutlined />, tour: 'nflr-market' },
  { key: '/nfl-rivals/pod', label: 'Pod', icon: <FireOutlined />, tour: 'nflr-pod' },
  { key: '/nfl-rivals/matchday', label: 'Matchday', icon: <BarChartOutlined />, tour: 'nflr-matchday' },
  { key: '/nfl-rivals/trophies', label: 'Trophies', icon: <TrophyOutlined />, tour: 'nflr-trophies' },
  { key: '/nfl-rivals/history', label: 'History', icon: <HistoryOutlined />, tour: 'nflr-history' },
  { key: '/nfl-rivals/ai-coach', label: 'AI Coach', icon: <MedicineBoxOutlined />, tour: 'nflr-aicoach' },
  { key: '/nfl-rivals/leaderboard', label: 'Leaderboard', icon: <UserOutlined />, tour: 'nflr-leaderboard' },
  { key: '/nfl-rivals/rulesbook', label: 'Rulesbook', icon: <BookOutlined />, tour: 'nflr-rulesbook' },
  { key: '/nfl-rivals/invite', label: 'Invite My Friends', icon: <UsergroupAddOutlined />, tour: 'nflr-invite' },
]

const NFLR_TOUR = [
  { title: 'Welcome to SAM Rivals', body: 'A quick tour of every tab so you know where to go and what to do. Use Next, or the arrow keys.' },
  { selector: '[data-tour="nflr-overview"]', title: 'Overview', body: 'Your dashboard: division, pod position, the week ahead, and a scoring summary at a glance.' },
  { selector: '[data-tour="nflr-squad"]', title: 'Roster Builder', body: 'Build your roster under the salary cap and set your starters by position. Players lock when their real game kicks off.' },
  { selector: '[data-tour="nflr-market"]', title: 'Player Market', body: 'Search NFL players, check their stats, and sign them to your roster.' },
  { selector: '[data-tour="nflr-pod"]', title: 'Pod', body: 'Your pod of rival managers and the promotion race. See the table and your rank.' },
  { selector: '[data-tour="nflr-matchday"]', title: 'Matchday', body: 'Your weekly head-to-head matchup with live scoring from your starters.' },
  { selector: '[data-tour="nflr-trophies"]', title: 'Trophies', body: 'Everything you have won, plus what is still up for grabs.' },
  { selector: '[data-tour="nflr-history"]', title: 'History', body: 'Your career record season by season, with lifetime stats.' },
  { selector: '[data-tour="nflr-leaderboard"]', title: 'Leaderboard', body: 'Global rankings across every manager and division.' },
  { selector: '[data-tour="nflr-rulesbook"]', title: 'Rulesbook', body: 'The full rules: scoring, salary cap, divisions, and promotion and relegation.' },
  { selector: '[data-tour="nflr-aicoach"]', title: 'AI Coach', body: 'Ask the AI coach about your roster, waivers and matchup. It reads your team and answers in plain language.' },
  { selector: '[data-tour="nflr-invite"]', title: 'Invite My Friends', body: 'Share your link. When someone signs up on it the reward lands in your wallet, and you get a rival worth beating.' },
  { title: 'You are ready', body: 'Fill your roster, set your starters before kickoff, and climb your pod. Reopen this tour any time from How to Play.' },
]

const NFLRivalsSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [tourOpen, setTourOpen] = useState(false)

  // Mobile bottom bar mirrors the sidebar's nav (+ How to Play), reusing the
  // same NAV_ITEMS and active-route logic.
  const mobileItems = [
    ...NAV_ITEMS.map(item => ({
      label: item.label,
      icon: item.icon,
      active: location.pathname === item.key,
      onClick: () => navigate(item.key),
    })),
    {
      label: 'How to Play',
      icon: <QuestionCircleOutlined />,
      active: false,
      onClick: () => setTourOpen(true),
    },
  ]

  return (
    <>
    <div className={`nflr-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand — LEAGUE OF RIVALS wordmark */}
      <div className="nflr-sidebar-brand" onClick={() => navigate('/nfl-rivals')}>
        <span className="nflr-sidebar-mark">S</span>
        {!collapsed && (
          <span className="nflr-sidebar-brandtxt">
            <span className="nflr-sidebar-wordmark"><b>LEAGUE OF</b> RIVALS</span>
            <span className="nflr-sidebar-tagline">Fantasy Sports Reimagined</span>
          </span>
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
              data-tour={item.tour}
              className={`nflr-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.key)}
            >
              <span className="nflr-sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="nflr-sidebar-label">{item.label}</span>}
            </div>
          )
        })}

        {/* How to Play — opens the guided tour, does NOT navigate */}
        <div
          data-tour="nflr-howtoplay"
          className="nflr-sidebar-item"
          onClick={() => setTourOpen(true)}
        >
          <span className="nflr-sidebar-icon"><QuestionCircleOutlined /></span>
          {!collapsed && <span className="nflr-sidebar-label">How to Play</span>}
        </div>
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

      <HowToPlayTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        accent="#7C3AED"
        brand="SAM Rivals"
        steps={NFLR_TOUR}
      />
    </div>

    <MobileBottomNav items={mobileItems} accent="#7C3AED" />
    </>
  )
}

export default NFLRivalsSidebar
