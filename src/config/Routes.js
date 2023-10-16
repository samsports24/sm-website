import { Routes, Route, BrowserRouter, Outlet, useNavigate } from 'react-router-dom'
import PrivateWrapper from './PrivateRoutes'
import Layout from '../layout/Layout'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import ForgotPassword from '../pages/ForgotPassword'
import Authentication from '../pages/Authentication'
import Home from '../pages/Home'
// import Dashboard from '../pages/Dashboard'
import FantasyLeague from '../pages/FantasyLeague'
import ComingSoon from '../pages/CommingSoon'
import LeagueScore from '../pages/LeagueScore'
import GameDetails from '../pages/GameDetails'
import ProfessionalLeague from '../pages/ProfessionalLeague'
import PublicLeague from '../pages/PublicLeague'
import EditProfile from '../pages/EditProfile'
import LeagueStandings from '../pages/LeagueStandings'
import Playoff from '../pages/Playoff'
import DepthChart from '../pages/DepthChart'
import PlayerRoster from '../pages/PlayerRoster'
import PlayerInterface from '../pages/PlayerInterface2'
import TeamSchedule from '../pages/TeamSchedule'
import TeamSetting from '../pages/TeamSettings'
import InjuredReserve from '../pages/InjuredReserve'
import FreeAgent from '../pages/FreeAgent'
import AgentPlayerInterface from '../pages/AgentPlayerInterface'
import PlayerAuction from '../pages/PlayerAuction'
// import PlayerStandings from '../pages/PlayerStandings'
import PlayerLiveAuction from '../pages/PlayerLiveAuction'
import PlayerWinningBid from '../pages/PlayerWinningBid'
import ChooseYourGame from '../pages/ChooseYourGame'
import ChooseYourLeague from '../pages/ChooseYourLeague'
import ChooseYourLeagueStep3 from '../pages/ChooseYourLeagueStep3'
import ChooseYourLeagueStep4 from '../pages/ChooseYourLeague4'
import TermsAndCondition from '../pages/TermsAndCondition'
import LeagueNotification from '../pages/LeagueNotification'
import TotalPayment from '../pages/TotalPayment'
import MyLeague from '../pages/MyLeague'
import League from '../pages/League'
// import Login2 from '../pages/Login2'
// import Players from '../pages/Players'
// import Teams from '../pages/Teams'
// import PlayerDetails from '../pages/PlayerDetails'
// import StandingDetail from '../pages/StandingDetail'
// import PlayerStats from '../pages/PlayerStats'
// import Transactions from '../pages/Transactions'
// import LiveScore from '../pages/LiveScore'
// import Schedule from '../pages/Schedule'
// import AdpReport from '../pages/AdpReport'
// import DraftPicks from '../pages/DraftPicks'
// import AavReport from '../pages/AavReport'
// import RosterWStats from '../pages/RosterWStats'
// import Roster from '../pages/Roster'
// import RosterFullFormat from '../pages/RosterFullFormat'
// import LeagueRules from '../pages/LeagueRules'
// import LeagueCalendar from '../pages/LeagueCalendar'
// import AllReports from '../pages/AllReports'
// import PracticeSquad from '../pages/PracticeSquad'
// import TeamTrade from '../pages/TeamTrade'
// import GmDashboard from '../pages/GmDashboard'

import { version } from './constants'
import { notification } from 'antd'
import { useEffect } from 'react'
import TeamRoster from '../pages/TeamRoster'

