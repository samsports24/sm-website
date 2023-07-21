import { Button, Col, Row } from 'antd'
import React from 'react'

const HomeMainBanner = () => {
  return (
    <div className='home-main-banner'>
      <Row>
        <Col lg={14}>
          <div className='d-flex justify-end'>
            <div className='banner-content'>
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
        </Col>
        <Col lg={7}>
          <div className='image-div'>
            <img className='main-banner-image' src={require('../../assets/img.png')} />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default HomeMainBanner
