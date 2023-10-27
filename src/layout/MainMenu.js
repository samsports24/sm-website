import { Button, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

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

import { HiOutlineHome } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar } from 'react-icons/fa'
import { RiAuctionLine, RiDraftLine } from 'react-icons/ri'
import { BsShop } from 'react-icons/bs'
import { GiStarMedal, GiTrade, GiCoins } from 'react-icons/gi'
import { PiUsersThreeLight, PiNotebookLight } from 'react-icons/pi'
import { FaQuestion } from 'react-icons/fa6'
import { SlBookOpen } from 'react-icons/sl'
import { useEffect, useState } from 'react'

const MainMenu = () => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const login = () => navigate('/login')
  const signUp = () => navigate('/sign-up')
  const [active, setActive] = useState('dashboard')

  const { pathname } = useLocation()

  useEffect(() => {
    switch (pathname) {
      case '/fantasy-league': {
        return setActive('home')
      }
      case '/professional-league': {
        return setActive('dashboard')
      }
      case '/player-roster': {
        return setActive('roster')
      }
      case '/depth-chart': {
        return setActive('depth-chart')
      }
      case '/depth-chart': {
        return setActive('depth-chart')
      }
      case '/team-trade': {
        return setActive('trade')
      }
      case '/player-auction': {
        return setActive('auctions')
      }
      case '/injured-reserve': {
        return setActive('injuries-reserve')
      }
      case '/free-agent': {
        return setActive('free-agents')
      }
      case '/league-standings': {
        return setActive('league-standings')
      }
      case '/player-standing': {
        return setActive('player-ranking')
      }
      default:
        setActive('')
    }
  }, [pathname])

  return (
    <>
      <Menu
        theme='dark'
        mode={'inline'}
        // defaultSelectedKeys={[active]}
        className='side_bar_menu_main'
      >
        <Menu.Item
          key='home'
          className={`sidebar-menu ${active === 'home' ? 'activeRoute' : ''}`}
          onClick={() => navigate('/fantasy-league')}
        >
          <div className='sidebar-menu-item-inner'>
            <HiOutlineHome />
            <p>HOME</p>
          </div>
        </Menu.Item>
        {isAuthenticated && (
          <>
            <Menu.Item
              key='dashboard'
              className={`sidebar-menu ${active === 'dashboard' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/professional-league')}
            >
              <div className='sidebar-menu-item-inner'>
                <MdDashboard />
                <p>DASHBOARD</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='roster'
              className={`sidebar-menu ${active === 'roster' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-roster')}
            >
              <div className='sidebar-menu-item-inner'>
                <PiUsersThreeLight />
                <p>ROSTER</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='depth-chart'
              className={`sidebar-menu ${active === 'depth-chart' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/depth-chart')}
            >
              <div className='sidebar-menu-item-inner'>
                <FaRegChartBar />
                <p>DEPTH CHART</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='trade'
              className={`sidebar-menu ${active === 'trade' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/team-trade')}
            >
              <div className='sidebar-menu-item-inner'>
                <GiTrade />
                <p>TRADE</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='auctions'
              className={`sidebar-menu ${active === 'auctions' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-auction')}
            >
              <div className='sidebar-menu-item-inner'>
                <RiAuctionLine />
                <p>AUCTIONS</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='injuries-reserve'
              className={`sidebar-menu ${active === 'injuries-reserve' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/injured-reserve')}
            >
              <div className='sidebar-menu-item-inner'>
                <FaPlusCircle />
                <p>
                  INJURIES <br /> RESERVE
                </p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='free-agents'
              className={`sidebar-menu ${active === 'free-agents' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/free-agent')}
            >
              <div className='sidebar-menu-item-inner'>
                <BsShop />
                <p>FREE AGENTS</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='league-standings'
              className={`sidebar-menu ${active === 'league-standings' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/league-standings')}
            >
              <div className='sidebar-menu-item-inner'>
                <BsShop />
                <p>STANDINGS</p>
              </div>
            </Menu.Item>
            <Menu.Item
              key='player-ranking'
              className={`sidebar-menu ${active === 'player-ranking' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-standing')}
            >
              <div className='sidebar-menu-item-inner'>
                <GiStarMedal />
                <p>
                  PLAYERS <br /> RANKING
                </p>
              </div>
            </Menu.Item>
          </>
        )}
        <Menu.Item key='rules-book' className={'sidebar-menu'} onClick={() => {}}>
          <div className='sidebar-menu-item-inner'>
            <PiNotebookLight />
            <p>RULESBOOK</p>
          </div>
        </Menu.Item>
        <Menu.Item key='draft' className={'sidebar-menu'} onClick={() => {}}>
          <div className='sidebar-menu-item-inner'>
            <RiDraftLine />
            <p>DRAFT</p>
          </div>
        </Menu.Item>
        <Menu.Item key='faq' className={'sidebar-menu'} onClick={() => {}}>
          <div className='sidebar-menu-item-inner'>
            <FaQuestion />
            <p>FAQ</p>
          </div>
        </Menu.Item>
        <Menu.Item
          key='token'
          className={'sidebar-menu'}
          onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
        >
          <div className='sidebar-menu-item-inner'>
            <GiCoins />
            <p>TOKEN</p>
          </div>
        </Menu.Item>
        <Menu.Item
          key='terms'
          className={'sidebar-menu'}
          onClick={() =>
            window.open(
              'https://app.termly.io/document/terms-of-service/372d4c41-9267-4833-8bbb-aba80f6fbbb8',
            )
          }
        >
          <div className='sidebar-menu-item-inner'>
            <SlBookOpen />
            <p>TERMS</p>
          </div>
        </Menu.Item>
        {/* <Menu.Item
          // key='dashboard'
          className={'sidebar-menu'}
          icon={<img src={PlayerIcon} />}
          onClick={() => {
            navigate('/fantasy-league')

            // isAuthenticated ? navigate('/leagueScore') : navigate('/transactions')
          }}
        >
          Fantasy Leagues
        </Menu.Item> */}
        {/* {isAuthenticated && (
          <Menu.Item
            // key='dashboard'
            className={'sidebar-menu'}
            icon={<img src={TeamIcon} />}
            onClick={() => {
              navigate('/professional-league')
            }}
          >
            My Team
          </Menu.Item>
        )} */}
        {/* <Menu.Item
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
          onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
        >
          Token
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
        </Menu.Item> */}
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
