import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import { TbLayoutDashboard } from 'react-icons/tb'

const MainMenu = ({ active }) => {
  const navigate = useNavigate()

  return (
    <Menu
      theme='dark'
      mode={'inline'}
      defaultSelectedKeys={[active]}
      style={{
        background: 'var(--sidebar)',
        minHeight: '83vh',
      }}
    >
      <Menu.Item
        key='dashboard'
        className={'sidebar-menu'}
        icon={<TbLayoutDashboard className='menu-icon' />}
        onClick={() => navigate('/')}
      >
        Dashboard
      </Menu.Item>
    </Menu>
  )
}

export default MainMenu
