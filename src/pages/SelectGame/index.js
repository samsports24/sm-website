import React, { useState } from 'react'
import { Button, Row, Col, Form, Input, DatePicker, Select, Checkbox, notification } from 'antd'
import { useNavigate } from 'react-router-dom'

import SelectGameLeft from './SelectGameLeft'
import SelectGameRight from './SelectGameRight'

import CustomCarousel from '../../components/Carousel/CustomCarousel'

import { games } from './data'
import { countries } from '../../config/countriesData'

import { serverUrls } from '../../config/constants'
import { authSignupAdvanced } from '../../redux'

import moment from 'moment-timezone'
import dayjs from 'dayjs'

import { IoIosArrowRoundBack } from 'react-icons/io'

const SelectGame = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [selectedGame, setSelectedGame] = useState('')
  const navigate = useNavigate()

  const handleSetGame = (v) => {
    setSelectedGame(v.key)
    localStorage.setItem('selectedGame', v.key)
    localStorage.setItem('imagePath', v.imagePath)
  }

  const onFinish = async (values) => {
    setLoading(true)
    if (values.termsAndCondtions) {
      let server = serverUrls.find((item) => item.key === selectedGame)
      const obj = {
        ...values,
        dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
        url: server.url,
      }
      // console.log(obj)
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
    <div className='select_game_container'>
      <SelectGameLeft logo={'ultimate-sports.png'} />
      <SelectGameRight>
        <div className='back_box' onClick={() => navigate(-1)}>
          <IoIosArrowRoundBack color='#fff' size={30} />
          <p>Back</p>
        </div>

        <div className='top_section'>
          <p style={{ marginBottom: '5px' }}>Choose your Fantasy sport, level and leagues!</p>
          <p>(please note that the pro leagues are on invitation only)</p>
        </div>

        <div className='bottom_section'>
          <CustomCarousel>
            {games.map((v) => {
              return (
                <div
                  key={v?.name}
                  className={`image_box ${selectedGame === v.key ? 'activeGame' : ''} ${
                    v?.disabled ? 'noDrop' : 'cursor'
                  }`}
                  onClick={() => {
                    if (!v.disabled) handleSetGame(v)
                  }}
                >
                  <img src={require(`../../assets/landing/logos/${v.imagePath}`)} alt={v.name} />
                </div>
              )
            })}
          </CustomCarousel>
        </div>

        {selectedGame && (
          <div className='signup_form_box'>
            <div className='signup_body'>
              <h1>Create Your Account</h1>

              <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
                <Row gutter={[30, 10]}>
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'userName'}
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
                      name={'provience'}
                      label='Provience'
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
                      name={'timezone'}
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
                      name={'howYouHear'}
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
                        I have read the{' '}
                        <a
                          href='https://app.termly.io/document/terms-of-service/372d4c41-9267-4833-8bbb-aba80f6fbbb8'
                          target='_blank'
                          rel='noreferrer'
                        >
                          Terms of Service and Privacy Policy
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
        )}
      </SelectGameRight>
    </div>
  )
}

export default SelectGame
