import { Row, Col, Typography, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

import Circa from '../../assets/teams/circa_sports_trout.png'

import { playerInterfaceData } from '../../pages/mockData'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
  PoachPlayer,
} from '../../components/modal/PlayerInterfaceModals'

const GmCard = ({ isButton, bidWinningPage = false }) => {
  const navigate = useNavigate()

  return (
    <section className='player_info_box_new'>
      <Row gutter={[30, 20]}>
        {/* {isButton && (
          <Col xs={24}>
          </Col>
        )} */}
        <Col xs={24} xl={10}>
          <div className='left'>
            <div>
              <Typography.Title level={2}>{`A'Shawn Robinson`}</Typography.Title>
              <div className='player-active-status'>
                <div className='active'>
                  <div className='active_btn' />
                  <p>{playerInterfaceData?.status}</p>
                </div>
                <div className='injury-status'>
                  <p>Injury Status</p>
                  <h4>HEALTHY</h4>
                </div>
              </div>
            </div>
            <div className='box'>
              <p className='text1'>Position Rank:</p>
              <p className='text2'>#{playerInterfaceData?.positionRank}</p>
            </div>
            <div className='box'>
              <p className='text1'>League Rank:</p>
              <p className='text2'>#{playerInterfaceData?.leagueRank}</p>
            </div>
          </div>
        </Col>
        <Col xs={24} xl={10}>
          {isButton && (
            <Button type='primary' style={{ marginLeft: 'auto', display: 'flex' }}>
              AUCTION PLAYER
            </Button>
          )}

          <div className='player-news'>
            <Typography.Title level={3}>{`Player News`}</Typography.Title>
            <p>{playerInterfaceData?.playerNews}</p>
          </div>

          <div className='stats-bar'>
            <div className='player-news'>
              <p>Past Year Stats Bar</p>
              <div className='years'>
                <Typography.Title level={2}>2023</Typography.Title>
                <Typography.Title level={2}>2022</Typography.Title>
                <Typography.Title level={2}>2021</Typography.Title>
              </div>
            </div>
            <img src={Circa} height={'100px'} />
          </div>
        </Col>
        <Col xs={24} xl={4}>
          {bidWinningPage ? (
            <div className='action-bar'>
              <h4>Player Action Bar</h4>
              <Button
                type='primary'
                className='action-bar-btn'
                onClick={() => {
                  navigate('/team-trade')
                }}
              >
                make offer
              </Button>
              <PoachPlayer />
            </div>
          ) : (
            <div className='action-bar'>
              <h4>Player Action Bar</h4>
              <AuctionPlayer />
              <TradePlayer />
              <ReleasePlayer />
              <MoveToInjured />
              <ActivateFromPracticeSquad />
              <MoveToPracticeSquad />
            </div>
          )}
        </Col>
      </Row>
    </section>
  )
}

export default GmCard
