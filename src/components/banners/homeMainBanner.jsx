import { Col, Row } from 'antd'
import React from 'react'

const HomeMainBanner = () => {
  return (
    <div className='home-main-banner'>
      <Row>
        <Col lg={17}>
          <div className='d-flex justify-end'>
            <div className='banner-content'>
              <h3>{"WHAT'S TRENDING"}</h3>
              <h1>{"WHAT'S TRENDING"}</h1>
              <p>
                Etiam scelerisque tortor at lectus dapibus, nec fermentum diam feugiat. Morbi rutrum
                magna et dui feugiat, non tristique mi.
              </p>
            </div>
          </div>
        </Col>
        <Col lg={6}>
          <img className='main-banner-image' src={require('../../assets/img.png')} />
        </Col>
      </Row>
    </div>
  )
}

export default HomeMainBanner
