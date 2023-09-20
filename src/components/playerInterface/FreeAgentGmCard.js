import { Row, Col, Typography, Button } from 'antd'
// import { AuctionPlayer } from '../../components/modal/PlayerInterfaceModals'

const GmCard = ({ playerData, news }) => {
  const { team, Name, Active, InjuryStatus, PositionRank, LeagueRank } = playerData

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
              <Typography.Title level={2}>{Name}</Typography.Title>
              <div className='player-active-status'>
                <div className='active'>
                  <div className={Active ? `active_btn` : 'in-active_btn'} />
                  <p>{Active ? 'Active Player' : 'In-active Player'}</p>
                </div>
                <div className='injury-status'>
                  <p>Injury Status</p>
                  <h4>{InjuryStatus || '-'}</h4>
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
          </div>
        </Col>
        <Col xs={24} xl={14}>
          <Button type='primary' style={{ marginTop: '25px', marginLeft: 'auto', display: 'flex' }}>
            AUCTION PLAYER
          </Button>
          <div className='player-news'>
            <Typography.Title level={3}>{`Player News`}</Typography.Title>
            <p>{news}</p>
            {/* <p>{playerInterfaceData?.playerNews}</p> */}
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
            {team != null && team?.logo && <img src={team?.logo} height={'100px'} />}
          </div>
        </Col>
        {/* <Col xs={24} xl={4}>
          <div className='action-bar'>
            <h4>Player Action Bar</h4>
            <AuctionPlayer />
          </div>
        </Col> */}
      </Row>
    </section>
  )
}

export default GmCard
