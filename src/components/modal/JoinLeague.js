import { useState } from 'react'
import {
  Modal,
  Button,
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Avatar,
  Radio,
  Rate,
  Divider,
} from 'antd'
import LeagueEmptyCard from '../NewPopularLeagueCard/EmptyCard'
import { joinLeagueFromPlatform } from '../../redux'

const JoinLeague = ({ data }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const onFinish = async (values) => {
    setLoading(true)
    const obj = {
      ...values,
      leagueId: data?._id,
    }

    if (data?.leagueType === 'public') {
      delete obj.leaguePassword
    }

    const res = await joinLeagueFromPlatform(obj)
    if (res) {
      handleCancel()
    }
    setLoading(false)
  }
  return (
    <>
      <div className='button_row' onClick={showModal} style={{ cursor: 'pointer' }}>
        <p className='join-now'>Join Now</p>
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
          <h2 className='modal_header_heading main_heading'>Join League</h2>
          <Divider />
          <div>
            <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
              <Row gutter={[30, 10]}>
                <Col xs={24} md={12}>
                  <Form.Item name={'id'} label='League ID'>
                    <Input placeholder={data?.leagueId} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
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

                {data?.leagueType === 'private' && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      name={'leaguePassword'}
                      label='League Password'
                      rules={[
                        {
                          required: data?.leagueType === 'private' ? true : false,
                          message: 'Required!',
                        },
                      ]}
                    >
                      <Input placeholder='League Password Here...' />
                    </Form.Item>
                  </Col>
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
        </div>
      </Modal>
    </>
  )
}

export default JoinLeague
