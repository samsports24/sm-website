import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import LeftArrow from '../../assets/leftArrow.svg'
import RightArrow from '../../assets/rightArrow.svg'

import PopularLeagueCard from '../cards/popularLeagueCard'

import { popularLeaguesData } from '../../pages/mockData'

const QuickJoin = () => {
  const responsive = {
    mobile: {
      breakpoint: { max: 4000, min: 0 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
  }
  return (
    <div className='quick-join'>
      <div className='head'>
        <h3>Quick Join Leagues</h3>
        <div className='arrow-icons'>
          <img src={LeftArrow} />
          <img src={RightArrow} />
        </div>
      </div>
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
        {popularLeaguesData?.map((value, index) => (
          <div className='quick-join-Carousel' key={index}>
            <PopularLeagueCard data={value} />
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default QuickJoin
