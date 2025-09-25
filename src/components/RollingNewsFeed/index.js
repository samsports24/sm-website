import React, { useEffect, useState } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

// import icon from '../../assets/Ellipse 36.svg'
// import twitterIcon from '../../assets/Ellipse 35.svg'
// import fbIcon from '../../assets/Ellipse 37.svg'
import { getNewsFeed } from '../../redux'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

const RollingNewsFeed = ({ height = '463px' }) => {
  const [news, setNews] = useState([])

  // useEffect(() => {
  //   ;(async () => {
  //     let data = await getNewsFeed()
  //     setNews(data)
  //   })()
  // }, [])

  const navigate = useNavigate()

  return (
    <>
      <div className='news_header_top'>
        <h1>THE SAM NEWS</h1>
        <div>
          <p>Your latest sport</p>
        </div>
      </div>

      <div className='rolling_news_feed'>
        <header>
          <h3>NFL Rolling News Feed</h3>
          <p
            onClick={() => {
              navigate('/all-news')
            }}
          >
            View All <BiRightArrowAlt size={18} />
          </p>
        </header>
        <section className='content_body' style={{ maxHeight: height }}>
          {news?.map((v) => {
            return (
              <div key={v.NewsID} className='card_box'>
                <div className='card_box_header'>
                  {/* <p>{v.Title}</p> */}
                  <p>{v.headline}</p>
                  

                  <BiRightArrowAlt size={18} />
                </div>
                <div className='news_feed_share'>
                  {/* <div className='left_side'>
                  <h6>Share:</h6>
                  <img src={twitterIcon} />
                  <img src={icon} />
                  <img src={fbIcon} />
                </div> */}
                  <p>
                    
                    {/* {v.TimeAgo} */}
                    {/* {v.lastModified} */}
                     {moment(v.lastModified).fromNow()}
                    
                    </p>
                </div>
                <p className='news'>
                  {/* {v.Content} */}
                  {v.description}
                  </p>
                <div className='source'>
                  <p>
                    {/* {v.Author} */}
                    {v.byline}

                  </p>
                  <p>
                    <b>
                      {/* Source: <span>{v.Source}</span> */}
                      {/* Source: <span>Rapid Api</span> */}
                    </b>
                  </p>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}

export default RollingNewsFeed
