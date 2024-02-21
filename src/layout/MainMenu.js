import { useEffect, useState } from 'react'
import { Button, notification } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { HiOutlineHome } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar } from 'react-icons/fa'
import { RiAuctionLine, RiDraftLine } from 'react-icons/ri'
import { SiLeagueoflegends } from 'react-icons/si'
import { BsShop } from 'react-icons/bs'
import {
  GiStarMedal,
  GiTrade,
  GiCoins,
  GiBabyfootPlayers,
  GiAmericanFootballPlayer,
} from 'react-icons/gi'
import { PiUsersThreeLight, PiNotebookLight } from 'react-icons/pi'
import { FaQuestion } from 'react-icons/fa6'
import { TbLivePhoto } from 'react-icons/tb'
import { AiOutlineSetting, AiOutlineSchedule } from 'react-icons/ai'
import comissioner from '../assets/comissioner.png'
import { useSelector } from 'react-redux'
import { landingSignup } from '../config/constants'
import LoginDropdown from './LoginDropdown'

const MainMenu = ({ visible }) => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const login = () => navigate('/login')
  const signUp = () => navigate('/sign-up')
  const [active, setActive] = useState('dashboard')
  const user = useSelector((state) => state.user.userDetails)

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
      case '/league-rosters': {
        return setActive('league-rosters')
      }
      case '/league-standings': {
        return setActive('league-standings')
      }
      case '/player-standing-weekly': {
        return setActive('player-ranking')
      }
      // case '/player-standing': {
      //   return setActive('player-ranking')
      // }
      case '/leagueScore': {
        return setActive('leagueScore')
      }
      case '/playoff': {
        return setActive('playoff')
      }
      case '/team-setting': {
        return setActive('team-setting')
      }
      case '/my-league': {
        return setActive('my-league')
      }
      case '/comissioner': {
        return setActive('comissioner')
      }
      // case '/team-schedule': {
      //   return setActive('team-schedule')
      // }
      default:
        setActive('')
    }
  }, [pathname])

  const navigatePath = (path) => {
    if (user?.team?.currentLeague?._id) {
      navigate(path)
    } else {
      notification.error({
        message: 'Please select any league from my leagues section first.',
        duration: 6,
      })
    }
  }

  return (
    <>
      <div className='sidebar_menu'>
        <div className='wrapper'>
          <div
            className={`sidebar_menu_item ${active === 'home' ? 'activeRoute' : ''}`}
            onClick={() => navigate('/fantasy-league')}
          >
            <HiOutlineHome />
            <p>HOME</p>
          </div>
          {isAuthenticated && (
            <>
              <div
                className={`sidebar_menu_item ${active === 'dashboard' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/professional-league')}
              >
                <MdDashboard />
                <p>DASHBOARD</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'roster' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/player-roster')}
              >
                <PiUsersThreeLight />
                <p>roster</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'depth-chart' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/depth-chart')}
              >
                <FaRegChartBar />
                <p>starters</p>
              </div>

              <div
                className={`sidebar_menu_item ${active === 'my-league' ? 'activeRoute' : ''}`}
                onClick={() => navigate('/my-league')}
              >
                <SiLeagueoflegends />
                <p>My Leagues</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'trade' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/team-trade')}
              >
                <GiTrade />
                <p>trade</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'auctions' ? 'activeRoute' : ''}`}
                // onClick={() => navigatePath('/player-auction')}
              >
                <RiAuctionLine />
                <p>auctions</p>
              </div>
              <div
                className={`sidebar_menu_item ${
                  active === 'injuries-reserve' ? 'activeRoute' : ''
                }`}
                onClick={() => navigatePath('/injured-reserve')}
              >
                <FaPlusCircle />
                <p>injuries reserve</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'free-agents' ? 'activeRoute' : ''}`}
                // onClick={() => navigatePath('/free-agent')}
              >
                <BsShop />
                <p>
                  free
                  <br /> agents
                </p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'league-rosters' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/league-rosters')}
              >
                <GiAmericanFootballPlayer />
                <p>
                  league <br /> rosters
                </p>
              </div>
              <div
                className={`sidebar_menu_item ${
                  active === 'league-standings' ? 'activeRoute' : ''
                }`}
                onClick={() => navigatePath('/league-standings')}
              >
                <BsShop />
                <p>STANDINGS</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'player-ranking' ? 'activeRoute' : ''}`}
                // onClick={() => navigatePath('/player-standing')}
                onClick={() => navigatePath('/player-standing-weekly')}
              >
                <GiStarMedal />
                <p>players ranking</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'leagueScore' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/leagueScore')}
              >
                <TbLivePhoto />
                <p>live scoring</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'playoff' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/playoff')}
              >
                <GiBabyfootPlayers />
                <p>playoff</p>
              </div>
              <div
                className={`sidebar_menu_item ${active === 'team-setting' ? 'activeRoute' : ''}`}
                onClick={() => navigatePath('/team-setting')}
              >
                <AiOutlineSetting />
                <p>team setting</p>
              </div>

              {(user?.team?.currentLeague?.createdBy === user?._id ||
                user?.team?.currentLeague?.coComissioner === user?._id) && (
                <div
                  className={`sidebar_menu_item ${active === 'comissioner' ? 'activeRoute' : ''}`}
                  onClick={() => navigate('/comissioner')}
                >
                  <img src={comissioner} width={'30px'} height={'30px'} />
                  <p>Comissioner</p>
                </div>
              )}
              {/* <div
              className={`sidebar_menu_item ${active === 'team-schedule' ? 'activeRoute' : ''}`}
              onClick={() => navigatePath('/team-schedule')}
            >
              <AiOutlineSchedule />
              <p>team schedule</p>
            </div> */}
            </>
          )}
          <div
            className={`sidebar_menu_item ${active === 'rules-book' ? 'activeRoute' : ''}`}
            onClick={() => {}}
          >
            <PiNotebookLight />
            <p>RULESBOOK</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'draft' ? 'activeRoute' : ''}`}
            onClick={() => navigate('/drafts')}
          >
            <RiDraftLine />
            <p>draft</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'faq' ? 'activeRoute' : ''}`}
            onClick={() => {}}
          >
            <FaQuestion />
            <p>faq</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'token' ? 'activeRoute' : ''}`}
            onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
          >
            <GiCoins />
            <p>token</p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <LoginDropdown loginFromSideMenu drawerVisible={visible} />
          <Button className='login-btn signup-btn mobile' onClick={landingSignup}>
            Sign Up
          </Button>
        </div>
      )}

      {/* <Button className='login-btn mobile' onClick={login}>
        Login
      </Button>
      <Button className='login-btn signup-btn mobile' onClick={signUp}>
        Sign Up
      </Button> */}
    </>
  )
}

export default MainMenu
