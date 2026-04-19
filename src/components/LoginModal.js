import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, notification } from 'antd'
import { useDispatch } from 'react-redux'
import { authLogin, googleLogin, facebookLogin } from '../redux/actions/authActions'
import { CloseOutlined, UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/components/loginModal.css'

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID'

/* ── Google Sign-In Button (mirrors RightSidebar implementation) ── */
const GoogleButton = ({ onSuccess, t }) => {
  const btnRef = useRef(null)
  const [gsiReady, setGsiReady] = useState(false)

  useEffect(() => {
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setGsiReady(true)
        return true
      }
      return false
    }
    if (checkGsi()) return
    const interval = setInterval(() => {
      if (checkGsi()) clearInterval(interval)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  const handleCallback = useCallback((response) => {
    if (response.credential) onSuccess(response.credential)
  }, [onSuccess])

  useEffect(() => {
    if (!gsiReady || !btnRef.current) return
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCallback,
        auto_select: false,
      })
      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320,
        logo_alignment: 'left',
      })
    } catch (err) {
      console.error('GSI init error:', err)
    }
  }, [gsiReady, handleCallback])

  if (!gsiReady) {
    return (
      <button type='button' className='lm-google-fallback' onClick={() => {
        if (window.google?.accounts?.id) window.google.accounts.id.prompt()
      }}>
        <svg width='18' height='18' viewBox='0 0 48 48'>
          <path fill='#EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z' />
          <path fill='#4285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z' />
          <path fill='#FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z' />
          <path fill='#34A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z' />
        </svg>
        <span>{t('signInGoogle')}</span>
      </button>
    )
  }

  return <div ref={btnRef} className='lm-google-wrap' />
}

/* ── Facebook Login Button ── */
const FacebookButton = ({ onSuccess }) => {
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    // Load Facebook SDK
    if (document.getElementById('facebook-jssdk')) {
      if (window.FB) setSdkReady(true)
      return
    }
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      })
      setSdkReady(true)
    }
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  const handleClick = () => {
    if (!window.FB) return
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          onSuccess(response.authResponse.accessToken)
        }
      },
      { scope: 'email,public_profile' }
    )
  }

  return (
    <button type='button' className='lm-social-btn lm-social-fb' onClick={handleClick} disabled={!sdkReady}>
      <svg width='18' height='18' viewBox='0 0 24 24' fill='#1877F2'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
      <span>Sign in with Facebook</span>
    </button>
  )
}

/* ── Login Modal ── */
const LoginModal = ({ visible, onClose }) => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && visible) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [visible, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [visible])

  const onFinish = async (values) => {
    if (values.userName && values.password) {
      setLoading(true)
      try {
        await dispatch(authLogin(values, navigate))
      } catch (err) {
        // authLogin handles its own error notifications
      }
      setLoading(false)
    } else {
      notification.error({ message: t('userPassMissing'), duration: 5 })
    }
  }

  const handleGoogleSuccess = useCallback(async (credential) => {
    setLoading(true)
    try {
      await dispatch(googleLogin(credential, navigate))
      onClose()
    } catch (err) {
      // googleLogin handles its own error notifications
    }
    setLoading(false)
  }, [dispatch, navigate, onClose])

  const handleFacebookSuccess = useCallback(async (accessToken) => {
    setLoading(true)
    try {
      await dispatch(facebookLogin(accessToken, navigate))
      onClose()
    } catch (err) {
      // facebookLogin handles its own error notifications
    }
    setLoading(false)
  }, [dispatch, navigate, onClose])

  const handleForgotPassword = () => {
    onClose()
    navigate('/forgot-password')
  }

  const handleCreateAccount = () => {
    onClose()
    navigate('/select-game')
  }

  if (!visible) return null

  return (
    <div className='lm-overlay' onClick={onClose}>
      <div className='lm-modal' onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className='lm-close' onClick={onClose}>
          <CloseOutlined />
        </button>

        {/* Decorative top glow */}
        <div className='lm-glow' />

        {/* Header */}
        <div className='lm-header'>
          <div className='lm-logo'>SAMSPORTS</div>
          <h2 className='lm-title'>{t('welcomeBack')}</h2>
          <p className='lm-subtitle'>{t('loginSubtitle')}</p>
        </div>

        {/* Social Sign In */}
        <div className='lm-social-section'>
          <GoogleButton onSuccess={handleGoogleSuccess} t={t} />
          <FacebookButton onSuccess={handleFacebookSuccess} />
        </div>

        {/* Divider */}
        <div className='lm-divider'>
          <span className='lm-divider-line' />
          <span className='lm-divider-text'>{t('or')}</span>
          <span className='lm-divider-line' />
        </div>

        {/* Form */}
        <Form
          form={form}
          name='login-modal'
          layout='vertical'
          onFinish={onFinish}
          className='lm-form'
        >
          <Form.Item
            name='userName'
            rules={[{ required: true, message: t('enterUsername') }]}
          >
            <Input
              autoComplete='off'
              type='text'
              placeholder={t('username')}
              prefix={<UserOutlined className='lm-input-icon' />}
              className='lm-input'
              size='large'
            />
          </Form.Item>

          <Form.Item
            name='password'
            rules={[{ required: true, message: t('enterPassword') }]}
          >
            <Input.Password
              placeholder={t('password')}
              prefix={<LockOutlined className='lm-input-icon' />}
              className='lm-input'
              size='large'
            />
          </Form.Item>

          <div className='lm-options'>
            <label className='lm-remember'>
              <input type='checkbox' className='lm-checkbox' />
              <span>{t('rememberMe')}</span>
            </label>
            <button type='button' className='lm-forgot' onClick={handleForgotPassword}>
              {t('forgotPassword')}
            </button>
          </div>

          <button
            type='submit'
            className={`lm-submit ${loading ? 'lm-submit--loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingOutlined spin /> {t('signingIn')}
              </>
            ) : (
              t('logIn')
            )}
          </button>
        </Form>

        {/* Footer */}
        <div className='lm-footer'>
          <p>
            {t('noAccount')}{' '}
            <button type='button' className='lm-create' onClick={handleCreateAccount}>
              {t('createAccount')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
