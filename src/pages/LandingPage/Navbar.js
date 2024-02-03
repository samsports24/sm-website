import { useState } from 'react'
import { Button, Drawer } from 'antd'
import Logo from '../../assets/Logo.svg'
import Title from '../../assets/landing/title.png'

import { FaBars } from 'react-icons/fa'

const Navbar = () => {
  return (
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
        <Button shape='round' type='primary' className='auth_btn'>
          Signup
        </Button>
        <Button shape='round' type='primary' className='auth_btn'>
          Login
        </Button>
        <div className='menu_bar'>
          <FaBars style={{ color: '#fff' }} size={22} />
        </div>
        {/* <DrawerMenu /> */}
      </div>
    </div>
  )
}

const DrawerMenu = () => {
  const [open, setOpen] = useState(false)

  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)

  return (
    <div>
      <div className='menu_bar' onClick={showDrawer}>
        <FaBars style={{ color: '#fff' }} size={22} />
      </div>
      <Drawer title='Basic Drawer' onClose={onClose} open={open} style={{ width: '300px' }}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  )
}

export default Navbar