const Routers = () => {
  const Component = () => {
    // let token = localStorage.getItem('token')
    // if (token) return <Navigate to={'/dashboard'} />
    // else

    const navigate = useNavigate()

    useEffect(() => {
      if (localStorage.getItem('version') !== version) {
        navigate('/login')
        localStorage.clear()
        localStorage.setItem('version', version)
        notification.error({
          message: `Try login again!`,
          duration: 6,
        })
      }
    }, [])

    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Uncommit next line to apply token security */}
        <Route element={<PrivateWrapper />}>
          {/* <Route path='/dashboard' element={<Dashboard />} /> */}
          <Route path='*' element={<ComingSoon />} />
          <Route path='/leagueScore' element={<LeagueScore />} />
          <Route path='/game-details' element={<GameDetails />} />
          <Route path='/team-setting' element={<TeamSetting />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/team-schedule' element={<TeamSchedule />} />
          <Route path='/injured-reserve' element={<InjuredReserve />} />
          <Route path='/league-notification' element={<LeagueNotification />} />
          <Route path='/player-live-auction/:id' element={<PlayerLiveAuction />} />
          <Route path='/player-interface/:id' element={<PlayerInterface />} />
          <Route path='/professional-league' element={<ProfessionalLeague />} />
          <Route path='/player-roster' element={<PlayerRoster />} />
          <Route path='/team-roster/:id' element={<TeamRoster />} />
          <Route path='/depth-chart' element={<DepthChart />} />
          <Route path='/league-standings' element={<LeagueStandings />} />
          <Route path='/free-agent' element={<FreeAgent />} />
          <Route path='/player-auction' element={<PlayerAuction />} />
          {/* <Route path='/player-standing' element={<PlayerStandings />} /> */}
          <Route path='/player-winning-bid/:id' element={<PlayerWinningBid />} />
          <Route path='/agent-player-interface/:id' element={<AgentPlayerInterface />} />
          {/* <Route path='/teams' element={<Teams />} />
          <Route path='/player-details' element={<PlayerDetails />} />
          <Route path='/players' element={<Players />} />
          <Route path='/standing-detail' element={<StandingDetail />} />
          <Route path='/player-stats' element={<PlayerStats />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/live-score' element={<LiveScore />} />
          <Route path='/schedule' element={<Schedule />} />
          <Route path='/adp-report' element={<AdpReport />} />
          <Route path='/draft-picks' element={<DraftPicks />} />
          <Route path='/aav-report' element={<AavReport />} />
          <Route path='/league-rules' element={<LeagueRules />} />
          <Route path='/league-calendar' element={<LeagueCalendar />} />
          <Route path='/all-reports' element={<AllReports />} />
          <Route path='/coming-soon' element={<ComingSoon />} />
          <Route path='/gm-dashboard' element={<GmDashboard />} />
          <Route path='/team-trade' element={<TeamTrade />} />
          {/* </Layout> */}
        </Route>

        <Route element={<Component />}>
          <Route path='/' element={<Home />} />

          {/* <Route path='/player-auction' element={<ComingSoon />} /> */}
          <Route path='/fantasy-league' element={<FantasyLeague />} />
          <Route path='/choose-your-game-step1' element={<ChooseYourGame />} />
          <Route path='/choose-your-league-step2' element={<ChooseYourLeague />} />
          <Route path='/choose-your-league-step3' element={<ChooseYourLeagueStep3 />} />
          <Route path='/choose-your-league-step4' element={<ChooseYourLeagueStep4 />} />
          <Route path='/total-payment' element={<TotalPayment />} />
          <Route path='/public-league' element={<PublicLeague />} />
          <Route path='/terms-condition' element={<TermsAndCondition />} />
          <Route path='/my-league' element={<MyLeague />} />
          <Route path='/league' element={<League />} />
          <Route path='/playoff' element={<Playoff />} />
          {/* <Route path='/roster-wstats' element={<RosterWStats />} /> */}
          {/* <Route path='/roster' element={<Roster />} /> */}
          {/* <Route path='/roster-fullformat' element={<RosterFullFormat />} /> */}
          {/* <Route path='/practice-squad' element={<PracticeSquad />} /> */}
        </Route>

        {/* <Route path='/login-screen2' element={<Login2 />} /> */}
        <Route path='/login' element={<Login />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/authentication' element={<Authentication />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routers
