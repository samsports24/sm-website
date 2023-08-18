import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import Twitter from '../assets/twitter.svg'

// Component
import Header from '../components/Header'
import WeekPagination from '../components/WeekPagination'

import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  PoachPlayer,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
  MakeOffer,
} from '../components/modal/PlayerInterfaceModals'
import GmCard from '../components/playerInterface/GmCard'
import DonoughtChart from '../components/Charts/ColumnChart'
// import PlayerStats from '../components/playerInterface/PlayerStats'
// import ContractInfo from '../components/playerInterface/ContractInfo'

const GmDashboard = () => {
  let infoData = [
    {
      title: 'All Time Record',
      value: '120',
    },
    {
      title: 'Current Team Record',
      value: `98`,
    },
    {
      title: 'All-Time Playoff Record',
      value: '58',
    },
    {
      title: 'Current Team Playoff Record',
      value: '28',
    },
    {
      title: <img src={Twitter} />,
      value: '@ashawnrobinson',
    },
  ]

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

        <MakeOffer />

        <span className='divider_bar'>|</span>

        <PoachPlayer />
      </section>

      <GmCard />
      <div className='info-card'>
        {infoData.map((item, index) => (
          <h3 key={index}>
            {item.title} : <span>{item.value}</span>
          </h3>
        ))}
      </div>
      <hr className='divider' />

      <section className='player_info_container'>
        <div className='player_info_card info_center'>
          <h2>Team Financials</h2>
        </div>
        <div className='player_info_card info_right'>
          <h2>Team Financials Projects Graph</h2>
          <DonoughtChart />
        </div>
      </section>
    </div>
  )
}

export default GmDashboard
