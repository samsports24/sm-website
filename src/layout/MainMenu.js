import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
// import { TbLayoutDashboard } from 'react-icons/tb'
import NewsIcon from '../assets/news-icon.svg'
import ScoreIcon from '../assets/score-icon.svg'
import ScheduleIcon from '../assets/schedule-icon.svg'
import TeamIcon from '../assets/team-icon.svg'
import PlayerIcon from '../assets/player-icon.svg'
import StatIcon from '../assets/stats-icon.svg'
import StandingIcon from '../assets/standing-icon.svg'
import EventIcon from '../assets/event-icon.svg'
const MainMenu = ({ active }) => {
  const navigate = useNavigate()

  return (
    <Menu
      theme='dark'
      mode={'inline'}
      defaultSelectedKeys={[active]}
      style={{
        background: "#140F26",
        // background: 'var(--sidebar)',
        minHeight: '83vh',
      }}
    >
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={NewsIcon} />}
        onClick={() => navigate('/')}
      >
        News
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={ScoreIcon} />}
        onClick={() => navigate('/')}
      >
        Scores
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={ScheduleIcon} />}
        onClick={() => navigate('/')}
      >
        Schedule
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={TeamIcon} />}
        onClick={() => navigate('/')}
      >
        Teams
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={PlayerIcon} />}
        onClick={() => navigate('/')}
      >
        Players
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={StatIcon} />}
        onClick={() => navigate('/')}
      >
        Stats
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={StandingIcon} />}
        onClick={() => navigate('/')}
      >
        Standings
      </Menu.Item>
      <Menu.Item
        // key='dashboard'
        className={'sidebar-menu'}
        icon={<img src={EventIcon} />}
        onClick={() => navigate('/')}
      >
        Events
      </Menu.Item>
    </Menu>
  )
}

export default MainMenu
