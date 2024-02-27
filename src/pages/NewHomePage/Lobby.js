import React from 'react'
import { Col, Row, notification } from 'antd'
import logo from '../../assets/sam-football.png'
import { useNavigate } from 'react-router-dom'
import CreateLeague from '../../components/modal/CreateLeague'

const Lobby = () => {
  const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()

  return (
    <div className='lobby_container'>
      <h1>LOBBY</h1>
      <div className='lobby_content'>
        {!isAuthenticated && (
          <div
            className='overlay'
            onClick={() => {
              notification.error({
                message: 'Please log in first',
                duration: 3,
              })
            }}
          />
        )}
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12} xl={8}>
            <Row gutter={[10, 10]}>
              <Card1 />
              <CreateLeague
                button={
                  <Card2
                    cursor
                    isImage
                    text={{
                      text1: 'Create',
                      text2: 'Leagues',
                    }}
                  />
                }
              />
            </Row>
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <Row gutter={[10, 10]}>
              <Card2
                cursor
                flip
                onClick={() => navigate('/popular-league')}
                text={{
                  text1: 'Join',
                  text2: 'Leagues',
                }}
              />
              <Card3 />
            </Row>
          </Col>
          <Col xs={24} lg={24} xl={8}>
            <div className='left_column'>
              <Card2
                cursor
                flip
                onClick={() => navigate('/my-league')}
                text={{
                  text1: 'My Leagues',
                }}
              />
              <Card2
                alignCenter
                text={{
                  text1: 'GM Challenge',
                  text3:
                    'Rank yourself against your peers and be the ultimate best GM, rise the ranks and get your chance to GM a pro team!',
                }}
              />
              <Card2
                alignCenter
                proScoring
                flip
                text={{
                  text1: 'PRO SCORING',
                  text3: 'FOLLOW YOUR FAVORITE',
                  text4: 'PRO TEAM PERFORMANCE',
                }}
              />
            </div>
            {/* <Row gutter={[10, 10]}>
              <Card2
                cursor
                flip
                onClick={() => navigate('/my-league')}
                text={{
                  text1: 'My Leagues',
                }}
              />
              <Card2
                alignCenter
                text={{
                  text1: 'GM Challenge',
                  text3:
                    'Rank yourself against your peers and be the ultimate best GM, rise the ranks and get your chance to GM a pro team!',
                }}
              />
              <Card2
                alignCenter
                proScoring
                flip
                text={{
                  text1: 'PRO SCORING',
                  text3: 'FOLLOW YOUR FAVORITE',
                  text4: 'PRO TEAM PERFORMANCE',
                }}
              />
            </Row> */}
          </Col>
        </Row>
      </div>
    </div>
  )
}

const Card1 = ({ flip }) => {
  return (
    <div className={`card1 ${flip ? 'flip' : ''}`}>
      <div>
        <h1>SAM Legends</h1>
      </div>
    </div>
  )
}
const Card2 = ({ isImage, text, alignCenter, proScoring, cursor, onClick, flip }) => {
  return (
    <div
      className={`card2 ${flip ? 'flip' : ''}`}
      style={{ cursor: cursor ? 'pointer' : 'initial' }}
      onClick={onClick}
    >
      <div className='content'>
        {isImage && <img src={logo} />}
        <div>
          {text?.text1 && (
            <h1 style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text1}</h1>
          )}
          {text?.text2 && (
            <h2 style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text2}</h2>
          )}
          {text?.text3 && (
            <p style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text3}</p>
          )}
          {text?.text4 && (
            <p style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text4}</p>
          )}
        </div>
      </div>
    </div>
  )
}
const Card3 = ({ flip }) => {
  return (
    <div className={`card3 ${flip ? 'flip' : ''}`}>
      <div className='content'>
        <div>
          <img src={logo} />
          <h1>SFL</h1>
        </div>
        <h1>PRO</h1>
      </div>
    </div>
  )
}

export default Lobby
