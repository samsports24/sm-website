import React, { useState } from 'react'

import { Button, Row, Col, Form, Input, Avatar } from 'antd'

// import Arrow from '../assets/arrow-right.svg'

import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { getUser } from '../redux'
import { updateTeam } from '../redux/actions/teamActions'

const TeamSetting = () => {
  const user = useSelector((state) => state.user.userDetails)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
  }

  const _updateTeam = async (payload) => {
    setLoading(true)
    const res = await updateTeam(payload)
    if (res) {
      dispatch(getUser())
    }
    setLoading(false)
  }

  const onFinish = async (values) => {
    const name = values?.name ? values?.name : user?.team?.name || ''
    const picture = file ? file : user?.team?.logo || ''
    const gmName = values?.gmName ? values?.gmName : user?.team?.gmName || ''
    const abbreviation = values?.abbreviation
      ? values?.abbreviation
      : user?.team?.abbreviation || ''
    const gmTwitter = values?.gmTwitter ? values?.gmTwitter : user?.team?.gmTwitter || ''
    const city = values?.city ? values?.city : user?.team?.city || ''
    const hometown = values?.hometown ? values?.hometown : user?.team?.hometown || ''
    const teamTwitter = values?.teamTwitter ? values?.teamTwitter : user?.team?.teamTwitter || ''
    const teamColor = values?.teamColor ? values?.teamColor : user?.team?.teamColor || ''

    if (file) {
      let formdata = new FormData()
      formdata.append('name', name)
      formdata.append('pictures', picture)
      formdata.append('gmName', gmName)
      formdata.append('abbreviation', abbreviation)
      formdata.append('gmTwitter', gmTwitter)
      formdata.append('city', city)
      formdata.append('hometown', hometown)
      formdata.append('teamTwitter', teamTwitter)
      formdata.append('teamColor', teamColor)

      await _updateTeam(formdata)
    } else {
      const obj = {
        name,
        gmName,
        abbreviation,
        gmTwitter,
        city,
        hometown,
        teamTwitter,
        teamColor,
      }
      await _updateTeam(obj)
    }
  }

  const validateAbbreviation = (_, value) => {
    return new Promise((resolve, reject) => {
      if (value && value.length > 3) {
        reject('Team abbreviation must be 3 letters or less')
      } else {
        resolve()
      }
    })
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <ButtonsAndPagination noWeek={true} />

      <hr className='divider' />

      <section className='squad_card_container transparent team_setting'>
        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          fields={[
            {
              name: 'name',
              value: user?.team?.name,
            },
            {
              name: 'pictures',
              value: user?.team?.logo,
            },
            {
              name: 'gmName',
              value: user?.team?.gmName,
            },
            {
              name: 'abbreviation',
              value: user?.team?.abbreviation,
            },
            {
              name: 'gmTwitter',
              value: user?.team?.gmTwitter,
            },
            {
              name: 'city',
              value: user?.team?.city,
            },
            {
              name: 'hometown',
              value: user?.team?.hometown,
            },
            {
              name: 'teamTwitter',
              value: user?.team?.teamTwitter,
            },
            {
              name: 'teamColor',
              value: user?.team?.teamColor,
            },
          ]}
        >
          <Row gutter={[30, 30]}>
            <Col xs={24}>
              <div className='header'>
                <h2>TEAM SETTINGS</h2>
              </div>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'name'} label='Team Name'>
                <Input placeholder='Team Name Here...' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'gmName'} label='GM Name'>
                <Input placeholder='GM Name Here...' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />
            <Col xs={24} lg={12} xl={8}>
              <Form.Item
                name={'abbreviation'}
                label='Team Abbreviation (3 Letters Max)'
                rules={[
                  {
                    validator: validateAbbreviation,
                  },
                ]}
              >
                <Input placeholder='ABC' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'gmTwitter'} label='GM Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'city'} label='Team City'>
                <Input placeholder='City name here' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'hometown'} label='GM Hometown'>
                <Input placeholder='Hometown name here' />
              </Form.Item>
            </Col>
            <Col lg={24} xl={4}>
              <Form.Item name={'pictures'} label='Team Logo'>
                <>
                  <label className='file_button' htmlFor='fileInput'>
                    Add Image {imageSrc && <Avatar style={{ marginLeft: '5px' }} src={imageSrc} />}
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
            <Col lg={0} xl={4}>
              <Form.Item name={'teamColor'} label='Team Color'>
                <Input type='color' style={{ height: '40px', width: '70px' }} />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'teamTwitter'} label='Team Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Button loading={loading} type='primary' htmlType='submit'>
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </section>
    </div>
  )
}

export default TeamSetting
