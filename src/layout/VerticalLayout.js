import React from 'react'
import { Button, Layout } from 'antd'

// import { MdOutlineDarkMode, MdDarkMode } from 'react-icons/md'
// import { useDispatch, useSelector } from 'react-redux'

// import WhiteLogo from '../assets/Logo.png'
// import BlueLogo from '../assets/blueLogo.png'
import MainMenu from './MainMenu'
// import { toggleTheme } from '../redux'
import Logo from '../assets/Logo.svg'
import Insta from '../assets/insta.svg'
import Fb from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import { Footer } from 'antd/es/layout/layout'
import { useNavigate } from 'react-router-dom'

const VerticalLayout = ({ children, active }) => {
  const { Header, Sider, Content } = Layout
  const navigate = useNavigate()
  // const theme = useSelector((state) => state.theme.theme)

  const login = () => {
    navigate('/login')
  }
  const signup = () => {
    navigate('/sign-up')
  }

  return (
    <div className='v-layout'>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          width={256}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: 'var(--sidebar)',
            boxShadow: 'box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;',
          }}
        >
          <div className='company-logo'>
            {/* {theme === 'light' ? (
              <img src={BlueLogo} alt='logo' />
            ) : (
              <img src={WhiteLogo} alt='logo' />
            )} */}
            <img src={Logo} alt='image' />
          </div>
          <MainMenu active={active} />
          <div className='sider-bottom'>
            <div className='icons'>
              <img src={Insta} />
              <img src={Fb} />
              <img src={Twitter} />
              <img src={YouTube} />
            </div>
            <div className='caution'>
              <p>API • Privacy • Terms • Jobs • Responsible Play</p>
            </div>
          </div>
        </Sider>
        <Layout className='site-layout' style={{ marginLeft: 256 }}>
          <Header className='mainHeader'>
            <div></div>
            {/* <h3 className='company-title'>Header</h3> */}
            <div className='auth-buttons'>
              <Button type='default' onClick={login}>
                Login
              </Button>
              <Button type='primary' onClick={signup}>Sign Up</Button>
            </div>

            {/* <Switch
              className='themeSwitch'
              defaultChecked={theme === 'light' ? false : true}
              checkedChildren={<MdDarkMode style={{ fontSize: '20px', marginRight: '5px' }} />}
              unCheckedChildren={
                <MdOutlineDarkMode style={{ fontSize: '20px', marginLeft: '5px' }} />
              }
              onChange={() => dispatch(toggleTheme())}
            /> */}
          </Header>
          <Content className='main-content'>{children}</Content>
          <Footer className='mainFooter'>© Sam Sports, Inc. All rights reserved.</Footer>
        </Layout>
      </Layout>
    </div>
  )
}

export default VerticalLayout
