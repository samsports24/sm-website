import React from 'react'
import { Row, Col, Typography } from 'antd'
import Carousel from 'react-multi-carousel'

const CommunitySection = () => {
  const responsive = {
    largeDesktop: {
      breakpoint: { max: 4000, min: 1400 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1400, min: 1150 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1150, min: 750 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 750, min: 0 },
      items: 1,
    },
  }
  const data = [
    {
      name: 'JOHN SURDILLA',
      description:
        '“In my 25+ years of playing fantasy football, both as a team owner and as commissioner of many leagues, I’ve always searched for ways to simulate the NFL General Manager experience.”',
    },
    {
      name: 'JAMIE THOMAS',
      description:
        '“I’ve been playing fantasy football since 1994 and I’ve seen the game grow and grow but for some reason I was always wanting more from it. Along came SAM Sports and it has provided that extra challenge.”',
    },
    {
      name: 'MAX VONCITO',
      description:
        '“Sam Sports is an absolute game-changer in the world of fantasy sports! From the moment I logged in, I was blown away by the sleek and smooth dashboard that greeted me.”',
    },
    {
      name: ‘THOMAS CHRISTOPHER’,
      description: `”Being an owner of a  Pro Football and a Pro Hockey teams , it has been an outstanding journey for me and my GM, knowing that there is more to come. If you’re looking for an innovative yet simulated version of pro sports then look no further, samsports is the one for you.”`,
    },
  ]

  return (
    <div className='community paddingInline'>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false}
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        {data?.map((v, i) => {
          return (
            <div key={i} className='community_card_wrapper'>
              <div className='community_card'>
                <img src={require('../../assets/landing/quote.png')} />
                <ul>
                  <li>{v.description}</li>
                </ul>
                <Typography.Title level={2}>{v.name}</Typography.Title>
              </div>
            </div>
          )
        })}
      </Carousel>

      <Row gutter={[80, 30]}>
        {/* {data.map((v) => {
          return (
            <Col key={v.name} xs={24} sm={8}>
              <div className='community_card'>
                <img src={require('../../assets/landing/quote.png')} />
                <ul>
                  <li>{v.description}</li>
                </ul>
                <Typography.Title level={2}>{v.name}</Typography.Title>
              </div>
            </Col>
          )
        })} */}
        {/* <Col xs={24}>
          <div className='community_button_box'>
            <div className='button' onClick={() => window.open('https://discord.gg/pAb5B7Npmy')}>
              <div className='icon_box'>
                <img src={require('../../assets/landing/community-btn-img.webp')} />
              </div>
              <Typography.Title level={3}>Join our community now</Typography.Title>
            </div>
          </div>
        </Col> */}
      </Row>
    </div>
  )
}

export default CommunitySection
