import React, { useState } from 'react'

import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'

import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
// import Loader from '../components/Loader'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { IoAlertCircleSharp } from 'react-icons/io5'
import Loader from '../components/Loader'

const LeagueNotification = () => {
  const [isLoading] = useState(false)
  const [data] = useState([
    {
      type: 'Message',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictum sit amet justo donec enim diam vulputate. Proin fermentum leo vel orci. Commodo elit at imperdiet dui accumsan. Pretium quam vulputate dignissim suspendisse in est ante. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Tellus orci ac auctor augue mauris augue neque. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Venenatis a condimentum vitae sapien pellentesque habitant.',
    },
    {
      type: 'Auction Alert',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictum sit amet justo donec enim diam vulputate. Proin fermentum leo vel orci. Commodo elit at imperdiet dui accumsan. Pretium quam vulputate dignissim suspendisse in est ante. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Tellus orci ac auctor augue mauris augue neque. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Venenatis a condimentum vitae sapien pellentesque habitant.',
    },
    {
      type: 'Trade Offer',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictum sit amet justo donec enim diam vulputate. Proin fermentum leo vel orci. Commodo elit at imperdiet dui accumsan. Pretium quam vulputate dignissim suspendisse in est ante. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Tellus orci ac auctor augue mauris augue neque. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Venenatis a condimentum vitae sapien pellentesque habitant.',
    },
  ])

  const navigate = useNavigate()

  return (
    <div className='practice_squad_container team_trade_main league_notification_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate(-1)}>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Leagues</p>,
            },
            {
              title: <p>League Notification</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <div className='league_notification'>
        <header>
          <h3></h3>
        </header>
        <section className='league_standings_body'>
          {isLoading ? (
            <Loader />
          ) : data?.length > 0 ? (
            data?.map((v) => {
              return (
                <div key={v._id} className='card_box'>
                  <div className='header'>
                    <p>{v?.type}</p>
                    <span>
                      {v?.type?.toLowerCase().includes('alert') && (
                        <IoAlertCircleSharp size={20} color='red' />
                      )}
                    </span>
                  </div>
                  <div className='content'>
                    <p>{v?.message}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='no_notification_box'>
              <p>No Notification...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default LeagueNotification
