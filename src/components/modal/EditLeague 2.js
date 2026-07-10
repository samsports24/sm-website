import { useEffect, useState } from 'react'
import { Modal, Button, Input, Form, Row, Col, Avatar, Radio, Rate, Select } from 'antd'
import SamDatePicker from '../SamDatePicker'
import LeagueEmptyCard from '../NewPopularLeagueCard/EmptyCard'
import { updateLeagueCommissioner } from '../../redux'
import { landingSignup } from '../../config/constants'
import { CiMenuKebab } from "react-icons/ci";
import dayjs from 'dayjs'

const EditLeague = ({ data, isCommissioner = false }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [imageSrc, setImageSrc] = useState(null)
  const [file, setFile] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [leagueMode, setLeagueMode] = useState('full')

  useEffect(() => {
    if(isModalVisible && data){
      data?.name && form.setFieldValue('name', data?.name)
      data?.numberOfTeams && form.setFieldValue('numberOfTeams', data?.numberOfTeams)
      data?.draftType && form.setFieldValue('draftType', data?.draftType)
      data?.leagueId && form.setFieldValue('leagueId', data?.leagueId)
      data?.prizePool && form.setFieldValue('prizePool', data?.prizePool)
      data?.entryFee && form.setFieldValue('entryFee', data?.entryFee)
      data?.leagueLevel && form.setFieldValue('leagueLevel', data?.leagueLevel)
      data?.description && form.setFieldValue('description', data?.description)
      data?.draftStart && form.setFieldValue('draftStart', dayjs(data?.draftStart))
      data?.leagueType && form.setFieldValue('leagueType', data?.leagueType)
      data?.leagueMode && form.setFieldValue('leagueMode', data?.leagueMode)
      data?.scoringMode && form.setFieldValue('scoringMode', data?.scoringMode)
      setLeagueMode(data?.leagueMode || 'full')
      if (data?.leagueType === 'private') {
      //   form.setFieldValue('leaguePassword', data?.leaguePassword ?? '')
        setIsPrivate(true)
      }
    }
  },[isModalVisible ,data])

  const showModal = () => {
    if (localStorage.getItem('token')) {
      setIsModalVisible(true)
    } else {
      landingSignup()
    }
  }
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setFile(null)
    setImageSrc(null)
    setIsPrivate(false)
  }

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...data,
      ...values,
      draftStart: dayjs(values?.draftStart).toISOString(),
    }

    if (values?.leagueType === 'public') {
      delete obj.leaguePassword
    }

    // let formdata = new FormData()
    // if (file) {
    //   formdata.append('pictures', file)
    // }
    // Object.entries(obj).map(([key, value]) => {
    //   if (value) {
    //     formdata.append(key, value)
    //   }
    // })

    await updateLeagueCommissioner(obj)
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
      <div 
        onClick={(e) => {
          e.stopPropagation()
          if(isCommissioner){
            showModal()
          }
        }}   
        style={{ width: 'max-content', position: 'absolute', top: 10 ,right: 10, zIndex: 1000 ,cursor: 'pointer' }}
      >
        <CiMenuKebab style={{color: 'white'}} />
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
          <h2 className='modal_header_heading main_heading'>Edit League</h2>
          <div>
            <Form
              form={form}
              layout='vertical'
              onFinish={onFinish}
              autoComplete='off'
              onValuesChange={(e) => {
                if (e.leagueType === 'private') setIsPrivate(true)
                if (e.leagueType === 'public') setIsPrivate(false)
                if (e.leagueMode) setLeagueMode(e.leagueMode)
              }}
            >
              <Row gutter={[30, 10]}>
                {/* <Col xs={24} md={12} xl={8}>
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
                </Col> */}

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

                <Col xs={24} md={12} xl={8}>
                  <Form.Item
                    name={'numberOfTeams'}
                    label='Number of Teams'
                    rules={[
                      {
                        required: true,
                        message: 'Required!',
                      },
                    ]}
                  >
                    <Select placeholder='Select Number of Teams'>
                      <Select.Option value={10}>10</Select.Option>
                      <Select.Option value={16}>16</Select.Option>
                      <Select.Option value={24}>24</Select.Option>
                      <Select.Option value={32}>32</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* <Col lg={24} xl={4}>
                  <Form.Item name={'logo'} label='League Logo'>
                    <>
                      <label style={{ color: 'white' }} className='file_button' htmlFor='fileInput'>
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
                </Col> */}

                <Col lg={24} xl={4}></Col>

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
                    name={'draftFormat'}
                    label='Rookie Draft Format'
                  >
                    <Radio.Group>
                      <Radio value={'combined'}>Combined (Rookies in Entry Draft)</Radio>
                      <Radio value={'separate_rookie'}>Separate Rookie Draft</Radio>
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
                    <SamDatePicker placeholder='Select Draft Date' />
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
                    name={'leagueMode'}
                    label='League Mode'
                  >
                    <Radio.Group onChange={(e) => {
                      setLeagueMode(e.target.value)
                      if (e.target.value === 'full') form.setFieldValue('scoringMode', 'sam_metric')
                      else if (form.getFieldValue('scoringMode') === 'sam_metric') form.setFieldValue('scoringMode', 'ppr')
                    }}>
                      <Radio value={'full'}>Full Mode (53-man)</Radio>
                      <Radio value={'offense_only'}>Offense Only (30-man)</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                {leagueMode === 'offense_only' && (
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      name={'scoringMode'}
                      label='Scoring Format'
                    >
                      <Select placeholder='Select Scoring Format'>
                        <Select.Option value='ppr'>PPR (1 pt per reception)</Select.Option>
                        <Select.Option value='half_ppr'>Half PPR (0.5 pts per reception)</Select.Option>
                        <Select.Option value='standard'>Standard (No reception bonus)</Select.Option>
                        <Select.Option value='superflex'>Superflex (PPR + Superflex slot)</Select.Option>
                        <Select.Option value='te_premium'>TE Premium (1.5 pts per TE catch)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                {isPrivate && (
                  <>
                    <Col xs={24} md={12} xl={8}>
                      <Form.Item
                        name={'leaguePassword'}
                        label='League Password'
                        rules={[
                          {
                            required: data?.leaguePassword ? false : isPrivate ? true : false,
                            message: 'Required!',
                          },
                        ]}
                      >
                        <Input placeholder='Password' />
                      </Form.Item>
                    </Col>
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

                {/* <Col xs={24} xl={12}>
                  <Form.Item name={'users'} label='Users'>
                    <Select placeholder='Select users' mode='multiple'>
                      <Select.Option value={10}>10</Select.Option>
                      <Select.Option value={16}>16</Select.Option>
                      <Select.Option value={24}>24</Select.Option>
                      <Select.Option value={32}>32</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} xl={12}>
                  <Form.Item name={'teams'} label='Teams'>
                    <Select placeholder='Select teams' mode='multiple'>
                      <Select.Option value={10}>10</Select.Option>
                      <Select.Option value={16}>16</Select.Option>
                      <Select.Option value={24}>24</Select.Option>
                      <Select.Option value={32}>32</Select.Option>
                    </Select>
                  </Form.Item>
                </Col> */}

                <Col xs={24}>
                  <Form.Item name={'description'} label='League Description'>
                    <Input.TextArea rows={4} placeholder='' />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item>
                    <Button loading={loading} type='primary' htmlType='submit'>
                      Save
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

export default EditLeague
