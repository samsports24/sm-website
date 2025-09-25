import { useEffect, useState } from 'react'
import { Button, notification } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { HiOutlineHome } from 'react-icons/hi'
import { MdDashboard, MdOutlineStadium } from 'react-icons/md'
import { FaPlusCircle, FaRegChartBar } from 'react-icons/fa'
import { RiAuctionLine, RiDraftLine } from 'react-icons/ri'
import { SiLeagueoflegends,SiWechat } from 'react-icons/si'

import { BsShop } from 'react-icons/bs'
import {
  GiStarMedal,
  GiTrade,
  GiCoins,
  GiBabyfootPlayers,
  GiAmericanFootballPlayer,
} from 'react-icons/gi'
import { RxEnvelopeClosed } from 'react-icons/rx'

import { PiUsersThreeLight, PiNotebookLight,PiMagnifyingGlassLight } from 'react-icons/pi'


import { TbLivePhoto } from 'react-icons/tb'
import { AiOutlineSetting } from 'react-icons/ai'
import comissioner from '../assets/comissioner.png'
import { useSelector } from 'react-redux'
import { landingSignup } from '../config/constants'
import LoginDropdown from './LoginDropdown'

import Community from '../assets/community.png'
import Job from '../assets/job.png'
import Support from '../assets/support.png'
import FAQ from '../assets/faq.png'
import { clearChatNotification, clearNotification, getAllChatNotification, getAllNotification } from '../redux/actions/notificationAction'
import { getUser } from '../redux'
import { getchatacount } from '../redux/actions/chatAction'

const MainMenu = ({ visible }) => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()
  const login = () => navigate('/login')
  const signUp = () => navigate('/sign-up')
  const [active, setActive] = useState('dashboard')
  const user = useSelector((state) => state.user.userDetails)
  const isdraftlive = user?.team?.currentLeague?.isDraftLive
  const isdrafpaused = user?.team?.currentLeague?.draftPaused
 
  const [filteredCount, setFilteredCount] = useState(0)
  const SETTING = useSelector((state) => state?.user)
  const { pathname } = useLocation()

  // console.log('check', isdraftlive)
  
// console.log('user',user?._id);


