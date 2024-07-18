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
import { useDispatch, useSelector } from 'react-redux'
import PaymentModal from '../components/modal/PaymentModal'


const SignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const [showPaymentModal, setShowPaymentModal] = useState(false)

  // const connectEthereumWallet = async (values) => {
  //   setLoading(true)

  //   if (!window?.ethereum) {
  //     notification.error('Ethereum provider not detected')
  //     setLoading(false)
  //     return
  //   }

  //   const provider = new ethers.BrowserProvider(window?.ethereum)

  //   try {
  //     // This will request the user to grant permission to access their Ethereum wallet
  //     const accounts = await provider.send('eth_requestAccounts', [])
  //     // console.log(accounts)
  //     if (accounts.length) {
  //       // notification.success(`Connected to ${accounts[0]}`)
  //       // navigate('/connect-wallet') // Navigate after successful connection
  //       // document.getElementById('walletStatus').textContent = 'Connected'
  //       const connectedAddress = accounts[0]
  //       const walletBalance = await provider.getBalance(connectedAddress)

  //       console.log('connectedAddress', connectedAddress)
  //       console.log('walletBalance', ethers.formatEther(walletBalance))
  //       if (connectedAddress) {
  //         await dispatch(authLogin(values, navigate, connectedAddress))
  //       } else {
  //         notification.error({
  //           description: 'Wallet Not Connected.',
  //           duration: 5,
  //         })
  //       }
  //       // context.setAddress(connectedAddress)
  //       // context.setBalance(ethers.formatEther(walletBalance))
  //       // document.getElementById('walletStatus').textContent = 'Connected'
  //       // setWalletStatus(true)
  //     } else {
  //       notification.warn('No account connected')
  //     }
  //   } catch (err) {
  //     notification.error('Failed to connect to wallet')
  //     console.error(err)
  //   }

  //   setLoading(false)
  // }

  const onFinish = async (values) => {
    console.log('values',values);
    if (values.userName && values.password) {
      setLoading(true)
      // console.log('values',values);
      // await connectEthereumWallet(values)
      await dispatch(authLogin(values, navigate, setShowPaymentModal))
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
    <>
    <div className='signin'>
      <div className='width90'>
        <Row>
          <Col xs={24} md={24} lg={10} xl={11}>
            <div className='form-div' style={{ background: '#080611' }}>
              <Form name='login' className='login-form' layout='vertical' onFinish={onFinish}>
                <div onClick={() => {navigate("/")}} className='title'>
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
                  
                  {/* <span className='highlight' onClick={() => navigate('/select-game')}> */}
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


    </>
  )
  // }
}

export default SignIn
