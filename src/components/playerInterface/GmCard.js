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
  playerData: data,
  activePlayers,
  practicePlayers,
  getData,
  news,
  isAction = true,
  // isViewer,
}) => {
  // const {
  //   // team,
  //   Name,
  //   Active,
  //   InjuryStatus,
  //   PositionRank,
  //   LeagueRank,
  //   inPracticeSquad,
  //   PlayerID,
  //   HostedHeadshotNoBackgroundUrl,
  //   isPlayerLocked,
  // } = playerData
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
              <Typography.Title level={2}>{data?.Name}</Typography.Title>
              <div className='player-active-status'>
                <div className='active'>
                  <div className={data?.Active ? `active_btn` : 'in-active_btn'} />
                  <p>{data?.Active ? 'Active Player' : 'In-active Player'}</p>
                </div>
                <div className='injury-status'>
                  <p>Injury Status</p>
                  <h4
                    style={{
                      color:
                        data?.InjuryStatus?.toLowerCase() == 'out' ? 'red !important' : '#00c008',
                    }}
                    className={`${
                      data?.InjuryStatus?.toLowerCase() == 'out' ? 'redColor' : 'greenColor'
                    }`}
                  >
                    {data?.InjuryStatus || '-'}
                  </h4>
                </div>
              </div>
            </div>
            <div className='box'>
              <p className='text1'>Position Rank:</p>
              <p className='text2'>#{data?.PositionRank > 0 ? data?.PositionRank : 0}</p>
            </div>
            <div className='box'>
              <p className='text1'>League Rank:</p>
              <p className='text2'>#{data?.LeagueRank > 0 ? data?.LeagueRank : 0}</p>
            </div>
            <div className='roster_player_image'>
              <img src={data?.HostedHeadshotNoBackgroundUrl} />
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
            {data?.team?.logo && <img src={data?.team?.logo} height={'100px'} />}
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
                  playerIds={{ PlayerID: data?.PlayerID, player_id: data?._id }}
                  disabled={true || data?.isPlayerLocked}
                />

                <TradePlayer disabled={data?.isPlayerLocked} />
                <ReleasePlayer disabled={data?.isPlayerLocked} />

                <MoveToInjured
                  disabled={data?.InjuryStatus?.toLowerCase() != 'out' || data?.isPlayerLocked}
                  getData={getData}
                />

                <ActivateFromPracticeSquad
                  activePlayers={activePlayers}
                  disabled={!data?.inPracticeSquad || data?.isPlayerLocked}
                  getData={getData}
                  playerId={data?.PlayerID}
                />

                <MoveToPracticeSquad
                  activePlayersCount={activePlayers?.length}
                  practicePlayers={practicePlayers}
                  disabled={data?.inPracticeSquad || data?.isPlayerLocked}
                  getData={getData}
                  playerId={data?.PlayerID}
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
