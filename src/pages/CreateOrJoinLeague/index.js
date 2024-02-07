import React, { useState } from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Button, Col, DatePicker, Form, Input, Radio, Row } from 'antd'

const CreateOrJoinLeague = () => {
  const [form] = Form.useForm()
  const [formType, setFormType] = useState('create')
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
    }
    console.log(obj)
    setLoading(false)
  }

  return (
    <div className='select_game_container cjl_container'>
      <SelectGameLeft logo={localStorage.getItem('imagePath')} />
      <SelectGameRight>
        <div className='cjl_body'>
          <div className='button_box'>
            <Button type='primary' className='inactive'>
              Step 1
            </Button>
            <Button type='primary'>Step 2</Button>
          </div>
          <div className='radio_button_box'>
            <Radio.Group onChange={(e) => setFormType(e.target.value)} value={formType}>
              <Radio value={'create'}>Create a League</Radio>
              <Radio value={'join'}>Join a League</Radio>
            </Radio.Group>
          </div>
          <div className='form_conatiner'>
            <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
              <Row gutter={[30, 10]}>
                <Col xs={24} md={12} xl={8}>
                  <Form.Item
                    name={'teamName'}
                    label='Team Name'
                    rules={[
                      {
                        required: true,
                        message: 'Required!',
                      },
                    ]}
                  >
                    <Input placeholder='Team Name Here...' />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                  <Form.Item
                    name={'leagueName'}
                    label='League Name'
                    rules={[
                      {
                        required: true,
                        message: 'Required!',
                      },
                    ]}
                  >
                    <Input placeholder='League Name Here...' />
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

                {/* <Col xs={24} md={12} xl={8}>
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
              </Col> */}

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

                {/* <Col xs={24} md={12} xl={8}>
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
              </Col> */}

                <Col xs={24}>
                  <Form.Item>
                    <Button loading={loading} type='primary' htmlType='submit'>
                      JOIN
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </SelectGameRight>
    </div>
  )
}

export default CreateOrJoinLeague
