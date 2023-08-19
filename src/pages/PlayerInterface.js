import React from 'react'

import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'

import PlayerImage from '../assets/TroutSquare.png'
import Circa from '../assets/teams/circa_sports_trout.png'

import { proLeagueStandingsData, playerInterfaceData } from './mockData'
import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  PoachPlayer,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
} from '../components/modal/PlayerInterfaceModals'

const PlayerInterface = () => {
  const navigate = useNavigate()

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

        <TradePlayer />

        <span className='divider_bar'>|</span>

        <ReleasePlayer />

        <span className='divider_bar'>|</span>

        <MoveToInjured />

        <span className='divider_bar'>|</span>

        <ActivateFromPracticeSquad />

        <span className='divider_bar'>|</span>

        <MoveToPracticeSquad />

        <span className='divider_bar'>|</span>

        <h2
          onClick={() => {
            navigate('/team-trade')
          }}
          className='modal_button_text'
        >
          MAKE OFFER
        </h2>

        <span className='divider_bar'>|</span>

        <PoachPlayer />
      </section>

      <section className='player_info_box'>
        <div className='player_info_left'>
          <div className='profile_picture_box'>
            <img src={PlayerImage} />
          </div>
          <div className='small_pic'>
            <img src={Circa} />
          </div>
        </div>
        <div className='player_info_right'>
          <div className='player_info_header'>
            <h1>{playerInterfaceData?.name}</h1>
            <div className='active'>
              <div className='active_btn' />
              <p>{playerInterfaceData?.status}</p>
            </div>
          </div>
          <div className='player_info_content'>
            <div className='box'>
              <p className='text1'>
                Position: <span className='text2'>{playerInterfaceData?.position}</span>
              </p>
            </div>
            <div className='box'>
              <p className='text1'>
                Year in League: <span className='text2'>{playerInterfaceData?.yearInLeague}</span>
              </p>
            </div>
            <div className='box'>
              <p className='text1'>
                Age: <span className='text2'>{playerInterfaceData?.age}</span>
              </p>
            </div>
            <div className='box'>
              <p className='text1'>
                Height: <span className='text2'>{playerInterfaceData?.height}&quot;</span>
              </p>
            </div>
            <div className='box'>
              <p className='text1'>
                Player College: <span className='text2'>{playerInterfaceData?.playerCollege}</span>
              </p>
            </div>
          </div>
          <div className='player_info_content' style={{ paddingBottom: '0px' }}>
            <div className='box'>
              <p className='text1'>Past Year Stats Bar:</p>
              <p className='text2'>{playerInterfaceData?.pastYearStats}</p>
            </div>
            <div className='box'>
              <p className='text1'>Position Rank:</p>
              <p className='text2'>{playerInterfaceData?.positionRank}</p>
            </div>
            <div className='box'>
              <p className='text1'>League Rank:</p>
              <p className='text2'>{playerInterfaceData?.leagueRank}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='player_info_container'>
        <div className='player_info_card info_left'>
          <h2>Player News</h2>
          <p>{playerInterfaceData?.playerNews}</p>
        </div>
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
        <div className='player_info_card info_right'>
          <h2>Player Contract Info</h2>
          <p>{playerInterfaceData?.playerContractInfo}</p>
        </div>
      </section>
    </div>
  )
}

export default PlayerInterface
