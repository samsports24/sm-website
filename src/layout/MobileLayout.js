import { Layout } from 'antd'

import MenuDrawer from './MenuDrawer'

const { Content } = Layout

const MobileLayout = ({ active, children }) => {
  return (
    <Layout className='m-layout'>
      <div className='mobile-header'>
        <MenuDrawer active={active} />
        {/* <Switch
          className='themeSwitch'
          defaultChecked={theme === 'light' ? false : true}
          checkedChildren={<MdDarkMode style={{ fontSize: '20px', marginRight: '5px' }} />}
          unCheckedChildren={<MdOutlineDarkMode style={{ fontSize: '20px', marginLeft: '5px' }} />}
          onChange={() => dispatch(toggleTheme())}
        /> */}
      </div>
      <Content className='m-children'>{children}</Content>
    </Layout>
  )
}

export default MobileLayout
