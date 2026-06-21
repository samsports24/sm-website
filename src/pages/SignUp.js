import { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Checkbox,
  notification,
  // Select
} from 'antd'
// import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// import { authLogin } from '../redux'
import Insta from '../assets/insta.svg'
import FB from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import Banner from '../assets/login-pic-1.png'
import { authSignup } from '../redux/actions/authActions'
import SocialLogin from '../components/SocialLogin'
const SignUp = () => {
  const [loading, setLoading] = useState(false)
  const [terms, setTerms] = useState(false)
  const [policy, setPolicy] = useState(false)

  const navigate = useNavigate()

  const onFinish = async (values) => {
    if (terms && policy) {
      if (values.password === values.confirmPassword) {
        setLoading(true)
        await authSignup(values, navigate)
        setLoading(false)
      } else {
        notification.error({ message: 'Password and Confirm password should be same', duration: 7 })
      }
    } else {
      notification.error({ message: 'You must agree to Terms and Conditions', duration: 7 })
    }
  }
  // const onChange = (e) => {
  // }
  // if (localStorage.hasOwnProperty("token")) {
  //   // return <Navigate replace to="/home" />;
  // } else {
  return (
    <div className='signin'>
      <div className='width90'>
        <Row>
          <Col xs={24} md={24} lg={10} xl={11}>
            <div className='form-div'>
              <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
                <div className='title'>
                  <h1>SAMSPORTS</h1>
                  {/* <img src={logo} /> */}
                  <h2>Registration</h2>
                </div>
                <Form.Item
                  name='name'
                  rules={[
                    {
                      required: true,
                      message: 'Name is Required!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='Full Name*' />
                </Form.Item>
                <Form.Item
                  name='userName'
                  rules={[
                    {
                      required: true,
                      message: 'Username is Required!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='Choose a unique username' />
                </Form.Item>
                <Form.Item
                  name='email'
                  rules={[
                    {
                      required: true,
                      message: 'Email is Required!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='E-mail*' />
                </Form.Item>
                <Form.Item
                  name='country'
                  rules={[
                    {
                      required: true,
                      message: 'Country Name is Required!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  {/* <Select placeholder='Select Country*' /> */}
                  <Input autoComplete='off' placeholder='Enter Your Country Name' />
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
                  <Input type='password' placeholder='Password' />
                </Form.Item>
                <Form.Item
                  name='confirmPassword'
                  rules={[
                    {
                      required: true,
                      message: 'Password is Required',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input type='password' placeholder='Confirm Password' />
                </Form.Item>
                <Form.Item name='remember' requiredMark='optional' style={{ marginBottom: '5px' }}>
                  <div className='remember'>
                    <Checkbox checked={terms} onChange={(e) => setTerms(e.target.checked)}>
                      I agree to the{' '}
                      <a href='/terms' target='_blank' rel='noreferrer' className='highlight'>
                        Terms of Service
                      </a>
                    </Checkbox>
                  </div>
                </Form.Item>
                <Form.Item name='policy' requiredMark='optional'>
                  <div className='remember'>
                    <Checkbox checked={policy} onChange={(e) => setPolicy(e.target.checked)}>
                      I agree to the{' '}
                      <a href='/privacy' target='_blank' rel='noreferrer' className='highlight'>
                        Privacy Policy
                      </a>
                    </Checkbox>
                  </div>
                </Form.Item>
                <Form.Item>
                  <Button loading={loading} type='primary' htmlType='submit'>
                    Create Account
                  </Button>
                </Form.Item>
              </Form>
              <SocialLogin />
              <div className='create-account'>
                <p>
                  Already Registered{' '}
                  <span className='highlight' onClick={() => navigate('/login')}>
                    SIGN IN
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
            <div className='banner' style={{ backgroundImage: `url(${Banner})` }}></div>
          </Col>
        </Row>
      </div>
    </div>
  )
  // }
}

export default SignUp
