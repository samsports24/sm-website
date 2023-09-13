import React from 'react'

import settingIcon from '../../assets/setting-icon.svg'
import arrowIcon from '../../assets/arrow-full.svg'
import { GiHockey } from 'react-icons/gi'

// import { useNavigate } from 'react-router-dom'

const data = [
  {
    title: 'GRETZKY',
    players: [
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Assassins HC',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Battlehawks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Bentley Jacks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blades of Steel',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blizzard',
        Day: 0,
        Season: 0,
      },
    ],
  },
  {
    title: 'HOWE',
    players: [
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Assassins HC',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Battlehawks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Bentley Jacks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blades of Steel',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blizzard',
        Day: 0,
        Season: 0,
      },
    ],
  },
  {
    title: 'GRETZKY',
    players: [
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Assassins HC',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Battlehawks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Bentley Jacks',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blades of Steel',
        Day: 0,
        Season: 0,
      },
      {
        Rank: '1',
        HostedHeadshotNoBackgroundUrl: require('../../assets/hockey-team1.png'),
        Team: 'Blizzard',
        Day: 0,
        Season: 0,
      },
    ],
  },
]
const LeagueStandingsHockey = () => {
  // const navigate = useNavigate()

  return (
    <div className='league_standings_box'>
      <header>
        <h3>League Standings</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <img src={settingIcon} style={{ cursor: 'pointer' }} />
          <img src={arrowIcon} style={{ cursor: 'pointer' }} />
        </div>
      </header>
      <section className='league_standings_body'>
        <div className='header'>
          <div className='header_1'>
            <h2>Rk</h2>
          </div>
          <div className='header_2'>
            <h2>Team</h2>
          </div>
          <div className='header_3'>
            <h2>Day</h2>
          </div>
          <div className='header_4'>
            <h2>Season</h2>
          </div>
        </div>
        {data?.map((v, i) => {
          return (
            <div key={i} className='league_standings_card_box'>
              <div className='heading'>{v?.title}</div>
              {v?.players?.map((x, i) => {
                return (
                  <div key={i} className='row'>
                    <div className='row_1'>
                      <h2>{x?.Rank}.</h2>
                    </div>
                    <div className='row_2'>
                      <div>
                        {x?.HostedHeadshotNoBackgroundUrl ? (
                          <img src={x?.HostedHeadshotNoBackgroundUrl} />
                        ) : (
                          <GiHockey size={50} color={'#fff'} />
                        )}
                      </div>
                      <h2>{x?.Team || '-'}</h2>
                    </div>
                    <div className='row_3'>
                      <h2>{x?.Day || 0}</h2>
                    </div>
                    <div className='row_4'>
                      <h2>{x?.Season || 0}</h2>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default LeagueStandingsHockey
