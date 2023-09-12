import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import { useEffect } from 'react'
import { version } from './constants'
import { notification } from 'antd'

const PrivateWrapper = () => {
  const { pathname } = useLocation()
  const isAuthenticated = localStorage.getItem('token')
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
}

export default PrivateWrapper
