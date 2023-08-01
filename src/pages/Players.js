import { Row, Col } from 'antd'

// Images
import Trout from '../assets/trout-square-1.png'
import UFAFL from '../assets/leagueid-a.png'
import Image1 from '../assets/unnamed.png'

// Component
import PlayerCard from '../components/cards/PlayerCard'

// Mock Data
import { playerData } from './mockData'

const Players = () => {
  return (
    <div className='player-container'>
      <div className='banner'>
        <div className='flex'>
          <div className='left-banner'>
            <div className='banner-image'>
              <img src={Trout} />
            </div>
            <div className='text'>
              <h3>Madden</h3>
              <p>East</p>
              <h2>Circa Sports Trout</h2>
              <p>
                Based in Las Vegas NVTwitter:
                <span className='bold' style={{ marginBottom: '11px' }}>
                  {' '}
                  @CircaTrout
                </span>
              </p>
              <p>
                Team Owner: <span className='bold'> Circa Sports Trout </span>
              </p>
            </div>
          </div>
          <div className='right-banner'>
            <div className='image'>
              <img src={UFAFL} />
            </div>
            <div className='large-image'>
              <img src={Image1} />
            </div>
          </div>
        </div>
      </div>

      <div className='frame'>
        <div className='title'>
          <h2>Roster</h2>
        </div>
        <div className='player-div'>
          <div className='tag-line'>
            <p>Player</p>
          </div>
          <Row gutter={[30, 30]}>
            {playerData?.map((data, i) => (
              <Col xs={24} md={12} lg={12} xl={6} key={i}>
                <PlayerCard data={data} />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Players
