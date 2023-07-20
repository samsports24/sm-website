import { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { authLogin } from '../redux'

const SignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    setLoading(true)
    await dispatch(authLogin(values, navigate))
    setLoading(false)
  }

  // if (localStorage.hasOwnProperty("token")) {
  //   // return <Navigate replace to="/home" />;
  // } else {
  return (
    <>
      <div className='signin'>
        <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
          {/* <img src={logo} /> */}
          <h2>Employee Sign In</h2>
          <Form.Item
            name='email'
            rules={[
              {
                type: 'email',
                message: 'The entered email is not valid!',
              },
              {
                required: true,
                message: 'Email is Required',
              },
            ]}
            label='Email'
          >
            <Input autoComplete='off' placeholder='Enter Email...' />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              {
                required: true,
                message: 'Password is Required',
              },
            ]}
            label='Password'
          >
            {/* <Input.Password */}
            <Input type='password' placeholder='Password...' />
          </Form.Item>

          <Form.Item>
            <Button loading={loading} type='primary' htmlType='submit'>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
  // }
}

export default SignIn
