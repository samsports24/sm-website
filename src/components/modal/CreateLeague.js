import { useState } from 'react'
import { Modal, Button, Input, Form, Row,Col,DatePicker, Avatar, Radio, Rate } from 'antd'
import LeagueEmptyCard from '../NewPopularLeagueCard/EmptyCard'
import {  createNewLeagueFromDashboard } from '../../redux'

const CreateLeague = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [imageSrc, setImageSrc] = useState(null)
  const [file, setFile] = useState(null)


  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
      draftStart: dayjs(values?.draftStart).toISOString(),
    }
    let formdata = new FormData()
    if(file){
      formdata.append('pictures', file)
    }
    Object.entries(obj).map(([key, value]) => {
      if(value){
        formdata.append(key, value)
      }
    })
    await createNewLeagueFromDashboard(formdata)
    setLoading(false)
    handleCancel()
  }
  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
  }

  return (
    <>
      <div onClick={showModal}>
      <LeagueEmptyCard />
      </div>
      <Modal
        centered
        open={isModalVisible}
        footer={false}
        onCancel={handleCancel}
        closeIcon={false}
        closable={false}
        className='normal-modal'
        width={1200}
      >
        <div className='close_modal_button' onClick={handleCancel}>
          x
        </div>
        <div className='modal_body'>
          <h2 className='modal_header_heading main_heading'>
           Create New League
          </h2>
          <div>
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

                  <Col xs={24} md={12} xl={8}>
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

                  <Col xs={24}>
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
        </div>
      </Modal>
    </>
  )
}

export default CreateLeague
