import React, { useState } from 'react'

import { Button, Row, Col, Form, Input, Select, Checkbox, notification } from 'antd'
import SamDatePicker from '../../components/SamDatePicker'

import { useNavigate } from 'react-router-dom'

import { countries } from '../../config/countriesData'
import moment from 'moment-timezone'
import dayjs from 'dayjs'

import { IoIosArrowRoundBack } from 'react-icons/io'
import { authSignupAdvanced } from '../../redux'
import { serverUrls } from '../../config/constants'

const SS = {
  page: {
    minHeight: '100vh',
    background: '#0A0F1A',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  topbar: {
    width: '100%',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  logoSam: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 2,
  },
  logoSports: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 900,
    color: '#22C55E',
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    maxWidth: 960,
    margin: '12px auto 48px',
    padding: '36px 40px 28px',
    background: 'linear-gradient(135deg, #111827 0%, #0D1321 100%)',
    border: '1px solid rgba(34,197,94,0.18)',
    borderRadius: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Rajdhani', sans-serif",
    margin: '0 0 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
}

const NewSignUp = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const selectedGame = localStorage.getItem('selectedGame')
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    if (values.termsAndCondtions) {
      let url = serverUrls.find((item) => item.key === selectedGame)
      const obj = {
        ...values,
        dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
        url: url.url,
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
    <div style={SS.page}>
      {/* ── Top bar with SAM SPORTS logo ── */}
      <div style={SS.topbar} onClick={() => navigate('/')}>
        <span style={SS.logoSam}>SAM</span>
        <span style={SS.logoSports}>SPORTS</span>
      </div>

      {/* ── Sign-up card ── */}
      <div style={SS.card}>
        <h1 style={SS.h1}>
          <IoIosArrowRoundBack onClick={() => navigate(-1)} style={{ cursor: 'pointer', fontSize: 32 }} />
          Create Your Account
        </h1>

        <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
          <Row gutter={[30, 10]}>
            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'userName'}
                label='User Name'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Input placeholder='User Name Here...' />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'email'}
                label='Email Address'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Input type='email' placeholder='Email Address Here...' />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'password'}
                label='Password'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Input placeholder='Password Here...' />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'dateOfBirth'}
                label='Date of Birth'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <SamDatePicker placeholder='Select DOB' />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'country'}
                label='Country'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Select
                  showSearch
                  placeholder='Select Country'
                  optionFilterProp='children'
                  filterOption={filterOption}
                  options={countries?.map((v) => ({
                    value: v?.name,
                    label: v?.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'provience'}
                label='Province'
                rules={[{ required: false, message: 'Required!' }]}
              >
                <Input placeholder='Province Here...' />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <Form.Item
                name={'timezone'}
                label='Time Zone'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Select
                  showSearch
                  placeholder='Select Time Zone'
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
                name={'howYouHear'}
                label='How did you hear about us?'
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Select
                  placeholder='Select Option'
                  options={survey?.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name={'termsAndCondtions'}
                label=''
                valuePropName='checked'
                rules={[{ required: true, message: 'Required!' }]}
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
              <Form.Item>
                <Button loading={loading} type='primary' htmlType='submit'>
                  Create Account
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  )
}

export default NewSignUp
