
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
          <Col xs={24} md={6} lg={8}>
            <div className='player-pic'>
              <img src={PlayerImage} />
            </div>
          </Col>
          <Col xs={24} md={18} lg={16}>
            <div className='player-details'>
              <Row gutter={[20, 0]}>
                <Col xs={24} md={12} lg={24}>
                  <div className='title'>
                    <h2>A{"'"}Shawn Robinson</h2>
                    <div className='active'>
                      <div className='active-btn' />
                      <p>Active Player</p>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Owner: <span className='bold'> Gridiron Seals (UFAFL)</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Position <span className='bold'> Gridiron Seals (UFAFL)</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Age: <span className='bold'> 28 (Mar 21, 1995)v</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Height:{' '}
                      <span className='bold'>
                        6{"'"}4{'"'}
                      </span>
                    </p>
                  </div>
                </Col>

                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Weight: <span className='bold'> 330 lbs</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Nationality: <span className='bold'> USA</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Hometown: <span className='bold'> Alabama</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <div className='player-info'>
                    <p>
                      Date Registered: <span className='bold'> Sep 10, 2021</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={24} lg={24}>
                  <div className='about-player'>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                      eu fugiat nulla pariatur.{' '}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <div className='player-data'>
        <Table dataSource={dataSource} columns={columns} bordered={false} pagination={false} />;
      </div>
    </>
  )
}

export default PlayerDetails
