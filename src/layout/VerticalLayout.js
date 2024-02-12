import React from 'react'
import { Button, Layout, Dropdown } from 'antd'
import account from '../assets/account.svg'
import MainMenu from './MainMenu'
import Logo from '../assets/sam-football.png'
import Insta from '../assets/insta.svg'
import Fb from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import { Footer } from 'antd/es/layout/layout'
import {
  useNavigate,
  // useLocation
} from 'react-router-dom'
// import { isAuthenticated } from '../functions/auth'

const VerticalLayout = ({ children, active }) => {
  const { Sider, Content } = Layout
  const navigate = useNavigate()
  // const { pathname } = useLocation()

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
  }
  const login = () => navigate('/login')

  const signup = () => navigate('/sign-up')

  const goToProfile = () => navigate('/edit-profile')

  const items = [
    {
      key: '1',
      label: <p onClick={goToProfile}>Profile</p>,
    },
    {
      key: '2',
      label: <p onClick={logout}>Logout</p>,
    },
  ]

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
            boxShadow: 'box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px',
          }}
        >
          <div onClick={() => {navigate("/")}} className='company-logo'>
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
              <p style={{ lineHeight: 1.5 }}>
                API • Privacy •{' '}
                <a
                  href='https://app.termly.io/document/terms-of-service/372d4c41-9267-4833-8bbb-aba80f6fbbb8'
                  target='_blank'
                  rel='noreferrer'
                >
                  Terms
                </a>{' '}
                • Jobs • Responsible Play
              </p>
            </div>
          </div>
        </Sider>
        <Layout className='site-layout' style={{ marginLeft: 256 }}>
          <div className='mainHeader'>
            <div>
              {/* {pathname === '/fantasy-league' && (
                <h1 className='header_title'>
                  Fantasy <b>Leagues</b>
                </h1>
              )}
              {pathname === '/professional-league' && (
                <h1 className='header_title'>
                  Professional <b>Leagues</b>
                </h1>
              )}
              {pathname === '/depth-chart' && <h1 className='header_title'>starters</h1>}
              {pathname === '/coming-soon' && (
                <h1 className='header_title'>
                  COMING <b>SOON</b>
                </h1>
              )}
              {pathname === '/choose-your-game-step1' && (
                <h1 className='header_title'>
                  Choose Your <b>game</b>
                </h1>
              )}
              {pathname === '/choose-your-league-step2' && (
                <h1 className='header_title'>
                  Choose Your <b>League</b>
                </h1>
              )}
              {pathname === '/choose-your-league-step3' && (
                <h1 className='header_title'>
                  Choose Your <b>League</b>
                </h1>
              )}
              {pathname === '/choose-your-league-step4' && (
                <h1 className='header_title'>
                  Choose Your <b>League</b>
                </h1>
              )}
              {pathname === '/public-league' && (
                <h1 className='header_title'>
                  Public <b>Leagues</b>
                </h1>
              )} */}
            </div>

            {localStorage.getItem('token') ? (
              <div className='auth-buttons'>
                <Dropdown
                  menu={{
                    items,
                  }}
                >
                  <img
                    src={account}
                    style={{
                      cursor: 'pointer',
                    }}
                  />
                </Dropdown>
              </div>
            ) : (
              <div className='auth-buttons'>
                <Button type='default' onClick={login}>
                  Login
                </Button>
                <Button type='primary' onClick={signup}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          <Content className='main-content'>{children}</Content>
          <Footer className='mainFooter'>
            <p>© Sam Sports, Inc. All rights reserved.</p>
            <a href='https://sportsdata.io' target='_blank' rel='noreferrer'>
              <img
                style={{ height: '50px', width: 'auto' }}
                src='https://sportsdata.io/assets/images/badges/sportsdataio_light_ss_300.png'
                alt='Powered by SportsDataIO'
              />
            </a>
          </Footer>
        </Layout>
      </Layout>
    </div>
  )
}

export default VerticalLayout
