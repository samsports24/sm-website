import { Button, Menu } from 'antd'
import { useNavigate } from 'react-router-dom'

// Icons Image
import ScoreIcon from '../assets/score-icon.svg'
import TeamIcon from '../assets/team-icon.svg'
import StandingIcon from '../assets/standing-icon.svg'
import LeagueIcon from '../assets/league-icon.svg'
// import { TbLayoutDashboard } from 'react-icons/tb'
// import NewsIcon from '../assets/news-icon.svg'
// import ScheduleIcon from '../assets/schedule-icon.svg'
// import PlayerIcon from '../assets/player-icon.svg'
// import StatIcon from '../assets/stats-icon.svg'
// import EventIcon from '../assets/event-icon.svg'

// React Icons
import { BsGlobe2 } from 'react-icons/bs'
import { MdOutlineSportsRugby, MdStarOutline } from 'react-icons/md'
import { GiBinoculars } from 'react-icons/gi'
import { FiPhone } from 'react-icons/fi'

const MainMenu = ({ active }) => {
  const isAuthenticated = localStorage.getItem('token')
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
          icon={<BsGlobe2 size={22} />}
          onClick={() => navigate('/')}
        >
          Home
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<MdOutlineSportsRugby size={22} />}
          onClick={() => {
            isAuthenticated ? navigate('/leagueScore') : navigate('/transactions')
          }}
        >
          Fantasy Leagues
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<GiBinoculars size={22} />}
          onClick={() => navigate('/')}
        >
          Scouting
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={StandingIcon} />}
          onClick={() => navigate('/teams')}
        >
          NFT Games
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
          icon={<MdStarOutline size={22} />}
          onClick={() => navigate('/players')}
        >
          Legends
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={ScoreIcon} />}
          onClick={() => navigate('/dashboard')}
        >
          SAM Sports Token
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={TeamIcon} />}
          onClick={() => navigate('/')}
        >
          About Us
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<FiPhone size={22} />}
          onClick={() => navigate('/')}
        >
          Contact Us
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
