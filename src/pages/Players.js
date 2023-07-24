import Layout from '../layout/Layout'
import { Row, Col } from 'antd'
import Trout from '../assets/trout-square-1.png'
import UFAFL from '../assets/leagueid-a.png'
import PlayerCard from '../components/cards/PlayerCard'

import Player1 from '../assets/player-img-1.png'
import Player2 from '../assets/player-img-2.png'
import Player3 from '../assets/player-img-3.png'
import Player4 from '../assets/player-img-4.png'
import Player5 from '../assets/player-img-5.png'
import Player6 from '../assets/player-img-6.png'
import Player7 from '../assets/player-img-7.png'
import Player8 from '../assets/player-img-8.png'
import Image1 from '../assets/unnamed.png'

const Players = () => {
  const PlayerData = [
    {
      Image: Player1,
      playerName: 'Chase Daniel (QB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player2,
      playerName: 'Justin Herbert (QB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player3,
      playerName: 'Najee Harris (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player4,
      playerName: 'Rhamondre Stevenson (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player5,
      playerName: 'Damien Harris (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player6,
      playerName: 'Dare Ogunbowale (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player7,
      playerName: 'Rachaad White (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player8,
      playerName: 'Breece Hall (RB)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player1,
      playerName: 'Jaylen Waddle (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player2,
      playerName: 'Rondale Moore (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player3,
      playerName: 'DeVonta Smith (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player4,
      playerName: 'Tutu Atwell (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player5,
      playerName: 'Amon-Ra St. Brown (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player6,
      playerName: 'Allen Robinson II (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player7,
      playerName: 'Rashard Higgins (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player8,
      playerName: 'Garrett Wilson (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player1,
      playerName: 'Jaylen Waddle (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player2,
      playerName: 'Rondale Moore (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player3,
      playerName: 'DeVonta Smith (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
    {
      Image: Player4,
      playerName: 'Tutu Atwell (WR)',
      Owner: 'Circa Trout',
      Positon: 'Linebacker',
      Age: '31 years',
      Date: 'Sep 10, 2021',
    },
  ]
  return (
    <Layout>
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
              {PlayerData.map((data, i) => (
                <Col xs={24} md={12} lg={6} key={i}>
                  <PlayerCard
                    Image={data.Image}
                    PlayerName={data.playerName}
                    Owner={data.Owner}
                    Positon={data.Positon}
                    Age={data.Age}
                    Date={data.Date}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </div>
        {/* <div className='bottom-div'>
                    <p>© Sam Sports, Inc. All rights reserved.</p>
                </div> */}
      </div>
    </Layout>
  )
}

export default Players
