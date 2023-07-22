import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
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
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import PlayerDetails from '../pages/PlayerDetails'
// import PrivateWrapper from './PrivateRoutes'

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Uncommit next line to apply token security */}
        <Route element={<PrivateWrapper />}>
          {/* <Layout active={'dashboard'}> */}
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='*' element={<Navigate to='/' />} />
          {/* </Layout> */}
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='/login-screen2' element={<Login2 />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/authentication' element={<Authentication />} />
        <Route path='/edit-profile' element={<EditProfile />} />
        <Route path='/players' element={<Players />} />
        <Route path='/teams' element={<Teams />} />
        <Route path='/leagueScore' element={<LeagueScore />} />
        <Route path='/player-details' element={<PlayerDetails />} />






      </Routes>
    </BrowserRouter>
  )
}

export default Routers
