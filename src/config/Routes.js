import { Routes, Route, BrowserRouter, Navigate, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import PrivateWrapper from './PrivateRoutes'
// import Layout from '../layout/Layout'
import Login2 from '../pages/Login2'
import SignUp from '../pages/SignUp'
import ForgotPassword from '../pages/ForgotPassword'
import Authentication from '../pages/Authentication'
import EditProfile from '../pages/EditProfile'
import Players from '../pages/Players'
import Teams from '../pages/Teams'
import LeagueScore from '../pages/LeagueScore'
import GameDetails from '../pages/GameDetails'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import PlayerDetails from '../pages/PlayerDetails'
import Layout from '../layout/Layout'
import LeagueStandings from '../pages/LeagueStandings'
import StandingDetail from '../pages/StandingDetail'
import PlayerStats from '../pages/PlayerStats'
import Transactions from '../pages/Transactions'
import LiveScore from '../pages/LiveScore'
import Playoff from '../pages/Playoff'
import Schedule from '../pages/Schedule'
import AdpReport from '../pages/AdpReport'
import DraftPicks from '../pages/DraftPicks'
import AavReport from '../pages/AavReport'
import RosterWStats from '../pages/RosterWStats'
import Roster from '../pages/Roster'
import RosterFullFormat from '../pages/RosterFullFormat'
import FantasyLeague from '../pages/FantasyLeague'
import ProfessionalLeague from '../pages/ProfessionalLeague'
import DepthChart from '../pages/DepthChart'
import PlayerRoster from '../pages/PlayerRoster'
import ComingSoon from '../pages/CommingSoon'
import LeagueRules from '../pages/LeagueRules'
import LeagueCalendar from '../pages/LeagueCalendar'
import AllReports from '../pages/AllReports'
import PlayerInterface from '../pages/PlayerInterface2'
import PracticeSquad from '../pages/PracticeSquad'
import TeamTrade from '../pages/TeamTrade'
import TeamSchedule from '../pages/TeamSchedule'
import TeamSetting from '../pages/TeamSettings'
import InjuredReserve from '../pages/InjuredReserve'
import FreeAgent from '../pages/FreeAgent'
import AgentPlayerInterface from '../pages/AgentPlayerInterface'
import GmDashboard from '../pages/GmDashboard'
import PlayerAuction from '../pages/PlayerAuction'
import PlayerStandings from '../pages/PlayerStandings'

// import PrivateWrapper from './PrivateRoutes'

const Routers = () => {
  const Component = () => {
    let token = localStorage.getItem('token')
    if (token) return <Navigate to={'/dashboard'} />
    else
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
          {/* <Layout active={'dashboard'}> */}
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/fantasy-league' element={<FantasyLeague />} />
          <Route path='*' element={<Navigate to='/' />} />
          <Route path='/teams' element={<Teams />} />
          <Route path='/leagueScore' element={<LeagueScore />} />
          <Route path='/game-details' element={<GameDetails />} />
          <Route path='/player-details' element={<PlayerDetails />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/players' element={<Players />} />
          <Route path='/league-standings' element={<LeagueStandings />} />
          <Route path='/standing-detail' element={<StandingDetail />} />
          <Route path='/player-stats' element={<PlayerStats />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/live-score' element={<LiveScore />} />
          <Route path='/playoff' element={<Playoff />} />
          <Route path='/schedule' element={<Schedule />} />
          <Route path='/adp-report' element={<AdpReport />} />
          <Route path='/draft-picks' element={<DraftPicks />} />
          <Route path='/aav-report' element={<AavReport />} />
          <Route path='/roster-wstats' element={<RosterWStats />} />
          <Route path='/roster' element={<Roster />} />
          <Route path='/player-roster' element={<PlayerRoster />} />
          <Route path='/roster-fullformat' element={<RosterFullFormat />} />
          <Route path='/league-rules' element={<LeagueRules />} />
          <Route path='/league-calendar' element={<LeagueCalendar />} />
          <Route path='/all-reports' element={<AllReports />} />
          <Route path='/professional-league' element={<ProfessionalLeague />} />
          <Route path='/depth-chart' element={<DepthChart />} />
          <Route path='/coming-soon' element={<ComingSoon />} />
          <Route path='/practice-squad' element={<PracticeSquad />} />

          <Route path='/player-interface' element={<PlayerInterface />} />
          <Route path='/agent-player-interface' element={<AgentPlayerInterface />} />
          <Route path='/gm-dashboard' element={<GmDashboard />} />
          <Route path='/team-trade' element={<TeamTrade />} />
          <Route path='/team-schedule' element={<TeamSchedule />} />
          <Route path='/team-setting' element={<TeamSetting />} />
          <Route path='/injured-reserve' element={<InjuredReserve />} />
          <Route path='/free-agent' element={<FreeAgent />} />
          <Route path='/player-auction' element={<PlayerAuction />} />
          <Route path='/player-standing' element={<PlayerStandings />} />
          {/* </Layout> */}
        </Route>

        <Route element={<Component />}>
          <Route path='/' element={<Home />} />
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='/login-screen2' element={<Login2 />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/authentication' element={<Authentication />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routers
