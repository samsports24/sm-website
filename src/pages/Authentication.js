import { useState } from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// import { authLogin } from '../redux'
import R from '../assets/r.svg'
import Insta from '../assets/insta.svg'
import FB from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import Banner from '../assets/login-pic-1.png'
import { otpVerification } from '../redux'
const Authentication = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // const onFinish = async (values) => {
  //   setLoading(true)
  //   await dispatch(authLogin(values, navigate))
  //   setLoading(false)
  // }
  const onFinish = async (values) => {
    setLoading(true)
    await dispatch(otpVerification(values.otp, navigate))
    setLoading(false)
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
                  <h1>
                    SAMSPORTS
                    <span>
                      <img src={R} />
                    </span>
                  </h1>
                  <p>Authentication</p>
                  <h2>Code</h2>
                </div>
                <div className='reset-password'>
                  <p>
                    Enter the authentication code below, which you received at your given email
                    address.
                  </p>
                </div>
                <Form.Item
                  name='otp'
                  rules={[
                    // {
                    //   type: 'string',
                    // },
                    {
                      required: true,
                      message: 'The OTP code is required!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='OTP Code' />
                </Form.Item>
                <Form.Item>
                  <Button loading={loading} type='primary' htmlType='submit'>
                    Verify Code
                  </Button>
                </Form.Item>
                <Form.Item>
                  <div className='signin-btn'>
                    <p onClick={() => navigate('/login')}>SIGN IN</p>
                  </div>
                </Form.Item>
              </Form>
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

export default Authentication
