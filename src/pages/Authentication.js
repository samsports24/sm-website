import { useState } from 'react'
import { Form, Input, notification } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined, SafetyOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { otpVerification } from '../redux'
import { publicAPI } from '../config/constants'
import '../styles/pages/authentication.css'

const Authentication = () => {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const email = localStorage.getItem('email') || ''

  const onFinish = async (values) => {
    setLoading(true)
    await dispatch(otpVerification(values.otp, navigate))
    setLoading(false)
  }

  const handleResendCode = async () => {
    if (!email) {
      notification.error({ message: 'No email found. Please sign up again.', duration: 4 })
      return
    }
    setResending(true)
    try {
      await publicAPI.post('/auth/requestEmailCode', { email })
      notification.success({ message: 'Verification code resent to your email', duration: 4 })
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Failed to resend code. Please try again.',
        duration: 5,
      })
    }
    setResending(false)
  }

  return (
    <div className='auth-page'>
      <link href='https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap' rel='stylesheet' />

      {/* Top bar */}
      <div className='auth-topbar'>
        <button className='auth-back' onClick={() => navigate('/')}>
          <LeftOutlined /> Back
        </button>
        <div className='auth-topbar-logo'>
          <span>SAMSPORTS</span>
        </div>
        <div className='auth-topbar-spacer' />
      </div>

      {/* Main card */}
      <div className='auth-container'>
        <div className='auth-card'>
          <div className='auth-card-glow' />

          {/* Step indicator */}
          <div className='auth-steps'>
            <div className='auth-step auth-step--done'>
              <div className='auth-step-dot'><CheckCircleOutlined /></div>
              <span className='auth-step-label'>Sign Up</span>
            </div>
            <div className='auth-step-line' />
            <div className='auth-step auth-step--active'>
              <div className='auth-step-dot'>2</div>
              <span className='auth-step-label'>Verify</span>
            </div>
            <div className='auth-step-line' />
            <div className='auth-step'>
              <div className='auth-step-dot'>3</div>
              <span className='auth-step-label'>Play</span>
            </div>
          </div>

          {/* Header */}
          <div className='auth-header'>
            <div className='auth-icon-wrap'>
              <SafetyOutlined className='auth-icon' />
            </div>
            <h1>Verify Your Account</h1>
            <p>
              We&apos;ve sent a verification code to{' '}
              {email ? <strong>{email}</strong> : 'your email address'}.
              Enter the code below to activate your account.
            </p>
          </div>

          {/* OTP Form */}
          <Form name='auth-otp' layout='vertical' onFinish={onFinish} className='auth-form'>
            <Form.Item
              name='otp'
              rules={[{ required: true, message: 'Please enter the verification code' }]}
            >
              <Input
                autoComplete='off'
                type='text'
                placeholder='Enter code'
                className='auth-input auth-input--code'
                size='large'
                maxLength={6}
              />
            </Form.Item>

            <button type='submit' className='auth-submit' disabled={loading}>
              {loading ? <><LoadingOutlined spin /> Verifying...</> : 'VERIFY ACCOUNT'}
            </button>
          </Form>

          {/* Resend */}
          <button
            className='auth-resend'
            onClick={handleResendCode}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Didn\u0027t receive a code? Resend'}
          </button>

          {/* Footer */}
          <div className='auth-footer'>
            <p>
              Wrong email?{' '}
              <button type='button' className='auth-link' onClick={() => navigate('/select-game')}>
                Sign up again
              </button>
            </p>
            <p>
              Already verified?{' '}
              <button type='button' className='auth-link' onClick={() => navigate('/')}>
                Back to Home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Authentication
