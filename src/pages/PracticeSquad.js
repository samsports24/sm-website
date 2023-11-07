import React from 'react'

// import { Button, Breadcrumb } from 'antd'

// import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import barIcon from '../assets/bar-icon.svg'

import { practiceSquadData } from './mockData'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
// import { useNavigate } from 'react-router-dom'

const PracticeSquad = () => {
  // const navigate = useNavigate()
  return (
    <div className='practice_squad_container'>
      {/* BREADCRUMB */}
      {/* <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
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
      </section> */}

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <div className='standing-table-bg'>
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
        </div>
      </section>
    </div>
  )
}

export default PracticeSquad
