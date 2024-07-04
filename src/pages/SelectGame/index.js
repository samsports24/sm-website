import React, { useEffect, useState } from 'react'
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
  const [isTokenPresent, setIsTokenPresent] = useState(false);

  const [user, setUser] = useState(null)
  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const token = queryParameters.get('token')
    console.log('token', token)
    if (token) {
      const decodedToken = jwtDecode(token)
      console.log(decodedToken)
      setDecodeEmail(decodedToken.emailsent)
      localStorage.setItem('email',decodedToken.emailsent)
      setUser(decodedToken.user)
      form.setFieldValue('email', decodedToken.emailsent)
      let football = games?.find((obj) => obj.key === 'football')
      handleSetGame(football)
      setIsTokenPresent(true);
    }
  }, [])

  console.log('verficationcode', verficationcode)
  console.log('modalshow', modalshow)

  // const handleConfirm = async () => {
  //   setModalShow(false)
  // }

  const handleSetGame = (v) => {
    setSelectedGame(v.key)
    localStorage.setItem('selectedGame', v.key)
    localStorage.setItem('imagePath', v.imagePath)
  }

  // const onFinish = async (values) => {
  //    console.log('values',values);
  //    setLoading(true)
  //   if (values.termsAndCondtions) {
  //     let server = serverUrls.find((item) => item.key === selectedGame)
  //     const obj = {
  //       ...values,
  //       dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
  //       url: server.url,
  //     }
  //     // console.log(obj)
  //       await authSignupAdvanced(obj, navigate)
  //   } else {
  //     notification.warning({
  //       message: 'Please Accept Terms and Conditions',
  //       duration: 4,
  //     })
  //   }

  //   setLoading(false)
  // }





  const handleConfirm = async () => {
    setModalShow(false);
    const values = form.getFieldsValue();

    let server = serverUrls.find((item) => item.key === selectedGame);
    const obj = {
      ...values,
      dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
      url: server.url,
      verficationcode,
    };

    await authSignupAdvanced(obj, navigate);
    setVerficationcode('')
  };

  // const onFinish = async (values) => {
  //   console.log('values', values);
  //   setLoading(true);

  //   if (values.termsAndCondtions) {
  //     let server = serverUrls.find((item) => item.key === selectedGame);
  //     await GenerateVerificationCode({
  //       emailsent: values.email,
  //       user,
  //     });

  //     setModalShow(true);
  //   } else {
  //     notification.warning({
  //       message: 'Please Accept Terms and Conditions',
  //       duration: 4,
  //     });
  //   }

  //   setLoading(false);
  // };


  const onFinish = async (values) => {
    console.log('values', values);
    setLoading(true);

    if (values.termsAndCondtions) {
      let server = serverUrls.find((item) => item.key === selectedGame);

      if (isTokenPresent) {
        await GenerateVerificationCode({
          emailsent: values.email,
          user,
        });
        setModalShow(true);
      } else {
        const obj = {
          ...values,
          dateOfBirth: dayjs(values?.dateOfBirth).toISOString(),
          url: server.url,
        };
        await authSignupAdvanced(obj, navigate);
      }
    } else {
      notification.warning({
        message: 'Please Accept Terms and Conditions',
        duration: 4,
      });
    }

    setLoading(false);
  }



  const filterOption = (input, option) =>
    (option.label ?? '').toLowerCase().includes(input.toLowerCase())

  const survey = ['Social Media', 'Google/Search Engine', 'Third-Party Review', 'Other']

  console.log('my decodemail', deocdeemail)

  return (
    <>
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
                        <Input
                          type='email'
                          // value={deocdeemail || ''}
                          placeholder='Email Address Here...'
                          disabled={deocdeemail ? true : false}
                        />
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
                        label='Province'
                        rules={[
                          {
                            required: false,
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

      <VerificationcodeModal
        key={'modal'}
        visible={modalshow}
        onClose={handleConfirm}
        verficationcode={verficationcode}
        setVerficationcode={setVerficationcode}
      />
    </>
  )
}

export default SelectGame
