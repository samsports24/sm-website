import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Row, Col, Checkbox, notification } from 'antd'
import R from '../assets/r.svg'
import UserIcon from '../assets/user-icon.svg'
import PasswordIcon from '../assets/password-icon.svg'
import Insta from '../assets/insta.svg'
import FB from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import Banner from '../assets/login-pic-1.png'
import { authLogin } from '../redux'
import { useDispatch } from 'react-redux'

const SignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    if (values.userName && values.password) {
      setLoading(true)
      await dispatch(authLogin(values, navigate))
      setLoading(false)
    } else {
      notification.error({ message: 'username or password is missing.', duration: 7 })
    }
  }

  const onChange = (e) => {
    console.log(`checked = ${e.target.checked}`)
  }
  // if (localStorage.hasOwnProperty("token")) {
  //   // return <Navigate replace to="/home" />;
  // } else {
  return (
    <div className='signin'>
      <div className='width90'>
        <Row>
          <Col xs={24} md={24} lg={10} xl={11}>
            <div className='form-div' style={{ background: '#080611' }}>
              <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
                <div className='title'>
                  <h1>
                    SAMSPORTS
                    <span>
                      <img src={R} />
                    </span>
                  </h1>
                  {/* <img src={logo} /> */}
                  <p>Welcome</p>
                  <h2>to the game!</h2>
                </div>
                <Form.Item
                  name='userName'
                  rules={[
                    // {
                    //   type: 'string',
                    // },
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
                  <Input
                    type='password'
                    placeholder='Password'
                    prefix={<img src={PasswordIcon} />}
                  />
                </Form.Item>
                <Form.Item name='remember' requiredMark='optional'>
                  <div className='remember'>
                    <Checkbox onChange={onChange}>Remember me</Checkbox>
                    <p onClick={() => navigate('/forgot-password')}>Forgot password?</p>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button loading={loading} type='primary' htmlType='submit'>
                    Login
                  </Button>
                </Form.Item>
              </Form>
              <div className='create-account'>
                <p>
                  Don{"'"}t have an account?{' '}
                  <span className='highlight' onClick={() => navigate('/sign-up')}>
                    CREATE ACCOUNT
                  </span>
                </p>
              </div>
              <div className='icons'>
                <img src={Insta} />
                <img src={FB} />
                <img src={Twitter} />
                <img src={YouTube} />
              </div>
            </div>
          </Col>
          <Col xs={24} md={24} lg={14} xl={13}>
            <div className='banner' style={{ backgroundImage: `url(${Banner})` }}>
              {/* <img src={Banner} /> */}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
  // }
}

export default SignIn
