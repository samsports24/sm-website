import { Row, Col, Typography, Button } from 'antd'
import Circa from '../../assets/teams/circa_sports_trout.png'

import { playerInterfaceData } from '../../pages/mockData'

const GmCard = ({ isButton }) => {
  return (
    <section className='player_info_box_new'>
      <Row align={'middle'} gutter={[30, 20]}>
        {/* {isButton && (
          <Col xs={24}>
          </Col>
        )} */}
        <Col xs={24} xl={10}>
          <div className='left'>
            <div>
              <Typography.Title level={2}>{`A'Shawn Robinson`}</Typography.Title>
              <div className='active'>
                <div className='active_btn' />
                <p>{playerInterfaceData?.status}</p>
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
        <Col xs={24} xl={14}>
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
      </Row>
    </section>
  )
}

export default GmCard
