import { useEffect, useState } from 'react'
import { Button, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { HiOutlineHome } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar } from 'react-icons/fa'
import { RiAuctionLine, RiDraftLine } from 'react-icons/ri'
import { BsShop } from 'react-icons/bs'
import { GiStarMedal, GiTrade, GiCoins } from 'react-icons/gi'
import { PiUsersThreeLight, PiNotebookLight } from 'react-icons/pi'
import { FaQuestion } from 'react-icons/fa6'

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
      <div className='sidebar_menu'>
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
              onClick={() => navigate('/professional-league')}
            >
              <MdDashboard />
              <p>DASHBOARD</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'roster' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-roster')}
            >
              <PiUsersThreeLight />
              <p>roster</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'depth-chart' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/depth-chart')}
            >
              <FaRegChartBar />
              <p>DEPTH CHART</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'trade' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/team-trade')}
            >
              <GiTrade />
              <p>trade</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'auctions' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-auction')}
            >
              <RiAuctionLine />
              <p>auctions</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'injuries-reserve' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/injured-reserve')}
            >
              <FaPlusCircle />
              <p>injuries reserve</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'free-agents' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/free-agent')}
            >
              <BsShop />
              <p>free agents</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'league-standings' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/league-standings')}
            >
              <BsShop />
              <p>STANDINGS</p>
            </div>
            <div
              className={`sidebar_menu_item ${active === 'player-ranking' ? 'activeRoute' : ''}`}
              onClick={() => navigate('/player-standing')}
            >
              <GiStarMedal />
              <p>players ranking</p>
            </div>
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
          onClick={() => {}}
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
