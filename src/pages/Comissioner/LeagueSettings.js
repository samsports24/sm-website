import { useEffect, useState } from 'react'
import { Button, Col, Divider, Form, Input, Row, Select } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import { getLeagueDetails, updateNewLeague } from '../../redux'
import { useSelector } from 'react-redux'
import useDebounce from '../../hooks/useDebounce'
import { createConference, createDivision } from '../../redux/actions/confAndDivisionAction'

const LeagueSetting = () => {
  const { currentLeague } = useSelector((state) => state.league)
  const isAuthenticated = localStorage.getItem('token')
  const [loading, setLoading] = useState(false)

  const getData = async () => {
    if (isAuthenticated) {
      await getLeagueDetails()
    }
  }
  useEffect(() => {
    getData()
  }, [])

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

  const [disabledDivisions1, setDisabledDivisions1] = useState(true)
  const [disabledDivisions2, setDisabledDivisions2] = useState(true)

  const onFinish = async (values) => {
    let payload = {
      leagueId: values?.leagueId,
      coComissione: values?.coComissioner,
      prizePool: values?.prizePool,
    }
    setLoading(true)
    await updateNewLeague(payload)
    setLoading(false)
  }

  useEffect(() => {
    const conferences1 = currentLeague?.conferences?.find((v) => v?.key == 1)
    const conferences2 = currentLeague?.conferences?.find((v) => v?.key == 2)
    const divisions = currentLeague?.divisions
    setDisabledDivisions1(!conferences1?.name)
    setDisabledDivisions2(!conferences2?.name)
    setConf1(conferences1?.name ?? '')
    setConf2(conferences2?.name ?? '')

    divisions?.forEach((division, index) => {
      if (division && index < 8) {
        switch (division.key) {
          case 1:
            setDivision1(division.name ?? '')
            break
          case 2:
            setDivision2(division.name ?? '')
            break
          case 3:
            setDivision3(division.name ?? '')
            break
          case 4:
            setDivision4(division.name ?? '')
            break
          case 5:
            setDivision5(division.name ?? '')
            break
          case 6:
            setDivision6(division.name ?? '')
            break
          case 7:
            setDivision7(division.name ?? '')
            break
          case 8:
            setDivision8(division.name ?? '')
            break
          default:
            break
        }
      }
    })
  }, [currentLeague])

  const _handleConference = useDebounce((conf, key) => {
    createConference({
      name: conf,
      key,
    })
  }, 1000)

  const handleConference = (conf, key) => {
    _handleConference(conf, key)
  }

  const _handleDivision = useDebounce((payload) => {
    createDivision(payload)
  }, 1000)

  const handleDivision = (div, key) => {
    const conferences1 = currentLeague?.conferences?.find((v) => v?.key == 1)
    const conferences2 = currentLeague?.conferences?.find((v) => v?.key == 2)

    const conferenceId = key <= 4 ? conferences1?._id : conferences2?._id
    _handleDivision({
      name: div,
      key: key,
      conference: conferenceId,
    })
  }

  return (
    <div className='league_settings'>
      <div className='comissioner_form_box'>
        <Form
          onFinish={onFinish}
          fields={[
            { name: 'leagueId', value: currentLeague?.leagueId },
            { name: 'prizePool', value: currentLeague?.prizePool },
          ]}
          layout='vertical'
        >
          <Form.Item
            label='Change League ID'
            name={'leagueId'}
            rules={[
              {
                required: true,
                message: 'Reqired',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Add Co-Comissioner'
            name={'coComissioner'}
            requiredMark={false}
            rules={[
              {
                required: true,
                message: 'Reqired',
              },
            ]}
          >
            <Select style={{ width: '100%' }} placeholder={'Select'}>
              {currentLeague?.users?.map((user) => (
                <Select.Option key={user?._id}>
                  {user?.userName} ({user?.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='Add/Change a Prize Pool Wallet Address' name={'prizePool'}>
            <Input placeholder='0x200000...' />
          </Form.Item>
          <Form.Item>
            <Button disabled loading={loading} type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
          <Divider />
          <Form.Item label='Please Name 2 Conferences'>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Input
                  value={conf1}
                  placeholder='Conference 1'
                  onChange={(e) => {
                    setConf1(e.target.value)
                    handleConference(e.target.value, 1)
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Input
                  value={conf2}
                  placeholder='Conference 2'
                  onChange={(e) => {
                    setConf2(e.target.value)
                    handleConference(e.target.value, 2)
                  }}
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label='Please Name 8 Divisions'>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Input
                  disabled={disabledDivisions1}
                  value={division1}
                  placeholder='Division 1'
                  onChange={(e) => {
                    setDivision1(e.target.value)
                    handleDivision(e.target.value, 1)
                  }}
                />
                <Input
                  disabled={disabledDivisions1}
                  value={division2}
                  placeholder='Division 2'
                  onChange={(e) => {
                    setDivision2(e.target.value)
                    handleDivision(e.target.value, 2)
                  }}
                />
                <Input
                  disabled={disabledDivisions1}
                  value={division3}
                  placeholder='Division 3'
                  onChange={(e) => {
                    setDivision3(e.target.value)
                    handleDivision(e.target.value, 3)
                  }}
                />
                <Input
                  disabled={disabledDivisions1}
                  value={division4}
                  placeholder='Division 4'
                  onChange={(e) => {
                    setDivision4(e.target.value)
                    handleDivision(e.target.value, 4)
                  }}
                />
              </Col>

              <Col xs={24} md={12}>
                <Input
                  disabled={disabledDivisions2}
                  value={division5}
                  placeholder='Division 5'
                  onChange={(e) => {
                    setDivision5(e.target.value)
                    handleDivision(e.target.value, 5)
                  }}
                />
                <Input
                  disabled={disabledDivisions2}
                  value={division6}
                  placeholder='Division 6'
                  onChange={(e) => {
                    setDivision6(e.target.value)
                    handleDivision(e.target.value, 6)
                  }}
                />
                <Input
                  disabled={disabledDivisions2}
                  value={division7}
                  placeholder='Division 7'
                  onChange={(e) => {
                    setDivision7(e.target.value)
                    handleDivision(e.target.value, 7)
                  }}
                />
                <Input
                  disabled={disabledDivisions2}
                  value={division8}
                  placeholder='Division 8'
                  onChange={(e) => {
                    setDivision8(e.target.value)
                    handleDivision(e.target.value, 8)
                  }}
                />
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LeagueSetting
