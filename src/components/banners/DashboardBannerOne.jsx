import { Col, Row } from 'antd'
import React from 'react'

const DashboardBannerOne = () => {
  return (
    <div className='dashboard-banner-1'>
      <Row gutter={[20, 20]}>
        <Col xs={24} md={24} lg={10} className='row'>
          <img width={139} src={require('../../assets/dragons-red-zone-square-1.png')} />
          <div>
            <h1>3</h1>
            <p>DRAGONS RED ZONE SQUARE</p>
          </div>
        </Col>

        <Col xs={24} md={24} lg={4} className='center-div'>
          <div className='container'>
            <img src={require('../../assets/versus-1.png')} />
          </div>
        </Col>
        <Col xs={24} md={24} lg={10} className='row'>
          <div>
            <h1>2</h1>
            <p>GRID IRON SEALS SQUARE</p>
          </div>

          <img width={144} src={require('../../assets/grid-iron-seals-square-2.png')} />
        </Col>
      </Row>
    </div>
  )
}

export default DashboardBannerOne
