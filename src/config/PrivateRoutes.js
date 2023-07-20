import { Navigate, Outlet } from 'react-router-dom'
import Layout from '../layout/Layout'

const PrivateWrapper = () => {
  const isAuthenticated = localStorage.getItem('token')

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
