import React from 'react'

import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'

import barIcon from '../assets/bar-icon.svg'

import { practiceSquadData } from './mockData'

const PracticeSquad = () => {
  return (
    <div className='practice_squad_container'>
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

      <section className='squad_card_container'>
        {practiceSquadData?.map((v, i) => {
          return (
            <div key={i} className='squad_card_box'>
              <div className='squad_header'>
                <h2>{v?.title}</h2>
              </div>
              <div className='squad_content_body'>
                <div className='squad_image_box'>
                  <img src={require('../assets/player-img-6.png')} />
                </div>
                <div>
                  <p className='squad_text1'>position</p>
                  <p className='squad_text2'>{v?.position}</p>
                </div>
                <div>
                  <p className='squad_text1'>player name</p>
                  <p className='squad_text2'>{v?.playerName}</p>
                </div>
                <div>
                  <p className='squad_text1'>age</p>
                  <p className='squad_text2'>{v?.age}</p>
                </div>
                <div>
                  <p className='squad_text1'>team</p>
                  <p className='squad_text2'>{v?.team}</p>
                </div>
                <div>
                  <p className='squad_text1'>bye</p>
                  <p className='squad_text2'>{v?.bye}</p>
                </div>
                <div>
                  <p className='squad_text1'>player cap #</p>
                  <p className='squad_text2'>{v?.playerCap}</p>
                </div>
                <div>
                  <p className='squad_text1'>
                    year left <br /> experation
                  </p>
                </div>
                <div>
                  <p className='squad_text1'>
                    point per <br /> game
                  </p>
                </div>
                <div>
                  <p className='squad_text1'>
                    player <br /> rank
                  </p>
                </div>
                <img src={barIcon} />
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default PracticeSquad
