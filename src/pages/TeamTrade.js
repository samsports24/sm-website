import React from 'react'

import { Button, Breadcrumb, Row, Col, Select, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'
import AddPlayerToTrade from '../components/modal/PlayerInterfaceModals/AddPlayerToTrade'

// import barIcon from '../assets/bar-icon.svg'

// import { practiceSquadData } from './mockData'

const TeamTrade = () => {
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

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <Row gutter={[30, 30]}>
          <Col xs={24} lg={12}>
            <Select
              placeholder='Teams'
              style={{ minWidth: 130, float: 'right' }}
              // onChange={handleChange}
              options={[
                {
                  value: 'teams',
                  label: 'Teams',
                },
              ]}
            />
          </Col>
          <Col xs={24} lg={12}>
            <AddPlayerToTrade />
          </Col>
          <Col xs={24} lg={12}>
            <div className='add-player'>
              <div className='header'>
                <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div>
                <h2>YOUR TEAM</h2>
              </div>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className='add-player-section'>
                  <p>
                    <PlusOutlined /> Add Player
                  </p>
                  <p>Team name here</p>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className='add-player'>
              <div className='header'>
                <div className='left'>
                  <h2>ADD PLAYER</h2>
                  <Input style={{ width: '200px', height: '40px' }} />
                </div>
                <h2>YOUR TEAM</h2>
              </div>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className='add-player-section'>
                  <p>
                    <PlusOutlined /> Add Player
                  </p>
                  <p>Team name here</p>
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className='add-player'>
              <div className='header'>
                <div className='left'>
                  <h2>THEIR TEAM BEFORE TRADE</h2>
                </div>
              </div>
              {[
                {
                  title: 'UFAFL TOTAL CAP',
                  value: 'XXXXXXXXXX',
                },
                {
                  title: 'TEAM TOTAL CAP',
                  value: 'XXXXXXXXXXXX',
                },
              ].map((item, index) => (
                <div key={index} className='add-player-section'>
                  <p>{item.title}</p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className='add-player'>
              <div className='header'>
                <div className='left'>
                  <h2>THEIR TEAM BEFORE TRADE</h2>
                </div>
              </div>
              {[
                {
                  title: 'UFAFL TOTAL CAP',
                  value: 'XXXXXXXXXX',
                },
                {
                  title: 'TEAM TOTAL CAP',
                  value: 'XXXXXXXXXXXX',
                },
              ].map((item, index) => (
                <div key={index} className='add-player-section'>
                  <p>{item.title}</p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </section>
    </div>
  )
}

export default TeamTrade
