import { Button } from 'antd'
import Logo from '../../assets/Logo.svg'
import Title from '../../assets/landing/title.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='left'>
        <img src={Logo} alt='logo' className='logo' />
        <img src={Title} alt='samsports' className='title' />
        <div>
          <span>Football</span>
          <span>Baseball</span>
          <span>Hockey</span>
          <span>US Football</span>
          <span>College Football</span>
          <span>Scouting</span>
        </div>
      </div>
      <div className='right'>
        <Button shape='round' type='primary'>
          Signup
        </Button>
        <Button shape='round' type='primary'>
          Login
        </Button>
      </div>
    </div>
  )
}

export default Navbar
