import { useState } from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
// import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// import { authLogin } from '../redux'
import R from '../assets/r.svg'
import Insta from '../assets/insta.svg'
import FB from '../assets/fb.svg'
import Twitter from '../assets/twitter.svg'
import YouTube from '../assets/youtube.svg'
import Banner from '../assets/login-pic-1.png'
const ForgotPassword = () => {
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
                                    <h1>SAMSPORTS<span><img src={R} /></span></h1>
                                    <p>Forgot your</p>
                                    <h2>password?</h2>
                                </div>
                                <div className='reset-password'>
                                    <p>Enter your email address below and we{"'"}ll send you a link to reset your password.</p>
                                </div>
                                <Form.Item
                                    name='email'
                                    rules={[
                                        // {
                                        //   type: 'string',
                                        // },
                                        {
                                            required: true,
                                            message: 'The entered user name is not valid!',
                                        },
                                    ]}
                                    requiredMark="optional"
                                >
                                    <Input autoComplete='off' type='text' placeholder='Enter your Email' />
                                </Form.Item>
                                <Form.Item>
                                    <Button loading={loading} type='primary' htmlType='submit'>
                                        Send Reset Link
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
                        <div className='banner' style={{ backgroundImage: `url(${Banner})` }}>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
    // }
}

export default ForgotPassword
