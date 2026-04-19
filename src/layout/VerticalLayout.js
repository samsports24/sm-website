import React from 'react'
import { Button, Layout, Dropdown } from 'antd'
import account from '../assets/account.svg'
import MainMenu from './MainMenu'
import Logo from '../assets/Logo.svg'
import Insta from '../assets/insta.svg'
import Fb from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import { Footer } from 'antd/es/layout/layout'
import {
  useNavigate,
  // useLocation
} from 'react-router-dom'
import LoginDropdown from './LoginDropdown'
import { landingSignup } from '../config/constants'
import { removeLeague } from '../redux'
import { useDispatch } from 'react-redux'
import LanguageSwitcher from '../i18n/LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'
// import { isAuthenticated } from '../functions/auth'

const VerticalLayout = ({ children, active }) => {
  const { Sider, Content } = Layout
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useLanguage()
  // const { pathname } = useLocation()

  const logout = () => {
    navigate('/homepage')
    dispatch(removeLeague())
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('week')
    localStorage.removeItem('leagueroom')
    localStorage.removeItem('roomId')
    // Clear stale league/invitation data so next login starts fresh
    ;['AssignLeague','paid','myinvitationtype','selectedGame','imagePath',
      'lrTeamId','modalShown','email','onboardingComplete','selectedSports','authToken'].forEach(k => localStorage.removeItem(k))
  }
  const login = () => navigate('/login')

  const signup = () => navigate('/select-game')

  const goToProfile = () => navigate('/edit-profile')

  const items = [
    {
      key: '1',
      label: <p onClick={goToProfile}>{t('profile')}</p>,
    },
    {
      key: '2',
      label: <p onClick={logout}>{t('logout')}</p>,
    },
  ]

  return (
    <div className='v-layout'>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          width={185}
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
          <div
            onClick={() => {
              navigate('/')
            }}
            className='company-logo'
          >
            <img src={Logo} alt='image' />
          </div>
          <MainMenu active={active} />
          <div className='sider-bottom'>
            <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'center' }}>
              <LanguageSwitcher />
            </div>
            <div className='icons'>
              <img src={Insta} />
              <img src={Fb} />
              <img src={Twitter} />
              <img src={YouTube} />
            </div>
            <div className='caution'>
              <p style={{ lineHeight: 1.5 }}>{t('jobsResponsiblePlay')}</p>
            </div>
          </div>
        </Sider>
        <Layout className='site-layout' style={{ marginLeft: 185 }}>
          <div className='mainHeader'>
            <div>
              {/* {pathname === '/homepage' && (
                <h1 className='header_title'>
                  Fantasy <b>Leagues</b>
                </h1>
              )}
              {pathname === '/dashboard' && (
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
                {/* <Button type='default' onClick={login}>
                  Login
                </Button> */}
                <LoginDropdown loginFromNavbar />
                {/* <Button type='primary' onClick={landingSignup}>
                  Sign Up
                </Button> */}
              </div>
            )}
          </div>
          <Content className='main-content'>{children}</Content>
{/* Footer removed */}
        </Layout>
      </Layout>
    </div>
  )
}

export default VerticalLayout
