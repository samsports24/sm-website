import { Button, Col, Form, Input, Row, Select } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

const LeagueSetting = ({ data }) => {
  const [conf1, setConf1] = useState('')
  const [conf2, setConf2] = useState('')

  const [division1, setDivision1] = useState('')
  const [division2, setDivision2] = useState('')
  const [division3, setDivision3] = useState('')
  const [division4, setDivision4] = useState('')
  const [division5, setDivision5] = useState('')
  const [division6, setDivision6] = useState('')
  const [division7, setDivision7] = useState('')
  const [division8, setDivision8] = useState('')

  const onFinish = (values) => {
    let payload = {
      ...values,
      conf1,
      conf2,
      division1,
      division2,
      division3,
      division4,
      division5,
      division6,
      division7,
      division8,
    }
    console.log('payload', payload)
  }

  return (
    <div className='league_settings'>
      <Form
        onFinish={onFinish}
        fields={[
          { name: 'leagueId', value: data?.leagueId },
          { name: 'prizePool', value: data?.prizePool },
        ]}
        layout='vertical'
      >
        <Form.Item label='Change League ID' name={'leagueId'}>
          <Input />
        </Form.Item>
        <Form.Item label='Add Co-Comissioner' name={'coComissioner'}>
          <Select style={{ width: '100%' }}>
            {data?.users?.map((user) => (
              <Select.Option key={user?._id}>
                {user?.userName} ({user?.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='Please Name 2 Conferences'>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Input
                placeholder='Conference 1'
                onChange={(e) => {
                  setConf1(e.target.value)
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <Input
                placeholder='Conference 2'
                onChange={(e) => {
                  setConf2(e.target.value)
                }}
              />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label='Please Name 8 Divisions'>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Input
                placeholder='Division 1'
                onChange={(e) => {
                  setDivision1(e.target.value)
                }}
              />
              <Input
                placeholder='Division 2'
                onChange={(e) => {
                  setDivision2(e.target.value)
                }}
              />
              <Input
                placeholder='Division 3'
                onChange={(e) => {
                  setDivision3(e.target.value)
                }}
              />
              <Input
                placeholder='Division 4'
                onChange={(e) => {
                  setDivision4(e.target.value)
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <Input
                placeholder='Division 5'
                onChange={(e) => {
                  setDivision5(e.target.value)
                }}
              />
              <Input
                placeholder='Division 6'
                onChange={(e) => {
                  setDivision6(e.target.value)
                }}
              />
              <Input
                placeholder='Division 7'
                onChange={(e) => {
                  setDivision7(e.target.value)
                }}
              />
              <Input
                placeholder='Division 8'
                onChange={(e) => {
                  setDivision8(e.target.value)
                }}
              />
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Add/Change a Prize Pool Wallet Address' name={'prizePool'}>
          <Input placeholder='0x200000...' />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LeagueSetting
