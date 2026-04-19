import { useState } from 'react'
import { Form, Input, notification } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined, MailOutlined, LockOutlined, UserOutlined, CalendarOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { publicAPI } from '../config/constants'
import '../styles/pages/forgotPassword.css'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('choose') // 'choose' | 'email' | 'dob' | 'reset' | 'done'
  const [method, setMethod] = useState(null) // 'email' | 'dob'
  const [email, setEmail] = useState('')
  const [recoveryToken, setRecoveryToken] = useState(null)
  const navigate = useNavigate()

  // Method 1: Send reset code via email
  const handleSendCode = async (values) => {
    setLoading(true)
    try {
      await publicAPI.post('/auth/forgotPassword', { email: values.email })
      setEmail(values.email)
      setMethod('email')
      setStep('reset')
      notification.success({ message: 'Reset code sent to your email', duration: 4 })
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Failed to send reset code. Please try again.', duration: 5 })
    }
    setLoading(false)
  }

  // Method 2: Verify username + DOB
  const handleVerifyIdentity = async (values) => {
    setLoading(true)
    try {
      const res = await publicAPI.post('/auth/verifyIdentity', {
        userName: values.userName,
        dateOfBirth: values.dateOfBirth,
      })
      const data = res.data?.data || res.data
      if (data.verified) {
        setEmail(data.email)
        setRecoveryToken(data.recoveryToken)
        setMethod('dob')
        setStep('reset')
        notification.success({ message: 'Identity verified! Set your new password.', duration: 4 })
      }
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Username and date of birth do not match our records.', duration: 5 })
    }
    setLoading(false)
  }

  // Step: Set new password (works for both methods)
  const handleResetPassword = async (values) => {
    if (values.password !== values.confirmPassword) {
      notification.error({ message: 'Passwords do not match.', duration: 4 })
      return
    }
    setLoading(true)
    try {
      await publicAPI.put('/auth/resetPassword', {
        email,
        passwordResetToken: method === 'dob' ? recoveryToken : Number(values.code),
        password: values.password,
      })
      setStep('done')
      notification.success({ message: 'Password reset successful!', duration: 3 })
    } catch (err) {
      notification.error({ message: err?.response?.data?.message || 'Invalid code or failed to reset password.', duration: 5 })
    }
    setLoading(false)
  }

  const renderStepIndicator = () => {
    const steps = step === 'choose' ? ['Method', 'Verify', 'Reset']
      : method === 'email' ? ['Email', 'Reset']
      : ['Verify', 'Reset']
    const currentIdx = step === 'choose' ? 0 : step === 'email' || step === 'dob' ? (method ? 1 : 0) : step === 'reset' ? (steps.length - 1) : steps.length
    return (
      <div className='fp-steps'>
        {steps.map((s, i) => (
          <div key={s} className={`fp-step ${i <= currentIdx ? 'fp-step--active' : ''} ${i < currentIdx ? 'fp-step--done' : ''}`}>
            <div className='fp-step-dot'>{i < currentIdx ? <CheckCircleOutlined /> : i + 1}</div>
            <span className='fp-step-label'>{s}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='fp-page'>
      <link href='https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap' rel='stylesheet' />

      {/* Top bar */}
      <div className='fp-topbar'>
        <button className='fp-back' onClick={() => step === 'choose' ? navigate('/') : setStep('choose')}>
          <LeftOutlined /> {step === 'choose' ? 'Back' : 'Change method'}
        </button>
        <div className='fp-topbar-logo'><span>SAMSPORTS</span></div>
        <div className='fp-topbar-spacer' />
      </div>

      {/* Main card */}
      <div className='fp-container'>
        <div className='fp-card'>
          <div className='fp-card-glow' />

          {step !== 'done' && renderStepIndicator()}

          {/* Step 0: Choose Recovery Method */}
          {step === 'choose' && (
            <>
              <div className='fp-header'>
                <div className='fp-icon-wrap'>
                  <LockOutlined className='fp-icon' />
                </div>
                <h1>Forgot Password?</h1>
                <p>Choose how you want to recover your account.</p>
              </div>
              <div className='fp-method-grid'>
                <button className='fp-method-card' onClick={() => setStep('email')}>
                  <MailOutlined className='fp-method-icon' />
                  <span className='fp-method-title'>Email Code</span>
                  <span className='fp-method-desc'>We&apos;ll send a 6-digit code to your email address</span>
                </button>
                <button className='fp-method-card' onClick={() => setStep('dob')}>
                  <UserOutlined className='fp-method-icon' />
                  <span className='fp-method-title'>Username + Birthday</span>
                  <span className='fp-method-desc'>Verify your identity with your username and date of birth</span>
                </button>
              </div>
            </>
          )}

          {/* Step 1a: Enter Email */}
          {step === 'email' && (
            <>
              <div className='fp-header'>
                <div className='fp-icon-wrap'>
                  <MailOutlined className='fp-icon' />
                </div>
                <h1>Email Recovery</h1>
                <p>Enter the email associated with your account and we&apos;ll send you a 6-digit verification code.</p>
              </div>
              <Form name='forgot-email' layout='vertical' onFinish={handleSendCode} className='fp-form'>
                <Form.Item name='email' rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}>
                  <Input autoComplete='off' type='email' placeholder='Enter your email address' prefix={<MailOutlined className='fp-input-icon' />} className='fp-input' size='large' />
                </Form.Item>
                <button type='submit' className='fp-submit' disabled={loading}>
                  {loading ? <><LoadingOutlined spin /> Sending...</> : 'SEND RESET CODE'}
                </button>
              </Form>
            </>
          )}

          {/* Step 1b: Enter Username + DOB */}
          {step === 'dob' && (
            <>
              <div className='fp-header'>
                <div className='fp-icon-wrap'>
                  <UserOutlined className='fp-icon' />
                </div>
                <h1>Verify Identity</h1>
                <p>Enter your username and date of birth to verify your identity.</p>
              </div>
              <Form name='forgot-dob' layout='vertical' onFinish={handleVerifyIdentity} className='fp-form'>
                <Form.Item name='userName' rules={[{ required: true, message: 'Please enter your username' }]}>
                  <Input autoComplete='off' placeholder='Your username' prefix={<UserOutlined className='fp-input-icon' />} className='fp-input' size='large' />
                </Form.Item>
                <Form.Item name='dateOfBirth' rules={[{ required: true, message: 'Please enter your date of birth' }]}>
                  <Input autoComplete='off' type='date' placeholder='Date of birth' prefix={<CalendarOutlined className='fp-input-icon' />} className='fp-input' size='large' />
                </Form.Item>
                <button type='submit' className='fp-submit' disabled={loading}>
                  {loading ? <><LoadingOutlined spin /> Verifying...</> : 'VERIFY IDENTITY'}
                </button>
              </Form>
            </>
          )}

          {/* Step 2: Set New Password */}
          {step === 'reset' && (
            <>
              <div className='fp-header'>
                <div className='fp-icon-wrap'>
                  <LockOutlined className='fp-icon' />
                </div>
                <h1>Set New Password</h1>
                {method === 'email' ? (
                  <p>Enter the 6-digit code sent to <strong>{email}</strong> and choose your new password.</p>
                ) : (
                  <p>Identity verified! Choose your new password below.</p>
                )}
              </div>
              <Form name='forgot-reset' layout='vertical' onFinish={handleResetPassword} className='fp-form'>
                {/* Only show code field for email method */}
                {method === 'email' && (
                  <Form.Item name='code' rules={[{ required: true, message: 'Enter the 6-digit code' }]}>
                    <Input autoComplete='off' type='text' placeholder='6-digit code' className='fp-input fp-input--code' size='large' maxLength={6} />
                  </Form.Item>
                )}
                <Form.Item name='password' rules={[
                  { required: true, message: 'Enter a new password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}>
                  <Input.Password placeholder='New password' prefix={<LockOutlined className='fp-input-icon' />} className='fp-input' size='large' />
                </Form.Item>
                <Form.Item name='confirmPassword' rules={[{ required: true, message: 'Confirm your password' }]}>
                  <Input.Password placeholder='Confirm new password' prefix={<LockOutlined className='fp-input-icon' />} className='fp-input' size='large' />
                </Form.Item>
                <button type='submit' className='fp-submit' disabled={loading}>
                  {loading ? <><LoadingOutlined spin /> Resetting...</> : 'RESET PASSWORD'}
                </button>
              </Form>
              {method === 'email' && (
                <button className='fp-resend' onClick={() => handleSendCode({ email })}>
                  Didn&apos;t receive it? Resend code
                </button>
              )}
            </>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className='fp-header fp-header--done'>
              <div className='fp-icon-wrap fp-icon-wrap--success'>
                <CheckCircleOutlined className='fp-icon' />
              </div>
              <h1>Password Reset!</h1>
              <p>Your password has been successfully changed. You can now log in with your new password.</p>
              <button className='fp-submit' onClick={() => navigate('/')} style={{ marginTop: 24 }}>
                BACK TO HOME
              </button>
            </div>
          )}

          {/* Footer */}
          {step !== 'done' && (
            <div className='fp-footer'>
              <p>
                Remember your password?{' '}
                <button type='button' className='fp-login-link' onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
