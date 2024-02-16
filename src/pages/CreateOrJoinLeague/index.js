import React, { useState } from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Avatar, Button, Col, DatePicker, Form, Input, Radio, Rate, Row } from 'antd'
import dayjs from 'dayjs'
import { createNewLeague, joinLeague } from '../../redux'

const CreateOrJoinLeague = () => {
  const [form] = Form.useForm()
  const [formType, setFormType] = useState('create')
  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const [file, setFile] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isPrivateFromJoin, setIsPrivateFromJoin] = useState(false)
  let email = localStorage.getItem('email')

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
      draftStart: dayjs(values?.draftStart).toISOString(),
      email,
    }

    if (values?.leagueType === 'public') {
      delete obj.leaguePassword
    }

    let formdata = new FormData()
    if (file) {
      formdata.append('pictures', file)
    }
    Object.entries(obj).map(([key, value]) => {
      if (value) {
        formdata.append(key, value)
      }
    })
    await createNewLeague(formdata)
    setLoading(false)
  }

  const joinOnFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
      email,
    }
    if (values?.leagueType === 'public') {
      delete obj.leaguePassword
    }
    await joinLeague(obj)
    setLoading(false)
  }

  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
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
          {formType === 'create' && (
            <div className='form_conatiner'>
              <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
                autoComplete='off'
                onValuesChange={(e) => {
                  e.leagueType === 'private' && setIsPrivate(true)
                  e.leagueType === 'public' && setIsPrivate(false)
                }}
              >
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
                      name={'name'}
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

                  <Col lg={24} xl={4}>
                    <Form.Item name={'logo'} label='League Logo'>
                      <>
                        <label
                          style={{ color: 'white' }}
                          className='file_button'
                          htmlFor='fileInput'
                        >
                          Add Image{' '}
                          {imageSrc && <Avatar style={{ marginLeft: '5px' }} src={imageSrc} />}
                        </label>
                        <input
                          type='file'
                          hidden
                          id='fileInput'
                          onChange={(e) => handleFile(e?.target?.files[0])}
                          accept='image/jpg,image/png,image/jpeg'
                        />
                      </>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item name={'email'} label='User Email'>
                      <Input disabled placeholder={email} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'draftType'}
                      label='Draft Type'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={'live'}>Live Online Standard</Radio>
                        <Radio value={'auto'}>Auto Draft</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'draftStart'}
                      label='Select Draft Date'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <DatePicker placeholder='Select Draft Date' />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'leagueLevel'}
                      label='League Level'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Rate />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name={'leagueType'}
                      label='League Type'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={'public'}>Public</Radio>
                        <Radio value={'private'}>Private</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'leagueId'}
                      label='League ID'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Input placeholder='League ID...' />
                    </Form.Item>
                  </Col>

                  {isPrivate && (
                    <>
                      <Col xs={24} md={12} xl={8}>
                        <Form.Item
                          name={'leaguePassword'}
                          label='League Password'
                          rules={[
                            {
                              required: isPrivate ? true : false,
                              message: 'Required!',
                            },
                          ]}
                        >
                          <Input placeholder='Password' />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} xl={8}></Col>
                    </>
                  )}

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item name={'entryFee'} label='Entry Fee'>
                      <Input placeholder='Entry Fee (if any)' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item name={'prizePool'} label='Prize Pool'>
                      <Input placeholder='Prize Pool wallet address' />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name={'description'} label='League Description'>
                      <Input.TextArea rows={4} placeholder='' />
                    </Form.Item>
                  </Col>

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
          )}
          {formType === 'join' && (
            <div className='form_conatiner'>
              <Form
                form={form}
                layout='vertical'
                onFinish={joinOnFinish}
                autoComplete='off'
                onValuesChange={(e) => {
                  e.leagueType === 'private' && setIsPrivateFromJoin(true)
                  e.leagueType === 'public' && setIsPrivateFromJoin(false)
                }}
              >
                <Row gutter={[30, 10]}>
                  <Col xs={24}>
                    <Form.Item
                      name={'leagueType'}
                      label='Type'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={'public'}>Public</Radio>
                        <Radio value={'private'}>Private</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>

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
                      <Input placeholder='Team Name' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'leagueId'}
                      label='League ID'
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Input placeholder='League ID' />
                    </Form.Item>
                  </Col>

                  {isPrivateFromJoin && (
                    <>
                      <Col xs={24} md={12} xl={8}>
                        <Form.Item
                          name={'leaguePassword'}
                          label='League Password'
                          rules={[
                            {
                              required: isPrivateFromJoin ? true : false,
                              message: 'Required!',
                            },
                          ]}
                        >
                          <Input placeholder='Password' />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} xl={8}></Col>
                    </>
                  )}

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
          )}
        </div>
      </SelectGameRight>
    </div>
  )
}

export default CreateOrJoinLeague
