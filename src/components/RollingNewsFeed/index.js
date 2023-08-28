import React, { useEffect, useState } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// import icon from '../../assets/Ellipse 36.svg'
// import twitterIcon from '../../assets/Ellipse 35.svg'
// import fbIcon from '../../assets/Ellipse 37.svg'
import { getNewsFeed } from '../../redux'

const RollingNewsFeed = () => {
  const [news, setNews] = useState([])

  useEffect(() => {
    ;(async () => {
      let data = await getNewsFeed()
      setNews(data)
    })()
  }, [])

  return (
    <div className='rolling_news_feed'>
      <header>
        <h3>NFL Rolling News Feed</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='content_body'>
        {news?.map((v) => {
          return (
            <div key={v.NewsID} className='card_box'>
              <div className='card_box_header'>
                <p>{v.Title}</p>
                <BiRightArrowAlt size={18} />
              </div>
              <div className='news_feed_share'>
                {/* <div className='left_side'>
                  <h6>Share:</h6>
                  <img src={twitterIcon} />
                  <img src={icon} />
                  <img src={fbIcon} />
                </div> */}
                <p>{v.TimeAgo}</p>
              </div>
              <p className='news'>{v.Content}</p>
              <div className='source'>
                <p>{v.Author}</p>
                <p>
                  <b>
                    Source: <span>{v.Source}</span>
                  </b>
                </p>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default RollingNewsFeed
