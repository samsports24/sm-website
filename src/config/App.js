import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'antd/dist/reset.css'

import '../styles/style.css'
import Routes from './Routes'
import { light, dark } from './theme'
import { getUser } from '../redux'

const App = () => {
  const theme = useSelector((state) => state.theme.theme)
  const dispatch = useDispatch()

  useEffect(() => {
    if (theme === 'light') {
      Object.keys(light).forEach((key) => {
        document.body.style.setProperty(`--${key}`, light[key])
      })
    } else {
      Object.keys(dark).forEach((key) => {
        document.body.style.setProperty(`--${key}`, dark[key])
      })
    }
  }, [theme])

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getUser())
    }
  }, [])

  return <Routes />
}

export default App
