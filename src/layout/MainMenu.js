import { Button, Menu } from 'antd'
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
import LeagueIcon from '../assets/league-icon.svg'

const MainMenu = ({ active }) => {
  const navigate = useNavigate()
  const login = () => navigate('/login')
  const signUp = () => navigate('/sign-up')

  return (
    <>
      <Menu
        theme='dark'
        mode={'inline'}
        defaultSelectedKeys={[active]}
        style={{
          background: '#140F26',
          // background: 'var(--sidebar)',
          minHeight: '65vh',
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
          onClick={() => navigate('/teams')}
        >
          Teams
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={LeagueIcon} />}
          onClick={() => navigate('/')}
        >
          League
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={PlayerIcon} />}
          onClick={() => navigate('/players')}
        >
          Players
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={StatIcon} />}
          onClick={() => navigate('/dashboard')}
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
      <Button className='login-btn mobile' onClick={login}>
        Login
      </Button>
      <Button className='login-btn signup-btn mobile' onClick={signUp}>
        Sign Up
      </Button>
    </>
  )
}

export default MainMenu
