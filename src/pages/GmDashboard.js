import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import Twitter from '../assets/twitter.svg'
import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'

import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  PoachPlayer,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
} from '../components/modal/PlayerInterfaceModals'
import GmCard from '../components/playerInterface/GmCard'
import DonoughtChart from '../components/Charts/ColumnChart'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
// import PlayerStats from '../components/playerInterface/PlayerStats'
// import ContractInfo from '../components/playerInterface/ContractInfo'

const GmDashboard = () => {
  const navigate = useNavigate()

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
      {/* BREADCRUMB */}
      <section className='_breadcrumb'>
        <Button className='_back_button' type='primary'>
          Back
        </Button>
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

      <ButtonsAndPagination />

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
