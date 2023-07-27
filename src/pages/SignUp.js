import { useState } from 'react'
import { Form, Input, Button, Row, Col, Checkbox, Select } from 'antd'
// import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// import { authLogin } from '../redux'
import Insta from '../assets/insta.svg'
import FB from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import Banner from '../assets/login-pic-1.png'
const SignUp = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  // const dispatch = useDispatch()

  // const onFinish = async (values) => {
  //   setLoading(true)
  //   await dispatch(authLogin(values, navigate))
  //   setLoading(false)
  // }
  const onFinish = async (values) => {
    setLoading(true)
    console.log(values)
    setLoading(false)
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
            <div className='form-div'>
              <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
                <div className='title'>
                  <h1>SAMSPORTS</h1>
                  {/* <img src={logo} /> */}
                  <h2>Registration</h2>
                </div>
                <Form.Item
                  name='fullName'
                  rules={[
                    {
                      required: true,
                      message: 'The entered user name is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='Full Name*' />
                </Form.Item>
                <Form.Item
                  name='email'
                  rules={[
                    {
                      required: true,
                      message: 'The entered user name is not valid!',
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
                      message: 'The entered user name is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Select placeholder='Select Country*' />
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
                    <Checkbox onChange={onChange}>
                      I agree to the <span className='highlight'>Terms and Conditions</span>{' '}
                    </Checkbox>
                  </div>
                </Form.Item>
                <Form.Item name='remember' requiredMark='optional'>
                  <div className='remember'>
                    <Checkbox onChange={onChange}>I agree to the Privacy Policy</Checkbox>
                  </div>
                </Form.Item>
                <Form.Item>
                  <Button loading={loading} type='primary' htmlType='submit'>
                    Create Account
                  </Button>
                </Form.Item>
              </Form>
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
