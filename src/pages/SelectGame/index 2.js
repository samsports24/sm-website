import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Form, Input, Select, Checkbox, notification } from 'antd'
import SamDatePicker from '../../components/SamDatePicker'
import { useNavigate } from 'react-router-dom'

import { games } from './data'
import { countries, UsaStates } from '../../config/countriesData'

import { serverUrls } from '../../config/constants'
import { authSignupAdvanced } from '../../redux'

import moment from 'moment-timezone'
import dayjs from 'dayjs'

import { IoIosArrowRoundBack } from 'react-icons/io'
import { jwtDecode } from 'jwt-decode'
import VerificationcodeModal from '../../components/modal/Verificationcode'
import { GenerateVerificationCode } from '../../redux/actions/clubhouse'

const SelectGame = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [selectedGame, setSelectedGame] = useState('')
  const navigate = useNavigate()
  const [deocdeemail, setDecodeEmail] = useState(null)
  const [modalshow, setModalShow] = useState(false)
  const [verficationcode, setVerficationcode] = useState(null)
  const [isTokenPresent, setIsTokenPresent] = useState(false)
  const [showStateDropdown, setShowStateDropdown] = useState(false)

  const [user, setUser] = useState(null)
  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const token = queryParameters.get('token')
    if (token) {
      const decodedToken = jwtDecode(token)
      setDecodeEmail(decodedToken.emailsent)
      localStorage.setItem('email', decodedToken.emailsent)
      setUser(decodedToken.user)
      form.setFieldValue('email', decodedToken.emailsent)
      if (decodedToken.league) {
        localStorage.setItem('AssignLeague', decodedToken.league)
      }
      if (decodedToken.paid) {
        localStorage.setItem('paid', decodedToken.paid)
      }
      if (decodedToken.invitation_Type) {
        localStorage.setItem('myinvitationtype', decodedToken.invitation_Type)
      }
    }
  }, [])

  useEffect(() => {
    let football = games?.find((obj) => obj.key === 'football')
    handleSetGame(football)
    setIsTokenPresent(true)
  }, [])

  const handleSetGame = (v) => {
    setSelectedGame(v.key)
    localStorage.setItem('selectedGame', v.key)
    localStorage.setItem('imagePath', v.imagePath)
  }

  const handleConfirm = async () => {
    setModalShow(false)
    const values = form.getFieldsValue()

    let server = serverUrls.find((item) => item.key === selectedGame)
    const obj = {
      ...values,
      dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
      url: server.url,
      verficationcode,
    }

    await authSignupAdvanced(obj, navigate)
    setVerficationcode('')
  }

  const onFinish = async (values) => {
    setLoading(true)

    if (values.termsAndCondtions) {
      if (values.state === 'Idaho' || values.state === 'Washington') {
        notification.warning({
          message: 'This Platform is not available in this state',
          duration: 4,
        })
        setLoading(false)
        return
      }

      const dateOfBirth = dayjs(values.dateOfBirth)
      const today = dayjs()
      const age = today.diff(dateOfBirth, 'year')

      if (age < 18) {
        notification.warning({
          message: 'Legal age for this platform is 18',
          duration: 4,
        })
        setLoading(false)
        return
      }

      if ((values.state === 'Alabama' || values.state === 'Nebraska') && age < 19) {
        notification.warning({
          message: `Legal age in ${values.state} is 19. You are underage for this platform.`,
          duration: 4,
        })
        setLoading(false)
        return
      }

      if (
        (values.state === 'Arizona' ||
          values.state === 'Massachusetts' ||
          values.state === 'Nevada' ||
          values.state === 'Iowa' ||
          values.state === 'Louisiana') &&
        age < 21
      ) {
        notification.warning({
          message: `Legal age in ${values.state} is 21. You are underage for this platform.`,
          duration: 4,
        })
        setLoading(false)
        return
      }

      // Skip verification for local dev, submit directly
      let server = serverUrls.find((item) => item.key === selectedGame)
      // Only pass frontEndUrl for non-NFL sports so they redirect to the correct app
      const isCrossSport = selectedGame !== 'football'
      const obj = {
        ...values,
        dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
        url: server.url,
        registerPath: server.registerPath || null, // sport-specific register endpoint
        frontEndUrl: isCrossSport ? (server.frontEndUrl || null) : null,
        skipVerification: true,
      }
      await authSignupAdvanced(obj, navigate)
    } else {
      notification.warning({
        message: 'Please Accept Terms and Conditions',
        duration: 4,
      })
    }

    setLoading(false)
  }

  const filterOption = (input, option) =>
    (option.label ?? '').toLowerCase().includes(input.toLowerCase())

  const survey = ['Social Media', 'Google/Search Engine', 'Third-Party Review', 'Other']

  return (
    <>
      <div className='sg-page'>
        {/* ── Top Bar ── */}
        <div className='sg-topbar'>
          <button className='sg-back-btn' onClick={() => navigate(-1)}>
            <IoIosArrowRoundBack size={22} />
            Back
          </button>
          <div className='sg-logo-bar'>
            <img src='/samsports-logo.svg' alt='SAMSports' onError={(e) => { e.target.style.display = 'none' }} />
            <span>SAMSPORTS</span>
          </div>
          <div className='sg-login-link'>
            Already have an account?
            <a href='/login'>Log In</a>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className='sg-hero'>
          <div className='sg-hero-bg' />
          <div className='sg-hero-content'>
            <h1>
              CHOOSE YOUR <span>FANTASY SPORT</span>
            </h1>
            <p>Select a league below, then create your account to start playing</p>
            <span className='sg-hero-note'>Pro leagues are by invitation only</span>
          </div>
        </div>

        {/* ── Sport Cards ── */}
        <div className='sg-sport-carousel'>
          <div className='sg-sport-grid'>
            {games.map((v) => (
              <div
                key={v.key}
                className={`sg-sport-card ${selectedGame === v.key ? 'active' : ''} ${v.disabled ? 'disabled' : ''}`}
                style={{ '--card-accent': v.accentColor || '#22C55E' }}
                onClick={() => {
                  if (!v.disabled) handleSetGame(v)
                }}
              >
                <div className='sg-card-glow' />
                <span className='sg-card-emoji'>{v.emoji}</span>
                <span className='sg-card-name'>{v.name}</span>
                <span className='sg-card-tagline'>{v.tagline}</span>
                {v.disabled && <span className='sg-coming-soon'>Soon</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        {selectedGame && (
          <div className='sg-divider'>
            <div className='sg-divider-line' />
          </div>
        )}

        {/* ── Signup Form ── */}
        {selectedGame && (
          <div className='sg-form-section'>
            <div className='sg-form-card'>
              <div className='sg-form-title'>
                <span className='sg-form-title-icon'>🏆</span>
                Create Your Account
              </div>

              <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
                autoComplete='off'
                onValuesChange={(obj) => {
                  if (obj?.country) {
                    setShowStateDropdown(obj.country)
                  }
                }}
              >
                <Row gutter={[20, 4]}>
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='userName'
                      label='Username'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Input placeholder='Choose a username...' />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='email'
                      label='Email Address'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        disabled={!!deocdeemail}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='password'
                      label='Password'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Input.Password placeholder='Create a password...' />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='dateOfBirth'
                      label='Date of Birth'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <SamDatePicker placeholder='Select date...' style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='country'
                      label='Country'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Select
                        showSearch
                        placeholder='Select your country'
                        optionFilterProp='children'
                        filterOption={filterOption}
                        options={countries?.map((v) => ({
                          value: v?.name,
                          label: v?.name,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  {showStateDropdown === 'United States' && (
                    <Col xs={24} md={12} xl={8}>
                      <Form.Item
                        name='state'
                        label='State'
                        rules={[{ required: true, message: 'Required!' }]}
                      >
                        <Select
                          showSearch
                          placeholder='Select your state'
                          optionFilterProp='children'
                          filterOption={filterOption}
                          options={UsaStates?.map((v) => ({
                            value: v?.name,
                            label: v?.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='timezone'
                      label='Time Zone'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Select
                        showSearch
                        placeholder='Select your timezone'
                        optionFilterProp='children'
                        filterOption={filterOption}
                        options={moment.tz.names()?.map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name='howYouHear'
                      label='How did you hear about us?'
                      rules={[{ required: true, message: 'Required!' }]}
                    >
                      <Select
                        placeholder='Select...'
                        options={survey?.map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name='termsAndCondtions'
                      label=''
                      valuePropName='checked'
                      rules={[{ required: true, message: 'Required!' }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Checkbox>
                        I have read the{' '}
                        <a href='/terms' target='_blank' rel='noreferrer'>
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href='/privacy' target='_blank' rel='noreferrer'>
                          Privacy Policy
                        </a>{' '}
                        and agree to their terms and conditions.
                      </Checkbox>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        loading={loading}
                        type='primary'
                        htmlType='submit'
                        className='sg-submit-btn'
                      >
                        Create Account
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        )}

        {/* ── Footer Note ── */}
        <div className='sg-footer-note'>
          <p>SAMSports Fantasy, Draft, Trade, Dominate</p>
        </div>
      </div>

      <VerificationcodeModal
        key='modal'
        visible={modalshow}
        onClose={handleConfirm}
        verficationcode={verficationcode}
        setVerficationcode={setVerficationcode}
        user={user}
        deocdeemail={deocdeemail}
      />
    </>
  )
}

export default SelectGame
