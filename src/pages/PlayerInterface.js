import React from 'react'

import { Button, Breadcrumb, Row, Col } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'

import PlayerImage from '../assets/player-img-3.png'
import Circa from '../assets/teams/circa_sports_trout.png'

import { proLeagueStandingsData, playerInterfaceData } from './mockData'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  PoachPlayer,
  ReleasePlayer,
} from '../components/modal/PlayerInterfaceModals'

const PlayerInterface = () => {
  return (
    <div className='player_interface_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <section className='buttons_and_pagination'>
        <div className='buttons_group'>
          <Button type='primary'>Home</Button>
          <Button type='primary'>Team</Button>
          <Button type='primary'>Players</Button>
          <Button type='primary'>League</Button>
        </div>
        <WeekPagination />
      </section>

      <hr className='divider' />

      {/* MODALS */}
      <section className='filter_box'>
        <AuctionPlayer />

        <span className='divider_bar'>|</span>

        <div className='filter_box_text'>
          <h2>trade player</h2>
        </div>

        <span className='divider_bar'>|</span>

        <ReleasePlayer />

        <span className='divider_bar'>|</span>

        <MoveToInjured />

        <span className='divider_bar'>|</span>

        <ActivateFromPracticeSquad />

        <span className='divider_bar'>|</span>

        <div className='filter_box_text'>
          <h2>move to practice squad</h2>
        </div>

        <span className='divider_bar'>|</span>

        <div className='filter_box_text'>
          <h2>make offer</h2>
        </div>

        <span className='divider_bar'>|</span>

        <PoachPlayer />
      </section>

      <section className='player_details_box'>
        <Row gutter={[40, 40]}>
          <Col xs={24} md={24} lg={10} xl={7}>
            <div className='player-pic'>
              <img src={PlayerImage} />
              <div className='small_pic'>
                <img src={Circa} />
              </div>
            </div>
          </Col>
          <Col xs={24} md={24} lg={14} xl={17}>
            <div className='player-details'>
              <Row gutter={[20, 0]}>
                <Col xs={24} md={24} lg={24}>
                  <div className='title'>
                    <h2>{playerInterfaceData?.name}</h2>
                    <div className='active'>
                      <div className='active-btn' />
                      <p>{playerInterfaceData?.status}</p>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xxl={8}>
                  <div className='player-info'>
                    <p>
                      Position: <span className='bold'> {playerInterfaceData?.position}</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xxl={8}>
                  <div className='player-info'>
                    <p>
                      Year in League{' '}
                      <span className='bold'>{playerInterfaceData?.yearInLeague}</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xxl={8}>
                  <div className='player-info'>
                    <p>
                      Age: <span className='bold'> {playerInterfaceData?.age}</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xxl={8}>
                  <div className='player-info'>
                    <p>
                      Height: <span className='bold'>{playerInterfaceData?.height}&quot;</span>
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={12} xxl={8}>
                  <div className='player-info'>
                    <p>
                      Player College:{' '}
                      <span className='bold'> {playerInterfaceData?.playerCollege}</span>
                    </p>
                  </div>
                </Col>
                <Col
                  xs={24}
                  md={24}
                  lg={24}
                  xl={24}
                  style={{
                    borderTop: '1px solid var(--borderColor)',
                    marginTop: '38px',
                  }}
                >
                  <Row gutter={[20, 0]}>
                    <Col xs={24} md={12} lg={12} xl={8}>
                      <div className='player-info' style={{ marginTop: '38px' }}>
                        <p>
                          Past Year Stats Bar: <br />{' '}
                          <span className='bold'> {playerInterfaceData?.pastYearStats}</span>
                        </p>
                      </div>
                    </Col>
                    <Col xs={24} md={12} lg={12} xl={8}>
                      <div className='player-info position_league_rank'>
                        <p>
                          Position Rank: <br />{' '}
                          <span className='bold'> #{playerInterfaceData?.positionRank}</span>
                        </p>
                      </div>
                    </Col>
                    <Col xs={24} md={12} lg={12} xl={8}>
                      <div className='player-info position_league_rank'>
                        <p>
                          League Rank: <br />{' '}
                          <span className='bold'> #{playerInterfaceData?.leagueRank}</span>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </section>

      <section className='player_info_container'>
        <Row gutter={[40, 40]}>
          <Col sm={24} md={24} xl={7} xxl={7}>
            <div className='player_info_card info_left'>
              <h2>Player News</h2>
              <p>{playerInterfaceData?.playerNews}</p>
            </div>
          </Col>
          <Col sm={24} md={24} xl={10} xxl={10}>
            <div className='player_info_card info_center'>
              <h2>Player Past & Projected Stats & Scores</h2>
              <div style={{ marginTop: '-12px' }}>
                {proLeagueStandingsData?.slice(0, 5)?.map((v, i) => {
                  return (
                    <div key={i} className='content'>
                      <div>
                        <p className='text1'>W‑L‑T</p>
                        <p className='text2'>{v?.wlt}</p>
                      </div>
                      <div>
                        <p className='text1'>AVG PF</p>
                        <p className='text2'>{v?.avgPf}</p>
                      </div>
                      <div>
                        <p className='text1'>AVG PA</p>
                        <p className='text2'>{v?.avgPa}</p>
                      </div>
                      <div>
                        <p className='text1'>DIV W‑L‑T</p>
                        <p className='text2'>{v?.divWlt}</p>
                      </div>
                      <div>
                        <p className='text1'>DIV W‑L‑T</p>
                        <p className='text2'>{v?.divWlt2}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Col>
          <Col sm={24} md={24} xl={7} xxl={7}>
            <div className='player_info_card info_right'>
              <h2>Player Contract Info</h2>
              <p>{playerInterfaceData?.playerContractInfo}</p>
            </div>
          </Col>
        </Row>
      </section>
    </div>
  )
}

export default PlayerInterface
