import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Layout from '../layout/Layout'
import { useEffect } from 'react'

const PrivateWrapper = () => {
  const { pathname } = useLocation()
  const isAuthenticated = localStorage.getItem('token')

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
