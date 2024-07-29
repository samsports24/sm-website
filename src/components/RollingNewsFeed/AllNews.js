
import React, { useEffect, useState } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'


import { getNewsFeed } from '../../redux'
import { useNavigate } from 'react-router-dom'

const AllNews = () => {
    const [news, setNews] = useState([])

    useEffect(() => {
      ;(async () => {
        let data = await getNewsFeed()
        setNews(data)
      })()
    }, [])
  return (
    <div>
      
    </div>
  )
}

export default AllNews
