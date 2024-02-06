import React, { useState } from 'react'

import { Button, Row, Col, Form, Input, Avatar, DatePicker, Select, Checkbox } from 'antd'

import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'

import { useLocation, useNavigate } from 'react-router-dom'

import { countries } from '../../config/countriesData'
import moment from 'moment-timezone'
import dayjs from 'dayjs'

import { IoIosArrowRoundBack } from 'react-icons/io'

const NewSignUp = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const selectedGame = localStorage.getItem('selectedGame')
  const imagePath = localStorage.getItem('imagePath')
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
      dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
    }
    console.log('Selected Game>>>:', selectedGame)
    console.log(obj)
    navigate('/select-league')
    setLoading(false)
  }

  const filterOption = (input, option) =>
    (option.label ?? '').toLowerCase().includes(input.toLowerCase())

  const survey = ['Social Media', 'Google/Search Engine', 'Third-Party Review', 'Other']

  return (
    <div className='select_game_container'>
      <SelectGameLeft logo={imagePath} />
      <SelectGameRight>
        <div className='signup_body'>
          <h1>
            <IoIosArrowRoundBack onClick={() => navigate('/select-game')} className='back_arrow' />
            Create Your Account <span style={{ fontSize: '16px' }}>({selectedGame})</span>
          </h1>

          <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
            <Row gutter={[30, 10]}>
              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'name'}
                  label='User Name'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Input placeholder='User Name Here...' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'email'}
                  label='Email Address'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Input type='email' placeholder='Email Address Here...' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'password'}
                  label='Password'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Input placeholder='Password Here...' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'dateOfBirth'}
                  label='Date of Birth'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <DatePicker placeholder='Select DOB' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'country'}
                  label='Country'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder='Select Country'
                    optionFilterProp='children'
                    filterOption={filterOption}
                    options={countries?.map((v) => {
                      return {
                        value: v?.name,
                        label: v?.name,
                      }
                    })}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'province'}
                  label='Province'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Input placeholder='Province Here...' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'timeZone'}
                  label='Time Zone'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder='Select Time Zone'
                    optionFilterProp='children'
                    filterOption={filterOption}
                    options={moment.tz.names()?.map((v) => {
                      return {
                        value: v,
                        label: v,
                      }
                    })}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} xl={8}>
                <Form.Item
                  name={'survey'}
                  label='How did you hear about us?'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Select
                    placeholder='Select Option'
                    options={survey?.map((v) => {
                      return {
                        value: v,
                        label: v,
                      }
                    })}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name={'termsAndCondtions'}
                  label=''
                  valuePropName='checked'
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                >
                  <Checkbox>
                    I have read the <a href='#'>Terms of Service</a> and{' '}
                    <a href='#'>Privacy Policy</a> and agree to their terms and conditions.
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
      </SelectGameRight>
    </div>
  )
}

export default NewSignUp
