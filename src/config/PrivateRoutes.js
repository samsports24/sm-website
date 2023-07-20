import { Navigate, Outlet } from 'react-router-dom'

const PrivateWrapper = () => {
  const isAuthenticated = localStorage.getItem('token')

  if (isAuthenticated) {
    return <Outlet />
  } else {
    return <Navigate to='/login' />
  }
}

export default PrivateWrapper
