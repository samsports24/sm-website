import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Input, Form, notification } from 'antd'
import { authLogin } from '../redux'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import R from '../assets/r.svg'
import UserIcon from '../assets/user-icon.svg'
import PasswordIcon from '../assets/password-icon.svg'
import PaymentModal from '../components/modal/PaymentModal'

const LoginDropdown = ({ loginFromSideMenu, loginFromNavbar, drawerVisible }) => {
  const [open, setOpen] = useState(false)
//  const [showPaymentModal, setShowPaymentModal] = useState(false)
  // const  {showPaymentModal}  = useSelector((state) => state?.user)
  const showPaymentModal = useSelector((state) => state?.user)
  // console.log('showPaymentModal', showPaymentModal?.showPaymentModal?.modal)

  useEffect(() => {
    if (loginFromSideMenu && !drawerVisible) {
      setOpen(false)
    }
  }, [drawerVisible])

  const items = [
    {
      key: '1',
      label: <LoginForm setOpen={setOpen} />,
    },
  ]

  return (
    <Dropdown
      menu={{ items }}
      //   placement='bottomCenter'
      arrow={{ pointAtCenter: true }}
      trigger={['click']}
      open={open}
    >
      <>
        {loginFromSideMenu && (
          <Button className='login-btn mobile' onClick={() => setOpen(!open)}>
            Login
          </Button>
        )}
        {loginFromNavbar && (
          <Button type='default' onClick={() => setOpen(!open)}>
            Login
          </Button>
        )}
      </>
    </Dropdown>
  )
}

const LoginForm = ({ setOpen }) => {
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    console.log('values',values);
    if (values.userName && values.password) {
      setLoading(true)
      const res = await dispatch(authLogin(values, navigate))
      if (res) setOpen(false)
      setLoading(false)
    } else {
      notification.error({ message: 'username or password is missing.', duration: 7 })
      // setOpen(false)
    }
  }

  return (
    <div className='login_dropdown_box'>
      <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
        <div className='title'>
          <h1>
            SAMSPORTS
            <span>
              <img src={R} />
            </span>
          </h1>
          <p>Welcome</p>
          <h2>to the game!</h2>
        </div>
        <Form.Item
          name='userName'
          rules={[
            {
              required: true,
              message: 'The entered user name is not valid!',
            },
          ]}
          requiredMark='optional'
        >
          <Input
            autoComplete='off'
            type='text'
            placeholder='Username'
            prefix={<img src={UserIcon} />}
          />
        </Form.Item>
        <Form.Item
          name='password'
          rules={[
            {
              required: true,
              message: 'Password is Required',
            },
          ]}
          requiredMark='optional'
        >
          <Input type='password' placeholder='Password' prefix={<img src={PasswordIcon} />} />
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type='primary' htmlType='submit'>
            Login
          </Button>
        </Form.Item>
      </Form>
      {/* <PaymentModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} /> */}
      <PaymentModal />
    </div>
  )
}

export default LoginDropdown
