import React from 'react'
import { Button } from 'antd'

const HomeMainBanner = () => {
  return (
    <div className='home_main_banner_new'>
      <div className='banner_wrapper'>
        <div className='banner_content'>
          <h3>{"WHAT'S TRENDING"}</h3>
          <h1>{"WHAT'S TRENDING"}</h1>
          <p>
            Etiam scelerisque tortor at lectus dapibus, nec fermentum diam feugiat. Morbi rutrum
            magna et dui feugiat, non tristique mi.
          </p>
          <Button type='primary' htmlType='submit'>
            Read More
          </Button>
        </div>
      </div>
      <div className='image_div'>
        <img className='main_banner_image' src={require('../../assets/img.png')} />
      </div>
    </div>
  )
}

export default HomeMainBanner
