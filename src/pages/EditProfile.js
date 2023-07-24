import Layout from '../layout/Layout'
import { useState } from 'react'

import { Row, Col, Form, Input, DatePicker, Button } from 'antd'
import User1 from '../assets/user-pic-1.png'
import Color from '../assets/color-icon.svg'
const EditProfile = () => {
  const [loading, setLoading] = useState(false)

  const onChange = (date, dateString) => {
    console.log(date, dateString)
  }
  const onFinish = async (values) => {
    setLoading(true)
    console.log(values)
    setLoading(false)
  }
  return (
    <Layout>
      <div className='profile-container'>
        <div className='profile'>
          <div className='title'>
            <h2>Profile Information</h2>
          </div>
          <div className='profile-form'>
            <Form layout='vertical' onFinish={onFinish}>
              <Row gutter={[24, 0]} justify='space-between' align='bottom'>
                <Col xs={24} md={24} lg={3}>
                  <div className='profile-pic'>
                    <p>Profile Photo</p>
                    <img src={User1} />
                  </div>
                </Col>
                <Col xs={24} md={24} lg={5}>
                  <Form.Item
                    name='userName'
                    label='User Name'
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
                    <Input autoComplete='off' type='text' placeholder='User Name' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={5}>
                  <Form.Item
                    name='currentPassword'
                    label='Current Password'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='password' placeholder='Current Password' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={5}>
                  <Form.Item
                    name='newPassword'
                    label='New Password'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='password' placeholder='New Password' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={5}>
                  <Form.Item
                    name='confirmPassword'
                    label='Confirm Password'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='password' placeholder='Confirm Password' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={24}>
                  <div className='personal-information'>
                    <h3>Personal Information</h3>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='firstName'
                    label='First Name'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='text' placeholder='first name' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='lastName'
                    label='Last Name'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='text' placeholder='last name' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='phoneNumber'
                    label='Phone Number'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='text' placeholder='phone number' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='email'
                    label='Email Address'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered email is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='email' placeholder='xyz@gmail.com' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='dateOfBirth'
                    label='Date of Birth'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <DatePicker onChange={onChange} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='joinDate'
                    label='Join Date'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <DatePicker onChange={onChange} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='city'
                    label='City'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='email' placeholder='city' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12}>
                  <Form.Item
                    name='country'
                    label='Country'
                    rules={[
                      // {
                      //   type: 'string',
                      // },
                      {
                        required: true,
                        message: 'The entered password is not valid!',
                      },
                    ]}
                    requiredMark='optional'
                  >
                    <Input autoComplete='off' type='email' placeholder='Country' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={24}>
                  <Form.Item>
                    <div className='form-btn'>
                      <Button loading={loading} className='reset-btn'>
                        Reset
                      </Button>
                      <Button loading={loading} type='primary' htmlType='submit'>
                        Save Changes
                      </Button>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
        <div className='setting-container'>
          <h2>Settings</h2>
          <div className='setting-flex'>
            <div className='setting'>
              <div className='options'>
                <p>Side Bar Theme</p>
                <div className='color-div'>
                  <div className='color-pic'>
                    <img src={Color} />
                  </div>
                  <p>Change Color</p>
                </div>
              </div>
              <div className='options'>
                <p>Background Theme</p>
                <div className='color-div'>
                  <div className='color-pic'>
                    <img src={Color} />
                  </div>
                  <p>Change Color</p>
                </div>
              </div>
            </div>
            <div className='btn-container'>
              <Button loading={loading} className='reset-btn'>
                Reset
              </Button>
              <Button loading={loading} type='primary'>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
        {/* <div className='bottom-div'>
                    <p>© Sam Sports, Inc. All rights reserved.</p>
                </div> */}
      </div>
    </Layout>
  )
}

export default EditProfile
