import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import PrivateWrapper from './PrivateRoutes'
// import Layout from '../layout/Layout'

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Uncommit next line to apply token security */}
        <Route element={<PrivateWrapper />}>
          {/* <Layout active={'dashboard'}> */}
            <Route path='/' element={<Dashboard />} />
            <Route path='*' element={<Navigate to='/' />} />
          {/* </Layout> */}
        </Route>

        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routers
