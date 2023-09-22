import React from 'react'

import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { useNavigate } from 'react-router-dom'

const AmericalFootballBanner = () => {
  const navigate = useNavigate()

  const handleNavigate = () => navigate('/public-league')

  const responsive = {
    mobile: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  }
  return (
    <>
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
        <>
          {/* Desktop */}
          <div className='american-football-banner-dekstop'>
            <img src={require('../../assets/rectangle-9.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Tablet */}
          <div className='american-football-banner-tab'>
            <img src={require('../../assets/banner-img-tab.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Mobile */}
          <div className='american-football-banner-mobile'>
            <img src={require('../../assets/banner-img-mob.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>
        </>
        <>
          {/* Desktop */}
          <div className='american-football-banner-dekstop'>
            <img src={require('../../assets/hockey_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Tablet */}
          <div className='american-football-banner-tab'>
            <img src={require('../../assets/hockey_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Mobile */}
          <div className='american-football-banner-mobile'>
            <img src={require('../../assets/hockey_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>
        </>
        <>
          {/* Desktop */}
          <div className='american-football-banner-dekstop'>
            <img src={require('../../assets/baseball_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Tablet */}
          <div className='american-football-banner-tab'>
            <img src={require('../../assets/baseball_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>

          {/* Mobile */}
          <div className='american-football-banner-mobile'>
            <img src={require('../../assets/baseball_banner.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out our public leagues</h1>
                <p>That&apos;s where your GM experience starts.</p>
              </div>
            </div>
            <h1 onClick={handleNavigate} className='play_now_text'>
              Play Now!
            </h1>
          </div>
        </>
      </Carousel>
    </>
  )
}

export default AmericalFootballBanner
