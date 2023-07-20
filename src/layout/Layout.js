import VerticalLayout from './VerticalLayout'
import MobileLayout from './MobileLayout'

const Layout = ({ children, active }) => {
  return (
    <div className='layout'>
      <VerticalLayout children={children} active={active} />
      <MobileLayout>{children}</MobileLayout>
    </div>
  )
}

export default Layout
