import { Button } from 'antd'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import BannerImage from '../../assets/playerOfTheWeek.png'
import LeftArrow from '../../assets/leftArrow.svg'
import RightArrow from '../../assets/rightArrow.svg'

const LandingBanner = () => {
  const responsive = {
    mobile: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  }
  return (
    <div className='landing-banner'>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={true}
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        <div className='banner_wrapper'>
          <div className='banner_content'>
            <div className='arrow-icon'>
              <img src={LeftArrow} />
              <img src={RightArrow} />
            </div>
            <h3>{"WHAT'S TRENDING"}</h3>
            <h1>{"WHAT'S TRENDING"}</h1>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <Button type='primary' htmlType='submit'>
              Read More
            </Button>
          </div>
          <div className='image_div'>
            <img className='main_banner_image' src={BannerImage} />
          </div>
        </div>
        <div className='banner_wrapper'>
          <div className='banner_content'>
            <div className='arrow-icon'>
              <img src={LeftArrow} />
              <img src={RightArrow} />
            </div>
            <h3>{"WHAT'S TRENDING"}</h3>
            <h1>{"WHAT'S TRENDING"}</h1>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <Button type='primary' htmlType='submit'>
              Read More
            </Button>
          </div>
          <div className='image_div'>
            <img className='main_banner_image' src={BannerImage} />
          </div>
        </div>
      </Carousel>
    </div>
  )
}

export default LandingBanner
