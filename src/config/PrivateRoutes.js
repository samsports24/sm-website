import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import { useEffect } from 'react'
import { version } from './constants'
import { notification } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { removeLeague } from '../redux'

const PrivateWrapper = () => {
  const { pathname } = useLocation()
  const isAuthenticated = localStorage.getItem('token')
  const user = useSelector((state) => state.user.userDetails)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const _version = localStorage.getItem('version')
    if (_version && _version !== version) {
      localStorage.clear()
      localStorage.setItem('version', version)
      dispatch(removeLeague())
      setTimeout(() => {
        navigate('/fantasy-league')
        notification.error({
          message: `Try Login Again!`,
          duration: 6,
        })
      }, 2000)
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
    return <Navigate to='/fantasy-league' />
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
