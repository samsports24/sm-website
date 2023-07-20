import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import 'antd/dist/reset.css'

import '../styles/style.css'
import Routes from './Routes'
import { light, dark } from './theme'

const App = () => {
  const theme = useSelector((state) => state.theme.theme)

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

  return <Routes />
}

export default App
