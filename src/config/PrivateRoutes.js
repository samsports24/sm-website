import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import { useEffect } from 'react'
import { version } from './constants'
import { notification } from 'antd'
import { useSelector } from 'react-redux'

const PrivateWrapper = () => {
  const { pathname } = useLocation()
  const isAuthenticated = localStorage.getItem('token')
  const user = useSelector((state) => state.user.userDetails)


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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (isAuthenticated) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  } else {
    return <Navigate to='/login' />
  }

  // if (isAuthenticated && user?.team?.currentLeague) {
  //   return (
  //     <Layout>
  //       <Outlet />
  //     </Layout>
  //   )
  // } else if(!user?.team?.currentLeague){
  //   return <Navigate to='/my-league' />

  // } else {
  //   return <Navigate to='/login' />
  // }
}

export default PrivateWrapper