useEffect(()=>{
  getUser()
})

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
      // case '/free-agent': {
      //   return setActive('free-agents')
      // }
      case '/league-rosters': {
        return setActive('league-rosters')
      }
      case '/league-standings': {
        return setActive('league-standings')
      }
      // case '/player-standing-weekly': {
      //   return setActive('player-ranking')
      // }
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
      case '/stadium': {
        return setActive('stadium')
      }
      case '/clubhouse': {
        return setActive('clubhouse')
      }

      case '/my-league': {
        return setActive('my-league')
      }
      case '/comissioner': {
        return setActive('comissioner')
      }

      case '/rule-book': {
        return setActive('rule-book')
      }

      case '/search-player': {
        return setActive('/search-player')
      }

      case '/chat': {
        return setActive('/chat')
      }

      // case '/team-schedule': {
      //   return setActive('team-schedule')
      // }
      default:
        setActive('')
    }
  }, [pathname])


  useEffect(() => {
    getData()
  }, [user])

  const getData = async () => {
    try {

      if (isAuthenticated){

      const res = await getchatacount();
console.log('res',res);

     
       setFilteredCount(res?.count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    
    }
  };

  // console.log('char notification',chatnotificationData);
  console.log('filteredCount',filteredCount);
  
  

  const handleClick = () => {
    if (filteredCount > 0) {
      clearChatNotification();
    }
    navigate('/chat');
  };

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
      <div className='sidebar_menu no-scrollbar'>
        <div className='wrapper'>
          <div
            className={`sidebar_menu_item ${active === 'home' ? 'activeRoute' : ''}`}
            onClick={() => navigate('/fantasy-league')}
          >
            <HiOutlineHome />
            <p>HOME</p>
          </div>
          {isAuthenticated ? (
       isdraftlive  ? (
              <>
                <div
                  className={`sidebar_menu_item ${active === 'team-setting' ? 'activeRoute' : ''}`}
                  onClick={() => navigate('/team-setting')}
                >
                  <AiOutlineSetting />
                  <p>team setting</p>
                </div>
                
                <div
                  className={`sidebar_menu_item ${active === 'draft' ? 'activeRoute' : ''}`}
                  onClick={() => navigate('/live-draft')}
                >
                  <RiDraftLine />
                  <p>draft</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`sidebar_menu_item ${active === 'dashboard' ? 'activeRoute' : ''}`}
                  onClick={() => navigatePath('/professional-league')}
                >
                  <MdDashboard />
                  <p>DASHBOARD</p>
                </div>

                <div
                  className={`sidebar_menu_item ${active === 'draft' ? 'activeRoute' : ''}`}
                  onClick={() => navigate('/live-draft')}
                >
                  <RiDraftLine />
                  <p>draft</p>
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
                  onClick={() => navigatePath('/player-auction')}
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
                {/* <div
                  className={`sidebar_menu_item ${active === 'free-agents' ? 'activeRoute' : ''}`}
                  onClick={() => navigatePath('/free-agent')}
                >
                  <BsShop />
                  <p>
                    free
                    <br /> agents
                  </p>
                </div> */}
                <div
                  className={`sidebar_menu_item ${
                    active === 'league-rosters' ? 'activeRoute' : ''
                  }`}
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
                {/* <div
                  className={`sidebar_menu_item ${
                    active === 'player-ranking' ? 'activeRoute' : ''
                  }`}
                  onClick={() => navigatePath('/player-standing-weekly')}
                >
                  <GiStarMedal />
                  <p>players ranking</p>
                </div> */}
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

                <div
                  className={`sidebar_menu_item ${active === 'stadium' ? 'activeRoute' : ''}`}
                  onClick={() => navigatePath('/stadium')}
                >
                  <MdOutlineStadium />
                  <p>Stadium</p>
                </div>

                <div
                  className={`sidebar_menu_item ${active === 'search-player' ? 'activeRoute' : ''}`}
                  onClick={() => navigatePath('/search-player')}
                >
                  <PiMagnifyingGlassLight />
                  <p>Player Search</p>
                </div>

                <div
                  className={`sidebar_menu_item ${active === 'chat' ? 'activeRoute' : ''}`}
                  onClick={handleClick}
                  // onClick={() =>   
                  //   navigatePath('/chat')}
                >
         {filteredCount > 0 && (
        <span style={{ color: 'red', fontSize: '15px' }}>
          {filteredCount}
        </span>
      )}
                  <SiWechat />
                  <p>Chat</p>
                </div>

                <div
                  className={`sidebar_menu_item ${active === 'clubhouse' ? 'activeRoute' : ''}`}
                  onClick={() => navigatePath('/clubhouse')}
                >
                  <RxEnvelopeClosed />
                  <p>Club House</p>
                </div>

                {/* {(user?.team?.currentLeague?.createdBy === user?._id ||
                  user?.team?.currentLeague?.coComissioner === user?._id) && (
                  <div
                    className={`sidebar_menu_item ${active === 'comissioner' ? 'activeRoute' : ''}`}
                    onClick={() => navigate('/comissioner')}
                  >
                    <img src={comissioner} width={'30px'} height={'30px'} />
                    <p>Comissioner</p>
                  </div>
                )} */}
                <div
                    className={`sidebar_menu_item ${active === 'comissioner' ? 'activeRoute' : ''}`}
                    onClick={() => navigate('/comissioner')}
                  >
                    <img src={comissioner} width={'30px'} height={'30px'} />
                    <p>Comissioner</p>
                  </div>
              </>
            )
          ) : null}
          {
          <div
            className={`sidebar_menu_item ${active === 'rules-book' ? 'activeRoute' : ''}`}
            onClick={() => {
              navigate('/rule-book')
            }}
          >
            <PiNotebookLight />
            <p>RULESBOOK</p>
          </div>
          }

          <div
            className={`sidebar_menu_item ${active === 'job-search' ? 'activeRoute' : ''}`}
            onClick={() => {}}
          >
            <img src={Job} width={32} />
            <p>Job Search</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'Community' ? 'activeRoute' : ''}`}
            onClick={() => {}}
          >
            <img src={Community} width={32} />
            <p>Community</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'token' ? 'activeRoute' : ''}`}
            onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
          >
            <GiCoins />
            <p>sams token</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'faq' ? 'activeRoute' : ''}`}
            onClick={() => {}}
          >
            <img src={FAQ} width={32} />
            <p>faq</p>
          </div>
          <div
            className={`sidebar_menu_item ${active === 'support' ? 'activeRoute' : ''}`}
            onClick={() => window.open('https://discord.gg/pAb5B7Npmy')}
          >
            <img src={Support} width={32} />
            <p>Support</p>
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

{
  /* <div className='wrapper'>
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
     onClick={() => navigatePath('/player-auction')}
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
     onClick={() => navigatePath('/free-agent')}
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
 onClick={() => navigate('/live-draft')}
>
 <RiDraftLine />
 <p>draft</p>
</div>
<div
 className={`sidebar_menu_item ${active === 'job-search' ? 'activeRoute' : ''}`}
 onClick={() => {}}
>
 <img src={Job} width={32} />
 <p>Job Search</p>
</div>
<div
 className={`sidebar_menu_item ${active === 'Community' ? 'activeRoute' : ''}`}
 onClick={() => {}}
>
 <img src={Community} width={32} />
 <p>Community</p>
</div>
<div
 className={`sidebar_menu_item ${active === 'token' ? 'activeRoute' : ''}`}
 onClick={() => window.open('https://sam-wallet-10b1f.web.app/')}
>
 <GiCoins />
 <p>sams token</p>
</div>
<div
 className={`sidebar_menu_item ${active === 'faq' ? 'activeRoute' : ''}`}
 onClick={() => {}}
>
 <img src={FAQ} width={32} />

 <p>faq</p>
</div>
<div
 className={`sidebar_menu_item ${active === 'support' ? 'activeRoute' : ''}`}
 onClick={() => window.open('https://discord.gg/pAb5B7Npmy')}
>
 <img src={Support} width={32} />
 <p>Support</p>
</div>
</div> */
}
