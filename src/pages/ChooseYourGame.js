import { Button, Row, Col } from 'antd'

import { useState } from 'react'

import LegendsImage from '../assets/sam-legent-1.png'
import FootballImage from '../assets/sam-football.png'
import CollegeFootballImage from '../assets/sam-college-football.png'

const ChooseYourGame = () => {
  const [active, setActive] = useState('home')
  return (
    <div className='game-container'>
      <div className='head'>
        <div className='home-links'>
          <p
            className={active === 'home' ? 'active-link' : ''}
            onClick={() => {
              setActive('home')
            }}
          >
            Home
          </p>
          <span> {'>'} </span>
          <p
            className={active === 'signUp' ? 'active-link' : ''}
            onClick={() => {
              setActive('signUp')
            }}
          >
            Create Sign Up
          </p>
        </div>
        <div className='btn-container'>
          <Button>Back</Button>
        </div>
      </div>
      <div className='heading'>
        <h2>Step 1 of 4</h2>
      </div>
      <div className='steps-div'>
        <div className='step active-step'>
          <p>1</p>
        </div>
        <div className='line-border' />
        <div className='step'>
          <p>2</p>
        </div>
        <div className='line-border' />
        <div className='step'>
          <p>3</p>
        </div>
        <div className='line-border' />
        <div className='step'>
          <p>4</p>
        </div>
      </div>
      <div className='step-one'>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={8} lg={8}>
            <img src={LegendsImage} />
          </Col>
          <Col xs={24} md={8} lg={8}>
            <img src={FootballImage} className='active-image' />
          </Col>
          <Col xs={24} md={8} lg={8}>
            <img src={CollegeFootballImage} />
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ChooseYourGame
