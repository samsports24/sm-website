
import React, { useEffect, useState } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import { getAllNewsFeed } from '../../redux'
import Header from '../../components/Header'
import moment from 'moment'

const AllNews = ({ height = '700px' }) => {
    const [allnews, setAllNews] = useState([])

    useEffect(() => {
      ;(async () => {
        let data = await getAllNewsFeed()
        setAllNews(data)
      })()
    }, [])
  return (
    <>
    <Header/>
      <div style={{marginTop:'50px'}} className='rolling_news_feed'>
        {/* <header>
          <h3>NFL Rolling News Feed</h3>
        </header> */}
        <section className='content_body'  style={{ maxHeight: height,backgroundcolor:'#130d24' }}>
          {allnews?.map((v) => {
            return (
              <div key={v.NewsID} className='card_box'>
                <div className='card_box_header'>
                  <p>
                    {/* {v.Title} */}
                    
                    {v.headline}
                    </p>
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
                  {moment(v.lastModified).fromNow()}
                    {/* {v.TimeAgo} */}
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

export default AllNews
