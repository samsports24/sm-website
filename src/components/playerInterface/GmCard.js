import { Row, Col, Typography, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { isLocked } from '../../config/constants'

// import { playerInterfaceData } from '../../pages/mockData'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
  PoachPlayer,
} from '../../components/modal/PlayerInterfaceModals'

const GmCard = ({
  isButton,
  bidWinningPage = false,
  playerData,
  activePlayers,
  practicePlayers,
  getData,
  news,
  isAction = true,
}) => {
  const {
    team,
    Name,
    Active,
    InjuryStatus,
    PositionRank,
    LeagueRank,
    inPracticeSquad,
    PlayerID,
    HostedHeadshotNoBackgroundUrl,
    isPlayerLocked,
  } = playerData
  const navigate = useNavigate()

  return (
    <section className='player_info_box_new'>
      <Row gutter={[30, 20]}>
        <Col xs={24} xl={10}>
          <div
            className='left'
            style={{
              // background: `url(${HostedHeadshotNoBackgroundUrl})`,
              position: 'relative',
            }}
          >
            <div>
              <Typography.Title level={2}>{Name}</Typography.Title>
              <div className='player-active-status'>
                <div className='active'>
                  <div className={Active ? `active_btn` : 'in-active_btn'} />
                  <p>{Active ? 'Active Player' : 'In-active Player'}</p>
                </div>
                <div className='injury-status'>
                  <p>Injury Status</p>
                  <h4
                    style={{
                      color: InjuryStatus?.toLowerCase() == 'out' ? 'red !important' : '#00c008',
                    }}
                    className={`${
                      InjuryStatus?.toLowerCase() == 'out' ? 'redColor' : 'greenColor'
                    }`}
                  >
                    {InjuryStatus || '-'}
                  </h4>
                </div>
              </div>
            </div>
            <div className='box'>
              <p className='text1'>Position Rank:</p>
              <p className='text2'>#{PositionRank > 0 ? PositionRank : 0}</p>
            </div>
            <div className='box'>
              <p className='text1'>League Rank:</p>
              <p className='text2'>#{LeagueRank > 0 ? LeagueRank : 0}</p>
            </div>
            <div className='roster_player_image'>
              <img src={HostedHeadshotNoBackgroundUrl} />
            </div>
          </div>
        </Col>
        <Col xs={24} xl={isAction ? 10 : 14}>
          {isButton && (
            <Button type='primary' style={{ marginLeft: 'auto', display: 'flex' }}>
              AUCTION PLAYER
            </Button>
          )}

          <div className='player-news '>
            <Typography.Title level={3}>{`Player News`}</Typography.Title>
            <div className='player_news_scroll'>
              <p>{news}</p>
            </div>
          </div>

          <div className='stats-bar'>
            <div className='player-news' style={{ marginTop: '0px' }}>
              <p>Past Year Stats Bar</p>
              <div className='years'>
                <Typography.Title level={2}>2023</Typography.Title>
                <Typography.Title level={2}>2022</Typography.Title>
                <Typography.Title level={2}>2021</Typography.Title>
              </div>
            </div>
            {team?.logo && <img src={team?.logo} height={'100px'} />}
          </div>
        </Col>
        {isAction && (
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
            ) : isLocked() ? (
              <></>
            ) : (
              <div className='action-bar'>
                <h4>Player Action Bar</h4>
                <AuctionPlayer
                  playerIds={{ PlayerID, player_id: playerData?._id }}
                  disabled={true || isPlayerLocked}
                />

                <TradePlayer disabled={isPlayerLocked} />
                <ReleasePlayer disabled={isPlayerLocked} />

                <MoveToInjured
                  disabled={InjuryStatus?.toLowerCase() != 'out' || isPlayerLocked}
                  getData={getData}
                />

                <ActivateFromPracticeSquad
                  activePlayers={activePlayers}
                  disabled={!inPracticeSquad || isPlayerLocked}
                  getData={getData}
                  playerId={PlayerID}
                />

                <MoveToPracticeSquad
                  activePlayersCount={activePlayers?.length}
                  practicePlayers={practicePlayers}
                  disabled={inPracticeSquad || isPlayerLocked}
                  getData={getData}
                  playerId={PlayerID}
                />
              </div>
            )}
          </Col>
        )}
      </Row>
    </section>
  )
}

export default GmCard
