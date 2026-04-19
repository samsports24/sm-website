import { Button } from 'antd'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import BannerImage from '../../assets/playerOfTheWeek.png'
// import PlayoffsBanner from '../../assets/sfl_playoffs_edit.png'
// import PlayoffsBanner from '../../assets/LandingpageWeek20_old.png'
import PlayoffsBanner from '../../assets/LandingpageWeek20.png'
import CfbBanner from '../../assets/CFB_banner_edit.png'
import BaseballBanner from '../../assets/Baseball_banner_2_edit.png'
import SoccerBanner from '../../assets/Soccer_banner_edit.png'
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
          showDots={false}
          responsive={responsive}
          arrows={false}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={3000}
          keyBoardControl={true}
        >
          <div className='banner_wrapper'>
            <img src={PlayoffsBanner} className='new_image'/>
          </div>
          <div className='banner_wrapper' >
            <img src={CfbBanner}  className='new_image'/>
          </div>
          <div className='banner_wrapper'>
            <img src={BaseballBanner} className='new_image'/>
          </div>
          <div className='banner_wrapper'>
            <img src={SoccerBanner} className='new_image'/>
          </div>

          {/* <div className='banner_wrapper'>
          <div className='banner_content'>
            <div className='arrow-icon'>
              <img src={LeftArrow} />
              <img src={RightArrow} />
            </div>
            <h3>{"WHAT'S TRENDING"}</h3>
            <h1>{"WHAT'S TRENDING"}</h1>
            <p>
              {`Welcome to SAM Ultimate Sports, where we offer an unparalleled GM experience that fully immerses you in the world of your favorite sport. As the mastermind behind the scenes, you'll make crucial decisions, shape strategies, and lead your team to victory. Experience the thrill of realistic sports management with SAM Ultimate Sports - your gateway to becoming a true sports strategist. Your ultimate GM adventure starts here.`}
            </p>
            <Button type='primary' htmlType='submit'>
              Read More
            </Button>
          </div>
          <div className='image_div'>
            <img className='main_banner_image' src={BannerImage} />
          </div>
        </div> */}

          {/* <div className='banner_wrapper'>
          <div className='banner_content'>
            <div className='arrow-icon'>
              <img src={LeftArrow} />
              <img src={RightArrow} />
            </div>
            <h3>{"WHAT'S TRENDING"}</h3>
            <h1>{"WHAT'S TRENDING"}</h1>
            <p>
              {`Welcome to SAM Ultimate Sports, where we offer an unparalleled GM experience that fully immerses you in the world of your favorite sport. As the mastermind behind the scenes, you'll make crucial decisions, shape strategies, and lead your team to victory. Experience the thrill of realistic sports management with SAM Ultimate Sports - your gateway to becoming a true sports strategist. Your ultimate GM adventure starts here.`}
            </p>
            <Button type='primary' htmlType='submit'>
              Read More
            </Button>
          </div>
          <div className='image_div'>
            <img className='main_banner_image' src={BannerImage} />
          </div>
        </div> */}
        </Carousel>
      </div>
  )
}

export default LandingBanner
