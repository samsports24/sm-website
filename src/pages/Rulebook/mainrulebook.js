import React from 'react'
import { Col, Row, notification } from 'antd'
import logo from '../../assets/sam-football.png'
import { useNavigate } from 'react-router-dom'
import CreateLeague from '../../components/modal/CreateLeague'
import gmrating from '../../assets/gm ratings.webp'
import sfleague from '../../assets/sflogo.webp'
import sammetricbreakdown from '../../assets/thesammetric.webp'
import payscalelogo from '../../assets/payscalesamlogo.png'

const MainRuleBook = () => {
  // const isAuthenticated = localStorage.getItem('token')
  const navigate = useNavigate()

  return (
    <div className='rulebook_container'>
      <h1>RULEBOOK</h1>
      {/* <div className='rulebook_content'>
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
                    isImage={gmrating}
                    onClick={() => navigate('/rule-book/gm-rating')}
                    text={{
                      text1: 'GM',
                      text2: 'RATINGS',
                      text4: 'INFO',
                    }}
                    paddingBlock={'70px'}
                    width={'30%'}
                  />
                }
              />
            </Row>
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <Row gutter={[10, 10]}>
             
              <Card3 />
            </Row>
          </Col>
          <Col xs={24} lg={24} xl={8}>
            <div className='rulebook_left_column'>
              <Card2
                cursor
                flip
                onClick={() => navigate('/rule-book/reward-info')}
                text={{
                  text1: 'REWARDS',
                  text3: 'INFO & BREAKDOWN',
                }}
              />
              <Card2
                alignCenter
                onClick={() => navigate('/rule-book/sampoints-breakdown')}
                isImage={payscalelogo}
                text={{
                  text1: 'SAM POINTS',
                  text3: 'INFO & BREAKDOWN',
                }}
              />
              <Card2
                alignCenter
                proScoring
                flip
                onClick={() => navigate('/rule-book/regularseason-and-playoff')}
                text={{
                  text1: 'REGULAR SEASON &',
                  text2: 'PLAYOFFS',
                  text4: 'INFO & BREAKDOWN',
                }}
              />
            </div>
            
          </Col>
        </Row>
      </div> */}
<div className='rulebook_content'>
  <Row gutter={[20, 20]}>
    <Col xs={24} lg={12} xl={8}>
      <Row gutter={[10, 10]}>
        <Card1 />
        <CreateLeague
          button={
            <Card2
              cursor
              isImage={gmrating}
              onClick={() => navigate('/rule-book/gm-rating')}
              text={{
                text1: 'GM',
                text2: 'RATINGS',
                text4: 'INFO',
              }}
              paddingBlock={'70px'}
              width={'30%'}
            />
          }
        />
      </Row>
    </Col>
    <Col xs={24} lg={12} xl={8}>
      <Row gutter={[10, 10]}>
        <Card3 />
      </Row>
    </Col>
    <Col xs={24} lg={24} xl={8}>
      <div className='rulebook_left_column'>
        <Card2
          cursor
          flip
          onClick={() => navigate('/rule-book/reward-info')}
          text={{
            text1: 'REWARDS',
            text3: 'INFO & BREAKDOWN',
          }}
        />
        <Card2
          alignCenter
          onClick={() => navigate('/rule-book/sampoints-breakdown')}
          isImage={payscalelogo}
          text={{
            text1: 'SAM POINTS',
            text3: 'INFO & BREAKDOWN',
          }}
        />
        <Card2
          alignCenter
          proScoring
          flip
          onClick={() => navigate('/rule-book/regularseason-and-playoff')}
          text={{
            text1: 'REGULAR SEASON &',
            text2: 'PLAYOFFS',
            text4: 'INFO & BREAKDOWN',
          }}
        />
      </div>
    </Col>
  </Row>
</div>


    </div>
  )
}

const Card1 = ({ flip }) => {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/rule-book/sammetric')}
      className={`rulebook_card1 ${flip ? 'rulebook_flip' : ''}`}
    >
      <div>
        <img src={sammetricbreakdown}></img>
        <h1>
          The
          <br></br>
          SAMMETRIC
          <p>SCORING BREAKDOWN</p>
        </h1>
      </div>
    </div>
  )
}
const Card2 = ({ isImage, text, alignCenter, cursor, onClick, flip, paddingBlock, width }) => {
  return (
    <div
      className={`rulebook_card2 ${flip ? 'rulebook_flip' : ''}`}
      style={{
        cursor: cursor ? 'pointer' : 'initial',
        paddingBlock: paddingBlock ? paddingBlock : '30px',
      }}
      onClick={onClick}
    >
      <div className='content'>
        {/* {isImage && <img style={{  width: '30%' }} src={isImage} />} */}
        {isImage && <img style={{ width: width || '20%' }} src={isImage} alt='Card Image' />}
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
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/rule-book/roasterinfo')}
      className={`rulebook_card3 ${flip ? 'rulebook_flip' : ''}`}
    >
      <div className='content'>
        <div>
          <img src={sfleague} />
          <h1>
            ROASTER
            <br />
            <p>INFO</p>
          </h1>
        </div>
      </div>
    </div>
  )
}

export default MainRuleBook
