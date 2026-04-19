import { Row, Col, Table } from 'antd'
import PlayerImage from '../assets/player-img-3.png'
const PlayerDetails = () => {
  const dataSource = [
    {
      key: '1',
      season: '',
      team: '',
      league: '',
      gp: '',
      g: '',
      a: '',
      tp: '',
      pim: '',
      '+/-': '',
      post: '',
    },
  ]

  const columns = [
    {
      title: 'Season',
      dataIndex: 'season',
      key: 'season',
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'League',
      dataIndex: 'league',
      key: 'league',
    },
    {
      title: 'GP',
      dataIndex: 'gp',
      key: 'gp',
    },
    {
      title: 'G',
      dataIndex: 'G',
      key: 'G',
    },
    {
      title: 'A',
      dataIndex: 'a',
      key: 'a',
    },
    {
      title: 'TP',
      dataIndex: 'tp',
      key: 'tp',
    },
    {
      title: 'PIM',
      dataIndex: 'pim',
      key: 'pim',
    },
    {
      title: '+/-',
      dataIndex: '+/-',
      key: '+/-',
    },
    {
      title: 'Post',
      dataIndex: 'post',
      key: 'post',
    },
    {
      title: 'GP',
      dataIndex: 'GP',
      key: 'GP',
    },
    {
      title: 'G',
      dataIndex: 'G',
      key: 'G',
    },
    {
      title: 'A',
      dataIndex: 'a',
      key: 'a',
    },
    {
      title: 'TP',
      dataIndex: 'TP',
      key: 'TP',
    },
    {
      title: 'PIM',
      dataIndex: 'pim',
      key: 'pim',
    },
    {
      title: '+/-',
      dataIndex: '+/-',
      key: '+/-',
    },
  ]
  return (
    <>
      <div className='player-profile'>
        <Row>
          <Col xs={24} md={6} lg={10} xl={6}>
            <div className='player-pic'>
              <img src={PlayerImage} />
            </div>
          </Col>
          <Col xs={24} md={18} lg={14} xl={18}>
            <div className='player-details'>
              <Row gutter={[20, 0]}>
                <Col xs={24} md={24} lg={24}>
                  <div className='title'>
                    <h2>A{"'"}Shawn Robinson</h2>
                    <div className='active'>
                      <div className='active-btn' />
                      <p>Active Player</p>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Owner: <span className='bold'> Gridiron Seals (UFAFL)</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Position <span className='bold'> Gridiron Seals (UFAFL)</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Age: <span className='bold'> 28 (Mar 21, 1995)v</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Height:{' '}
                      <span className='bold'>
                        6{"'"}4{'"'}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Weight: <span className='bold'> 330 lbs</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Nationality: <span className='bold'> USA</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Hometown: <span className='bold'> Alabama</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8}>
                  <div className='player-info'>
                    <p>
                      Date Registered: <span className='bold'> Sep 10, 2021</span>
                    </p>
                  </div>
                </Col>
                {player?.bio && (
                <Col xs={24} md={24} lg={24}>
                  <div className='about-player'>
                    <p>{player.bio}</p>
                  </div>
                </Col>
                )}
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <h2 className='player_info_heading'>PLAYER INFO</h2>
      <div className='player-data'>
        <Table
          dataSource={dataSource}
          columns={columns}
          bordered={false}
          pagination={false}
          scroll={{ x: 'auto' }}
        />
      </div>
    </>
  )
}

export default PlayerDetails
