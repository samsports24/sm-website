import React from 'react'
import { Typography } from 'antd'

import Carousel from 'react-multi-carousel'

import NewPopularLeagueCard from '../../components/NewPopularLeagueCard'

const PopularLeagueSection = () => {
  const responsive = {
    largeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1200, min: 1000 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1000, min: 600 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  }

  const data = [
    {
      leagueName: 'Elite',
      imageUrl: require('../../assets/trout-square-1.png'),
      draftStarts: new Date('2024-03-24').toISOString(),
      totalPlayers: 30,
      leagueType: 'Private',
      leagueLevel: 2,
      entryFee: 'SAMS 3500',
      prizePollWallet: '0Edftrfdx12e34e5er6ff6tt6t',
    },
    {
      leagueName: 'Premier',
      imageUrl: require('../../assets/trout-square-1.png'),
      draftStarts: new Date('2024-03-24').toISOString(),
      totalPlayers: 25,
      leagueType: 'Public',
      leagueLevel: 3,
      entryFee: '0',
      prizePollWallet: 'None',
    },
    {
      leagueName: 'Angels',
      imageUrl: require('../../assets/beast-square-2.png'),
      draftStarts: new Date('2024-03-24').toISOString(),
      totalPlayers: 29,
      leagueType: 'Private',
      leagueLevel: 1,
      entryFee: 'SAMS 6500',
      prizePollWallet: '0Edftrfdx12e34e5er6ff6tt6t',
    },
    {
      leagueName: 'Warriors',
      imageUrl: require('../../assets/ufafl-02-png-369-trans-0.png'),
      draftStarts: new Date('2024-03-24').toISOString(),
      totalPlayers: 30,
      leagueType: 'Private',
      leagueLevel: 2,
      entryFee: 'SAMS 6500',
      prizePollWallet: '0Edftrfdx12e34e5er6ff6tt6t',
    },
  ]

  return (
    <div className='popular_league paddingInline'>
      <Typography.Title level={3}>Popular League</Typography.Title>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false}
        responsive={responsive}
        arrows={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
      >
        {data?.map((v, i) => {
          return <NewPopularLeagueCard key={i} data={v} />
        })}
      </Carousel>
    </div>
  )
}

export default PopularLeagueSection
