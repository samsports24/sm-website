import { useState } from 'react'
import { Button, Drawer } from 'antd'

import Logo from '../../assets/Logo.svg'
import Title from '../../assets/landing/title.png'
import SamLogo from '../../assets/sam-football.png'

import { FaBars } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  return (
    <>
      <div className='navbar'>
        <div className='left'>
          <img src={Logo} alt='logo' className='logo' />
          <img src={Title} alt='samsports' className='title' />
          <div className='links'>
            <span>Football</span>
            <span>Baseball</span>
            <span>Hockey</span>
            <span>US Football</span>
            <span>College Football</span>
            <span>Scouting</span>
          </div>
        </div>
        <div className='right'>
          <Button
            shape='round'
            type='primary'
            className='auth_btn'
            onClick={() => navigate('/select-game')}
          >
            Signup
          </Button>
          <Button shape='round' type='primary' className='auth_btn'>
            Login
          </Button>
          <DrawerMenu />
        </div>
      </div>
      <div className='empty-navbar' />
    </>
  )
}

const DrawerMenu = () => {
  const [open, setOpen] = useState(false)

  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)

  const handleNavigate = (navigateTo) => {
    console.log(navigateTo)
    onClose()
  }

  return (
    <>
      <div className='menu_bar' onClick={showDrawer}>
        <FaBars style={{ color: '#fff' }} size={22} />
      </div>
      <Drawer title='Basic Drawer' onClose={onClose} open={open} className='menu_drawer'>
        <div className='menu_drawer_body'>
          <div className='close_button'>
            <IoClose style={{ color: '#fff', cursor: 'pointer' }} size={22} onClick={onClose} />
          </div>
          <div className='company_logo'>
            <img src={SamLogo} alt='Logo' />
          </div>
          <div className='menu_item_box'>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>Football</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>Baseball</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>Hockey</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>US Football</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>College Football</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>Scouting</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/')}>
              <p>Login</p>
            </div>
            <div className='menu_item' onClick={() => handleNavigate('/select-game')}>
              <p>Signup</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default Navbar
