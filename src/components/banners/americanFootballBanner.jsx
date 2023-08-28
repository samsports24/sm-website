import React from 'react'

import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
const AmericalFootballBanner = () => {
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
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>

          {/* Tablet */}
          <div className='american-football-banner-tab'>
            <img src={require('../../assets/banner-img-tab.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>

          {/* Mobile */}
          <div className='american-football-banner-mobile'>
            <img src={require('../../assets/banner-img-mob.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>
        </>
        <>
          {/* Desktop */}
          <div className='american-football-banner-dekstop'>
            <img src={require('../../assets/rectangle-9.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>

          {/* Tablet */}
          <div className='american-football-banner-tab'>
            <img src={require('../../assets/banner-img-tab.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>

          {/* Mobile */}
          <div className='american-football-banner-mobile'>
            <img src={require('../../assets/banner-img-mob.png')} />
            <div className='content_wrapper'>
              <div className='left'>
                <h1>Try out a mock draft</h1>
                <p>Learn more about different types of draft modes.</p>
              </div>
            </div>
            <h1 className='play_now_text'>Play Now!</h1>
          </div>
        </>
      </Carousel>
    </>
  )
}

export default AmericalFootballBanner
