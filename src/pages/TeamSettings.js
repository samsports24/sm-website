import React from 'react'

import { Button, Breadcrumb, Row, Col, Form, Input, Select } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const TeamSetting = () => {
  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <Form layout='vertical'>
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
              <Form.Item name={'name'} label='GM Name'>
                <Input placeholder='GM Name Here...' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'abbr'} label='Team Abbreviation (3 Letters Max)'>
                <Input placeholder='666' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'name'} label='GM Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'city'} label='Team City'>
                <Select
                  placeholder='Select'
                  style={{ width: '100%' }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: 'teams',
                      label: 'Teams',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'hometown'} label='GM Hometown'>
                <Select
                  placeholder='Select'
                  style={{ width: '100%' }}
                  // onChange={handleChange}
                  options={[
                    {
                      value: 'teams',
                      label: 'Teams',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col lg={24} xl={8}>
              <Form.Item name={'logo'} label='Team Logo'>
                <Button type='primary'>Add Image</Button>
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'name'} label='Team Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Button type='primary' htmlType='submit'>
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
