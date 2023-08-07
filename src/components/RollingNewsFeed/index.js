import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

import icon from '../../assets/Ellipse 36.svg'
import twitterIcon from '../../assets/Ellipse 35.svg'
import fbIcon from '../../assets/Ellipse 37.svg'

const RollingNewsFeed = () => {
  return (
    <div className='rolling_news_feed'>
      <header>
        <h3>NFL Rolling News Feed</h3>
        <p>
          View All <BiRightArrowAlt size={18} />
        </p>
      </header>
      <section className='content_body'>
        {['', '']?.map((v, i) => {
          return (
            <div key={i} className='card_box'>
              <div className='card_box_header'>
                <p>Marlon Mack Has Good Day At Practice</p>
                <BiRightArrowAlt size={18} />
              </div>
              <div className='news_feed_share'>
                <div className='left_side'>
                  <h6>Share:</h6>
                  <img src={twitterIcon} />
                  <img src={icon} />
                  <img src={fbIcon} />
                </div>
                <p>12 hours ago</p>
              </div>
              <p className='news'>
                Arizona Cardinals running back Marlon Mack reportedly had a good day at practice on
                Saturday. The 27-year-old, who signed with the team on Friday, ...
              </p>
              <div className='source'>
                <p>Dennis Clausen - RotoBaller</p>
                <p>
                  <b>
                    Source: <span>Jess Root</span>
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
