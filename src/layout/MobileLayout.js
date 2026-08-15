import { Layout } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  PiHouse,
  PiBriefcase,
  PiGauge,
  PiUsersThree,
  PiListChecks,
  PiClipboardText,
  PiBuildings,
  PiTrophy,
  PiListNumbers,
  PiBroadcast,
  PiArrowsLeftRight,
  PiGavel,
  PiFirstAid,
  PiNotebook,
  PiTreeStructure,
  PiMedal,
  PiChartLineUp,
  PiHeartbeat,
  PiMagnifyingGlass,
  PiChatCircle,
  PiUsersFour,
  PiTarget,
  PiBookOpen,
} from 'react-icons/pi'

import MenuDrawer from './MenuDrawer'
import MobileBottomNav from '../components/MobileBottomNav'

const { Content } = Layout

const MobileLayout = ({ active, children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Flat bottom-bar destinations mirroring the Dynasty main menu.
  const bottomNavItems = [
    { label: 'Home', icon: <PiHouse />, path: '/homepage' },
    { label: 'Front Office', icon: <PiBriefcase />, path: '/front-office' },
    { label: 'Dashboard', icon: <PiGauge />, path: '/dashboard' },
    { label: 'Roster', icon: <PiUsersThree />, path: '/player-roster' },
    { label: 'Starters', icon: <PiListChecks />, path: '/depth-chart' },
    { label: 'Roster Board', icon: <PiClipboardText />, path: '/roster-board' },
    { label: 'Stadium', icon: <PiBuildings />, path: '/stadium' },
    { label: 'My Leagues', icon: <PiTrophy />, path: '/my-league' },
    { label: 'Standings', icon: <PiListNumbers />, path: '/league-standings' },
    { label: 'Live Scoring', icon: <PiBroadcast />, path: '/leagueScore' },
    { label: 'Trade', icon: <PiArrowsLeftRight />, path: '/team-trade' },
    { label: 'Auctions', icon: <PiGavel />, path: '/player-auction' },
    { label: 'Injured Reserve', icon: <PiFirstAid />, path: '/injured-reserve' },
    { label: 'Draft', icon: <PiNotebook />, path: '/live-draft' },
    { label: 'Playoffs', icon: <PiTreeStructure />, path: '/playoff' },
    { label: 'GM Challenge', icon: <PiMedal />, path: '/gm-challenge' },
    { label: 'Values', icon: <PiChartLineUp />, path: '/values' },
    { label: 'Injury Report', icon: <PiHeartbeat />, path: '/injury-report' },
    { label: 'Search', icon: <PiMagnifyingGlass />, path: '/search-player' },
    { label: 'Chat', icon: <PiChatCircle />, path: '/chat' },
    { label: 'Clubhouse', icon: <PiUsersFour />, path: '/clubhouse' },
    { label: 'Predictor', icon: <PiTarget />, path: '/nfl-predictor' },
    { label: 'Rules', icon: <PiBookOpen />, path: '/rule-book' },
  ]

  const items = bottomNavItems.map((it) => ({
    label: it.label,
    icon: it.icon,
    active:
      location.pathname === it.path ||
      location.pathname.startsWith(it.path + '/'),
    onClick: () => navigate(it.path),
  }))

  return (
    <Layout className='m-layout'>
      <div className='mobile-header'>
        <MenuDrawer active={active} />
        {/* <Switch
          className='themeSwitch'
          defaultChecked={theme === 'light' ? false : true}
          checkedChildren={<MdDarkMode style={{ fontSize: '20px', marginRight: '5px' }} />}
          unCheckedChildren={<MdOutlineDarkMode style={{ fontSize: '20px', marginLeft: '5px' }} />}
          onChange={() => dispatch(toggleTheme())}
        /> */}
      </div>
      <Content className='m-children'>{children}</Content>
      <MobileBottomNav items={items} accent="#7C3AED" />
    </Layout>
  )
}

export default MobileLayout
