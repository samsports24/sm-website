import { Button, Menu } from 'antd'
import { useNavigate } from 'react-router-dom'

// Icons Image
import ScoreIcon from '../assets/score-icon.svg'
import TeamIcon from '../assets/team-icon.svg'
import StandingIcon from '../assets/standing-icon.svg'
import LeagueIcon from '../assets/league-icon.svg'
import PlayerIcon from '../assets/player-icon.svg'
import ScoutingIcon from '../assets/scouting-icon.svg'
import StarIcon from '../assets/star-icon.svg'
import PhoneIcon from '../assets/phone-icon.svg'
import GlobeIcon from '../assets/globe-icon.svg'

const MainMenu = ({ active }) => {
  // const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const login = () => navigate('/login')
  const signUp = () => navigate('/sign-up')

  return (
    <>
      <Menu
        theme='dark'
        mode={'inline'}
        defaultSelectedKeys={[active]}
        className='side_bar_menu_main'
      >
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={GlobeIcon} />}
          onClick={() => navigate('/')}
        >
          Home
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={PlayerIcon} />}
          onClick={() => {
            navigate('/fantasy-league')

            // isAuthenticated ? navigate('/leagueScore') : navigate('/transactions')
          }}
        >
          Fantasy Leagues
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={ScoutingIcon} />}
          onClick={() => navigate('/scouting')}
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
          onClick={() => navigate('/leagues')}
        >
          League
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={StarIcon} />}
          onClick={() => navigate('/players')}
        >
          Legends
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={ScoreIcon} />}
          onClick={() => navigate('/token')}
        >
          SAM Sports Token
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={TeamIcon} />}
          onClick={() => navigate('/about')}
        >
          About Us
        </Menu.Item>
        <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={PhoneIcon} />}
          onClick={() => navigate('/contact')}
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
